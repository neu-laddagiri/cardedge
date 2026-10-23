import { validateNoDuplicateCards } from "./deck";
import type { Card, PokerGameState, Street } from "./pokerTypes";

const REQUIRED_BOARD: Record<Street, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
};

export function validatePokerCards(
  heroCards: [Card | null, Card | null],
  board: Card[],
  street: Street
): string | null {
  const known = [...heroCards.filter((card): card is Card => Boolean(card)), ...board];
  if (!validateNoDuplicateCards(known)) return "A card cannot appear twice in the same hand.";
  const required = REQUIRED_BOARD[street];
  if (board.length !== required) {
    return `${street[0].toUpperCase()}${street.slice(1)} requires exactly ${required} community card${required === 1 ? "" : "s"}.`;
  }
  return null;
}

/** The cards that move the hand on from each street, for prompts and errors. */
export const NEXT_STREET_CARDS: Record<Street, string | null> = {
  preflop: "the flop",
  flop: "the turn",
  turn: "the river",
  river: null,
};

/**
 * The street the board has reached. The flop needs all three flop cards; the turn and river
 * then follow in order. A card placed out of order doesn't move the street.
 */
export function streetForBoard(community: PokerGameState["communityCards"]): Street {
  if (!community.flop1 || !community.flop2 || !community.flop3) return "preflop";
  if (!community.turn) return "flop";
  if (!community.river) return "turn";
  return "river";
}

/** A one-line prompt for the next board card(s) to enter. */
export function boardProgressHint(community: PokerGameState["communityCards"]): string {
  const flopCards = [community.flop1, community.flop2, community.flop3].filter(Boolean).length;
  switch (streetForBoard(community)) {
    case "preflop":
      return flopCards === 0
        ? "Add the three flop cards to move to the flop."
        : `Add ${3 - flopCards} more flop card${flopCards === 2 ? "" : "s"} to move to the flop.`;
    case "flop":
      return "Add the turn card to move to the turn.";
    case "turn":
      return "Add the river card to move to the river.";
    case "river":
      return "All five board cards are in.";
  }
}

export function validateCommunityLayout(
  community: PokerGameState["communityCards"],
  street: Street
): string | null {
  const ordered = [
    community.flop1,
    community.flop2,
    community.flop3,
    community.turn,
    community.river,
  ];
  const flopCards = ordered.slice(0, 3).filter(Boolean).length;
  if (community.turn && flopCards < 3) return "Add all three flop cards before the turn.";
  if (community.river && !community.turn) return "Add the turn before the river.";
  if (flopCards > 0 && flopCards < 3) return "Add all three flop cards to see the flop odds.";

  // The street follows the board, but a replayed hand can carry a street its board doesn't match.
  const required = REQUIRED_BOARD[street];
  for (let index = 0; index < ordered.length; index++) {
    if (index < required && !ordered[index]) {
      return `${street[0].toUpperCase()}${street.slice(1)} is missing community card ${index + 1}.`;
    }
    if (index >= required && ordered[index]) {
      return `Remove future-street cards before simulating the ${street}.`;
    }
  }
  return null;
}

export function sanitizeAmount(value: number, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(0, Math.round(value * 100) / 100));
}

export function amountToCallForHero(state: PokerGameState): number {
  const hero = state.players.find((player) => player.id === state.heroId);
  return hero ? Math.max(0, state.currentBet - hero.streetCommitment) : 0;
}
