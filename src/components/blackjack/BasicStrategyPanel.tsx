"use client";

import { useBlackjackStore } from "@/store/blackjackStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMoveColor } from "@/lib/blackjack/recommendations";
import { cn } from "@/lib/utils";

export function BasicStrategyPanel() {
  const recommendation = useBlackjackStore((s) => s.recommendation);
  const dealerCards = useBlackjackStore((s) => s.dealerCards);
  const players = useBlackjackStore((s) => s.players);
  const activePlayerId = useBlackjackStore((s) => s.activePlayerId);
  const activeHandId = useBlackjackStore((s) => s.activeHandId);

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const activeHand = activePlayer?.hands.find((h) => h.id === activeHandId);

  if (!dealerCards[0]) {
    return (
      <EmptyState
        title="Set Dealer Upcard"
        description="Add the dealer's visible upcard to get a basic strategy recommendation."
        items={[
          "Add dealer upcard (required)",
          "Add cards to player hand",
          "Configure table rules if needed",
        ]}
      />
    );
  }

  if (!activeHand || activeHand.cards.length === 0) {
    return (
      <EmptyState
        title="Add Player Cards"
        description="Select a hand and add cards to receive a basic strategy recommendation."
        items={["Click a player hand to select it", "Add at least one card"]}
      />
    );
  }

  if (!recommendation) {
    return (
      <EmptyState
        title="Hand Complete"
        description="This hand is finished. Select an active hand for a new recommendation."
      />
    );
  }

  return (
    <GlassCard glow="gold">
      <SectionHeader
        title="Basic Strategy"
        subtitle="Estimated recommendation based on common rules"
      />

      <div className="text-center mb-6">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
          Recommended Move
        </p>
        <p
          className={cn(
            "text-4xl font-bold uppercase text-glow-gold",
            getMoveColor(recommendation.move)
          )}
        >
          {recommendation.move}
        </p>
        {recommendation.fallbackMove && (
          <p className="text-xs text-zinc-500 mt-1">
            Preferred: {recommendation.fallbackMove} (if allowed)
          </p>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        {recommendation.explanation}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatPill label="Hand Total" value={recommendation.handTotal} variant="emerald" />
        <StatPill
          label="Hand Type"
          value={recommendation.handType}
          variant="gold"
        />
        <StatPill
          label="Dealer Upcard"
          value={recommendation.dealerUpcard}
          variant="red"
        />
        <StatPill
          label="Active Hand"
          value={activePlayer?.name ?? "—"}
          variant="default"
        />
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
          Rule Notes
        </p>
        <ul className="space-y-1">
          {recommendation.ruleNotes.map((note) => (
            <li key={note} className="text-xs text-zinc-500">
              • {note}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-zinc-600 mt-4 border-t border-white/5 pt-3">
        Blackjack recommendations follow common basic strategy rules and may vary by casino rules.
      </p>
    </GlassCard>
  );
}
