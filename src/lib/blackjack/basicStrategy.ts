import type { BJCard, BJRank, BlackjackMove } from "./blackjackTypes";
import {
  dealerRankValue,
  getHardTotal,
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
  doubleAfterSplit: boolean;
}

function dealerVal(upcard: BJCard): number {
  if (upcard.rank === "A") return 11;
  if (["T", "J", "Q", "K"].includes(upcard.rank)) return 10;
  return dealerRankValue(upcard.rank);
}

function isDealerStrong(d: number): boolean {
  return d >= 9;
}

function isDealerWeak(d: number): boolean {
  return d >= 2 && d <= 6;
}

export function getBasicStrategyMove(
  cards: BJCard[],
  dealerUpcard: BJCard,
  ctx: StrategyContext
): BlackjackMove {
  if (isBlackjack(cards)) return "stand";

  const d = dealerVal(dealerUpcard);

  if (isPair(cards) && cards.length === 2 && ctx.canSplit) {
    const pairMove = getPairStrategy(cards, d, ctx);
    if (pairMove) return pairMove;
  }

  if (isSoftHand(cards)) {
    return getSoftStrategy(cards, d, ctx);
  }

  return getHardStrategy(cards, d, ctx);
}

function getPairStrategy(
  cards: BJCard[],
  d: number,
  ctx: StrategyContext
): BlackjackMove | null {
  const pairVal = getPairRank(cards);
  const rank = cards[0].rank;

  if (rank === "A") return "split";
  if (pairVal === 10) return "stand";
  if (pairVal === 9) {
    if ((d >= 2 && d <= 6) || d === 8 || d === 9) return "split";
    return "stand";
  }
  if (pairVal === 8) return "split";
  if (pairVal === 7) {
    if (d >= 2 && d <= 7) return "split";
    return "hit";
  }
  if (pairVal === 6) {
    if (d >= 2 && d <= 6) return "split";
    return "hit";
  }
  if (pairVal === 5) return getHardStrategy(cards, d, ctx);
  if (pairVal === 4) {
    if (ctx.doubleAfterSplit && d >= 5 && d <= 6) return "split";
    return "hit";
  }
  if (pairVal === 3 || pairVal === 2) {
    if (d >= 2 && d <= 7) return "split";
    return "hit";
  }

  return null;
}

function getSoftStrategy(
  cards: BJCard[],
  d: number,
  ctx: StrategyContext
): BlackjackMove {
  const total = getSoftTotal(cards);

  if (total >= 20) return "stand";

  if (total === 19) {
    if (ctx.canDouble && d === 6) return "double";
    return "stand";
  }

  if (total === 18) {
    if (ctx.canDouble && d >= 3 && d <= 6) return "double";
    if (d === 2 || d === 7 || d === 8) return "stand";
    return "hit";
  }

  if (total === 17) {
    if (ctx.canDouble && d >= 3 && d <= 6) return "double";
    return "hit";
  }

  if (total === 16 || total === 15) {
    if (ctx.canDouble && d >= 4 && d <= 6) return "double";
    return "hit";
  }

  if (total === 14 || total === 13) {
    if (ctx.canDouble && d >= 5 && d <= 6) return "double";
    return "hit";
  }

  return "hit";
}

function getHardStrategy(
  cards: BJCard[],
  d: number,
  ctx: StrategyContext
): BlackjackMove {
  const total = getHardTotal(cards);

  if (total >= 17) return "stand";

  if (total >= 13 && total <= 16) {
    if (ctx.canSurrender && (total === 15 || total === 16) && isDealerStrong(d)) {
      return "surrender";
    }
    if (isDealerWeak(d)) return "stand";
    return "hit";
  }

  if (total === 12) {
    if (d >= 4 && d <= 6) return "stand";
    return "hit";
  }

  if (total === 11) {
    if (ctx.canDouble) return "double";
    return "hit";
  }

  if (total === 10) {
    if (ctx.canDouble && d >= 2 && d <= 9) return "double";
    return "hit";
  }

  if (total === 9) {
    if (ctx.canDouble && d >= 3 && d <= 6) return "double";
    return "hit";
  }

  return "hit";
}

export function getFallbackMove(
  primary: BlackjackMove,
  ctx: StrategyContext
): BlackjackMove | undefined {
  if (primary === "double" && !ctx.canDouble) return "hit";
  if (primary === "split" && !ctx.canSplit) return "hit";
  if (primary === "surrender" && !ctx.canSurrender) return "hit";
  return undefined;
}
