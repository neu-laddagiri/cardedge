"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { CasinoShell } from "@/components/layout/CasinoShell";
import { BlackjackTable } from "@/components/blackjack/BlackjackTable";
import { BlackjackRulesPanel } from "@/components/blackjack/BlackjackRulesPanel";
import { BasicStrategyPanel } from "@/components/blackjack/BasicStrategyPanel";
import { BlackjackPlayerManager } from "@/components/blackjack/BlackjackPlayerManager";
import { BlackjackTrainingPanel } from "@/components/blackjack/BlackjackTrainingPanel";
import { ToolTabs } from "@/components/ui/ToolTabs";
import { Button } from "@/components/ui/Button";
import { useBlackjackStore } from "@/store/blackjackStore";
import { formatCurrency } from "@/lib/money";
import { getDisplayTotal } from "@/lib/blackjack/handValue";
import { cn } from "@/lib/utils";

type BlackjackTab = "cards" | "advice" | "table" | "rules" | "saved";

const tabs = [
  { id: "cards", label: "Cards" },
  { id: "advice", label: "Advice" },
  { id: "table", label: "Table" },
  { id: "rules", label: "Rules" },
  { id: "saved", label: "Saved" },
] satisfies { id: BlackjackTab; label: string }[];

export default function BlackjackPage() {
  const [activeTab, setActiveTab] = useState<BlackjackTab>("cards");
  const resetTable = useBlackjackStore((state) => state.resetTable);
  const recommendation = useBlackjackStore((state) => state.recommendation);
  const players = useBlackjackStore((state) => state.players);
  const activePlayerId = useBlackjackStore((state) => state.activePlayerId);
  const activeHandId = useBlackjackStore((state) => state.activeHandId);
  const activeHand = players
    .find((player) => player.id === activePlayerId)
    ?.hands.find((hand) => hand.id === activeHandId);

  return (
    <CasinoShell>
      <div className="mobile-page space-y-4">
        <div className="flex items-start justify-between gap-3 px-1">
          <div>
            <p className="eyebrow">Basic strategy</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-100">Blackjack</h1>
            <p className="mt-0.5 text-xs text-zinc-500">Dollar bets · rule-aware advice</p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetTable} aria-label="Start a new blackjack hand">
            <RotateCcw className="h-4 w-4" /> New hand
          </Button>
        </div>

        <section className="mobile-card grid grid-cols-3 divide-x divide-white/6 overflow-hidden" aria-label="Current blackjack hand summary">
          <button type="button" onClick={() => setActiveTab("cards")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Hand</span>
            <span className="mt-1 block text-sm font-semibold text-zinc-200">{activeHand?.cards.length ? getDisplayTotal(activeHand.cards) : "—"}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Current total</span>
          </button>
          <button type="button" onClick={() => setActiveTab("cards")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Bet</span>
            <span className="mt-1 block text-sm font-semibold tabular-nums text-[#d7b75b]">{formatCurrency(activeHand?.bet ?? 0)}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Active hand</span>
          </button>
          <button type="button" onClick={() => setActiveTab("advice")} className="min-h-20 p-3 text-left">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-600">Move</span>
            <span className={cn("mt-1 block text-sm font-bold uppercase", recommendation ? "text-emerald-400" : "text-zinc-500")}>{recommendation?.move ?? "Add cards"}</span>
            <span className="mt-0.5 block text-[10px] text-zinc-600">Strategy</span>
          </button>
        </section>

        <ToolTabs tabs={tabs} active={activeTab} onChange={setActiveTab} label="Blackjack workspace" />

        <div className="space-y-4">
          {activeTab === "cards" && <BlackjackPlayerManager />}
          {activeTab === "advice" && <BasicStrategyPanel />}
          {activeTab === "table" && <BlackjackTable />}
          {activeTab === "rules" && <BlackjackRulesPanel />}
          {activeTab === "saved" && <BlackjackTrainingPanel />}
        </div>
      </div>
    </CasinoShell>
  );
}
