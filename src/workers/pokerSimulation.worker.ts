/// <reference lib="webworker" />

import {
  runMonteCarloSimulation,
  type MonteCarloInput,
} from "@/lib/poker/monteCarlo";

self.onmessage = (event: MessageEvent<{ id: number; input: MonteCarloInput }>) => {
  const { id, input } = event.data;
  try {
    self.postMessage({ id, result: runMonteCarloSimulation(input) });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : "Simulation failed",
    });
  }
};

export {};
