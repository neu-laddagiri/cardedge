"use client";

import { summarizeBankroll } from "@/lib/bankroll";
import { signedCurrencyFromCents } from "@/lib/money";
import { useBankrollStore } from "@/store/bankrollStore";
import { cn } from "@/lib/utils";

function resultColor(value: number) {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-zinc-300";
}

export function ProfitSummary({ compact = false }: { compact?: boolean }) {
  const sessions = useBankrollStore((state) => state.sessions);
  const summary = summarizeBankroll(sessions);

  return (
    <section className="mobile-card overflow-hidden" aria-label="Profit and loss summary">
      <div className={cn("border-b border-white/6", compact ? "p-4" : "p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">All games</p>
            <p className={cn("mt-1 font-bold tabular-nums", compact ? "text-3xl" : "text-4xl", resultColor(summary.combinedCents))}>
              {signedCurrencyFromCents(summary.combinedCents)}
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
            {summary.sessionCount} {summary.sessionCount === 1 ? "session" : "sessions"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/6">
        <div className="p-4">
          <p className="text-xs text-zinc-500">Poker</p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", resultColor(summary.pokerCents))}>
            {signedCurrencyFromCents(summary.pokerCents)}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs text-zinc-500">Blackjack</p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", resultColor(summary.blackjackCents))}>
            {signedCurrencyFromCents(summary.blackjackCents)}
          </p>
        </div>
      </div>
    </section>
  );
}
