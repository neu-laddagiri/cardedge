import type {
  ActionType,
  Player,
  PlayerStatus,
  PokerAction,
  PokerGameState,
  Street,
} from "./pokerTypes";
import { sanitizeAmount } from "./validation";
import { formatCurrency } from "../money";

export interface PokerEngineState {
  players: Player[];
  heroId: string | null;
  pot: number;
  currentBet: number;
  amountToCall: number;
  actingPlayerId: string | null;
  actedPlayerIds: string[];
  handComplete: boolean;
  street: Street;
  actions: PokerAction[];
}

export interface ApplyActionInput {
  id: string;
  playerId: string;
  type: ActionType;
  amount?: number;
  timestamp?: number;
  recommendationAtAction?: import("./pokerTypes").PokerRecommendationAction;
}

export type EngineResult =
  | { ok: true; state: PokerEngineState }
  | { ok: false; error: string };

function heroCallAmount(
  players: Player[],
  heroId: string | null,
  currentBet: number
): number {
  const hero = players.find((player) => player.id === heroId);
  if (!hero || hero.status === "folded") return 0;
  return Math.max(0, Math.min(hero.stack, currentBet - hero.streetCommitment));
}

export function applyPokerAction(
  state: PokerEngineState,
  input: ApplyActionInput
): EngineResult {
  const player = state.players.find((candidate) => candidate.id === input.playerId);
  if (!player) return { ok: false, error: "Select a player who is still at the table." };
  if (player.status === "folded") return { ok: false, error: `${player.name} has already folded.` };
  if (player.status === "all-in") return { ok: false, error: `${player.name} is already all-in.` };
  if (state.handComplete) return { ok: false, error: "This hand is complete. Start a new hand to continue." };
  if (state.actingPlayerId && state.actingPlayerId !== player.id) {
    const actor = state.players.find((candidate) => candidate.id === state.actingPlayerId);
    return { ok: false, error: `It is ${actor?.name ?? "another player"}'s turn to act.` };
  }

  const callAmount = Math.max(0, state.currentBet - player.streetCommitment);
  let contribution = 0;
  let status: PlayerStatus = player.status;
  let nextCurrentBet = state.currentBet;

  switch (input.type) {
    case "fold":
      status = "folded";
      break;
    case "check":
      if (callAmount > 0) {
        return { ok: false, error: `${player.name} must call ${formatCurrency(callAmount)} or fold.` };
      }
      break;
    case "call":
      if (callAmount <= 0) return { ok: false, error: "There is no bet to call." };
      contribution = Math.min(player.stack, callAmount);
      if (contribution === player.stack) status = "all-in";
      break;
    case "bet": {
      if (state.currentBet > 0) return { ok: false, error: "Use raise when a bet already exists." };
      contribution = sanitizeAmount(input.amount ?? 0, player.stack);
      if (contribution <= 0) return { ok: false, error: "Enter a positive bet amount." };
      nextCurrentBet = player.streetCommitment + contribution;
      if (contribution === player.stack) status = "all-in";
      break;
    }
    case "raise": {
      if (state.currentBet <= 0) return { ok: false, error: "Use bet to open the action." };
      contribution = sanitizeAmount(input.amount ?? 0, player.stack);
      if (contribution <= callAmount) {
        return { ok: false, error: `A raise must add more than the ${formatCurrency(callAmount)} call.` };
      }
      nextCurrentBet = player.streetCommitment + contribution;
      if (contribution === player.stack) status = "all-in";
      break;
    }
    case "all-in":
      if (player.stack <= 0) return { ok: false, error: `${player.name} has no money remaining.` };
      contribution = player.stack;
      status = "all-in";
      nextCurrentBet = Math.max(nextCurrentBet, player.streetCommitment + contribution);
      break;
  }

  const players = state.players.map((candidate) =>
    candidate.id === player.id
      ? {
          ...candidate,
          status,
          stack: candidate.stack - contribution,
          streetCommitment: candidate.streetCommitment + contribution,
          totalCommitted: candidate.totalCommitted + contribution,
        }
      : candidate
  );
  const pot = state.pot + contribution;
  const amountToCall = heroCallAmount(players, state.heroId, nextCurrentBet);
  const action: PokerAction = {
    id: input.id,
    playerId: input.playerId,
    type: input.type,
    amount: contribution || undefined,
    street: state.street,
    timestamp: input.timestamp ?? Date.now(),
    potAfter: pot,
    amountToCallAfter: amountToCall,
    recommendationAtAction: input.recommendationAtAction,
  };

  const aggressive = input.type === "bet" || input.type === "raise";
  const actedPlayerIds = aggressive
    ? [player.id]
    : [...new Set([...state.actedPlayerIds, player.id])];
  const contenders = players.filter((candidate) => candidate.status !== "folded");
  const actionable = contenders.filter((candidate) => candidate.status === "active" && candidate.stack > 0);
  const settled = actionable.every((candidate) => candidate.streetCommitment === nextCurrentBet);
  const roundComplete = settled && actionable.every((candidate) => actedPlayerIds.includes(candidate.id));
  const handComplete = contenders.length <= 1 || (state.street === "river" && roundComplete);
  const nextStreet = roundComplete && !handComplete ? streetAfter(state.street) : state.street;
  const streetAdvanced = nextStreet !== state.street;
  const finalPlayers = streetAdvanced
    ? players.map((candidate) => ({ ...candidate, streetCommitment: 0 }))
    : players;
  const actingPlayerId = handComplete
    ? null
    : streetAdvanced
      ? firstActor(finalPlayers, nextStreet)
      : nextActionablePlayer(players, player.id);

  return {
    ok: true,
    state: {
      ...state,
      players: finalPlayers,
      pot,
      currentBet: streetAdvanced ? 0 : nextCurrentBet,
      amountToCall: streetAdvanced ? 0 : amountToCall,
      actingPlayerId,
      actedPlayerIds: streetAdvanced ? [] : actedPlayerIds,
      handComplete,
      street: nextStreet,
      actions: [...state.actions, action],
    },
  };
}

