import { afterEach, describe, expect, it, vi } from "vitest";
import { runPokerSimulation, SimulationCancelledError } from "./simulationClient";
import type { MonteCarloInput } from "./monteCarlo";
import type { Card } from "./pokerTypes";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });
const input = (first: Card, second: Card): MonteCarloInput => ({
  heroCards: [first, second],
  communityCards: [],
  activeOpponents: 1,
  simulations: 50,
  seed: 1,
});

/** Stands in for the browser Worker so the test controls when results arrive. */
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;
  private requestId = 0;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: { id: number }) {
    this.requestId = message.id;
  }

  terminate() {
    this.terminated = true;
  }

  respond() {
    this.onmessage?.({ data: { id: this.requestId, result: null } } as MessageEvent);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeWorker.instances = [];
});

describe("poker simulation client", () => {
  it("cancels an in-flight simulation when a cached result is served", async () => {
    const cached = input(card("A", "spades"), card("A", "hearts"));
    // No Worker in jsdom: this runs inline and fills the cache.
    await runPokerSimulation(cached);

    vi.stubGlobal("Worker", FakeWorker);
    const slow = runPokerSimulation(input(card("7", "clubs"), card("2", "diamonds")));
    const fast = runPokerSimulation(cached);

    await expect(slow).rejects.toBeInstanceOf(SimulationCancelledError);
    await expect(fast).resolves.not.toBeNull();
    expect(FakeWorker.instances[0].terminated).toBe(true);
  });
});
