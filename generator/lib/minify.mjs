// Minimal JS/CSS minifier: strips comments + collapses whitespace.
// Keeps snippets readable-enough while hitting size budgets without dependencies.
export function minJS(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\n)\s*\/\/[^\n]*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,=+\-*/<>|&?:])\s*/g, "$1")
    .trim();
}

export function minCSS(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();:,])\s*/g, "$1")
    .trim();
}

export function byteLen(s) {
  return Buffer.byteLength(s, "utf8");
}

export function kb(s) {
  return (byteLen(s) / 1024).toFixed(2) + " KB";
}
