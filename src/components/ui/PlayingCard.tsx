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

const suitColors: Record<Suit, string> = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-zinc-900",
  spades: "text-zinc-900",
};

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

  if (faceDown || !rank || !suit) {
    return (
      <motion.div
        whileHover={onClick ? { y: -2 } : undefined}
        onClick={onClick}
        className={cn(
          sizes[size],
          "rounded-lg border-2 border-[#c9a84c]/40 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center cursor-default shadow-lg",
          onClick && "cursor-pointer",
          selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
          className
        )}
      >
        <div className="h-[70%] w-[70%] rounded border border-[#c9a84c]/20 bg-emerald-700/30" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { y: -4, rotate: -2 } : undefined}
      onClick={onClick}
      className={cn(
        sizes[size],
        "rounded-lg bg-white border border-zinc-200 shadow-lg flex flex-col items-center justify-center font-bold select-none",
        onClick && "cursor-pointer",
        selected && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#050807]",
        className
      )}
    >
      <span className={cn(isRed ? "text-red-600" : "text-zinc-900")}>{rank}</span>
      <span className={cn("text-lg leading-none", isRed ? "text-red-600" : "text-zinc-900")}>
        {suitSymbols[suit]}
      </span>
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
    <div
      onClick={onClick}
      className={cn(
        sizes[size],
        "rounded-lg border-2 border-dashed border-white/15 flex items-center justify-center text-white/30 text-[10px]",
        onClick && "cursor-pointer hover:border-emerald-500/40 hover:text-emerald-400/60 transition-colors"
      )}
    >
      {label ?? "+"}
    </div>
  );
}
