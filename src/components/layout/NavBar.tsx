"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Spade } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/poker", label: "Poker" },
  { href: "/blackjack", label: "Blackjack" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="border-b border-white/8 glass-panel">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400"
          >
            <Spade className="h-4 w-4" aria-hidden="true" />
          </motion.div>
          <span className="text-lg font-semibold tracking-tight">
            Card<span className="text-gold text-[#c9a84c]">Edge</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
