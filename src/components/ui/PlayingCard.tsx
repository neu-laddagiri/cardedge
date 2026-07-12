"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Suit = "clubs" | "diamonds" | "hearts" | "spades";
type Rank = string;

interface PlayingCardProps {
  rank?: Rank | null;
  suit?: Suit | null;
  size?: "xs" | "sm" | "md" | "lg";
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

const sizes = {
  xs: "w-8 h-11 text-[10px]",
  sm: "w-10 h-14 text-xs",
  md: "w-14 h-20 text-sm",
  lg: "w-20 h-28 text-lg",
};

export function PlayingCard({
  rank,
  suit,
  size = "md",
  faceDown = false,
  selected = false,
  onClick,
  className,
}: PlayingCardProps) {
  const isRed = suit === "hearts" || suit === "diamonds";
  const cardLabel = rank && suit ? `${rank} of ${suit}` : "Empty card slot";

  if (faceDown || !rank || !suit) {
    const content = (
      <div className="h-[70%] w-[70%] rounded border border-[#c9a84c]/20 bg-emerald-700/30" />
    );
    if (onClick) {
      return (
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={onClick}
          aria-label={faceDown ? "Face-down card" : "Choose a card"}
          aria-pressed={selected}
          className={cn(
            sizes[size],
            "flex cursor-pointer items-center justify-center rounded-lg border-2 border-[#c9a84c]/40 bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-lg",
            selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
            className
          )}
        >
          {content}
        </motion.button>
      );
    }
    return (
      <motion.div
        aria-label={faceDown ? "Face-down card" : cardLabel}
        role="img"
        className={cn(
          sizes[size],
          "flex cursor-default items-center justify-center rounded-lg border-2 border-[#c9a84c]/40 bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-lg",
          selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
          className
        )}
      >
        {content}
      </motion.div>
    );
  }

  const content = (
    <>
      <span className={cn(isRed ? "text-red-600" : "text-zinc-900")}>{rank}</span>
      <span className={cn("text-lg leading-none", isRed ? "text-red-600" : "text-zinc-900")}>
        {suitSymbols[suit]}
      </span>
    </>
  );
  if (onClick) {
    return (
      <motion.button
        type="button"
        whileHover={{ y: -4, rotate: -2 }}
        onClick={onClick}
        aria-label={`${cardLabel}; choose a different card`}
        aria-pressed={selected}
        className={cn(
          sizes[size],
          "flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white font-bold shadow-lg",
          selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
          className
        )}
      >
        {content}
      </motion.button>
    );
  }
  return (
    <motion.div
      role="img"
      aria-label={cardLabel}
      className={cn(
        sizes[size],
        "rounded-lg bg-white border border-zinc-200 shadow-lg flex flex-col items-center justify-center font-bold select-none",
        selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
        className
      )}
    >
      {content}
    </motion.div>
  );
}

export function EmptyCardSlot({
  size = "md",
  onClick,
  label,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  label?: string;
}) {
  return (
    onClick ? (
      <button
        type="button"
        onClick={onClick}
        aria-label={label ?? "Add card"}
        className={cn(
          sizes[size],
          "flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/15 text-[10px] text-white/30 transition-colors hover:border-emerald-500/40 hover:text-emerald-400/60"
        )}
      >
        {label ?? "+"}
      </button>
    ) : (
      <div className={cn(sizes[size], "flex items-center justify-center rounded-lg border-2 border-dashed border-white/15 text-[10px] text-white/30")}>
        {label ?? "+"}
      </div>
    )
  );
}
