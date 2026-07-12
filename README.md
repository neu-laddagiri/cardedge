# CardEdge

CardEdge is a privacy-first poker and blackjack decision trainer built with Next.js. It combines a validated table-state engine, range-weighted poker equity simulations, rule-aware blackjack basic strategy, and local training history in a casino-inspired interface.

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
- Private browser-based hand history, notes, replay, and decision-agreement statistics

### Blackjack trainer

- Hard, soft, pair, double, split, and late-surrender decisions
- H17 and S17 strategy differences
- One-, two-, four-, six-, and eight-deck configurations
- Double-after-split and no-DAS matrices
- Explicit preferred actions and legal fallbacks
- Physical shoe validation based on the configured deck count
- Multiple players and up to four split hands per player
- Private browser-based sessions, replay, and actual-versus-recommended accuracy
- Clear disclosure that payout affects return rather than the hit/stand matrix

### Product quality

- Responsive layouts and touch-friendly card controls
- Keyboard focus states, semantic controls, live validation alerts, and reduced-motion support
- Route-level error recovery and accessible 404 page
- Security response headers and Vercel Web Analytics
- Deterministic unit tests with coverage gates
- GitHub Actions verification for lint, type safety, tests, coverage, and production build

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Zustand with versioned local persistence
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

CardEdge has no account system and does not upload cards, notes, actions, or histories. Training data is stored in the browser's local storage and can be removed by clearing the corresponding history or site data. Vercel Web Analytics receives aggregate site-usage events, not hand contents.

## Known boundaries

- Poker ranges are heuristic and not a full game-theory solver.
- Side-pot settlement, tournament antes, straddles, and rake are not modeled yet.
- Blackjack insurance, even-money decisions, European no-hole-card rules, and dealer settlement are outside the current trainer.
- Local history does not synchronize between browsers or devices.

## License

Public portfolio source. All rights reserved unless otherwise stated.
