import type {
  BJCard,
  BlackjackDecisionInput,
  BlackjackMove,
  BlackjackRecommendation,
} from "./blackjackTypes";
import { getBasicStrategyDecision } from "./basicStrategy";
import {
  cardToDisplay,
  getBestTotal,
  getDisplayTotal,
  isBlackjack,
  isPair,
  isSoftHand,
} from "./handValue";
import { getChartDeckLabel } from "./strategyCharts";

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
  // A split hand that makes 21 pays even money; only an unsplit ace-ten is a natural.
  const handType = isBlackjack(hand.cards) && !hand.isSplit
    ? "blackjack"
    : isPair(hand.cards) && hand.cards.length === 2
      ? "pair"
      : isSoftHand(hand.cards)
        ? "soft"
        : "hard";

  const ruleNotes = [
    rules.dealerHitsSoft17 ? "H17 strategy matrix" : "S17 strategy matrix",
    `${rules.numDecks}-deck shoe (Wizard of Odds ${getChartDeckLabel(rules.numDecks)} chart)`,
    rules.doubleAfterSplit ? "Double after split supported" : "No double after split",
    rules.surrenderAllowed ? "Late surrender matrix enabled" : "No surrender",
    "Split aces receive one card each and can't be resplit",
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
  cards: BJCard[],
  dealerRank: string,
  move: BlackjackMove,
  preferredMove: BlackjackMove | undefined,
  handType: BlackjackRecommendation["handType"]
): string {
  const hand = `${isSoftHand(cards) ? "Soft" : "Hard"} ${getBestTotal(cards)}`;
  const unavailable = preferredMove
    ? ` ${preferredMove[0].toUpperCase()}${preferredMove.slice(1)} is preferred when allowed; ${move} is the correct fallback.`
    : "";
  if (handType === "blackjack") return "Natural blackjack — no further action is required.";
  if (move === "split") return `Split this pair against dealer ${dealerRank}; two independent hands have better expected value than playing the combined total.`;
  if (move === "surrender") return `Late-surrender ${hand} against dealer ${dealerRank}; giving up half the wager has better expected value than continuing under these rules.`;
  if (move === "double") return `${hand} against dealer ${dealerRank} is a profitable double-down configuration.${unavailable}`;
  if (move === "stand") return `${hand} should stand against dealer ${dealerRank}.${unavailable}`;
  return `${hand} should hit against dealer ${dealerRank}.${unavailable}`;
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
