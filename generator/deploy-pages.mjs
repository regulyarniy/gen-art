// Static bundle for GitHub Pages: showcase + demo sites + dist. No server needed.
// Curate/voting pages are NOT included (they need the API).
import { rmSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "deploy");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "dist"), { recursive: true });
mkdirSync(join(out, "sites"), { recursive: true });

for (const f of readdirSync(join(root, "dist"))) copyFileSync(join(root, "dist", f), join(out, "dist", f));

function rewrite(src, pairs) {
  let s = readFileSync(src, "utf8");
  for (const [a, b] of pairs) s = s.split(a).join(b);
  return s;
}
writeFileSync(join(out, "index.html"), rewrite(join(root, "preview/index.html"), [["../dist/", "dist/"]]));
for (const f of readdirSync(join(root, "preview/sites"))) {
  if (!f.endsWith(".html")) continue;
  writeFileSync(join(out, "sites", f), rewrite(join(root, "preview/sites", f), [["../../dist/", "../dist/"]]));
}
writeFileSync(join(out, ".nojekyll"), "");

// Self-check: every relative src/href resolves inside the bundle.
let fail = 0, n = 0;
const pages = ["index.html", ...readdirSync(join(out, "sites")).filter((f) => f.endsWith(".html")).map((f) => "sites/" + f)];
for (const rel of pages) {
  const base = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/") + 1) : "";
  const raw = readFileSync(join(out, rel), "utf8");
  const html = raw.replace(/<script>([\s\S]*?)<\/script>/g, "<script></script>");
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const u = m[1].split("?")[0].split("#")[0];
    if (!u || /^(https?:|mailto:|data:)/.test(u)) continue;
    n++;
    const target = normalize(base + u).replace(/\\/g, "/");
    if (target.startsWith("..") || !existsSync(join(out, target))) {
      console.error(`BROKEN ${rel} -> ${m[1]}`);
      fail++;
    }
  }
}
console.log(`deploy/: ${pages.length} pages, ${n} refs checked`);
if (fail) { console.error(`DEPLOY CHECK FAILED (${fail})`); process.exit(1); }
console.log("DEPLOY OK");
