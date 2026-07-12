import { describe, expect, it } from "vitest";
import { buildOpponentProfiles, estimateStartingHandStrength, handFitsRange } from "./ranges";
import type { Card, Player, PokerAction } from "./pokerTypes";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });
const player = (id: string, style: Player["style"]): Player => ({
  id, name: id, stack: 100, position: 0, isHero: id === "hero", isDealer: false,
  isSmallBlind: false, isBigBlind: false, status: "active", style,
  streetCommitment: 0, totalCommitted: 0,
});

describe("opponent ranges", () => {
  it("scores premium hands above weak offsuit hands", () => {
    const aces: [Card, Card] = [card("A", "spades"), card("A", "hearts")];
    const trash: [Card, Card] = [card("7", "spades"), card("2", "hearts")];
    expect(estimateStartingHandStrength(aces)).toBeGreaterThan(estimateStartingHandStrength(trash));
    expect(handFitsRange(aces, 15)).toBe(true);
    expect(handFitsRange(trash, 100)).toBe(true);
  });

  it("narrows a range after aggression and removes folded players", () => {
    const players = [player("hero", "unknown"), player("tight", "tight"), { ...player("folded", "loose"), status: "folded" as const }];
    const actions: PokerAction[] = [{
      id: "a", playerId: "tight", type: "raise", amount: 50, street: "preflop",
      timestamp: 1, potAfter: 80, amountToCallAfter: 40,
    }];
    const profiles = buildOpponentProfiles(players, "hero", actions);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].rangePercent).toBeLessThan(22);
  });
});
