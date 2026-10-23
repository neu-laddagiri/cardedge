import type { BJCard, BJRank, BJSuit, BlackjackHand, BlackjackPlayer } from "./blackjackTypes";

export interface QuickRank {
  rank: BJRank;
  /** Text on the key. */
  label: string;
  /** Accessible name. Starts with the key text so speech input still matches it. */
  name: string;
}

export const QUICK_RANKS: readonly QuickRank[] = [
  { rank: "A", label: "A", name: "Ace" },
  { rank: "2", label: "2", name: "2" },
  { rank: "3", label: "3", name: "3" },
  { rank: "4", label: "4", name: "4" },
  { rank: "5", label: "5", name: "5" },
  { rank: "6", label: "6", name: "6" },
  { rank: "7", label: "7", name: "7" },
  { rank: "8", label: "8", name: "8" },
  { rank: "9", label: "9", name: "9" },
  { rank: "T", label: "10", name: "10" },
  { rank: "J", label: "J", name: "Jack" },
  { rank: "Q", label: "Q", name: "Queen" },
  { rank: "K", label: "K", name: "King" },
];

export const SUIT_ROTATION: readonly BJSuit[] = ["spades", "hearts", "diamonds", "clubs"];

export type PlayerCardMove = "deal" | "hit" | "double";

export function collectTableCards(players: readonly BlackjackPlayer[], dealerCards: readonly BJCard[]): BJCard[] {
  return [
    ...dealerCards,
    ...players.flatMap((player) => player.hands.flatMap((hand) => hand.cards)),
  ];
}

/**
 * Gives a rank-only tap a suit. Suits rotate ♠♥♦♣ as cards reach the table, skipping any
 * rank-and-suit the shoe has used up so the store's shoe check accepts the card. Returns
 * null when every copy of the rank is already on the table.
 */
export function autoSuitCard(rank: BJRank, tableCards: readonly BJCard[], numDecks: number): BJCard | null {
  const start = tableCards.length % SUIT_ROTATION.length;
  for (let offset = 0; offset < SUIT_ROTATION.length; offset++) {
    const suit = SUIT_ROTATION[(start + offset) % SUIT_ROTATION.length];
    const used = tableCards.filter((card) => card.rank === rank && card.suit === suit).length;
    if (used < numDecks) return { rank, suit };
  }
  return null;
}

/** The first two cards of a hand are dealt; later cards are hits unless Double is armed. */
export function playerCardMove(hand: Pick<BlackjackHand, "cards">, doubleArmed: boolean): PlayerCardMove {
  if (doubleArmed) return "double";
  return hand.cards.length < 2 ? "deal" : "hit";
}

export function rankName(rank: BJRank): string {
  return QUICK_RANKS.find((key) => key.rank === rank)?.name ?? rank;
}
