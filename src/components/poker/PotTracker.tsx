"use client";

import { usePokerStore } from "@/store/pokerStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { calculatePotOdds } from "@/lib/poker/recommendations";
import { getPotOddsFormula } from "@/lib/poker/pokerUtils";

export function PotTracker() {
  const pot = usePokerStore((s) => s.pot);
  const amountToCall = usePokerStore((s) => s.amountToCall);
  const setPot = usePokerStore((s) => s.setPot);
  const setAmountToCall = usePokerStore((s) => s.setAmountToCall);

  const potOdds = calculatePotOdds(amountToCall, pot);
  const formula = getPotOddsFormula(amountToCall, pot);

  return (
    <GlassCard padding="sm">
      <SectionHeader title="Pot Tracker" subtitle="Auto-updated by actions; manual override available" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Pot before hero call</label>
          <input
            aria-label="Pot before hero call"
            type="number"
            min="0"
            step="1"
            value={pot}
            onChange={(e) => setPot(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-lg font-semibold text-[#c9a84c] tabular-nums"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Amount to Call</label>
          <input
            aria-label="Amount hero must call"
            type="number"
            min="0"
            step="1"
            value={amountToCall}
            onChange={(e) => setAmountToCall(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-lg font-semibold text-zinc-200 tabular-nums"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Pot Odds" value={`${potOdds.toFixed(1)}%`} variant="gold" />
        <StatPill
          label="Total Pot After Call"
          value={`$${pot + amountToCall}`}
          variant="default"
        />
      </div>

      <p className="text-[11px] text-zinc-500 mt-3 font-mono">{formula}</p>
    </GlassCard>
  );
}
