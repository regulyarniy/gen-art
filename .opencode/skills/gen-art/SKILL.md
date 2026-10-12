---
name: gen-art
description: Генеративные motion-эффекты с нулевым рантаймом — новые батчи, опрос, разбор в пак. Используй когда просят сгенерить эффекты, показать опрос, разобрать батч или собрать selected-пак.
---

# gen-art — zero-runtime generative art

Проект: офлайн-генератор самодостаточных сниппетов `mount(el, opts) -> {destroy}`, ноль зависимостей в рантайме.
Корень проекта — рабочая директория сессии (там `package.json` = `gen-art-zero`).

## Модель данных (не ломать)

- `dist/` — ТОЛЬКО утверждённый пак. `dist/effects.json` — его каталог.
- `staging/<batch>/` — кандидаты одного батча + `staging/<batch>/effects.json`. Удаляется после разбора.
- `generator/lib/effects.mjs` — реестр. Поле `batch: "<id>"` = кандидат (едет в staging); без поля = пак (едет в dist).
- `generator/templates/batches/<batch>.mjs` — builder-функции батча (по одному файлу на батч; общие хелперы импортируются из `canvas-extra.mjs` / `shader-extra.mjs` / `spinners-css.mjs`). Старые общие файлы шаблонов — legacy, новые эффекты только в batch-файлах.
- `preview/curate.html?batch=<id>` — опрос ТОЛЬКО по кандидатам. `?batch=all` — полное голосование (пак + все батчи, голоса в `data/decisions-all.json`). Без параметра — новейший батч, `?batch=main` — галерея пака без кнопок (data-driven, читает `dist/effects.json`, обновляется сама).
- `preview/index.html` — РУЧНАЯ витрина пака: захардкоженные карточки + `<script>` + вызовы `mount`. Сама не обновляется — обязана зеркалить `dist` после каждого разбора (см. Workflow B, шаг про витрину).
- `preview/server.mjs` — статика + API: `GET /api/batches`, `GET /api/decisions?batch=`, `POST /api/decide {batch,id,ok}`, `POST /api/reset {batch}`. Голоса лежат в `data/decisions[-<batch>].json`.
- `generator/make-selected.mjs [--from-decisions]` — `selected/` из `data/decisions.json` (main-пак) или `selected/manifest.json`.
- Агент НИКОГДА не просит пользователя копировать manifest — читает `data/*.json` с диска.

Команды — pwsh-совместимые (`;` вместо `&&`). ID батча: `bNN-slug`, следующий свободный номер.

```pwsh
node generator/gen.mjs --type all --seed 7 --palette 0
node generator/check.mjs
node generator/smoke.mjs
node preview/server.mjs
```

## Workflow A — сгенерить N новых эффектов (в батч, не в пак)

1. Прочитай `references/authoring.md` (контракт сниппета, запреты, бюджеты).
2. Создай `generator/templates/batches/<batch>.mjs` с builder-функциями (canvas — через `shell/lifecycle/footer`, шейдер — через `shaderShell`, CSS — чистая строка; см. authoring).
3. Зарегистрируй записи в `generator/lib/effects.mjs` (в конец файла): id kebab-case, file `ga-<id>.(js|css)`, global `gaXxx` (для css — null + поле `demo` с HTML), kind (`canvas`/`shader`/`css`), budget (4096/5120/1024), `batch: "<batch>"`, title + meaning на русском.
4. Прогони: `node generator/gen.mjs --type all --seed 7 --palette 0; node generator/check.mjs; node generator/smoke.mjs` — всё зелёное, без OVER. Кандидаты должны оказаться в `staging/<batch>/`, пак в `dist/` — без их файлов.
5. Открой `http://localhost:5173/preview/curate.html?batch=<batch>`, скриншот, консоль без ошибок.
6. Отправь пользователя голосовать. Решения сами упадут в `data/decisions-<batch>.json`.

## Workflow B — разобрать батч (принятые в пак, отклонённые удалить вообще)

1. Прочитай `data/decisions-<batch>.json` (`votes: {id: {ok}}`). Если голосов нет — отправь пользователя на опрос, дождись.
2. Принятые: убери поле `batch` из их записей реестра (builder остаётся в batch-файле — он теперь просто дом).
3. Отклонённые: удали запись реестра + builder-функцию из batch-файла (+ импорт, если стал unused). Проверь грепом, что id/file/global нигде не остались.
4. Если batch-файл опустел — удали файл. Удали `staging/<batch>/` и `data/decisions-<batch>.json`. Запиши итог в `data/batches.json` (`{batch, accepted:[], rejected:[], ts}`).
5. Прогони gen + check + smoke. Проверь: `dist` содержит принятые, отклонённых нет нигде (греп), `staging/<batch>` нет.
6. Обнови РУЧНУЮ витрину `preview/index.html` (иначе пак на главной устареет молча): заголовок-счётчик `пак (N)`; для каждого принятого — карточку (`div.box` с уникальным id + meta с title/file/meaning), `<script src="../dist/<file>?v=2">` и вызов `<global>.mount(...)`; карточки эффектов, которых больше нет в `dist`, — удалить. Проверь скриптом: все `dist/*.js` из витрины существуют, все `gaXxx.mount` совпадают с `global` из `dist/effects.json`.
7. Доложи состав и вес. `selected/` НЕ трогать — это отдельный ручной пак (Workflow C).

## Workflow C — собрать selected-пак (только по просьбе)

1. Прочитай `data/decisions.json` (main) или забери manifest у пользователя.
2. `node generator/make-selected.mjs --from-decisions` (или без флага — из `selected/manifest.json`).
3. Проверь `selected/demo.html` в браузере (скриншот + пустая консоль).

## Жёсткие правила

- Рантайм-сниппет: ноль импортов, ноль внешних ресурсов, `mount/destroy`, пауза вне вьюпорта, DPR cap 1.5, `prefers-reduced-motion` = 1 статичный кадр.
- Не использовать `in window` — только `typeof X != "undefined"`.
- Баланс скобок в shell-обёртках проверять `node --check` сразу (была бага с лишней `}`).
- Превью грузят `dist`/`staging` с `?v=` чтобы не ловить кэш.
- Сервер превью должен быть запущен СВЕЖИМ кодом — иначе `/api/*` нет и голоса останутся только в браузере.
- Удаление эффекта = запись реестра + builder + импорт + dist/staging-файлы + греп-контроль. «Удалить вообще» значит вообще.
