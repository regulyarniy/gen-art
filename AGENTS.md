# AGENTS.md — gen-art-zero

Offline generator of self-contained generative snippets `mount(el, opts) → { destroy }`.
Zero runtime dependencies. Shell — PowerShell (`;` instead of `&&`).

## Structure

- `dist/` — approved pack ONLY. `dist/effects.json` — catalog (`id,file,global,kind,title,meaning,opts,demo,bytes,budget,params`).
- `staging/<batch>/` — batch candidates + `effects.json`. Deleted after triage.
- `generator/lib/effects.mjs` — single registry. Field `batch:"<id>"` = candidate (goes to staging); no field = pack (goes to dist).
- `generator/templates/batches/<batch>.mjs` — batch builder functions (one file per batch). Shared `canvas-extra` / `shader-extra` / `spinners-css` — legacy: do not add new effects there, bugfixes only.
- `preview/index.html` — MANUAL pack showcase (cards + script + mount hardcoded). Must mirror `dist` after every triage.
- `preview/curate.html?batch=<id>` — candidate curation (`?batch=all` — full, `?batch=main` — pack gallery).
- `preview/server.mjs` — static + API (`/api/batches`, `/api/decisions`, `/api/decide`, `/api/reset`). Before voting, run with FRESH code.
- `preview/sites/` — archetype demo pages (landings, admin, …) + `index.html` pointer. Only `dist/` with `?v=2`, `mount` with opts from `PARAMS` keys, destroy on unload. Check: `node <tmp>/sites-check.mjs`.
- `data/decisions[-<batch>].json` — votes, `data/batches.json` — triage results. `selected/` — separate manual pack, do not touch during triage.

## Runtime snippet contract

- `globalThis.gaXxx = { mount }`, zero imports and external resources.
- Inside `mount`: canvas `position:absolute;inset:0`, `el` positioning — only if computed `static` (do not overwrite class-based absolute/fixed/sticky with inline!), `ResizeObserver` (guard `typeof`), `IntersectionObserver` (pause outside viewport), DPR cap 1.5, `pointermove` (passive) + scroll via `fr()`, `prefers-reduced-motion` = 1 static frame (always after `rs()`), `destroy()` cleans everything + `loseContext` for WebGL.
- Canvas: helpers `shell/lifecycle/footer` from `canvas-extra.mjs`; `draw(dt)` exists, time only via `T`; nothing after `footer()`. No `//` comments, no `in window` (only `typeof`), `return` and `{` on one line (minifier).
- Shader: `shaderShell`, GLSL ES 3.00, uniforms `t,m,s,r` (+`z,b` for zoom/brightness), output `o`, brightness constrained (`min`, fade to edges).
- Budgets (after minification): canvas ≤ 4096 B, shader ≤ 5120 B, CSS ≤ 1024 B. Check parens in shell wrappers with `node --check`.

## Effect params

- Up to 8 per effect, `PARAMS` table in `generator/lib/effects.mjs`: `[key, type, min, max, step, def, label]`, type ∈ `range|int|toggle|color`.
- Snippet reads only `o.key ?? baked`, schema default = baked value literally. Batches (`SP`, `N`, …) declare BEFORE use in `draw` (TDZ).
- CSS: variables `--ga-z` (size), `--ga-d` (duration multiplier, speed inverted).
- Popup in `preview/index.html`: `BOX` table goes STRICTLY in `H` array order (all JS first). Code serializer — only deviations from defaults.
- Stands (outside repo, `%LOCALAPPDATA%\Temp\opencode\`): `params-smoke.mjs [filter]` (min/def/max + 40 frames + both reduced modes), `popup-check.mjs`, `eye-check.mjs`.

## Commands

```pwsh
node generator/gen.mjs --type all --seed 7 --palette 0
node generator/check.mjs
node generator/smoke.mjs
node preview/server.mjs
```

## Commits

Each finished change (batch generated / batch triaged / feature / fix) — separate commit in English, as `type: what was done`. Working tree green before commit (`gen` with no OVER, `check`, `smoke`).

## Deploy to GitHub Pages

- `npm run deploy` builds `deploy/` (showcase + sites + `dist`, paths rewritten, `.nojekyll`). Generated directory, not committed to git.
- `.github/workflows/deploy.yml`: push to `main` → pack rebuild → publish `deploy/` via official `deploy-pages`.
- Needs remote origin + enabled Pages (Source: GitHub Actions) in repo settings.
