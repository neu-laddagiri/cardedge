"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { CasinoShell } from "@/components/layout/CasinoShell";
import { PokerTable } from "@/components/poker/PokerTable";
import { PlayerManager } from "@/components/poker/PlayerManager";
import { StreetControls } from "@/components/poker/StreetControls";
import { PotTracker } from "@/components/poker/PotTracker";
import { PokerOddsPanel } from "@/components/poker/PokerOddsPanel";
import { PokerActionPanel } from "@/components/poker/PokerActionPanel";
import { PokerHistoryPanel } from "@/components/poker/PokerHistoryPanel";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ToolTabs } from "@/components/ui/ToolTabs";
import { Button } from "@/components/ui/Button";
import { usePokerStore } from "@/store/pokerStore";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type PokerTab = "hand" | "action" | "odds" | "players" | "saved";

const tabs = [
  { id: "hand", label: "Hand" },
  { id: "action", label: "Action" },
  { id: "odds", label: "Odds" },
  { id: "players", label: "Players" },
  { id: "saved", label: "Saved" },
] satisfies { id: PokerTab; label: string }[];

export default function PokerPage() {
  const [activeTab, setActiveTab] = useState<PokerTab>("hand");
  const resetGame = usePokerStore((state) => state.resetGame);
  const lastError = usePokerStore((state) => state.lastError);
  const pot = usePokerStore((state) => state.pot);
  const amountToCall = usePokerStore((state) => state.amountToCall);
  const recommendation = usePokerStore((state) => state.recommendation);
  const odds = usePokerStore((state) => state.oddsResult);

  return (
    <CasinoShell>
      <div className="mobile-page space-y-4">
        <div className="flex items-start justify-between gap-3 px-1">
          <div>
            <p className="eyebrow">Texas Hold&apos;em</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-100">Poker</h1>
            <p className="mt-0.5 text-xs text-zinc-500">Dollar stakes · live equity · pot odds</p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetGame} aria-label="Start a new poker hand">
            <RotateCcw className="h-4 w-4" /> New hand
          </Button>
        </div>

        <InlineAlert message={lastError} />

        <section className="mobile-card grid grid-cols-3 divide-x divide-white/6 overflow-hidden" aria-label="Current hand summary">
          <button type="button" onClick={() => setActiveTab("action")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Pot</span>
            <span className="mt-1 block text-sm font-semibold tabular-nums text-[#d7b75b]">{formatCurrency(pot)}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Call {formatCurrency(amountToCall)}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("odds")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Equity</span>
            <span className="mt-1 block text-sm font-semibold tabular-nums text-zinc-200">{odds ? `${odds.equityPercentage.toFixed(1)}%` : "—"}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Effective share</span>
          </button>
          <button type="button" onClick={() => setActiveTab("odds")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Move</span>
            <span className={cn("mt-1 block text-sm font-bold capitalize", recommendation ? "text-emerald-400" : "text-zinc-500")}>{recommendation?.action ?? "Add cards"}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Estimate</span>
          </button>
        </section>

        <ToolTabs tabs={tabs} active={activeTab} onChange={setActiveTab} label="Poker workspace" />

        <div className="space-y-4">
          {activeTab === "hand" && <><PokerTable /><StreetControls /></>}
          {activeTab === "action" && <><PotTracker /><PokerActionPanel /></>}
          {activeTab === "odds" && <PokerOddsPanel />}
          {activeTab === "players" && <PlayerManager />}
          {activeTab === "saved" && <PokerHistoryPanel />}
        </div>
      </div>
    </CasinoShell>
  );
}
