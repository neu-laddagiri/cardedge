import { create } from "zustand";
import type {
  BJCard,
  BlackjackHand,
  BlackjackPlayer,
  BlackjackRecommendation,
  BlackjackRules,
  HandStatus,
} from "@/lib/blackjack/blackjackTypes";
import { getBlackjackRecommendation } from "@/lib/blackjack/recommendations";
import { isBust, isBlackjack } from "@/lib/blackjack/handValue";

let playerIdCounter = 1;
let handIdCounter = 1;

function createHand(): BlackjackHand {
  return {
    id: `h${handIdCounter++}`,
    cards: [],
    status: "active",
    isSplit: false,
    bet: 25,
  };
}

function createDefaultPlayers(): BlackjackPlayer[] {
  return [
    {
      id: `bj${playerIdCounter++}`,
      name: "Player 1",
      hands: [createHand()],
    },
  ];
}

function updateHandStatus(hand: BlackjackHand): BlackjackHand {
  if (hand.status === "surrendered" || hand.status === "stood") return hand;
  if (isBlackjack(hand.cards) && hand.cards.length === 2) {
    return { ...hand, status: "blackjack" };
  }
  if (isBust(hand.cards)) {
    return { ...hand, status: "bust" };
  }
  return hand;
}

interface BlackjackStore {
  rules: BlackjackRules;
  players: BlackjackPlayer[];
  dealerCards: BJCard[];
  activePlayerId: string | null;
  activeHandId: string | null;
  recommendation: BlackjackRecommendation | null;

  setRules: (rules: Partial<BlackjackRules>) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
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
  resetTable: () => void;
}

