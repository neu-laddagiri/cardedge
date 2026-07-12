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
import { getCommunityCardArray } from "./monteCarlo";
import { formatCurrency } from "../money";

export function getPotOddsFormula(
  amountToCall: number,
  pot: number
): string {
  if (amountToCall <= 0) return "No call required";
  const total = pot + amountToCall;
  return `${formatCurrency(amountToCall)} / (${formatCurrency(pot)} + ${formatCurrency(amountToCall)}) = ${amountToCall}/${total}`;
}

export function formatStreet(street: Street): string {
  return street.charAt(0).toUpperCase() + street.slice(1);
}

export function getUsedCards(state: PokerGameState): Card[] {
  const cards: Card[] = [];
  if (state.heroCards[0]) cards.push(state.heroCards[0]);
  if (state.heroCards[1]) cards.push(state.heroCards[1]);
  cards.push(...getCommunityCardArray(state.communityCards));
  return cards;
}

export function analyzeOpponentThreats(
  communityCards: Card[],
  players: Player[],
  heroId: string | null
): OpponentThreat[] {
  const threats: OpponentThreat[] = [];
  const board = communityCards;

  if (board.length === 0) {
    return [
      {
        category: "Preflop ranges",
        likelihood: "medium",
        description:
          "Estimated opponent holdings vary widely preflop. Tight players likely have premium pairs and broadway cards.",
      },
    ];
  }

  const suits = board.map((c) => c.suit);
  const suitCounts: Record<string, number> = {};
  for (const s of suits) {
    suitCounts[s] = (suitCounts[s] || 0) + 1;
  }
  const maxSuit = Math.max(...Object.values(suitCounts));

  if (maxSuit >= 2) {
    threats.push({
      category: "Possible flush draw",
      likelihood: maxSuit >= 3 ? "high" : "medium",
      description: `${maxSuit} cards of the same suit on board — flush draws are plausible.`,
    });
  }

  const ranks = board.map((c) => rankValue(c.rank)).sort((a, b) => a - b);
  const hasPair = new Set(ranks).size < ranks.length;
  if (hasPair) {
    threats.push({
      category: "Set / two pair risk",
      likelihood: "high",
      description:
        "Paired board increases likelihood of sets, two pair, and full houses.",
    });
  } else {
    threats.push({
      category: "Possible pair / top pair",
      likelihood: "medium",
      description:
        "Unpaired board — opponents may hold top pair or overpairs depending on preflop action.",
    });
  }

  for (let i = 0; i < ranks.length - 2; i++) {
    if (ranks[i + 2] - ranks[i] <= 4) {
      threats.push({
        category: "Possible straight draw",
        likelihood: "medium",
        description: "Connected cards suggest open-ended or gutshot straight draws.",
      });
      break;
    }
  }

  const highCard = Math.max(...ranks);
  if (highCard >= 12) {
    threats.push({
      category: "Overpair risk",
      likelihood: "medium",
      description:
        "High board cards mean pocket pairs above the board are strong holdings.",
    });
  }

  const opponents = players.filter((p) => p.id !== heroId && p.status !== "folded");
  for (const opp of opponents) {
    const styleNote = getStyleThreatNote(opp.style);
    if (styleNote) {
      threats.push({
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

function rankValue(rank: Card["rank"]): number {
  const map: Record<string, number> = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    T: 10, J: 11, Q: 12, K: 13, A: 14,
  };
  return map[rank] ?? 0;
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
