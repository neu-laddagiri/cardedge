import { NavBar } from "./NavBar";
import { WipBanner } from "./WipBanner";

export function CasinoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50">
        <WipBanner />
        <NavBar />
      </header>
      <main id="main-content" className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        CardEdge — Training & probability tool. Not financial or gambling advice.
      </footer>
    </div>
  );
}
