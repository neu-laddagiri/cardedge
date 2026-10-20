import { describe, expect, it } from "vitest";
import { dealRangeWeightedHand, runMonteCarloSimulation } from "./monteCarlo";
import type { Card } from "./pokerTypes";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("Monte Carlo simulation", () => {
  it("is deterministic with a seed and returns coherent percentages", () => {
    const input = {
      heroCards: [card("A", "spades"), card("A", "hearts")] as [Card, Card],
      communityCards: [] as Card[],
      activeOpponents: 1,
      simulations: 500,
      seed: 42,
    };
    const first = runMonteCarloSimulation(input);
    const second = runMonteCarloSimulation(input);
    expect(first).toEqual(second);
    expect((first?.winPercentage ?? 0) + (first?.tiePercentage ?? 0) + (first?.losePercentage ?? 0)).toBeCloseTo(100, 8);
    expect(first?.equityPercentage).toBeGreaterThan(50);
    expect(first?.marginOfError).toBeGreaterThan(0);
  });

  it("matches known equities against random hands", () => {
    const aces = runMonteCarloSimulation({
      heroCards: [card("A", "spades"), card("A", "hearts")],
      communityCards: [],
      activeOpponents: 1,
      simulations: 4000,
      seed: 11,
    });
    // Pocket aces win about 85% heads-up against a random hand.
    expect(aces?.equityPercentage).toBeGreaterThan(83);
    expect(aces?.equityPercentage).toBeLessThan(88);
  });

  it("counts a split pot as a share of the pot", () => {
    // A royal flush on board: everyone plays the board and chops.
    const royal = [card("A", "spades"), card("K", "spades"), card("Q", "spades"), card("J", "spades"), card("T", "spades")];
    const common = { heroCards: [card("2", "clubs"), card("3", "diamonds")] as [Card, Card], communityCards: royal, simulations: 300, seed: 3 };
    expect(runMonteCarloSimulation({ ...common, activeOpponents: 1 })?.equityPercentage).toBeCloseTo(50, 6);
    expect(runMonteCarloSimulation({ ...common, activeOpponents: 3 })?.equityPercentage).toBeCloseTo(25, 6);
  });

  it("gives a made nut flush on the river every pot", () => {
    const result = runMonteCarloSimulation({
      heroCards: [card("A", "hearts"), card("2", "hearts")],
      communityCards: [card("K", "hearts"), card("9", "hearts"), card("5", "hearts"), card("3", "clubs"), card("8", "diamonds")],
      activeOpponents: 3,
      simulations: 300,
      seed: 5,
    });
    expect(result?.equityPercentage).toBe(100);
    expect(result?.bestHand).toBe("Flush");
  });

  it("weights tight opponent ranges differently", () => {
    const common = {
      heroCards: [card("A", "spades"), card("K", "spades")] as [Card, Card],
      communityCards: [] as Card[],
      simulations: 600,
      seed: 7,
    };
    const random = runMonteCarloSimulation({ ...common, opponents: [{ id: "v", name: "V", style: "unknown", rangePercent: 100 }] });
    const tight = runMonteCarloSimulation({ ...common, opponents: [{ id: "v", name: "V", style: "tight", rangePercent: 15 }] });
    expect(random?.equityPercentage).not.toBe(tight?.equityPercentage);
  });
});

describe("range-weighted dealing", () => {
  // An RNG stuck at 0 draws the same first two cards on every attempt.
  const stuck = () => 0;

  it("finds an in-range hand when random draws keep missing", () => {
    const deck = [card("7", "clubs"), card("2", "diamonds"), card("A", "spades"), card("A", "hearts"), card("4", "clubs")];
    const [hand, rest] = dealRangeWeightedHand(deck, 5, stuck);
    expect(hand).toEqual([card("A", "spades"), card("A", "hearts")]);
    expect(rest).toEqual([card("7", "clubs"), card("2", "diamonds"), card("4", "clubs")]);
  });

  it("deals the strongest hand left when nothing in the range remains", () => {
    const deck = [card("7", "clubs"), card("2", "diamonds"), card("9", "spades"), card("8", "spades")];
    const [hand, rest] = dealRangeWeightedHand(deck, 5, stuck);
    expect(hand).toEqual([card("9", "spades"), card("8", "spades")]);
    expect(rest).toHaveLength(2);
  });

  it("takes the top two cards for a full range", () => {
    const deck = [card("7", "clubs"), card("2", "diamonds"), card("9", "spades")];
    expect(dealRangeWeightedHand(deck, 100, stuck)).toEqual([[deck[0], deck[1]], [deck[2]]]);
  });
});
