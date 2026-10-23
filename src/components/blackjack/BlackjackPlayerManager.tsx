"use client";

import { useId, useState } from "react";
import { getHandPermissions, useBlackjackStore } from "@/store/blackjackStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { BlackjackCardPicker } from "./BlackjackCardPicker";
import { RankKeypad } from "./RankKeypad";
import { UserPlus, Trash2, Plus, Split } from "lucide-react";
import type { BJCard, BJRank, BlackjackHand, HandStatus } from "@/lib/blackjack/blackjackTypes";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { cardToDisplay, getDisplayTotal, isBust } from "@/lib/blackjack/handValue";
import { autoSuitCard, collectTableCards, playerCardMove, rankName, type PlayerCardMove } from "@/lib/blackjack/quickEntry";
import { BlackjackHandDisplay } from "./BlackjackHand";
import { cn } from "@/lib/utils";

const finishedLabels: Record<Exclude<HandStatus, "active">, string> = {
  stood: "stood",
  bust: "busted",
  blackjack: "has blackjack",
  surrendered: "surrendered",
  doubled: "doubled",
};

function spokenCard(card: BJCard) {
  return `${rankName(card.rank)} of ${card.suit}`;
}

function playerKeypadCaption(target: string, hand: BlackjackHand | undefined, doubleArmed: boolean) {
  if (!hand) return "Select a hand to deal to";
  if (hand.status !== "active") return `${target} ${finishedLabels[hand.status]}`;
  const move = playerCardMove(hand, doubleArmed);
  if (move === "double") return `Double ${target}: tap the card dealt`;
  return move === "hit" ? `Hit ${target}` : `Deal to ${target}`;
}

