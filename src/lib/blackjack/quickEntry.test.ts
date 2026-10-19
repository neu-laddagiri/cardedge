import { describe, expect, it } from "vitest";
import type { BJCard, BlackjackPlayer } from "./blackjackTypes";
import { QUICK_RANKS, autoSuitCard, collectTableCards, playerCardMove, rankName } from "./quickEntry";

const card = (rank: BJCard["rank"], suit: BJCard["suit"]): BJCard => ({ rank, suit });

describe("quick card entry", () => {
  it("lays the keypad out as A, 2–10, J, Q, K", () => {
    expect(QUICK_RANKS.map((key) => key.label)).toEqual(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]);
    expect(new Set(QUICK_RANKS.map((key) => key.rank)).size).toBe(13);
  });

  it("starts every accessible name with the text shown on the key", () => {
    for (const key of QUICK_RANKS) expect(key.name.startsWith(key.label)).toBe(true);
    expect(rankName("T")).toBe("10");
    expect(rankName("K")).toBe("King");
  });

  it("rotates suits ♠♥♦♣ as cards reach the table", () => {
    const table: BJCard[] = [];
    for (let i = 0; i < 5; i++) table.push(autoSuitCard("9", table, 6)!);
    expect(table.map((dealt) => dealt.suit)).toEqual(["spades", "hearts", "diamonds", "clubs", "spades"]);
  });

  it("skips a suit the shoe has used up", () => {
    const table = [card("A", "spades"), card("5", "clubs"), card("6", "diamonds"), card("7", "hearts")];
    expect(autoSuitCard("A", table, 1)).toEqual(card("A", "hearts"));
    expect(autoSuitCard("A", table, 2)).toEqual(card("A", "spades"));
  });

  it("returns null once every copy of the rank is on the table", () => {
    const aces = [card("A", "spades"), card("A", "hearts"), card("A", "diamonds"), card("A", "clubs")];
    expect(autoSuitCard("A", aces, 1)).toBeNull();
    expect(autoSuitCard("K", aces, 1)).toEqual(card("K", "spades"));
  });

  it("deals the first two cards, hits after that, and doubles only when armed", () => {
    expect(playerCardMove({ cards: [] }, false)).toBe("deal");
    expect(playerCardMove({ cards: [card("8", "spades")] }, false)).toBe("deal");
    expect(playerCardMove({ cards: [card("8", "spades"), card("3", "hearts")] }, false)).toBe("hit");
    expect(playerCardMove({ cards: [card("8", "spades"), card("3", "hearts")] }, true)).toBe("double");
  });

  it("collects dealer and player cards from every hand", () => {
    const players: BlackjackPlayer[] = [
      { id: "p1", name: "Player 1", hands: [
        { id: "h1", cards: [card("8", "hearts")], status: "active", isSplit: true, bet: 1 },
        { id: "h2", cards: [card("8", "clubs")], status: "active", isSplit: true, bet: 1 },
      ] },
      { id: "p2", name: "Player 2", hands: [{ id: "h3", cards: [card("K", "spades")], status: "active", isSplit: false, bet: 1 }] },
    ];
    expect(collectTableCards(players, [card("6", "diamonds")])).toEqual([
      card("6", "diamonds"),
      card("8", "hearts"),
      card("8", "clubs"),
      card("K", "spades"),
    ]);
  });
});
