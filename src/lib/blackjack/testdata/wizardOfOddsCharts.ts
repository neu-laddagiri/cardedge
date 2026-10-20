/**
 * Golden basic-strategy tables used by the strategy tests.
 *
 * Captured on 2026-10-18 from the Wizard of Odds strategy calculator
 * (https://wizardofodds.com/games/blackjack/strategy/calculator/) with
 * American rules (dealer peeks for blackjack) and late surrender allowed.
 * Turning surrender off only replaces each R code with its fallback
 * (Rh -> H, Rs -> S, Rp -> P), which the tests also check.
 *
 * Columns are the dealer upcard: 2 3 4 5 6 7 8 9 10 A.
 * Codes: H hit, S stand, P split, Dh double/else hit, Ds double/else stand,
 * Rh surrender/else hit, Rs surrender/else stand, Rp surrender/else split.
 *
 * These are kept separate from the production chart data on purpose, so the
 * tests catch any accidental edit to src/lib/blackjack/strategyCharts.ts.
 */
export interface ReferenceChart {
  decks: 1 | 2 | 4;
  hitsSoft17: boolean;
  das: boolean;
  table: string;
}

export const REFERENCE_CHARTS: ReferenceChart[] = [
  {
    decks: 1,
    hitsSoft17: false,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  Dh Dh H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  H  H
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  Dh Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    Dh Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  S
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  P  H  H  H
      pair 4     H  H  P  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  P  H  H  H  H
      pair 7     P  P  P  P  P  P  P  H  Rs H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 1,
    hitsSoft17: false,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  Dh Dh H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  H  H
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  Dh Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    Dh Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  S
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  P  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  Dh Dh H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  Rs H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 1,
    hitsSoft17: true,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  Dh Dh H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  H  Rh
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  Dh Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    Dh Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  P  H  H  H
      pair 4     H  H  P  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  P  H  H  H  H
      pair 7     P  P  P  P  P  P  P  H  Rs Rh
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  P
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 1,
    hitsSoft17: true,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  Dh Dh H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  H  Rh
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  Dh Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    Dh Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  P  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  Dh Dh H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  Rs Rh
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 2,
    hitsSoft17: false,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh H
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  S  S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  H  H  H  H
      pair 4     H  H  H  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  P  H  H  H  H
      pair 7     P  P  P  P  P  P  P  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 2,
    hitsSoft17: false,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh H
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  S  S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  H  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  H  H  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 2,
    hitsSoft17: true,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh Rh
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    Ds Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  H  H  H  H
      pair 4     H  H  H  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  P  H  H  H  H
      pair 7     P  P  P  P  P  P  P  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  Rp
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 2,
    hitsSoft17: true,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     Dh Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh Rh
      hard 16    S  S  S  S  S  H  H  H  Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  Dh Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    Ds Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  H  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  H  H  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  Rp
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 4,
    hitsSoft17: false,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     H  Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh H
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh H
      hard 16    S  S  S  S  S  H  H  Rh Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  S  S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  H  H  H  H
      pair 4     H  H  H  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 4,
    hitsSoft17: false,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     H  Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh H
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh H
      hard 16    S  S  S  S  S  H  H  Rh Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  S
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    S  Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  S  S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  H  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  H  H  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     H  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  P
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 4,
    hitsSoft17: true,
    das: true,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     H  Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh Rh
      hard 16    S  S  S  S  S  H  H  Rh Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    Ds Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     P  P  P  P  P  P  H  H  H  H
      pair 3     P  P  P  P  P  P  H  H  H  H
      pair 4     H  H  H  P  P  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     P  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  Rp
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
  {
    decks: 4,
    hitsSoft17: true,
    das: false,
    table: `
      hard 5     H  H  H  H  H  H  H  H  H  H
      hard 6     H  H  H  H  H  H  H  H  H  H
      hard 7     H  H  H  H  H  H  H  H  H  H
      hard 8     H  H  H  H  H  H  H  H  H  H
      hard 9     H  Dh Dh Dh Dh H  H  H  H  H
      hard 10    Dh Dh Dh Dh Dh Dh Dh Dh H  H
      hard 11    Dh Dh Dh Dh Dh Dh Dh Dh Dh Dh
      hard 12    H  H  S  S  S  H  H  H  H  H
      hard 13    S  S  S  S  S  H  H  H  H  H
      hard 14    S  S  S  S  S  H  H  H  H  H
      hard 15    S  S  S  S  S  H  H  H  Rh Rh
      hard 16    S  S  S  S  S  H  H  Rh Rh Rh
      hard 17    S  S  S  S  S  S  S  S  S  Rs
      hard 18    S  S  S  S  S  S  S  S  S  S
      hard 19    S  S  S  S  S  S  S  S  S  S
      hard 20    S  S  S  S  S  S  S  S  S  S
      hard 21    S  S  S  S  S  S  S  S  S  S
      soft 13    H  H  H  Dh Dh H  H  H  H  H
      soft 14    H  H  H  Dh Dh H  H  H  H  H
      soft 15    H  H  Dh Dh Dh H  H  H  H  H
      soft 16    H  H  Dh Dh Dh H  H  H  H  H
      soft 17    H  Dh Dh Dh Dh H  H  H  H  H
      soft 18    Ds Ds Ds Ds Ds S  S  H  H  H
      soft 19    S  S  S  S  Ds S  S  S  S  S
      soft 20    S  S  S  S  S  S  S  S  S  S
      soft 21    S  S  S  S  S  S  S  S  S  S
      pair 2     H  H  P  P  P  P  H  H  H  H
      pair 3     H  H  P  P  P  P  H  H  H  H
      pair 4     H  H  H  H  H  H  H  H  H  H
      pair 5     Dh Dh Dh Dh Dh Dh Dh Dh H  H
      pair 6     H  P  P  P  P  H  H  H  H  H
      pair 7     P  P  P  P  P  P  H  H  H  H
      pair 8     P  P  P  P  P  P  P  P  P  Rp
      pair 9     P  P  P  P  P  S  P  P  S  S
      pair 10    S  S  S  S  S  S  S  S  S  S
      pair A     P  P  P  P  P  P  P  P  P  P
    `,
  },
];
