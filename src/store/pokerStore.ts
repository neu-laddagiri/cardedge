import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ActionType,
  Card,
  OpponentStyle,
  Player,
  PlayerStatus,
  PokerAction,
  PokerHandRecord,
  PokerOddsResult,
  PokerRecommendation,
  SimulationPrecision,
  Street,
} from "@/lib/poker/pokerTypes";
import { getCommunityCardArray } from "@/lib/poker/monteCarlo";
import { buildRecommendation } from "@/lib/poker/pokerUtils";
import {
  advancePokerStreet,
  applyPokerAction,
  normalizeSeatAssignments,
  postBlinds,
  type PokerEngineState,
} from "@/lib/poker/handState";
import { buildOpponentProfiles } from "@/lib/poker/ranges";
import {
  cancelPokerSimulation,
  runPokerSimulation,
  SimulationCancelledError,
} from "@/lib/poker/simulationClient";
import {
  sanitizeAmount,
  validateCommunityLayout,
  validatePokerCards,
} from "@/lib/poker/validation";

let playerIdCounter = 1;
let actionIdCounter = 1;
let simulationTimer: ReturnType<typeof setTimeout> | null = null;

const SIMULATION_COUNTS: Record<SimulationPrecision, number> = {
  fast: 800,
  balanced: 4000,
  precise: 20000,
};

type PokerSnapshot = PokerEngineState;

function createPlayer(name: string, stack: number, position: number): Player {
  return {
    id: `p${playerIdCounter++}`,
    name,
    stack,
    position,
    isHero: position === 0,
    isDealer: position === 0,
    isSmallBlind: position === 0,
    isBigBlind: position === 1,
    status: "active",
    style: "unknown",
    streetCommitment: 0,
    totalCommitted: 0,
  };
}

function createInitialTable(startingBuyIn = 2000, smallBlind = 10, bigBlind = 20) {
  playerIdCounter = 1;
  const players = normalizeSeatAssignments([
    createPlayer("Hero", startingBuyIn, 0),
    createPlayer("Villain 1", startingBuyIn, 1),
  ]);
  const heroId = players[0].id;
  return { heroId, ...postBlinds(players, smallBlind, bigBlind, heroId) };
}

function rebuildTableSetup(
  players: Player[],
  heroId: string | null,
  smallBlind: number,
  bigBlind: number
) {
  const refunded = normalizeSeatAssignments(
    players.map((player) => ({
      ...player,
      stack: player.stack + player.totalCommitted,
      status: "active" as const,
      streetCommitment: 0,
      totalCommitted: 0,
    }))
  );
  return { heroId, ...postBlinds(refunded, smallBlind, bigBlind, heroId) };
}

interface PokerStore {
  players: Player[];
  heroId: string | null;
  startingBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  pot: number;
  currentBet: number;
  actingPlayerId: string | null;
  actedPlayerIds: string[];
  handComplete: boolean;
  amountToCall: number;
  street: Street;
  heroCards: [Card | null, Card | null];
  communityCards: {
    flop1: Card | null;
    flop2: Card | null;
    flop3: Card | null;
    turn: Card | null;
    river: Card | null;
  };
  actions: PokerAction[];
  oddsResult: PokerOddsResult | null;
  recommendation: PokerRecommendation | null;
  isSimulating: boolean;
  precision: SimulationPrecision;
  simulationCount: number;
  lastError: string | null;
  undoStack: PokerSnapshot[];
  savedHands: PokerHandRecord[];
  handNote: string;

  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setPlayerStack: (id: string, stack: number) => void;
  setPlayerStatus: (id: string, status: PlayerStatus) => void;
  setPlayerStyle: (id: string, style: OpponentStyle) => void;
  setPlayerRange: (id: string, rangePercent?: number) => void;
  setHero: (id: string) => void;
  setDealer: (id: string) => void;
  rotateBlinds: () => void;
  setStartingBuyIn: (amount: number) => void;
  setSmallBlindAmount: (amount: number) => void;
  setBigBlindAmount: (amount: number) => void;
  setPot: (amount: number) => void;
  setAmountToCall: (amount: number) => void;
  setStreet: (street: Street) => void;
  setHeroCard: (index: 0 | 1, card: Card | null) => void;
  setCommunityCard: (key: keyof PokerStore["communityCards"], card: Card | null) => void;
  addAction: (playerId: string, type: ActionType, amount?: number) => void;
  clearActions: () => void;
  undoLastAction: () => void;
  setPrecision: (precision: SimulationPrecision) => void;
  queueSimulation: () => void;
  runSimulation: () => Promise<void>;
  setHandNote: (note: string) => void;
  saveCurrentHand: () => void;
  deleteSavedHand: (id: string) => void;
  loadSavedHand: (id: string) => void;
  resetGame: () => void;
}

