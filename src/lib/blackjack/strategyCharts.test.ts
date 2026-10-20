import { describe, expect, it } from "vitest";
import type {
  BJCard,
  BJRank,
  BlackjackHand,
  BlackjackMove,
  BlackjackRules,
} from "./blackjackTypes";
import { getBlackjackRecommendation } from "./recommendations";
import { REFERENCE_CHARTS } from "./testdata/wizardOfOddsCharts";

const DEALER_UPCARDS: BJRank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"];

// Two-card, non-pair hands for each hard total. 20 and 21 can't be made that
// way without a pair or a blackjack, so they use three cards.
const HARD_HANDS: Record<number, BJRank[]> = {
  5: ["2", "3"],
  6: ["2", "4"],
  7: ["2", "5"],
  8: ["2", "6"],
  9: ["2", "7"],
  10: ["2", "8"],
  11: ["2", "9"],
  12: ["2", "T"],
  13: ["3", "T"],
  14: ["4", "T"],
  15: ["5", "T"],
  16: ["6", "T"],
  17: ["7", "T"],
  18: ["8", "T"],
  19: ["9", "T"],
  20: ["T", "6", "4"],
  21: ["T", "6", "5"],
};

type Code = "H" | "S" | "P" | "Dh" | "Ds" | "Rh" | "Rs" | "Rp";

const PRIMARY: Record<Code, BlackjackMove> = {
  H: "hit",
  S: "stand",
  P: "split",
  Dh: "double",
  Ds: "double",
  Rh: "surrender",
  Rs: "surrender",
  Rp: "surrender",
};

// What the code means when doubling and surrender are unavailable.
const WITHOUT_DOUBLE_OR_SURRENDER: Record<Code, BlackjackMove> = {
  H: "hit",
  S: "stand",
  P: "split",
  Dh: "hit",
  Ds: "stand",
  Rh: "hit",
  Rs: "stand",
  Rp: "split",
};

function cards(ranks: BJRank[]): BJCard[] {
  return ranks.map((rank) => ({ rank, suit: "spades" }));
}

function hand(ranks: BJRank[]): BlackjackHand {
  return { id: "h", cards: cards(ranks), status: "active", isSplit: false, bet: 25 };
}

function rules(decks: BlackjackRules["numDecks"], hitsSoft17: boolean, das: boolean): BlackjackRules {
  return {
    numDecks: decks,
    dealerHitsSoft17: hitsSoft17,
    doubleAfterSplit: das,
    surrenderAllowed: true,
    blackjackPayout: "3:2",
  };
}

function handFor(kind: string, label: string): BJRank[] {
  if (kind === "hard") return HARD_HANDS[Number(label)];
  if (kind === "soft") {
    const total = Number(label);
    // Soft 21 as two cards is a natural, so build it from three.
    return total === 21 ? ["A", "5", "5"] : ["A", String(total - 11) as BJRank];
  }
  const rank = (label === "10" ? "T" : label) as BJRank;
  return [rank, rank];
}

function parse(table: string) {
  return table
    .trim()
    .split("\n")
    .map((line) => {
      const [kind, label, ...codes] = line.trim().split(/\s+/);
      return { kind, label, codes: codes as Code[] };
    });
}

