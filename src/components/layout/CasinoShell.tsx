import { NavBar } from "./NavBar";
import { WipBanner } from "./WipBanner";

export function CasinoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50">
        <WipBanner />
        <NavBar />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        CardEdge — Training & probability tool. Not financial or gambling advice.
      </footer>
    </div>
  );
}
