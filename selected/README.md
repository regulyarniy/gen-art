# Выбранное (seed 7, palette abyss)

4 виньетки, ноль зависимостей. Суммарно ~10.6 КБ одним файлом.

## Вариант А — один файл

```html
<script src="ga-selected.js"></script>
<script>
  const h1 = gaBgFlow.mount(document.getElementById('hero'), { count: 550 }); // Ветер над полем
  const h2 = gaRibbon.mount(document.getElementById('silk'));                 // Шёлк памяти
  const h3 = gaDots.mount(document.getElementById('crowd'));                  // Дыхание толпы
  const h4 = gaTopo.mount(document.getElementById('map'));                    // Карта тишины
  // h1.destroy() при размонтировании
</script>
```

## Вариант Б — файлы по отдельности

`ga-bg-flow.js` (2.83 КБ), `ga-ribbon.js` (2.72 КБ),
`ga-dots.js` (2.41 КБ), `ga-topo.js` (2.30 КБ) — каждый самодостаточен.

`manifest.json` — машиночитаемый состав комплекта.
`demo.html` — проверка, что всё едет одним тегом.
