"use client";

import { useBlackjackStore } from "@/store/blackjackStore";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { BlackjackHandDisplay } from "./BlackjackHand";
import { motion } from "framer-motion";

export function BlackjackTable() {
  const players = useBlackjackStore((s) => s.players);
  const dealerCards = useBlackjackStore((s) => s.dealerCards);
  const activePlayerId = useBlackjackStore((s) => s.activePlayerId);
  const activeHandId = useBlackjackStore((s) => s.activeHandId);
  const setActiveHand = useBlackjackStore((s) => s.setActiveHand);
  const removeCardFromHand = useBlackjackStore((s) => s.removeCardFromHand);

  return (
    <div className="relative min-h-[300px] w-full rounded-[2rem] border-2 border-[#c9a84c]/20 bg-gradient-to-b from-emerald-900/70 to-emerald-950 p-4 glow-emerald">
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]" />

      {/* Dealer */}
      <div className="relative mb-5 text-center">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Dealer</p>
        <div className="flex justify-center gap-2">
          {dealerCards.length === 0 ? (
            <PlayingCard faceDown size="sm" />
          ) : (
            dealerCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <PlayingCard rank={card.rank} suit={card.suit} size="sm" />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Players */}
      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
        {players.map((player) => (
          <div key={player.id}>
            <p className="text-xs font-medium text-zinc-400 mb-2">{player.name}</p>
            <div className="space-y-2">
              {player.hands.map((hand) => (
                <BlackjackHandDisplay
                  key={hand.id}
                  hand={hand}
                  isActive={
                    player.id === activePlayerId && hand.id === activeHandId
                  }
                  onClick={() => setActiveHand(player.id, hand.id)}
                  onRemoveCard={(index) =>
                    removeCardFromHand(player.id, hand.id, index)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
