import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GameSession, GameSessionInput } from "@/lib/bankroll";
import { sortSessionsNewestFirst } from "@/lib/bankroll";

interface BankrollStore {
  sessions: GameSession[];
  addSession: (input: GameSessionInput) => GameSession;
  updateSession: (id: string, input: GameSessionInput) => void;
  deleteSession: (id: string) => void;
  replaceSessions: (sessions: GameSession[]) => void;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function cleanInput(input: GameSessionInput): GameSessionInput {
  return {
    gameType: input.gameType,
    playedAt: new Date(input.playedAt).toISOString(),
    buyInCents: Math.max(0, Math.round(input.buyInCents)),
    cashOutCents: Math.max(0, Math.round(input.cashOutCents)),
    note: input.note?.trim().slice(0, 300) ?? "",
  };
}

export const useBankrollStore = create<BankrollStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (input) => {
        const now = new Date().toISOString();
        const session: GameSession = {
          id: createId(),
          ...cleanInput(input),
          note: cleanInput(input).note ?? "",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ sessions: sortSessionsNewestFirst([session, ...state.sessions]) }));
        return session;
      },
      updateSession: (id, input) => set((state) => ({
        sessions: sortSessionsNewestFirst(
          state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  ...cleanInput(input),
                  note: cleanInput(input).note ?? "",
                  updatedAt: new Date().toISOString(),
                }
              : session
          )
        ),
      })),
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
      })),
      replaceSessions: (sessions) => set({ sessions: sortSessionsNewestFirst(sessions) }),
    }),
    {
      name: "cardedge-bankroll-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
