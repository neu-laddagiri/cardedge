# CardEdge architecture

## Design principles

1. Calculation modules are pure and independently testable.
2. UI components never duplicate betting or strategy rules.
3. Expected user errors are represented as readable state, not thrown exceptions.
4. Expensive poker simulations run outside the main UI thread.
5. Guest data remains local; authenticated sync is opt-in and protected by database row-level security.
6. Money shown to users is denominated in US dollars, rounded to cents at input boundaries, and stored as integer cents in the results ledger.

## Poker flow

`pokerStore` owns the current UI state. Every recorded action is submitted to `handState.applyPokerAction`, which validates the action and returns a reconciled state containing stacks, commitments, pot, current bet, actor, and street. Invalid actions return an error without partially mutating state.

When cards, opponents, pot odds, or range inputs change, the store debounces a simulation request and numbers it, so only the newest run may publish results. `simulationClient` cancels obsolete workers (also when a cached result answers a newer request), caches identical inputs, and sends new work to `pokerSimulation.worker`. The worker runs the pure Monte Carlo engine. Each trial shuffles once, deals every opponent from a range calibrated against all 1,326 starting hands, and splits tied pots. The worker returns percentages plus range and uncertainty metadata. The recommendation module compares effective pot-share equity—not raw wins—with pot odds.

Core invariants:

- A physical poker card may appear only once.
- Community cards must match the selected street with no gaps.
- Contributions never exceed a player's stack.
- Checks are legal only with no outstanding call.
- Bets open action; raises must exceed the outstanding call.
- Pot growth equals the sum of accepted contributions.
- Only the current actor may submit an action while action order is active.

## Blackjack flow

`blackjackStore` owns table rules, hands, the dealer upcard, training decisions, and saved sessions. `basicStrategy` looks up the Wizard of Odds total-dependent chart for the deck count, H17/S17, and DAS (`strategyCharts`) and resolves it against what the hand may do; if the chart's move is unavailable, it returns an explicit legal fallback. `getHandPermissions` defines what a hand may do, and the store actions enforce it. Split aces take one card each and can't be resplit or doubled, and surrender applies only to the original two cards. `recommendations` turns that decision into user-facing reasoning without recalculating strategy.

The store validates every added card against the configured shoe. An exact rank-and-suit card can appear once per physical deck. Actual hit, stand, double, split, and surrender actions are compared with the recommendation before the hand mutates.

Card entry is rank-only. `quickEntry` gives each tapped rank a suit, rotating ♠♥♦♣ and skipping any rank-and-suit the shoe has used up, so the store's shoe check accepts it. The Cards tab then calls the existing store actions: `addDealerCard` for the dealer, `addCardToHand` for a hand's first two cards, `hitHand` for later cards, and `doubleHand` when Double is armed. The Double toggle uses the same availability rule the store enforces.

## Persistence

Zustand's versioned persistence stores user preferences, saved training records, and the guest result ledger. Transient worker state, errors, current simulations, and undo snapshots are not persisted. Saved records can be replayed into the active table.

`AuthProvider` uses Supabase Auth cookies refreshed through Next.js `proxy.ts`; `/auth/callback` redirects only to same-site paths (`safeNextPath`). `UserDataSync` merges local guest records into the signed-in account, writes changes through the Supabase browser client, and clears account-backed data from the device on sign-out. Each device remembers which record ids it has seen on the server (`cloudSync`). A sync uploads only new or edited records and deletes only records removed on this device. It never deletes records another device added, and it drops local copies of records another device deleted. The database stores ledger money as integer cents and training snapshots as JSONB. Both tables enforce `auth.uid() = user_id` for reads and writes.

## Mobile interface

The global shell is constrained to a phone-width reading column with safe-area-aware bottom navigation. Poker and blackjack pages expose one focused task panel at a time; summary strips keep the live recommendation, equity, pot, bet, and call values visible without duplicating their calculation logic. Blackjack cards are entered with one-tap rank keypads; poker cards, and exact blackjack cards, use modal bottom sheets. Both use 44px-tall touch targets.

## Verification

Vitest covers deterministic simulation behavior and known equities, pot odds, action legality, stack reconciliation, cent-exact chip math, range calibration, card validation, blackjack totals, shoe constraints, every cell of the twelve blackjack strategy charts, cloud-sync reconciliation against an in-memory Supabase, and redirect validation. CI enforces zero lint warnings, TypeScript correctness, coverage thresholds, and a full Next.js production build.