export function advancePokerStreet(
  state: PokerEngineState,
  street: Street
): PokerEngineState {
  const players = state.players.map((player) => ({ ...player, streetCommitment: 0 }));
  return {
    ...state,
    players,
    street,
    currentBet: 0,
    amountToCall: 0,
    actingPlayerId: firstActor(players, street),
    actedPlayerIds: [],
    handComplete: false,
  };
}

export function postBlinds(
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  heroId: string | null
): Pick<
  PokerEngineState,
  | "players"
  | "pot"
  | "currentBet"
  | "amountToCall"
  | "actingPlayerId"
  | "actedPlayerIds"
  | "handComplete"
> {
  const sb = sanitizeAmount(smallBlind);
  const bb = Math.max(sb, sanitizeAmount(bigBlind));
  const posted = players.map((player) => {
    const requested = player.isSmallBlind ? sb : player.isBigBlind ? bb : 0;
    const contribution = Math.min(player.stack, requested);
    return {
      ...player,
      stack: player.stack - contribution,
      streetCommitment: contribution,
      totalCommitted: contribution,
      status: contribution > 0 && contribution === player.stack ? ("all-in" as const) : player.status,
    };
  });
  const currentBet = Math.max(0, ...posted.map((player) => player.streetCommitment));
  return {
    players: posted,
    pot: posted.reduce((sum, player) => sum + player.streetCommitment, 0),
    currentBet,
    amountToCall: heroCallAmount(posted, heroId, currentBet),
    actingPlayerId: firstActor(posted, "preflop"),
    actedPlayerIds: [],
    handComplete: false,
  };
}

export function normalizeSeatAssignments(players: Player[]): Player[] {
  if (players.length === 0) return [];
  const hasDealer = players.some((player) => player.isDealer);
  const dealerIndex = hasDealer ? players.findIndex((player) => player.isDealer) : 0;
  const smallBlindIndex = players.length === 2 ? dealerIndex : (dealerIndex + 1) % players.length;
  const bigBlindIndex = (smallBlindIndex + 1) % players.length;
  return players.map((player, index) => ({
    ...player,
    position: index,
    isDealer: index === dealerIndex,
    isSmallBlind: index === smallBlindIndex,
    isBigBlind: index === bigBlindIndex,
  }));
}

export function toEngineState(state: PokerGameState): PokerEngineState {
  return {
    players: state.players,
    heroId: state.heroId,
    pot: state.pot,
    currentBet: state.currentBet,
    amountToCall: state.amountToCall,
    actingPlayerId: state.actingPlayerId,
    actedPlayerIds: state.actedPlayerIds,
    handComplete: state.handComplete,
    street: state.street,
    actions: state.actions,
  };
}

function streetAfter(street: Street): Street {
  if (street === "preflop") return "flop";
  if (street === "flop") return "turn";
  if (street === "turn") return "river";
  return "river";
}

function nextActionablePlayer(players: Player[], currentId: string): string | null {
  const currentIndex = players.findIndex((player) => player.id === currentId);
  for (let offset = 1; offset <= players.length; offset++) {
    const candidate = players[(currentIndex + offset) % players.length];
    if (candidate.status === "active" && candidate.stack > 0) return candidate.id;
  }
  return null;
}

function firstActor(players: Player[], street: Street): string | null {
  if (players.length === 0) return null;
  const anchor = street === "preflop"
    ? players.findIndex((player) => player.isBigBlind)
    : players.findIndex((player) => player.isDealer);
  const anchorId = players[Math.max(0, anchor)]?.id;
  return anchorId ? nextActionablePlayer(players, anchorId) : null;
}
