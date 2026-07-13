import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  BJCard,
  BlackjackDecisionRecord,
  BlackjackHand,
  BlackjackMove,
  BlackjackPlayer,
  BlackjackRecommendation,
  BlackjackRules,
  BlackjackSessionRecord,
  HandStatus,
} from "@/lib/blackjack/blackjackTypes";
import { getBlackjackRecommendation } from "@/lib/blackjack/recommendations";
import { isBlackjack, isBust, isPair } from "@/lib/blackjack/handValue";
import { validateShoe } from "@/lib/blackjack/shoe";

let playerIdCounter = 1;
let handIdCounter = 1;

const DEFAULT_BET = 1;

function createHand(bet = DEFAULT_BET): BlackjackHand {
  return { id: `h${handIdCounter++}`, cards: [], status: "active", isSplit: false, bet };
}

function createDefaultPlayers(defaultBet = DEFAULT_BET): BlackjackPlayer[] {
  return [{ id: `bj${playerIdCounter++}`, name: "Player 1", hands: [createHand(defaultBet)] }];
}

function updateHandStatus(hand: BlackjackHand): BlackjackHand {
  if (["surrendered", "stood", "doubled"].includes(hand.status)) return hand;
  if (isBlackjack(hand.cards) && hand.cards.length === 2 && !hand.isSplit) return { ...hand, status: "blackjack" };
  if (isBust(hand.cards)) return { ...hand, status: "bust" };
  return { ...hand, status: "active" };
}

interface BlackjackStore {
  rules: BlackjackRules;
  defaultBet: number;
  players: BlackjackPlayer[];
  dealerCards: BJCard[];
  activePlayerId: string | null;
  activeHandId: string | null;
  recommendation: BlackjackRecommendation | null;
  lastError: string | null;
  decisions: BlackjackDecisionRecord[];
  savedSessions: BlackjackSessionRecord[];
  sessionNote: string;

  setRules: (rules: Partial<BlackjackRules>) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setDefaultBet: (amount: number) => void;
  setHandBet: (playerId: string, handId: string, amount: number) => void;
  addHand: (playerId: string) => void;
  splitHand: (playerId: string, handId: string) => void;
  addCardToHand: (playerId: string, handId: string, card: BJCard) => void;
  removeCardFromHand: (playerId: string, handId: string, index: number) => void;
  setHandStatus: (playerId: string, handId: string, status: HandStatus) => void;
  hitHand: (playerId: string, handId: string, card: BJCard) => void;
  standHand: (playerId: string, handId: string) => void;
  doubleHand: (playerId: string, handId: string, card: BJCard) => void;
  surrenderHand: (playerId: string, handId: string) => void;
  setDealerCard: (index: number, card: BJCard | null) => void;
  addDealerCard: (card: BJCard) => void;
  removeDealerCard: (index: number) => void;
  setActiveHand: (playerId: string, handId: string) => void;
  updateRecommendation: () => void;
  setSessionNote: (note: string) => void;
  saveCurrentSession: () => void;
  deleteSavedSession: (id: string) => void;
  loadSavedSession: (id: string) => void;
  replaceSavedSessions: (sessions: BlackjackSessionRecord[]) => void;
  clearDecisionHistory: () => void;
  resetTable: () => void;
}

function allCards(state: Pick<BlackjackStore, "players" | "dealerCards">): BJCard[] {
  return [
    ...state.dealerCards,
    ...state.players.flatMap((player) => player.hands.flatMap((hand) => hand.cards)),
  ];
}

function activeHandDetails(state: BlackjackStore) {
  const player = state.players.find((candidate) => candidate.id === state.activePlayerId) ?? state.players[0];
  const hand = player?.hands.find((candidate) => candidate.id === state.activeHandId) ?? player?.hands[0];
  return { player, hand };
}

function computeRecommendation(state: BlackjackStore): BlackjackRecommendation | null {
  const dealerUpcard = state.dealerCards[0];
  const { player, hand } = activeHandDetails(state);
  if (!dealerUpcard || !player || !hand || hand.cards.length === 0 || hand.status !== "active") return null;
  const canDouble = hand.cards.length === 2 && (!hand.isSplit || state.rules.doubleAfterSplit);
  const canSplit = hand.cards.length === 2 && isPair(hand.cards) && player.hands.length < 4;
  const canSurrender = hand.cards.length === 2 && !hand.isSplit && state.rules.surrenderAllowed;
  return getBlackjackRecommendation({ hand, dealerUpcard, rules: state.rules, canDouble, canSplit, canSurrender });
}

