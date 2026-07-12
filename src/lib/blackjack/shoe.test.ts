import { describe, expect, it } from "vitest";
import { validateShoe } from "./shoe";

describe("blackjack shoe validation", () => {
  const ace = { rank: "A" as const, suit: "spades" as const };

  it("rejects impossible duplicate cards in a single deck", () => {
    expect(validateShoe([ace, ace], 1)).toMatch(/more than/);
  });

  it("allows one physical copy per configured deck", () => {
    expect(validateShoe([ace, ace], 2)).toBeNull();
  });
});
