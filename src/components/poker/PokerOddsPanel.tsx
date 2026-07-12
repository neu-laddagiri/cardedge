"use client";

import { usePokerStore } from "@/store/pokerStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActionColor } from "@/lib/poker/recommendations";
import { analyzeOpponentThreats } from "@/lib/poker/pokerUtils";
import { getCommunityCardArray } from "@/lib/poker/monteCarlo";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulationPrecision } from "@/lib/poker/pokerTypes";

export function PokerOddsPanel() {
  const oddsResult = usePokerStore((s) => s.oddsResult);
  const recommendation = usePokerStore((s) => s.recommendation);
  const isSimulating = usePokerStore((s) => s.isSimulating);
  const runSimulation = usePokerStore((s) => s.runSimulation);
  const heroCards = usePokerStore((s) => s.heroCards);
  const heroId = usePokerStore((s) => s.heroId);
  const players = usePokerStore((s) => s.players);
  const communityCards = usePokerStore((s) => s.communityCards);
  const amountToCall = usePokerStore((s) => s.amountToCall);
  const precision = usePokerStore((s) => s.precision);
  const setPrecision = usePokerStore((s) => s.setPrecision);

  const hasHeroCards = heroCards[0] && heroCards[1];
  const community = getCommunityCardArray(communityCards);
  const threats = analyzeOpponentThreats(community, players, heroId);

  if (!hasHeroCards) {
    return (
      <EmptyState
        title="Enter Hero Cards"
        description="Select your two hole cards to run equity simulations and get estimated recommendations."
        items={[
          "Set hero hole cards (2 cards)",
          "Ensure at least one active opponent",
          "Optionally add community cards",
          "Set pot and amount to call for pot odds",
        ]}
      />
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard glow="emerald">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            title="Probability Helper"
            subtitle="Monte Carlo equity estimates"
          />
          <Button
            size="sm"
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running...
              </>
            ) : (
              "Run Simulation"
            )}
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-1" aria-label="Simulation precision">
          {(["fast", "balanced", "precise"] as SimulationPrecision[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPrecision(option)}
              aria-pressed={precision === option}
              className={cn(
                "flex-1 rounded-lg px-2 py-1 text-[10px] font-medium capitalize transition-colors",
                precision === option
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                  : "bg-white/5 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {isSimulating ? (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Calculating equity...
          </div>
        ) : oddsResult ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4" aria-live="polite">
              <StatPill
                label="Effective Equity"
                value={`${oddsResult.equityPercentage.toFixed(1)}%`}
                variant="gold"
              />
              <StatPill
                label="Win"
                value={`${oddsResult.winPercentage.toFixed(1)}%`}
                variant="emerald"
              />
              <StatPill
                label="Tie"
                value={`${oddsResult.tiePercentage.toFixed(1)}%`}
                variant="amber"
              />
              <StatPill
                label="Lose"
                value={`${oddsResult.losePercentage.toFixed(1)}%`}
                variant="red"
              />
            </div>
            <p className="-mt-4 mb-5 text-center text-[10px] text-zinc-600">
              95% interval ±{oddsResult.marginOfError.toFixed(1)} percentage points
            </p>

            {recommendation && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                  Estimated Recommendation
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold capitalize mb-2 text-glow-emerald",
                    getActionColor(recommendation.action)
                  )}
                >
                  {recommendation.action}
                </p>
                <p className="text-sm text-zinc-400">{recommendation.explanation}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {oddsResult.bestHand && (
                <div>
                  <span className="text-zinc-500 text-xs">Best Hand</span>
                  <p className="text-zinc-200 font-medium">{oddsResult.bestHand}</p>
                </div>
              )}
              <div>
                <span className="text-zinc-500 text-xs">Simulations</span>
                <p className="text-zinc-200 font-medium tabular-nums">
                  {oddsResult.simulations.toLocaleString()}
                </p>
              </div>
              {amountToCall > 0 && (
                <div>
                  <span className="text-zinc-500 text-xs">Pot Odds Needed</span>
                  <p className="text-zinc-200 font-medium">
                    {recommendation?.potOdds.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {oddsResult.boardTexture && oddsResult.boardTexture.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                  Board Texture
                </p>
                <ul className="space-y-1">
                  {oddsResult.boardTexture.map((note) => (
                    <li key={note} className="text-xs text-zinc-400">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {oddsResult.rangeSummary && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Modeled ranges</p>
                {oddsResult.rangeSummary.map((summary) => (
                  <p key={summary} className="text-[11px] text-zinc-500">• {summary}</p>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8">
            Click Run Simulation to calculate equity
          </p>
        )}

        <p className="text-[10px] text-zinc-600 mt-4 border-t border-white/5 pt-3">
          Poker recommendations are estimates based on visible cards, pot odds, and random simulations.
        </p>
      </GlassCard>

      <GlassCard padding="sm">
        <SectionHeader
          title="Opponent Possibilities"
          subtitle="Estimated threat categories"
        />
        <div className="space-y-2">
          {threats.map((threat) => (
            <div
              key={threat.category}
              className="rounded-lg bg-white/3 px-3 py-2"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-zinc-300">
                  {threat.category}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase px-1.5 py-0.5 rounded",
                    threat.likelihood === "high" && "bg-red-500/20 text-red-400",
                    threat.likelihood === "medium" && "bg-amber-500/20 text-amber-400",
                    threat.likelihood === "low" && "bg-zinc-500/20 text-zinc-400"
                  )}
                >
                  {threat.likelihood}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">{threat.description}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
