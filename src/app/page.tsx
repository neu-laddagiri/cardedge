"use client";

import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Spade } from "lucide-react";
import { CasinoShell } from "@/components/layout/CasinoShell";
import { ProfitSummary } from "@/components/bankroll/ProfitSummary";
import { useBankrollStore } from "@/store/bankrollStore";
import { sessionNet } from "@/lib/bankroll";
import { signedCurrencyFromCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const latestSession = useBankrollStore((state) => state.sessions[0]);

  return (
    <CasinoShell>
      <div className="mobile-page space-y-5">
        <section className="px-1 pt-1">
          <p className="eyebrow">Decision trainer</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100">
            Play the spot.<br /><span className="text-zinc-500">Know the math.</span>
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Fast poker equity, rule-aware blackjack advice, and your real session results—built for your phone.
          </p>
        </section>

        <ProfitSummary compact />

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-zinc-200">Start training</h2>
            <span className="text-xs text-zinc-600">Full math, fewer taps</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/poker" className="mobile-card group min-h-40 p-4 active:border-emerald-500/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400"><Spade className="h-5 w-5" /></span>
              <h3 className="mt-5 font-semibold text-zinc-100">Poker</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">Equity, ranges, pot odds, and action advice.</p>
              <ArrowRight className="mt-3 h-4 w-4 text-emerald-500 transition-transform group-active:translate-x-1" />
            </Link>
            <Link href="/blackjack" className="mobile-card group min-h-40 p-4 active:border-[#c9a84c]/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a84c]/12 text-lg font-black text-[#d7b75b]">21</span>
              <h3 className="mt-5 font-semibold text-zinc-100">Blackjack</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">The right move for your hand and table rules.</p>
              <ArrowRight className="mt-3 h-4 w-4 text-[#c9a84c] transition-transform group-active:translate-x-1" />
            </Link>
          </div>
        </section>

        <Link href="/bankroll" className="mobile-card flex min-h-20 items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300"><ChartNoAxesCombined className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-zinc-200">{latestSession ? "Latest result" : "Track a result"}</span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500">
              {latestSession ? `${latestSession.gameType} · ${new Date(latestSession.playedAt).toLocaleDateString()}` : "Poker and blackjack totals, together and separate"}
            </span>
          </span>
          {latestSession && <span className={cn("text-sm font-bold tabular-nums", sessionNet(latestSession) > 0 ? "text-emerald-400" : sessionNet(latestSession) < 0 ? "text-red-400" : "text-zinc-300")}>{signedCurrencyFromCents(sessionNet(latestSession))}</span>}
          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
        </Link>

        <p className="px-3 pb-2 text-center text-[11px] leading-relaxed text-zinc-700">
          Training and record-keeping only. Probability estimates are not guarantees or financial advice.
        </p>
      </div>
    </CasinoShell>
  );
}
