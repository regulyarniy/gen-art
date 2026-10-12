# Changelog — gen-art-zero

## 2026-10-12 — README trimmed

- Removed effect table and video (GIF link to demo left at top).
  See them in the live demo, not in a list. `assets/dots-ember.mp4/.png` removed.

## 2026-10-12 — dots-ember video for README

- `assets/dots-ember.mp4` (6 s, 960×540, 30 fps): swarm in ember palette, lissajous cursor,
  rendered with pixel stand from real `dist/ga-dots.js`. Poster `assets/dots-ember.png`.
- README: "Demo" block — clickable poster → mp4 + links to gh-pages.

## 2026-10-12 — Deploy to GitHub Pages

- `npm run deploy` (`generator/deploy-pages.mjs`): static bundle `deploy/` — showcase, 7 sites,
  `dist`, rewritten relative paths, `.nojekyll`, link self-check. Curation pages excluded — they need API.
- `.github/workflows/deploy.yml`: push to `main` → `generate` + build → official `deploy-pages`.
- Needs origin and enabled Pages (Source: GitHub Actions).

## 2026-10-12 — Demo sites: positioning fix and backgrounds

- Root cause of empty boxes: `el.style.position || "relative"` overwrote class-based `absolute` (box collapsed to 0).
  Now in all shells — computed-style check, touch only `static`.
- `tetris-rain`: shapes start partially in frame and fall faster (previously the first ones were visible after ~15 s).
- Background CTA strips with effects on all 7 pages + fixed bat layer on horror.
  All pages verified with screenshots in Edge.

## 2026-10-12 — Demo sites

- `preview/sites/`: 7 archetype pages on the `dist/` pack + pointer — SaaS landing, admin,
  horror quest, fintech, eco, music, holidays (including light theme via `o.bg/o.colors`).
  All 29 effects used. Check: `sites-check` (syntax, bindings, opts keys).
- Server fix: directory path (`/preview/sites/`) serves its own `index.html`, not 404.

## 2026-10-12 — Params, popup, and embed code

- All 29 pack effects parameterized (2–4 params: speed, count, sizes + relevant).
  Snippets read `o.key ?? baked`, schema — `PARAMS` table in registry, catalog returns `params/budget/bytes`.
- Popup in `preview/index.html`: ⚙ button on each card, live controls, shared "Background"/"Colors" for canvas,
  `weight / budget` badge on card, copyable init code block with current settings.
- Shader shell: `o.speed/o.zoom/o.bright` via uniforms `z`, `b` (effect — `plasma-sea`).
- CSS spinners: `--ga-z` (size), `--ga-d` (duration multiplier).
- Bugfixes: `footer()` returned `undefined` in reduced path; static frame drawn before `rs()`
  (at `radar-sonar` — infinite loop at zero step); `T/L` order in `bg-flow` (fragile with sync IO).
- Stands: `params-smoke` (param bounds + frames + both reduced modes), `popup-check`, `eye-check`.

## 2026-10-12 — Batch b04-mad triaged (pack 12 → 29)

- Accepted 17: black-hole, glass-rain, magnet-field, jelly-float, boids, city-night, moire-rings,
  tetris-rain, ocean-layers, bacteria, radar-sonar, iso-cubes, confetti-storm, spider-eyes,
  clock-particles, plasma-sea, spin-glitch. Rejected 33 (deleted entirely).
- `spider-eyes` reworked: almond eyes with lids, lash outline, lid fold;
  pupil offset clamped (does not escape when cursor is outside container).
- Showcase `preview/index.html` updated by hand (29 cards).

## 2026-10-12 — Batch b04-mad generated

- 50 candidates: 40 canvas + 6 shaders + 4 CSS. All within budget, smoke 50/50.

## 2026-10-12 — Batch b03-wild triaged

- Accepted 4: rain-fall, kaleido, static-noise, dna-helix. Rejected 16.

## 2026-10-12 — Batch b02-waves triaged

- Accepted dot-terrain. Rejected 9.

## 2026-10-12 — Full vote main

- Pinned in pack bg-flow, ribbon, dots, topo. Rejected 8 shader candidates.

## 2026-10-12 — Batch b01-spinners triaged

- Accepted 3 CSS spinners: spin-ring, spin-dots, spin-wave. Rejected 7.
