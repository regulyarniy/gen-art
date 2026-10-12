// 7 extra Canvas2D snippets. Each: globalThis.gaX = (()=>{...; return{mount}})()
// All zero-dep, same lifecycle: DPR cap, IO pause, pointer+scroll, reduced-motion single frame.

function shell(global, consts, body) {
  return `globalThis.${global}=(()=>{${consts}function mount(el,o={}){${body}return{destroy:off}}return{mount}})();`;
}

export { shell, lifecycle, footer };

function lifecycle(hasScroll = true) {
  return `const cv=document.createElement("canvas");cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block";if(getComputedStyle(el).position=="static")el.style.position="relative";el.appendChild(cv);` +
  `const cx=cv.getContext("2d");let W=0,Hh=0,raf=0,run=true,vis=true,mx=.5,my=.5,sx=0;` +
  `function rs(){const r=el.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,1.5);W=Math.max(2,r.width|0);Hh=Math.max(2,r.height|0);cv.width=W*d;cv.height=Hh*d;cx.setTransform(d,0,0,d,0,0);bg();}` +
  `const ro=(typeof ResizeObserver!="undefined")?new ResizeObserver(rs):null;` +
  `function loop(ts){if(!run||!vis){raf=0;return}const dt=Math.min(50,ts-L||16);L=ts;draw(dt);raf=requestAnimationFrame(loop)}` +
  `const io=new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&run&&!raf)loop()},{threshold:0});` +
  `function ev(e){const r=el.getBoundingClientRect();mx=((e.clientX??r.left+r.width/2)-r.left)/r.width;my=((e.clientY??r.top+r.height/2)-r.top)/r.height}` +
  `addEventListener("pointermove",ev,{passive:true});` +
  (hasScroll ? `function fr(){const r=el.getBoundingClientRect();const vh=innerHeight||1;sx=Math.min(1,Math.max(0,-r.top/(r.height+vh)+.5))}addEventListener("scroll",fr,{passive:true});fr();` : `function fr(){}`) +
  `const rm=matchMedia("(prefers-reduced-motion: reduce)");`;
}

function footer(staticFrame = "draw(0,true)") {
  return `let L=0,T=R0()*80;if(rm.matches){rs();${staticFrame};function off(){run=false;cancelAnimationFrame(raf);raf=0;ro&&ro.disconnect();io.disconnect();removeEventListener("pointermove",ev);removeEventListener("scroll",fr);cv.remove()}return{destroy:off}}rs();io.observe(el);ro&&ro.observe(el);raf=requestAnimationFrame(loop);` +
  `function off(){run=false;cancelAnimationFrame(raf);raf=0;ro&&ro.disconnect();io.disconnect();removeEventListener("pointermove",ev);removeEventListener("scroll",fr);cv.remove()}`;
}

// 1. ribbon — Шёлк памяти
export function buildRibbon({ seed = 1, palette }) {
  const consts = `function H(s){let h=1779033703^String(s).length;for(let i=0;i<String(s).length;i++){h=Math.imul(h^String(s).charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}` +
  `function RR(a){return()=>{a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}` +
  `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)},SE0=${JSON.stringify(String(seed))};`;
  const body = `const seed=o.seed??SE0,cols=o.colors??COLS,bgc=o.bg??BG;const R0=RR(H(seed)());` +
  `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle() +
  `const NL=o.count??7,SP=o.speed??1,A=o.amp??1;function draw(dt){T+=dt*.001*SP*(1+sx*.8);cx.fillStyle=bgc;cx.globalAlpha=.14;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;` +
  `for(let k=0;k<NL;k++){cx.strokeStyle=cols[k%cols.length];cx.lineWidth=1.4;cx.beginPath();` +
  `for(let x=0;x<=W;x+=8){const u=x/W;const y=Hh*(.2+.6*k/(NL-1))+Math.sin(u*5+T*(.5+k*.12)+k*2)*Hh*.06*A*(1+(mx-.5)*1.4)+Math.sin(u*11-T*.7)*Hh*.02*A;x?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}}` + footer();
  return shell("gaRibbon", consts, body);
}

// 2. dotgrid — Дыхание толпы
export function buildDotGrid({ seed = 1, palette }) {
  const consts = `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)};`;
  const body = `const cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;` +
  `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle() +
  `const GX=o.step??22,SP=o.speed??1,SZ=o.size??1;function draw(dt){T+=dt*.0012*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);` +
  `const gx=GX,gy=GX;for(let ix=0;ix<W/gx;ix++)for(let iy=0;iy<Hh/gy;iy++){const x=ix*gx+gx/2,y=iy*gy+gy/2;const u=x/W,v=y/Hh;` +
  `const d=Math.hypot(u-mx,v-my);const w=Math.sin(u*9+T*1.6)*Math.cos(v*7-T*1.2)+Math.sin((u+v)*5+T)*.5;` +
  `const r=Math.max(.4,(3.2+w*1.6+(1-Math.min(1,d*2.4))*3.4)*SZ);cx.fillStyle=cols[((ix+iy)%cols.length+cols.length)%cols.length];cx.globalAlpha=.85;cx.beginPath();cx.arc(x,y,r,0,6.283);cx.fill()}cx.globalAlpha=1}` + footer();
  return shell("gaDots", consts, body);
}

// 3. topo — Карта тишины
export function buildTopo({ seed = 1, palette }) {
  const consts = `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)};`;
  const body = `const cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;` +
  `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle() +
  `const NL=o.count??13,SP=o.speed??1,A=o.amp??1;function draw(dt){T+=dt*.0009*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);` +
  `for(let k=0;k<NL;k++){const f=(k+.5)/NL;cx.strokeStyle=cols[k%cols.length];cx.globalAlpha=.75;cx.lineWidth=1;cx.beginPath();` +
  `for(let x=0;x<=W;x+=7){const u=x/W;const y=Hh*f+Math.sin(u*4+k*1.7+T)*Hh*.045*A+Math.sin(u*9-k+T*1.4)*Hh*.02*A+(my-.5)*Hh*.08*f;x?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}cx.globalAlpha=1}` + footer();
  return shell("gaTopo", consts, body);
}
