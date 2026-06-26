"use client";

import { usePokerStore } from "@/store/pokerStore";
import type { OpponentStyle, PlayerStatus } from "@/lib/poker/pokerTypes";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { UserPlus, RotateCcw, Trash2 } from "lucide-react";

const STYLES: OpponentStyle[] = [
  "unknown",
  "tight",
  "loose",
  "aggressive",
  "passive",
];

const STATUSES: PlayerStatus[] = ["active", "folded", "all-in"];

export function PlayerManager() {
  const players = usePokerStore((s) => s.players);
  const addPlayer = usePokerStore((s) => s.addPlayer);
  const removePlayer = usePokerStore((s) => s.removePlayer);
  const renamePlayer = usePokerStore((s) => s.renamePlayer);
  const setPlayerStack = usePokerStore((s) => s.setPlayerStack);
  const setPlayerStatus = usePokerStore((s) => s.setPlayerStatus);
  const setPlayerStyle = usePokerStore((s) => s.setPlayerStyle);
  const setHero = usePokerStore((s) => s.setHero);
  const setDealer = usePokerStore((s) => s.setDealer);
  const setSmallBlind = usePokerStore((s) => s.setSmallBlind);
  const setBigBlind = usePokerStore((s) => s.setBigBlind);
  const rotateBlinds = usePokerStore((s) => s.rotateBlinds);

  return (
    <GlassCard padding="sm">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Players" subtitle="Manage seats & positions" />
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={rotateBlinds}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary" onClick={addPlayer}>
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                value={player.name}
                onChange={(e) => renamePlayer(player.id, e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-zinc-200 border-b border-white/10 focus:border-emerald-500/50 outline-none"
              />
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-600 uppercase">Stack</label>
                <input
                  type="number"
                  value={player.stack}
                  onChange={(e) =>
                    setPlayerStack(player.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-600 uppercase">Status</label>
                <select
                  value={player.status}
                  onChange={(e) =>
                    setPlayerStatus(player.id, e.target.value as PlayerStatus)
                  }
                  className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!player.isHero && (
              <div>
                <label className="text-[9px] text-zinc-600 uppercase">Style</label>
                <select
                  value={player.style}
                  onChange={(e) =>
                    setPlayerStyle(player.id, e.target.value as OpponentStyle)
                  }
                  className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setHero(player.id)}
                className={`text-[9px] px-2 py-0.5 rounded ${
                  player.isHero
                    ? "bg-[#c9a84c]/20 text-[#c9a84c]"
                    : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Hero
              </button>
              <button
                onClick={() => setDealer(player.id)}
                className={`text-[9px] px-2 py-0.5 rounded ${
                  player.isDealer
                    ? "bg-white/20 text-zinc-200"
                    : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Dealer
              </button>
              <button
                onClick={() => setSmallBlind(player.id)}
                className={`text-[9px] px-2 py-0.5 rounded ${
                  player.isSmallBlind
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                SB
              </button>
              <button
                onClick={() => setBigBlind(player.id)}
                className={`text-[9px] px-2 py-0.5 rounded ${
                  player.isBigBlind
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                BB
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
