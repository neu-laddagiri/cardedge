"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { GameSession, GameType } from "@/lib/bankroll";
import { sessionNet, summarizeBankroll } from "@/lib/bankroll";
import { formatCents, signedCurrencyFromCents, toCents } from "@/lib/money";
import { useBankrollStore } from "@/store/bankrollStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSyncStatusStore } from "@/store/syncStatusStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ProfitSummary } from "./ProfitSummary";

function localDateTimeValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatPlayedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

interface SessionFormState {
  gameType: GameType;
  playedAt: string;
  buyIn: string;
  cashOut: string;
  note: string;
}

const emptyForm = (): SessionFormState => ({
  gameType: "poker",
  playedAt: localDateTimeValue(),
  buyIn: "",
  cashOut: "",
  note: "",
});

export function BankrollDashboard() {
  const sessions = useBankrollStore((state) => state.sessions);
  const addSession = useBankrollStore((state) => state.addSession);
  const updateSession = useBankrollStore((state) => state.updateSession);
  const deleteSession = useBankrollStore((state) => state.deleteSession);
  const { user } = useAuth();
  const syncStatus = useSyncStatusStore((state) => state.status);
  const [formOpen, setFormOpen] = useState(sessions.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const summary = useMemo(() => summarizeBankroll(sessions), [sessions]);
  const previewNet = toCents(Number(form.cashOut || 0)) - toCents(Number(form.buyIn || 0));

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const editSession = (session: GameSession) => {
    setForm({
      gameType: session.gameType,
      playedAt: localDateTimeValue(new Date(session.playedAt)),
      buyIn: (session.buyInCents / 100).toString(),
      cashOut: (session.cashOutCents / 100).toString(),
      note: session.note,
    });
    setEditingId(session.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      gameType: form.gameType,
      playedAt: new Date(form.playedAt).toISOString(),
      buyInCents: toCents(Number(form.buyIn)),
      cashOutCents: toCents(Number(form.cashOut)),
      note: form.note,
    };
    if (editingId) updateSession(editingId, input);
    else addSession(input);
    closeForm();
  };

  return (
    <div className="space-y-4">
      <ProfitSummary />

      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-semibold text-zinc-200">Session ledger</p>
          <p className="text-xs text-zinc-500">
            {user ? (syncStatus === "synced" ? "Synced to your account" : "Cloud sync active") : "Saved on this phone"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (formOpen && !editingId) closeForm();
            else {
              setEditingId(null);
              setForm(emptyForm());
              setFormOpen(true);
            }
          }}
        >
          {formOpen && !editingId ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen && !editingId ? "Close" : "Add result"}
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="mobile-card space-y-4 p-4">
          <div>
            <p className="eyebrow">{editingId ? "Edit session" : "New session"}</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">What did you finish with?</h2>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs text-zinc-500">Game</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["poker", "blackjack"] as GameType[]).map((gameType) => (
                <button
                  key={gameType}
                  type="button"
                  aria-pressed={form.gameType === gameType}
                  onClick={() => setForm((current) => ({ ...current, gameType }))}
                  className={cn("min-h-12 rounded-xl border text-sm font-semibold capitalize", form.gameType === gameType ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-white/8 bg-white/4 text-zinc-400")}
                >
                  {gameType}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs text-zinc-500">
            Date and time
            <span className="relative mt-1.5 block">
              <CalendarDays className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
              <input
                required
                type="datetime-local"
                value={form.playedAt}
                onChange={(event) => setForm((current) => ({ ...current, playedAt: event.target.value }))}
                className="mobile-input pl-10"
              />
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-zinc-500">
              Buy-in
              <span className="relative mt-1.5 block">
                <span className="pointer-events-none absolute left-3 top-3 text-zinc-500">$</span>
                <input
                  required
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buyIn}
                  onChange={(event) => setForm((current) => ({ ...current, buyIn: event.target.value }))}
                  className="mobile-input pl-7"
                  placeholder="200"
                />
              </span>
            </label>
            <label className="text-xs text-zinc-500">
              Cash-out
              <span className="relative mt-1.5 block">
                <span className="pointer-events-none absolute left-3 top-3 text-zinc-500">$</span>
                <input
                  required
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cashOut}
                  onChange={(event) => setForm((current) => ({ ...current, cashOut: event.target.value }))}
                  className="mobile-input pl-7"
                  placeholder="325"
                />
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5">
            <span className="text-sm text-zinc-400">Session result</span>
            <span className={cn("text-lg font-bold tabular-nums", previewNet > 0 ? "text-emerald-400" : previewNet < 0 ? "text-red-400" : "text-zinc-300")}>
              {signedCurrencyFromCents(previewNet)}
            </span>
          </div>

          <label className="block text-xs text-zinc-500">
            Note <span className="text-zinc-700">(optional)</span>
            <textarea
              rows={2}
              maxLength={300}
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              className="mobile-input mt-1.5 resize-none"
              placeholder="Casino, stakes, or anything worth remembering"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button type="submit"><Check className="h-4 w-4" />{editingId ? "Save" : "Add result"}</Button>
          </div>
        </form>
      )}

      {!sessions.length ? (
        <div className="mobile-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-300">No results yet</p>
          <p className="mt-1 text-sm text-zinc-500">Add a completed poker or blackjack session to start your ledger.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const net = sessionNet(session);
            return (
              <article key={session.id} className="mobile-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", session.gameType === "poker" ? "bg-emerald-500/12 text-emerald-300" : "bg-[#c9a84c]/12 text-[#d7b75b]")}>{session.gameType}</span>
                      <span className="text-xs text-zinc-500">{formatPlayedAt(session.playedAt)}</span>
                    </div>
                    <p className={cn("mt-2 text-2xl font-bold tabular-nums", net > 0 ? "text-emerald-400" : net < 0 ? "text-red-400" : "text-zinc-200")}>{signedCurrencyFromCents(net)}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{formatCents(session.buyInCents)} in · {formatCents(session.cashOutCents)} out</p>
                    {session.note && <p className="mt-2 text-sm text-zinc-400">{session.note}</p>}
                  </div>
                  {pendingDeleteId === session.id ? (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setPendingDeleteId(null)} className="min-h-11 rounded-xl px-2 text-xs text-zinc-400">Cancel</button>
                      <button type="button" onClick={() => { deleteSession(session.id); setPendingDeleteId(null); }} className="min-h-11 rounded-xl bg-red-500/12 px-2 text-xs text-red-300">Delete</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button type="button" aria-label={`Edit ${session.gameType} session from ${formatPlayedAt(session.playedAt)}`} onClick={() => editSession(session)} className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 active:bg-white/5"><Pencil className="h-4 w-4" /></button>
                      <button type="button" aria-label={`Delete ${session.gameType} session from ${formatPlayedAt(session.playedAt)}`} onClick={() => setPendingDeleteId(session.id)} className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 active:bg-red-500/10 active:text-red-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {summary.sessionCount > 0 && (
        <div className="mobile-card grid grid-cols-2 gap-px overflow-hidden bg-white/6 text-sm">
          <div className="bg-[#0a0f0d] p-4"><p className="text-xs text-zinc-500">Total buy-ins</p><p className="mt-1 font-semibold tabular-nums text-zinc-200">{formatCents(summary.totalBuyInCents)}</p></div>
          <div className="bg-[#0a0f0d] p-4"><p className="text-xs text-zinc-500">Total cash-outs</p><p className="mt-1 font-semibold tabular-nums text-zinc-200">{formatCents(summary.totalCashOutCents)}</p></div>
        </div>
      )}
    </div>
  );
}
