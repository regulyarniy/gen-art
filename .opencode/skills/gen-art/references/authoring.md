# Как писать новый эффект

Новый батч = новый файл `generator/templates/batches/<batch>.mjs` + записи в реестре.
Общие файлы (`canvas-extra`, `shader-extra`, `spinners-css`) — legacy, не дописывать.

## Контракт рантайм-сниппета

Сниппет — строка JS, результат builder-функции. После `eval`/`<script>` должен появиться
`globalThis.gaXxx = { mount }`, где `mount(el, opts) -> { destroy }`.

Обязательно внутри `mount`:

- canvas создаётся и аппендится в `el` (`position:absolute;inset:0`, у `el` выставить `position:relative` при нужде);
- `ResizeObserver` (guard `typeof ResizeObserver != "undefined"`) + первичное `rs()`;
- `IntersectionObserver`: `vis=false` останавливает rAF (`raf=0`), появление перезапускает;
- DPR cap: `Math.min(devicePixelRatio || 1, 1.5)`;
- мышь: `pointermove` (passive) пишет `mx,my` 0..1; скролл: `fr()` считает `sx` 0..1 из `getBoundingClientRect`;
- `matchMedia("(prefers-reduced-motion: reduce)")` → один статичный `draw(0,true)` без цикла;
- `destroy()`/`off()`: `run=false`, `cancelAnimationFrame`, `disconnect` обоих обсерверов, снять листенеры, `cv.remove()`, для WebGL — `loseContext`.

## Canvas: хелперы (импорт из `../canvas-extra.mjs`)

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

- `lifecycle()` уже объявляет `cv,cx,W,Hh,raf,run,vis,mx,my,sx,ro,io,loop,ev,fr,rm`. НЕ объявляй их повторно.
- `draw(dt)` обязан существовать; время — только через аккумулятор `T` (его объявляет `footer()` — `let L=0,T=R0()*80`), кадр `dt` в мс.
- `footer()` делает ранний `return` при reduced-motion, иначе `rs();observe;raf=requestAnimationFrame(loop)`. После `footer()` в `body` ничего не дописывать — `shell()` сам добавит `return{destroy:off}`.
- Сид: `H(seed)()`→число→`RR(n)`→функция (НЕ `RR(n())`). Респаун частиц — `Math.random()`.
- Цвета только из `cols`/`bgc` (запечены генератором). Градиенты: `createRadialGradient` + `bgc` на внешнем стопе, не прозрачность через суффикс (hex `"00"` ломается на именованных цветах — у нас только hex, но проще `bgc`).

## Шейдер: `shaderShell` (импорт из `../shader-extra.mjs`)

- `fragBody` — только тело: хелперы + `void main(){...}`. Доступны uniform: `t` (сек), `m` (мышь 0..1), `s` (скролл 0..1), `r` (резолюция px). Выход `o`.
- GLSL ES 3.00, `precision highp float` уже есть. Циклы с константными границами, без `texture`, без расширений.
- Яркость держать в узде: `min(band,1.)`, затухание к краям `1.-.5*dot(u,u)`, иначе выбеленное молоко (кейс aurora v1).
- Fallback на Canvas2D-градиент уже встроен в shell — проверять оба пути (smoke режет webgl2 и идёт в fallback; браузер — наоборот).

## Бюджеты и минификатор

- Canvas ≤ 4096 Б, шейдер ≤ 5120 Б, CSS ≤ 1024 Б (считать после `minJS`/`minCSS`).
- `minJS` режет пробелы вокруг `{}();,=+-*/<>|&?:` — НЕ писать код, зависящий от пробелов (шаблонные строки с пробелами внутри — ок, но `return\n{...}` сломается: `return` и `{` на разных строках давать нельзя).
- Без `//`-комментариев внутри сниппета (стираются построчно только с начала строки — не рисковать вообще).

## Проверка нового эффекта

```pwsh
node generator/gen.mjs --type <id> --seed 7 --palette 0
node --check dist/ga-<id>.js
node generator/check.mjs
node generator/smoke.mjs
```

Потом живьём: добавить бокс в `preview/canvas-check.html` или `preview/shader-check.html`,
`node preview/server.mjs`, открыть, скриншот, консоль пустая. Только потом — в curate на голосование.

## Параметры эффектов (попап в превью)

- Каждый эффект пака описывает до 8 параметров в `generator/lib/effects.mjs`, таблица `PARAMS`.
  Запись: `[key, type, min, max, step, def, label]`, type ∈ `range | int | toggle | color`.
- Сниппет читает их только как `o.key ?? baked`, дефолт в схеме обязан совпадать с запечённым буквально.
- Числовые пачки (`SP`, `N`, ...) объявлять ДО первого использования в `draw` (TDZ ловит params-smoke).
- `dist/effects.json` несёт `params`, `bytes`, `budget` — их читает попап `preview/index.html`
  (бейдж `вес / бюджет` + контролы; для canvas дописывает `bg` и пресет палитры → `o.bg`/`o.colors`).
- Попап: таблица `BOX` в index.html идёт строго в порядке массива `H` (сначала все JS).
- CSS-эффекты параметризуются переменными `--ga-z` (размер) и `--ga-d` (множитель длительности);
  попап ставит их на демо-элемент, speed инвертируется (`--ga-d = 1/v`).
- Шейдеры: shell даёт `o.speed/o.zoom/o.bright` через uniform `z`, `b` (frag правит сам эффект).
- Проверки: `node <tmp>/params-smoke.mjs [фильтр]` (монтирует всё с min/def/max + 40 кадров,
  оба reduced-режима), `node <tmp>/popup-check.mjs` (BOX/каталог/порядок/бюджеты).
