import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const files = readdirSync(out);
let fail = 0;
for (const f of files) {
  const p = join(out, f);
  const s = readFileSync(p, "utf8");
  console.log(`--- ${f}: ${Buffer.byteLength(s, "utf8")} B`);
  if (f.endsWith(".js")) {
    // syntax check via Function constructor (no execution, no DOM)
    try {
      new Function(s);
      console.log("    syntax OK");
      for (const token of ["import ", "require(", "from \"", "from '"]) {
        if (s.includes(token)) {
          console.error(`    FAIL: runtime snippet must be dependency-free, found ${JSON.stringify(token)}`);
          fail++;
        }
      }
      if (!s.includes("mount") || !s.includes("destroy")) {
        console.error("    FAIL: snippet must expose mount/destroy");
        fail++;
      }
    } catch (e) {
      console.error("    SYNTAX FAIL:", String(e).slice(0, 300));
      fail++;
    }
  }
  if (f.endsWith(".css") && /@import|url\(http/i.test(s)) {
    console.error("    FAIL: css must not fetch remote resources");
    fail++;
  }
}
if (fail) {
  console.error(`CHECK FAILED (${fail})`);
  process.exit(1);
}
console.log("CHECK PASSED");
