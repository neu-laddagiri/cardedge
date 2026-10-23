import { describe, expect, it } from "vitest";
import {
  analyzeOpponentThreats,
  buildRecommendation,
  cardKey,
  formatActionLabel,
  formatStreet,
  getPotOddsFormula,
  getUsedCards,
} from "./pokerUtils";
import type { Card, Player, PokerGameState } from "./pokerTypes";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

function player(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id, name: id, stack: 100, position: 1, isHero: false, isDealer: false,
    isSmallBlind: false, isBigBlind: false, status: "active", style: "unknown",
    streetCommitment: 0, totalCommitted: 0, ...overrides,
  };
}

describe("pot odds formula", () => {
  it("shows cents without floating-point noise", () => {
    expect(getPotOddsFormula(0.2, 0.1)).toBe("$0.20 / ($0.10 + $0.20) = $0.20/$0.30");
    expect(getPotOddsFormula(5, 10)).toBe("$5 / ($10 + $5) = $5/$15");
  });

  it("says when there is nothing to call", () => {
    expect(getPotOddsFormula(0, 12)).toBe("No call required");
  });
});

describe("small formatters", () => {
  it("labels streets, actions and cards", () => {
    expect(formatStreet("turn")).toBe("Turn");
    expect(formatActionLabel("raise", 2.5)).toBe("raise $2.50");
    expect(formatActionLabel("check")).toBe("check");
    expect(formatActionLabel("fold", 3)).toBe("fold");
    expect(cardKey(card("T", "hearts"))).toBe("T-hearts");
  });

  it("lists the known cards in play", () => {
    const community: PokerGameState["communityCards"] = {
      flop1: card("K", "diamonds"), flop2: card("7", "clubs"), flop3: card("2", "spades"), turn: null, river: null,
    };
    expect(getUsedCards([card("A", "spades"), null], community)).toEqual([
      card("A", "spades"), card("K", "diamonds"), card("7", "clubs"), card("2", "spades"),
    ]);
  });

  it("has no advice without odds", () => {
    expect(buildRecommendation(null, {} as PokerGameState)).toBeNull();
  });
});

describe("opponent threat notes", () => {
  const hero = player("hero", { isHero: true });

  it("covers preflop with a single range note", () => {
    expect(analyzeOpponentThreats([], [hero], "hero").map((threat) => threat.id)).toEqual(["preflop"]);
  });

  it("explains four-flush and low boards", () => {
    const threats = analyzeOpponentThreats(
      [card("9", "hearts"), card("6", "hearts"), card("4", "hearts"), card("2", "hearts")],
      [hero],
      "hero"
    );
    expect(threats.find((threat) => threat.id === "flush")?.description).toMatch(/^4 cards of one suit/);
    expect(threats.map((threat) => threat.id)).toContain("overpair");
  });

  it("adds style notes for live opponents only", () => {
    const players = [
      hero,
      player("loose", { style: "loose" }),
      player("aggressive", { style: "aggressive" }),
      player("passive", { style: "passive" }),
      player("folded", { style: "tight", status: "folded" }),
      player("unknown"),
    ];
    const threats = analyzeOpponentThreats([card("K", "spades"), card("8", "diamonds"), card("3", "clubs")], players, "hero");
    expect(threats.filter((threat) => threat.id.startsWith("style-")).map((threat) => threat.id)).toEqual([
      "style-loose", "style-aggressive", "style-passive",
    ]);
  });
});
