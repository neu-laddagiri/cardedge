import { beforeEach, describe, expect, it } from "vitest";
import { useBankrollStore } from "./bankrollStore";

describe("bankroll store", () => {
  beforeEach(() => {
    localStorage.clear();
    useBankrollStore.setState({ sessions: [] });
  });

  it("adds, edits, and removes an exact dated session", () => {
    const created = useBankrollStore.getState().addSession({
      gameType: "poker",
      playedAt: "2026-07-11T20:30:00.000Z",
      buyInCents: 20000,
      cashOutCents: 32525,
      note: "  $1/$2 cash  ",
    });

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(useBankrollStore.getState().sessions[0]).toMatchObject({
      gameType: "poker",
      playedAt: "2026-07-11T20:30:00.000Z",
      buyInCents: 20000,
      cashOutCents: 32525,
      note: "$1/$2 cash",
    });

    useBankrollStore.getState().updateSession(created.id, {
      gameType: "blackjack",
      playedAt: "2026-07-11T21:00:00.000Z",
      buyInCents: 10000,
      cashOutCents: 0,
      note: "Session corrected",
    });
    expect(useBankrollStore.getState().sessions[0]).toMatchObject({
      gameType: "blackjack",
      cashOutCents: 0,
    });

    useBankrollStore.getState().deleteSession(created.id);
    expect(useBankrollStore.getState().sessions).toEqual([]);
  });
});
