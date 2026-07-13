# Changelog

## 0.3.1 — 2026-07-12

- Changed the default poker setup to a $20 buy-in with $0.25/$0.50 blinds.
- Changed the default blackjack hand bet to $1.
- Migrated the previous $200/$1/$2 poker defaults and $25 blackjack default while preserving custom settings.

## 0.3.0 — 2026-07-11

- Rebuilt the application shell for phone-first use with a persistent bottom navigation and compact top bar.
- Reorganized poker and blackjack into focused mobile tabs while retaining full odds, ranges, rules, and explanations.
- Replaced inline card controls with touch-friendly bottom-sheet pickers.
- Converted default poker stakes, stacks, bets, calls, and pots to dollar values with cent precision.
- Added editable dollar bets for blackjack hands.
- Added a dated game-session ledger with poker, blackjack, and combined profit/loss totals.
- Added Supabase email accounts, password recovery, guest-to-account migration, and cross-device sync.
- Added row-level-secured Postgres storage for financial sessions and saved training records.
- Increased the test suite to 57 tests and added exact money and bankroll aggregation coverage.

## 0.2.0 — 2026-07-10

- Replaced the passive poker action log with a validated betting-state engine.
- Added action order, automatic pots and stacks, street progression, and undo.
- Added range-weighted, cancellable Web Worker simulations with effective equity and uncertainty.
- Rebuilt blackjack strategy around deck, H17/S17, DAS, and surrender matrices.
- Added physical shoe validation and explicit unavailable-action fallbacks.
- Added private local hand/session history, replay, notes, and training accuracy.
- Added responsive and accessibility improvements, error monitoring, and security headers.
- Added 53 automated tests, coverage gates, GitHub Actions CI, and dependency auditing.
- Upgraded Next.js to 16.2.10 and overrode its vulnerable nested PostCSS version.
