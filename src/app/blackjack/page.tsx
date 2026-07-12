"use client";

import { CasinoShell } from "@/components/layout/CasinoShell";
import { BlackjackTable } from "@/components/blackjack/BlackjackTable";
import { BlackjackRulesPanel } from "@/components/blackjack/BlackjackRulesPanel";
import { BasicStrategyPanel } from "@/components/blackjack/BasicStrategyPanel";
import { BlackjackPlayerManager } from "@/components/blackjack/BlackjackPlayerManager";
import { Button } from "@/components/ui/Button";
import { useBlackjackStore } from "@/store/blackjackStore";
import { RotateCcw } from "lucide-react";
import { BlackjackTrainingPanel } from "@/components/blackjack/BlackjackTrainingPanel";

export default function BlackjackPage() {
  const resetTable = useBlackjackStore((s) => s.resetTable);

  return (
    <CasinoShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Blackjack Helper</h1>
            <p className="text-sm text-zinc-500">
              Basic strategy training mode — rule-aware recommendations
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetTable}>
            <RotateCcw className="h-3.5 w-3.5" />
            New Hand
          </Button>
        </div>

        <div className="mb-6">
          <BlackjackTable />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <BlackjackRulesPanel />
            <BlackjackPlayerManager />
          </div>

          <div className="lg:col-span-2">
            <BasicStrategyPanel />
          </div>
        </div>
        <div className="mt-6">
          <BlackjackTrainingPanel />
        </div>
      </div>
    </CasinoShell>
  );
}
