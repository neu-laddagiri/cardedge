import { describe, expect, it } from "vitest";
import {
  amountToCallForHero,
  boardProgressHint,
  sanitizeAmount,
  streetForBoard,
  validateCommunityLayout,
  validatePokerCards,
} from "./validation";
import type { Card, PokerGameState } from "./pokerTypes";

const ace: Card = { rank: "A", suit: "spades" };
const king: Card = { rank: "K", suit: "hearts" };
const queen: Card = { rank: "Q", suit: "clubs" };
const jack: Card = { rank: "J", suit: "diamonds" };
const ten: Card = { rank: "T", suit: "spades" };
const empty = { flop1: null, flop2: null, flop3: null, turn: null, river: null };
const flop = { ...empty, flop1: ace, flop2: king, flop3: queen };

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

  it("rejects out-of-order and partial boards", () => {
    expect(validateCommunityLayout({ ...empty, turn: queen }, "preflop")).toBe("Add all three flop cards before the turn.");
    expect(validateCommunityLayout({ ...flop, river: jack }, "flop")).toBe("Add the turn before the river.");
    expect(validateCommunityLayout({ ...empty, flop1: ace, flop2: king }, "preflop")).toBe("Add all three flop cards to see the flop odds.");
    expect(validateCommunityLayout(flop, "flop")).toBeNull();
  });

  it("still flags a replayed street that its board doesn't match", () => {
    expect(validateCommunityLayout({ ...flop, turn: jack }, "flop")).toMatch(/future-street/);
    expect(validateCommunityLayout(flop, "turn")).toMatch(/missing community card 4/);
  });

  it("derives the street from the board", () => {
    expect(streetForBoard(empty)).toBe("preflop");
    expect(streetForBoard({ ...empty, flop1: ace, flop2: king })).toBe("preflop");
    expect(streetForBoard(flop)).toBe("flop");
    expect(streetForBoard({ ...flop, turn: jack })).toBe("turn");
    expect(streetForBoard({ ...flop, turn: jack, river: ten })).toBe("river");
    // A river with no turn doesn't skip ahead.
    expect(streetForBoard({ ...flop, river: ten })).toBe("flop");
  });

  it("prompts for the next board cards", () => {
    expect(boardProgressHint(empty)).toBe("Add the three flop cards to move to the flop.");
    expect(boardProgressHint({ ...empty, flop1: ace })).toBe("Add 2 more flop cards to move to the flop.");
    expect(boardProgressHint({ ...empty, flop1: ace, flop2: king })).toBe("Add 1 more flop card to move to the flop.");
    expect(boardProgressHint(flop)).toBe("Add the turn card to move to the turn.");
    expect(boardProgressHint({ ...flop, turn: jack, river: ten })).toBe("All five board cards are in.");
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
