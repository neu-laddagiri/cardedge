"use client";

import type { BlackjackHand } from "@/lib/blackjack/blackjackTypes";
import { getDisplayTotal } from "@/lib/blackjack/handValue";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/money";

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
      className={cn(
        "rounded-xl border p-3 transition-all",
        isActive
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-white/10 bg-white/3 hover:border-white/20"
      )}
    >
      <div className="mb-2 flex min-h-11 items-center justify-between">
        {onClick ? (
          <button type="button" onClick={onClick} aria-pressed={isActive} className="flex min-h-11 flex-1 items-center text-left text-lg font-bold tabular-nums text-zinc-100">
            {getDisplayTotal(hand.cards)}
            <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-zinc-600">{isActive ? "Active" : "Select"}</span>
          </button>
        ) : (
          <span className="text-lg font-bold tabular-nums text-zinc-100">{getDisplayTotal(hand.cards)}</span>
        )}
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
                type="button"
                aria-label={`Remove ${card.rank} of ${card.suit}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(i);
                }}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white opacity-100 transition-opacity sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
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
      <div className="text-[10px] text-zinc-600 mt-1">Bet: {formatCurrency(hand.bet)}</div>
    </div>
  );
}
