import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Claude Code keeps session worktrees in .claude/worktrees; never run their copies of the tests.
    exclude: [...configDefaults.exclude, ".claude/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "src/lib/{bankroll,money}.ts",
        "src/lib/blackjack/{basicStrategy,handValue,quickEntry,recommendations,shoe}.ts",
        "src/lib/poker/{deck,handState,monteCarlo,random,ranges,recommendations,validation}.ts",
        "src/lib/{cloudSync,safeRedirect}.ts",
        "src/lib/blackjack/strategyCharts.ts",
        "src/lib/poker/{boardAnalysis,pokerUtils}.ts",
      ],
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 75,
        lines: 75,
      },
    },
  },
});
