import type { BlackjackRules } from "./blackjackTypes";

/**
 * Basic strategy chart cells, using the Wizard of Odds notation:
 * H hit, S stand, P split, Dh double (else hit), Ds double (else stand),
 * Rh surrender (else hit), Rs surrender (else stand), Rp surrender (else split).
 */
export type StrategyCode = "H" | "S" | "P" | "Dh" | "Ds" | "Rh" | "Rs" | "Rp";

/** Dealer upcard columns in chart order; 10 covers T/J/Q/K and 11 is the ace. */
export const DEALER_COLUMNS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

type DeckBucket = "1" | "2" | "4+";
type SoftRule = "S17" | "H17";
type TotalsKey = `${DeckBucket}-${SoftRule}`;
type PairsKey = `${TotalsKey}-${"DAS" | "NDAS"}`;

/*
 * Source: Wizard of Odds blackjack strategy calculator
 * (https://wizardofodds.com/games/blackjack/strategy/calculator/), American
 * rules (dealer peeks), late surrender. Verified cell-for-cell against
 * src/lib/blackjack/testdata/wizardOfOddsCharts.ts by basicStrategy.test.ts.
 *
 * Hard and soft totals only depend on the deck count and the soft-17 rule;
 * double-after-split only changes the pair rows. Columns: 2 3 4 5 6 7 8 9 10 A.
 */
const TOTALS: Record<TotalsKey, string> = {
  "1-S17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  Dh Dh H  H  H  H  H
    hard 9   Dh Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  H  H
    hard 16  S  S  S  S  S  H  H  H  Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  S
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  Dh Dh Dh H  H  H  H  H
    soft 14  H  H  Dh Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  Dh Dh Dh Dh Dh H  H  H  H  H
    soft 18  S  Ds Ds Ds Ds S  S  H  H  S
    soft 19  S  S  S  S  Ds S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
  "1-H17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  Dh Dh H  H  H  H  H
    hard 9   Dh Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  H  Rh
    hard 16  S  S  S  S  S  H  H  H  Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  Rs
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  Dh Dh Dh H  H  H  H  H
    soft 14  H  H  Dh Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  Dh Dh Dh Dh Dh H  H  H  H  H
    soft 18  S  Ds Ds Ds Ds S  S  H  H  H
    soft 19  S  S  S  S  Ds S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
  "2-S17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  H  H  H  H  H  H  H
    hard 9   Dh Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  Rh H
    hard 16  S  S  S  S  S  H  H  H  Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  S
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  H  Dh Dh H  H  H  H  H
    soft 14  H  H  H  Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  H  Dh Dh Dh Dh H  H  H  H  H
    soft 18  S  Ds Ds Ds Ds S  S  H  H  H
    soft 19  S  S  S  S  S  S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
  "2-H17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  H  H  H  H  H  H  H
    hard 9   Dh Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  Rh Rh
    hard 16  S  S  S  S  S  H  H  H  Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  Rs
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  H  Dh Dh H  H  H  H  H
    soft 14  H  H  Dh Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  H  Dh Dh Dh Dh H  H  H  H  H
    soft 18  Ds Ds Ds Ds Ds S  S  H  H  H
    soft 19  S  S  S  S  Ds S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
  "4+-S17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  H  H  H  H  H  H  H
    hard 9   H  Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh H
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  Rh H
    hard 16  S  S  S  S  S  H  H  Rh Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  S
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  H  Dh Dh H  H  H  H  H
    soft 14  H  H  H  Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  H  Dh Dh Dh Dh H  H  H  H  H
    soft 18  S  Ds Ds Ds Ds S  S  H  H  H
    soft 19  S  S  S  S  S  S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
  "4+-H17": `
    hard 5   H  H  H  H  H  H  H  H  H  H
    hard 6   H  H  H  H  H  H  H  H  H  H
    hard 7   H  H  H  H  H  H  H  H  H  H
    hard 8   H  H  H  H  H  H  H  H  H  H
    hard 9   H  Dh Dh Dh Dh H  H  H  H  H
    hard 10  Dh Dh Dh Dh Dh Dh Dh Dh H  H
    hard 11  Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
    hard 12  H  H  S  S  S  H  H  H  H  H
    hard 13  S  S  S  S  S  H  H  H  H  H
    hard 14  S  S  S  S  S  H  H  H  H  H
    hard 15  S  S  S  S  S  H  H  H  Rh Rh
    hard 16  S  S  S  S  S  H  H  Rh Rh Rh
    hard 17  S  S  S  S  S  S  S  S  S  Rs
    hard 18  S  S  S  S  S  S  S  S  S  S
    hard 19  S  S  S  S  S  S  S  S  S  S
    hard 20  S  S  S  S  S  S  S  S  S  S
    hard 21  S  S  S  S  S  S  S  S  S  S
    soft 13  H  H  H  Dh Dh H  H  H  H  H
    soft 14  H  H  H  Dh Dh H  H  H  H  H
    soft 15  H  H  Dh Dh Dh H  H  H  H  H
    soft 16  H  H  Dh Dh Dh H  H  H  H  H
    soft 17  H  Dh Dh Dh Dh H  H  H  H  H
    soft 18  Ds Ds Ds Ds Ds S  S  H  H  H
    soft 19  S  S  S  S  Ds S  S  S  S  S
    soft 20  S  S  S  S  S  S  S  S  S  S
    soft 21  S  S  S  S  S  S  S  S  S  S
  `,
};

