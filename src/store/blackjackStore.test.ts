import { beforeEach, describe, expect, it } from "vitest";
import { useBlackjackStore } from "./blackjackStore";

const aceOfSpades = { rank: "A" as const, suit: "spades" as const };

describe("blackjack store integration", () => {
  beforeEach(() => {
    useBlackjackStore.setState({ decisions: [], dealerCards: [], lastError: null });
    useBlackjackStore.getState().resetTable();
    useBlackjackStore.getState().setRules({
      numDecks: 1,
      dealerHitsSoft17: false,
      doubleAfterSplit: true,
      surrenderAllowed: true,
      blackjackPayout: "3:2",
    });
  });

  it("starts new hands with a one-dollar bet", () => {
    const state = useBlackjackStore.getState();
    expect(state.defaultBet).toBe(1);
    expect(state.players[0].hands[0].bet).toBe(1);
  });

  it("enforces physical shoe limits", () => {
    const state = useBlackjackStore.getState();
    state.addDealerCard(aceOfSpades);
    const fresh = useBlackjackStore.getState();
    fresh.addCardToHand(fresh.activePlayerId!, fresh.activeHandId!, aceOfSpades);
    expect(useBlackjackStore.getState().lastError).toMatch(/shoe allows/);
  });

  it("records actual versus recommended decisions", () => {
    let state = useBlackjackStore.getState();
    state.addDealerCard({ rank: "6", suit: "clubs" });
    state = useBlackjackStore.getState();
    state.addCardToHand(state.activePlayerId!, state.activeHandId!, { rank: "T", suit: "hearts" });
    state = useBlackjackStore.getState();
    state.addCardToHand(state.activePlayerId!, state.activeHandId!, { rank: "Q", suit: "diamonds" });
    state = useBlackjackStore.getState();
    expect(state.recommendation?.move).toBe("stand");
    state.standHand(state.activePlayerId!, state.activeHandId!);
    expect(useBlackjackStore.getState().decisions[0]).toMatchObject({
      actualMove: "stand",
      recommendedMove: "stand",
      correct: true,
    });
  });

  it("keeps a busted hand busted when Stand is pressed", () => {
    const store = useBlackjackStore.getState();
    store.addDealerCard({ rank: "9", suit: "clubs" });
    const { activePlayerId, activeHandId } = useBlackjackStore.getState();
    for (const rank of ["T", "6", "9"] as const) {
      useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank, suit: "hearts" });
    }
    expect(useBlackjackStore.getState().players[0].hands[0].status).toBe("bust");

    useBlackjackStore.getState().standHand(activePlayerId!, activeHandId!);
    expect(useBlackjackStore.getState().players[0].hands[0].status).toBe("bust");
    expect(useBlackjackStore.getState().decisions).toHaveLength(0);
  });

  it("refuses cards for a hand that is already finished", () => {
    useBlackjackStore.getState().addDealerCard({ rank: "9", suit: "clubs" });
    const { activePlayerId, activeHandId } = useBlackjackStore.getState();
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "T", suit: "hearts" });
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "8", suit: "hearts" });
    useBlackjackStore.getState().standHand(activePlayerId!, activeHandId!);

    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "2", suit: "hearts" });
    expect(useBlackjackStore.getState().players[0].hands[0].cards).toHaveLength(2);
    expect(useBlackjackStore.getState().lastError).toMatch(/finished/);
  });

  it("gives split aces one card each, with no resplit or double", () => {
    useBlackjackStore.getState().addDealerCard({ rank: "6", suit: "clubs" });
    const { activePlayerId, activeHandId } = useBlackjackStore.getState();
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "A", suit: "hearts" });
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "A", suit: "diamonds" });
    useBlackjackStore.getState().splitHand(activePlayerId!, activeHandId!);

    // Each split ace draws one card, then the hand is done: A-6 vs 6 would
    // otherwise be a DAS double, which split aces don't get.
    expect(useBlackjackStore.getState().recommendation?.move).toBe("hit");
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "6", suit: "hearts" });
    const [first, second] = useBlackjackStore.getState().players[0].hands;
    expect(first.cards.map((c) => c.rank)).toEqual(["A", "6"]);
    expect(first.status).toBe("stood");

    // The second ace can't be resplit even if it catches another ace.
    useBlackjackStore.getState().setActiveHand(activePlayerId!, second.id);
    useBlackjackStore.getState().addCardToHand(activePlayerId!, second.id, { rank: "A", suit: "clubs" });
    useBlackjackStore.getState().splitHand(activePlayerId!, second.id);
    expect(useBlackjackStore.getState().players[0].hands).toHaveLength(2);
  });

  it("does not call a split ace plus a ten a natural", () => {
    useBlackjackStore.getState().addDealerCard({ rank: "9", suit: "clubs" });
    const { activePlayerId, activeHandId } = useBlackjackStore.getState();
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "T", suit: "hearts" });
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "T", suit: "diamonds" });
    useBlackjackStore.getState().splitHand(activePlayerId!, activeHandId!);
    useBlackjackStore.getState().addCardToHand(activePlayerId!, activeHandId!, { rank: "A", suit: "hearts" });

    const state = useBlackjackStore.getState();
    expect(state.players[0].hands[0].status).toBe("active");
    expect(state.recommendation?.handType).toBe("soft");
    expect(state.recommendation?.move).toBe("stand");
  });

  it("tracks dollar bets to the cent before cards are dealt", () => {
    const state = useBlackjackStore.getState();
    state.setHandBet(state.activePlayerId!, state.activeHandId!, 37.255);
    expect(useBlackjackStore.getState().players[0].hands[0].bet).toBe(37.26);

    useBlackjackStore.getState().addCardToHand(
      state.activePlayerId!,
      state.activeHandId!,
      aceOfSpades
    );
    useBlackjackStore.getState().setHandBet(state.activePlayerId!, state.activeHandId!, 100);
    expect(useBlackjackStore.getState().players[0].hands[0].bet).toBe(37.26);
  });
});
