import { Hand } from "pokersolver";
import type { Card } from "./pokerTypes";

const SUIT_MAP: Record<Card["suit"], string> = {
  clubs: "c",
  diamonds: "d",
  hearts: "h",
  spades: "s",
};

export function cardToSolverString(card: Card): string {
  return `${card.rank}${SUIT_MAP[card.suit]}`;
}

export function evaluateHand(cards: Card[]): {
  name: string;
  rank: number;
  descr: string;
} {
  if (cards.length < 5) {
    return { name: "Incomplete", rank: 0, descr: "Need at least 5 cards" };
  }

  try {
    const solverCards = cards.map(cardToSolverString);
    const hand = Hand.solve(solverCards, "standard");
    return {
      name: hand.name,
      rank: hand.rank,
      descr: hand.descr,
    };
  } catch {
    return { name: "Unknown", rank: 0, descr: "Could not evaluate" };
  }
}

export function compareHands(
  hand1Cards: Card[],
  hand2Cards: Card[]
): -1 | 0 | 1 {
  try {
    const h1 = Hand.solve(hand1Cards.map(cardToSolverString), "standard");
    const h2 = Hand.solve(hand2Cards.map(cardToSolverString), "standard");
    const winners = Hand.winners([h1, h2]);
    if (winners.length === 2) return 0;
    if (winners[0] === h1) return 1;
    return -1;
  } catch {
    return 0;
  }
}

export function getBestFiveCardHand(allCards: Card[]): string {
  if (allCards.length < 5) return "Incomplete hand";
  const result = evaluateHand(allCards);
  return result.name;
}
