import { describe, expect, it } from "vitest";
import { amountToCallForHero, sanitizeAmount, validateCommunityLayout, validatePokerCards } from "./validation";
import type { Card, PokerGameState } from "./pokerTypes";

const ace: Card = { rank: "A", suit: "spades" };
const king: Card = { rank: "K", suit: "hearts" };
const queen: Card = { rank: "Q", suit: "clubs" };
const jack: Card = { rank: "J", suit: "diamonds" };

describe("poker validation", () => {
  it("validates duplicate and street card counts", () => {
    expect(validatePokerCards([ace, ace], [], "preflop")).toMatch(/twice/);
    expect(validatePokerCards([ace, king], [queen], "flop")).toMatch(/exactly 3/);
    expect(validatePokerCards([ace, king], [queen, jack, { rank: "T", suit: "spades" }], "flop")).toBeNull();
    expect(validatePokerCards([ace, king], [], "preflop")).toBeNull();
  });

  it("sanitizes numeric inputs", () => {
    expect(sanitizeAmount(-5)).toBe(0);
    expect(sanitizeAmount(Number.NaN)).toBe(0);
    expect(sanitizeAmount(12.345)).toBe(12.35);
    expect(sanitizeAmount(200, 100)).toBe(100);
  });

  it("rejects gaps and future-street cards", () => {
    const empty = { flop1: null, flop2: null, flop3: null, turn: null, river: null };
    expect(validateCommunityLayout({ ...empty, turn: queen }, "flop")).toMatch(/missing/);
    expect(validateCommunityLayout({ ...empty, flop1: ace, flop2: king, flop3: queen, turn: jack }, "flop")).toMatch(/future-street/);
    expect(validateCommunityLayout({ ...empty, flop1: ace, flop2: king, flop3: queen }, "flop")).toBeNull();
  });

  it("derives the hero call from commitments", () => {
    const state = {
      heroId: "hero",
      currentBet: 80,
      players: [{ id: "hero", streetCommitment: 30 }],
    } as PokerGameState;
    expect(amountToCallForHero(state)).toBe(50);
    expect(amountToCallForHero({ ...state, heroId: "missing" })).toBe(0);
  });
});