function withRecommendation(state: BlackjackStore, patch: Partial<BlackjackStore>) {
  const next = { ...state, ...patch };
  return { ...patch, recommendation: computeRecommendation(next) };
}

function validateAddedCard(state: BlackjackStore, card: BJCard, excluded?: BJCard): string | null {
  const cards = allCards(state);
  if (excluded) {
    const index = cards.findIndex((candidate) => candidate.rank === excluded.rank && candidate.suit === excluded.suit);
    if (index >= 0) cards.splice(index, 1);
  }
  return validateShoe([...cards, card], state.rules.numDecks);
}

function decisionRecord(
  state: BlackjackStore,
  actualMove: BlackjackMove
): BlackjackDecisionRecord | null {
  const { player, hand } = activeHandDetails(state);
  const dealerUpcard = state.dealerCards[0];
  if (!player || !hand || !dealerUpcard || !state.recommendation) return null;
  return {
    id: `decision-${Date.now()}-${state.decisions.length}`,
    createdAt: Date.now(),
    playerName: player.name,
    cards: [...hand.cards],
    dealerUpcard,
    recommendedMove: state.recommendation.move,
    actualMove,
    correct: state.recommendation.move === actualMove,
    rules: { ...state.rules },
  };
}

const defaultPlayers = createDefaultPlayers();

