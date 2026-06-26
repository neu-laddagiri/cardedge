import type {
  PokerGameState,
  PokerRecommendation,
  PokerRecommendationAction,
} from "./pokerTypes";

export function calculatePotOdds(amountToCall: number, pot: number): number {
  if (amountToCall <= 0) return 0;
  const totalPot = pot + amountToCall;
  return (amountToCall / totalPot) * 100;
}

export function calculateEquityNeeded(amountToCall: number, pot: number): number {
  return calculatePotOdds(amountToCall, pot);
}

const SAFETY_MARGIN = 5;

export function recommendPokerAction(
  equity: number,
  potOdds: number,
  gameState: PokerGameState
): PokerRecommendation {
  const { amountToCall, pot } = gameState;
  const equityNeeded = potOdds + SAFETY_MARGIN;

  if (amountToCall === 0) {
    if (equity >= 65) {
      return {
        action: "bet",
        explanation: `Estimated ${equity.toFixed(1)}% equity with no bet to call. A value bet is the estimated recommendation to build the pot.`,
        potOdds: 0,
        equityNeeded: 0,
        confidence: "medium",
      };
    }
    if (equity >= 40) {
      return {
        action: "check",
        explanation: `Estimated ${equity.toFixed(1)}% equity. Checking is reasonable to control pot size and see more cards.`,
        potOdds: 0,
        equityNeeded: 0,
        confidence: "medium",
      };
    }
    return {
      action: "check",
      explanation: `Estimated ${equity.toFixed(1)}% equity is modest. Checking is the safer training-mode play.`,
      potOdds: 0,
      equityNeeded: 0,
      confidence: "low",
    };
  }

  if (equity < potOdds - SAFETY_MARGIN) {
    return {
      action: "fold",
      explanation: `Estimated ${equity.toFixed(1)}% win equity is below the ${potOdds.toFixed(1)}% pot odds threshold (with safety margin). Folding is the estimated recommendation.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: equity < potOdds - 10 ? "high" : "medium",
    };
  }

  if (equity < equityNeeded) {
    return {
      action: "call",
      explanation: `Estimated ${equity.toFixed(1)}% equity is slightly above ${potOdds.toFixed(1)}% pot odds. A call is marginal — proceed with caution in training mode.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: "low",
    };
  }

  if (equity >= equityNeeded + 15) {
    return {
      action: "raise",
      explanation: `Estimated ${equity.toFixed(1)}% equity is well above the ${potOdds.toFixed(1)}% pot odds needed. Raising for value is the estimated recommendation.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: "high",
    };
  }

  return {
    action: "call",
    explanation: `Estimated ${equity.toFixed(1)}% equity clears the ${potOdds.toFixed(1)}% pot odds bar. Calling is the estimated recommendation.`,
    potOdds,
    equityNeeded: potOdds,
    confidence: "medium",
  };
}

export function getActionColor(action: PokerRecommendationAction): string {
  switch (action) {
    case "fold":
      return "text-red-400";
    case "check":
      return "text-zinc-300";
    case "call":
      return "text-amber-400";
    case "bet":
    case "raise":
      return "text-emerald-400";
    default:
      return "text-white";
  }
}
