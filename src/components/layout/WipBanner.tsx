"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function WipBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="wip-banner"
      role="status"
      aria-live="polite"
    >
      <div className="wip-banner-inner">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#c9a84c]" aria-hidden />
        <p className="text-[11px] leading-snug sm:text-xs sm:leading-normal">
          <span className="font-semibold text-[#c9a84c]">
            CardEdge Beta 0.2
          </span>
          <span className="mx-1.5 hidden text-zinc-600 sm:inline">—</span>
          <span className="text-zinc-400">
            Training-only estimates with tested decision matrices. Never use
            CardEdge to wager money or violate a gaming venue&apos;s rules.
          </span>
        </p>
      </div>
    </motion.div>
  );
}
