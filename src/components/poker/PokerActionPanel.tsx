"use client";

import { useState } from "react";
import { usePokerStore } from "@/store/pokerStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { formatActionLabel } from "@/lib/poker/pokerUtils";
import { Undo2 } from "lucide-react";
import { formatCurrency } from "@/lib/money";

const ACTION_TYPES = ["fold", "check", "call", "bet", "raise", "all-in"] as const;

export function PokerActionPanel() {
  const players = usePokerStore((s) => s.players);
  const actions = usePokerStore((s) => s.actions);
  const addAction = usePokerStore((s) => s.addAction);
  const clearActions = usePokerStore((s) => s.clearActions);
  const undoLastAction = usePokerStore((s) => s.undoLastAction);
  const currentBet = usePokerStore((s) => s.currentBet);
  const amountToCall = usePokerStore((s) => s.amountToCall);
  const undoCount = usePokerStore((s) => s.undoStack.length);
  const actingPlayerId = usePokerStore((s) => s.actingPlayerId);
  const handComplete = usePokerStore((s) => s.handComplete);

  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [actionType, setActionType] = useState<typeof ACTION_TYPES[number]>("call");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const selectedPlayerId = actingPlayerId ?? (players.some((player) => player.id === playerId)
      ? playerId
      : players[0]?.id);
    if (!selectedPlayerId) return;
    const numAmount = amount ? parseFloat(amount) : undefined;
    addAction(selectedPlayerId, actionType, numAmount);
    setAmount("");
  };

  return (
    <GlassCard padding="sm">
      <SectionHeader title="Action Log" subtitle="Training mode — track table action" />
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/3 px-2 py-1.5 text-zinc-400">
          Current bet <span className="float-right text-zinc-200">{formatCurrency(currentBet)}</span>
        </div>
        <div className="rounded-lg bg-white/3 px-2 py-1.5 text-zinc-400">
          Hero call <span className="float-right text-zinc-200">{formatCurrency(amountToCall)}</span>
        </div>
      </div>
      <p className="mb-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2 py-1.5 text-xs text-emerald-300">
        {handComplete
          ? "Hand complete"
          : `To act: ${players.find((player) => player.id === actingPlayerId)?.name ?? "Select player"}`}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase">Player</label>
          <select
            aria-label="Acting player"
            value={actingPlayerId ?? (players.some((player) => player.id === playerId) ? playerId : players[0]?.id ?? "")}
            onChange={(e) => setPlayerId(e.target.value)}
            disabled={Boolean(actingPlayerId)}
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
            aria-label="Poker action"
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
          <label htmlFor="poker-action-amount" className="text-[10px] text-zinc-500 uppercase">
            Dollars added {actionType === "bet" || actionType === "raise" ? "(required)" : "(automatic)"}
          </label>
          <input
            id="poker-action-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={actionType === "call" || actionType === "all-in" ? "Calculated automatically" : "0"}
            disabled={actionType === "call" || actionType === "all-in" || actionType === "fold" || actionType === "check"}
            className="w-full mt-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-zinc-200"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={handleAdd} className="flex-1" disabled={handComplete}>
          Add Action
        </Button>
        <Button size="sm" variant="ghost" onClick={clearActions}>
          Clear Log
        </Button>
        <Button size="sm" variant="ghost" onClick={undoLastAction} disabled={!undoCount} aria-label="Undo last poker action">
          <Undo2 className="h-3 w-3" />
          Undo
        </Button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-1">
        {actions.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">No actions logged</p>
        ) : (
          [...actions].reverse().map((action) => {
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
