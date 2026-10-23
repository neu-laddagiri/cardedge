import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePokerStore } from "@/store/pokerStore";
import { PlayerManager } from "./PlayerManager";

const villain = () => usePokerStore.getState().players.find((player) => !player.isHero)!;
const rangeInput = () => document.getElementById(`range-${villain().id}`) as HTMLInputElement;

beforeEach(() => {
  usePokerStore.setState(usePokerStore.getInitialState(), true);
});

describe("PlayerManager", () => {
  it("names its icon-only buttons", () => {
    render(<PlayerManager />);
    expect(screen.getByRole("button", { name: "Add player" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rotate blinds" })).toBeInTheDocument();
  });

  it("applies a typed range on blur instead of clamping each keystroke", () => {
    render(<PlayerManager />);
    fireEvent.change(rangeInput(), { target: { value: "2" } });
    expect(villain().rangeOverride).toBeUndefined();
    expect(rangeInput()).toHaveValue(2);

    fireEvent.change(rangeInput(), { target: { value: "25" } });
    fireEvent.blur(rangeInput());
    expect(villain().rangeOverride).toBe(25);
    expect(rangeInput()).toHaveValue(25);
  });

  it("clamps on commit and clears back to the automatic range", () => {
    render(<PlayerManager />);
    fireEvent.change(rangeInput(), { target: { value: "2" } });
    fireEvent.keyDown(rangeInput(), { key: "Enter" });
    expect(villain().rangeOverride).toBe(5);

    fireEvent.change(rangeInput(), { target: { value: "" } });
    fireEvent.blur(rangeInput());
    expect(villain().rangeOverride).toBeUndefined();
    expect(rangeInput()).toHaveValue(null);
  });
});
