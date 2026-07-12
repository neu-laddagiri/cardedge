import type {
  BlackjackDecisionInput,
  BlackjackMove,
  BlackjackRecommendation,
} from "./blackjackTypes";
import { getBasicStrategyDecision } from "./basicStrategy";
import {
  cardToDisplay,
  getDisplayTotal,
  isBlackjack,
  isPair,
  isSoftHand,
} from "./handValue";

export function getBlackjackRecommendation(
  input: BlackjackDecisionInput
): BlackjackRecommendation | null {
  const { hand, dealerUpcard, rules, canDouble, canSplit, canSurrender } = input;
  if (hand.cards.length === 0 || !dealerUpcard) return null;

  const decision = getBasicStrategyDecision(hand.cards, dealerUpcard, {
    canDouble,
    canSplit,
    canSurrender: canSurrender && rules.surrenderAllowed,
    rules,
  });
  const handType = isBlackjack(hand.cards)
    ? "blackjack"
    : isPair(hand.cards) && hand.cards.length === 2
      ? "pair"
      : isSoftHand(hand.cards)
        ? "soft"
        : "hard";

  const ruleNotes = [
    rules.dealerHitsSoft17 ? "H17 strategy matrix" : "S17 strategy matrix",
    `${rules.numDecks}-deck strategy matrix`,
    rules.doubleAfterSplit ? "Double after split supported" : "No double after split",
    rules.surrenderAllowed ? "Late surrender matrix enabled" : "No surrender",
    `Blackjack pays ${rules.blackjackPayout} (payout affects return, not the hit/stand matrix)`,
  ];

  return {
    move: decision.move,
    preferredMove: decision.preferredMove,
    explanation: buildExplanation(
      hand.cards,
      dealerUpcard.rank === "T" ? "10" : dealerUpcard.rank,
      decision.move,
      decision.preferredMove,
      handType
    ),
    handTotal: getDisplayTotal(hand.cards),
    handType,
    dealerUpcard: cardToDisplay(dealerUpcard),
    ruleNotes,
  };
}

function buildExplanation(
  cards: import("./blackjackTypes").BJCard[],
  dealerRank: string,
  move: BlackjackMove,
  preferredMove: BlackjackMove | undefined,
  handType: BlackjackRecommendation["handType"]
): string {
  const total = getDisplayTotal(cards);
  const unavailable = preferredMove
    ? ` ${preferredMove[0].toUpperCase()}${preferredMove.slice(1)} is preferred when allowed; ${move} is the correct fallback.`
    : "";
  if (handType === "blackjack") return "Natural blackjack — no further action is required.";
  if (move === "split") return `Split this pair against dealer ${dealerRank}; two independent hands have better expected value than playing the combined total.`;
  if (move === "surrender") return `Late-surrender ${total} against dealer ${dealerRank}; giving up half the wager has better expected value than continuing under these rules.`;
  if (move === "double") return `${handType === "soft" ? "Soft" : "Hard"} ${total} against dealer ${dealerRank} is a profitable double-down configuration.${unavailable}`;
  if (move === "stand") return `${handType === "soft" ? "Soft" : "Hard"} ${total} should stand against dealer ${dealerRank}.${unavailable}`;
  return `${handType === "soft" ? "Soft" : "Hard"} ${total} should hit against dealer ${dealerRank}.${unavailable}`;
}

export function getMoveColor(move: BlackjackMove): string {
  switch (move) {
    case "hit":
      return "text-amber-400";
    case "stand":
      return "text-emerald-400";
    case "double":
      return "text-sky-400";
    case "split":
      return "text-violet-400";
    case "surrender":
      return "text-red-400";
  }
}
