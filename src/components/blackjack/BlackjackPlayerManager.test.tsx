import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useBlackjackStore } from "@/store/blackjackStore";
import { BlackjackPlayerManager } from "./BlackjackPlayerManager";

const store = () => useBlackjackStore.getState();

function activeHand() {
  const state = store();
  const player = state.players.find((candidate) => candidate.id === state.activePlayerId)!;
  return player.hands.find((hand) => hand.id === state.activeHandId)!;
}

const dealerKeypad = () => screen.getByRole("group", { name: /dealer's/i });
const playerKeypad = () => screen.getByRole("group", { name: /player 1/i });
const tap = (keypad: HTMLElement, name: string) => fireEvent.click(within(keypad).getByRole("button", { name }));

describe("blackjack rank keypads", () => {
  beforeEach(() => {
    useBlackjackStore.setState({ decisions: [], lastError: null, defaultBet: 1 });
    store().resetTable();
    store().setRules({
      numDecks: 6,
      dealerHitsSoft17: true,
      doubleAfterSplit: true,
      surrenderAllowed: true,
      blackjackPayout: "3:2",
    });
  });

  afterEach(() => cleanup());

  it("enters the dealer upcard and two player cards in three taps", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "8");
    tap(playerKeypad(), "Ace");
    tap(playerKeypad(), "King");

    expect(store().dealerCards).toEqual([{ rank: "8", suit: "spades" }]);
    expect(activeHand().cards).toEqual([
      { rank: "A", suit: "hearts" },
      { rank: "K", suit: "diamonds" },
    ]);
    expect(activeHand().status).toBe("blackjack");
    expect(screen.getByRole("status")).toHaveTextContent("Dealt King of diamonds to Player 1. Total 21 or 11. Blackjack.");
  });

  it("treats later cards as hits and records the decision", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "10");
    tap(playerKeypad(), "6");
    expect(playerKeypad()).toHaveAccessibleName("Hit Player 1");
    tap(playerKeypad(), "5");

    expect(activeHand().cards.map((card) => card.rank)).toEqual(["T", "6", "5"]);
    expect(store().decisions[0]).toMatchObject({ actualMove: "hit", recommendedMove: "stand", correct: false });
    expect(screen.getByRole("status")).toHaveTextContent("Player 1 hits 5 of clubs. Total 21.");
  });

  it("arms Double for the next tap only while the hand can double", () => {
    render(<BlackjackPlayerManager />);
    const double = screen.getByRole("button", { name: "Double" });
    expect(double).toBeDisabled();

    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "5");
    tap(playerKeypad(), "6");
    expect(double).toBeEnabled();
    expect(double).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(double);
    expect(double).toHaveAttribute("aria-pressed", "true");
    expect(playerKeypad()).toHaveAccessibleName("Double Player 1: tap the card dealt");

    tap(playerKeypad(), "King");
    expect(activeHand()).toMatchObject({ status: "doubled", bet: 2 });
    expect(activeHand().cards).toHaveLength(3);
    expect(store().decisions[0]).toMatchObject({ actualMove: "double", recommendedMove: "double", correct: true });
    expect(double).toBeDisabled();
    expect(double).toHaveAttribute("aria-pressed", "false");
  });

  it("lets a second press of Double disarm it", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "5");
    tap(playerKeypad(), "6");
    const double = screen.getByRole("button", { name: "Double" });
    fireEvent.click(double);
    fireEvent.click(double);
    expect(double).toHaveAttribute("aria-pressed", "false");

    tap(playerKeypad(), "2");
    expect(activeHand().status).toBe("active");
    expect(store().decisions[0]).toMatchObject({ actualMove: "hit" });
  });

  it("follows the double-after-split rule for split hands", () => {
    store().setRules({ doubleAfterSplit: false });
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "8");
    tap(playerKeypad(), "8");
    fireEvent.click(screen.getByRole("button", { name: "Split" }));
    expect(playerKeypad()).toHaveAccessibleName("Deal to Player 1, hand 1");
    tap(playerKeypad(), "3");

    expect(activeHand()).toMatchObject({ isSplit: true });
    expect(activeHand().cards).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Double" })).toBeDisabled();
  });

  it("deals split aces one card each, without Double or blackjack", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "Ace");
    tap(playerKeypad(), "Ace");
    fireEvent.click(screen.getByRole("button", { name: "Split" }));
    tap(playerKeypad(), "King");

    // Even with double after split allowed, a split ace stands on its second card.
    expect(activeHand()).toMatchObject({ isSplit: true, status: "stood" });
    expect(playerKeypad()).toHaveAccessibleName("Player 1, hand 1 stood");
    expect(screen.getByRole("button", { name: "Double" })).toBeDisabled();

    const [, second] = store().players[0].hands;
    act(() => store().setActiveHand(store().players[0].id, second.id));
    tap(playerKeypad(), "9");
    expect(activeHand()).toMatchObject({ id: second.id, status: "stood" });
    expect(screen.getByRole("button", { name: "Double" })).toBeDisabled();
  });

  it("keeps keys focusable but inert once the hand is finished", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "9");
    tap(playerKeypad(), "10");
    tap(playerKeypad(), "7");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));

    expect(playerKeypad()).toHaveAccessibleName("Player 1 stood");
    const two = within(playerKeypad()).getByRole("button", { name: "2" });
    expect(two).toHaveAttribute("aria-disabled", "true");
    expect(two).toBeEnabled();
    fireEvent.click(two);
    expect(activeHand().cards).toHaveLength(2);
  });

  it("marks a rank unavailable once the shoe has no copies left", () => {
    store().setRules({ numDecks: 1 });
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "Ace");
    tap(playerKeypad(), "Ace");
    tap(playerKeypad(), "Ace");
    tap(playerKeypad(), "Ace");

    expect([...store().dealerCards, ...activeHand().cards].map((card) => card.suit)).toEqual([
      "spades",
      "hearts",
      "diamonds",
      "clubs",
    ]);
    const dealerAce = within(dealerKeypad()).getByRole("button", { name: "Ace, none left in the shoe" });
    expect(dealerAce).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(dealerAce);
    expect(store().dealerCards).toHaveLength(1);
    expect(store().lastError).toBeNull();
  });

  it("names every key and gives each exact-card button its own name", () => {
    render(<BlackjackPlayerManager />);
    const names = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    for (const keypad of [dealerKeypad(), playerKeypad()]) {
      expect(within(keypad).getAllByRole("button")).toHaveLength(13);
      for (const name of names) expect(within(keypad).getByRole("button", { name })).toBeInTheDocument();
    }
    const exactCards = [
      screen.getByRole("button", { name: "Exact card for the dealer: choose rank and suit" }),
      screen.getByRole("button", { name: "Exact card for Player 1: choose rank and suit" }),
    ];
    for (const button of exactCards) expect(button).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("button", { name: "Add player" })).toBeInTheDocument();
  });

  it("plays an exact card through the same move and returns focus to its button", () => {
    render(<BlackjackPlayerManager />);
    tap(dealerKeypad(), "6");
    tap(playerKeypad(), "10");
    tap(playerKeypad(), "2");
    const exactCard = screen.getByRole("button", { name: "Exact card for Player 1: choose rank and suit" });
    fireEvent.click(exactCard);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "7" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "♣ Clubs" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Use 7 ♣" }));

    expect(activeHand().cards.at(-1)).toEqual({ rank: "7", suit: "clubs" });
    expect(store().decisions[0]).toMatchObject({ actualMove: "hit" });
    expect(exactCard).toHaveFocus();
  });
});
