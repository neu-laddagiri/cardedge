"use client";

import { useEffect, useRef, useState } from "react";
import type { BlackjackSessionRecord } from "@/lib/blackjack/blackjackTypes";
import type { GameSession } from "@/lib/bankroll";
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

function mergeById<T extends { id: string }>(remote: T[], local: T[]): T[] {
  const merged = new Map(remote.map((item) => [item.id, item]));
  local.forEach((item) => {
    if (!merged.has(item.id)) merged.set(item.id, item);
  });
  return [...merged.values()];
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

export function UserDataSync() {
  const { user, supabase } = useAuth();
  const pokerHands = usePokerStore((state) => state.savedHands);
  const blackjackSessions = useBlackjackStore((state) => state.savedSessions);
  const bankrollSessions = useBankrollStore((state) => state.sessions);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const lastSnapshot = useRef("");
  const syncedUserId = useRef<string | null>(null);
  const initializingUserId = useRef<string | null>(null);
  const setSyncStatus = useSyncStatusStore((state) => state.setSyncStatus);

  useEffect(() => {
    if (!user || !supabase) {
      if (syncedUserId.current) {
        usePokerStore.getState().replaceSavedHands([]);
        useBlackjackStore.getState().replaceSavedSessions([]);
        useBankrollStore.getState().replaceSessions([]);
      }
      syncedUserId.current = null;
      initializingUserId.current = null;
      lastSnapshot.current = "";
      setSyncStatus("local");
      return;
    }

    let cancelled = false;
    if (syncedUserId.current && syncedUserId.current !== user.id) {
      usePokerStore.getState().replaceSavedHands([]);
      useBlackjackStore.getState().replaceSavedSessions([]);
      useBankrollStore.getState().replaceSessions([]);
    }
    syncedUserId.current = user.id;
    initializingUserId.current = user.id;
    setSyncStatus("syncing");

    void Promise.all([
      supabase
        .from("training_records")
        .select("id, record_type, payload, saved_at")
        .order("saved_at", { ascending: false }),
      supabase
        .from("game_sessions")
        .select("id, game_type, played_at, buy_in_cents, cash_out_cents, note, created_at, updated_at")
        .order("played_at", { ascending: false }),
    ]).then(([trainingResult, sessionsResult]) => {
      if (cancelled) return;
      if (trainingResult.error || sessionsResult.error) {
        setSyncStatus(
          "error",
          trainingResult.error?.message ?? sessionsResult.error?.message ?? "Cloud sync failed."
        );
        return;
      }

      const rows = (trainingResult.data ?? []) as TrainingRow[];
      const remotePoker = rows
        .filter((row) => row.record_type === "poker_hand")
        .map((row) => row.payload as PokerHandRecord);
      const remoteBlackjack = rows
        .filter((row) => row.record_type === "blackjack_session")
        .map((row) => row.payload as BlackjackSessionRecord);
      const remoteSessions = ((sessionsResult.data ?? []) as SessionRow[]).map(sessionFromRow);

      const mergedPoker = mergeById(remotePoker, usePokerStore.getState().savedHands);
      const mergedBlackjack = mergeById(
        remoteBlackjack,
        useBlackjackStore.getState().savedSessions
      );
      const mergedSessions = mergeById(remoteSessions, useBankrollStore.getState().sessions);

      usePokerStore.getState().replaceSavedHands(mergedPoker);
      useBlackjackStore.getState().replaceSavedSessions(mergedBlackjack);
      useBankrollStore.getState().replaceSessions(mergedSessions);
      lastSnapshot.current = "";
      initializingUserId.current = null;
      setReadyUserId(user.id);
      setSyncStatus("synced");
    });

    return () => {
      cancelled = true;
    };
  }, [setSyncStatus, supabase, user]);

  useEffect(() => {
    if (
      !user ||
      !supabase ||
      readyUserId !== user.id ||
      initializingUserId.current === user.id
    ) return;
    const snapshot = JSON.stringify([pokerHands, blackjackSessions, bankrollSessions]);
    if (snapshot === lastSnapshot.current) return;

    const timeout = window.setTimeout(() => {
      setSyncStatus("syncing");
      const now = new Date().toISOString();
      const trainingRows = [
        ...pokerHands.map((hand) => ({
          id: hand.id,
          user_id: user.id,
          record_type: "poker_hand" as const,
          saved_at: new Date(hand.savedAt).toISOString(),
          payload: hand,
          updated_at: now,
        })),
        ...blackjackSessions.map((session) => ({
          id: session.id,
          user_id: user.id,
          record_type: "blackjack_session" as const,
          saved_at: new Date(session.savedAt).toISOString(),
          payload: session,
          updated_at: now,
        })),
      ];
      const gameRows = bankrollSessions.map((session) => ({
        id: session.id,
        user_id: user.id,
        game_type: session.gameType,
        played_at: session.playedAt,
        buy_in_cents: session.buyInCents,
        cash_out_cents: session.cashOutCents,
        note: session.note,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      }));

      void Promise.all([
        trainingRows.length
          ? supabase.from("training_records").upsert(trainingRows, {
              onConflict: "user_id,record_type,id",
            })
          : Promise.resolve({ error: null }),
        gameRows.length
          ? supabase.from("game_sessions").upsert(gameRows)
          : Promise.resolve({ error: null }),
        supabase.from("training_records").select("id, record_type"),
        supabase.from("game_sessions").select("id"),
      ]).then(async ([trainingUpsert, gameUpsert, remoteTraining, remoteGames]) => {
        const firstError = trainingUpsert.error ?? gameUpsert.error ?? remoteTraining.error ?? remoteGames.error;
        if (firstError) {
          setSyncStatus("error", firstError.message);
          return;
        }

        const pokerIds = new Set(pokerHands.map((hand) => hand.id));
        const blackjackIds = new Set(blackjackSessions.map((session) => session.id));
        const missingPoker = (remoteTraining.data ?? [])
          .filter((row) => row.record_type === "poker_hand" && !pokerIds.has(row.id))
          .map((row) => row.id);
        const missingBlackjack = (remoteTraining.data ?? [])
          .filter((row) => row.record_type === "blackjack_session" && !blackjackIds.has(row.id))
          .map((row) => row.id);
        const localGameIds = new Set(bankrollSessions.map((session) => session.id));
        const missingGames = (remoteGames.data ?? [])
          .filter((row) => !localGameIds.has(row.id))
          .map((row) => row.id);

        const deletes = [];
        if (missingPoker.length) {
          deletes.push(
            supabase
              .from("training_records")
              .delete()
              .eq("record_type", "poker_hand")
              .in("id", missingPoker)
          );
        }
        if (missingBlackjack.length) {
          deletes.push(
            supabase
              .from("training_records")
              .delete()
              .eq("record_type", "blackjack_session")
              .in("id", missingBlackjack)
          );
        }
        if (missingGames.length) {
          deletes.push(supabase.from("game_sessions").delete().in("id", missingGames));
        }
        const deleteResults = await Promise.all(deletes);
        const deleteError = deleteResults.find((result) => result.error)?.error;
        if (deleteError) {
          setSyncStatus("error", deleteError.message);
          return;
        }

        lastSnapshot.current = snapshot;
        setSyncStatus("synced");
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
    user,
  ]);

  return null;
}
