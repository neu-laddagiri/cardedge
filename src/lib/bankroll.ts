export type GameType = "poker" | "blackjack";

export interface GameSession {
  id: string;
  gameType: GameType;
  playedAt: string;
  buyInCents: number;
  cashOutCents: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameSessionInput {
  gameType: GameType;
  playedAt: string;
  buyInCents: number;
  cashOutCents: number;
  note?: string;
}

export interface BankrollSummary {
  pokerCents: number;
  blackjackCents: number;
  combinedCents: number;
  totalBuyInCents: number;
  totalCashOutCents: number;
  sessionCount: number;
}

export function sessionNet(session: Pick<GameSession, "buyInCents" | "cashOutCents">): number {
  return session.cashOutCents - session.buyInCents;
}

export function summarizeBankroll(sessions: GameSession[]): BankrollSummary {
  return sessions.reduce<BankrollSummary>(
    (summary, session) => {
      const net = sessionNet(session);
      if (session.gameType === "poker") summary.pokerCents += net;
      else summary.blackjackCents += net;
      summary.combinedCents += net;
      summary.totalBuyInCents += session.buyInCents;
      summary.totalCashOutCents += session.cashOutCents;
      summary.sessionCount += 1;
      return summary;
    },
    {
      pokerCents: 0,
      blackjackCents: 0,
      combinedCents: 0,
      totalBuyInCents: 0,
      totalCashOutCents: 0,
      sessionCount: 0,
    }
  );
}
export function sortSessionsNewestFirst(sessions: GameSession[]): GameSession[] {
  return [...sessions].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );
}
