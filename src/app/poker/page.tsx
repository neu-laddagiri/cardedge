"use client";

import { CasinoShell } from "@/components/layout/CasinoShell";
import { PokerTable } from "@/components/poker/PokerTable";
import { PlayerManager } from "@/components/poker/PlayerManager";
import { StreetControls } from "@/components/poker/StreetControls";
import { PotTracker } from "@/components/poker/PotTracker";
import { PokerOddsPanel } from "@/components/poker/PokerOddsPanel";
import { PokerActionPanel } from "@/components/poker/PokerActionPanel";
import { Button } from "@/components/ui/Button";
import { usePokerStore } from "@/store/pokerStore";
import { RotateCcw } from "lucide-react";

export default function PokerPage() {
  const resetGame = usePokerStore((s) => s.resetGame);

  return (
    <CasinoShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Poker Helper</h1>
            <p className="text-sm text-zinc-500">
              Texas Hold&apos;em training mode — equity & pot odds
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetGame}>
            <RotateCcw className="h-3.5 w-3.5" />
            New Hand
          </Button>
        </div>

        <div className="mb-6">
          <PokerTable />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <PlayerManager />
            <PotTracker />
            <PokerActionPanel />
          </div>

          <div className="lg:col-span-1">
            <StreetControls />
          </div>

          <div className="lg:col-span-1">
            <PokerOddsPanel />
          </div>
        </div>
      </div>
    </CasinoShell>
  );
}
