# Changelog

## Unreleased

- Fixed cloud sync deleting results and saved hands that another signed-in device had added. Deletions made on one device now stay deleted on the others, and accounts with more than 1,000 records load completely.
- Rebuilt blackjack strategy on the Wizard of Odds charts for every deck count, H17/S17, and DAS setting. 0.3.1 gave a different move in 23 of the hand-versus-upcard cells under at least one setting. For example, with four or more decks and H17 it hit hard 17 against an ace instead of standing when surrender wasn't offered.
- Split aces now take one card each and can't be resplit or doubled. Stand needs a live hand with two cards, and a split 21 no longer counts as blackjack.
- Opponent range percentages now sample the share of starting hands they name; a 22% range previously sampled about 7%.
- Made equity simulations faster and unbiased: one shuffle per trial, exact split-pot shares, and uniform dealing within narrow ranges.
- Value-bet and raise advice now scales with the number of live opponents.
- Corrected board-texture and threat notes for river flush draws, wheel straights, paired turns and rivers, and two-rank "straight draws".
- Kept chips, pots, blinds, and pot-odds formulas in whole cents, so shoving the exact remaining stack counts as all-in.
- Stopped an older simulation from occasionally replacing the odds for newer cards.
- Fixed the glass blur in Chrome and Firefox, the bankroll form opening for returning users, Range % clamping while typing, stretched SB/BB badges, and unlabeled icon buttons.
- Blocked open redirects through the sign-in callback.
- Upgraded Next.js to 16.3.8 for its proxy-bypass, SSRF, and remote-code-execution fixes, and removed the PostCSS override that now pinned a vulnerable version. Updated Vitest and other development dependencies.

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
