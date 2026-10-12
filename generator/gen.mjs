import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rngFromSeed } from "./lib/prng.mjs";
import { PALETTES, pickPalette } from "./lib/palettes.mjs";
import { minJS, minCSS, kb } from "./lib/minify.mjs";
import { EFFECTS, effectMeta } from "./lib/effects.mjs";
import { buildIconCSS, buildLoaderCSS } from "./templates/css-pieces.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const stagingDir = join(root, "staging");
mkdirSync(distDir, { recursive: true });

function args() {
  const a = Object.fromEntries(
    process.argv.slice(2).reduce((acc, cur, i, arr) => {
      if (cur.startsWith("--")) {
        const k = cur.slice(2);
        const v = arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "1";
        acc.push([k, v]);
      }
      return acc;
    }, [])
  );
  return { type: a.type ?? "all", seed: Number(a.seed ?? 7), palette: a.palette ? Number(a.palette) : undefined };
}

const { type, seed, palette: palIdx } = args();
const rng = rngFromSeed(seed);
const palette = pickPalette(rng, palIdx);
const made = [];
const catalog = [];

function emit(outDir, name, content, budget) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, name), content);
  const bytes = Buffer.byteLength(content, "utf8");
  console.log(`${bytes <= budget ? "OK " : "OVER"}  ${name}  ${kb(content)}  (budget ${(budget / 1024).toFixed(2)} KB)`);
  made.push({ name, bytes, budget });
  return bytes;
}

const batches = {}; // batch -> catalog entries (staging, not pack)
for (const e of EFFECTS) {
  if (type !== "all" && type !== e.id) continue;
  const raw = e.seed ? e.build({ seed, palette }) : e.build({});
  const out = e.batch ? join(stagingDir, e.batch) : distDir;
  const bytes = emit(out, e.file, (e.kind === "css" ? minCSS(raw) : minJS(raw)) + "\n", e.budget);
  (e.batch ? (batches[e.batch] ??= []) : catalog).push(effectMeta(e, bytes));
  if (e.batch) {
    // candidate does not live in pack: wipe stale copy from dist
    const stale = join(distDir, e.file);
    if (existsSync(stale)) { rmSync(stale); console.log(`clean dist/${e.file} -> staging/${e.batch}/`); }
  }
}

if (type === "all" || type === "icon") emit(distDir, "ga-icons.css", minCSS(buildIconCSS()) + "\n", 1024);
if (type === "all" || type === "loader") emit(distDir, "ga-loader.css", minCSS(buildLoaderCSS()) + "\n", 1024);

// Catalog for data-driven pages (curate, index). Meta only, no code.
if (type === "all") {
  writeFileSync(join(distDir, "effects.json"), JSON.stringify({ seed, palette: palette.name, effects: catalog }, null, 2) + "\n");
  console.log(`catalog dist/effects.json (${catalog.length} effects)`);
  for (const [b, list] of Object.entries(batches)) {
    writeFileSync(join(stagingDir, b, "effects.json"), JSON.stringify({ batch: b, seed, palette: palette.name, effects: list }, null, 2) + "\n");
    console.log(`staging ${b}/effects.json (${list.length} candidates)`);
  }
}

// dist/ — pack only: wipe files no longer in registry (except hand-made css and catalog)
const keep = new Set([...EFFECTS.filter((e) => !e.batch).map((e) => e.file), "ga-icons.css", "ga-loader.css", "effects.json"]);
for (const f of readdirSync(distDir)) {
  if ((f.endsWith(".js") || f.endsWith(".css")) && !keep.has(f)) {
    rmSync(join(distDir, f));
    console.log(`prune dist/${f} (not in registry)`);
  }
}

const failed = made.filter((m) => m.bytes > m.budget);
if (failed.length) {
  console.error(`BUDGET FAILED: ${failed.map((f) => f.name).join(", ")}`);
  process.exit(1);
}
console.log(`palette: ${palette.name}  seed: ${seed}`);