function engineSnapshot(state: PokerStore): PokerSnapshot {
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

function recommendationState(state: PokerStore) {
  return {
    players: state.players,
    heroId: state.heroId,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    startingBuyIn: state.startingBuyIn,
    pot: state.pot,
    currentBet: state.currentBet,
    amountToCall: state.amountToCall,
    actingPlayerId: state.actingPlayerId,
    actedPlayerIds: state.actedPlayerIds,
    handComplete: state.handComplete,
    street: state.street,
    heroCards: state.heroCards,
    communityCards: state.communityCards,
    actions: state.actions,
  };
}

const initialTable = createInitialTable();

export const usePokerStore = create<PokerStore>()(
  persist(
    (set, get) => ({
      players: initialTable.players,
      heroId: initialTable.heroId,
      startingBuyIn: 2000,
      smallBlind: 10,
      bigBlind: 20,
      pot: initialTable.pot,
      currentBet: initialTable.currentBet,
      amountToCall: initialTable.amountToCall,
      actingPlayerId: initialTable.actingPlayerId,
      actedPlayerIds: initialTable.actedPlayerIds,
      handComplete: initialTable.handComplete,
      street: "preflop",
      heroCards: [null, null],
      communityCards: { flop1: null, flop2: null, flop3: null, turn: null, river: null },
      actions: [],
      oddsResult: null,
      recommendation: null,
      isSimulating: false,
      precision: "balanced",
      simulationCount: SIMULATION_COUNTS.balanced,
      lastError: null,
      undoStack: [],
      savedHands: [],
      handNote: "",

      addPlayer: () => set((state) => {
        if (state.players.length >= 10) return { lastError: "Poker tables are limited to 10 players." };
        if (state.actions.length > 0) return { lastError: "Start a new hand before changing table seats." };
        const players = [
          ...state.players,
          createPlayer(`Player ${state.players.length + 1}`, state.startingBuyIn, state.players.length),
        ];
        return {
          ...rebuildTableSetup(players, state.heroId, state.smallBlind, state.bigBlind),
          lastError: null,
        };
      }),

      removePlayer: (id) => set((state) => {
        if (state.players.length <= 2) return { lastError: "At least two players are required." };
        if (state.actions.length > 0) return { lastError: "Start a new hand before changing table seats." };
        const remaining = state.players.filter((player) => player.id !== id);
        const heroId = state.heroId === id ? remaining[0]?.id ?? null : state.heroId;
        const players = remaining.map((player) => ({
          ...player,
          isHero: player.id === heroId,
        }));
        return {
          ...rebuildTableSetup(players, heroId, state.smallBlind, state.bigBlind),
          lastError: null,
        };
      }),

      renamePlayer: (id, name) => set((state) => ({
        players: state.players.map((player) => player.id === id ? { ...player, name: name.slice(0, 32) } : player),
      })),
      setPlayerStack: (id, stack) => set((state) => {
        if (state.actions.length > 0) return { lastError: "Stacks cannot be edited after betting begins." };
        return {
          players: state.players.map((player) => player.id === id ? { ...player, stack: sanitizeAmount(stack) } : player),
          lastError: null,
        };
      }),
      setPlayerStatus: (id, status) => {
        const state = get();
        if (state.actions.length > 0) {
          set({ lastError: "Use the action panel to fold or move all-in after betting begins." });
          return;
        }
        set({
          players: state.players.map((player) => player.id === id ? { ...player, status } : player),
          lastError: null,
        });
        get().queueSimulation();
      },
      setPlayerStyle: (id, style) => {
        set((state) => ({ players: state.players.map((player) => player.id === id ? { ...player, style } : player) }));
        get().queueSimulation();
      },
      setPlayerRange: (id, rangePercent) => {
        set((state) => ({
          players: state.players.map((player) =>
            player.id === id
              ? {
                  ...player,
                  rangeOverride:
                    rangePercent === undefined
                      ? undefined
                      : Math.max(5, Math.min(100, Math.round(rangePercent))),
                }
              : player
          ),
        }));
        get().queueSimulation();
      },
      setHero: (id) => {
        const state = get();
        if (state.actions.length > 0) {
          set({ lastError: "Choose the hero before betting begins." });
          return;
        }
        const players = state.players.map((player) => ({ ...player, isHero: player.id === id }));
        const hero = players.find((player) => player.id === id);
        set({
          heroId: id,
          players,
          amountToCall: hero ? Math.max(0, state.currentBet - hero.streetCommitment) : 0,
          lastError: null,
        });
        get().queueSimulation();
      },
      setDealer: (id) => set((state) => {
        if (state.actions.length > 0) return { lastError: "Move the dealer before betting begins." };
        const players = state.players.map((player) => ({ ...player, isDealer: player.id === id }));
        return {
          ...rebuildTableSetup(players, state.heroId, state.smallBlind, state.bigBlind),
          lastError: null,
        };
      }),
      rotateBlinds: () => set((state) => {
        if (state.actions.length > 0) return { lastError: "Rotate the button before betting begins." };
        const dealerIndex = state.players.findIndex((player) => player.isDealer);
        const nextDealer = (Math.max(0, dealerIndex) + 1) % state.players.length;
        const players = state.players.map((player, index) => ({
          ...player,
          isDealer: index === nextDealer,
        }));
        return {
          ...rebuildTableSetup(players, state.heroId, state.smallBlind, state.bigBlind),
          lastError: null,
        };
      }),
      setStartingBuyIn: (amount) => set({ startingBuyIn: sanitizeAmount(amount) }),
      setSmallBlindAmount: (amount) => set({ smallBlind: sanitizeAmount(amount) }),
      setBigBlindAmount: (amount) => set({ bigBlind: sanitizeAmount(amount) }),
      setPot: (amount) => {
        set({ pot: sanitizeAmount(amount) });
        get().queueSimulation();
      },
      setAmountToCall: (amount) => {
        set({ amountToCall: sanitizeAmount(amount) });
        get().queueSimulation();
      },
      setStreet: (street) => {
        set((state) => ({ ...advancePokerStreet(engineSnapshot(state), street), lastError: null }));
        get().queueSimulation();
      },
      setHeroCard: (index, card) => {
        set((state) => {
          const heroCards = [...state.heroCards] as [Card | null, Card | null];
          heroCards[index] = card;
          return { heroCards, lastError: null };
        });
        get().queueSimulation();
      },
      setCommunityCard: (key, card) => {
        set((state) => ({ communityCards: { ...state.communityCards, [key]: card }, lastError: null }));
        get().queueSimulation();
      },

      addAction: (playerId, type, amount) => {
        const state = get();
        const result = applyPokerAction(engineSnapshot(state), {
          id: `a${actionIdCounter++}`,
          playerId,
          type,
          amount,
          recommendationAtAction:
            playerId === state.heroId ? state.recommendation?.action : undefined,
        });
        if (!result.ok) {
          set({ lastError: result.error });
          return;
        }
        set({
          ...result.state,
          undoStack: [...state.undoStack, engineSnapshot(state)].slice(-30),
          lastError: null,
        });
        get().queueSimulation();
      },
      clearActions: () => {
        const state = get();
        const initial = state.undoStack[0];
        if (!initial && state.actions.length > 0) {
          set({ lastError: "Replayed hands cannot be cleared safely. Start a new hand instead." });
          return;
        }
        set(initial ? { ...initial, actions: [], undoStack: [], lastError: null } : { actions: [], undoStack: [], lastError: null });
        get().queueSimulation();
      },
      undoLastAction: () => {
        const state = get();
        const previous = state.undoStack.at(-1);
        if (!previous) {
          set({ lastError: "There is no action to undo." });
          return;
        }
        set({
          ...previous,
          undoStack: state.undoStack.slice(0, -1),
          lastError: null,
        });
        get().queueSimulation();
      },
      setPrecision: (precision) => {
        set({ precision, simulationCount: SIMULATION_COUNTS[precision] });
        get().queueSimulation();
      },
      queueSimulation: () => {
        if (simulationTimer) clearTimeout(simulationTimer);
        simulationTimer = setTimeout(() => void get().runSimulation(), 180);
      },
      runSimulation: async () => {
        const state = get();
        const [first, second] = state.heroCards;
        const community = getCommunityCardArray(state.communityCards);
        if (!first || !second) {
          cancelPokerSimulation();
          set({ oddsResult: null, recommendation: null, isSimulating: false });
          return;
        }
        const validationError =
          validateCommunityLayout(state.communityCards, state.street) ??
          validatePokerCards(state.heroCards, community, state.street);
        if (validationError) {
          cancelPokerSimulation();
          set({ oddsResult: null, recommendation: null, isSimulating: false, lastError: validationError });
          return;
        }
        if (!state.heroId) return;
        const opponents = buildOpponentProfiles(state.players, state.heroId, state.actions);
        if (opponents.length === 0) {
          set({ oddsResult: null, recommendation: null, isSimulating: false, lastError: "At least one active opponent is required." });
          return;
        }
        set({ isSimulating: true, lastError: null });
        try {
          const result = await runPokerSimulation({
            heroCards: [first, second],
            communityCards: community,
            opponents,
            simulations: state.simulationCount,
          });
          const fresh = get();
          set({
            oddsResult: result,
            recommendation: buildRecommendation(result, recommendationState(fresh)),
            isSimulating: false,
          });
        } catch (error) {
          if (error instanceof SimulationCancelledError) return;
          set({
            isSimulating: false,
            lastError: error instanceof Error ? error.message : "Simulation failed.",
          });
        }
      },
      setHandNote: (handNote) => set({ handNote: handNote.slice(0, 500) }),
      saveCurrentHand: () => set((state) => {
        const heroAction = [...state.actions]
          .reverse()
          .find((action) => action.playerId === state.heroId);
        const recommendedDecision = heroAction?.recommendationAtAction;
        const record: PokerHandRecord = {
          id: `poker-${Date.now()}`,
          savedAt: Date.now(),
          street: state.street,
          heroCards: state.heroCards,
          communityCards: state.communityCards,
          players: state.players,
          actions: state.actions,
          pot: state.pot,
          currentBet: state.currentBet,
          amountToCall: state.amountToCall,
          actingPlayerId: state.actingPlayerId,
          actedPlayerIds: state.actedPlayerIds,
          handComplete: state.handComplete,
          odds: state.oddsResult,
          recommendation: state.recommendation,
          actualDecision: heroAction?.type,
          recommendedDecision,
          followedRecommendation:
            heroAction && recommendedDecision
              ? heroAction.type === recommendedDecision
              : undefined,
          note: state.handNote.trim(),
        };
        return { savedHands: [record, ...state.savedHands].slice(0, 100), handNote: "", lastError: null };
      }),
      deleteSavedHand: (id) => set((state) => ({ savedHands: state.savedHands.filter((hand) => hand.id !== id) })),
      loadSavedHand: (id) => set((state) => {
        const hand = state.savedHands.find((candidate) => candidate.id === id);
        if (!hand) return { lastError: "That saved hand is no longer available." };
        playerIdCounter = Math.max(
          playerIdCounter,
          ...hand.players.map((player) => Number(player.id.replace(/\D/g, "")) + 1 || 1)
        );
        actionIdCounter = Math.max(
          actionIdCounter,
          ...hand.actions.map((action) => Number(action.id.replace(/\D/g, "")) + 1 || 1)
        );
        return {
          players: hand.players,
          heroId: hand.players.find((player) => player.isHero)?.id ?? hand.players[0]?.id ?? null,
          street: hand.street,
          heroCards: hand.heroCards,
          communityCards: hand.communityCards,
          actions: hand.actions,
          pot: hand.pot,
          currentBet: hand.currentBet,
          amountToCall: hand.amountToCall,
          actingPlayerId: hand.actingPlayerId,
          actedPlayerIds: hand.actedPlayerIds,
          handComplete: hand.handComplete,
          oddsResult: hand.odds,
          recommendation: hand.recommendation,
          handNote: hand.note,
          undoStack: [],
          lastError: null,
        };
      }),
      resetGame: () => {
        cancelPokerSimulation();
        actionIdCounter = 1;
        const state = get();
        const heroId = state.heroId ?? state.players[0]?.id ?? null;
        const resetPlayers = normalizeSeatAssignments(
          state.players.map((player) => ({
            ...player,
            stack: state.startingBuyIn,
            status: "active" as const,
            isHero: player.id === heroId,
            streetCommitment: 0,
            totalCommitted: 0,
          }))
        );
        const table = { heroId, ...postBlinds(resetPlayers, state.smallBlind, state.bigBlind, heroId) };
        set({
          ...table,
          street: "preflop",
          heroCards: [null, null],
          communityCards: { flop1: null, flop2: null, flop3: null, turn: null, river: null },
          actions: [],
          oddsResult: null,
          recommendation: null,
          isSimulating: false,
          lastError: null,
          undoStack: [],
          handNote: "",
        });
      },
    }),
    {
      name: "cardedge-poker-v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        startingBuyIn: state.startingBuyIn,
        smallBlind: state.smallBlind,
        bigBlind: state.bigBlind,
        precision: state.precision,
        simulationCount: state.simulationCount,
        savedHands: state.savedHands,
      }),
    }
  )
);
