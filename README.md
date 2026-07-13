# CardEdge

CardEdge is a mobile-first poker and blackjack decision trainer built with Next.js. It combines a validated dollar-stakes table engine, range-weighted poker equity simulations, rule-aware blackjack basic strategy, account-backed training history, and a dated profit/loss ledger.

> **Training use only:** CardEdge is not financial advice, a guaranteed winning system, or a tool for use during prohibited live or online play. Poker outputs are estimates based on the visible cards and modeled ranges. Casino rules and house procedures vary.

## What works

### Texas Hold'em trainer

- Visual table for 2–10 players with heads-up and multiway blind positioning
- Legal-action validation for check, call, bet, raise, fold, and all-in
- Automatic stack, street commitment, current-bet, pot, and amount-to-call reconciliation
- Action order, betting-round completion, street advancement, and one-action undo
- Duplicate-card and street-layout validation
- Cancellable Web Worker Monte Carlo simulations with Fast, Balanced, and Precise modes
- Effective pot-share equity, split-pot accounting, 95% simulation interval, and pot odds
- Style presets plus editable opponent range percentages, narrowed by recorded aggression
- Cached identical simulations and debounced input updates
- Dollar-denominated buy-ins, blinds, stacks, bets, calls, and pots with cent precision
- Private hand history, notes, replay, decision-agreement statistics, and optional account sync

### Blackjack trainer

- Hard, soft, pair, double, split, and late-surrender decisions
- H17 and S17 strategy differences
- One-, two-, four-, six-, and eight-deck configurations
- Double-after-split and no-DAS matrices
- Explicit preferred actions and legal fallbacks
- Physical shoe validation based on the configured deck count
- Multiple players and up to four split hands per player
- Editable dollar bets for active hands
- Private sessions, replay, actual-versus-recommended accuracy, and optional account sync
- Clear disclosure that payout affects return rather than the hit/stand matrix

### Results and accounts

- Dated poker and blackjack session ledger with buy-in, cash-out, note, and exact net result
- Separate poker and blackjack profit/loss totals plus a combined total
- Mobile email/password accounts with secure recovery and cross-device sync
- Guest mode that remains fully functional with local-only storage
- Supabase row-level security so users can access only their own records

### Product quality

- Mobile-first bottom navigation, focused tool tabs, safe-area support, and card-picker sheets
- One-handed 44px minimum controls and iOS-friendly 16px form inputs
- Keyboard focus states, semantic controls, live validation alerts, and reduced-motion support
- Route-level error recovery and accessible 404 page
- Security response headers and Vercel Web Analytics
- Deterministic unit tests with coverage gates
- GitHub Actions verification for lint, type safety, tests, coverage, and production build

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Zustand with versioned local persistence and guest-to-account migration
- Supabase Auth, Postgres, and row-level security
- Framer Motion
- `pokersolver` for final hand comparison
- Vitest, Testing Library, and V8 coverage
- Vercel deployment and Web Analytics

## Local development

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app builds and runs in guest mode without external services. To enable accounts and cloud sync:

1. Add Supabase to the Vercel project through the Vercel Marketplace.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and in Vercel.
3. Apply [`supabase/migrations/202607120001_cardedge_accounts.sql`](supabase/migrations/202607120001_cardedge_accounts.sql) in the Supabase SQL editor or CLI.
4. Add the production and preview `/auth/callback` URLs to Supabase Auth redirect URLs.

Run the complete release check:

```bash
npm run check
```

Individual commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

## Calculation model

Poker simulations remove all visible cards, sample opponent holdings from configured range profiles, complete the board, and compare final hands. Effective equity counts wins plus the hero's fractional share of tied pots. Recommendations compare that equity interval with the break-even pot-odds threshold, then apply documented training heuristics for calls and value raises.

Opponent range percentages are intentionally understandable approximations rather than GTO solver outputs. Style and action presets influence which starting hands are sampled; users can override the percentage for each opponent.

Blackjack decisions use explicit hard-total, soft-total, pair, and surrender rules. Deck count, H17/S17, DAS, and surrender availability affect the matrix. Blackjack payout is displayed as return information because it does not change ordinary basic-strategy hit/stand decisions.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for implementation details and invariants.

## Privacy

Guest data stays in the browser. When a user signs in, CardEdge uploads only that user’s saved training records and game-result ledger to Supabase so they can sync across devices. Row-level security binds every record to the authenticated user. Passwords are handled by Supabase Auth and are never visible to CardEdge. Vercel Web Analytics receives aggregate usage events, not cards, notes, or bankroll values.

## Known boundaries

- Poker ranges are heuristic and not a full game-theory solver.
- Side-pot settlement, tournament antes, straddles, and rake are not modeled yet.
- Blackjack insurance, even-money decisions, European no-hole-card rules, and dealer settlement are outside the current trainer.
- Account sync requires the optional Supabase deployment configuration; guest mode remains device-local.

## License

Public portfolio source. All rights reserved unless otherwise stated.
