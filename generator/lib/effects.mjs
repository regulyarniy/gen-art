// Single source of truth for all generative snippets.
// Registry drives: dist generation (gen.mjs), dist/effects.json catalog,
// curate page (dynamic), selected pack demo (make-selected.mjs).
import { buildBgFlow } from "../templates/bg-flow.mjs";
import {
  buildRibbon, buildDotGrid, buildTopo,
} from "../templates/canvas-extra.mjs";
import {
  buildDotTerrain,
} from "../templates/batches/b02-waves.mjs";
import {
  buildRainFall, buildKaleido, buildStaticNoise, buildDnaHelix,
} from "../templates/batches/b03-wild.mjs";
import {
  buildBlackHole, buildGlassRain, buildMagnetField, buildJellyFloat, buildBoids,
  buildCityNight, buildMoireRings, buildTetrisRain, buildOceanLayers, buildBacteria,
  buildRadarSonar, buildIsoCubes, buildConfettiStorm, buildSpiderEyes, buildClockParticles,
  buildPlasmaSea, buildSpinGlitch,
} from "../templates/batches/b04-mad.mjs";
import { SPINNER_BUILDERS } from "../templates/spinners-css.mjs";

// Параметры эффектов для превью-попапа. Формат записи: [key, type, min, max, step, def, label].
// type: range | int | toggle | color. Сниппет читает их как o.key ?? baked-def.
const PARAMS = {
  "bg-flow": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 50, 1500, 1, 550, "Частицы"], ["trail", "range", .02, .3, .01, .08, "Шлейф"], ["len", "range", 2, 20, .5, 8, "Длина"]],
  "ribbon": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 14, 1, 7, "Линии"], ["amp", "range", .2, 2.5, .1, 1, "Размах"]],
  "dots": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["step", "int", 12, 36, 1, 22, "Шаг"], ["size", "range", .5, 3, .1, 1, "Размер"]],
  "topo": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 5, 25, 1, 13, "Линии"], ["amp", "range", .2, 2.5, .1, 1, "Размах"]],
  "dot-terrain": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["den", "int", 14, 48, 1, 30, "Сетка"], ["amp", "range", .2, 2.5, .1, 1, "Рельеф"]],
  "rain-fall": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 10, 200, 1, 70, "Капли"], ["len", "range", .3, 3, .1, 1, "Длина"]],
  "kaleido": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 12, 1, 6, "Лепестки"], ["size", "range", .4, 2, .1, 1, "Размер"]],
  "static-noise": [["count", "int", 50, 1000, 1, 320, "Искры"], ["tear", "range", 0, .5, .01, .12, "Разрывы"], ["size", "int", 1, 5, 1, 2, "Зерно"]],
  "dna-helix": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["amp", "range", .2, 2.5, .1, 1, "Размах"], ["step", "int", 4, 16, 1, 8, "Шаг"]],
  "black-hole": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 30, 400, 1, 130, "Звёзды"], ["disk", "range", .15, .9, .05, .4, "Диск"]],
  "glass-rain": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 5, 80, 1, 26, "Капли"], ["size", "range", .4, 2.5, .1, 1, "Размер"]],
  "magnet-field": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["step", "int", 12, 36, 1, 22, "Шаг"], ["len", "int", 2, 14, 1, 6, "Длина"]],
  "jelly-float": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 14, 1, 6, "Медузы"], ["size", "range", .4, 2.2, .1, 1, "Размер"]],
  "boids": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 10, 250, 1, 70, "Птицы"], ["pull", "range", 0, .12, .005, .03, "Стая"]],
  "city-night": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["den", "int", 8, 24, 1, 16, "Дома"], ["light", "range", -.9, .9, .05, -.1, "Свет"]],
  "moire-rings": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["step", "int", 3, 14, 1, 7, "Шаг"], ["twin", "toggle", 0, 1, 1, 1, "Двойник"]],
  "tetris-rain": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 20, 1, 8, "Фигуры"], ["size", "range", .5, 2, .1, 1, "Размер"]],
  "ocean-layers": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 8, 1, 5, "Слои"], ["amp", "range", .2, 2.5, .1, 1, "Волны"]],
  "bacteria": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 4, 40, 1, 14, "Клетки"], ["maxr", "int", 8, 30, 1, 16, "Деление"]],
  "radar-sonar": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 40, 1, 12, "Метки"], ["trail", "range", .03, .4, .01, .12, "Шлейф"]],
  "iso-cubes": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 5, 70, 1, 22, "Кубы"], ["size", "range", .4, 2.2, .1, 1, "Размер"]],
  "confetti-storm": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 10, 300, 1, 80, "Бумажки"], ["size", "range", .4, 2.5, .1, 1, "Размер"]],
  "spider-eyes": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 2, 30, 1, 14, "Глаза"], ["follow", "toggle", 0, 1, 1, 1, "Взгляд"]],
  "clock-particles": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["count", "int", 10, 250, 1, 70, "Песчинки"], ["scale", "range", .25, .6, .01, .42, "Часы"]],
  "plasma-sea": [["speed", "range", .1, 3, .1, 1, "Скорость"], ["zoom", "range", .4, 2.2, .1, 1, "Зум"], ["bright", "range", .4, 1.5, .05, 1, "Яркость"]],
  "spin-ring": [["size", "range", .4, 2.2, .1, 1, "Размер"], ["speed", "range", .25, 3, .05, 1, "Скорость"]],
  "spin-dots": [["size", "range", .4, 2.2, .1, 1, "Размер"], ["speed", "range", .25, 3, .05, 1, "Скорость"]],
  "spin-wave": [["size", "range", .4, 2.2, .1, 1, "Размер"], ["speed", "range", .25, 3, .05, 1, "Скорость"]],
  "spin-glitch": [["size", "range", .4, 2.2, .1, 1, "Размер"], ["speed", "range", .25, 3, .05, 1, "Скорость"]],
};

