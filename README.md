# gen-art-zero

[![Дыхание толпы (ember) — живое демо](assets/dots-ember.gif)](https://regulyarniy.github.io/gen-art/sites/)

Офлайн-генератор zero-runtime generative art сниппетов: каждый файл из `dist/` самодостаточен, контракт — `mount(el, opts) -> { destroy }`.

- Витрина: https://regulyarniy.github.io/gen-art/
- Демо-сайты: https://regulyarniy.github.io/gen-art/sites/

## Вставка

```html
<div id="hero" style="min-height:320px"></div>
<script src="ga-ribbon.js"></script>
<script>
  const h = gaRibbon.mount(document.getElementById('hero'));
  // h.destroy() при размонтировании
</script>
```

## Разработка

```pwsh
npm run generate  # пак из реестра
npm run check     # синтаксис и бюджеты
npm run smoke     # mount/destroy
npm run preview   # http://localhost:5173/
npm run deploy    # статический бандл для gh-pages
```

Новые эффекты — батчами через скилл `@gen-art`: генерация → опрос в `preview/curate.html?batch=<id>` → разбор в пак. Детали: `AGENTS.md`.
