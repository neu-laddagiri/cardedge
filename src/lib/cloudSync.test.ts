import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSyncedIds, mergeAtSignIn, planPush, rememberRecords, saveSyncedIds } from "./cloudSync";

interface Note {
  id: string;
  text: string;
  updatedAt?: string;
}

const note = (id: string, text = id, updatedAt?: string): Note => ({ id, text, updatedAt });
const ids = (records: { id: string }[]) => records.map((record) => record.id).sort();

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("mergeAtSignIn", () => {
  it("keeps cloud records and local records that never reached the cloud", () => {
    const merged = mergeAtSignIn([note("cloud")], [note("guest")], new Set());
    expect(ids(merged)).toEqual(["cloud", "guest"]);
  });

  it("drops local records another device deleted since this device synced them", () => {
    const merged = mergeAtSignIn([note("kept")], [note("kept"), note("deleted-elsewhere")], new Set(["kept", "deleted-elsewhere"]));
    expect(ids(merged)).toEqual(["kept"]);
  });

  it("prefers the cloud copy unless the local edit is newer", () => {
    const remote = [note("a", "cloud", "2026-01-02T00:00:00Z"), note("b", "cloud", "2026-01-02T00:00:00Z")];
    const local = [note("a", "older local", "2026-01-01T00:00:00Z"), note("b", "newer local", "2026-01-03T00:00:00Z")];
    const newer = (mine: Note, theirs: Note) => Date.parse(mine.updatedAt!) > Date.parse(theirs.updatedAt!);
    const merged = mergeAtSignIn(remote, local, new Set(["a", "b"]), newer);
    expect(merged.find((record) => record.id === "a")?.text).toBe("cloud");
    expect(merged.find((record) => record.id === "b")?.text).toBe("newer local");
  });
});

describe("planPush", () => {
  it("uploads only new and edited records", () => {
    const synced = rememberRecords([note("same"), note("edited")]);
    const plan = planPush(synced, [note("same"), note("edited", "changed"), note("new")]);
    expect(ids(plan.upserts)).toEqual(["edited", "new"]);
    expect(plan.deletes).toEqual([]);
  });

  it("deletes only records this device removed, never another device's additions", () => {
    // This device loaded "mine" and "removed"; another device has since added "theirs" to the
    // cloud, which this device has never seen.
    const synced = rememberRecords([note("mine"), note("removed")]);
    const plan = planPush(synced, [note("mine")]);
    expect(plan.deletes).toEqual(["removed"]);
    expect(plan.upserts).toEqual([]);
  });

  it("has nothing to do once the device matches what it synced", () => {
    const records = [note("a"), note("b")];
    expect(planPush(rememberRecords(records), records)).toEqual({ upserts: [], deletes: [] });
  });
});

describe("synced id storage", () => {
  it("round-trips per account", () => {
    saveSyncedIds("user-1", {
      poker: rememberRecords([note("hand")]),
      blackjack: new Map(),
      sessions: rememberRecords([note("s1"), note("s2")]),
    });
    const loaded = loadSyncedIds("user-1");
    expect([...loaded.poker]).toEqual(["hand"]);
    expect([...loaded.sessions].sort()).toEqual(["s1", "s2"]);
    expect(loadSyncedIds("user-2").sessions.size).toBe(0);
  });

  it("treats corrupt or blocked storage as nothing synced", () => {
    localStorage.setItem("cardedge-synced-ids-v1:user-1", "{not json");
    expect(loadSyncedIds("user-1").poker.size).toBe(0);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadSyncedIds("user-1").sessions.size).toBe(0);
  });
});
