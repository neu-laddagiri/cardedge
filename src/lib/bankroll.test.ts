import { describe, expect, it } from "vitest";
import { sessionNet, summarizeBankroll, type GameSession } from "./bankroll";

const sessions: GameSession[] = [
  {
    id: "p1",
    gameType: "poker",
    playedAt: "2026-07-10T20:00:00.000Z",
    buyInCents: 20000,
    cashOutCents: 35000,
    note: "Cash game",
    createdAt: "2026-07-10T22:00:00.000Z",
    updatedAt: "2026-07-10T22:00:00.000Z",
  },
  {
    id: "b1",
    gameType: "blackjack",
    playedAt: "2026-07-11T20:00:00.000Z",
    buyInCents: 10000,
    cashOutCents: 2500,
    note: "",
    createdAt: "2026-07-11T22:00:00.000Z",
    updatedAt: "2026-07-11T22:00:00.000Z",
  },
];

describe("bankroll math", () => {
  it("calculates exact session profit and loss", () => {
    expect(sessionNet(sessions[0])).toBe(15000);
    expect(sessionNet(sessions[1])).toBe(-7500);
  });

  it("separates poker, blackjack, and combined totals", () => {
    expect(summarizeBankroll(sessions)).toEqual({
      pokerCents: 15000,
      blackjackCents: -7500,
      combinedCents: 7500,
      totalBuyInCents: 30000,
      totalCashOutCents: 37500,
      sessionCount: 2,
    });
  });
});