// kind: canvas | shader (WebGL2 + 2d fallback) | css. budget in bytes.
export const EFFECTS = [
  { id: "bg-flow", file: "ga-bg-flow.js", global: "gaBgFlow", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Ветер над полем", meaning: "Невидимые потоки несут семена идей — остановись, и увидишь их след.",
    opts: { count: 550 }, params: PARAMS["bg-flow"] || [], build: buildBgFlow },
  { id: "ribbon", file: "ga-ribbon.js", global: "gaRibbon", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Шёлк памяти", meaning: "Семь лент прошлого, колеблемых дыханием настоящего.",
    opts: {}, params: PARAMS["ribbon"] || [], build: buildRibbon },
  { id: "dots", file: "ga-dots.js", global: "gaDots", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Дыхание толпы", meaning: "Каждая точка — один голос; вместе они пульсируют, рядом с тобой — громче.",
    opts: {}, params: PARAMS["dots"] || [], build: buildDotGrid },
  { id: "topo", file: "ga-topo.js", global: "gaTopo", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Карта тишины", meaning: "Изолинии внутреннего ландшафта — рельеф того, о чём молчат.",
    opts: {}, params: PARAMS["topo"] || [], build: buildTopo },
];

export function effectMeta(e, bytes = 0) {
  return { id: e.id, file: e.file, global: e.global || null, kind: e.kind, title: e.title, meaning: e.meaning, opts: e.opts || {}, demo: e.demo || null, bytes, budget: e.budget, params: e.params || [] };
}

// 3 promoted CSS spinners (b01-spinners merge): 0 JS, one file per spinner.
const SPINNERS = [
  ["spin-ring", "ga-spin-ring.css", "Кольцо ожидания", "Классика жанра: круг, который никуда не спешит, но держит слово."],
  ["spin-dots", "ga-spin-dots.css", "Азбука Морзе", "Три точки шлют сигналы: жди, всё уже летит к тебе."],
  ["spin-wave", "ga-spin-wave.css", "Шёпот", "Эквалайзер неслышной музыки: процесс звучит, даже когда тихо."],
];

for (const [id, file, title, meaning] of SPINNERS) {
  EFFECTS.push({
    id, file, global: null, kind: "css", budget: 1024, seed: false, palette: false,
    title, meaning, opts: {},
    params: PARAMS[id] || [],
    demo: id === "spin-dots"
      ? `<span class="ga-sp-dots"><i></i><i></i><i></i></span>`
      : id === "spin-wave"
        ? `<span class="ga-sp-wave"><i></i><i></i><i></i><i></i><i></i></span>`
        : `<span class="ga-sp-${id.slice(5)}"></span>`,
    build: SPINNER_BUILDERS[id],
  });
}

// b02-waves: dot-terrain promoted to pack, other 9 candidates rejected and removed.
EFFECTS.push({
  id: "dot-terrain", file: "ga-dot-terrain.js", global: "gaDotTerrain",
  kind: "canvas", budget: 4096, seed: true, palette: true,
  title: "Рельеф из точек", meaning: "Тысяча точек держит форму холмов — высота читается размером.",
  opts: {}, params: PARAMS["dot-terrain"] || [], build: buildDotTerrain,
});

