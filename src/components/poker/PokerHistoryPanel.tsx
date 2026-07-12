"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";
import { usePokerStore } from "@/store/pokerStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function PokerHistoryPanel() {
  const savedHands = usePokerStore((state) => state.savedHands);
  const handNote = usePokerStore((state) => state.handNote);
  const setHandNote = usePokerStore((state) => state.setHandNote);
  const saveCurrentHand = usePokerStore((state) => state.saveCurrentHand);
  const deleteSavedHand = usePokerStore((state) => state.deleteSavedHand);
  const loadSavedHand = usePokerStore((state) => state.loadSavedHand);
  const recommendations = savedHands.filter((hand) => hand.recommendation);
  const disciplined = recommendations.filter((hand) => hand.recommendation?.action === "fold").length;
  const graded = savedHands.filter((hand) => hand.followedRecommendation !== undefined);
  const agreement = graded.length
    ? (graded.filter((hand) => hand.followedRecommendation).length / graded.length) * 100
    : null;

  return (
    <GlassCard>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Hand History"
          subtitle="Stored privately in this browser for replay and review"
        />
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-zinc-400">{savedHands.length} saved</span>
          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-zinc-400">{disciplined} fold spots</span>
          <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
            {agreement === null ? "—" : agreement.toFixed(0)}% agreement
          </span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="text-xs text-zinc-500">
          Review note
          <textarea
            value={handNote}
            onChange={(event) => setHandNote(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What decision were you practicing?"
            className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </label>
        <Button onClick={saveCurrentHand} className="self-end">
          <Save className="h-4 w-4" aria-hidden="true" /> Save hand
        </Button>
      </div>

      {savedHands.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-zinc-600">
          Save a hand to build a private training log.
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {savedHands.slice(0, 8).map((hand) => (
            <article key={hand.id} className="rounded-xl border border-white/5 bg-white/3 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium capitalize text-zinc-200">
                    {hand.street} · ${hand.pot} pot
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(hand.savedAt).toLocaleString()} · {hand.actions.length} actions
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => loadSavedHand(hand.id)}
                    aria-label={`Replay saved hand from ${new Date(hand.savedAt).toLocaleString()}`}
                    className="rounded-lg p-1.5 text-zinc-600 hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSavedHand(hand.id)}
                    aria-label={`Delete saved hand from ${new Date(hand.savedAt).toLocaleString()}`}
                    className="rounded-lg p-1.5 text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {hand.recommendation
                  ? `${hand.recommendation.action.toUpperCase()} · ${hand.odds?.equityPercentage.toFixed(1) ?? "—"}% equity`
                  : "No recommendation captured"}
              </p>
              {hand.actualDecision && (
                <p className={hand.followedRecommendation ? "mt-1 text-xs text-emerald-400" : "mt-1 text-xs text-amber-400"}>
                  Hero chose {hand.actualDecision.toUpperCase()}
                  {hand.recommendedDecision
                    ? ` vs ${hand.recommendedDecision.toUpperCase()} · ${hand.followedRecommendation ? "matched" : "review"}`
                    : " · no recommendation captured"}
                </p>
              )}
              {hand.note && <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{hand.note}</p>}
            </article>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
