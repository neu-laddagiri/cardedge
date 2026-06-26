"use client";

import type { BlackjackHand } from "@/lib/blackjack/blackjackTypes";
import { getDisplayTotal } from "@/lib/blackjack/handValue";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { cn } from "@/lib/utils";

interface BlackjackHandProps {
  hand: BlackjackHand;
  isActive: boolean;
  onClick?: () => void;
  onRemoveCard?: (index: number) => void;
}

const statusLabels: Record<string, string> = {
  active: "",
  stood: "STAND",
  bust: "BUST",
  blackjack: "BJ!",
  surrendered: "SURRENDER",
  doubled: "DOUBLED",
};

export function BlackjackHandDisplay({
  hand,
  isActive,
  onClick,
  onRemoveCard,
}: BlackjackHandProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 transition-all cursor-pointer",
        isActive
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-white/10 bg-white/3 hover:border-white/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-zinc-100 tabular-nums">
          {getDisplayTotal(hand.cards)}
        </span>
        {hand.status !== "active" && (
          <span
            className={cn(
              "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
              hand.status === "bust" && "bg-red-500/20 text-red-400",
              hand.status === "blackjack" && "bg-[#c9a84c]/20 text-[#c9a84c]",
              hand.status === "stood" && "bg-emerald-500/20 text-emerald-400",
              hand.status === "surrendered" && "bg-zinc-500/20 text-zinc-400",
              hand.status === "doubled" && "bg-sky-500/20 text-sky-400"
            )}
          >
            {statusLabels[hand.status]}
          </span>
        )}
      </div>
      <div className="flex gap-1 flex-wrap">
        {hand.cards.map((card, i) => (
          <div key={i} className="relative group">
            <PlayingCard rank={card.rank} suit={card.suit} size="sm" />
            {onRemoveCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(i);
                }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {hand.cards.length === 0 && (
          <span className="text-xs text-zinc-600">No cards</span>
        )}
      </div>
      <div className="text-[10px] text-zinc-600 mt-1">Bet: ${hand.bet}</div>
    </div>
  );
}
