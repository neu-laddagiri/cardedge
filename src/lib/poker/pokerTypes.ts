export type Suit = "clubs" | "diamonds" | "hearts" | "spades";

export type Rank =
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

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type PlayerStatus = "active" | "folded" | "all-in";

export type OpponentStyle =
  | "unknown"
  | "tight"
  | "loose"
  | "aggressive"
  | "passive";

export interface Player {
  id: string;
  name: string;
  stack: number;
  position: number;
  isHero: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  status: PlayerStatus;
  style: OpponentStyle;
  /** Optional user-defined starting-hand range percentage. */
  rangeOverride?: number;
  /** Chips committed during the current betting street. */
  streetCommitment: number;
  /** Chips committed during the complete hand. */
  totalCommitted: number;
  holeCards?: [Card, Card];
}

export type Street = "preflop" | "flop" | "turn" | "river";

export type ActionType =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all-in";

export interface PokerAction {
  id: string;
  playerId: string;
  type: ActionType;
  amount?: number;
  street: Street;
  timestamp: number;
  potAfter: number;
  amountToCallAfter: number;
  recommendationAtAction?: PokerRecommendationAction;
}

export interface PokerGameState {
  players: Player[];
  heroId: string | null;
  smallBlind: number;
  bigBlind: number;
  startingBuyIn: number;
  pot: number;
  currentBet: number;
  amountToCall: number;
  actingPlayerId: string | null;
  actedPlayerIds: string[];
  handComplete: boolean;
  street: Street;
  heroCards: [Card | null, Card | null];
  communityCards: {
    flop1: Card | null;
    flop2: Card | null;
    flop3: Card | null;
    turn: Card | null;
    river: Card | null;
  };
  actions: PokerAction[];
}

export interface PokerOddsResult {
  winPercentage: number;
  tiePercentage: number;
  losePercentage: number;
  /** Pot-share equity: wins plus the hero's fractional share of tied pots. */
  equityPercentage: number;
  /** Approximate 95% confidence interval around equity. */
  marginOfError: number;
  simulations: number;
  bestHand?: string;
  boardTexture?: string[];
  rangeSummary?: string[];
}

export type PokerRecommendationAction =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise";

export interface PokerRecommendation {
  action: PokerRecommendationAction;
  explanation: string;
  potOdds: number;
  equityNeeded: number;
  confidence: "low" | "medium" | "high";
}

export interface OpponentThreat {
  category: string;
  likelihood: "low" | "medium" | "high";
  description: string;
}

export interface OpponentSimulationProfile {
  id: string;
  name: string;
  style: OpponentStyle;
  /** Approximate percentage of starting hands in the modeled range. */
  rangePercent: number;
}

export type SimulationPrecision = "fast" | "balanced" | "precise";

export interface PokerHandRecord {
  id: string;
  savedAt: number;
  street: Street;
  heroCards: [Card | null, Card | null];
  communityCards: PokerGameState["communityCards"];
  players: Player[];
  actions: PokerAction[];
  pot: number;
  currentBet: number;
  amountToCall: number;
  actingPlayerId: string | null;
  actedPlayerIds: string[];
  handComplete: boolean;
  odds: PokerOddsResult | null;
  recommendation: PokerRecommendation | null;
  actualDecision?: ActionType;
  followedRecommendation?: boolean;
  recommendedDecision?: PokerRecommendationAction;
  note: string;
}
