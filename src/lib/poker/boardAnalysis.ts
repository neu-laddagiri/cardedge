import { rankValue } from "./deck";
import type { Card } from "./pokerTypes";

export interface BoardFeatures {
  size: number;
  /** No more cards to come, so there are no draws left. */
  isRiver: boolean;
  /** Most cards of any one suit. */
  maxSuitCount: number;
  /** Most cards of any one rank (2 = paired, 3 = trips). */
  maxRankCount: number;
  /** How many different ranks appear at least twice. */
  pairedRanks: number;
  /** Most distinct ranks inside any five-rank window; the ace counts high and low. */
  straightDensity: number;
  /** Ten or higher. */
  highCards: number;
  /** Highest rank on the board, 2–14 (0 when empty). */
  topRank: number;
}

export function analyzeBoard(board: Card[]): BoardFeatures {
  const suitCounts = new Map<string, number>();
  const rankCounts = new Map<number, number>();
  for (const card of board) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1);
    const value = rankValue(card.rank);
    rankCounts.set(value, (rankCounts.get(value) ?? 0) + 1);
  }

  const values = new Set(rankCounts.keys());
  if (values.has(14)) values.add(1); // wheel: A-2-3-4-5
  let straightDensity = 0;
  for (let low = 1; low <= 10; low++) {
    let inWindow = 0;
    for (let v = low; v < low + 5; v++) if (values.has(v)) inWindow++;
    straightDensity = Math.max(straightDensity, inWindow);
  }

  const counts = [...rankCounts.values()];
  return {
    size: board.length,
    isRiver: board.length === 5,
    maxSuitCount: Math.max(0, ...suitCounts.values()),
    maxRankCount: Math.max(0, ...counts),
    pairedRanks: counts.filter((n) => n >= 2).length,
    straightDensity,
    highCards: board.filter((c) => rankValue(c.rank) >= 10).length,
    topRank: Math.max(0, ...rankCounts.keys()),
  };
}

/** Short notes about the board, worded for the current street. */
export function describeBoardTexture(board: Card[]): string[] {
  if (board.length === 0) return ["Preflop — no board texture yet"];

  const f = analyzeBoard(board);
  const notes: string[] = [];

  if (f.maxSuitCount === 5) notes.push("Five-card flush on board — everyone plays at least a flush");
  else if (f.maxSuitCount === 4) notes.push("Four to a flush — one card of that suit makes a flush");
  else if (f.maxSuitCount === 3) notes.push("Three to a flush — a flush is possible");
  else if (f.maxSuitCount === 2 && !f.isRiver) notes.push("Two-tone — flush draws are possible");

  if (f.maxRankCount >= 3) notes.push("Trips on board — full houses and quads are possible");
  else if (f.pairedRanks >= 2) notes.push("Double-paired board — full houses are possible");
  else if (f.pairedRanks === 1) notes.push("Paired board — sets, trips and full houses are possible");

  if (f.straightDensity >= 4) {
    notes.push("Four to a straight — a single card makes a straight");
  } else if (f.straightDensity === 3) {
    notes.push(
      f.isRiver
        ? "Connected board — straights are possible"
        : "Connected board — straights and straight draws are likely"
    );
  }

  if (f.highCards >= 2) notes.push("High-card board — top-pair and two-pair hands are common");

  if (notes.length === 0) {
    notes.push(f.isRiver ? "Dry board — few strong hands are possible" : "Dry board — few obvious draws");
  }
  return notes;
}
