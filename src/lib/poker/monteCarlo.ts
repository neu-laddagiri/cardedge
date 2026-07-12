import { createDeck, removeKnownCards, shuffleDeck } from "./deck";
import { compareHands, getBestFiveCardHand } from "./handEvaluator";
import { createSeededRandom } from "./random";
import { estimateStartingHandStrength, handFitsRange } from "./ranges";
import type {
  Card,
  OpponentSimulationProfile,
  Player,
  PokerOddsResult,
} from "./pokerTypes";

export interface MonteCarloInput {
  heroCards: [Card, Card];
  communityCards: Card[];
  activeOpponents?: number;
  opponents?: OpponentSimulationProfile[];
  simulations?: number;
  seed?: number;
}

export function runMonteCarloSimulation(
  input: MonteCarloInput
): PokerOddsResult | null {
  const { heroCards, communityCards } = input;
  const simulations = input.simulations ?? 3000;
  const opponents =
    input.opponents ??
    Array.from({ length: input.activeOpponents ?? 0 }, (_, index) => ({
      id: `opponent-${index}`,
      name: `Opponent ${index + 1}`,
      style: "unknown" as const,
      rangePercent: 100,
    }));
  const rng = input.seed === undefined ? Math.random : createSeededRandom(input.seed);

  if (!heroCards[0] || !heroCards[1]) return null;
  if (opponents.length < 1 || simulations <= 0) return null;

  const knownCards = [...heroCards, ...communityCards];
  const baseDeck = removeKnownCards(createDeck(), knownCards);

  if (baseDeck.length < opponents.length * 2 + (5 - communityCards.length)) {
    return null;
  }

  let wins = 0;
  let ties = 0;
  let losses = 0;
  let equityUnits = 0;

  for (let i = 0; i < simulations; i++) {
    let deck = shuffleDeck(baseDeck, rng);
    const opponentHands: Card[][] = [];

    for (const opponent of opponents) {
      const [dealt, remaining] = dealRangeWeightedHand(
        deck,
        opponent.rangePercent,
        rng
      );
      opponentHands.push(dealt);
      deck = remaining;
    }

    let board = [...communityCards];
    const cardsNeeded = 5 - board.length;
    if (cardsNeeded > 0) {
      board = [...board, ...deck.slice(0, cardsNeeded)];
    }

    const heroSeven = [...heroCards, ...board].slice(0, 7);
    let tiedOpponents = 0;
    let heroLost = false;

    for (const oppCards of opponentHands) {
      const oppSeven = [...oppCards, ...board].slice(0, 7);
      const result = compareHands(heroSeven, oppSeven);
      if (result < 0) {
        heroLost = true;
        break;
      }
      if (result === 0) tiedOpponents++;
    }

    if (heroLost) {
      losses++;
    } else if (tiedOpponents > 0) {
      ties++;
      equityUnits += 1 / (tiedOpponents + 1);
    } else {
      wins++;
      equityUnits += 1;
    }
  }

  const heroAll = [...heroCards, ...communityCards];
  const bestHand =
    heroAll.length >= 5 ? getBestFiveCardHand(heroAll) : undefined;

  const equityPercentage = (equityUnits / simulations) * 100;
  const probability = equityUnits / simulations;
  const marginOfError = 1.96 * Math.sqrt((probability * (1 - probability)) / simulations) * 100;

  return {
    winPercentage: (wins / simulations) * 100,
    tiePercentage: (ties / simulations) * 100,
    losePercentage: (losses / simulations) * 100,
    equityPercentage,
    marginOfError,
    simulations,
    bestHand,
    boardTexture: analyzeBoardTexture(communityCards),
    rangeSummary: opponents.map(
      (opponent) => `${opponent.name}: ${opponent.style} (~${opponent.rangePercent}% range)`
    ),
  };
}

function dealRangeWeightedHand(
  deck: Card[],
  rangePercent: number,
  rng: () => number
): [Card[], Card[]] {
  const shuffled = shuffleDeck(deck, rng);
  if (rangePercent >= 100) return [shuffled.slice(0, 2), shuffled.slice(2)];

  // Try random candidates first. Falling back to the strongest available pair
  // guarantees progress in short-deck edge cases without an unbounded loop.
  for (let attempt = 0; attempt < 64; attempt++) {
    const first = Math.floor(rng() * deck.length);
    let second = Math.floor(rng() * (deck.length - 1));
    if (second >= first) second++;
    const hand: [Card, Card] = [deck[first], deck[second]];
    if (handFitsRange(hand, rangePercent)) {
      return [hand, deck.filter((_, index) => index !== first && index !== second)];
    }
  }

  let best: [number, number] = [0, 1];
  let bestScore = -1;
  for (let first = 0; first < deck.length - 1; first++) {
    for (let second = first + 1; second < deck.length; second++) {
      const hand: [Card, Card] = [deck[first], deck[second]];
      const score = estimateStartingHandStrength(hand);
      if (score > bestScore) {
        best = [first, second];
        bestScore = score;
      }
    }
  }
  return [
    [deck[best[0]], deck[best[1]]],
    deck.filter((_, index) => index !== best[0] && index !== best[1]),
  ];
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
  if (unique.length < board.length) {
    notes.push("Paired board — set/two-pair risk elevated");
  }

  const straightRanks = unique.includes(14) ? [1, ...unique] : unique;
  for (let i = 0; i < straightRanks.length - 2; i++) {
    if (straightRanks[i + 2] - straightRanks[i] <= 4) {
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
