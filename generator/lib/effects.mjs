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

// Effect params for the preview popup. Entry format: [key, type, min, max, step, def, label].
// type: range | int | toggle | color. The snippet reads them as o.key ?? baked-def.
const PARAMS = {
  "bg-flow": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 50, 1500, 1, 550, "Particles"], ["trail", "range", .02, .3, .01, .08, "Trail"], ["len", "range", 2, 20, .5, 8, "Length"]],
  "ribbon": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 14, 1, 7, "Lines"], ["amp", "range", .2, 2.5, .1, 1, "Amplitude"]],
  "dots": [["speed", "range", .1, 3, .1, 1, "Speed"], ["step", "int", 12, 36, 1, 22, "Step"], ["size", "range", .5, 3, .1, 1, "Size"]],
  "topo": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 5, 25, 1, 13, "Lines"], ["amp", "range", .2, 2.5, .1, 1, "Amplitude"]],
  "dot-terrain": [["speed", "range", .1, 3, .1, 1, "Speed"], ["den", "int", 14, 48, 1, 30, "Density"], ["amp", "range", .2, 2.5, .1, 1, "Relief"]],
  "rain-fall": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 10, 200, 1, 70, "Drops"], ["len", "range", .3, 3, .1, 1, "Length"]],
  "kaleido": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 12, 1, 6, "Petals"], ["size", "range", .4, 2, .1, 1, "Size"]],
  "static-noise": [["count", "int", 50, 1000, 1, 320, "Sparks"], ["tear", "range", 0, .5, .01, .12, "Tears"], ["size", "int", 1, 5, 1, 2, "Grain"]],
  "dna-helix": [["speed", "range", .1, 3, .1, 1, "Speed"], ["amp", "range", .2, 2.5, .1, 1, "Amplitude"], ["step", "int", 4, 16, 1, 8, "Step"]],
  "black-hole": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 30, 400, 1, 130, "Stars"], ["disk", "range", .15, .9, .05, .4, "Disk"]],
  "glass-rain": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 5, 80, 1, 26, "Drops"], ["size", "range", .4, 2.5, .1, 1, "Size"]],
  "magnet-field": [["speed", "range", .1, 3, .1, 1, "Speed"], ["step", "int", 12, 36, 1, 22, "Step"], ["len", "int", 2, 14, 1, 6, "Length"]],
  "jelly-float": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 14, 1, 6, "Jellies"], ["size", "range", .4, 2.2, .1, 1, "Size"]],
  "boids": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 10, 250, 1, 70, "Birds"], ["pull", "range", 0, .12, .005, .03, "Cohesion"]],
  "city-night": [["speed", "range", .1, 3, .1, 1, "Speed"], ["den", "int", 8, 24, 1, 16, "Houses"], ["light", "range", -.9, .9, .05, -.1, "Light"]],
  "moire-rings": [["speed", "range", .1, 3, .1, 1, "Speed"], ["step", "int", 3, 14, 1, 7, "Step"], ["twin", "toggle", 0, 1, 1, 1, "Twin"]],
  "tetris-rain": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 20, 1, 8, "Pieces"], ["size", "range", .5, 2, .1, 1, "Size"]],
  "ocean-layers": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 8, 1, 5, "Layers"], ["amp", "range", .2, 2.5, .1, 1, "Waves"]],
  "bacteria": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 4, 40, 1, 14, "Cells"], ["maxr", "int", 8, 30, 1, 16, "Division"]],
  "radar-sonar": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 40, 1, 12, "Marks"], ["trail", "range", .03, .4, .01, .12, "Trail"]],
  "iso-cubes": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 5, 70, 1, 22, "Cubes"], ["size", "range", .4, 2.2, .1, 1, "Size"]],
  "confetti-storm": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 10, 300, 1, 80, "Confetti"], ["size", "range", .4, 2.5, .1, 1, "Size"]],
  "spider-eyes": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 2, 30, 1, 14, "Eyes"], ["size", "range", .5, 3, .1, 1, "Size"], ["follow", "toggle", 0, 1, 1, 1, "Gaze"]],
  "clock-particles": [["speed", "range", .1, 3, .1, 1, "Speed"], ["count", "int", 10, 250, 1, 70, "Grains"], ["scale", "range", .25, .6, .01, .42, "Clock"]],
  "plasma-sea": [["speed", "range", .1, 3, .1, 1, "Speed"], ["zoom", "range", .4, 2.2, .1, 1, "Zoom"], ["bright", "range", .4, 1.5, .05, 1, "Brightness"]],
  "spin-ring": [["size", "range", .4, 2.2, .1, 1, "Size"], ["speed", "range", .25, 3, .05, 1, "Speed"]],
  "spin-dots": [["size", "range", .4, 2.2, .1, 1, "Size"], ["speed", "range", .25, 3, .05, 1, "Speed"]],
  "spin-wave": [["size", "range", .4, 2.2, .1, 1, "Size"], ["speed", "range", .25, 3, .05, 1, "Speed"]],
  "spin-glitch": [["size", "range", .4, 2.2, .1, 1, "Size"], ["speed", "range", .25, 3, .05, 1, "Speed"]],
};

