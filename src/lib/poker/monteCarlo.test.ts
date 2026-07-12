import { describe, expect, it } from "vitest";
import { runMonteCarloSimulation } from "./monteCarlo";
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
