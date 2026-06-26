"use client";

import type { Player } from "@/lib/poker/pokerTypes";
import { cn } from "@/lib/utils";
import { Crown, Circle } from "lucide-react";

interface PlayerSeatProps {
  player: Player;
}

export function PlayerSeat({ player }: PlayerSeatProps) {
  const statusColors = {
    active: "border-emerald-500/50 bg-emerald-500/10",
    folded: "border-zinc-600/50 bg-zinc-800/50 opacity-50",
    "all-in": "border-amber-500/50 bg-amber-500/10",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-2 py-1.5 min-w-[80px] text-center transition-all",
        statusColors[player.status],
        player.isHero && "ring-1 ring-emerald-400/50"
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {player.isHero && <Crown className="h-3 w-3 text-[#c9a84c]" />}
        <span className="text-[10px] font-medium text-zinc-200 truncate max-w-[70px]">
          {player.name}
        </span>
      </div>
      <div className="text-[9px] text-zinc-500 tabular-nums">${player.stack}</div>
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
          <Circle className="h-2 w-2 text-zinc-600 fill-zinc-600" />
        )}
      </div>
    </div>
  );
}
