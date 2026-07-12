import { describe, expect, it } from "vitest";
import { getBasicStrategyDecision } from "./basicStrategy";
import { getBlackjackRecommendation } from "./recommendations";
import type { BJCard, BlackjackRules } from "./blackjackTypes";

const card = (rank: BJCard["rank"], suit: BJCard["suit"] = "spades"): BJCard => ({ rank, suit });
const rules: BlackjackRules = {
  numDecks: 6,
  dealerHitsSoft17: false,
  doubleAfterSplit: true,
  surrenderAllowed: true,
  blackjackPayout: "3:2",
};
const context = { canDouble: true, canSplit: true, canSurrender: true, rules };

describe("blackjack basic strategy", () => {
  it.each([
    [[card("A"), card("A", "hearts")], card("6"), "split"],
    [[card("8"), card("8", "hearts")], card("T"), "split"],
    [[card("T"), card("K", "hearts")], card("6"), "stand"],
    [[card("5"), card("5", "hearts")], card("T"), "hit"],
    [[card("A"), card("7", "hearts")], card("9"), "hit"],
    [[card("T"), card("6", "hearts")], card("9"), "surrender"],
    [[card("T"), card("5", "hearts")], card("9"), "hit"],
  ] as const)("recommends %s against %s", (cards, dealer, expected) => {
    expect(getBasicStrategyDecision([...cards], dealer, context).move).toBe(expected);
  });

  it("changes soft 18 against 2 between H17 and S17", () => {
    const hand = [card("A"), card("7", "hearts")];
    expect(getBasicStrategyDecision(hand, card("2"), context).move).toBe("stand");
    expect(
      getBasicStrategyDecision(hand, card("2"), {
        ...context,
        rules: { ...rules, dealerHitsSoft17: true },
      }).move
    ).toBe("double");
  });

  it("returns an explicit fallback when doubling is unavailable", () => {
    const decision = getBasicStrategyDecision(
      [card("6"), card("5", "hearts")],
      card("6"),
      { ...context, canDouble: false }
    );
    expect(decision).toEqual({ move: "hit", preferredMove: "double" });
  });

  it("labels 6:5 payout as informational", () => {
    const recommendation = getBlackjackRecommendation({
      hand: { id: "h1", cards: [card("T"), card("K", "hearts")], status: "active", isSplit: false, bet: 25 },
      dealerUpcard: card("6"),
      rules: { ...rules, blackjackPayout: "6:5" },
      canDouble: true,
      canSplit: true,
      canSurrender: true,
    });
    expect(recommendation?.ruleNotes.join(" ")).toContain("payout affects return");
  });

  it.each([
    [[card("9"), card("9", "hearts")], card("7"), "stand"],
    [[card("7"), card("7", "hearts")], card("7"), "split"],
    [[card("6"), card("6", "hearts")], card("2"), "split"],
    [[card("4"), card("4", "hearts")], card("6"), "split"],
    [[card("3"), card("3", "hearts")], card("8"), "hit"],
    [[card("A"), card("8", "hearts")], card("6"), "stand"],
    [[card("A"), card("6", "hearts")], card("5"), "double"],
    [[card("A"), card("3", "hearts")], card("6"), "double"],
    [[card("T"), card("2", "hearts")], card("4"), "stand"],
    [[card("6"), card("3", "hearts")], card("4"), "double"],
  ] as const)("covers additional strategy-table branches", (cards, dealer, expected) => {
    expect(getBasicStrategyDecision([...cards], dealer, context).move).toBe(expected);
  });

  it("changes low-deck hard 9 behavior and respects no-DAS pair rules", () => {
    const lowDeck = { ...rules, numDecks: 2 as const };
    expect(getBasicStrategyDecision([card("5"), card("4", "hearts")], card("2"), { ...context, rules: lowDeck }).move).toBe("double");
    expect(getBasicStrategyDecision([card("2"), card("2", "hearts")], card("2"), {
      ...context,
      rules: { ...rules, doubleAfterSplit: false },
    }).move).toBe("hit");
  });
});