export const useBlackjackStore = create<BlackjackStore>((set, get) => {
  const defaultPlayers = createDefaultPlayers();

  const computeRecommendation = (state: BlackjackStore): BlackjackRecommendation | null => {
    const dealerUpcard = state.dealerCards[0];
    if (!dealerUpcard) return null;

    const playerId = state.activePlayerId ?? state.players[0]?.id;
    if (!playerId) return null;

    const player = state.players.find((p) => p.id === playerId);
    if (!player) return null;

    const handId = state.activeHandId ?? player.hands[0]?.id;
    const hand = player.hands.find((h) => h.id === handId);
    if (!hand || hand.cards.length === 0) return null;
    if (hand.status !== "active") return null;

    const canDouble = hand.cards.length === 2 && hand.status === "active";
    const canSplit =
      hand.cards.length === 2 &&
      hand.cards[0].rank === hand.cards[1].rank &&
      !hand.isSplit &&
      player.hands.length < 4;
    const canSurrender =
      hand.cards.length === 2 &&
      state.rules.surrenderAllowed &&
      hand.status === "active";

    return getBlackjackRecommendation({
      hand,
      dealerUpcard,
      rules: state.rules,
      canDouble,
      canSplit,
      canSurrender,
    });
  };

  return {
    rules: {
      numDecks: 6,
      dealerHitsSoft17: true,
      doubleAfterSplit: true,
      surrenderAllowed: true,
      blackjackPayout: "3:2",
    },
    players: defaultPlayers,
    dealerCards: [],
    activePlayerId: defaultPlayers[0]?.id ?? null,
    activeHandId: defaultPlayers[0]?.hands[0]?.id ?? null,
    recommendation: null,

    setRules: (partial) =>
      set((s) => {
        const rules = { ...s.rules, ...partial };
        const next = { rules };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    addPlayer: () =>
      set((s) => {
        const hand = createHand();
        const newPlayer: BlackjackPlayer = {
          id: `bj${playerIdCounter++}`,
          name: `Player ${s.players.length + 1}`,
          hands: [hand],
        };
        return {
          players: [...s.players, newPlayer],
          activePlayerId: s.activePlayerId ?? newPlayer.id,
          activeHandId: s.activeHandId ?? hand.id,
        };
      }),

    removePlayer: (id) =>
      set((s) => {
        if (s.players.length <= 1) return s;
        const players = s.players.filter((p) => p.id !== id);
        return {
          players,
          activePlayerId:
            s.activePlayerId === id ? players[0]?.id ?? null : s.activePlayerId,
          activeHandId:
            s.activePlayerId === id
              ? players[0]?.hands[0]?.id ?? null
              : s.activeHandId,
        };
      }),

    renamePlayer: (id, name) =>
      set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
      })),

    addHand: (playerId) =>
      set((s) => ({
        players: s.players.map((p) =>
          p.id === playerId
            ? { ...p, hands: [...p.hands, createHand()] }
            : p
        ),
      })),

    splitHand: (playerId, handId) =>
      set((s) => {
        const player = s.players.find((p) => p.id === playerId);
        const hand = player?.hands.find((h) => h.id === handId);
        if (!hand || hand.cards.length !== 2) return s;
        if (hand.cards[0].rank !== hand.cards[1].rank) return s;
        if (player && player.hands.length >= 4) return s;

        const card1 = hand.cards[0];
        const card2 = hand.cards[1];
        const newHand: BlackjackHand = {
          id: `h${handIdCounter++}`,
          cards: [card2],
          status: "active",
          isSplit: true,
          bet: hand.bet,
        };
        const updatedHand: BlackjackHand = {
          ...hand,
          cards: [card1],
          isSplit: true,
        };

        const players = s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId ? updatedHand : h
                ).concat(newHand),
              }
            : p
        );

        const next = { players, activeHandId: updatedHand.id };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    addCardToHand: (playerId, handId, card) =>
      set((s) => {
        const players = s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId
                    ? updateHandStatus({ ...h, cards: [...h.cards, card] })
                    : h
                ),
              }
            : p
        );
        const next = { players };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    removeCardFromHand: (playerId, handId, index) =>
      set((s) => {
        const players = s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId
                    ? updateHandStatus({
                        ...h,
                        cards: h.cards.filter((_, i) => i !== index),
                        status: "active",
                      })
                    : h
                ),
              }
            : p
        );
        const next = { players };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    setHandStatus: (playerId, handId, status) =>
      set((s) => ({
        players: s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId ? { ...h, status } : h
                ),
              }
            : p
        ),
      })),

    hitHand: (playerId, handId, card) => {
      get().addCardToHand(playerId, handId, card);
    },

    standHand: (playerId, handId) => {
      get().setHandStatus(playerId, handId, "stood");
      set((s) => ({ recommendation: computeRecommendation(s) }));
    },

    doubleHand: (playerId, handId, card) =>
      set((s) => {
        const players = s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId
                    ? updateHandStatus({
                        ...h,
                        cards: [...h.cards, card],
                        status: "doubled",
                        bet: h.bet * 2,
                      })
                    : h
                ),
              }
            : p
        );
        const next = { players };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    surrenderHand: (playerId, handId) =>
      set((s) => {
        const players = s.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                hands: p.hands.map((h) =>
                  h.id === handId ? { ...h, status: "surrendered" as const } : h
                ),
              }
            : p
        );
        const next = { players };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    setDealerCard: (index, card) =>
      set((s) => {
        const dealerCards = [...s.dealerCards];
        if (card === null) {
          dealerCards.splice(index, 1);
        } else if (index < dealerCards.length) {
          dealerCards[index] = card;
        } else {
          dealerCards.push(card);
        }
        const next = { dealerCards };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    addDealerCard: (card) =>
      set((s) => {
        const next = { dealerCards: [...s.dealerCards, card] };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    removeDealerCard: (index) =>
      set((s) => {
        const next = {
          dealerCards: s.dealerCards.filter((_, i) => i !== index),
        };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    setActiveHand: (playerId, handId) =>
      set((s) => {
        const next = { activePlayerId: playerId, activeHandId: handId };
        return { ...next, recommendation: computeRecommendation({ ...s, ...next }) };
      }),

    updateRecommendation: () =>
      set((s) => ({ recommendation: computeRecommendation(s) })),

    resetTable: () => {
      playerIdCounter = 1;
      handIdCounter = 1;
      const players = createDefaultPlayers();
      set({
        players,
        dealerCards: [],
        activePlayerId: players[0]?.id ?? null,
        activeHandId: players[0]?.hands[0]?.id ?? null,
        recommendation: null,
      });
    },
  };
});
