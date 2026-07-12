import type {
  ActionType,
  Card,
  OpponentSimulationProfile,
  OpponentStyle,
  Player,
  PokerAction,
} from "./pokerTypes";

const BASE_RANGE: Record<OpponentStyle, number> = {
  unknown: 100,
  tight: 22,
  loose: 58,
  aggressive: 40,
  passive: 38,
};

const ACTION_MULTIPLIER: Partial<Record<ActionType, number>> = {
  raise: 0.55,
  bet: 0.7,
  call: 0.85,
  "all-in": 0.35,
};

export function buildOpponentProfiles(
  players: Player[],
  heroId: string,
  actions: PokerAction[]
): OpponentSimulationProfile[] {
  return players
    .filter((player) => player.id !== heroId && player.status !== "folded")
    .map((player) => {
      const lastAction = [...actions]
        .reverse()
        .find((action) => action.playerId === player.id);
      const multiplier = lastAction
        ? ACTION_MULTIPLIER[lastAction.type] ?? 1
        : 1;
      return {
        id: player.id,
        name: player.name,
        style: player.style,
        rangePercent: Math.max(
          5,
          Math.min(
            100,
            Math.round((player.rangeOverride ?? BASE_RANGE[player.style]) * multiplier)
          )
        ),
      };
    });
}

function rankValue(card: Card): number {
  const ranks = "23456789TJQKA";
  return ranks.indexOf(card.rank) + 2;
}

/**
 * Fast, intentionally transparent preflop strength approximation. It is not a
 * solver chart; it only weights Monte Carlo sampling toward plausible ranges.
 */
export function estimateStartingHandStrength(cards: [Card, Card]): number {
  const [a, b] = cards;
  const high = Math.max(rankValue(a), rankValue(b));
  const low = Math.min(rankValue(a), rankValue(b));
  const pair = high === low;
  const suited = a.suit === b.suit;
  const gap = Math.max(0, high - low - 1);

  let score = high / 14;
  if (pair) score += 0.42 + high / 35;
  if (suited) score += 0.08;
  if (gap === 0) score += 0.08;
  else if (gap === 1) score += 0.04;
  else score -= Math.min(0.16, gap * 0.025);
  if (high >= 11 && low >= 10) score += 0.1;
  return Math.max(0, Math.min(1, score / 1.55));
}

export function handFitsRange(cards: [Card, Card], rangePercent: number): boolean {
  if (rangePercent >= 100) return true;
  const threshold = 0.92 - (rangePercent / 100) * 0.9;
  return estimateStartingHandStrength(cards) >= threshold;
}
