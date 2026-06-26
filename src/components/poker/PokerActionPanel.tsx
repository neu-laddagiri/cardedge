"use client";

import { useState } from "react";
import { usePokerStore } from "@/store/pokerStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { formatActionLabel } from "@/lib/poker/pokerUtils";

const ACTION_TYPES = ["fold", "check", "call", "bet", "raise", "all-in"] as const;

export function PokerActionPanel() {
  const players = usePokerStore((s) => s.players);
  const actions = usePokerStore((s) => s.actions);
  const addAction = usePokerStore((s) => s.addAction);
  const clearActions = usePokerStore((s) => s.clearActions);

  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [actionType, setActionType] = useState<typeof ACTION_TYPES[number]>("call");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (!playerId) return;
    const numAmount = amount ? parseFloat(amount) : undefined;
    addAction(playerId, actionType, numAmount);
    setAmount("");
  };

  return (
    <GlassCard padding="sm">
      <SectionHeader title="Action Log" subtitle="Training mode — track table action" />
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Player</label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-zinc-200"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Action</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as typeof actionType)}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-zinc-200"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-zinc-500 uppercase">Amount (optional)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-zinc-200"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={handleAdd} className="flex-1">
          Add Action
        </Button>
        <Button size="sm" variant="ghost" onClick={clearActions}>
          Clear
        </Button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-1">
        {actions.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">No actions logged</p>
        ) : (
          actions.map((action) => {
            const player = players.find((p) => p.id === action.playerId);
            return (
              <div
                key={action.id}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/3"
              >
                <span className="text-zinc-400">
                  <span className="text-zinc-300">{player?.name}</span>{" "}
                  {formatActionLabel(action.type, action.amount)}
                </span>
                <span className="text-zinc-600 capitalize">{action.street}</span>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
