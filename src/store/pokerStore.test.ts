import { beforeEach, describe, expect, it } from "vitest";
import { usePokerStore } from "./pokerStore";

describe("poker store integration", () => {
  beforeEach(() => {
    usePokerStore.getState().resetGame();
  });

  it("starts cash games at the requested default stakes", () => {
    const state = usePokerStore.getState();
    expect(state.startingBuyIn).toBe(20);
    expect(state.smallBlind).toBe(0.25);
    expect(state.bigBlind).toBe(0.5);
    expect(state.pot).toBe(0.75);
    expect(state.amountToCall).toBe(0.25);
  });

  it("advances a heads-up betting round and supports lossless undo", () => {
    let state = usePokerStore.getState();
    const heroId = state.heroId!;
    const villainId = state.players.find((player) => player.id !== heroId)!.id;

    state.addAction(heroId, "call");
    usePokerStore.getState().addAction(villainId, "check");
    state = usePokerStore.getState();
    expect(state.street).toBe("flop");
    expect(state.pot).toBe(1);

    state.undoLastAction();
    state = usePokerStore.getState();
    expect(state.street).toBe("preflop");
    expect(state.actingPlayerId).toBe(villainId);

    state.undoLastAction();
    state = usePokerStore.getState();
    expect(state.pot).toBe(0.75);
    expect(state.amountToCall).toBe(0.25);
  });

  it("blocks seat changes after betting starts", () => {
    const state = usePokerStore.getState();
    state.addAction(state.heroId!, "call");
    usePokerStore.getState().addPlayer();
    expect(usePokerStore.getState().lastError).toMatch(/new hand/);
    expect(usePokerStore.getState().players).toHaveLength(2);
  });
});
