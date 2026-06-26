"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CasinoShell } from "@/components/layout/CasinoShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PlayingCard } from "@/components/ui/PlayingCard";
import { StatPill } from "@/components/ui/StatPill";
import {
  Spade,
  TrendingUp,
  Target,
  Users,
  Layers,
  LayoutGrid,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Pot Odds",
    description: "Real-time pot odds calculations with clear formulas",
  },
  {
    icon: TrendingUp,
    title: "Equity Estimates",
    description: "Monte Carlo simulations for win/tie/lose probabilities",
  },
  {
    icon: Users,
    title: "Opponent Ranges",
    description: "Estimated threat categories based on board texture",
  },
  {
    icon: Target,
    title: "Blackjack Basic Strategy",
    description: "Rule-aware recommendations for every hand spot",
  },
  {
    icon: Layers,
    title: "Multi-Hand Tracking",
    description: "Split hands and multiple players at the table",
  },
  {
    icon: LayoutGrid,
    title: "Table State",
    description: "Visual poker and blackjack table layouts",
  },
];

const floatingCards = [
  { rank: "A", suit: "spades" as const, x: "10%", y: "20%", delay: 0 },
  { rank: "K", suit: "hearts" as const, x: "85%", y: "15%", delay: 0.5 },
  { rank: "Q", suit: "diamonds" as const, x: "75%", y: "70%", delay: 1 },
  { rank: "J", suit: "clubs" as const, x: "15%", y: "75%", delay: 1.5 },
];

export default function HomePage() {
  return (
    <CasinoShell>
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingCards.map((card) => (
            <motion.div
              key={`${card.rank}-${card.suit}`}
              className="absolute opacity-[0.07]"
              style={{ left: card.x, top: card.y }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                delay: card.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <PlayingCard rank={card.rank} suit={card.suit} size="lg" />
            </motion.div>
          ))}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#c9a84c]/5 blur-3xl" />
        </div>

        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-400 mb-6">
              <Spade className="h-3 w-3 text-emerald-400" />
              Training and probability tool — not financial advice
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
              Card<span className="text-[#c9a84c] text-glow-gold">Edge</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Poker and Blackjack Decision Intelligence
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/poker">
                <Button size="lg">
                  Launch Poker Helper
                </Button>
              </Link>
              <Link href="/blackjack">
                <Button size="lg" variant="gold">
                  Launch Blackjack Helper
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Preview cards */}
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard glow="emerald" className="h-full">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3">
                  Poker Preview
                </p>
                <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/20 p-4 mb-4">
                  <div className="flex justify-center gap-1 mb-3">
                    {["A", "K", "Q"].map((r, i) => (
                      <PlayingCard
                        key={r}
                        rank={r}
                        suit={["spades", "hearts", "diamonds"][i] as "spades"}
                        size="sm"
                      />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-[#c9a84c]">
                      Pot $120
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <StatPill label="Win Equity" value="62.4%" variant="emerald" />
                  <StatPill label="Pot Odds" value="28.6%" variant="gold" />
                  <StatPill label="Rec." value="Call" variant="amber" />
                </div>
                <p className="text-xs text-zinc-500">
                  Estimated recommendation based on Monte Carlo equity vs pot odds
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard glow="gold" className="h-full">
                <p className="text-[10px] uppercase tracking-wider text-[#c9a84c] mb-3">
                  Blackjack Preview
                </p>
                <div className="flex justify-center gap-6 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 mb-1">Dealer</p>
                    <PlayingCard rank="K" suit="spades" size="sm" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 mb-1">Player</p>
                    <div className="flex gap-1">
                      <PlayingCard rank="8" suit="hearts" size="sm" />
                      <PlayingCard rank="8" suit="diamonds" size="sm" />
                    </div>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <p className="text-[10px] uppercase text-zinc-500">Basic Strategy</p>
                  <p className="text-3xl font-bold text-violet-400 uppercase">Split</p>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  Pair of 8s should be split — 16 is a poor standing hand
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* What it tracks */}
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-100 mb-2">What It Tracks</h2>
            <p className="text-zinc-500">
              Training-mode analytics for smarter table decisions
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="h-full hover:border-emerald-500/20 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-200 mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-500">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </CasinoShell>
  );
}
