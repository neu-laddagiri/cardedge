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
