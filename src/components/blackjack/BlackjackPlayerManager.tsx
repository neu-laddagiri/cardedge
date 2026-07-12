"use client";

import { useState } from "react";
import { useBlackjackStore } from "@/store/blackjackStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { BlackjackCardPicker } from "./BlackjackCardPicker";
import { UserPlus, Trash2, Plus, Split } from "lucide-react";
import type { BJCard } from "@/lib/blackjack/blackjackTypes";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { isPair } from "@/lib/blackjack/handValue";

export function BlackjackPlayerManager() {
  const players = useBlackjackStore((s) => s.players);
  const dealerCards = useBlackjackStore((s) => s.dealerCards);
  const activePlayerId = useBlackjackStore((s) => s.activePlayerId);
  const activeHandId = useBlackjackStore((s) => s.activeHandId);
  const addPlayer = useBlackjackStore((s) => s.addPlayer);
  const removePlayer = useBlackjackStore((s) => s.removePlayer);
  const renamePlayer = useBlackjackStore((s) => s.renamePlayer);
  const addHand = useBlackjackStore((s) => s.addHand);
  const splitHand = useBlackjackStore((s) => s.splitHand);
  const addCardToHand = useBlackjackStore((s) => s.addCardToHand);
  const hitHand = useBlackjackStore((s) => s.hitHand);
  const standHand = useBlackjackStore((s) => s.standHand);
  const doubleHand = useBlackjackStore((s) => s.doubleHand);
  const surrenderHand = useBlackjackStore((s) => s.surrenderHand);
  const setDealerCard = useBlackjackStore((s) => s.setDealerCard);
  const addDealerCard = useBlackjackStore((s) => s.addDealerCard);
  const removeDealerCard = useBlackjackStore((s) => s.removeDealerCard);
  const rules = useBlackjackStore((s) => s.rules);
  const lastError = useBlackjackStore((s) => s.lastError);

  const [pendingCard, setPendingCard] = useState<BJCard | null>(null);

  const handleAddCardToActive = () => {
    if (!pendingCard || !activePlayerId || !activeHandId) return;
    addCardToHand(activePlayerId, activeHandId, pendingCard);
    setPendingCard(null);
  };

  const handleHit = () => {
    if (!pendingCard || !activePlayerId || !activeHandId) return;
    hitHand(activePlayerId, activeHandId, pendingCard);
    setPendingCard(null);
  };

  const activePlayer = players.find((player) => player.id === activePlayerId);
  const activeHand = activePlayer?.hands.find((hand) => hand.id === activeHandId);
  const handIsActive = activeHand?.status === "active";
  const canSplit = Boolean(activeHand && handIsActive && activeHand.cards.length === 2 && isPair(activeHand.cards) && (activePlayer?.hands.length ?? 0) < 4);
  const canDouble = Boolean(activeHand && handIsActive && activeHand.cards.length === 2 && (!activeHand.isSplit || rules.doubleAfterSplit));
  const canSurrender = Boolean(activeHand && handIsActive && activeHand.cards.length === 2 && !activeHand.isSplit && rules.surrenderAllowed);

  const handleDouble = () => {
    if (!pendingCard || !activePlayerId || !activeHandId) return;
    doubleHand(activePlayerId, activeHandId, pendingCard);
    setPendingCard(null);
  };

  return (
    <div className="space-y-4">
      <InlineAlert message={lastError} />
      <GlassCard padding="sm">
        <SectionHeader title="Dealer Cards" subtitle="Upcard required" />
        <div className="flex flex-wrap gap-2 mb-2">
          {dealerCards.map((card, i) => (
            <div key={i} className="relative">
              <BlackjackCardPicker
                selected={card}
                onSelect={(c) => {
                  if (c) setDealerCard(i, c);
                  else removeDealerCard(i);
                }}
                label={i === 0 ? "Upcard" : `Card ${i + 1}`}
              />
            </div>
          ))}
          <BlackjackCardPicker
            selected={null}
            onSelect={(c) => c && addDealerCard(c)}
            label="Add Card"
          />
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Players & Hands" />
          <Button size="sm" variant="secondary" onClick={addPlayer}>
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="rounded-xl bg-white/3 p-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  aria-label={`Player name for ${player.name}`}
                  value={player.name}
                  onChange={(e) => renamePlayer(player.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium border-b border-white/10 outline-none"
                />
                {players.length > 1 && (
                  <button type="button" onClick={() => removePlayer(player.id)} aria-label={`Remove ${player.name}`}>
                    <Trash2 className="h-3.5 w-3.5 text-zinc-600 hover:text-red-400" />
                  </button>
                )}
              </div>
              <div className="flex gap-1 mb-2">
                <Button size="sm" variant="ghost" onClick={() => addHand(player.id)}>
                  <Plus className="h-3 w-3" /> Hand
                </Button>
                {activePlayerId === player.id && activeHandId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => splitHand(player.id, activeHandId)}
                    disabled={!canSplit}
                  >
                    <Split className="h-3 w-3" /> Split
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-zinc-600">
                {player.hands.length} hand(s)
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <SectionHeader title="Card Input" subtitle="Pick a card, then apply action" />
        <BlackjackCardPicker
          selected={pendingCard}
          onSelect={setPendingCard}
          label="Selected Card"
        />

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button size="sm" onClick={handleAddCardToActive} disabled={!pendingCard || !handIsActive}>
            Add to Hand
          </Button>
          <Button size="sm" variant="secondary" onClick={handleHit} disabled={!pendingCard || !handIsActive}>
            Hit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              activePlayerId &&
              activeHandId &&
              standHand(activePlayerId, activeHandId)
            }
            disabled={!handIsActive}
          >
            Stand
          </Button>
          <Button size="sm" variant="gold" onClick={handleDouble} disabled={!pendingCard || !canDouble}>
            Double
          </Button>
          {rules.surrenderAllowed && (
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                activePlayerId &&
                activeHandId &&
                surrenderHand(activePlayerId, activeHandId)
              }
              disabled={!canSurrender}
            >
              Surrender
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
