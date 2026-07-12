"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useBlackjackStore } from "@/store/blackjackStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function BlackjackTrainingPanel() {
  const decisions = useBlackjackStore((state) => state.decisions);
  const savedSessions = useBlackjackStore((state) => state.savedSessions);
  const sessionNote = useBlackjackStore((state) => state.sessionNote);
  const setSessionNote = useBlackjackStore((state) => state.setSessionNote);
  const saveCurrentSession = useBlackjackStore((state) => state.saveCurrentSession);
  const deleteSavedSession = useBlackjackStore((state) => state.deleteSavedSession);
  const loadSavedSession = useBlackjackStore((state) => state.loadSavedSession);
  const clearDecisionHistory = useBlackjackStore((state) => state.clearDecisionHistory);
  const correct = decisions.filter((decision) => decision.correct).length;
  const accuracy = decisions.length ? (correct / decisions.length) * 100 : 0;

  return (
    <GlassCard>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title="Training Progress" subtitle="Decision accuracy and locally saved sessions" />
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-zinc-400">{decisions.length} decisions</span>
          <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
            {decisions.length ? accuracy.toFixed(0) : "—"}% accuracy
          </span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="text-xs text-zinc-500">
          Session note
          <textarea
            value={sessionNote}
            onChange={(event) => setSessionNote(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What rule or hand type were you practicing?"
            className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
          />
        </label>
        <Button onClick={saveCurrentSession} className="self-end">
          <Save className="h-4 w-4" aria-hidden="true" /> Save session
        </Button>
        <Button variant="ghost" onClick={clearDecisionHistory} disabled={!decisions.length} className="self-end">
          Clear stats
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Recent decisions</p>
          <div className="space-y-2">
            {decisions.slice(0, 6).map((decision) => (
              <div key={decision.id} className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2 text-xs">
                <span className="text-zinc-400">
                  {decision.playerName}: {decision.actualMove.toUpperCase()} vs {decision.recommendedMove.toUpperCase()}
                </span>
                <span className={decision.correct ? "text-emerald-400" : "text-red-400"}>
                  {decision.correct ? "Correct" : "Review"}
                </span>
              </div>
            ))}
            {!decisions.length && <p className="text-xs text-zinc-600">Take an action to begin tracking accuracy.</p>}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Saved sessions</p>
          <div className="space-y-2">
            {savedSessions.slice(0, 6).map((session) => (
              <div key={session.id} className="flex items-start justify-between rounded-lg bg-white/3 px-3 py-2 text-xs">
                <div>
                  <p className="text-zinc-300">{new Date(session.savedAt).toLocaleString()}</p>
                  <p className="text-zinc-600">{session.decisions.length} decisions · {session.rules.numDecks} decks</p>
                  {session.note && <p className="mt-1 text-zinc-500">{session.note}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => loadSavedSession(session.id)}
                    aria-label={`Replay session from ${new Date(session.savedAt).toLocaleString()}`}
                    className="rounded-lg p-1 text-zinc-600 hover:text-emerald-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSavedSession(session.id)}
                    aria-label={`Delete session from ${new Date(session.savedAt).toLocaleString()}`}
                    className="rounded-lg p-1 text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {!savedSessions.length && <p className="text-xs text-zinc-600">No sessions saved yet.</p>}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
