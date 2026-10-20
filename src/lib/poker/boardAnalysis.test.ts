import { describe, expect, it } from "vitest";
import { describeBoardTexture } from "./boardAnalysis";
import { analyzeOpponentThreats } from "./pokerUtils";
import type { Card, Player, Rank, Suit } from "./pokerTypes";

const SUITS: Record<string, Suit> = { c: "clubs", d: "diamonds", h: "hearts", s: "spades" };

/** Parses "As Kd 7h" into cards. */
function cards(text: string): Card[] {
  return text.split(" ").map((token) => ({ rank: token[0] as Rank, suit: SUITS[token[1]] }));
}

function opponent(id: string, name: string, style: Player["style"]): Player {
  return {
    id, name, stack: 100, position: 1, isHero: false, isDealer: false,
    isSmallBlind: false, isBigBlind: false, status: "active", style,
    streetCommitment: 0, totalCommitted: 0,
  };
}

const hero = { ...opponent("hero", "Hero", "unknown"), isHero: true };

describe("board texture", () => {
  it("flags a paired board on the turn and river", () => {
    const paired = "Paired board — sets, trips and full houses are possible";
    expect(describeBoardTexture(cards("Kd Kc 7h 2s"))).toContain(paired);
    expect(describeBoardTexture(cards("Kd Kc 7h 2s 9d"))).toContain(paired);
  });

  it("treats the ace as low for wheel straights", () => {
    const notes = describeBoardTexture(cards("Ad 2c 3h"));
    expect(notes.some((note) => note.startsWith("Connected board"))).toBe(true);
  });

  it("calls three suited cards a possible flush, not a draw", () => {
    expect(describeBoardTexture(cards("Kh 8h 3h"))).toContain("Three to a flush — a flush is possible");
  });

  it("does not talk about draws on the river", () => {
    expect(describeBoardTexture(cards("9h 8h 7h 2c 3d")).join(" ")).not.toMatch(/draw/i);
  });
});

describe("opponent threats", () => {
  it("does not call two distinct ranks a straight draw", () => {
    const threats = analyzeOpponentThreats(cards("7h 7d 8c"), [hero], "hero");
    expect(threats.map((threat) => threat.category)).not.toContain("Possible straight draw");
  });

  it("warns about made flushes with three suited cards", () => {
    const threats = analyzeOpponentThreats(cards("Kh 8h 3h"), [hero], "hero");
    expect(threats.map((threat) => threat.category)).toContain("Possible flush");
  });

  it("keeps entries unique when opponents share a name", () => {
    const players = [hero, opponent("a", "Player", "tight"), opponent("b", "Player", "tight")];
    const threats = analyzeOpponentThreats(cards("Kh 8d 3c"), players, "hero");
    expect(threats.filter((threat) => threat.category.startsWith("Player"))).toHaveLength(2);
    expect(new Set(threats.map((threat) => threat.id)).size).toBe(threats.length);
  });
});
