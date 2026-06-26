"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card, Rank, Suit } from "@/lib/poker/pokerTypes";
import { RANKS, SUITS, cardsEqual } from "@/lib/poker/deck";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { cn } from "@/lib/utils";

interface PokerCardPickerProps {
  selected: Card | null;
  usedCards: Card[];
  onSelect: (card: Card | null) => void;
  label?: string;
}

const suitLabels: Record<Suit, string> = {
  clubs: "♣ Clubs",
  diamonds: "♦ Diamonds",
  hearts: "♥ Hearts",
  spades: "♠ Spades",
};

export function PokerCardPicker({
  selected,
  usedCards,
  onSelect,
  label,
}: PokerCardPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickRank, setPickRank] = useState<Rank | null>(selected?.rank ?? null);
  const [pickSuit, setPickSuit] = useState<Suit | null>(selected?.suit ?? null);

  const isUsed = (rank: Rank, suit: Suit) =>
    usedCards.some((c) => cardsEqual(c, { rank, suit }));

  const handleConfirm = () => {
    if (pickRank && pickSuit && !isUsed(pickRank, pickSuit)) {
      onSelect({ rank: pickRank, suit: pickSuit });
      setOpen(false);
    }
  };

  const handleClear = () => {
    onSelect(null);
    setPickRank(null);
    setPickSuit(null);
    setOpen(false);
  };

  return (
    <div>
      {label && (
        <label className="text-xs text-zinc-500 mb-1.5 block">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <PlayingCard
          rank={selected?.rank}
          suit={selected?.suit}
          size="sm"
          onClick={() => setOpen(!open)}
        />
        {selected && (
          <button
            onClick={handleClear}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="glass-panel rounded-xl p-3 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Rank</p>
                <div className="flex flex-wrap gap-1">
                  {RANKS.map((rank) => (
                    <button
                      key={rank}
                      onClick={() => setPickRank(rank)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-bold transition-colors",
                        pickRank === rank
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10"
                      )}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Suit</p>
                <div className="flex flex-wrap gap-1">
                  {SUITS.map((suit) => (
                    <button
                      key={suit}
                      onClick={() => setPickSuit(suit)}
                      className={cn(
                        "px-3 h-8 rounded-lg text-xs transition-colors",
                        pickSuit === suit
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10",
                        suit === "hearts" || suit === "diamonds" ? "text-red-400" : ""
                      )}
                    >
                      {suitLabels[suit]}
                    </button>
                  ))}
                </div>
              </div>
              {pickRank && pickSuit && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {isUsed(pickRank, pickSuit) ? (
                    <span className="text-xs text-red-400">Card already in play</span>
                  ) : (
                    <>
                      <PlayingCard rank={pickRank} suit={pickSuit} size="sm" />
                      <button
                        onClick={handleConfirm}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        Confirm
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
