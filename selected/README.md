# Selected (seed 7, palette abyss)

4 vignettes, zero dependencies. Total ~10.9 KB single file.

## Option A — single file

```html
<script src="ga-selected.js"></script>
<script>
  const h1 = gaBgFlow.mount(document.getElementById('hero'), { count: 550 }); // Wind Over the Field
  const h2 = gaRibbon.mount(document.getElementById('silk'));                 // Silk of Memory
  const h3 = gaDots.mount(document.getElementById('crowd'));                  // Breath of the Crowd
  const h4 = gaTopo.mount(document.getElementById('map'));                    // Map of Silence
  // h1.destroy() on unmount
</script>
```

## Option B — separate files

`ga-bg-flow.js` (2.88 KB), `ga-ribbon.js` (2.80 KB),
`ga-dots.js` (2.50 KB), `ga-topo.js` (2.38 KB) — each self-contained.

`manifest.json` — machine-readable pack manifest.
`demo.html` — verifies everything ships in one tag.
