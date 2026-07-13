import { create } from "zustand";

export type SyncStatus = "local" | "syncing" | "synced" | "error";

interface SyncStatusStore {
  status: SyncStatus;
  message: string | null;
  setSyncStatus: (status: SyncStatus, message?: string | null) => void;
}

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  status: "local",
  message: null,
  setSyncStatus: (status, message = null) => set({ status, message }),
}));
