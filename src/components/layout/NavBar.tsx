"use client";

import Link from "next/link";
import { Cloud, CloudOff, Spade, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSyncStatusStore } from "@/store/syncStatusStore";

export function NavBar() {
  const { user, loading } = useAuth();
  const syncStatus = useSyncStatusStore((state) => state.status);

  return (
    <nav aria-label="Top navigation" className="top-bar">
      <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="CardEdge home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Spade className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-zinc-100">
            Card<span className="text-[#d7b75b]">Edge</span>
          </span>
        </Link>

        <Link
          href={user ? "/account" : "/login"}
          className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm text-zinc-300"
          aria-label={user ? "Open account and sync settings" : "Sign in"}
        >
          {!loading && user ? (
            syncStatus === "error" ? (
              <CloudOff className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Cloud className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            )
          ) : (
            <UserRound className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          )}
          <span className="max-w-28 truncate">{loading ? "" : user?.email?.split("@")[0] ?? "Sign in"}</span>
        </Link>
      </div>
    </nav>
  );
}
