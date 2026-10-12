// 10 pure-CSS spinners. One self-contained file per spinner (0 JS, currentColor).
// Each builder returns the full file content. Keyframes are per-spinner prefixed.

function wrap(cls, body) {
  return `${body}@media(prefers-reduced-motion:reduce){${cls},${cls} *,${cls}::before,${cls}::after{animation:none!important}}`;
}

export function buildSpinRing() {
  return wrap(".ga-sp-ring", ".ga-sp-ring{width:calc(var(--ga-z,1)*40px);height:calc(var(--ga-z,1)*40px);border-radius:50%;border:calc(var(--ga-z,1)*3px) solid currentColor;border-top-color:transparent;opacity:.85;animation:ga-sp-ring calc(var(--ga-d,1)*0.9s) linear infinite}@keyframes ga-sp-ring{to{transform:rotate(360deg)}}");
}

export function buildSpinDots() {
  return wrap(".ga-sp-dots", ".ga-sp-dots{display:inline-flex;gap:calc(var(--ga-z,1)*8px);align-items:center;height:calc(var(--ga-z,1)*40px)}.ga-sp-dots i{width:calc(var(--ga-z,1)*9px);height:calc(var(--ga-z,1)*9px);border-radius:50%;background:currentColor;animation:ga-sp-dots calc(var(--ga-d,1)*1s) ease-in-out infinite}.ga-sp-dots i:nth-child(2){animation-delay:.15s}.ga-sp-dots i:nth-child(3){animation-delay:.3s}@keyframes ga-sp-dots{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(calc(var(--ga-z,1)*-9px));opacity:1}}");
}

export function buildSpinWave() {
  const bars = Array.from({ length: 5 }, (_, k) =>
    `.ga-sp-wave i:nth-child(${k + 1}){animation-delay:${(k * 0.12).toFixed(2)}s}`).join("");
  return wrap(".ga-sp-wave", `.ga-sp-wave{display:inline-flex;gap:calc(var(--ga-z,1)*5px);align-items:center;height:calc(var(--ga-z,1)*40px)}.ga-sp-wave i{width:calc(var(--ga-z,1)*6px);height:calc(var(--ga-z,1)*34px);border-radius:calc(var(--ga-z,1)*3px);background:currentColor;transform-origin:center;animation:ga-sp-wave calc(var(--ga-d,1)*1s) ease-in-out infinite}${bars}@keyframes ga-sp-wave{0%,100%{transform:scaleY(.25);opacity:.5}50%{transform:scaleY(1);opacity:1}}`);
}

export const SPINNER_BUILDERS = {
  "spin-ring": buildSpinRing, "spin-dots": buildSpinDots, "spin-wave": buildSpinWave,
};
