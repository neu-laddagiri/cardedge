import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBankrollStore } from "@/store/bankrollStore";
import { useBlackjackStore } from "@/store/blackjackStore";
import { usePokerStore } from "@/store/pokerStore";
import { useSyncStatusStore } from "@/store/syncStatusStore";
import { UserDataSync } from "./UserDataSync";

type Row = Record<string, unknown> & { id: string };

/** A tiny in-memory stand-in for the two Supabase tables UserDataSync uses. */
class FakeServer {
  tables: Record<string, Row[]> = { training_records: [], game_sessions: [] };
  upserted: string[] = [];
  deleted: string[] = [];
  client = { from: (table: string) => new FakeQuery(this, table) };
}

class FakeQuery implements PromiseLike<{ data: Row[] | null; error: null }> {
  private mode: "select" | "upsert" | "delete" = "select";
  private filters: ((row: Row) => boolean)[] = [];
  private rows: Row[] = [];
  private window: [number, number] = [0, Infinity];

  constructor(private server: FakeServer, private table: string) {}

  select() { return this; }
  order() { return this; }
  range(from: number, to: number) { this.window = [from, to]; return this; }
  eq(column: string, value: unknown) { this.filters.push((row) => row[column] === value); return this; }
  in(column: string, values: unknown[]) { this.filters.push((row) => values.includes(row[column])); return this; }
  upsert(rows: Row[]) { this.mode = "upsert"; this.rows = rows; return this; }
  delete() { this.mode = "delete"; return this; }

  then<A = { data: Row[] | null; error: null }, B = never>(
    onFulfilled?: ((value: { data: Row[] | null; error: null }) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(onFulfilled, onRejected);
  }

  private run(): { data: Row[] | null; error: null } {
    const table = this.server.tables[this.table];
    const matches = (row: Row) => this.filters.every((filter) => filter(row));
    const key = (row: Row) => `${row.record_type ?? ""}:${row.id}`;
    if (this.mode === "upsert") {
      for (const row of this.rows) {
        const index = table.findIndex((existing) => key(existing) === key(row));
        if (index >= 0) table[index] = row;
        else table.push(row);
        this.server.upserted.push(row.id);
      }
      return { data: null, error: null };
    }
    if (this.mode === "delete") {
      this.server.deleted.push(...table.filter(matches).map((row) => row.id));
      this.server.tables[this.table] = table.filter((row) => !matches(row));
      return { data: null, error: null };
    }
    return { data: table.filter(matches).slice(this.window[0], this.window[1] + 1), error: null };
  }
}

const server = { current: new FakeServer() };
const user = { id: "user-1" };

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ configured: true, loading: false, user, supabase: server.current.client }),
}));

function sessionRow(id: string, note = ""): Row {
  return {
    id,
    user_id: user.id,
    game_type: "poker",
    played_at: "2026-10-01T20:00:00.000Z",
    buy_in_cents: 10000,
    cash_out_cents: 15000,
    note,
    created_at: "2026-10-01T23:00:00.000Z",
    updated_at: "2026-10-01T23:00:00.000Z",
  };
}

const localIds = () => useBankrollStore.getState().sessions.map((session) => session.id).sort();
const serverIds = () => server.current.tables.game_sessions.map((row) => row.id).sort();

beforeEach(() => {
  server.current = new FakeServer();
  localStorage.clear();
  useBankrollStore.getState().replaceSessions([]);
  usePokerStore.getState().replaceSavedHands([]);
  useBlackjackStore.getState().replaceSavedSessions([]);
});

afterEach(() => {
  localStorage.clear();
});

describe("UserDataSync", () => {
  it("never deletes records another device added after this one loaded", async () => {
    server.current.tables.game_sessions.push(sessionRow("from-laptop"));
    render(<UserDataSync />);
    await waitFor(() => expect(localIds()).toEqual(["from-laptop"]));

    // Another device saves a session while this one stays open.
    server.current.tables.game_sessions.push(sessionRow("from-phone"));

    const added = useBankrollStore.getState().addSession({
      gameType: "blackjack",
      playedAt: "2026-10-02T20:00:00.000Z",
      buyInCents: 5000,
      cashOutCents: 2500,
    });
    await waitFor(() => expect(server.current.upserted).toContain(added.id));
    await waitFor(() => expect(useSyncStatusStore.getState().status).toBe("synced"));
    expect(serverIds()).toEqual([added.id, "from-laptop", "from-phone"].sort());
    expect(server.current.upserted).toEqual([added.id]); // only the new session uploads

    useBankrollStore.getState().deleteSession("from-laptop");
    await waitFor(() => expect(server.current.deleted).toEqual(["from-laptop"]));
    await waitFor(() => expect(useSyncStatusStore.getState().status).toBe("synced"));
    expect(serverIds()).toEqual([added.id, "from-phone"].sort());
  });

  it("uploads guest records and keeps deletions made on another device", async () => {
    // This browser synced "deleted-on-phone" before; the phone has since deleted it.
    localStorage.setItem("cardedge-synced-ids-v1:user-1", JSON.stringify({ sessions: ["deleted-on-phone"] }));
    useBankrollStore.getState().replaceSessions([
      { ...sessionFromRow(sessionRow("deleted-on-phone")) },
      { ...sessionFromRow(sessionRow("made-as-guest")) },
    ]);

    render(<UserDataSync />);
    await waitFor(() => expect(server.current.upserted).toEqual(["made-as-guest"]));
    expect(localIds()).toEqual(["made-as-guest"]);
    expect(serverIds()).toEqual(["made-as-guest"]);
    expect(server.current.deleted).toEqual([]);
  });
});

function sessionFromRow(row: Row) {
  return {
    id: row.id,
    gameType: row.game_type as "poker",
    playedAt: row.played_at as string,
    buyInCents: row.buy_in_cents as number,
    cashOutCents: row.cash_out_cents as number,
    note: row.note as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
