// Pre-baked palettes (hex strings). No culori at runtime — colors are frozen at generation time.
// Chosen in OKLCH space offline, stored as hex for zero-cost runtime.
export const PALETTES = [
  { name: "abyss", bg: "#070b14", strokes: ["#5eead4", "#60a5fa", "#a78bfa", "#f472b6"] },
  { name: "ember", bg: "#0e0a08", strokes: ["#fbbf24", "#fb7185", "#f97316", "#fde68a"] },
  { name: "moss", bg: "#060d0b", strokes: ["#a3e635", "#34d399", "#22d3ee", "#e7e5e4"] },
  { name: "mono", bg: "#0a0a0b", strokes: ["#fafafa", "#a1a1aa", "#52525b", "#e4e4e7"] },
];

export function pickPalette(rng, idx) {
  if (Number.isInteger(idx) && PALETTES[idx]) return PALETTES[idx];
  return PALETTES[Math.floor(rng() * PALETTES.length)];
}
