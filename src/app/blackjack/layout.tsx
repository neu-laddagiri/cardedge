import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blackjack Strategy Trainer | CardEdge",
  description: "Practice blackjack basic strategy across deck, H17/S17, DAS, payout, and surrender rule configurations.",
};

export default function BlackjackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
