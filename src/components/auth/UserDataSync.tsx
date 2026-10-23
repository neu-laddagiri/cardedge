"use client";

import { useEffect, useRef, useState } from "react";
import type { BlackjackSessionRecord } from "@/lib/blackjack/blackjackTypes";
import type { GameSession } from "@/lib/bankroll";
import {
  loadSyncedIds,
  mergeAtSignIn,
  planPush,
  rememberRecords,
  saveSyncedIds,
  type SyncedRecords,
} from "@/lib/cloudSync";
import type { PokerHandRecord } from "@/lib/poker/pokerTypes";
import { useBlackjackStore } from "@/store/blackjackStore";
import { usePokerStore } from "@/store/pokerStore";
import { useBankrollStore } from "@/store/bankrollStore";
import { useSyncStatusStore } from "@/store/syncStatusStore";
import { useAuth } from "./AuthProvider";

interface TrainingRow {
  id: string;
  record_type: "poker_hand" | "blackjack_session";
  payload: unknown;
  saved_at: string;
}

interface SessionRow {
  id: string;
  game_type: "poker" | "blackjack";
  played_at: string;
  buy_in_cents: number;
  cash_out_cents: number;
  note: string;
  created_at: string;
  updated_at: string;
}

type QueryResult = { error: { message: string } | null };

/** Supabase returns at most 1,000 rows per request by default. */
const PAGE_SIZE = 1000;

/** Reads every page, so an account with more rows than one request returns loads completely. */
async function selectAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<{ data: T[]; error: null } | { data: null; error: { message: string } }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return { data: rows, error: null };
  }
}

