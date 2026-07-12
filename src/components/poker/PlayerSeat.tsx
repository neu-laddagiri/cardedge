"use client";

import type { Player } from "@/lib/poker/pokerTypes";
import { cn } from "@/lib/utils";
import { Crown, Circle } from "lucide-react";
import { formatCurrency } from "@/lib/money";

interface PlayerSeatProps {
  player: Player;
  isActing?: boolean;
}

export function PlayerSeat({ player, isActing = false }: PlayerSeatProps) {
  const statusColors = {
    active: "border-emerald-500/50 bg-emerald-500/10",
    folded: "border-zinc-600/50 bg-zinc-800/50 opacity-50",
    "all-in": "border-amber-500/50 bg-amber-500/10",
  };

  return (
    <div
      className={cn(
        "min-w-[58px] rounded-xl border px-1 py-1 text-center transition-all sm:min-w-[80px] sm:px-2 sm:py-1.5",
        statusColors[player.status],
        player.isHero && "ring-1 ring-emerald-400/50",
        isActing && "ring-2 ring-[#c9a84c] shadow-[0_0_18px_rgba(201,168,76,0.28)]"
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {player.isHero && <Crown className="h-3 w-3 text-[#c9a84c]" aria-hidden="true" />}
        <span className="text-[10px] font-medium text-zinc-200 truncate max-w-[70px]">
          {player.name}
        </span>
      </div>
      <div className="text-[9px] text-zinc-500 tabular-nums">{formatCurrency(player.stack)}</div>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        {player.isDealer && (
          <span className="text-[8px] bg-white/10 rounded px-1 text-zinc-400">D</span>
        )}
        {player.isSmallBlind && (
          <span className="text-[8px] bg-amber-500/20 rounded px-1 text-amber-400">SB</span>
        )}
        {player.isBigBlind && (
          <span className="text-[8px] bg-red-500/20 rounded px-1 text-red-400">BB</span>
        )}
        {player.status === "folded" && (
          <Circle className="h-2 w-2 text-zinc-600 fill-zinc-600" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
