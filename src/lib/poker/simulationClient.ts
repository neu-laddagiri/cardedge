import {
  runMonteCarloSimulation,
  type MonteCarloInput,
} from "./monteCarlo";
import type { PokerOddsResult } from "./pokerTypes";

let activeWorker: Worker | null = null;
let rejectActive: ((reason: Error) => void) | null = null;
let requestId = 0;
const resultCache = new Map<string, PokerOddsResult | null>();
const MAX_CACHE_ENTRIES = 24;

export function cancelPokerSimulation(): void {
  requestId++;
  activeWorker?.terminate();
  activeWorker = null;
  rejectActive?.(new SimulationCancelledError());
  rejectActive = null;
}

export function runPokerSimulation(
  input: MonteCarloInput
): Promise<PokerOddsResult | null> {
  const cacheKey = JSON.stringify(input);
  if (resultCache.has(cacheKey)) {
    return Promise.resolve(resultCache.get(cacheKey) ?? null);
  }
  const id = ++requestId;
  activeWorker?.terminate();
  rejectActive?.(new SimulationCancelledError());
  rejectActive = null;

  if (typeof Worker === "undefined") {
    const result = runMonteCarloSimulation(input);
    remember(cacheKey, result);
    return Promise.resolve(result);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/pokerSimulation.worker.ts", import.meta.url),
      { type: "module" }
    );
    activeWorker = worker;
    rejectActive = reject;
    worker.onmessage = (
      event: MessageEvent<{
        id: number;
        result?: PokerOddsResult | null;
        error?: string;
      }>
    ) => {
      if (event.data.id !== id || id !== requestId) return;
      worker.terminate();
      activeWorker = null;
      rejectActive = null;
      if (event.data.error) reject(new Error(event.data.error));
      else {
        const result = event.data.result ?? null;
        remember(cacheKey, result);
        resolve(result);
      }
    };
    worker.onerror = () => {
      if (id !== requestId) return;
      worker.terminate();
      activeWorker = null;
      rejectActive = null;
      reject(new Error("The simulation worker stopped unexpectedly."));
    };
    worker.postMessage({ id, input });
  });
}

export class SimulationCancelledError extends Error {
  constructor() {
    super("Simulation cancelled");
    this.name = "SimulationCancelledError";
  }
}

function remember(key: string, result: PokerOddsResult | null): void {
  if (resultCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = resultCache.keys().next().value;
    if (oldest) resultCache.delete(oldest);
  }
  resultCache.set(key, result);
}
