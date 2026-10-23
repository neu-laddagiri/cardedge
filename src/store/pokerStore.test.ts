import { beforeEach, describe, expect, it } from "vitest";
import type { Card } from "@/lib/poker/pokerTypes";
import { usePokerStore } from "./pokerStore";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

function dealFlop() {
  const { setCommunityCard } = usePokerStore.getState();
  setCommunityCard("flop1", card("A", "spades"));
  setCommunityCard("flop2", card("K", "hearts"));
  setCommunityCard("flop3", card("7", "clubs"));
}

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

  it("waits for the flop after a betting round and supports lossless undo", () => {
    let state = usePokerStore.getState();
    const heroId = state.heroId!;
    const villainId = state.players.find((player) => player.id !== heroId)!.id;

    state.addAction(heroId, "call");
    usePokerStore.getState().addAction(villainId, "check");
    state = usePokerStore.getState();
    expect(state.street).toBe("preflop");
    expect(state.actingPlayerId).toBeNull();
    expect(state.pot).toBe(1);

    usePokerStore.getState().addAction(villainId, "check");
    expect(usePokerStore.getState().lastError).toBe("Preflop betting is complete. Add the flop to continue.");

    dealFlop();
    state = usePokerStore.getState();
    expect(state).toMatchObject({ street: "flop", currentBet: 0, actingPlayerId: villainId });
    state.addAction(villainId, "bet", 0.5);
    expect(usePokerStore.getState().pot).toBe(1.5);

    // Undoing the flop bet keeps the flop; undoing the last preflop action takes the flop back.
    usePokerStore.getState().undoLastAction();
    state = usePokerStore.getState();
    expect(state).toMatchObject({ street: "flop", pot: 1 });
    expect(state.communityCards.flop3).toEqual(card("7", "clubs"));

    state.undoLastAction();
    state = usePokerStore.getState();
    expect(state.street).toBe("preflop");
    expect(state.communityCards.flop1).toBeNull();
    expect(state.actingPlayerId).toBe(villainId);

    state.undoLastAction();
    state = usePokerStore.getState();
    expect(state.pot).toBe(0.75);
    expect(state.amountToCall).toBe(0.25);
  });

  it("moves the street with the board cards, forward and back", () => {
    const store = () => usePokerStore.getState();
    store().setCommunityCard("flop1", card("A", "spades"));
    store().setCommunityCard("flop2", card("K", "hearts"));
    expect(store().street).toBe("preflop");

    store().setCommunityCard("flop3", card("7", "clubs"));
    expect(store().street).toBe("flop");
    store().setCommunityCard("turn", card("2", "diamonds"));
    expect(store().street).toBe("turn");
    store().setCommunityCard("river", card("9", "spades"));
    expect(store().street).toBe("river");

    store().setCommunityCard("turn", null);
    expect(store().street).toBe("flop");
    store().setCommunityCard("flop2", null);
    expect(store().street).toBe("preflop");
  });

  it("blocks seat changes after betting starts", () => {
    const state = usePokerStore.getState();
    state.addAction(state.heroId!, "call");
    usePokerStore.getState().addPlayer();
    expect(usePokerStore.getState().lastError).toMatch(/new hand/);
    expect(usePokerStore.getState().players).toHaveLength(2);
  });
});
