# gen-art-zero

[![Breath of the Crowd (ember) — live demo](assets/dots-ember.gif)](https://regulyarniy.github.io/gen-art/)

Offline generator of zero-runtime generative art snippets: each file in `dist/` is self-contained, contract — `mount(el, opts) -> { destroy }`.

- Showcase: https://regulyarniy.github.io/gen-art/
- Demo sites: https://regulyarniy.github.io/gen-art/sites/

## Embed

```html
<div id="hero" style="min-height:320px"></div>
<script src="ga-ribbon.js"></script>
<script>
  const h = gaRibbon.mount(document.getElementById('hero'));
  // h.destroy() on unmount
</script>
```

## Development

```pwsh
npm run generate  # pack from registry
npm run check     # syntax and budgets
npm run smoke     # mount/destroy
npm run preview   # http://localhost:5173/
npm run deploy    # static bundle for gh-pages
```

New effects — in batches via `@gen-art` skill: generation → vote in `preview/curate.html?batch=<id>` → triage into pack. Details: `AGENTS.md`.
