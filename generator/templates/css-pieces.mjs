// Templates: pure-CSS icon animations + loader. Zero JS.
export function buildIconCSS() {
  return `/* ga-icons: <1KB, zero JS. Usage: <svg class="ga ga-spin">… / <span class="ga ga-pulse"> */
.ga{display:inline-block;transform-box:fill-box;transform-origin:center}
.ga-spin{animation:ga-rot 1.1s linear infinite}
.ga-pulse{animation:ga-pul 1.6s ease-in-out infinite}
.ga-dash{stroke-dasharray:48 16;animation:ga-dash 1.4s linear infinite}
@keyframes ga-rot{to{transform:rotate(360deg)}}
@keyframes ga-pul{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.82);opacity:.55}}
@keyframes ga-dash{to{stroke-dashoffset:-64}}
@media(prefers-reduced-motion:reduce){.ga-spin,.ga-pulse,.ga-dash{animation:none}}`;
}

export function buildLoaderCSS() {
  return `/* ga-loader: CSS-only dots. Usage: <span class="ga-loader"><i></i><i></i><i></i></span> */
.ga-loader{display:inline-flex;gap:6px;align-items:center}
.ga-loader i{width:8px;height:8px;border-radius:50%;background:currentColor;animation:ga-b 1s ease-in-out infinite}
.ga-loader i:nth-child(2){animation-delay:.15s}.ga-loader i:nth-child(3){animation-delay:.3s}
@keyframes ga-b{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}
@media(prefers-reduced-motion:reduce){.ga-loader i{animation:none}}`;
}
