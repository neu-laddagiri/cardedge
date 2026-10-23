import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameSession } from "@/lib/bankroll";
import { useBankrollStore } from "@/store/bankrollStore";
import { BankrollDashboard } from "./BankrollDashboard";

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ configured: false, loading: false, user: null, supabase: null }),
}));

const saved: GameSession = {
  id: "s1",
  gameType: "poker",
  playedAt: "2026-10-01T20:00:00.000Z",
  buyInCents: 20000,
  cashOutCents: 32500,
  note: "",
  createdAt: "2026-10-01T23:00:00.000Z",
  updatedAt: "2026-10-01T23:00:00.000Z",
};

/** Saved results arrive after the first render (storage hydration or a cloud sync). */
const resultsLoad = () => act(() => useBankrollStore.getState().replaceSessions([saved]));

beforeEach(() => {
  useBankrollStore.getState().replaceSessions([]);
});

describe("BankrollDashboard", () => {
  it("opens the form for a first result but closes it once saved results load", () => {
    render(<BankrollDashboard />);
    expect(screen.getByRole("form", { name: "New session" })).toBeInTheDocument();

    resultsLoad();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("keeps a form the user already started", () => {
    render(<BankrollDashboard />);
    fireEvent.change(screen.getByLabelText(/^Buy-in/), { target: { value: "50" } });

    resultsLoad();
    expect(screen.getByRole("form", { name: "New session" })).toBeInTheDocument();
  });

  it("follows the user's choice after they toggle it", () => {
    useBankrollStore.getState().replaceSessions([saved]);
    render(<BankrollDashboard />);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add result" }));
    expect(screen.getByRole("form", { name: "New session" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
