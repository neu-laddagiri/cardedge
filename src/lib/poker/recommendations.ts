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

export function recommendPokerAction(
  equity: number,
  potOdds: number,
  gameState: PokerGameState,
  marginOfError = 0
): PokerRecommendation {
  const { amountToCall } = gameState;
  const lowerEquity = Math.max(0, equity - marginOfError);
  const upperEquity = Math.min(100, equity + marginOfError);

  if (amountToCall === 0) {
    if (equity >= 65) {
      return {
        action: "bet",
        explanation: `Estimated ${equity.toFixed(1)}% equity with no bet to call. A value bet is the estimated recommendation to build the pot.`,
        potOdds: 0,
        equityNeeded: 0,
        confidence: lowerEquity >= 60 ? "high" : "medium",
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

  if (upperEquity < potOdds) {
    return {
      action: "fold",
      explanation: `Estimated ${equity.toFixed(1)}% effective equity remains below the ${potOdds.toFixed(1)}% break-even threshold after simulation uncertainty. Folding is the positive-discipline training play.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: upperEquity < potOdds - 5 ? "high" : "medium",
    };
  }

  if (lowerEquity < potOdds) {
    return {
      action: "call",
      explanation: `Estimated ${equity.toFixed(1)}% effective equity overlaps the ${potOdds.toFixed(1)}% break-even threshold. Calling is marginal and sensitive to the modeled ranges.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: "low",
    };
  }

  if (lowerEquity >= potOdds + 15) {
    return {
      action: "raise",
      explanation: `Estimated ${equity.toFixed(1)}% effective equity is comfortably above the ${potOdds.toFixed(1)}% break-even threshold. Raising for value is the training recommendation.`,
      potOdds,
      equityNeeded: potOdds,
      confidence: "high",
    };
  }

  return {
    action: "call",
    explanation: `Estimated ${equity.toFixed(1)}% effective equity clears the ${potOdds.toFixed(1)}% break-even threshold. Calling is the lower-variance training recommendation.`,
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
