import { create } from "zustand";
import type {
  ActionType,
  Card,
  OpponentStyle,
  Player,
  PlayerStatus,
  PokerAction,
  PokerOddsResult,
  PokerRecommendation,
  Street,
} from "@/lib/poker/pokerTypes";
import {
  countActiveOpponents,
  getCommunityCardArray,
  runMonteCarloSimulation,
} from "@/lib/poker/monteCarlo";
import { buildRecommendation } from "@/lib/poker/pokerUtils";
import { validateNoDuplicateCards } from "@/lib/poker/deck";

let playerIdCounter = 1;
let actionIdCounter = 1;

function createDefaultPlayers(): Player[] {
  const p1: Player = {
    id: `p${playerIdCounter++}`,
    name: "Hero",
    stack: 2000,
    position: 0,
    isHero: true,
    isDealer: false,
    isSmallBlind: true,
    isBigBlind: false,
    status: "active",
    style: "unknown",
  };
  const p2: Player = {
    id: `p${playerIdCounter++}`,
    name: "Villain 1",
    stack: 2000,
    position: 1,
    isHero: false,
    isDealer: true,
    isSmallBlind: false,
    isBigBlind: true,
    status: "active",
    style: "unknown",
  };
  return [p1, p2];
}

interface PokerStore {
  players: Player[];
  heroId: string | null;
  startingBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  pot: number;
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
  simulationCount: number;

  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setPlayerStack: (id: string, stack: number) => void;
  setPlayerStatus: (id: string, status: PlayerStatus) => void;
  setPlayerStyle: (id: string, style: OpponentStyle) => void;
  setHero: (id: string) => void;
  setDealer: (id: string) => void;
  setSmallBlind: (id: string) => void;
  setBigBlind: (id: string) => void;
  rotateBlinds: () => void;
  setStartingBuyIn: (amount: number) => void;
  setSmallBlindAmount: (amount: number) => void;
  setBigBlindAmount: (amount: number) => void;
  setPot: (amount: number) => void;
  setAmountToCall: (amount: number) => void;
  setStreet: (street: Street) => void;
  setHeroCard: (index: 0 | 1, card: Card | null) => void;
  setCommunityCard: (
    key: keyof PokerStore["communityCards"],
    card: Card | null
  ) => void;
  addAction: (
    playerId: string,
    type: ActionType,
    amount?: number
  ) => void;
  clearActions: () => void;
  runSimulation: () => void;
  resetGame: () => void;
}

function getGameState(state: PokerStore) {
  return {
    players: state.players,
    heroId: state.heroId,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    startingBuyIn: state.startingBuyIn,
    pot: state.pot,
    amountToCall: state.amountToCall,
    street: state.street,
    heroCards: state.heroCards,
    communityCards: state.communityCards,
    actions: state.actions,
  };
}

