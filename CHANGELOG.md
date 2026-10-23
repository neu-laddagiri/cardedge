# Changelog

## Unreleased

- Added a 20-second launch video to the README, served from the site at `/brag.mp4` (a 720p web copy) with a looping GIF preview, and tightened the README around it.
- The proxy now skips `.mp4` requests, so video range requests don't refresh the session.
- Added one-tap rank keypads (A, 2–10, J, Q, K) for the blackjack dealer and the active hand. The dealer upcard and two player cards now take three taps.
- Suits are filled in automatically, rotating ♠♥♦♣ and skipping cards the configured shoe has used up. Ranks with no copies left are marked unavailable.
- Replaced the Add to Hand, Hit, and Double buttons: a hand's first two cards are dealt, later cards are recorded as hits, and a Double toggle arms the next tap to double down when the table rules allow it.
- Kept the bottom-sheet picker for entering an exact card; choosing one now plays it in a single step.
- Improved card-entry accessibility with named keypads and keys, spoken card and total updates, focus that returns to the picker button, and card buttons no longer announced as toggles.
- The poker street now follows the board cards. Completing the flop, then adding the turn and the river, moves it on; removing a card moves it back. Each change starts that street's betting over.
- A finished poker betting round now waits for the next card instead of jumping to the next street. The street buttons became a read-only indicator with a prompt for the next card.
- Undoing a poker action from an earlier street also takes back the board cards dealt after it.
- Named each poker card slot for screen readers (for example "Flop 2: choose a card"); all seven used to be read as "Choose a card".
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