function sessionFromRow(row: SessionRow): GameSession {
  return {
    id: row.id,
    gameType: row.game_type,
    playedAt: row.played_at,
    buyInCents: row.buy_in_cents,
    cashOutCents: row.cash_out_cents,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Keeps a bankroll edit that never reached the server instead of the older cloud copy. */
function isNewerEdit(local: GameSession, remote: GameSession): boolean {
  return Date.parse(local.updatedAt) > Date.parse(remote.updatedAt);
}

export function UserDataSync() {
  const { user, supabase } = useAuth();
  // Token refreshes hand out a new user object; only a different account should reload.
  const userId = user?.id ?? null;
  const pokerHands = usePokerStore((state) => state.savedHands);
  const blackjackSessions = useBlackjackStore((state) => state.savedSessions);
  const bankrollSessions = useBankrollStore((state) => state.sessions);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  /** What this device knows is on the server; only these records may be deleted remotely. */
  const synced = useRef<SyncedRecords | null>(null);
  const syncedUserId = useRef<string | null>(null);
  const initializingUserId = useRef<string | null>(null);
  const setSyncStatus = useSyncStatusStore((state) => state.setSyncStatus);

  useEffect(() => {
    if (!userId || !supabase) {
      if (syncedUserId.current) {
        usePokerStore.getState().replaceSavedHands([]);
        useBlackjackStore.getState().replaceSavedSessions([]);
        useBankrollStore.getState().replaceSessions([]);
      }
      syncedUserId.current = null;
      initializingUserId.current = null;
      synced.current = null;
      setSyncStatus("local");
      return;
    }

    let cancelled = false;
    if (syncedUserId.current && syncedUserId.current !== userId) {
      usePokerStore.getState().replaceSavedHands([]);
      useBlackjackStore.getState().replaceSavedSessions([]);
      useBankrollStore.getState().replaceSessions([]);
    }
    syncedUserId.current = userId;
    initializingUserId.current = userId;
    synced.current = null;
    setSyncStatus("syncing");

    void Promise.all([
      selectAll<TrainingRow>((from, to) =>
        supabase
          .from("training_records")
          .select("id, record_type, payload, saved_at")
          .order("saved_at", { ascending: false })
          .order("record_type")
          .order("id")
          .range(from, to)
      ),
      selectAll<SessionRow>((from, to) =>
        supabase
          .from("game_sessions")
          .select("id, game_type, played_at, buy_in_cents, cash_out_cents, note, created_at, updated_at")
          .order("played_at", { ascending: false })
          .order("id")
          .range(from, to)
      ),
    ]).then(([trainingResult, sessionsResult]) => {
      if (cancelled) return;
      if (trainingResult.error || sessionsResult.error) {
        setSyncStatus(
          "error",
          trainingResult.error?.message ?? sessionsResult.error?.message ?? "Cloud sync failed."
        );
        return;
      }

      const remotePoker = trainingResult.data
        .filter((row) => row.record_type === "poker_hand")
        .map((row) => row.payload as PokerHandRecord);
      const remoteBlackjack = trainingResult.data
        .filter((row) => row.record_type === "blackjack_session")
        .map((row) => row.payload as BlackjackSessionRecord);
      const remoteSessions = sessionsResult.data.map(sessionFromRow);
      const syncedBefore = loadSyncedIds(userId);

      synced.current = {
        poker: rememberRecords(remotePoker),
        blackjack: rememberRecords(remoteBlackjack),
        sessions: rememberRecords(remoteSessions),
      };
      saveSyncedIds(userId, synced.current);
      initializingUserId.current = null;

      usePokerStore.getState().replaceSavedHands(
        mergeAtSignIn(remotePoker, usePokerStore.getState().savedHands, syncedBefore.poker)
      );
      useBlackjackStore.getState().replaceSavedSessions(
        mergeAtSignIn(remoteBlackjack, useBlackjackStore.getState().savedSessions, syncedBefore.blackjack)
      );
      useBankrollStore.getState().replaceSessions(
        mergeAtSignIn(remoteSessions, useBankrollStore.getState().sessions, syncedBefore.sessions, isNewerEdit)
      );
      setReadyUserId(userId);
      setSyncStatus("synced");
    });

    return () => {
      cancelled = true;
    };
  }, [setSyncStatus, supabase, userId]);

  useEffect(() => {
    if (
      !userId ||
      !supabase ||
      readyUserId !== userId ||
      initializingUserId.current === userId
    ) return;

    const timeout = window.setTimeout(() => {
      const known = synced.current;
      if (!known) return;
      const poker = planPush(known.poker, pokerHands);
      const blackjack = planPush(known.blackjack, blackjackSessions);
      const sessions = planPush(known.sessions, bankrollSessions);

      // Each request, plus what this device may remember once the server has applied it.
      const operations: { request: PromiseLike<QueryResult>; onSuccess: () => void }[] = [];
      const now = new Date().toISOString();
      const trainingRows = [
        ...poker.upserts.map((hand) => ({
          id: hand.id,
          user_id: userId,
          record_type: "poker_hand" as const,
          saved_at: new Date(hand.savedAt).toISOString(),
          payload: hand,
          updated_at: now,
        })),
        ...blackjack.upserts.map((session) => ({
          id: session.id,
          user_id: userId,
          record_type: "blackjack_session" as const,
          saved_at: new Date(session.savedAt).toISOString(),
          payload: session,
          updated_at: now,
        })),
      ];
      if (trainingRows.length) {
        operations.push({
          request: supabase.from("training_records").upsert(trainingRows, {
            onConflict: "user_id,record_type,id",
          }),
          onSuccess: () => {
            poker.upserts.forEach((hand) => known.poker.set(hand.id, JSON.stringify(hand)));
            blackjack.upserts.forEach((session) => known.blackjack.set(session.id, JSON.stringify(session)));
          },
        });
      }
      if (sessions.upserts.length) {
        operations.push({
          request: supabase.from("game_sessions").upsert(
            sessions.upserts.map((session) => ({
              id: session.id,
              user_id: userId,
              game_type: session.gameType,
              played_at: session.playedAt,
              buy_in_cents: session.buyInCents,
              cash_out_cents: session.cashOutCents,
              note: session.note,
              created_at: session.createdAt,
              updated_at: session.updatedAt,
            }))
          ),
          onSuccess: () => {
            sessions.upserts.forEach((session) => known.sessions.set(session.id, JSON.stringify(session)));
          },
        });
      }
      if (poker.deletes.length) {
        operations.push({
          request: supabase
            .from("training_records")
            .delete()
            .eq("record_type", "poker_hand")
            .in("id", poker.deletes),
          onSuccess: () => poker.deletes.forEach((id) => known.poker.delete(id)),
        });
      }
      if (blackjack.deletes.length) {
        operations.push({
          request: supabase
            .from("training_records")
            .delete()
            .eq("record_type", "blackjack_session")
            .in("id", blackjack.deletes),
          onSuccess: () => blackjack.deletes.forEach((id) => known.blackjack.delete(id)),
        });
      }
      if (sessions.deletes.length) {
        operations.push({
          request: supabase.from("game_sessions").delete().in("id", sessions.deletes),
          onSuccess: () => sessions.deletes.forEach((id) => known.sessions.delete(id)),
        });
      }
      if (!operations.length) return;

      setSyncStatus("syncing");
      void Promise.all(operations.map((operation) => operation.request)).then((results) => {
        results.forEach((result, index) => {
          if (!result.error) operations[index].onSuccess();
        });
        saveSyncedIds(userId, known);
        const failure = results.find((result) => result.error)?.error;
        if (synced.current !== known) return; // signed out or switched accounts meanwhile
        if (failure) setSyncStatus("error", failure.message);
        else setSyncStatus("synced");
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    bankrollSessions,
    blackjackSessions,
    pokerHands,
    readyUserId,
    setSyncStatus,
    supabase,
    userId,
  ]);

  return null;
}
