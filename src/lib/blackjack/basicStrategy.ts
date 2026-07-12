import type {
  BJCard,
  BlackjackMove,
  BlackjackRules,
} from "./blackjackTypes";
import {
  dealerRankValue,
  getBestTotal,
  getPairRank,
  getSoftTotal,
  isBlackjack,
  isPair,
  isSoftHand,
} from "./handValue";

export interface StrategyContext {
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  rules: BlackjackRules;
}

export interface StrategyDecision {
  move: BlackjackMove;
  preferredMove?: BlackjackMove;
}

function dealerValue(upcard: BJCard): number {
  return upcard.rank === "A" ? 11 : Math.min(10, dealerRankValue(upcard.rank));
}

export function getBasicStrategyDecision(
  cards: BJCard[],
  dealerUpcard: BJCard,
  context: StrategyContext
): StrategyDecision {
  if (isBlackjack(cards)) return { move: "stand" };
  const dealer = dealerValue(dealerUpcard);

  if (isPair(cards) && cards.length === 2) {
    const pairMove = getPairMove(cards, dealer, context.rules);
    if (pairMove === "split") {
      if (context.canSplit) return { move: "split" };
      return {
        move: getNonPairMove(cards, dealer, context).move,
        preferredMove: "split",
      };
    }
    if (pairMove) return resolveUnavailable(pairMove, cards, dealer, context);
  }

  return getNonPairMove(cards, dealer, context);
}

export function getBasicStrategyMove(
  cards: BJCard[],
  dealerUpcard: BJCard,
  context: StrategyContext
): BlackjackMove {
  return getBasicStrategyDecision(cards, dealerUpcard, context).move;
}

function getNonPairMove(
  cards: BJCard[],
  dealer: number,
  context: StrategyContext
): StrategyDecision {
  const preferred = isSoftHand(cards)
    ? getSoftMove(cards, dealer, context.rules)
    : getHardMove(cards, dealer, context.rules);
  return resolveUnavailable(preferred, cards, dealer, context);
}

function resolveUnavailable(
  preferred: BlackjackMove,
  cards: BJCard[],
  dealer: number,
  context: StrategyContext
): StrategyDecision {
  if (preferred === "double" && !context.canDouble) {
    const total = getBestTotal(cards);
    const fallback: BlackjackMove = isSoftHand(cards) && total >= 18 ? "stand" : "hit";
    return { move: fallback, preferredMove: "double" };
  }
  if (preferred === "surrender" && !context.canSurrender) {
    return { move: "hit", preferredMove: "surrender" };
  }
  if (preferred === "split" && !context.canSplit) {
    const fallbackPreferred = isSoftHand(cards)
      ? getSoftMove(cards, dealer, context.rules)
      : getHardMove(cards, dealer, context.rules);
    const fallback = resolveUnavailable(fallbackPreferred, cards, dealer, context);
    return { move: fallback.move, preferredMove: "split" };
  }
  return { move: preferred };
}

function getPairMove(
  cards: BJCard[],
  dealer: number,
  rules: BlackjackRules
): BlackjackMove | null {
  const pair = getPairRank(cards);
  if (cards[0].rank === "A" || pair === 8) return "split";
  if (pair === 10) return "stand";
  if (pair === 9) return (dealer >= 2 && dealer <= 6) || dealer === 8 || dealer === 9 ? "split" : "stand";
  if (pair === 7) return dealer >= 2 && dealer <= 7 ? "split" : "hit";
  if (pair === 6) {
    const minimum = rules.doubleAfterSplit ? 2 : 3;
    return dealer >= minimum && dealer <= 6 ? "split" : "hit";
  }
  // Fives play as a hard 10; the dealer upcard still determines whether to double.
  if (pair === 5) return null;
  if (pair === 4) return rules.doubleAfterSplit && dealer >= 5 && dealer <= 6 ? "split" : "hit";
  if (pair === 2 || pair === 3) {
    const minimum = rules.doubleAfterSplit ? 2 : 4;
    return dealer >= minimum && dealer <= 7 ? "split" : "hit";
  }
  return null;
}

function getSoftMove(
  cards: BJCard[],
  dealer: number,
  rules: BlackjackRules
): BlackjackMove {
  const total = getSoftTotal(cards);
  if (total >= 20) return "stand";
  if (total === 19) return rules.dealerHitsSoft17 && dealer === 6 ? "double" : "stand";
  if (total === 18) {
    const minDouble = rules.dealerHitsSoft17 ? 2 : 3;
    if (dealer >= minDouble && dealer <= 6) return "double";
    if (dealer === 2 || dealer === 7 || dealer === 8) return "stand";
    return "hit";
  }
  if (total === 17) {
    const minDouble = rules.dealerHitsSoft17 ? 2 : 3;
    return dealer >= minDouble && dealer <= 6 ? "double" : "hit";
  }
  if (total === 16 || total === 15) return dealer >= 4 && dealer <= 6 ? "double" : "hit";
  if (total === 14 || total === 13) return dealer >= 5 && dealer <= 6 ? "double" : "hit";
  return "hit";
}

function getHardMove(
  cards: BJCard[],
  dealer: number,
  rules: BlackjackRules
): BlackjackMove {
  const total = getBestTotal(cards);
  const lowDeck = rules.numDecks <= 2;

  if (shouldSurrender(total, dealer, rules)) return "surrender";
  if (total >= 17) return "stand";
  if (total >= 13) return dealer >= 2 && dealer <= 6 ? "stand" : "hit";
  if (total === 12) return dealer >= 4 && dealer <= 6 ? "stand" : "hit";
  if (total === 11) {
    if (dealer <= 10 || rules.dealerHitsSoft17 || lowDeck) return "double";
    return "hit";
  }
  if (total === 10) return dealer >= 2 && dealer <= 9 ? "double" : "hit";
  if (total === 9) {
    const minimum = lowDeck ? 2 : 3;
    return dealer >= minimum && dealer <= 6 ? "double" : "hit";
  }
  if (lowDeck && total === 8 && dealer >= 5 && dealer <= 6) return "double";
  return "hit";
}

function shouldSurrender(
  total: number,
  dealer: number,
  rules: BlackjackRules
): boolean {
  if (!rules.surrenderAllowed) return false;
  if (total === 16 && (dealer === 9 || dealer === 10 || dealer === 11)) return true;
  if (total === 15 && dealer === 10) return true;
  if (rules.dealerHitsSoft17 && total === 15 && dealer === 11) return true;
  if (rules.dealerHitsSoft17 && rules.numDecks >= 4 && total === 17 && dealer === 11) return true;
  return false;
}
