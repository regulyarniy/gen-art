# How to write a new effect

New batch = new file `generator/templates/batches/<batch>.mjs` + registry entries.
Shared files (`canvas-extra`, `shader-extra`, `spinners-css`) are legacy, do not append to them.

## Runtime snippet contract

Snippet is a JS string, the result of a builder function. After `eval`/`<script>` there must appear
`globalThis.gaXxx = { mount }`, where `mount(el, opts) -> { destroy }`.

Required inside `mount`:

- canvas is created and appended to `el` (`position:absolute;inset:0`, set `position:relative` on `el` if needed);
- `ResizeObserver` (guard `typeof ResizeObserver != "undefined"`) + initial `rs()`;
- `IntersectionObserver`: `vis=false` stops rAF (`raf=0`), reappearing restarts it;
- DPR cap: `Math.min(devicePixelRatio || 1, 1.5)`;
- mouse: `pointermove` (passive) writes `mx,my` 0..1; scroll: `fr()` computes `sx` 0..1 from `getBoundingClientRect`;
- `matchMedia("(prefers-reduced-motion: reduce)")` → one static `draw(0,true)` without a loop;
- `destroy()`/`off()`: `run=false`, `cancelAnimationFrame`, `disconnect` both observers, remove listeners, `cv.remove()`, for WebGL — `loseContext`.

## Canvas: helpers (import from `../canvas-extra.mjs`)

```js
import { shell, lifecycle, footer } from "../canvas-extra.mjs";

export function buildMine({ seed = 1, palette }) {
  const consts = `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)},SE0=${JSON.stringify(String(seed))};`;
  const body = `const seed=o.seed??SE0,cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;`
    + `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle()
    + `function draw(dt){T+=dt*.0012*(1+sx); ... }` + footer();
  return shell("gaMine", consts, body);
}
```

- `lifecycle()` already declares `cv,cx,W,Hh,raf,run,vis,mx,my,sx,ro,io,loop,ev,fr,rm`. Do NOT redeclare them.
- `draw(dt)` must exist; time — only via the `T` accumulator (declared by `footer()` — `let L=0,T=R0()*80`), frame `dt` in ms.
- `footer()` does an early `return` on reduced-motion, otherwise `rs();observe;raf=requestAnimationFrame(loop)`. After `footer()` do not append anything to `body` — `shell()` adds `return{destroy:off}` itself.
- Seed: `H(seed)()`→number→`RR(n)`→function (NOT `RR(n())`). Particle respawn — `Math.random()`.
- Colors only from `cols`/`bgc` (baked by the generator). Gradients: `createRadialGradient` + `bgc` on the outer stop, not transparency via suffix (hex `"00"` suffix breaks on named colors — ours are hex-only, but `bgc` is simpler).

## Shader: `shaderShell` (import from `../shader-extra.mjs`)

- `fragBody` is the body only: helpers + `void main(){...}`. Available uniforms: `t` (sec), `m` (mouse 0..1), `s` (scroll 0..1), `r` (resolution px). Output `o`.
- GLSL ES 3.00, `precision highp float` already present. Loops with constant bounds, no `texture`, no extensions.
- Keep brightness in check: `min(band,1.)`, edge falloff `1.-.5*dot(u,u)`, otherwise washed-out milk (aurora v1 case).
- Canvas2D-gradient fallback is already built into the shell — check both paths (smoke cuts webgl2 and goes to fallback; the browser is the opposite).

## Budgets and minifier

- Canvas ≤ 4096 B, shader ≤ 5120 B, CSS ≤ 1024 B (counted after `minJS`/`minCSS`).
- `minJS` strips spaces around `{}();,=+-*/<>|&?:` — do NOT write code that depends on spaces (template strings with spaces inside are fine, but `return\n{...}` will break: `return` and `{` must not go on different lines).
- No `//` comments inside the snippet (they are stripped line-wise only from line start — do not risk it at all).

## Verifying a new effect

```pwsh
node generator/gen.mjs --type <id> --seed 7 --palette 0
node --check dist/ga-<id>.js
node generator/check.mjs
node generator/smoke.mjs
```

Then live: add a box to `preview/canvas-check.html` or `preview/shader-check.html`,
`node preview/server.mjs`, open, screenshot, empty console. Only then — to curate for voting.

## Effect parameters (popup in preview)

- Each pack effect declares up to 8 parameters in `generator/lib/effects.mjs`, the `PARAMS` table.
  Entry: `[key, type, min, max, step, def, label]`, type ∈ `range | int | toggle | color`.
- The snippet reads them only as `o.key ?? baked`, the default in the schema must match the baked value literally.
- Numeric packs (`SP`, `N`, ...) declare BEFORE first use in `draw` (TDZ is caught by params-smoke).
- `dist/effects.json` carries `params`, `bytes`, `budget` — read by the `preview/index.html` popup
  (`weight / budget` badge + controls; for canvas it appends `bg` and the palette preset → `o.bg`/`o.colors`).
- Popup: the `BOX` table in index.html goes strictly in the order of the `H` array (all JS first).
- CSS effects are parameterized with variables `--ga-z` (size) and `--ga-d` (duration multiplier);
  the popup sets them on the demo element, speed is inverted (`--ga-d = 1/v`).
- Shaders: the shell provides `o.speed/o.zoom/o.bright` via uniforms `z`, `b` (the frag amends the effect itself).
- Checks: `node <tmp>/params-smoke.mjs [filter]` (mounts everything with min/def/max + 40 frames,
  both reduced-modes), `node <tmp>/popup-check.mjs` (BOX/catalog/order/budgets).
