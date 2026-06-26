import type { BJCard, BJRank } from "./blackjackTypes";

const RANK_VALUES: Record<BJRank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  T: 10, J: 10, Q: 10, K: 10, A: 11,
};

export function getHandValue(cards: BJCard[]): { hard: number; soft: number } {
  let hard = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      hard += 11;
    } else {
      hard += RANK_VALUES[card.rank];
    }
  }

  while (hard > 21 && aces > 0) {
    hard -= 10;
    aces--;
  }

  const soft = aces > 0 && hard <= 21 ? hard : hard;

  return { hard, soft };
}

export function getBestTotal(cards: BJCard[]): number {
  return getHandValue(cards).hard;
}

export function isSoftHand(cards: BJCard[]): boolean {
  if (cards.length === 0) return false;
  let value = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      value += 11;
    } else {
      value += RANK_VALUES[card.rank];
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return aces > 0;
}

export function isPair(cards: BJCard[]): boolean {
  if (cards.length !== 2) return false;
  return RANK_VALUES[cards[0].rank] === RANK_VALUES[cards[1].rank];
}

export function isBlackjack(cards: BJCard[]): boolean {
  if (cards.length !== 2) return false;
  const hasAce = cards.some((c) => c.rank === "A");
  const hasTen = cards.some((c) => ["T", "J", "Q", "K"].includes(c.rank));
  return hasAce && hasTen;
}

export function isBust(cards: BJCard[]): boolean {
  return getBestTotal(cards) > 21;
}

export function getDisplayTotal(cards: BJCard[]): string {
  if (cards.length === 0) return "—";
  const { hard } = getHandValue(cards);
  if (isSoftHand(cards)) {
    const low = hard - 10;
    if (low > 0 && low !== hard) return `${hard}/${low}`;
  }
  return String(hard);
}

export function dealerRankValue(rank: BJRank): number {
  if (rank === "A") return 11;
  return RANK_VALUES[rank];
}

export function cardToDisplay(card: BJCard): string {
  const suitSymbols: Record<BJCard["suit"], string> = {
    clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠",
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function getPairRank(cards: BJCard[]): number {
  if (!isPair(cards)) return 0;
  return RANK_VALUES[cards[0].rank];
}

export function getSoftTotal(cards: BJCard[]): number {
  if (!isSoftHand(cards)) return 0;
  return getBestTotal(cards);
}

export function getHardTotal(cards: BJCard[]): number {
  if (isSoftHand(cards)) return getBestTotal(cards) - 10;
  return getBestTotal(cards);
}
