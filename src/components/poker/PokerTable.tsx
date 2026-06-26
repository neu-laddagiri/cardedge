"use client";

import { usePokerStore } from "@/store/pokerStore";
import { PlayerSeat } from "./PlayerSeat";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { motion } from "framer-motion";

export function PokerTable() {
  const communityCards = usePokerStore((s) => s.communityCards);
  const pot = usePokerStore((s) => s.pot);
  const players = usePokerStore((s) => s.players);
  const street = usePokerStore((s) => s.street);

  const board = [
    communityCards.flop1,
    communityCards.flop2,
    communityCards.flop3,
    communityCards.turn,
    communityCards.river,
  ];

  return (
    <div className="relative w-full aspect-[16/10] max-h-[320px] rounded-[50%] border-4 border-[#c9a84c]/20 bg-gradient-to-b from-emerald-900/80 to-emerald-950 shadow-inner glow-emerald overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />

      {/* Player seats around the table */}
      {players.map((player, i) => {
        const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
        const radiusX = 42;
        const radiusY = 38;
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);
        return (
          <div
            key={player.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <PlayerSeat player={player} />
          </div>
        );
      })}

      {/* Community cards & pot */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <motion.div
          key={pot}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-1.5 border border-[#c9a84c]/30"
        >
          <div className="h-4 w-4 rounded-full bg-red-600 border border-red-400/50" />
          <span className="text-sm font-semibold text-[#c9a84c] tabular-nums">
            Pot ${pot}
          </span>
        </motion.div>

        <div className="flex gap-1.5">
          {board.map((card, i) => (
            <PlayingCard
              key={i}
              rank={card?.rank}
              suit={card?.suit}
              size="sm"
              faceDown={!card && street !== "preflop"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
