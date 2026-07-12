import { describe, expect, it } from "vitest";
import { getBestTotal, getDisplayTotal, isBlackjack, isBust, isSoftHand } from "./handValue";
import type { BJCard } from "./blackjackTypes";

const cards = (...ranks: BJCard["rank"][]): BJCard[] => ranks.map((rank, index) => ({ rank, suit: (["spades", "hearts", "clubs", "diamonds"] as const)[index % 4] }));

describe("blackjack hand values", () => {
  it("reduces multiple aces without busting", () => {
    expect(getBestTotal(cards("A", "A", "9"))).toBe(21);
    expect(isSoftHand(cards("A", "A", "9"))).toBe(true);
  });

  it("distinguishes blackjack from a three-card 21", () => {
    expect(isBlackjack(cards("A", "K"))).toBe(true);
    expect(isBlackjack(cards("A", "5", "5"))).toBe(false);
  });

  it("detects busts and formats soft totals", () => {
    expect(isBust(cards("K", "Q", "2"))).toBe(true);
    expect(getDisplayTotal(cards("A", "7"))).toBe("18/8");
  });
});
