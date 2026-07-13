"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "gold" | "none";
  padding?: "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className,
  glow = "none",
  padding = "md",
}: GlassCardProps) {
  const paddingClass = {
    sm: "p-3.5 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-5 sm:p-8",
  }[padding];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-panel rounded-[1.25rem]",
        paddingClass,
        glow === "emerald" && "glow-emerald",
        glow === "gold" && "glow-gold",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
