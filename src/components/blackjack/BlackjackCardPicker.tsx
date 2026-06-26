"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BJCard, BJRank, BJSuit } from "@/lib/blackjack/blackjackTypes";
import { RANKS, SUITS } from "@/lib/poker/deck";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { cn } from "@/lib/utils";

interface BlackjackCardPickerProps {
  selected: BJCard | null;
  onSelect: (card: BJCard | null) => void;
  label?: string;
}

const suitLabels: Record<BJSuit, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

export function BlackjackCardPicker({
  selected,
  onSelect,
  label,
}: BlackjackCardPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickRank, setPickRank] = useState<BJRank | null>(selected?.rank ?? null);
  const [pickSuit, setPickSuit] = useState<BJSuit | null>(selected?.suit ?? null);

  const handleConfirm = () => {
    if (pickRank && pickSuit) {
      onSelect({ rank: pickRank, suit: pickSuit });
      setOpen(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="text-xs text-zinc-500 mb-1.5 block">{label}</label>
      )}
      <PlayingCard
        rank={selected?.rank}
        suit={selected?.suit}
        size="sm"
        onClick={() => setOpen(!open)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="glass-panel rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {RANKS.map((rank) => (
                  <button
                    key={rank}
                    onClick={() => setPickRank(rank as BJRank)}
                    className={cn(
                      "w-7 h-7 rounded text-xs font-bold",
                      pickRank === rank
                        ? "bg-emerald-500/30 text-emerald-300"
                        : "bg-white/5 text-zinc-300"
                    )}
                  >
                    {rank}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {SUITS.map((suit) => (
                  <button
                    key={suit}
                    onClick={() => setPickSuit(suit as BJSuit)}
                    className={cn(
                      "flex-1 py-1 rounded text-sm",
                      pickSuit === suit
                        ? "bg-emerald-500/30 text-emerald-300"
                        : "bg-white/5 text-zinc-300"
                    )}
                  >
                    {suitLabels[suit as BJSuit]}
                  </button>
                ))}
              </div>
              {pickRank && pickSuit && (
                <button
                  onClick={handleConfirm}
                  className="w-full text-xs py-1.5 rounded-lg bg-emerald-600 text-white"
                >
                  Add Card
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
