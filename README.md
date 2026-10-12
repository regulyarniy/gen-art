# gen-art-zero

Офлайн-генератор zero-runtime generative art сниппетов.
Рантайм-зависимостей ноль: каждый файл из `dist/` самодостаточен,
контракт один: `mount(el, opts) -> { destroy }`.

Живое демо (gh-pages): https://regulyarniy.github.io/gen-art/
Демо-сайты: https://regulyarniy.github.io/gen-art/sites/

Скилл для агента: `@gen-art` (`.opencode/skills/gen-art/SKILL.md`) —
генерация новых эффектов и сборка пака из отбора.

## Цикл «батч → опрос → разбор» (копипасты нет)

```pwsh
node generator/gen.mjs --type all --seed 7 --palette 0
node generator/check.mjs
node generator/smoke.mjs
node preview/server.mjs        # http://localhost:5173/
```

1. Просишь «сгенери N» — агент кладёт кандидатов во временный батч `staging/<batch>/`
   (в пак `dist/` они НЕ попадают).
2. Голосуешь в `preview/curate.html?batch=<batch>` — в опросе только кандидаты,
   утверждённое не показывается. Каждый голос сразу пишется на диск
   (`data/decisions-<batch>.json` или `data/decisions.json` для main).
3. Говоришь «разбирай батч» — агент добавляет принятые в пак, а отклонённые
   удаляет полностью (реестр, builder, файлы, греп-контроль).
4. `selected/` — отдельный ручной пак: `node generator/make-selected.mjs --from-decisions`.

## Пак (7)

| файл | вес | виньетка — смысл |
|---|---|---|
| `ga-bg-flow.js` | ~2.8 КБ | Ветер над полем — потоки несут семена идей |
| `ga-ribbon.js` | ~2.7 КБ | Шёлк памяти — ленты прошлого в дыхании настоящего |
| `ga-dots.js` | ~2.4 КБ | Дыхание толпы — точки-голоса, рядом с тобой громче |
| `ga-topo.js` | ~2.3 КБ | Карта тишины — изолинии внутреннего ландшафта |
| `ga-spin-ring.css` | ~0.3 КБ | Кольцо ожидания — 0 JS |
| `ga-spin-dots.css` | ~0.5 КБ | Азбука Морзе — 0 JS |
| `ga-spin-wave.css` | ~0.7 КБ | Шёпот — 0 JS |
| `ga-icons.css` | ~0.5 КБ | `.ga-spin .ga-pulse .ga-dash` — 0 JS |
| `ga-loader.css` | ~0.4 КБ | `.ga-loader` точки — 0 JS |

Каталог для страниц: `dist/effects.json` (генерит `gen.mjs` из `generator/lib/effects.mjs`).
Реестр эффектов — единственный источник правды: `generator/lib/effects.mjs`.

Общее для JS: `ResizeObserver` + `IntersectionObserver` (пауза вне вьюпорта),
DPR cap 1.5, `pointermove` параллакс, `scroll` варп/скорость,
`prefers-reduced-motion` рисует 1 статичный кадр. Шейдеры с Canvas2D-фолбэком.

## Вставка куда угодно

```html
<div id="hero" style="min-height:320px"></div>
<script src="ga-ribbon.js"></script>
<script>
  const h = gaRibbon.mount(document.getElementById('hero'));
  // h.destroy() при размонтировании
</script>
```

## Страницы

- `preview/index.html` — пак с названиями (`/`)
- `preview/curate.html?batch=<id>` — опрос только по кандидатам (без параметра — новейший батч, `?batch=main` — галерея пака без кнопок)
- `preview/shader-check.html`, `preview/canvas-check.html` — стенды для новых эффектов
- `selected/demo.html` — демо упакованного комплекта
