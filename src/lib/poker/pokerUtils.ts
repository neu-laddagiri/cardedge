import type {
  Card,
  OpponentThreat,
  OpponentStyle,
  Player,
  PokerGameState,
  PokerOddsResult,
  PokerRecommendation,
  Street,
} from "./pokerTypes";
import {
  calculatePotOdds,
  recommendPokerAction,
} from "./recommendations";
import { analyzeBoard } from "./boardAnalysis";
import { getCommunityCardArray } from "./monteCarlo";
import { formatCurrency, roundMoney } from "../money";

export function getPotOddsFormula(
  amountToCall: number,
  pot: number
): string {
  if (amountToCall <= 0) return "No call required";
  // Sum in money terms so cents don't show floating-point noise (0.1 + 0.2).
  const total = roundMoney(pot + amountToCall);
  return `${formatCurrency(amountToCall)} / (${formatCurrency(pot)} + ${formatCurrency(amountToCall)}) = ${formatCurrency(amountToCall)}/${formatCurrency(total)}`;
}

export function formatStreet(street: Street): string {
  return street.charAt(0).toUpperCase() + street.slice(1);
}

export function getUsedCards(
  heroCards: PokerGameState["heroCards"],
  communityCards: PokerGameState["communityCards"]
): Card[] {
  return [
    ...heroCards.filter((card): card is Card => card !== null),
    ...getCommunityCardArray(communityCards),
  ];
}

export function analyzeOpponentThreats(
  communityCards: Card[],
  players: Player[],
  heroId: string | null
): OpponentThreat[] {
  if (communityCards.length === 0) {
    return [
      {
        id: "preflop",
        category: "Preflop ranges",
        likelihood: "medium",
        description:
          "Estimated opponent holdings vary widely preflop. Tight players likely have premium pairs and broadway cards.",
      },
    ];
  }

  const board = analyzeBoard(communityCards);
  const threats: OpponentThreat[] = [];

  if (board.maxSuitCount >= 3) {
    threats.push({
      id: "flush",
      category: "Possible flush",
      likelihood: "high",
      description:
        board.maxSuitCount >= 4
          ? `${board.maxSuitCount} cards of one suit on board — anyone holding one more of that suit has a flush.`
          : "Three cards of one suit on board — an opponent with two of that suit already has a flush.",
    });
  } else if (board.maxSuitCount === 2 && !board.isRiver) {
    threats.push({
      id: "flush-draw",
      category: "Possible flush draw",
      likelihood: "medium",
      description: "Two cards of one suit on board — opponents with two more of that suit are drawing to a flush.",
    });
  }

  if (board.pairedRanks > 0) {
    threats.push({
      id: "paired",
      category: "Set / two pair risk",
      likelihood: "high",
      description:
        "Paired board increases likelihood of sets, two pair, and full houses.",
    });
  } else {
    threats.push({
      id: "top-pair",
      category: "Possible pair / top pair",
      likelihood: "medium",
      description:
        "Unpaired board — opponents may hold top pair or overpairs depending on preflop action.",
    });
  }

  // Three distinct ranks within five (aces count low too) allow straights.
  if (board.straightDensity >= 3) {
    threats.push({
      id: "straight",
      category: board.isRiver ? "Possible straight" : "Possible straight draw",
      likelihood: board.straightDensity >= 4 ? "high" : "medium",
      description: board.isRiver
        ? "Connected cards on board — some two-card hands now make a straight."
        : "Connected cards suggest open-ended or gutshot straight draws.",
    });
  }

  if (board.topRank <= 9) {
    threats.push({
      id: "overpair",
      category: "Overpair risk",
      likelihood: "medium",
      description: "Low board — any pocket pair of tens or better is an overpair.",
    });
  }

  const opponents = players.filter((p) => p.id !== heroId && p.status !== "folded");
  for (const opp of opponents) {
    const styleNote = getStyleThreatNote(opp.style);
    if (styleNote) {
      threats.push({
        id: `style-${opp.id}`,
        category: `${opp.name} (${opp.style})`,
        likelihood: "low",
        description: styleNote,
      });
    }
  }

  return threats;
}

function getStyleThreatNote(style: OpponentStyle): string | null {
  switch (style) {
    case "tight":
      return "Tight profile — likely strong made hands or premium draws when betting.";
    case "loose":
      return "Loose profile — wider range including weak pairs and speculative draws.";
    case "aggressive":
      return "Aggressive profile — may bet/raise with draws and semi-bluffs.";
    case "passive":
      return "Passive profile — bets often indicate made hands rather than bluffs.";
    default:
      return null;
  }
}

export function buildRecommendation(
  odds: PokerOddsResult | null,
  state: PokerGameState
): PokerRecommendation | null {
  if (!odds) return null;
  const potOdds = calculatePotOdds(state.amountToCall, state.pot);
  return recommendPokerAction(
    odds.equityPercentage,
    potOdds,
    state,
    odds.marginOfError
  );
}

export function formatActionLabel(
  type: string,
  amount?: number
): string {
  if (amount && (type === "bet" || type === "raise" || type === "call" || type === "all-in")) {
    return `${type} ${formatCurrency(amount)}`;
  }
  return type;
}

export function cardKey(card: Card): string {
  return `${card.rank}-${card.suit}`;
}
