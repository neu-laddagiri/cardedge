import { describe, expect, it } from "vitest";
import { advancePokerStreet, applyPokerAction, normalizeSeatAssignments, postBlinds } from "./handState";
import type { Player } from "./pokerTypes";

function player(id: string, position: number): Player {
  return {
    id, name: id, stack: 1000, position, isHero: id === "hero", isDealer: position === 0,
    isSmallBlind: false, isBigBlind: false, status: "active", style: "unknown",
    streetCommitment: 0, totalCommitted: 0,
  };
}

describe("poker hand state", () => {
  it("assigns heads-up dealer and small blind to the same player", () => {
    const players = normalizeSeatAssignments([player("hero", 0), player("villain", 1)]);
    expect(players[0].isDealer).toBe(true);
    expect(players[0].isSmallBlind).toBe(true);
    expect(players[1].isBigBlind).toBe(true);
  });

  it("posts blinds and reconciles stacks", () => {
    const players = normalizeSeatAssignments([player("hero", 0), player("villain", 1)]);
    const posted = postBlinds(players, 10, 20, "hero");
    expect(posted.pot).toBe(30);
    expect(posted.amountToCall).toBe(10);
    expect(posted.players.reduce((sum, current) => sum + current.stack, 0) + posted.pot).toBe(2000);
  });

  it("rejects illegal checks and updates a legal call", () => {
    const players = normalizeSeatAssignments([player("hero", 0), player("villain", 1)]);
    const posted = postBlinds(players, 10, 20, "hero");
    const state = { ...posted, heroId: "hero", street: "preflop" as const, actions: [] };
    expect(applyPokerAction(state, { id: "a1", playerId: "hero", type: "check" }).ok).toBe(false);
    const result = applyPokerAction(state, { id: "a2", playerId: "hero", type: "call" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.pot).toBe(40);
      expect(result.state.amountToCall).toBe(0);
      expect(result.state.players.find((current) => current.id === "hero")?.stack).toBe(980);
      expect(result.state.actingPlayerId).toBe("villain");
      const checked = applyPokerAction(result.state, { id: "a3", playerId: "villain", type: "check" });
      expect(checked.ok).toBe(true);
      if (checked.ok) {
        expect(checked.state.street).toBe("flop");
        expect(checked.state.currentBet).toBe(0);
      }
    }
  });

  it("handles bets, raises, folds, all-ins, and street resets", () => {
    const players = [player("hero", 0), player("villain", 1)];
    const base = {
      players,
      heroId: "hero",
      pot: 0,
      currentBet: 0,
      amountToCall: 0,
      actingPlayerId: "villain",
      actedPlayerIds: [],
      handComplete: false,
      street: "flop" as const,
      actions: [],
    };
    const bet = applyPokerAction(base, { id: "a1", playerId: "villain", type: "bet", amount: 40 });
    expect(bet.ok).toBe(true);
    if (!bet.ok) return;
    expect(bet.state.amountToCall).toBe(40);
    expect(applyPokerAction(bet.state, { id: "bad", playerId: "hero", type: "bet", amount: 50 }).ok).toBe(false);
    expect(applyPokerAction(bet.state, { id: "bad2", playerId: "hero", type: "raise", amount: 40 }).ok).toBe(false);
    const raised = applyPokerAction(bet.state, { id: "a2", playerId: "hero", type: "raise", amount: 100 });
    expect(raised.ok).toBe(true);
    if (!raised.ok) return;
    const folded = applyPokerAction(raised.state, { id: "a3", playerId: "villain", type: "fold" });
    expect(folded.ok).toBe(true);
    const advanced = advancePokerStreet(raised.state, "turn");
    expect(advanced.currentBet).toBe(0);
    expect(advanced.players.every((current) => current.streetCommitment === 0)).toBe(true);
    const allIn = applyPokerAction(base, { id: "a4", playerId: "villain", type: "all-in" });
    expect(allIn.ok && allIn.state.players[1].status).toBe("all-in");
  });

  it("rejects missing, folded, and empty-stack actors", () => {
    const base = {
      players: [{ ...player("hero", 0), status: "folded" as const }, { ...player("villain", 1), stack: 0 }],
      heroId: "hero",
      pot: 0,
      currentBet: 0,
      amountToCall: 0,
      actingPlayerId: null,
      actedPlayerIds: [],
      handComplete: false,
      street: "flop" as const,
      actions: [],
    };
    expect(applyPokerAction(base, { id: "x", playerId: "missing", type: "check" }).ok).toBe(false);
    expect(applyPokerAction(base, { id: "x", playerId: "hero", type: "check" }).ok).toBe(false);
    expect(applyPokerAction(base, { id: "x", playerId: "villain", type: "all-in" }).ok).toBe(false);
  });
});