function describePlayerCard(move: PlayerCardMove, card: BJCard, target: string, hand: BlackjackHand) {
  const total = ` Total ${getDisplayTotal(hand.cards).replace("/", " or ")}.`;
  const outcome = isBust(hand.cards) ? " Bust." : hand.status === "blackjack" ? " Blackjack." : "";
  if (move === "double") return `${target} doubles with ${spokenCard(card)}.${total}${outcome}`;
  if (move === "hit") return `${target} hits ${spokenCard(card)}.${total}${outcome}`;
  return `Dealt ${spokenCard(card)} to ${target}.${total}${outcome}`;
}

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
  const removeCardFromHand = useBlackjackStore((s) => s.removeCardFromHand);
  const setActiveHand = useBlackjackStore((s) => s.setActiveHand);
  const setHandBet = useBlackjackStore((s) => s.setHandBet);
  const setDefaultBet = useBlackjackStore((s) => s.setDefaultBet);
  const rules = useBlackjackStore((s) => s.rules);
  const lastError = useBlackjackStore((s) => s.lastError);

  // Double is armed for one snapshot of the hand: any change to that hand disarms it.
  const [doubleFor, setDoubleFor] = useState<BlackjackHand | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const dealerCaptionId = useId();
  const playerCaptionId = useId();

  const activePlayer = players.find((player) => player.id === activePlayerId);
  const activeHand = activePlayer?.hands.find((hand) => hand.id === activeHandId);
  const { canHit: handIsActive, canStand, canSplit, canDouble, canSurrender } =
    activePlayer && activeHand
      ? getHandPermissions(activeHand, activePlayer, rules)
      : { canHit: false, canStand: false, canSplit: false, canDouble: false, canSurrender: false };
  const doubleArmed = canDouble && doubleFor === activeHand;

  const playerName = activePlayer ? activePlayer.name.trim() || `Player ${players.indexOf(activePlayer) + 1}` : "";
  const targetLabel =
    activePlayer && activeHand && activePlayer.hands.length > 1
      ? `${playerName}, hand ${activePlayer.hands.indexOf(activeHand) + 1}`
      : playerName;
  const playerCaption = playerKeypadCaption(targetLabel, activeHand, doubleArmed);

  const tableCards = collectTableCards(players, dealerCards);
  const rankAvailable = (rank: BJRank) => autoSuitCard(rank, tableCards, rules.numDecks) !== null;

  const addDealer = (card: BJCard) => {
    const isUpcard = dealerCards.length === 0;
    addDealerCard(card);
    if (!useBlackjackStore.getState().lastError) {
      setAnnouncement(`Dealer ${isUpcard ? "upcard" : "card"}: ${spokenCard(card)}.`);
    }
  };

  const dealDealerRank = (rank: BJRank) => {
    const card = autoSuitCard(rank, tableCards, rules.numDecks);
    if (card) addDealer(card);
  };

  const playCard = (card: BJCard) => {
    if (!activePlayerId || !activeHandId || !activeHand || !handIsActive) return;
    const move = playerCardMove(activeHand, doubleArmed);
    if (move === "double") doubleHand(activePlayerId, activeHandId, card);
    else if (move === "hit") hitHand(activePlayerId, activeHandId, card);
    else addCardToHand(activePlayerId, activeHandId, card);
    const next = useBlackjackStore.getState();
    if (next.lastError) return;
    const hand = next.players
      .find((player) => player.id === activePlayerId)
      ?.hands.find((candidate) => candidate.id === activeHandId);
    if (hand) setAnnouncement(describePlayerCard(move, card, targetLabel, hand));
  };

  const dealPlayerRank = (rank: BJRank) => {
    const card = autoSuitCard(rank, tableCards, rules.numDecks);
    if (card) playCard(card);
  };

  const updateActiveBet = (amount: number) => {
    if (!activePlayerId || !activeHandId) return;
    setHandBet(activePlayerId, activeHandId, amount);
    setDefaultBet(amount);
  };

  return (
    <div className="space-y-4">
      <InlineAlert message={lastError} />
      <GlassCard padding="sm">
        <SectionHeader title="Dealer" subtitle="Tap the upcard first. Suits are filled in for you." />
        <div className="flex flex-wrap gap-2 mb-3">
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
            onSelect={(c) => c && addDealer(c)}
            label="Exact card"
            triggerLabel="Exact card for the dealer: choose rank and suit"
          />
        </div>
        <p id={dealerCaptionId} className="mb-2 text-xs font-semibold text-zinc-300">
          {dealerCards.length === 0 ? "Tap the dealer's upcard" : "Tap the dealer's next card"}
        </p>
        <RankKeypad labelledBy={dealerCaptionId} onRank={dealDealerRank} isRankAvailable={rankAvailable} />
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Your Hands" subtitle="Tap a hand to make it active" />
          <Button size="sm" variant="secondary" onClick={addPlayer} aria-label="Add player" title="Add player">
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
              <div className="space-y-2">
                {player.hands.map((hand) => (
                  <BlackjackHandDisplay
                    key={hand.id}
                    hand={hand}
                    isActive={player.id === activePlayerId && hand.id === activeHandId}
                    onClick={() => setActiveHand(player.id, hand.id)}
                    onRemoveCard={(index) => removeCardFromHand(player.id, hand.id, index)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <SectionHeader title="Next Move" subtitle="One tap deals a card to the active hand. Suits are filled in for you." />
        {activeHand && (
          <label className="mb-4 block text-xs text-zinc-500">
            Active bet ($)
            <input
              aria-label="Active blackjack bet in dollars"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={activeHand.bet}
              disabled={activeHand.cards.length > 0}
              onChange={(event) => updateActiveBet(Number(event.target.value) || 0)}
              className="mobile-input mt-1.5"
            />
            {activeHand.cards.length > 0 && <span className="mt-1 block text-[10px] text-zinc-600">Start a new hand to change the bet.</span>}
          </label>
        )}

        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id={playerCaptionId} className="text-sm font-semibold text-zinc-100">{playerCaption}</p>
            <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
              {activeHand?.cards.length ? `${activeHand.cards.map(cardToDisplay).join(" ")} · ${getDisplayTotal(activeHand.cards)}` : "No cards yet"}
            </p>
          </div>
          <Button
            size="sm"
            variant="gold"
            aria-pressed={doubleArmed}
            onClick={() => setDoubleFor(doubleArmed ? null : activeHand ?? null)}
            disabled={!canDouble}
            className={cn("shrink-0", doubleArmed && "bg-[#c9a84c] text-zinc-950 hover:bg-[#d7b75b]")}
          >
            Double
          </Button>
        </div>
        <RankKeypad
          labelledBy={playerCaptionId}
          onRank={dealPlayerRank}
          disabled={!handIsActive}
          isRankAvailable={rankAvailable}
          tone={doubleArmed ? "gold" : "emerald"}
        />
        {handIsActive && (
          <div className="mt-3">
            <BlackjackCardPicker
              selected={null}
              onSelect={(card) => card && playCard(card)}
              label="Exact card"
              triggerLabel={`Exact card for ${targetLabel}: choose rank and suit`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              activePlayerId &&
              activeHandId &&
              standHand(activePlayerId, activeHandId)
            }
            disabled={!canStand}
          >
            Stand
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
        <p role="status" className="sr-only">{announcement}</p>
      </GlassCard>
    </div>
  );
}
