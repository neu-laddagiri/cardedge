# CardEdge

A poker and blackjack probability/helper dashboard built with Next.js. CardEdge helps you practice table decisions with estimated equity, pot odds, and basic strategy recommendations in a polished, casino-inspired interface.

> **Disclaimer:** CardEdge is a training and probability tool only. It is not financial advice, not a guaranteed winning system, and not intended for cheating in real-money games. All poker and blackjack recommendations are estimates based on visible cards, simulations, and common strategy rules.

## Features

- **Poker table interface** — Visual Texas Hold'em layout with community cards, pot display, and player seats
- **Player management** — Add/remove players, set stacks, blinds, hero/dealer positions, and opponent styles
- **Pot odds tracking** — Live pot odds calculations with clear formulas and call thresholds
- **Monte Carlo poker equity estimates** — Win/tie/lose probabilities from randomized simulations
- **Blackjack basic strategy helper** — Rule-aware hit/stand/double/split/surrender recommendations
- **Rule settings for blackjack** — Deck count, H17, double after split, surrender, and payout options
- **Animated casino-style UI** — Dark felt gradients, glassmorphism, and smooth motion throughout

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [lucide-react](https://lucide.dev/)
- [pokersolver](https://www.npmjs.com/package/pokersolver)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:

```bash
npm run build
```

## Current Status

**Work in progress.** The core MVP is being built and is functional for local training use. Some calculations, UI flows, and edge cases may still need refinement as the project evolves.

## Future Improvements

- Better opponent range modeling for poker
- More precise poker simulations and performance tuning
- More blackjack rule variations (European no-hole-card, peek rules, etc.)
- Saved sessions and hand history
- Mobile polish and touch-friendly controls
- Deployment to a production host

## License

Private portfolio project. All rights reserved unless otherwise specified.