describe.each(REFERENCE_CHARTS)(
  "basic strategy: $decks deck(s), hitsSoft17=$hitsSoft17, DAS=$das",
  ({ decks, hitsSoft17, das, table }) => {
    // 4 stands for "4 or more" in the reference; check every multi-deck size.
    const deckSizes: BlackjackRules["numDecks"][] = decks === 4 ? [4, 6, 8] : [decks];
    const rows = parse(table);

    it("has 36 rows of 10 dealer columns", () => {
      expect(rows).toHaveLength(36);
      for (const row of rows) expect(row.codes).toHaveLength(10);
    });

    for (const numDecks of deckSizes) {
      it(`matches every cell with all options available (${numDecks} decks)`, () => {
        const mismatches: string[] = [];
        for (const { kind, label, codes } of rows) {
          const ranks = handFor(kind, label);
          const twoCards = ranks.length === 2;
          codes.forEach((code, i) => {
            const rec = getBlackjackRecommendation({
              hand: hand(ranks),
              dealerUpcard: { rank: DEALER_UPCARDS[i], suit: "hearts" },
              rules: rules(numDecks, hitsSoft17, das),
              canDouble: twoCards,
              canSplit: kind === "pair",
              canSurrender: twoCards,
            });
            const expected = twoCards ? PRIMARY[code] : WITHOUT_DOUBLE_OR_SURRENDER[code];
            if (rec?.move !== expected) {
              mismatches.push(`${kind} ${label} vs ${DEALER_UPCARDS[i]}: got ${rec?.move}, expected ${expected} (${code})`);
            }
          });
        }
        expect(mismatches).toEqual([]);
      });

      it(`falls back correctly without double or surrender (${numDecks} decks)`, () => {
        const mismatches: string[] = [];
        for (const { kind, label, codes } of rows) {
          const ranks = handFor(kind, label);
          codes.forEach((code, i) => {
            const rec = getBlackjackRecommendation({
              hand: hand(ranks),
              dealerUpcard: { rank: DEALER_UPCARDS[i], suit: "hearts" },
              rules: rules(numDecks, hitsSoft17, das),
              canDouble: false,
              canSplit: kind === "pair",
              canSurrender: false,
            });
            const expected = WITHOUT_DOUBLE_OR_SURRENDER[code];
            if (rec?.move !== expected) {
              mismatches.push(`${kind} ${label} vs ${DEALER_UPCARDS[i]}: got ${rec?.move}, expected ${expected} (${code})`);
            }
          });
        }
        expect(mismatches).toEqual([]);
      });
    }
  }
);

describe("basic strategy edge cases", () => {
  const sixDeckH17 = rules(6, true, true);

  it("plays an unsplittable pair as a hard total (8,8 vs 10 -> hit)", () => {
    const rec = getBlackjackRecommendation({
      hand: hand(["8", "8"]),
      dealerUpcard: { rank: "T", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: true,
      canSplit: false,
      canSurrender: false,
    });
    expect(rec?.move).toBe("hit");
  });

  it("plays unsplittable aces as soft 12 (hit)", () => {
    const rec = getBlackjackRecommendation({
      hand: hand(["A", "A"]),
      dealerUpcard: { rank: "6", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: true,
      canSplit: false,
      canSurrender: false,
    });
    expect(rec?.move).toBe("hit");
    expect(rec?.handTotal).toBe("12/2");
  });

  it("treats any 10-value card as a ten for the dealer upcard", () => {
    for (const rank of ["T", "J", "Q", "K"] as BJRank[]) {
      const rec = getBlackjackRecommendation({
        hand: hand(["6", "T"]),
        dealerUpcard: { rank, suit: "clubs" },
        rules: sixDeckH17,
        canDouble: true,
        canSplit: false,
        canSurrender: true,
      });
      expect(rec?.move).toBe("surrender");
    }
  });

  it("names the chart's first choice when it is not available", () => {
    const rec = getBlackjackRecommendation({
      hand: hand(["A", "7"]),
      dealerUpcard: { rank: "4", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    });
    expect(rec?.move).toBe("stand");
    expect(rec?.preferredMove).toBe("double");
  });

  it("reports a natural as blackjack and a split 21 as soft 21", () => {
    const natural = getBlackjackRecommendation({
      hand: hand(["A", "K"]),
      dealerUpcard: { rank: "9", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: true,
      canSplit: false,
      canSurrender: true,
    });
    expect(natural?.handType).toBe("blackjack");

    const split21 = getBlackjackRecommendation({
      hand: { ...hand(["A", "K"]), isSplit: true },
      dealerUpcard: { rank: "9", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    });
    expect(split21?.handType).toBe("soft");
    expect(split21?.move).toBe("stand");
  });

  it("writes soft totals as a single number in the explanation", () => {
    const rec = getBlackjackRecommendation({
      hand: hand(["A", "6"]),
      dealerUpcard: { rank: "4", suit: "clubs" },
      rules: sixDeckH17,
      canDouble: true,
      canSplit: false,
      canSurrender: true,
    });
    expect(rec?.explanation).toContain("Soft 17");
    expect(rec?.explanation).not.toContain("17/7");
  });
});
