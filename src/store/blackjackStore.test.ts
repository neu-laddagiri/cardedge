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
