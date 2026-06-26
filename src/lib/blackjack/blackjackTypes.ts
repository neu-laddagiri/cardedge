export type BJSuit = "clubs" | "diamonds" | "hearts" | "spades";

export type BJRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface BJCard {
  rank: BJRank;
  suit: BJSuit;
}

export interface BlackjackRules {
  numDecks: 1 | 2 | 4 | 6 | 8;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrenderAllowed: boolean;
  blackjackPayout: "3:2" | "6:5";
}

export type HandStatus = "active" | "stood" | "bust" | "blackjack" | "surrendered" | "doubled";

export interface BlackjackHand {
  id: string;
  cards: BJCard[];
  status: HandStatus;
  isSplit: boolean;
  bet: number;
}

export interface BlackjackPlayer {
  id: string;
  name: string;
  hands: BlackjackHand[];
}

export interface BlackjackDecisionInput {
  hand: BlackjackHand;
  dealerUpcard: BJCard;
  rules: BlackjackRules;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

export type BlackjackMove =
  | "hit"
  | "stand"
  | "double"
  | "split"
  | "surrender";

export interface BlackjackRecommendation {
  move: BlackjackMove;
  fallbackMove?: BlackjackMove;
  explanation: string;
  handTotal: string;
  handType: "hard" | "soft" | "pair" | "blackjack";
  dealerUpcard: string;
  ruleNotes: string[];
}
