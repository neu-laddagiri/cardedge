import { BottomNav } from "./BottomNav";
import { NavBar } from "./NavBar";

export function CasinoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50">
        <NavBar />
      </header>
      <main id="main-content" className="flex-1 pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
