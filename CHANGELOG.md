# Changelog

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
