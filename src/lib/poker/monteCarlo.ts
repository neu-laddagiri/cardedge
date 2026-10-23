import { Hand } from "pokersolver";
import { describeBoardTexture } from "./boardAnalysis";
import { createDeck, removeKnownCards, shuffleDeck } from "./deck";
import { cardToSolverString, getBestFiveCardHand } from "./handEvaluator";
import { createSeededRandom } from "./random";
import { estimateStartingHandStrength, rangeThreshold } from "./ranges";
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
  const cardsNeeded = 5 - communityCards.length;

  if (baseDeck.length < opponents.length * 2 + cardsNeeded) {
    return null;
  }

  const heroStrings = heroCards.map(cardToSolverString);
  const knownBoard = communityCards.map(cardToSolverString);
  let wins = 0;
  let ties = 0;
  let losses = 0;
  let equityUnits = 0;

  for (let i = 0; i < simulations; i++) {
    let deck = shuffleDeck(baseDeck, rng);
    const opponentHands: Card[][] = [];

    for (const opponent of opponents) {
      const [dealt, remaining] = dealRangeWeightedHand(deck, opponent.rangePercent, rng);
      opponentHands.push(dealt);
      deck = remaining;
    }

    const board = cardsNeeded > 0
      ? knownBoard.concat(deck.slice(0, cardsNeeded).map(cardToSolverString))
      : knownBoard;

    // Solve every hand once and compare them together; tied winners split the pot.
    const hero = Hand.solve(heroStrings.concat(board));
    const hands = [
      hero,
      ...opponentHands.map((cards) => Hand.solve(cards.map(cardToSolverString).concat(board))),
    ];
    const winners = Hand.winners(hands);

    if (!winners.includes(hero)) {
      losses++;
    } else if (winners.length === 1) {
      wins++;
      equityUnits += 1;
    } else {
      ties++;
      equityUnits += 1 / winners.length;
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
    boardTexture: describeBoardTexture(communityCards),
    rangeSummary: opponents.map(
      (opponent) => `${opponent.name}: ${opponent.style} (~${opponent.rangePercent}% range)`
    ),
  };
}

/**
 * Deals one opponent two cards from an already-shuffled deck, uniformly at
 * random among the starting hands inside their range. Exported for tests.
 */
export function dealRangeWeightedHand(
  deck: Card[],
  rangePercent: number,
  rng: () => number
): [Card[], Card[]] {
  if (rangePercent >= 100) return [deck.slice(0, 2), deck.slice(2)];

  const threshold = rangeThreshold(rangePercent);
  const strength = (first: number, second: number) =>
    estimateStartingHandStrength([deck[first], deck[second]]);

  // Rejection sampling is uniform over in-range hands and fast for most ranges.
  for (let attempt = 0; attempt < 256; attempt++) {
    const first = Math.floor(rng() * deck.length);
    let second = Math.floor(rng() * (deck.length - 1));
    if (second >= first) second++;
    if (strength(first, second) >= threshold) return take(deck, first, second);
  }

  // Very narrow ranges or heavy card removal: pick uniformly among every
  // in-range hand that is still possible, or the strongest hand left if none are.
  const candidates: [number, number][] = [];
  let best: [number, number] = [0, 1];
  let bestScore = -1;
  for (let first = 0; first < deck.length - 1; first++) {
    for (let second = first + 1; second < deck.length; second++) {
      const score = strength(first, second);
      if (score >= threshold) candidates.push([first, second]);
      if (score > bestScore) {
        best = [first, second];
        bestScore = score;
      }
    }
  }
  const [first, second] = candidates.length
    ? candidates[Math.floor(rng() * candidates.length)]
    : best;
  return take(deck, first, second);
}

function take(deck: Card[], first: number, second: number): [Card[], Card[]] {
  return [
    [deck[first], deck[second]],
    deck.filter((_, index) => index !== first && index !== second),
  ];
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
