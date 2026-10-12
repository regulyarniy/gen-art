import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");
const decisionsPath = join(dataDir, "decisions.json");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

function cleanBatch(b) {
  b = String(b || "main").slice(0, 40);
  if (!/^[a-z0-9-]+$/i.test(b)) return "main";
  return b;
}
function decisionsPathFor(batch) {
  return batch === "main" ? join(dataDir, "decisions.json") : join(dataDir, `decisions-${batch}.json`);
}
function loadDecisions(batch) {
  try {
    return JSON.parse(readFileSync(decisionsPathFor(batch), "utf8"));
  } catch {
    return { votes: {}, log: [] };
  }
}
function saveDecisions(batch, d) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(decisionsPathFor(batch), JSON.stringify(d, null, 2) + "\n");
}

function readBody(req) {
  return new Promise((resolve) => {
    let s = "";
    req.on("data", (c) => { s += c; if (s.length > 65536) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(s || "{}")); } catch { resolve({}); } });
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const json = (code, obj) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  // --- curation API: decisions persist to data/decisions[-<batch>].json so the
  // --- agent picks them up from disk — user copies nothing.
  // --- batch = staging poll (staging/<batch>/); "main" = legacy pack file.
  if (url.pathname === "/api/batches" && req.method === "GET") {
    let out = [];
    try {
      const { readdirSync, existsSync } = await import("node:fs");
      const staging = join(root, "staging");
      if (existsSync(staging)) {
        for (const b of readdirSync(staging).sort()) {
          try {
            const cat = JSON.parse(readFileSync(join(staging, b, "effects.json"), "utf8"));
            out.push({ batch: b, count: (cat.effects || []).length });
          } catch {}
        }
      }
    } catch {}
    return json(200, { batches: out });
  }
  if (url.pathname === "/api/decisions" && req.method === "GET") {
    const batch = cleanBatch(url.searchParams.get("batch"));
    return json(200, { batch, ...loadDecisions(batch) });
  }
  if (url.pathname === "/api/decide" && req.method === "POST") {
    const { id, ok, src, batch: rawBatch } = await readBody(req);
    const batch = cleanBatch(rawBatch);
    if (typeof id !== "string" || typeof ok !== "boolean") return json(400, { error: "need {id, ok}" });
    const d = loadDecisions(batch);
    d.votes[id] = { ok, ts: Date.now() };
    d.log.push({ id, ok, ts: Date.now(), src: String(src || "").slice(0, 40) });
    d.log = d.log.slice(-200);
    saveDecisions(batch, d);
    return json(200, { ok: true, id, batch });
  }
  if (url.pathname === "/api/reset" && req.method === "POST") {
    const { batch: rawBatch } = await readBody(req);
    const batch = cleanBatch(rawBatch);
    saveDecisions(batch, { votes: {}, log: [] });
    return json(200, { ok: true, batch });
  }

  if (req.method !== "GET") {
    res.writeHead(405);
    res.end("method not allowed");
    return;
  }
  let path = url.pathname === "/" ? "/preview/index.html" : url.pathname;
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  try {
    const data = await readFile(join(root, safe));
    res.writeHead(200, { "Content-Type": MIME[extname(safe)] ?? "text/plain" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found: " + safe);
  }
}).listen(Number(process.env.PORT || 5173), () => console.log(`preview: http://localhost:${process.env.PORT || 5173}/  (+ POST /api/decide)`));
