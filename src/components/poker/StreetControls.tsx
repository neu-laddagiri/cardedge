"use client";

import { usePokerStore } from "@/store/pokerStore";
import type { Street } from "@/lib/poker/pokerTypes";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PokerCardPicker } from "./PokerCardPicker";
import { getUsedCards } from "@/lib/poker/pokerUtils";
import { boardProgressHint } from "@/lib/poker/validation";
import { cn } from "@/lib/utils";

const STREETS: Street[] = ["preflop", "flop", "turn", "river"];

export function StreetControls() {
  const street = usePokerStore((s) => s.street);
  const heroCards = usePokerStore((s) => s.heroCards);
  const communityCards = usePokerStore((s) => s.communityCards);
  const setHeroCard = usePokerStore((s) => s.setHeroCard);
  const setCommunityCard = usePokerStore((s) => s.setCommunityCard);
  const startingBuyIn = usePokerStore((s) => s.startingBuyIn);
  const smallBlind = usePokerStore((s) => s.smallBlind);
  const bigBlind = usePokerStore((s) => s.bigBlind);
  const setStartingBuyIn = usePokerStore((s) => s.setStartingBuyIn);
  const setSmallBlindAmount = usePokerStore((s) => s.setSmallBlindAmount);
  const setBigBlindAmount = usePokerStore((s) => s.setBigBlindAmount);

  const usedCards = getUsedCards(heroCards, communityCards);

  return (
    <GlassCard padding="sm">
      <SectionHeader title="Hand Setup" subtitle="Cards, street, and dollar stakes" />

      {/* The board cards set the street, so this only shows where the hand is. */}
      <div className="mb-4">
        <ol aria-label="Street" className="flex gap-1">
          {STREETS.map((s) => (
            <li
              key={s}
              aria-current={street === s ? "step" : undefined}
              className={cn(
                "flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium capitalize",
                street === s
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "bg-white/3 text-zinc-600"
              )}
            >
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-1.5 text-xs text-zinc-500">{boardProgressHint(communityCards)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Buy-in ($)</label>
          <input
            aria-label="Next hand buy-in"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={startingBuyIn}
            onChange={(e) => setStartingBuyIn(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">SB ($)</label>
          <input
            aria-label="Next hand small blind"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={smallBlind}
            onChange={(e) => setSmallBlindAmount(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">BB ($)</label>
          <input
            aria-label="Next hand big blind"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={bigBlind}
            onChange={(e) => setBigBlindAmount(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Hero Hole Cards</p>
      <div className="flex gap-3 mb-4">
        <PokerCardPicker
          label="Card 1"
          selected={heroCards[0]}
          usedCards={usedCards.filter(
            (c) => !(heroCards[0] && c.rank === heroCards[0].rank && c.suit === heroCards[0].suit)
          )}
          onSelect={(card) => setHeroCard(0, card)}
        />
        <PokerCardPicker
          label="Card 2"
          selected={heroCards[1]}
          usedCards={usedCards.filter(
            (c) => !(heroCards[1] && c.rank === heroCards[1].rank && c.suit === heroCards[1].suit)
          )}
          onSelect={(card) => setHeroCard(1, card)}
        />
      </div>

      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Community Cards</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {(
          [
            ["flop1", "Flop 1"],
            ["flop2", "Flop 2"],
            ["flop3", "Flop 3"],
            ["turn", "Turn"],
            ["river", "River"],
          ] as const
        ).map(([key, label]) => (
          <PokerCardPicker
            key={key}
            label={label}
            selected={communityCards[key]}
            usedCards={usedCards.filter((c) => {
              const current = communityCards[key];
              return !(current && c.rank === current.rank && c.suit === current.suit);
            })}
            onSelect={(card) => setCommunityCard(key, card)}
          />
        ))}
      </div>
    </GlassCard>
  );
}
