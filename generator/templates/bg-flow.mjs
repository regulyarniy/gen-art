// Template: Canvas2D flow-field background. Zero deps.
// Emits a self-contained IIFE snippet exposing globalThis.gaBgFlow = { mount }

export function buildBgFlow({ seed = 1, palette, count = 600, speed = 1 } = {}) {
  const strokes = JSON.stringify(palette.strokes);
  const bg = JSON.stringify(palette.bg);
  // NOTE: keep runtime under ~4KB. No simplex at runtime — cheap sin/cos flow is enough with trails.
  const src = `globalThis.gaBgFlow=(()=>{function H(s){let h=1779033703^String(s).length;for(let i=0;i<String(s).length;i++){h=Math.imul(h^String(s).charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}function R(a){return()=>{a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const STROKES=${strokes},BG=${bg},SEED=${JSON.stringify(String(seed))},N=${count},SPD=${speed};
function mount(el,o={}){const seed=o.seed??SEED,n=o.count??N,spd=o.speed??SPD,cols=o.colors??STROKES,bgc=o.bg??BG,TR=o.trail??.08,LN=o.len??8;
const cv=document.createElement("canvas");cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block";el.style.position=el.style.position||"relative";el.appendChild(cv);
const cx=cv.getContext("2d");let W=0,Hh=0,dpr=1,raf=0,run=true,vis=true,t=H(seed)(),mx=.5,my=.5,sx=0;
const rnd=R(t);let T=rnd()*100,L=0;const P=[];for(let i=0;i<n;i++)P.push({x:rnd(),y:rnd(),p:rnd(),s:.4+rnd()*.9});
function rs(){const r=el.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);W=Math.max(2,r.width|0);Hh=Math.max(2,r.height|0);cv.width=W*dpr;cv.height=Hh*dpr;cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh)}
rs();const ro=(typeof ResizeObserver!="undefined")?new ResizeObserver(rs):null;ro&&ro.observe(el);
const io=new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&run&&!raf)loop();},{threshold:0});io.observe(el);
const rm=matchMedia("(prefers-reduced-motion: reduce)");
function ev(e){const r=el.getBoundingClientRect();mx=((e.clientX??r.left+r.width/2)-r.left)/r.width;my=((e.clientY??r.top+r.height/2)-r.top)/r.height}
addEventListener("pointermove",ev,{passive:true});
function fr(){const r=el.getBoundingClientRect();const vh=innerHeight||1;sx=Math.min(1,Math.max(0,-r.top/(r.height+vh)+.5))}
addEventListener("scroll",fr,{passive:true});fr();
if(rm.matches){draw(0,true);return{destroy:off,redraw:()=>draw(0,true)}}
function draw(dt,once){T+=dt*.001*spd*(1+sx);cx.fillStyle=bgc;cx.globalAlpha=once?1:TR;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;cx.lineWidth=1;
for(const p of P){const a=Math.sin(p.x*4+T+p.p*6.28)+Math.cos(p.y*4-T*.8)+(mx-.5)*2+(my-.5)*1.2;const vx=Math.cos(a)*p.s*spd,vy=Math.sin(a)*p.s*spd;const x0=p.x*W,y0=p.y*Hh;cx.strokeStyle=cols[(p.p*cols.length)|0];cx.beginPath();cx.moveTo(x0,y0);cx.lineTo(x0+vx*LN,y0+vy*LN);cx.stroke();p.x+=vx*.004;p.y+=vy*.004;if(p.x<0||p.x>1||p.y<0||p.y>1){p.x=Math.random();p.y=Math.random();p.p=Math.random()}}}
function loop(ts){if(!run||!vis){raf=0;return}const dt=Math.min(50,ts-L||16);L=ts;draw(dt);raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop);
function off(){run=false;cancelAnimationFrame(raf);raf=0;ro&&ro.disconnect();io.disconnect();removeEventListener("pointermove",ev);removeEventListener("scroll",fr);cv.remove()}
return{destroy:off}}
return{mount}})();`;
  return src;
}