// kind: canvas | shader (WebGL2 + 2d fallback) | css. budget in bytes.
export const EFFECTS = [
  { id: "bg-flow", file: "ga-bg-flow.js", global: "gaBgFlow", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Wind Over the Field", meaning: "Invisible currents carry seeds of ideas \u2014 stop and you will see their trail.",
    opts: { count: 550 }, params: PARAMS["bg-flow"] || [], build: buildBgFlow },
  { id: "ribbon", file: "ga-ribbon.js", global: "gaRibbon", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Silk of Memory", meaning: "Seven ribbons of the past stirred by the breath of the present.",
    opts: {}, params: PARAMS["ribbon"] || [], build: buildRibbon },
  { id: "dots", file: "ga-dots.js", global: "gaDots", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Breath of the Crowd", meaning: "Every dot is one voice; together they pulse \u2014 louder near you.",
    opts: {}, params: PARAMS["dots"] || [], build: buildDotGrid },
  { id: "topo", file: "ga-topo.js", global: "gaTopo", kind: "canvas", budget: 4096, seed: true, palette: true,
    title: "Map of Silence", meaning: "Contour lines of an inner landscape \u2014 the relief of what is left unsaid.",
    opts: {}, params: PARAMS["topo"] || [], build: buildTopo },
];

export function effectMeta(e, bytes = 0) {
  return { id: e.id, file: e.file, global: e.global || null, kind: e.kind, title: e.title, meaning: e.meaning, opts: e.opts || {}, demo: e.demo || null, bytes, budget: e.budget, params: e.params || [] };
}

// 3 promoted CSS spinners (b01-spinners merge): 0 JS, one file per spinner.
const SPINNERS = [
  ["spin-ring", "ga-spin-ring.css", "Waiting Ring", "A genre classic: a circle in no hurry, but true to its word."],
  ["spin-dots", "ga-spin-dots.css", "Morse Code", "Three dots send signals: wait, everything is already flying to you."],
  ["spin-wave", "ga-spin-wave.css", "Whisper", "An equalizer of unheard music: the process sounds even when quiet."],
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
  title: "Dot Relief", meaning: "A thousand dots hold the shape of hills \u2014 height reads as size.",
  opts: {}, params: PARAMS["dot-terrain"] || [], build: buildDotTerrain,
});

// b03-wild: 4 promoted to pack, other 16 rejected and removed.
const WILD = [
  ["rain-fall", "ga-rain-fall.js", "gaRainFall", buildRainFall, "Falling Dashes", "Matrix rain for those who do not read glyphs."],
  ["kaleido", "ga-kaleido.js", "gaKaleido", buildKaleido, "Kaleidoscope", "Six trembling petals of pure trigonometry."],
  ["static-noise", "ga-static-noise.js", "gaStaticNoise", buildStaticNoise, "Static", "320 sparks per frame and a rare horizontal tear."],
  ["dna-helix", "ga-dna-helix.js", "gaDnaHelix", buildDnaHelix, "DNA Helix", "A double strand with rungs drifting left to right."],
];

