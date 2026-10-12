// Pack the curated set into selected/.
// Sources (priority): --from-decisions (data/decisions.json votes) or selected/manifest.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EFFECTS } from "./lib/effects.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const selDir = join(root, "selected");
const distDir = join(root, "dist");
mkdirSync(selDir, { recursive: true });

const byId = Object.fromEntries(EFFECTS.map((e) => [e.id, e]));
let manifest;
if (process.argv.includes("--from-decisions")) {
  const d = JSON.parse(readFileSync(join(root, "data", "decisions.json"), "utf8"));
  const accepted = Object.entries(d.votes || {})
    .filter(([, v]) => v && v.ok)
    .map(([id]) => byId[id])
    .filter(Boolean)
    .map((e) => ({ id: e.id, file: e.file, global: e.global, title: e.title }));
  if (!accepted.length) {
    console.error("No accepted votes in data/decisions.json — nothing to pack.");
    process.exit(1);
  }
  manifest = { seed: 7, palette: 0, accepted };
  writeFileSync(join(selDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest from decisions: ${accepted.map((a) => a.id).join(", ")}`);
} else {
  manifest = JSON.parse(readFileSync(join(selDir, "manifest.json"), "utf8"));
}

let total = 0;
const jsParts = [];
const cssParts = [];
for (const a of manifest.accepted) {
  const src = readFileSync(join(distDir, a.file), "utf8");
  writeFileSync(join(selDir, a.file), src);
  const bytes = Buffer.byteLength(src, "utf8");
  total += bytes;
  if (a.file.endsWith(".css")) cssParts.push(`/* --- ${a.file} (${a.title}) — ${(bytes / 1024).toFixed(2)} KB --- */\n` + src.trim());
  else jsParts.push(`/* --- ${a.file} (${a.title}) — ${(bytes / 1024).toFixed(2)} KB --- */\n` + src.trim());
  console.log(`copy  ${a.file}  ${(bytes / 1024).toFixed(2)} KB  (${a.title})`);
}

if (jsParts.length) {
  const bundle = `/* gen-art-zero selected: ${manifest.accepted.filter((a) => !a.file.endsWith(".css")).map((a) => a.id).join(", ")} | zero deps */\n` +
    jsParts.join("\n") + "\n";
  writeFileSync(join(selDir, "ga-selected.js"), bundle);
  console.log(`bundle ga-selected.js  ${(Buffer.byteLength(bundle, "utf8") / 1024).toFixed(2)} KB`);
}
if (cssParts.length) {
  const css = `/* gen-art-zero selected spinners: ${manifest.accepted.filter((a) => a.file.endsWith(".css")).map((a) => a.id).join(", ")} | zero JS */\n` +
    cssParts.join("\n") + "\n";
  writeFileSync(join(selDir, "ga-selected.css"), css);
  console.log(`bundle ga-selected.css  ${(Buffer.byteLength(css, "utf8") / 1024).toFixed(2)} KB`);
}

const hasJS = manifest.accepted.some((a) => !a.file.endsWith(".css"));
const hasCSS = manifest.accepted.some((a) => a.file.endsWith(".css"));
const cards = manifest.accepted.map((a, i) => {
  const e = byId[a.id];
  const inner = a.file.endsWith(".css") ? (e && e.demo) || "" : "";
  const sub = a.file.endsWith(".css") ? `${a.file} · 0 JS` : `${a.file} · window.${a.global}`;
  return `    <div class="card"><div class="box${a.file.endsWith(".css") ? " center" : ""}" id="v${i}">${inner}</div><div class="meta"><b>${a.title}</b><span>${sub}</span></div></div>`;
}).join("\n");
const mounts = manifest.accepted
  .map((a, i) => {
    const e = byId[a.id];
    if (a.file.endsWith(".css")) return null;
    return `  H.push(${a.global}.mount(document.getElementById('v${i}'), ${JSON.stringify((e && e.opts) || {})}));`;
  })
  .filter(Boolean).join("\n");
writeFileSync(join(selDir, "demo.html"), `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>selected demo</title>${hasCSS ? '\n<link rel="stylesheet" href="./ga-selected.css">' : ""}
<style>
body{margin:0;background:#05070c;color:#e5e7eb;font:14px/1.5 system-ui,sans-serif}
.wrap{max-width:1000px;margin:0 auto;padding:24px}.grid{display:grid;gap:16px;grid-template-columns:1fr 1fr}
@media(max-width:700px){.grid{grid-template-columns:1fr}}
.card{background:#0a0f1c;border:1px solid #1f2937;border-radius:12px;overflow:hidden}
.box{position:relative;min-height:240px}.box.center{display:flex;align-items:center;justify-content:center;min-height:180px}
.meta{padding:8px 12px;border-top:1px solid #1f2937}
.meta span{opacity:.5;font-size:12px;margin-left:8px;font-family:ui-monospace,monospace}
</style></head><body><div class="wrap"><h1>Выбранное — ${manifest.accepted.length}</h1>
<p>${hasJS ? `Один тег: <code>&lt;script src="ga-selected.js"&gt;&lt;/script&gt;</code>` : ""}${hasJS && hasCSS ? " + " : ""}${hasCSS ? `Один файл: <code>&lt;link href="ga-selected.css"&gt;</code>` : ""}</p>
<div class="grid">\n${cards}\n</div></div>
${hasJS ? `<script src="./ga-selected.js"></script>\n<script>\n  const H = [];\n${mounts}\n  addEventListener('beforeunload', () => H.forEach(h => h.destroy()));\n</script>` : ""}
</body></html>\n`);
console.log("demo  selected/demo.html");
