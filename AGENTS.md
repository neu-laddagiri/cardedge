<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CardEdge — project guide

Mobile-first poker (Texas Hold'em) and blackjack decision trainer with a dated profit/loss ledger and optional Supabase accounts. `docs/ARCHITECTURE.md` describes the design and its invariants; `CHANGELOG.md` records every release.

Stack:

- Next.js 16 App Router, with `src/proxy.ts` (renamed from middleware in Next 16) and one dynamic route, `/auth/callback`. Every other route prerenders.
- React 19, TypeScript, Tailwind CSS 4 (compiled by Lightning CSS), Framer Motion.
- Zustand stores with versioned `persist` to localStorage.
- pokersolver, run in a Web Worker for simulations.
- Supabase Auth and Postgres with row-level security (`supabase/migrations/`).
- Vercel Web Analytics.

## Commands

- `npm run dev`: dev server. `.claude/launch.json` defines `cardedge-dev` for the preview pane.
- `npm test`: Vitest, single run (`npm run test:watch` to watch).
- `npm run check`: lint (zero warnings), typecheck, tests with coverage gates, production build. CI runs the same steps.

A change is done when `npm run check` passes and UI changes have been checked in the browser at phone width (375 px). The app is phone-first.

## Layout

```
src/app/               routes: / poker blackjack bankroll account login reset-password, auth/callback
src/components/        auth/ bankroll/ blackjack/ poker/ ui/ (+ layout shell)
src/lib/               money (cents), bankroll, cloudSync, safeRedirect, supabase/
src/lib/poker/         deck, ranges, monteCarlo, boardAnalysis, handState, recommendations, simulationClient, …
src/lib/blackjack/     handValue, shoe, strategyCharts, basicStrategy, recommendations, quickEntry
src/store/             pokerStore, blackjackStore, bankrollStore, syncStatusStore
src/workers/           pokerSimulation.worker.ts
```

Logic lives in pure `src/lib` modules with tests beside them (`*.test.ts`). Components never re-implement betting or strategy rules.

## Money

Dollars are rounded to cents with `roundMoney` at every input and arithmetic boundary, including chips moved by the poker action engine; otherwise float drift breaks "shove the exact stack" checks. The results ledger stores integer cents. Use `formatCurrency` for display, never raw arithmetic in strings.

## Blackjack

- Card entry is rank-only: `quickEntry` picks a suit the shoe still has, and the keypad's Double toggle uses `getHandPermissions`.
- Strategy is chart-driven. `strategyCharts.ts` holds the Wizard of Odds total-dependent tables: hard and soft totals for 1, 2 and 4–8 decks × S17/H17, plus pairs × DAS/no-DAS. They assume a peeking dealer and late surrender. Codes: `H S P Dh Ds Rh Rs Rp`.
- `basicStrategy.ts` resolves a code against what the hand may do and returns `preferredMove` when the chart's first choice isn't available. A pair that can't be split is played as its total.
- `testdata/wizardOfOddsCharts.ts` is an independent golden copy of all 12 tables, and `strategyCharts.test.ts` checks every cell. A chart change must come from the source, https://wizardofodds.com/games/blackjack/strategy/calculator/, and update both files identically. The calculator renders its tables client-side, so read it in a browser rather than by fetching the page.
- `getHandPermissions` in `blackjackStore` is the single source of the table rules, and the store actions enforce them:
  - Double on any first two cards; after a split only with DAS.
  - Split pairs up to 4 hands.
  - Split aces get one card each and can't be resplit or doubled.
  - Surrender only on the original two cards.
  - A split 21 is not a blackjack.

## Poker

- `handState.applyPokerAction` is the betting engine: it validates the action and returns reconciled stacks, commitments, pot, current bet and actor, or an error.
- The board sets the street (`validation.streetForBoard`): all three flop cards, then the turn and river in order.
  - A finished betting round never advances on its own. It waits with no actor until `setCommunityCard` adds the next card and calls `advancePokerStreet`; removing a card moves back the same way.
  - Undo snapshots include the board, so undo can't leave a street the board doesn't show.
- Ranges: `rangeThreshold(percent)` is calibrated against all 1,326 starting hands, so "22%" really samples the top 22%. `monteCarlo` deals each opponent from their range by rejection sampling, then falls back to an exhaustive pick. Each trial shuffles once and scores with `Hand.winners`, so ties split the pot.
- Advice (`recommendations.ts`): pot odds = call / (pot + call). The value threshold is fair share + 25% of the rest (62.5% heads-up, 50% three-way). Opponents are counted from live players, not the hero. These are training heuristics, not solver output.
- Simulations: `simulationClient` runs one worker at a time, cancels stale runs and caches identical inputs. `pokerStore` tags each run so an older result can never overwrite a newer one.

## Accounts and sync

- `UserDataSync` (with pure helpers in `lib/cloudSync.ts`) remembers which record ids this device has seen on the server. It persists that list per user under `cardedge-synced-ids-v1:<userId>`.
- A push uploads only new or edited records. It deletes only records this device synced and the user then removed.
- Records that another device added are never deleted. At sign-in, local records the server lost since the last sync are dropped, because another device deleted them.
- Loads page through results in 1,000-row chunks. Effects key on `user.id`, since token refreshes hand out new user objects.
- Redirect targets taken from URLs go through `safeNextPath` (`//host` and `/\host` resolve off-site).

## Testing

- Vitest runs without globals, so `src/test/setup.ts` registers Testing Library's `cleanup`.
- Component tests use Testing Library with `fireEvent`; `user-event` isn't installed.
- Add new pure modules to the coverage `include` list in `vitest.config.mts`.
- `.claude/**` is excluded from Vitest and ESLint, because Claude Code session worktrees live in `.claude/worktrees/` inside this repo.

## Conventions and gotchas

- In CSS write only the standard `backdrop-filter`. Lightning CSS adds `-webkit-backdrop-filter` itself. A hand-written prefixed copy after the standard one makes the compiler drop the standard property, which turns the blur off in Chrome and Firefox.
- Persisted stores hydrate after the first render. During hydration components see the initial (empty) state, so don't freeze a store value into `useState`; derive it until the user makes a choice (see `BankrollDashboard`).
- Card pickers are Framer Motion bottom sheets. In a hidden preview pane, animation frames pause, so the sheet never slides in and coordinate clicks hit its backdrop. Verify through element refs or DOM clicks there.
- The app sends `X-Frame-Options: deny`, so it can't be loaded in an iframe, even same-origin.
- `next` and `eslint-config-next` are pinned to the same exact version; bump them together and read the upgrade notes in `node_modules/next/dist/docs/`. `npm audit` still reports a dev-only `braces` chain inside `eslint-config-next` whose only "fix" is a downgrade.
- The README's launch video is `public/brag.mp4`, a 720p web copy served at `/brag.mp4`, with `docs/brag-preview.gif` as its preview. Both come from a `/brag` run whose output (`brag-output/`, gitignored) stays local. The proxy matcher skips `.mp4` so range requests don't refresh the Supabase session.
- Releases: add notes under `## Unreleased` in `CHANGELOG.md`; a release renames that to the version, bumps `package.json`, and lands as a "Release CardEdge x.y.z" PR.