for (const [id, file, global, build, title, meaning] of WILD) {
  EFFECTS.push({
    id, file, global, kind: "canvas", budget: 4096, seed: true, palette: true,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

// b04-mad: 17 promoted to pack, other 33 rejected and removed.
const MAD_CANVAS = [
  ["black-hole", "gaBlackHole", buildBlackHole, "Black Hole", "The accretion disk devours light \u2014 look, but do not approach."],
  ["glass-rain", "gaGlassRain", buildGlassRain, "Rain on Glass", "Drops crawl down the glass and spread in rings."],
  ["magnet-field", "gaMagnetField", buildMagnetField, "Magnetic Field", "Iron filings line up at the beck of an invisible magnet."],
  ["jelly-float", "gaJellyFloat", buildJellyFloat, "Jellyfish", "Six jellyfish drift upward, stirring their tentacles."],
  ["boids", "gaBoids", buildBoids, "Flock", "Murmuration: pixel birds flock to the cursor like it is bread."],
  ["city-night", "gaCityNight", buildCityNight, "Night City", "One hundred sixty windows blink: someone is awake."],
  ["moire-rings", "gaMoireRings", buildMoireRings, "Moire Rings", "Two circle centers argue \u2014 a moire is born."],
  ["tetris-rain", "gaTetrisRain", buildTetrisRain, "Tetris Rain", "The pieces fall, but there is no one to stack them."],
  ["ocean-layers", "gaOceanLayers", buildOceanLayers, "Ninth Wave", "Five waves advance on each other in translucent rank."],
  ["bacteria", "gaBacteria", buildBacteria, "Dividing Bacteria", "Cells grow, burst, and split in half."],
  ["radar-sonar", "gaRadarSonar", buildRadarSonar, "Sonar", "The radar beam sweeps and wakes sleeping marks."],
  ["iso-cubes", "gaIsoCubes", buildIsoCubes, "Isometry", "Twenty-two cubes bouncing on a trampoline."],
  ["confetti-storm", "gaConfettiStorm", buildConfettiStorm, "Confetti Storm", "Eighty paper bits spinning in a festive vortex."],
  ["spider-eyes", "gaSpiderEyes", buildSpiderEyes, "Eyes in the Dark", "Fourteen lidded eyes blink and follow the cursor."],
  ["clock-particles", "gaClockParticles", buildClockParticles, "Hourglass", "Seventy grains of sand sift through the throat of time."],
];

for (const [id, global, build, title, meaning] of MAD_CANVAS) {
  EFFECTS.push({
    id, file: `ga-${id}.js`, global, kind: "canvas", budget: 4096,
    seed: true, palette: true,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

const MAD_SHADER = [
  ["plasma-sea", "gaPlasmaSea", buildPlasmaSea, "Plasma Sea", "Liquid sine spilling across every palette at once."],
];

for (const [id, global, build, title, meaning] of MAD_SHADER) {
  EFFECTS.push({
    id, file: `ga-${id}.js`, global, kind: "shader", budget: 5120,
    seed: false, palette: false,
    title, meaning, opts: {}, params: PARAMS[id] || [], build,
  });
}

const MAD_CSS = [
  ["spin-glitch", "ga-spin-glitch.css", buildSpinGlitch, "Glitch Cube", "The square skews and doubles \u2014 loading with interference.", `<span class="ga-sp-glitch"></span>`],
];

for (const [id, file, build, title, meaning, demo] of MAD_CSS) {
  EFFECTS.push({
    id, file, global: null, kind: "css", budget: 1024,
    seed: false, palette: false,
    title, meaning, opts: {}, params: PARAMS[id] || [], demo, build,
  });
}


