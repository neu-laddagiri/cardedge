import type { Metadata } from "next";
import { AccountPanel } from "@/components/auth/AccountPanel";
import { CasinoShell } from "@/components/layout/CasinoShell";

export const metadata: Metadata = {
  title: "Account | CardEdge",
  description: "Manage CardEdge account sync and saved training data.",
};

export default function AccountPage() {
  return (
    <CasinoShell>
      <div className="mobile-page">
        <div className="mb-4 px-1">
          <p className="eyebrow">Your CardEdge</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-100">Account</h1>
        </div>
        <AccountPanel />
      </div>
    </CasinoShell>
  );
}
