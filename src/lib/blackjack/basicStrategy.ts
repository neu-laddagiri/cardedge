import type {
  BJCard,
  BlackjackMove,
  BlackjackRules,
} from "./blackjackTypes";
import {
  dealerRankValue,
  getBestTotal,
  isPair,
  isSoftHand,
} from "./handValue";
import { lookupStrategy, type StrategyCode } from "./strategyCharts";

export interface StrategyContext {
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  rules: BlackjackRules;
}

export interface StrategyDecision {
  move: BlackjackMove;
  /** The chart's first choice when it isn't available for this hand. */
  preferredMove?: BlackjackMove;
}

/** 2–10 for number and face cards, 11 for an ace. */
function cardValue(card: BJCard): number {
  return card.rank === "A" ? 11 : Math.min(10, dealerRankValue(card.rank));
}

/**
 * Total-dependent basic strategy from the Wizard of Odds charts in
 * strategyCharts.ts (deck count, H17/S17, DAS and late surrender aware).
 * When the chart's move isn't available, the chart's own fallback is used
 * (Dh → hit, Ds → stand, Rh → hit, Rs → stand, Rp → split), and a pair that
 * can't be split is played as its total.
 */
export function getBasicStrategyDecision(
  cards: BJCard[],
  dealerUpcard: BJCard,
  context: StrategyContext
): StrategyDecision {
  const total = getBestTotal(cards);
  if (total >= 21) return { move: "stand" };
  const dealer = cardValue(dealerUpcard);

  if (isPair(cards)) {
    const pairCode = lookupStrategy("pair", cardValue(cards[0]), dealer, context.rules);
    if (context.canSplit) return resolve(pairCode, context);
    if (pairCode === "Rp" && context.canSurrender) return { move: "surrender" };
    const asTotal = resolve(totalCode(cards, dealer, context.rules), context);
    return pairCode === "P" || pairCode === "Rp"
      ? { move: asTotal.move, preferredMove: "split" }
      : asTotal;
  }

  return resolve(totalCode(cards, dealer, context.rules), context);
}

export function getBasicStrategyMove(
  cards: BJCard[],
  dealerUpcard: BJCard,
  context: StrategyContext
): BlackjackMove {
  return getBasicStrategyDecision(cards, dealerUpcard, context).move;
}

function totalCode(cards: BJCard[], dealer: number, rules: BlackjackRules): StrategyCode {
  return lookupStrategy(isSoftHand(cards) ? "soft" : "hard", getBestTotal(cards), dealer, rules);
}

function resolve(code: StrategyCode, context: StrategyContext): StrategyDecision {
  // Surrender is only worth naming as "preferred" in games that offer it.
  const surrender: BlackjackMove | undefined = context.rules.surrenderAllowed ? "surrender" : undefined;
  switch (code) {
    case "H":
      return { move: "hit" };
    case "S":
      return { move: "stand" };
    case "P":
      return { move: "split" };
    case "Dh":
      return context.canDouble ? { move: "double" } : { move: "hit", preferredMove: "double" };
    case "Ds":
      return context.canDouble ? { move: "double" } : { move: "stand", preferredMove: "double" };
    case "Rh":
      return context.canSurrender ? { move: "surrender" } : { move: "hit", preferredMove: surrender };
    case "Rs":
      return context.canSurrender ? { move: "surrender" } : { move: "stand", preferredMove: surrender };
    case "Rp":
      return context.canSurrender ? { move: "surrender" } : { move: "split", preferredMove: surrender };
  }
}
