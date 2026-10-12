// b02-waves — dot-terrain promoted to pack; other 9 candidates rejected and removed.
// Builder остаётся здесь как дом промотированного эффекта.
import { shell, lifecycle, footer } from "../canvas-extra.mjs";

// Точечный рельеф: высота encoded размером точки.
export function buildDotTerrain({ seed = 1, palette }) {
  const consts = `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)};`;
  const body = `const cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;`
    + `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle()
    + `const DN=o.den??30,SP=o.speed??1,AM=o.amp??1;function draw(dt){T+=dt*.0012*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);const NX=DN,NY=Math.max(6,DN/2|0),hy=Hh*.4,A=Hh*.16*(.6+mx*.8)*AM;`
    + `for(let j=0;j<NY;j++){const v=(j+.5)/NY,yb=hy+v*(Hh-hy);for(let i=0;i<NX;i++){const u=(i+.5)/NX;`
    + `const z=Math.sin(u*6.28+T*1.5+v*5)+Math.cos(v*9-T*1.1+u*4)*.6;const x=u*W,y=yb-z*A*v;const r=Math.max(.4,1.1+z*1.1)*(.5+v);`
    + `cx.globalAlpha=.3+.7*v;cx.fillStyle=cols[(i+j)%cols.length];cx.beginPath();cx.arc(x,y,r,0,6.283);cx.fill()}}cx.globalAlpha=1}` + footer();
  return shell("gaDotTerrain", consts, body);
}
