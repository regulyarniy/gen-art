---
name: gen-art
description: Zero-runtime generative motion effects — new batches, curation, triage into the pack. Use when asked to generate effects, show the curation, triage a batch, or assemble the selected pack.
---

# gen-art — zero-runtime generative art

Project: offline generator of self-contained snippets `mount(el, opts) -> {destroy}`, zero runtime dependencies.
Project root is the session working directory (where `package.json` = `gen-art-zero`).

## Data model (do not break)

- `dist/` — ONLY the approved pack. `dist/effects.json` — its catalog.
- `staging/<batch>/` — candidates of one batch + `staging/<batch>/effects.json`. Deleted after triage.
- `generator/lib/effects.mjs` — registry. Field `batch: "<id>"` = candidate (goes to staging); no field = pack (goes to dist).
- `generator/templates/batches/<batch>.mjs` — batch builder functions (one file per batch; shared helpers are imported from `canvas-extra.mjs` / `shader-extra.mjs` / `spinners-css.mjs`). Old shared template files are legacy, new effects only in batch files.
- `preview/curate.html?batch=<id>` — vote on candidates ONLY. `?batch=all` — full curation (pack + all batches, votes in `data/decisions-all.json`). No parameter — newest batch, `?batch=main` — pack gallery without buttons (data-driven, reads `dist/effects.json`, updates itself).
- `preview/index.html` — MANUAL pack showcase: hardcoded cards + `<script>` + `mount` calls. Does not update itself — must mirror `dist` after every triage (see Workflow B, showcase step).
- `preview/server.mjs` — static + API: `GET /api/batches`, `GET /api/decisions?batch=`, `POST /api/decide {batch,id,ok}`, `POST /api/reset {batch}`. Votes live in `data/decisions[-<batch>].json`.
- `generator/make-selected.mjs [--from-decisions]` — `selected/` from `data/decisions.json` (main pack) or `selected/manifest.json`.
- Agent NEVER asks the user to copy the manifest — reads `data/*.json` from disk.

Commands — pwsh-compatible (`;` instead of `&&`). Batch ID: `bNN-slug`, next free number.

```pwsh
node generator/gen.mjs --type all --seed 7 --palette 0
node generator/check.mjs
node generator/smoke.mjs
node preview/server.mjs
```

## Workflow A — generate N new effects (into a batch, not into the pack)

1. Read `references/authoring.md` (snippet contract, prohibitions, budgets).
2. Create `generator/templates/batches/<batch>.mjs` with builder functions (canvas — via `shell/lifecycle/footer`, shader — via `shaderShell`, CSS — plain string; see authoring).
3. Register entries in `generator/lib/effects.mjs` (at the end of the file): id kebab-case, file `ga-<id>.(js|css)`, global `gaXxx` (for css — null + `demo` field with HTML), kind (`canvas`/`shader`/`css`), budget (4096/5120/1024), `batch: "<batch>"`, title + meaning in English.
4. Run: `node generator/gen.mjs --type all --seed 7 --palette 0; node generator/check.mjs; node generator/smoke.mjs` — all green, no OVER. Candidates must land in `staging/<batch>/`, pack in `dist/` — without their files.
5. Open `http://localhost:5173/preview/curate.html?batch=<batch>`, screenshot, console without errors.
6. Send the user to vote. Decisions land in `data/decisions-<batch>.json` by themselves.

## Workflow B — triage a batch (accepted into the pack, rejected deleted entirely)

1. Read `data/decisions-<batch>.json` (`votes: {id: {ok}}`). If there are no votes — send the user to the curation, wait.
2. Accepted: remove the `batch` field from their registry entries (builder stays in the batch file — it is simply home now).
3. Rejected: delete the registry entry + builder function from the batch file (+ import if it became unused). Verify with grep that id/file/global are gone nowhere.
4. If the batch file is empty — delete the file. Delete `staging/<batch>/` and `data/decisions-<batch>.json`. Write the result to `data/batches.json` (`{batch, accepted:[], rejected:[], ts}`).
5. Run gen + check + smoke. Verify: `dist` contains the accepted ones, the rejected ones are nowhere (grep), `staging/<batch>` is gone.
6. Update the MANUAL showcase `preview/index.html` (otherwise the pack on the front page silently goes stale): header counter `pack (N)`; for each accepted one — a card (`div.box` with unique id + meta with title/file/meaning), `<script src="../dist/<file>?v=2">` and a `<global>.mount(...)` call; cards of effects no longer in `dist` — delete. Verify with a script: all `dist/*.js` from the showcase exist, all `gaXxx.mount` match `global` from `dist/effects.json`.
7. Report composition and weight. Do NOT touch `selected/` — it is a separate manual pack (Workflow C).

## Workflow C — assemble the selected pack (only on request)

1. Read `data/decisions.json` (main) or take the manifest from the user.
2. `node generator/make-selected.mjs --from-decisions` (or without the flag — from `selected/manifest.json`).
3. Check `selected/demo.html` in the browser (screenshot + empty console).

## Hard rules

- Runtime snippet: zero imports, zero external resources, `mount/destroy`, pause outside viewport, DPR cap 1.5, `prefers-reduced-motion` = 1 static frame.
- Do not use `in window` — only `typeof X != "undefined"`.
- Check paren balance in shell wrappers with `node --check` immediately (there was a bug with an extra `}`).
- Previews load `dist`/`staging` with `?v=` to avoid catching cache.
- Preview server must run FRESH code — otherwise `/api/*` is missing and votes stay in the browser only.
- Deleting an effect = registry entry + builder + import + dist/staging files + grep check. "Delete entirely" means entirely.
