"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Cloud, CloudOff, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { usePokerStore } from "@/store/pokerStore";
import { useBlackjackStore } from "@/store/blackjackStore";
import { useBankrollStore } from "@/store/bankrollStore";
import { useSyncStatusStore } from "@/store/syncStatusStore";
import { Button } from "@/components/ui/Button";

export function AccountPanel() {
  const { configured, loading, user, supabase } = useAuth();
  const router = useRouter();
  const pokerHands = usePokerStore((state) => state.savedHands.length);
  const blackjackSessions = useBlackjackStore((state) => state.savedSessions.length);
  const gameSessions = useBankrollStore((state) => state.sessions.length);
  const syncStatus = useSyncStatusStore((state) => state.status);
  const syncMessage = useSyncStatusStore((state) => state.message);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (loading) {
    return <div className="mobile-card h-40 animate-pulse bg-white/4" aria-label="Loading account" />;
  }

  if (!configured || !user) {
    return (
      <div className="space-y-4">
        <div className="mobile-card p-5">
          <p className="eyebrow">Guest mode</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-100">Your data is on this phone</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Sign in to back up your results and training history, then use the same data on another device.
          </p>
          {configured ? (
            <Link href="/login" className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white">
              Sign in or create account
            </Link>
          ) : (
            <p className="mt-4 rounded-xl bg-amber-500/8 px-3 py-2 text-sm text-amber-200">
              Secure account sync is not configured yet. Guest saving remains available.
            </p>
          )}
        </div>
        <LocalDataCounts pokerHands={pokerHands} blackjackSessions={blackjackSessions} gameSessions={gameSessions} />
      </div>
    );
  }

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    usePokerStore.getState().replaceSavedHands([]);
    useBlackjackStore.getState().replaceSavedSessions([]);
    useBankrollStore.getState().replaceSessions([]);
    router.replace("/");
    router.refresh();
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || newPassword.length < 8) return;
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordMessage(error?.message ?? "Password updated securely.");
    if (!error) setNewPassword("");
    setPending(false);
  };

  return (
    <div className="space-y-4">
      <section className="mobile-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Signed in</p>
            <h2 className="mt-1 truncate text-xl font-semibold text-zinc-100">{user.email}</h2>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2.5 text-sm">
          {syncStatus === "error" ? <CloudOff className="h-4 w-4 text-amber-400" /> : syncStatus === "synced" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Cloud className="h-4 w-4 text-zinc-400" />}
          <span className={syncStatus === "error" ? "text-amber-200" : "text-zinc-300"}>
            {syncStatus === "syncing" ? "Syncing your latest changes…" : syncStatus === "synced" ? "Everything is synced" : syncStatus === "error" ? "Saved locally; cloud sync will retry" : "Saved locally"}
          </span>
        </div>
        {syncMessage && syncStatus === "error" && <p className="mt-2 text-xs text-zinc-600">{syncMessage}</p>}
      </section>

      <LocalDataCounts pokerHands={pokerHands} blackjackSessions={blackjackSessions} gameSessions={gameSessions} />

      <details className="mobile-card group p-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-200">
          Change password
          <span className="text-zinc-600 transition-transform group-open:rotate-45">+</span>
        </summary>
        <form onSubmit={updatePassword} className="mt-3 space-y-3">
          <input
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mobile-input"
            placeholder="New password, at least 8 characters"
          />
          {passwordMessage && <p role="status" className="text-sm text-zinc-400">{passwordMessage}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
        </form>
      </details>

      <Button variant="secondary" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>

      <p className="px-2 text-center text-xs leading-relaxed text-zinc-600">
        Cards, notes, bankroll entries, and training history are private to your account. CardEdge never stores payment details.
      </p>
    </div>
  );
}

function LocalDataCounts({ pokerHands, blackjackSessions, gameSessions }: { pokerHands: number; blackjackSessions: number; gameSessions: number }) {
  return (
    <section className="mobile-card grid grid-cols-3 divide-x divide-white/6 text-center">
      <div className="p-4"><p className="text-xl font-bold text-zinc-100">{gameSessions}</p><p className="mt-1 text-[10px] text-zinc-500">Results</p></div>
      <div className="p-4"><p className="text-xl font-bold text-zinc-100">{pokerHands}</p><p className="mt-1 text-[10px] text-zinc-500">Poker hands</p></div>
      <div className="p-4"><p className="text-xl font-bold text-zinc-100">{blackjackSessions}</p><p className="mt-1 text-[10px] text-zinc-500">BJ sessions</p></div>
    </section>
  );
}
