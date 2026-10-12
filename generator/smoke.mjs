import { readFileSync } from "node:fs";

function makeCtx2D() {
  return {
    setTransform() {}, fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {},
    lineTo() {}, stroke() {}, arc() {}, fill() {}, save() {}, restore() {}, translate() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    set fillStyle(v) {}, set strokeStyle(v) {}, set globalAlpha(v) {}, set lineWidth(v) {},
  };
}

globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.devicePixelRatio = 1;
globalThis.innerHeight = 800;
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.matchMedia = () => ({ matches: false });
globalThis.getComputedStyle = () => ({ position: "static" });
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe() { this.cb([{ isIntersecting: false }]); } disconnect() {} };

function makeEl() {
  return {
    style: {},
    appendChild() {},
    getBoundingClientRect() { return { width: 400, height: 220, top: -100, left: 0 }; },
  };
}

globalThis.document = {
  createElement() {
    return {
      style: {},
      remove() {},
      getContext(kind) {
        if (kind === "webgl2") return null; // fallback path
        return makeCtx2D();
      },
    };
  },
};

// Globals map derived from the generated catalog — JS snippets only (CSS has no runtime).
const catalog = JSON.parse(readFileSync("dist/effects.json", "utf8")).effects.filter((e) => e.kind !== "css");
const GLOBALS = Object.fromEntries(catalog.map((e) => [e.file, e.global]));

let fails = 0;
for (const f of Object.keys(GLOBALS).sort()) {
  const src = readFileSync("dist/" + f, "utf8");
  if (/import |require\(/.test(src)) { console.error(`FAIL ${f}: has imports`); fails++; }
  try {
    eval(src);
  } catch (e) { console.error(`FAIL ${f} eval:`, String(e).slice(0, 200)); fails++; continue; }
  const api = globalThis[GLOBALS[f]];
  if (!api?.mount) { console.error(`FAIL ${f}: no global ${GLOBALS[f]}`); fails++; continue; }
  try {
    const h = api.mount(makeEl(), {});
    if (!h?.destroy) { console.error(`FAIL ${f}: no destroy`); fails++; }
    else { h.destroy(); console.log(`OK ${f}: mount/destroy smoke passed`); }
  } catch (e) { console.error(`FAIL ${f} mount:`, String(e).slice(0, 300)); fails++; }
}
if (fails) process.exit(1);
console.log("SMOKE PASSED");