export const usePokerStore = create<PokerStore>((set, get) => {
  const defaultPlayers = createDefaultPlayers();

  return {
    players: defaultPlayers,
    heroId: defaultPlayers[0].id,
    startingBuyIn: 2000,
    smallBlind: 10,
    bigBlind: 20,
    pot: 45,
    amountToCall: 20,
    street: "flop",
    heroCards: [null, null],
    communityCards: {
      flop1: null,
      flop2: null,
      flop3: null,
      turn: null,
      river: null,
    },
    actions: [],
    oddsResult: null,
    recommendation: null,
    isSimulating: false,
    simulationCount: 3000,

    addPlayer: () =>
      set((s) => {
        const newPlayer: Player = {
          id: `p${playerIdCounter++}`,
          name: `Player ${s.players.length + 1}`,
          stack: s.startingBuyIn,
          position: s.players.length,
          isHero: false,
          isDealer: false,
          isSmallBlind: false,
          isBigBlind: false,
          status: "active",
          style: "unknown",
        };
        return { players: [...s.players, newPlayer] };
      }),

    removePlayer: (id) =>
      set((s) => {
        if (s.players.length <= 2) return s;
        const players = s.players.filter((p) => p.id !== id);
        let heroId = s.heroId;
        if (heroId === id) heroId = players[0]?.id ?? null;
        return { players, heroId };
      }),

    renamePlayer: (id, name) =>
      set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
      })),

    setPlayerStack: (id, stack) =>
      set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, stack } : p)),
      })),

    setPlayerStatus: (id, status) =>
      set((s) => {
        const next = {
          players: s.players.map((p) => (p.id === id ? { ...p, status } : p)),
        };
        setTimeout(() => get().runSimulation(), 0);
        return next;
      }),

    setPlayerStyle: (id, style) =>
      set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, style } : p)),
      })),

    setHero: (id) =>
      set((s) => ({
        heroId: id,
        players: s.players.map((p) => ({ ...p, isHero: p.id === id })),
      })),

    setDealer: (id) =>
      set((s) => ({
        players: s.players.map((p) => ({ ...p, isDealer: p.id === id })),
      })),

    setSmallBlind: (id) =>
      set((s) => ({
        players: s.players.map((p) => ({
          ...p,
          isSmallBlind: p.id === id,
        })),
      })),

    setBigBlind: (id) =>
      set((s) => ({
        players: s.players.map((p) => ({
          ...p,
          isBigBlind: p.id === id,
        })),
      })),

    rotateBlinds: () =>
      set((s) => {
        const dealerIdx = s.players.findIndex((p) => p.isDealer);
        const nextDealer = (dealerIdx + 1) % s.players.length;
        const sb = (nextDealer + 1) % s.players.length;
        const bb = (nextDealer + 2) % s.players.length;
        return {
          players: s.players.map((p, i) => ({
            ...p,
            isDealer: i === nextDealer,
            isSmallBlind: i === sb,
            isBigBlind: i === bb,
          })),
        };
      }),

    setStartingBuyIn: (amount) => set({ startingBuyIn: amount }),
    setSmallBlindAmount: (amount) => set({ smallBlind: amount }),
    setBigBlindAmount: (amount) => set({ bigBlind: amount }),
    setPot: (amount) => {
      set({ pot: amount });
      setTimeout(() => get().runSimulation(), 0);
    },
    setAmountToCall: (amount) => {
      set({ amountToCall: amount });
      setTimeout(() => get().runSimulation(), 0);
    },
    setStreet: (street) => set({ street }),

    setHeroCard: (index, card) =>
      set((s) => {
        const heroCards = [...s.heroCards] as [Card | null, Card | null];
        heroCards[index] = card;
        setTimeout(() => get().runSimulation(), 0);
        return { heroCards };
      }),

    setCommunityCard: (key, card) =>
      set((s) => {
        const communityCards = { ...s.communityCards, [key]: card };
        setTimeout(() => get().runSimulation(), 0);
        return { communityCards };
      }),

    addAction: (playerId, type, amount) =>
      set((s) => ({
        actions: [
          ...s.actions,
          {
            id: `a${actionIdCounter++}`,
            playerId,
            type,
            amount,
            street: s.street,
            timestamp: Date.now(),
          },
        ],
      })),

    clearActions: () => set({ actions: [] }),

    runSimulation: () => {
      const state = get();
      const heroId = state.heroId;
      if (!heroId) {
        set({ oddsResult: null, recommendation: null, isSimulating: false });
        return;
      }

      const c1 = state.heroCards[0];
      const c2 = state.heroCards[1];
      if (!c1 || !c2) {
        set({ oddsResult: null, recommendation: null, isSimulating: false });
        return;
      }

      const community = getCommunityCardArray(state.communityCards);
      const allKnown = [c1, c2, ...community];
      if (!validateNoDuplicateCards(allKnown)) {
        set({ oddsResult: null, recommendation: null, isSimulating: false });
        return;
      }

      const activeOpponents = countActiveOpponents(state.players, heroId);
      if (activeOpponents < 1) {
        set({ oddsResult: null, recommendation: null, isSimulating: false });
        return;
      }

      set({ isSimulating: true });

      setTimeout(() => {
        const result = runMonteCarloSimulation({
          heroCards: [c1, c2],
          communityCards: community,
          activeOpponents,
          simulations: state.simulationCount,
        });

        const gameState = getGameState(get());
        const recommendation = buildRecommendation(result, gameState);

        set({
          oddsResult: result,
          recommendation,
          isSimulating: false,
        });
      }, 50);
    },

    resetGame: () => {
      playerIdCounter = 1;
      actionIdCounter = 1;
      const players = createDefaultPlayers();
      set({
        players,
        heroId: players[0].id,
        startingBuyIn: 2000,
        smallBlind: 10,
        bigBlind: 20,
        pot: 0,
        amountToCall: 0,
        street: "preflop",
        heroCards: [null, null],
        communityCards: {
          flop1: null,
          flop2: null,
          flop3: null,
          turn: null,
          river: null,
        },
        actions: [],
        oddsResult: null,
        recommendation: null,
        isSimulating: false,
      });
    },
  };
});
