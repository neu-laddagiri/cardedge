import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePokerStore } from "@/store/pokerStore";
import { PokerActionPanel } from "./PokerActionPanel";

beforeEach(() => {
  usePokerStore.getState().resetGame();
});

describe("PokerActionPanel", () => {
  it("waits for the next board card once a betting round is over", () => {
    render(<PokerActionPanel />);
    const { heroId, players } = usePokerStore.getState();
    const villainId = players.find((player) => player.id !== heroId)!.id;
    expect(screen.getByRole("button", { name: "Add Action" })).toBeEnabled();

    act(() => {
      usePokerStore.getState().addAction(heroId!, "call");
      usePokerStore.getState().addAction(villainId, "check");
    });
    expect(screen.getByText("Preflop betting is complete. Add the flop to continue.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Action" })).toBeDisabled();
  });
});
