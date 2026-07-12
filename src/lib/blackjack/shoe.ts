import type { BJCard } from "./blackjackTypes";

function cardKey(card: BJCard): string {
  return `${card.rank}-${card.suit}`;
}

export function validateShoe(cards: BJCard[], numDecks: number): string | null {
  const counts = new Map<string, number>();
  for (const card of cards) {
    const key = cardKey(card);
    const count = (counts.get(key) ?? 0) + 1;
    if (count > numDecks) {
      return `${card.rank} of ${card.suit} appears more than the ${numDecks}-deck shoe allows.`;
    }
    counts.set(key, count);
  }
  return null;
}
