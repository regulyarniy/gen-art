# AGENTS.md — gen-art-zero

Офлайн-генератор самодостаточных generative-сниппетов `mount(el, opts) → { destroy }`.
Ноль зависимостей в рантайме. Shell — PowerShell (`;` вместо `&&`).

## Структура

- `dist/` — ТОЛЬКО утверждённый пак. `dist/effects.json` — каталог (`id,file,global,kind,title,meaning,opts,demo,bytes,budget,params`).
- `staging/<batch>/` — кандидаты батча + `effects.json`. Удаляется после разбора.
- `generator/lib/effects.mjs` — единый реестр. Поле `batch:"<id>"` = кандидат (едет в staging); без поля = пак (едет в dist).
- `generator/templates/batches/<batch>.mjs` — builder-функции батча (один файл на батч). Общие `canvas-extra` / `shader-extra` / `spinners-css` — legacy: новых эффектов туда не добавлять, править только багафиксы.
- `preview/index.html` — РУЧНАЯ витрина пака (карточки + script + mount захардкожены). Обязана зеркалить `dist` после каждого разбора.
- `preview/curate.html?batch=<id>` — голосование по кандидатам (`?batch=all` — полное, `?batch=main` — галерея пака).
- `preview/server.mjs` — статика + API (`/api/batches`, `/api/decisions`, `/api/decide`, `/api/reset`). Перед опросом запускать СВЕЖИМ кодом.
- `preview/sites/` — демо-страницы архетипов (лендинги, админка, …) + `index.html`-указатель. Только `dist/` с `?v=2`, `mount` с opts из ключей `PARAMS`, destroy на unload. Проверка: `node <tmp>/sites-check.mjs`.
- `data/decisions[-<batch>].json` — голоса, `data/batches.json` — итоги разборов. `selected/` — отдельный ручной пак, при разборе не трогать.

## Контракт рантайм-сниппета

- `globalThis.gaXxx = { mount }`, ноль импортов и внешних ресурсов.
- Внутри `mount`: canvas `position:absolute;inset:0`, позиционирование `el` — только если computed `static` (классовые absolute/fixed/sticky не затирать инлайном!), `ResizeObserver` (guard `typeof`), `IntersectionObserver` (пауза вне вьюпорта), DPR cap 1.5, `pointermove` (passive) + скролл через `fr()`, `prefers-reduced-motion` = 1 статичный кадр (обязательно после `rs()`), `destroy()` чистит всё + `loseContext` для WebGL.
- Canvas: хелперы `shell/lifecycle/footer` из `canvas-extra.mjs`; `draw(dt)` существует, время только через `T`; после `footer()` ничего не дописывать. Без `//`-комментариев, без `in window` (только `typeof`), `return` и `{` на одной строке (минификатор).
- Шейдер: `shaderShell`, GLSL ES 3.00, uniform `t,m,s,r` (+`z,b` для зума/яркости), выход `o`, яркость в узде (`min`, затухание к краям).
- Бюджеты (после минификации): canvas ≤ 4096 Б, шейдер ≤ 5120 Б, CSS ≤ 1024 Б. Скобки в shell-обёртках проверять `node --check`.

## Параметры эффектов

- До 8 штук на эффект, таблица `PARAMS` в `generator/lib/effects.mjs`: `[key, type, min, max, step, def, label]`, type ∈ `range|int|toggle|color`.
- Сниппет читает только `o.key ?? baked`, дефолт в схеме = запечённому буквально. Пачки (`SP`, `N`, …) объявлять ДО использования в `draw` (TDZ).
- CSS: переменные `--ga-z` (размер), `--ga-d` (множитель длительности, speed инвертируется).
- Попап `preview/index.html`: таблица `BOX` идёт СТРОГО в порядке массива `H` (сначала все JS). Сериализатор кода — только отличия от дефолтов.
- Стенды (вне репо, `%LOCALAPPDATA%\Temp\opencode\`): `params-smoke.mjs [фильтр]` (min/def/max + 40 кадров + оба reduced-режима), `popup-check.mjs`, `eye-check.mjs`.

## Команды

```pwsh
node generator/gen.mjs --type all --seed 7 --palette 0
node generator/check.mjs
node generator/smoke.mjs
node preview/server.mjs
```

## Коммиты

Каждое законченное изменение (батч сгенерирован / батч разобран / фича / фикс) — отдельный коммит на русском, в форме `тип: что сделано`. Рабочее дерево перед коммитом — зелёное (`gen` без OVER, `check`, `smoke`).

## Деплой на GitHub Pages

- `npm run deploy` собирает `deploy/` (витрина + сайты + `dist`, пути переписаны, `.nojekyll`). Каталог генерируемый, в git не коммитится.
- `.github/workflows/deploy.yml`: push в `main` → пересборка пака → публикация `deploy/` официальным `deploy-pages`.
- Нужен remote origin + включённый Pages (Source: GitHub Actions) в настройках репозитория.
