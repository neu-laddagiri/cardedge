import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePokerStore } from "@/store/pokerStore";
import { StreetControls } from "./StreetControls";

const currentStreet = () =>
  screen.getByRole("list", { name: "Street" }).querySelector('[aria-current="step"]')?.textContent;

beforeEach(() => {
  usePokerStore.getState().resetGame();
});

describe("StreetControls", () => {
  it("shows the street the board sets instead of offering street buttons", () => {
    render(<StreetControls />);
    expect(screen.queryByRole("button", { name: "flop" })).not.toBeInTheDocument();
    expect(currentStreet()).toBe("preflop");
    expect(screen.getByText("Add the three flop cards to move to the flop.")).toBeInTheDocument();

    act(() => {
      const { setCommunityCard } = usePokerStore.getState();
      setCommunityCard("flop1", { rank: "A", suit: "spades" });
      setCommunityCard("flop2", { rank: "K", suit: "hearts" });
      setCommunityCard("flop3", { rank: "7", suit: "clubs" });
    });
    expect(currentStreet()).toBe("flop");
    expect(screen.getByText("Add the turn card to move to the turn.")).toBeInTheDocument();
  });

  it("names each card slot so they can be told apart", () => {
    render(<StreetControls />);
    expect(screen.getByRole("button", { name: "Flop 2: choose a card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "River: choose a card" })).toBeInTheDocument();

    act(() => usePokerStore.getState().setCommunityCard("turn", { rank: "Q", suit: "diamonds" }));
    expect(screen.getByRole("button", { name: "Turn: Q of diamonds. Change card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear Turn" })).toBeInTheDocument();
  });
});
