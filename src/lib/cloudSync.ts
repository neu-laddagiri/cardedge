/**
 * Pure reconciliation behind UserDataSync.
 *
 * Each device remembers which records it has seen on the server. That lets a sync tell three
 * cases apart: a record removed on this device (delete it in the cloud), a record added on
 * another device (leave it alone), and a record deleted on another device (drop the local copy).
 */

export type RecordKind = "poker" | "blackjack" | "sessions";

const RECORD_KINDS: RecordKind[] = ["poker", "blackjack", "sessions"];

/** What this device believes the server holds, per kind: record id → serialized record. */
export type SyncedRecords = Record<RecordKind, Map<string, string>>;

export type SyncedIds = Record<RecordKind, Set<string>>;

export function rememberRecords<T extends { id: string }>(records: T[]): Map<string, string> {
  return new Map(records.map((record) => [record.id, JSON.stringify(record)]));
}

/**
 * Combines the account's records with this device's copy at sign-in. The server copy wins for
 * records both sides have unless `preferLocal` says the local edit is newer. A local record the
 * server no longer has is dropped when this device synced it before (another device deleted
 * it) and kept when it never reached the server (made as a guest or while offline), so it uploads.
 */
export function mergeAtSignIn<T extends { id: string }>(
  remote: T[],
  local: T[],
  syncedBefore: ReadonlySet<string>,
  preferLocal: (local: T, remote: T) => boolean = () => false
): T[] {
  const merged = new Map(remote.map((record) => [record.id, record]));
  for (const record of local) {
    const remoteRecord = merged.get(record.id);
    if (remoteRecord) {
      if (preferLocal(record, remoteRecord)) merged.set(record.id, record);
    } else if (!syncedBefore.has(record.id)) {
      merged.set(record.id, record);
    }
  }
  return [...merged.values()];
}

/**
 * The upload for one kind: new or edited records to upsert, and records this device synced
 * before but no longer has to delete. Records only the server has (added on another device
 * since this device loaded) are never deleted.
 */
export function planPush<T extends { id: string }>(
  synced: ReadonlyMap<string, string>,
  local: T[]
): { upserts: T[]; deletes: string[] } {
  const localIds = new Set<string>();
  const upserts: T[] = [];
  for (const record of local) {
    localIds.add(record.id);
    if (synced.get(record.id) !== JSON.stringify(record)) upserts.push(record);
  }
  const deletes = [...synced.keys()].filter((id) => !localIds.has(id));
  return { upserts, deletes };
}

const STORAGE_PREFIX = "cardedge-synced-ids-v1:";

function emptyIds(): SyncedIds {
  return { poker: new Set(), blackjack: new Set(), sessions: new Set() };
}

/** The record ids this browser last knew were on the server for this account. */
export function loadSyncedIds(userId: string): SyncedIds {
  const ids = emptyIds();
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_PREFIX + userId) ?? "null");
    if (!stored || typeof stored !== "object") return ids;
    for (const kind of RECORD_KINDS) {
      const list = (stored as Record<string, unknown>)[kind];
      if (Array.isArray(list)) {
        list.forEach((id) => {
          if (typeof id === "string") ids[kind].add(id);
        });
      }
    }
  } catch {
    // Unreadable storage only means every local record is treated as new and uploaded.
  }
  return ids;
}

export function saveSyncedIds(userId: string, synced: SyncedRecords): void {
  try {
    const stored = Object.fromEntries(RECORD_KINDS.map((kind) => [kind, [...synced[kind].keys()]]));
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(stored));
  } catch {
    // Storage can be full or blocked; the next successful sync writes it again.
  }
}
