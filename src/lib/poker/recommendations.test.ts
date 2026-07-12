import { describe, expect, it } from "vitest";
import { calculatePotOdds, recommendPokerAction } from "./recommendations";
import type { PokerGameState } from "./pokerTypes";

const state: PokerGameState = {
  players: [], heroId: null, smallBlind: 10, bigBlind: 20, startingBuyIn: 2000,
  pot: 100, currentBet: 50, amountToCall: 50, street: "flop",
  actingPlayerId: null, actedPlayerIds: [], handComplete: false,
  heroCards: [null, null],
  communityCards: { flop1: null, flop2: null, flop3: null, turn: null, river: null },
  actions: [],
};

describe("poker recommendations", () => {
  it("calculates break-even pot odds", () => {
    expect(calculatePotOdds(50, 100)).toBeCloseTo(33.333, 2);
    expect(calculatePotOdds(0, 100)).toBe(0);
  });

  it("folds only when the uncertainty interval is below break-even", () => {
    expect(recommendPokerAction(25, 33.3, state, 2).action).toBe("fold");
    expect(recommendPokerAction(32, 33.3, state, 3).action).toBe("call");
  });

  it("raises clear value advantages", () => {
    expect(recommendPokerAction(65, 33.3, state, 2).action).toBe("raise");
  });

  it("checks without a wager and varies value confidence", () => {
    const free = { ...state, amountToCall: 0, currentBet: 0 };
    expect(recommendPokerAction(70, 0, free, 2).action).toBe("bet");
    expect(recommendPokerAction(50, 0, free, 2).action).toBe("check");
    expect(recommendPokerAction(20, 0, free, 2).confidence).toBe("low");
  });

  it("calls a clear but non-raising advantage", () => {
    expect(recommendPokerAction(43, 33.3, state, 2).action).toBe("call");
  });
});
