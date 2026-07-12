# CardEdge architecture

## Design principles

1. Calculation modules are pure and independently testable.
2. UI components never duplicate betting or strategy rules.
3. Expected user errors are represented as readable state, not thrown exceptions.
4. Expensive poker simulations run outside the main UI thread.
5. User hand data remains local unless a future opt-in synchronization feature is introduced.

## Poker flow

`pokerStore` owns the current UI state. Every recorded action is submitted to `handState.applyPokerAction`, which validates the action and returns a reconciled state containing stacks, commitments, pot, current bet, actor, and street. Invalid actions return an error without partially mutating state.

When cards, opponents, pot odds, or range inputs change, the store debounces a simulation request. `simulationClient` cancels obsolete workers, caches identical inputs, and sends new work to `pokerSimulation.worker`. The worker runs the pure Monte Carlo engine and returns percentages plus range and uncertainty metadata. The recommendation module compares effective pot-share equity—not raw wins—with pot odds.

Core invariants:

- A physical poker card may appear only once.
- Community cards must match the selected street with no gaps.
- Contributions never exceed a player's stack.
- Checks are legal only with no outstanding call.
- Bets open action; raises must exceed the outstanding call.
- Pot growth equals the sum of accepted contributions.
- Only the current actor may submit an action while action order is active.

## Blackjack flow

`blackjackStore` owns table rules, hands, the dealer upcard, training decisions, and saved sessions. `basicStrategy` selects an ideal rule-aware move; if that move is unavailable, it returns an explicit legal fallback. `recommendations` turns that decision into user-facing reasoning without recalculating strategy.

The store validates every added card against the configured shoe. An exact rank-and-suit card can appear once per physical deck. Actual hit, stand, double, split, and surrender actions are compared with the recommendation before the hand mutates.

## Persistence

Zustand's versioned persistence stores only user preferences and saved training records. Transient worker state, errors, current simulations, and undo snapshots are not persisted. Saved records can be replayed into the active table.

## Verification

Vitest covers deterministic simulation behavior, pot odds, action legality, stack reconciliation, range weighting, card validation, blackjack totals, shoe constraints, and representative rule-matrix decisions. CI enforces zero lint warnings, TypeScript correctness, coverage thresholds, and a full Next.js production build.
