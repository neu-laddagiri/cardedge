import type {
  BlackjackDecisionInput,
  BlackjackMove,
  BlackjackRecommendation,
} from "./blackjackTypes";
import { getBasicStrategyMove, getFallbackMove } from "./basicStrategy";
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
  const { hand, dealerUpcard, rules, canDouble, canSplit, canSurrender } =
    input;

  if (hand.cards.length === 0 || !dealerUpcard) return null;

  const ctx = {
    canDouble,
    canSplit,
    canSurrender: canSurrender && rules.surrenderAllowed,
    doubleAfterSplit: rules.doubleAfterSplit,
  };

  const move = getBasicStrategyMove(hand.cards, dealerUpcard, ctx);
  const fallbackMove = getFallbackMove(move, ctx);
  const effectiveMove = fallbackMove ?? move;

  const handType = isBlackjack(hand.cards)
    ? "blackjack"
    : isPair(hand.cards) && hand.cards.length === 2
      ? "pair"
      : isSoftHand(hand.cards)
        ? "soft"
        : "hard";

  const ruleNotes: string[] = [];
  if (rules.dealerHitsSoft17) ruleNotes.push("Dealer hits soft 17");
  else ruleNotes.push("Dealer stands on soft 17");
  ruleNotes.push(`${rules.numDecks}-deck shoe`);
  if (rules.surrenderAllowed) ruleNotes.push("Late surrender available");
  ruleNotes.push(`Blackjack pays ${rules.blackjackPayout}`);

  return {
    move: effectiveMove,
    fallbackMove: fallbackMove && fallbackMove !== move ? move : undefined,
    explanation: buildExplanation(hand.cards, dealerUpcard, effectiveMove, handType, ctx),
    handTotal: getDisplayTotal(hand.cards),
    handType,
    dealerUpcard: cardToDisplay(dealerUpcard),
    ruleNotes,
  };
}

function buildExplanation(
  cards: import("./blackjackTypes").BJCard[],
  dealer: import("./blackjackTypes").BJCard,
  move: BlackjackMove,
  handType: string,
  ctx: { canDouble: boolean; canSplit: boolean; canSurrender: boolean }
): string {
  const total = getDisplayTotal(cards);
  const dRank = dealer.rank === "T" ? "10" : dealer.rank;

  if (handType === "blackjack") {
    return "Natural blackjack — no further action needed.";
  }

  if (handType === "pair") {
    const pairRank = cards[0].rank;
    if (move === "split") {
      if (pairRank === "8") {
        return "Pair of 8s should be split because 16 is a poor standing hand and splitting improves expected value.";
      }
      if (pairRank === "A") {
        return "Pair of Aces should always be split — two chances at blackjack beat a soft 12.";
      }
      return `Pair of ${pairRank}s — basic strategy recommends splitting against dealer ${dRank}.`;
    }
    if (pairRank === "T" || pairRank === "J" || pairRank === "Q" || pairRank === "K") {
      return "Pair of 10-value cards is a strong 20 — standing is the book move.";
    }
  }

  if (handType === "soft") {
    if (move === "double") {
      return `Soft ${total} against dealer ${dRank} — doubling maximizes value when the dealer is weak.`;
    }
    if (move === "stand") {
      return `Soft ${total} is strong enough to stand against dealer ${dRank}.`;
    }
    return `Soft ${total} against dealer ${dRank} — hitting improves the hand without bust risk on one card.`;
  }

  const hardTotal = parseInt(total.split("/")[0]) || parseInt(total);

  if (move === "surrender") {
    return `Hard ${hardTotal} against dealer ${dRank} is a weak spot. With surrender available, surrender is the book move; otherwise hit.`;
  }

  if (move === "double") {
    return `Hard ${hardTotal} against dealer ${dRank} — doubling down is the basic strategy play when allowed.`;
  }

  if (move === "stand") {
    if (hardTotal >= 17) {
      return `Hard ${hardTotal} is pat — standing is correct regardless of dealer upcard.`;
    }
    return `Hard ${hardTotal} against weak dealer ${dRank} (2–6) — dealer bust risk favors standing.`;
  }

  if (hardTotal >= 13 && hardTotal <= 16 && ["9", "T", "J", "Q", "K", "A"].includes(dealer.rank)) {
    return `Hard ${hardTotal} against dealer ${dRank} is a weak spot — hitting is standard when surrender is unavailable.`;
  }

  return `Hard ${hardTotal} against dealer ${dRank} — ${move} is the basic strategy recommendation.`;
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
    default:
      return "text-white";
  }
}