// b03-wild: 4 promoted to pack, other 16 rejected and removed.
const WILD = [
  ["rain-fall", "ga-rain-fall.js", "gaRainFall", buildRainFall, "Падающие тире", "Матричный дождь для тех, кто не читает глифы."],
  ["kaleido", "ga-kaleido.js", "gaKaleido", buildKaleido, "Калейдоскоп", "Шесть дрожащих лепестков из чистой тригонометрии."],
  ["static-noise", "ga-static-noise.js", "gaStaticNoise", buildStaticNoise, "Телеппомехи", "Триста двадцать искр за кадр и редкая горизонтальная слеза."],
  ["dna-helix", "ga-dna-helix.js", "gaDnaHelix", buildDnaHelix, "Спираль жизни", "Двойная нить с перекладинами плывёт слева направо."],
];

for (const [id, file, global, build, title, meaning] of WILD) {
  EFFECTS.push({
    id, file, global, kind: "canvas", budget: 4096, seed: true, palette: true,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

// b04-mad: 17 промотированы в пак, остальные 33 отклонены и удалены.
const MAD_CANVAS = [
  ["black-hole", "gaBlackHole", buildBlackHole, "Чёрная дыра", "Аккреционный диск жадно пожирает свет — смотри, но не подходи."],
  ["glass-rain", "gaGlassRain", buildGlassRain, "Дождь на стекле", "Капли ползут по стеклу и расходятся кругами."],
  ["magnet-field", "gaMagnetField", buildMagnetField, "Магнитное поле", "Железные опилки выстраиваются по указке невидимого магнита."],
  ["jelly-float", "gaJellyFloat", buildJellyFloat, "Медузы", "Шесть медуз дрейфуют вверх и шевелят щупальцами."],
  ["boids", "gaBoids", buildBoids, "Стая", "Мурмурация: птицы-пиксели тянутся к курсору, как к хлебу."],
  ["city-night", "gaCityNight", buildCityNight, "Ночной город", "Сто шестьдесят окон моргают: кто-то не спит."],
  ["moire-rings", "gaMoireRings", buildMoireRings, "Муаровые кольца", "Два центра кругов спорят — рождается муар."],
  ["tetris-rain", "gaTetrisRain", buildTetrisRain, "Тетрис-дождь", "Фигурки падают, но складывать их некому."],
  ["ocean-layers", "gaOceanLayers", buildOceanLayers, "Девятый вал", "Пять волн идут друг на друга полупрозрачным строем."],
  ["bacteria", "gaBacteria", buildBacteria, "Деление бактерий", "Клетки растут, лопаются и делятся пополам."],
  ["radar-sonar", "gaRadarSonar", buildRadarSonar, "Сонар", "Луч радара крутится и будит спящие отметки."],
  ["iso-cubes", "gaIsoCubes", buildIsoCubes, "Изометрия", "Двадцать два куба прыгают на батуте."],
  ["confetti-storm", "gaConfettiStorm", buildConfettiStorm, "Конфетти-шторм", "Восемьдесят бумажек крутятся в вихре праздника."],
  ["spider-eyes", "gaSpiderEyes", buildSpiderEyes, "Глаза из темноты", "Четырнадцать глаз с веками моргают и следят за курсором."],
  ["clock-particles", "gaClockParticles", buildClockParticles, "Песочные часы", "Семьдесят песчинок сыплются сквозь горловину времени."],
];

for (const [id, global, build, title, meaning] of MAD_CANVAS) {
  EFFECTS.push({
    id, file: `ga-${id}.js`, global, kind: "canvas", budget: 4096,
    seed: true, palette: true,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

const MAD_SHADER = [
  ["plasma-sea", "gaPlasmaSea", buildPlasmaSea, "Плазменное море", "Жидкий синус переливается всеми палитрами сразу."],
];

for (const [id, global, build, title, meaning] of MAD_SHADER) {
  EFFECTS.push({
    id, file: `ga-${id}.js`, global, kind: "shader", budget: 5120,
    seed: false, palette: false,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

const MAD_CSS = [
  ["spin-glitch", "ga-spin-glitch.css", buildSpinGlitch, "Глитч-куб", "Квадрат косит и двоится — загрузка с помехами.", `<span class="ga-sp-glitch"></span>`],
];

for (const [id, file, build, title, meaning, demo] of MAD_CSS) {
  EFFECTS.push({
    id, file, global: null, kind: "css", budget: 1024,
    seed: false, palette: false,
    title, meaning, opts: {}, params: PARAMS[id] || [], demo, build,
  });
}


