import { createDeck, removeKnownCards, shuffleDeck } from "./deck";
import { compareHands, getBestFiveCardHand } from "./handEvaluator";
import type { Card, Player, PokerOddsResult } from "./pokerTypes";

export interface MonteCarloInput {
  heroCards: [Card, Card];
  communityCards: Card[];
  activeOpponents: number;
  simulations?: number;
}

export function runMonteCarloSimulation(
  input: MonteCarloInput
): PokerOddsResult | null {
  const { heroCards, communityCards, activeOpponents } = input;
  const simulations = input.simulations ?? 3000;

  if (!heroCards[0] || !heroCards[1]) return null;
  if (activeOpponents < 1) return null;

  const knownCards = [...heroCards, ...communityCards];
  const baseDeck = removeKnownCards(createDeck(), knownCards);

  if (baseDeck.length < activeOpponents * 2 + (5 - communityCards.length)) {
    return null;
  }

  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let i = 0; i < simulations; i++) {
    let deck = shuffleDeck(baseDeck);
    const opponentHands: Card[][] = [];

    for (let o = 0; o < activeOpponents; o++) {
      const [dealt, remaining] = [deck.slice(0, 2), deck.slice(2)];
      opponentHands.push(dealt);
      deck = remaining;
    }

    let board = [...communityCards];
    const cardsNeeded = 5 - board.length;
    if (cardsNeeded > 0) {
      board = [...board, ...deck.slice(0, cardsNeeded)];
    }

    const heroSeven = [...heroCards, ...board].slice(0, 7);
    let heroWins = true;
    let heroTies = false;

    for (const oppCards of opponentHands) {
      const oppSeven = [...oppCards, ...board].slice(0, 7);
      const result = compareHands(heroSeven, oppSeven);
      if (result < 0) {
        heroWins = false;
        heroTies = false;
        break;
      }
      if (result === 0) heroTies = true;
    }

    if (heroWins && !heroTies) wins++;
    else if (heroTies) ties++;
    else losses++;
  }

  const heroAll = [...heroCards, ...communityCards];
  const bestHand =
    heroAll.length >= 5 ? getBestFiveCardHand(heroAll) : undefined;

  return {
    winPercentage: (wins / simulations) * 100,
    tiePercentage: (ties / simulations) * 100,
    losePercentage: (losses / simulations) * 100,
    simulations,
    bestHand,
    boardTexture: analyzeBoardTexture(communityCards),
  };
}

function analyzeBoardTexture(board: Card[]): string[] {
  if (board.length === 0) return ["Preflop — no board texture yet"];

  const notes: string[] = [];
  const suits = board.map((c) => c.suit);
  const ranks = board.map((c) => rankToValue(c.rank));

  const suitCounts: Record<string, number> = {};
  for (const s of suits) {
    suitCounts[s] = (suitCounts[s] || 0) + 1;
  }
  const maxSuit = Math.max(...Object.values(suitCounts));
  if (maxSuit >= 3) notes.push("Flush draw possible on board");
  if (maxSuit === 4) notes.push("Four to a flush — high flush threat");

  const sorted = [...ranks].sort((a, b) => a - b);
  const unique = [...new Set(sorted)];
  if (unique.length <= 2 && board.length >= 3) {
    notes.push("Paired board — set/two-pair risk elevated");
  }

  for (let i = 0; i < unique.length - 2; i++) {
    if (unique[i + 2] - unique[i] <= 4) {
      notes.push("Connected board — straight draws likely");
      break;
    }
  }

  const highCards = ranks.filter((r) => r >= 10).length;
  if (highCards >= 2) notes.push("High-card board — overpair/top-pair spots common");

  if (notes.length === 0) notes.push("Dry board — fewer obvious draws");

  return notes;
}

function rankToValue(rank: Card["rank"]): number {
  const map: Record<string, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return map[rank] ?? 0;
}

export function countActiveOpponents(players: Player[], heroId: string): number {
  return players.filter(
    (p) => p.id !== heroId && p.status !== "folded"
  ).length;
}

export function getCommunityCardArray(
  community: {
    flop1: Card | null;
    flop2: Card | null;
    flop3: Card | null;
    turn: Card | null;
    river: Card | null;
  }
): Card[] {
  return [
    community.flop1,
    community.flop2,
    community.flop3,
    community.turn,
    community.river,
  ].filter((c): c is Card => c !== null);
}