export const useBlackjackStore = create<BlackjackStore>()(
  persist(
    (set, get) => ({
      rules: {
        numDecks: 6,
        dealerHitsSoft17: true,
        doubleAfterSplit: true,
        surrenderAllowed: true,
        blackjackPayout: "3:2",
      },
      defaultBet: DEFAULT_BET,
      players: defaultPlayers,
      dealerCards: [],
      activePlayerId: defaultPlayers[0]?.id ?? null,
      activeHandId: defaultPlayers[0]?.hands[0]?.id ?? null,
      recommendation: null,
      lastError: null,
      decisions: [],
      savedSessions: [],
      sessionNote: "",

      setRules: (partial) => set((state) => {
        const rules = { ...state.rules, ...partial };
        const error = validateShoe(allCards(state), rules.numDecks);
        if (error) return { lastError: error };
        return withRecommendation(state, { rules, lastError: null });
      }),
      addPlayer: () => set((state) => {
        if (state.players.length >= 7) return { lastError: "The training table supports up to seven players." };
        const hand = createHand(state.defaultBet);
        const player: BlackjackPlayer = { id: `bj${playerIdCounter++}`, name: `Player ${state.players.length + 1}`, hands: [hand] };
        return { players: [...state.players, player], lastError: null };
      }),
      removePlayer: (id) => set((state) => {
        if (state.players.length <= 1) return { lastError: "At least one player is required." };
        const players = state.players.filter((player) => player.id !== id);
        const activeChanged = state.activePlayerId === id;
        return withRecommendation(state, {
          players,
          activePlayerId: activeChanged ? players[0]?.id ?? null : state.activePlayerId,
          activeHandId: activeChanged ? players[0]?.hands[0]?.id ?? null : state.activeHandId,
          lastError: null,
        });
      }),
      renamePlayer: (id, name) => set((state) => ({
        players: state.players.map((player) => player.id === id ? { ...player, name: name.slice(0, 32) } : player),
      })),
      setDefaultBet: (defaultBet) => set({
        defaultBet: Math.max(0, Math.round(defaultBet * 100) / 100),
      }),
      setHandBet: (playerId, handId, amount) => set((state) => ({
        players: state.players.map((player) =>
          player.id === playerId
            ? {
                ...player,
                hands: player.hands.map((hand) =>
                  hand.id === handId && hand.cards.length === 0
                    ? { ...hand, bet: Math.max(0, Math.round(amount * 100) / 100) }
                    : hand
                ),
              }
            : player
        ),
      })),
      addHand: (playerId) => set((state) => {
        const player = state.players.find((candidate) => candidate.id === playerId);
        if (!player || player.hands.length >= 4) return { lastError: "A player can have at most four split hands." };
        const hand = createHand(state.defaultBet);
        return withRecommendation(state, {
          players: state.players.map((candidate) => candidate.id === playerId ? { ...candidate, hands: [...candidate.hands, hand] } : candidate),
          activePlayerId: playerId,
          activeHandId: hand.id,
          lastError: null,
        });
      }),
      splitHand: (playerId, handId) => set((state) => {
        const player = state.players.find((candidate) => candidate.id === playerId);
        const hand = player?.hands.find((candidate) => candidate.id === handId);
        if (!player || !hand || hand.cards.length !== 2 || !isPair(hand.cards)) return { lastError: "Only a two-card pair can be split." };
        if (player.hands.length >= 4) return { lastError: "The four-hand split limit has been reached." };
        const record = decisionRecord(state, "split");
        const first: BlackjackHand = { ...hand, cards: [hand.cards[0]], status: "active", isSplit: true };
        const second: BlackjackHand = { id: `h${handIdCounter++}`, cards: [hand.cards[1]], status: "active", isSplit: true, bet: hand.bet };
        const players = state.players.map((candidate) => candidate.id === playerId ? {
          ...candidate,
          hands: candidate.hands.flatMap((current) => current.id === handId ? [first, second] : [current]),
        } : candidate);
        return withRecommendation(state, {
          players,
          activePlayerId: playerId,
          activeHandId: first.id,
          decisions: record ? [record, ...state.decisions].slice(0, 250) : state.decisions,
          lastError: null,
        });
      }),
      addCardToHand: (playerId, handId, card) => set((state) => {
        const error = validateAddedCard(state, card);
        if (error) return { lastError: error };
        const players = state.players.map((player) => player.id === playerId ? {
          ...player,
          hands: player.hands.map((hand) => hand.id === handId ? updateHandStatus({ ...hand, cards: [...hand.cards, card] }) : hand),
        } : player);
        return withRecommendation(state, { players, lastError: null });
      }),
      removeCardFromHand: (playerId, handId, index) => set((state) => {
        const players = state.players.map((player) => player.id === playerId ? {
          ...player,
          hands: player.hands.map((hand) => hand.id === handId ? updateHandStatus({ ...hand, cards: hand.cards.filter((_, cardIndex) => cardIndex !== index), status: "active" }) : hand),
        } : player);
        return withRecommendation(state, { players, lastError: null });
      }),
      setHandStatus: (playerId, handId, status) => set((state) => withRecommendation(state, {
        players: state.players.map((player) => player.id === playerId ? {
          ...player,
          hands: player.hands.map((hand) => hand.id === handId ? { ...hand, status } : hand),
        } : player),
      })),
      hitHand: (playerId, handId, card) => {
        const state = get();
        const record = decisionRecord(state, "hit");
        const before = state.players;
        get().addCardToHand(playerId, handId, card);
        if (get().players !== before && record) set((fresh) => ({ decisions: [record, ...fresh.decisions].slice(0, 250) }));
      },
      standHand: (playerId, handId) => {
        const state = get();
        const record = decisionRecord(state, "stand");
        get().setHandStatus(playerId, handId, "stood");
        if (record) set((fresh) => ({ decisions: [record, ...fresh.decisions].slice(0, 250) }));
      },
      doubleHand: (playerId, handId, card) => set((state) => {
        const { hand } = activeHandDetails(state);
        if (!hand || hand.id !== handId || hand.cards.length !== 2 || (hand.isSplit && !state.rules.doubleAfterSplit)) {
          return { lastError: "Doubling is unavailable for this hand under the selected rules." };
        }
        const error = validateAddedCard(state, card);
        if (error) return { lastError: error };
        const record = decisionRecord(state, "double");
        const players = state.players.map((player) => player.id === playerId ? {
          ...player,
          hands: player.hands.map((candidate) => candidate.id === handId ? updateHandStatus({
            ...candidate,
            cards: [...candidate.cards, card],
            status: "doubled",
            bet: candidate.bet * 2,
          }) : candidate),
        } : player);
        return withRecommendation(state, {
          players,
          decisions: record ? [record, ...state.decisions].slice(0, 250) : state.decisions,
          lastError: null,
        });
      }),
      surrenderHand: (playerId, handId) => set((state) => {
        const { hand } = activeHandDetails(state);
        if (!state.rules.surrenderAllowed || !hand || hand.id !== handId || hand.cards.length !== 2 || hand.isSplit) {
          return { lastError: "Late surrender is unavailable for this hand." };
        }
        const record = decisionRecord(state, "surrender");
        const players = state.players.map((player) => player.id === playerId ? {
          ...player,
          hands: player.hands.map((candidate) => candidate.id === handId ? { ...candidate, status: "surrendered" as const } : candidate),
        } : player);
        return withRecommendation(state, {
          players,
          decisions: record ? [record, ...state.decisions].slice(0, 250) : state.decisions,
          lastError: null,
        });
      }),
      setDealerCard: (index, card) => set((state) => {
        const existing = state.dealerCards[index];
        if (card) {
          const error = validateAddedCard(state, card, existing);
          if (error) return { lastError: error };
        }
        const dealerCards = [...state.dealerCards];
        if (!card) dealerCards.splice(index, 1);
        else dealerCards[index] = card;
        return withRecommendation(state, { dealerCards, lastError: null });
      }),
      addDealerCard: (card) => set((state) => {
        const error = validateAddedCard(state, card);
        if (error) return { lastError: error };
        return withRecommendation(state, { dealerCards: [...state.dealerCards, card], lastError: null });
      }),
      removeDealerCard: (index) => set((state) => withRecommendation(state, {
        dealerCards: state.dealerCards.filter((_, cardIndex) => cardIndex !== index),
        lastError: null,
      })),
      setActiveHand: (activePlayerId, activeHandId) => set((state) => withRecommendation(state, { activePlayerId, activeHandId, lastError: null })),
      updateRecommendation: () => set((state) => ({ recommendation: computeRecommendation(state) })),
      setSessionNote: (sessionNote) => set({ sessionNote: sessionNote.slice(0, 500) }),
      saveCurrentSession: () => set((state) => {
        const session: BlackjackSessionRecord = {
          id: `blackjack-${Date.now()}`,
          savedAt: Date.now(),
          players: state.players,
          dealerCards: state.dealerCards,
          rules: state.rules,
          decisions: state.decisions,
          note: state.sessionNote.trim(),
        };
        return { savedSessions: [session, ...state.savedSessions].slice(0, 100), sessionNote: "", lastError: null };
      }),
      deleteSavedSession: (id) => set((state) => ({ savedSessions: state.savedSessions.filter((session) => session.id !== id) })),
      loadSavedSession: (id) => set((state) => {
        const session = state.savedSessions.find((candidate) => candidate.id === id);
        if (!session) return { lastError: "That saved session is no longer available." };
        playerIdCounter = Math.max(
          playerIdCounter,
          ...session.players.map((player) => Number(player.id.replace(/\D/g, "")) + 1 || 1)
        );
        handIdCounter = Math.max(
          handIdCounter,
          ...session.players.flatMap((player) =>
            player.hands.map((hand) => Number(hand.id.replace(/\D/g, "")) + 1 || 1)
          )
        );
        const activePlayerId = session.players[0]?.id ?? null;
        const activeHandId = session.players[0]?.hands[0]?.id ?? null;
        return withRecommendation(state, {
          players: session.players,
          dealerCards: session.dealerCards,
          rules: session.rules,
          decisions: session.decisions,
          activePlayerId,
          activeHandId,
          sessionNote: session.note,
          lastError: null,
        });
      }),
      replaceSavedSessions: (savedSessions) => set({
        savedSessions: [...savedSessions]
          .sort((a, b) => b.savedAt - a.savedAt)
          .slice(0, 100),
      }),
      clearDecisionHistory: () => set({ decisions: [] }),
      resetTable: () => {
        const state = get();
        const players = state.players.map((player) => ({
          ...player,
          hands: [createHand(state.defaultBet)],
        }));
        set({
          players,
          dealerCards: [],
          activePlayerId: players[0]?.id ?? null,
          activeHandId: players[0]?.hands[0]?.id ?? null,
          recommendation: null,
          lastError: null,
          sessionNote: "",
        });
      },
    }),
    {
      name: "cardedge-blackjack-v2",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rules: state.rules,
        defaultBet: state.defaultBet,
        decisions: state.decisions,
        savedSessions: state.savedSessions,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<BlackjackStore>;
        return {
          ...state,
          defaultBet:
            state.defaultBet === undefined || state.defaultBet === 25
              ? DEFAULT_BET
              : state.defaultBet,
        } as BlackjackStore;
      },
    }
  )
);
