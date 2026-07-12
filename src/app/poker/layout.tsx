import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poker Equity Trainer | CardEdge",
  description: "Practice Texas Hold'em decisions with range-weighted equity, pot odds, validated actions, and private hand history.",
};

export default function PokerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
