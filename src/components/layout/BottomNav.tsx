"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, CircleUserRound, House, Spade } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/poker", label: "Poker", icon: Spade },
  { href: "/blackjack", label: "Blackjack", icon: BlackjackIcon },
  { href: "/bankroll", label: "Results", icon: ChartNoAxesCombined },
  { href: "/account", label: "Account", icon: CircleUserRound },
];

function BlackjackIcon({ className }: { className?: string }) {
  return <span className={cn("text-base font-black leading-none", className)}>21</span>;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="bottom-nav">
      <div className="mx-auto grid w-full max-w-lg grid-cols-5 px-1">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : link.href === "/account"
                ? pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/reset-password")
                : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn("bottom-nav-item", active && "bottom-nav-item-active")}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
