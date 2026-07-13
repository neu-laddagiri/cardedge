"use client";

import { useBlackjackStore } from "@/store/blackjackStore";
import type { BlackjackRules } from "@/lib/blackjack/blackjackTypes";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function BlackjackRulesPanel() {
  const rules = useBlackjackStore((s) => s.rules);
  const setRules = useBlackjackStore((s) => s.setRules);

  const deckOptions: BlackjackRules["numDecks"][] = [1, 2, 4, 6, 8];

  return (
    <GlassCard padding="sm">
      <SectionHeader title="Table Rules" subtitle="Configure casino rules" />

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Number of Decks</label>
          <div className="flex gap-1 mt-1">
            {deckOptions.map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRules({ numDecks: n })}
                aria-pressed={rules.numDecks === n}
                className={`min-h-11 flex-1 rounded-xl text-xs font-medium transition-colors ${
                  rules.numDecks === n
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-zinc-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Blackjack Payout</label>
          <div className="flex gap-1 mt-1">
            {(["3:2", "6:5"] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setRules({ blackjackPayout: p })}
                aria-pressed={rules.blackjackPayout === p}
                className={`min-h-11 flex-1 rounded-xl text-xs font-medium ${
                  rules.blackjackPayout === p
                    ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30"
                    : "bg-white/5 text-zinc-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {(
          [
            ["dealerHitsSoft17", "Dealer Hits Soft 17"],
            ["doubleAfterSplit", "Double After Split"],
            ["surrenderAllowed", "Surrender Allowed"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex min-h-12 cursor-pointer items-center justify-between"
          >
            <span className="text-sm text-zinc-300">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={rules[key]}
              aria-label={label}
              onClick={() => setRules({ [key]: !rules[key] })}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                rules[key] ? "bg-emerald-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  rules[key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </GlassCard>
  );
}
