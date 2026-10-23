# CardEdge

**Play the spot. Know the math.** CardEdge is a phone-first poker and blackjack trainer: enter the hand in a few taps and it tells you the move, with the numbers behind it. You get live Hold'em equity against modeled ranges next to the exact pot odds, chart-accurate blackjack strategy for your table's rules, and a to-the-cent results ledger.

**[Try it live →](https://cardedge-five.vercel.app)** No account needed; everything works in guest mode.

<p align="center">
  <a href="https://cardedge-five.vercel.app/brag.mp4">
    <img src="docs/brag-preview.gif" alt="CardEdge preview: &quot;Call or fold?&quot; on a heart draw, answered with Raise at 70.8% equity against 33.3% pot odds" width="640">
  </a>
  <br>
  <a href="https://cardedge-five.vercel.app/brag.mp4"><b>▶ Watch the 20-second launch video</b></a>
</p>

> **Training use only:** CardEdge is not financial advice, a guaranteed winning system, or a tool for use during prohibited live or online play. Poker outputs are estimates based on the visible cards and modeled ranges. Casino rules and house procedures vary.

## Features

### What's inside

- **Poker**: a visual table for 2–10 players. Enter your cards and the board and record the action, and CardEdge shows live equity, the pot odds and a fold, call or raise recommendation. Stacks, the pot and the amount to call update as you go. The street follows the board cards, and undo steps back one action.
- **Blackjack**: one tap per card on rank keypads, with suits filled in from the shoe, then the move for your hand: hit, stand, double, split or surrender. It follows your table's deck count, H17/S17, double-after-split and surrender rules, with multiple players, up to four split hands and dollar bets.
- **Results**: a dated session ledger for poker and blackjack with buy-in, cash-out and notes. Poker and blackjack each get a profit/loss total, plus one combined total.
- **History and accounts**: saved hands and sessions with notes, replay and decision-agreement stats. Everything works as a guest, and an optional email account syncs it across devices.

### Under the hood

- **Validated betting engine**: legal-action checks for check, call, bet, raise, fold and all-in, with action order and betting-round completion. Every amount is kept in whole cents.
- **Range-weighted Monte Carlo**: simulations run in a cancellable Web Worker (Fast, Balanced or Precise). Opponent ranges are calibrated to the share of hands they name and narrowed by recorded aggression. Split pots count as shares, and the result comes with a 95% interval.
- **Chart-accurate blackjack**: the Wizard of Odds basic-strategy charts for one, two and four to eight decks, H17/S17 and DAS/no-DAS, with every cell checked by tests. The shoe is validated card by card, and when the best move isn't allowed you get the legal fallback.
- **Private by default**: guest data stays in the browser. Accounts use Supabase Auth and Postgres with row-level security, and each device tracks what it has synced, so one device never deletes another's records. Security response headers are on every page.
- **Phone-first and accessible**: bottom navigation, focused tool tabs, 44 px touch targets and 16 px inputs. Keyboard focus states, live validation alerts, reduced-motion support and screen-reader names cover every control.
- **Checked on every change**: deterministic Vitest suites with coverage gates. CI runs lint, types, tests and a production build.

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

```bash
npm run check           # Everything CI runs: lint, typecheck, tests with coverage, build
npm run lint            # ESLint, zero warnings allowed
npm run typecheck       # TypeScript
npm test                # Vitest, single run
npm run test:coverage   # Vitest with coverage gates
npm run build           # Production build
```

## Calculation model

Poker simulations remove all visible cards, sample opponent holdings from configured range profiles, complete the board, and compare final hands. Effective equity counts wins plus the hero's fractional share of tied pots. Recommendations compare that equity interval with the break-even pot-odds threshold, then apply documented training heuristics for calls and value raises.

Opponent range percentages are intentionally understandable approximations rather than GTO solver outputs: a 20% range samples the strongest fifth of all 1,326 starting hands by a simple strength heuristic. Style and action presets influence which starting hands are sampled; users can override the percentage for each opponent.

Blackjack decisions follow the Wizard of Odds total-dependent basic-strategy charts for one, two, and four to eight decks, with separate tables for H17/S17 and for pairs with and without double after split. When surrender isn't offered, each chart's fallback move applies. Blackjack payout is displayed as return information because it does not change ordinary basic-strategy hit/stand decisions.

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
