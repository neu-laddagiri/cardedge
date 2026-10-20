"use client";

import type { BJRank } from "@/lib/blackjack/blackjackTypes";
import { QUICK_RANKS } from "@/lib/blackjack/quickEntry";
import { cn } from "@/lib/utils";

interface RankKeypadProps {
  /** Id of the visible caption that names the keypad. */
  labelledBy: string;
  onRank: (rank: BJRank) => void;
  disabled?: boolean;
  isRankAvailable?: (rank: BJRank) => boolean;
  tone?: "emerald" | "gold";
}

// Keys use aria-disabled rather than disabled so a key keeps keyboard focus
// when the tap it just made finishes the hand.
export function RankKeypad({ labelledBy, onRank, disabled = false, isRankAvailable, tone = "emerald" }: RankKeypadProps) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="grid grid-cols-7 gap-1.5">
      {QUICK_RANKS.map(({ rank, label, name }) => {
        const soldOut = isRankAvailable ? !isRankAvailable(rank) : false;
        const inert = disabled || soldOut;
        return (
          <button
            key={rank}
            type="button"
            aria-label={soldOut ? `${name}, none left in the shoe` : name}
            aria-disabled={inert || undefined}
            onClick={() => {
              if (!inert) onRank(rank);
            }}
            className={cn(
              "min-h-11 rounded-xl border text-sm font-bold tabular-nums transition-colors",
              inert
                ? "cursor-not-allowed border-transparent bg-white/3 text-zinc-600"
                : tone === "gold"
                  ? "border-[#c9a84c]/40 bg-[#c9a84c]/15 text-[#e3c46b] hover:bg-[#c9a84c]/25 active:bg-[#c9a84c]/35"
                  : "border-white/10 bg-white/6 text-zinc-100 hover:border-emerald-500/40 hover:bg-emerald-500/12 active:bg-emerald-500/25",
              soldOut && "line-through"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
