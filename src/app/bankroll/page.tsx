import type { Metadata } from "next";
import { BankrollDashboard } from "@/components/bankroll/BankrollDashboard";
import { CasinoShell } from "@/components/layout/CasinoShell";

export const metadata: Metadata = {
  title: "Game Results | CardEdge",
  description: "Track dated poker and blackjack profit and loss.",
};

export default function BankrollPage() {
  return (
    <CasinoShell>
      <div className="mobile-page">
        <div className="mb-4 px-1">
          <p className="eyebrow">Your money</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-100">Results</h1>
          <p className="mt-1 text-sm text-zinc-500">Every session, exact date, one clean total.</p>
        </div>
        <BankrollDashboard />
      </div>
    </CasinoShell>
  );
}
