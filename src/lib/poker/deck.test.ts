import { describe, expect, it } from "vitest";
import {
  cardToString,
  cardsEqual,
  createDeck,
  drawCards,
  getAllRanks,
  getAllSuits,
  removeKnownCards,
  shuffleDeck,
  validateNoDuplicateCards,
} from "./deck";

describe("poker deck", () => {
  it("builds all 52 unique cards", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map(cardToString))).toHaveLength(52);
    expect(getAllRanks()).toHaveLength(13);
    expect(getAllSuits()).toHaveLength(4);
  });

  it("removes, compares, and validates cards", () => {
    const ace = { rank: "A" as const, suit: "spades" as const };
    expect(cardsEqual(ace, { ...ace })).toBe(true);
    expect(cardsEqual(ace, { rank: "K", suit: "spades" })).toBe(false);
    expect(removeKnownCards(createDeck(), [ace])).toHaveLength(51);
    expect(validateNoDuplicateCards([ace, { ...ace }])).toBe(false);
    expect(validateNoDuplicateCards([ace, { rank: "A", suit: "hearts" }])).toBe(true);
  });

  it("draws and shuffles without mutating the source", () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck, () => 0.25);
    const [drawn, remaining] = drawCards(shuffled, 5);
    expect(drawn).toHaveLength(5);
    expect(remaining).toHaveLength(47);
    expect(deck).toHaveLength(52);
    expect(shuffled).not.toBe(deck);
  });
});