const PAIRS: Record<PairsKey, string> = {
  "1-S17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  P  H  H  H
    pair 4   H  H  P  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  P  H  H  H  H
    pair 7   P  P  P  P  P  P  P  H  Rs H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "1-S17-NDAS": `
    pair 2   H  P  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  Dh Dh H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  Rs H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "1-H17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  P  H  H  H
    pair 4   H  H  P  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  P  H  H  H  H
    pair 7   P  P  P  P  P  P  P  H  Rs Rh
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  P
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "1-H17-NDAS": `
    pair 2   H  P  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  Dh Dh H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  Rs Rh
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "2-S17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  H  H  H  H
    pair 4   H  H  H  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  P  H  H  H  H
    pair 7   P  P  P  P  P  P  P  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "2-S17-NDAS": `
    pair 2   H  H  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  H  H  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "2-H17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  H  H  H  H
    pair 4   H  H  H  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  P  H  H  H  H
    pair 7   P  P  P  P  P  P  P  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  Rp
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "2-H17-NDAS": `
    pair 2   H  H  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  H  H  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  Rp
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "4+-S17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  H  H  H  H
    pair 4   H  H  H  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "4+-S17-NDAS": `
    pair 2   H  H  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  H  H  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   H  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  P
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "4+-H17-DAS": `
    pair 2   P  P  P  P  P  P  H  H  H  H
    pair 3   P  P  P  P  P  P  H  H  H  H
    pair 4   H  H  H  P  P  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   P  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  Rp
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
  "4+-H17-NDAS": `
    pair 2   H  H  P  P  P  P  H  H  H  H
    pair 3   H  H  P  P  P  P  H  H  H  H
    pair 4   H  H  H  H  H  H  H  H  H  H
    pair 5   Dh Dh Dh Dh Dh Dh Dh Dh H  H
    pair 6   H  P  P  P  P  H  H  H  H  H
    pair 7   P  P  P  P  P  P  H  H  H  H
    pair 8   P  P  P  P  P  P  P  P  P  Rp
    pair 9   P  P  P  P  P  S  P  P  S  S
    pair 10  S  S  S  S  S  S  S  S  S  S
    pair A   P  P  P  P  P  P  P  P  P  P
  `,
};

const CODES = new Set<string>(["H", "S", "P", "Dh", "Ds", "Rh", "Rs", "Rp"]);

function parseRows(text: string): Map<string, StrategyCode[]> {
  const rows = new Map<string, StrategyCode[]>();
  for (const line of text.trim().split("\n")) {
    const [kind, label, ...codes] = line.trim().split(/\s+/);
    if (codes.length !== DEALER_COLUMNS.length || !codes.every((c) => CODES.has(c))) {
      throw new Error(`Malformed strategy row: "${line.trim()}"`);
    }
    rows.set(`${kind} ${label}`, codes as StrategyCode[]);
  }
  return rows;
}

const parsedTotals = new Map<TotalsKey, Map<string, StrategyCode[]>>();
for (const [key, text] of Object.entries(TOTALS)) {
  parsedTotals.set(key as TotalsKey, parseRows(text));
}

const parsedPairs = new Map<PairsKey, Map<string, StrategyCode[]>>();
for (const [key, text] of Object.entries(PAIRS)) {
  parsedPairs.set(key as PairsKey, parseRows(text));
}

function deckBucket(numDecks: BlackjackRules["numDecks"]): DeckBucket {
  if (numDecks === 1) return "1";
  if (numDecks === 2) return "2";
  return "4+";
}

function totalsKey(rules: BlackjackRules): TotalsKey {
  return `${deckBucket(rules.numDecks)}-${rules.dealerHitsSoft17 ? "H17" : "S17"}`;
}

/** Which chart family a deck count uses, e.g. "4+" for a six-deck shoe. */
export function getChartDeckLabel(numDecks: BlackjackRules["numDecks"]): string {
  const bucket = deckBucket(numDecks);
  if (bucket === "1") return "single-deck";
  if (bucket === "2") return "double-deck";
  return "4–8 deck";
}

/**
 * Looks up a chart cell.
 * - `hard`: the hard total (totals below 5 hit, e.g. an unsplit 2,2).
 * - `soft`: the soft total (soft 12, an unsplit A,A, hits).
 * - `pair`: the value of one card of the pair, 2–10 or 11 for aces.
 * `dealer` is the upcard value, 2–10 or 11 for an ace.
 */
export function lookupStrategy(
  chart: "hard" | "soft" | "pair",
  value: number,
  dealer: number,
  rules: BlackjackRules
): StrategyCode {
  const column = DEALER_COLUMNS.indexOf(dealer as (typeof DEALER_COLUMNS)[number]);
  if (column === -1) throw new Error(`Invalid dealer upcard value: ${dealer}`);

  if (chart === "pair") {
    const key: PairsKey = `${totalsKey(rules)}-${rules.doubleAfterSplit ? "DAS" : "NDAS"}`;
    const label = value === 11 ? "A" : String(value);
    const row = parsedPairs.get(key)?.get(`pair ${label}`);
    if (!row) throw new Error(`No pair row for ${label} in ${key}`);
    return row[column];
  }

  if (chart === "hard" && value < 5) return "H";
  if (chart === "soft" && value < 13) return "H";
  const rows = parsedTotals.get(totalsKey(rules));
  const row = rows?.get(`${chart} ${Math.min(value, 21)}`);
  if (!row) throw new Error(`No ${chart} row for ${value}`);
  return row[column];
}
