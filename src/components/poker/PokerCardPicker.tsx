"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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

export function PokerCardPicker({ selected, usedCards, onSelect, label }: PokerCardPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickRank, setPickRank] = useState<Rank | null>(selected?.rank ?? null);
  const [pickSuit, setPickSuit] = useState<Suit | null>(selected?.suit ?? null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const openPicker = () => {
    setPickRank(selected?.rank ?? null);
    setPickSuit(selected?.suit ?? null);
    setOpen(true);
  };
  const isUsed = (rank: Rank, suit: Suit) => usedCards.some((card) => cardsEqual(card, { rank, suit }));
  const invalid = Boolean(pickRank && pickSuit && isUsed(pickRank, pickSuit));

  return (
    <div>
      {label && <span className="mb-1.5 block text-[11px] text-zinc-500">{label}</span>}
      <div className="flex items-center gap-2">
        <PlayingCard rank={selected?.rank} suit={selected?.suit} size="sm" onClick={openPicker} />
        {selected && <button type="button" onClick={() => onSelect(null)} className="min-h-11 px-1 text-xs text-zinc-500">Clear</button>}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close card picker" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Choose ${label ?? "a poker card"}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-t-[1.75rem] border border-white/10 bg-[#0b110f] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div><p className="eyebrow">Choose card</p><h2 className="mt-1 text-lg font-semibold text-zinc-100">{label ?? "Card"}</h2></div>
                <button autoFocus type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-zinc-400" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Rank</p>
              <div className="grid grid-cols-7 gap-1.5">
                {RANKS.map((rank) => (
                  <button key={rank} type="button" onClick={() => setPickRank(rank)} className={cn("min-h-11 rounded-xl text-sm font-bold", pickRank === rank ? "border border-emerald-500/40 bg-emerald-500/18 text-emerald-300" : "bg-white/5 text-zinc-300")}>{rank}</button>
                ))}
              </div>

              <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Suit</p>
              <div className="grid grid-cols-2 gap-2">
                {SUITS.map((suit) => (
                  <button key={suit} type="button" onClick={() => setPickSuit(suit)} className={cn("min-h-12 rounded-xl text-sm font-semibold", pickSuit === suit ? "border border-emerald-500/40 bg-emerald-500/18 text-emerald-300" : "bg-white/5 text-zinc-300", (suit === "hearts" || suit === "diamonds") && pickSuit !== suit && "text-red-400")}>{suitLabels[suit]}</button>
                ))}
              </div>

              {invalid && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">That card is already in this hand.</p>}
              <button
                type="button"
                disabled={!pickRank || !pickSuit || invalid}
                onClick={() => {
                  if (!pickRank || !pickSuit || invalid) return;
                  onSelect({ rank: pickRank, suit: pickSuit });
                  setOpen(false);
                }}
                className="mt-4 min-h-12 w-full rounded-2xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-40"
              >
                Use {pickRank && pickSuit ? `${pickRank} ${suitLabels[pickSuit].slice(0, 1)}` : "card"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
