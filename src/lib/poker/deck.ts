import type { Card, Rank, Suit } from "./pokerTypes";

const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    clubs: "♣",
    diamonds: "♦",
    hearts: "♥",
    spades: "♠",
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function removeKnownCards(deck: Card[], known: Card[]): Card[] {
  return deck.filter(
    (card) => !known.some((knownCard) => cardsEqual(card, knownCard))
  );
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(deck: Card[], count: number): [Card[], Card[]] {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return [drawn, remaining];
}

export function validateNoDuplicateCards(cards: Card[]): boolean {
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cardsEqual(cards[i], cards[j])) return false;
    }
  }
  return true;
}

export function getAllRanks(): Rank[] {
  return [...RANKS];
}

export function getAllSuits(): Suit[] {
  return [...SUITS];
}

export { RANKS, SUITS };
