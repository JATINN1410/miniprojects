# Web Games Hub 🎮

A small, growing collection of lightweight browser games built with plain HTML, CSS and vanilla JavaScript. The project focuses on playable, accessible, and mobile-friendly implementations that are easy to read and extend.

## Games included
- **Tic Tac Toe** — 2-player or play vs CPU (Minimax AI). Tracks wins locally and highlights the winning line.
- **Connect Four** — 7×6 drop-disc game with 2-player and vs-CPU (minimax) modes, Undo/Redo, animated drops, and local wins tracking.
- **Minesweeper** — Beginner 9×9 board (10 mines), right-click flags, timer, and best-time persistence.
- **Pong** — Responsive canvas-based Pong with optional AI opponent, keyboard controls, and best-score tracking.
- **Simon Says** — Sequence memory game using WebAudio tones and best-level tracking.
- **2048** — Classic tile-joining puzzle with scoring and best-score storage.
- **Snake** — Arcade-style Snake with keyboard (and touch swipe) support and local high-score storage.

## Highlights & Features ✨
- Responsive, modern UI using CSS variables, gradients and subtle animations.
- Persistent progress via `localStorage` (best scores, wins, best times).
- Simple, dependency-free code: all games use vanilla JS and are easy to read or fork.
- Accessibility & controls: keyboard shortcuts, focusable controls, and touch support where useful.
- Small UX flourishes: confetti on wins, JS status badges on game pages, and minimal sound feedback using WebAudio.

## Quick start — Run locally ⚡
1. Clone or download the repo.
2. Open `index.html` in your browser, or run a simple static server (for example, `npx serve`).
3. Click any game card to open a game page.

Troubleshooting
- If a game does not start, open the browser devtools console and look for an on-page error overlay. All game pages include a `JS OK` badge that turns red if initialization fails.

## Developer notes 🛠
- Local storage keys (examples): `tic-tac-toe-best`, `connect-four-wins`, `minesweeper-best`, `pong-best`, `simon-says-best`, `2048-best`, `snake-best`.
- Code structure: each game lives in `games/<name>/` with its own `index.html`, `style.css`, and `app.js`.
- Contributions welcome — open an issue or send a PR with a new game or polish.

## Ideas for future work
- Add more CPU difficulty levels and performance tuning for minimax-based games.
- Add optional player profiles / back-end leaderboards.
- Improve animations and add lightweight assets (optional) for richer feedback.

---


Enjoy — and tell me which game you'd like me to polish next! 🎉