// b04-mad — 17 эффектов промотированы в пак, остальные 33 отклонены и удалены.
// Builder'ы остаются здесь как дом промотированных эффектов.
import { shell, lifecycle, footer } from "../canvas-extra.mjs";
import { shaderShell } from "../shader-extra.mjs";

const PAL = (palette) => `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)};`;
const PRE = `const cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;`
  + `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle();

// Чёрная дыра: аккреционный диск.
export function buildBlackHole({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??130,P=[];for(let i=0;i<N;i++)P.push([Math.random()*6.283,.12+Math.random()*.34,.4+Math.random()*1.4]);`
    + `function draw(dt){T+=dt*.0011*SP*(1+sx);cx.fillStyle=bgc;cx.globalAlpha=.3;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;const X=W/2,Y=Hh/2,R=Math.min(W,Hh);cx.fillStyle="#000";cx.beginPath();cx.arc(X,Y,R*.08,0,6.283);cx.fill();cx.strokeStyle=cols[0];cx.lineWidth=1.4;cx.beginPath();cx.arc(X,Y,R*.095+(T*4)%3,0,6.283);cx.stroke();for(let i=0;i<P.length;i++){const p=P[i],a=p[0]+T*p[2],r=p[1]*R;cx.fillStyle=cols[i%cols.length];cx.fillRect(X+Math.cos(a)*r,Y+Math.sin(a)*r*(o.disk??.4),2.2,1.3)}}` + footer();
  return shell("gaBlackHole", PAL(palette), body);
}

// Дождь на стекле: расходящиеся круги.
export function buildGlassRain({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??26,SZ=o.size??1,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),r:0,mx:(8+Math.random()*22)*SZ});`
    + `function draw(dt){T+=dt*.001;cx.fillStyle=bgc;cx.globalAlpha=.3;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;for(let i=0;i<P.length;i++){const p=P[i];p.r+=dt*.02*SP*(1+sx);if(p.r>p.mx){p.x=Math.random();p.y=Math.random();p.r=0;p.mx=(8+Math.random()*24)*SZ}cx.strokeStyle=cols[i%cols.length];cx.globalAlpha=Math.max(0,.8-p.r/p.mx);cx.lineWidth=1.2;cx.beginPath();cx.arc(p.x*W,p.y*Hh,p.r,0,6.283);cx.stroke()}cx.globalAlpha=1}` + footer();
  return shell("gaGlassRain", PAL(palette), body);
}

// Магнитное поле: опилки за мышью.
export function buildMagnetField({ seed = 1, palette }) {
  const body = PRE
    + `function draw(dt){const gx=o.step??22,gy=o.step??22,SP=o.speed??1,LN=o.len??6;T+=dt*.001*SP;cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);cx.lineWidth=2;for(let ix=0;ix<W/gx;ix++)for(let iy=0;iy<Hh/gy;iy++){const x=ix*gx+11,y=iy*gy+11,dx=x-mx*W,dy=y-my*Hh,d=Math.hypot(dx,dy)+9,a=Math.atan2(dy,dx)+Math.sin(T*2+d*.05)*.3;cx.strokeStyle=cols[(ix+iy)%cols.length];cx.beginPath();cx.moveTo(x-Math.cos(a)*LN,y-Math.sin(a)*LN);cx.lineTo(x+Math.cos(a)*LN,y+Math.sin(a)*LN);cx.stroke()}}` + footer();
  return shell("gaMagnetField", PAL(palette), body);
}

// Медузы: купола со щупальцами.
export function buildJellyFloat({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??6,SZ=o.size??1,P=[];for(let i=0;i<N;i++)P.push({x:.1+Math.random()*.8,y:Math.random(),s:.4+Math.random()*.8,p:Math.random()*6.28});`
    + `function draw(dt){T+=dt*.0008*SP*(1+sx);cx.fillStyle=bgc;cx.globalAlpha=.25;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;for(let i=0;i<P.length;i++){const q=P[i];q.y-=dt*.00008*q.s;if(q.y<-.15)q.y=1.15;const x=(q.x+Math.sin(T+q.p)*.03)*W,y=q.y*Hh,r=(12+6*Math.sin(T*2+q.p))*SZ;cx.fillStyle=cols[i%cols.length];cx.globalAlpha=.8;cx.beginPath();cx.arc(x,y,r,3.1415,0);cx.fill();cx.globalAlpha=.6;for(let t=0;t<4;t++){cx.strokeStyle=cols[(i+t)%cols.length];cx.lineWidth=1;cx.beginPath();cx.moveTo(x-r*.6+t*r*.4,y);cx.quadraticCurveTo(x-r*.6+t*r*.4+Math.sin(T*3+t)*5,y+22,x-r*.6+t*r*.4,y+30+((T*30+t*9)%14));cx.stroke()}}cx.globalAlpha=1}` + footer();
  return shell("gaJellyFloat", PAL(palette), body);
}

// Стая: мурмурация точек.
export function buildBoids({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??70,PL=o.pull??.03,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),a:Math.random()*6.28});`
    + `function draw(dt){T+=dt*.0012*SP;cx.fillStyle=bgc;cx.globalAlpha=.2;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;for(let i=0;i<P.length;i++){const p=P[i],ta=Math.atan2(my-p.y,mx-p.x);let da=((ta-p.a+9.4248)%6.283)-3.1416;p.a+=da*PL+Math.sin(T*3+i)*.05;p.x+=Math.cos(p.a)*.006*SP;p.y+=Math.sin(p.a)*.006*SP;if(p.x<0)p.x=1;if(p.x>1)p.x=0;if(p.y<0)p.y=1;if(p.y>1)p.y=0;cx.fillStyle=cols[i%cols.length];cx.beginPath();cx.arc(p.x*W,p.y*Hh,1.8,0,6.283);cx.fill()}}` + footer();
  return shell("gaBoids", PAL(palette), body);
}

// Ночной город: мигающие окна.
export function buildCityNight({ seed = 1, palette }) {
  const body = PRE
    + `const P=[];for(let i=0;i<160;i++)P.push(Math.random());`
    + `function draw(dt){const C=o.den??16,R=Math.max(4,(o.den??16)/2|0),SP=o.speed??1,LT=o.light??-.1;T+=dt*.001*SP;cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);for(let ix=0;ix<C;ix++)for(let iy=0;iy<R;iy++){const k=(ix*R+iy)%P.length,on=Math.sin(T*(1+P[k]*3)+k*1.7)>LT;cx.fillStyle=on?cols[(ix+iy)%cols.length]:"#1a2233";cx.globalAlpha=on?.9:.5;cx.fillRect(W*(ix+.2)/C,Hh*(iy+.22)/R,W/C*.6,Hh/R*.55)}cx.globalAlpha=1}` + footer();
  return shell("gaCityNight", PAL(palette), body);
}

// Муаровые кольца: интерференция.
export function buildMoireRings({ seed = 1, palette }) {
  const body = PRE
    + `function draw(dt){const X=W/2+(mx-.5)*20,Y=Hh/2+(my-.5)*20,ST=o.step??7,SP=o.speed??1,TW=o.twin??1;T+=dt*.001*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);cx.lineWidth=1;for(let r=4;r<Math.max(W,Hh);r+=ST){cx.strokeStyle=cols[((r/ST)|0)%cols.length];cx.globalAlpha=.55;cx.beginPath();cx.arc(X,Y,r+(T*8)%ST,0,6.283);cx.stroke();if(TW){cx.beginPath();cx.arc(W-X,Hh-Y,r,0,6.283);cx.stroke()}}cx.globalAlpha=1}` + footer();
  return shell("gaMoireRings", PAL(palette), body);
}

// Падающие блоки: тетрис-дождь.
export function buildTetrisRain({ seed = 1, palette }) {
  const body = PRE
    + `const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0],[1,0],[1,1]],[[0,1],[1,1],[1,0]]];`
    + `const SP=o.speed??1,N=o.count??8,SZ=o.size??1,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random()*1.1-.1,s:(6+Math.random()*6)*SZ,c:(Math.random()*5)|0,v:.001+Math.random()*.002});`
    + `function draw(dt){T+=dt*.001*SP;cx.fillStyle=bgc;cx.globalAlpha=.25;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;for(let i=0;i<P.length;i++){const p=P[i];p.y+=p.v*dt*.08*SP;const sh=SH[p.c%SH.length];for(let a=0;a<sh.length;a++)for(let b=0;b<sh[a].length;b++)if(sh[a][b]){cx.fillStyle=cols[(p.c+a+b)%cols.length];cx.fillRect((p.x*W+b*p.s+W)%W,(p.y*Hh+a*p.s)%(Hh+40)-20,p.s-1,p.s-1)}if(p.y>1.2){p.y=-.1;p.x=Math.random()}}}` + footer();
  return shell("gaTetrisRain", PAL(palette), body);
}

// Девятый вал: слоистые волны.
export function buildOceanLayers({ seed = 1, palette }) {
  const body = PRE
    + `function draw(dt){const N=o.count??5,SP=o.speed??1,A=o.amp??1;T+=dt*.001*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);for(let l=0;l<N;l++){cx.fillStyle=cols[l%cols.length];cx.globalAlpha=.35;cx.beginPath();const yb=Hh*(.3+l*.14);cx.moveTo(0,Hh);for(let x=0;x<=W;x+=6){cx.lineTo(x,yb+Math.sin(x*.02+T*(1+l*.3)+l*2)*(8+l*4)*A+Math.sin(x*.06-T*2)*4*A)}cx.lineTo(W,Hh);cx.closePath();cx.fill()}cx.globalAlpha=1}` + footer();
  return shell("gaOceanLayers", PAL(palette), body);
}

// Деление бактерий: клетки лопаются.
export function buildBacteria({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??14,MR=o.maxr??16,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),r:4+Math.random()*8,vx:(Math.random()-.5)*.001,vy:(Math.random()-.5)*.001});`
    + `function draw(dt){T+=dt*.001*SP;cx.fillStyle=bgc;cx.globalAlpha=.2;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;for(let i=0;i<P.length;i++){const p=P[i];p.x+=p.vx*(1+sx)+Math.sin(T*2+i)*.0006;p.y+=p.vy;p.r+=dt*.0012*SP;if(p.r>MR){p.r=5;if(P.length<40)P.push({x:p.x,y:p.y,r:5,vx:-p.vx,vy:-p.vy})}cx.strokeStyle=cols[i%cols.length];cx.lineWidth=1.6;cx.beginPath();cx.arc(p.x*W,p.y*Hh,p.r,0,6.283);cx.stroke();cx.fillStyle=cols[(i+1)%cols.length];cx.beginPath();cx.arc(p.x*W-p.r*.3,p.y*Hh-p.r*.3,1.8,0,6.283);cx.fill()}}` + footer();
  return shell("gaBacteria", PAL(palette), body);
}

// Сонар: вращающийся луч.
export function buildRadarSonar({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??12,TR=o.trail??.12,P=[];for(let i=0;i<N;i++)P.push([Math.random(),Math.random()*.42,Math.random()]);`
    + `function draw(dt){T+=dt*.001*SP*(1+sx);cx.fillStyle=bgc;cx.globalAlpha=TR;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;const X=W/2,Y=Hh/2,R=Math.min(W,Hh)*.46,a=T*2.4;cx.strokeStyle=cols[0];cx.globalAlpha=.7;for(let r=R/4;r<=R;r+=R/4){cx.lineWidth=1;cx.beginPath();cx.arc(X,Y,r,0,6.283);cx.stroke()}const g=cx.createRadialGradient(X,Y,1,X,Y,R);g.addColorStop(0,cols[1]);g.addColorStop(1,bgc);cx.globalAlpha=.35;cx.fillStyle=g;cx.beginPath();cx.moveTo(X,Y);cx.arc(X,Y,R,a-.5,a);cx.closePath();cx.fill();cx.globalAlpha=1;cx.strokeStyle=cols[1];cx.lineWidth=2;cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+Math.cos(a)*R,Y+Math.sin(a)*R);cx.stroke();for(let i=0;i<P.length;i++){const p=P[i],ba=p[0]*6.283,br=p[1]*R;let dd=(a-ba)%6.283;if(dd<0)dd+=6.283;cx.globalAlpha=Math.max(.06,1-dd/4);cx.fillStyle=cols[(i+2)%cols.length];cx.beginPath();cx.arc(X+Math.cos(ba)*br,Y+Math.sin(ba)*br,2.6,0,6.283);cx.fill()}cx.globalAlpha=1}` + footer();
  return shell("gaRadarSonar", PAL(palette), body);
}

// Изометрия: прыгающие кубы.
export function buildIsoCubes({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??22,SZ=o.size??1,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),p:Math.random()*6.28,s:(8+Math.random()*10)*SZ});`
    + `function draw(dt){T+=dt*.0014*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);for(let i=0;i<P.length;i++){const p=P[i],x=p.x*W,y=p.y*Hh+Math.sin(T*3+p.p)*8,s=p.s;cx.fillStyle=cols[i%cols.length];cx.globalAlpha=.9;cx.beginPath();cx.moveTo(x,y-s);cx.lineTo(x+s,y-s/2);cx.lineTo(x,y);cx.lineTo(x-s,y-s/2);cx.closePath();cx.fill();cx.globalAlpha=.5;cx.beginPath();cx.moveTo(x-s,y-s/2);cx.lineTo(x,y);cx.lineTo(x,y+s);cx.lineTo(x-s,y+s/2);cx.closePath();cx.fill();cx.globalAlpha=.3;cx.beginPath();cx.moveTo(x+s,y-s/2);cx.lineTo(x,y);cx.lineTo(x,y+s);cx.lineTo(x+s,y+s/2);cx.closePath();cx.fill()}cx.globalAlpha=1}` + footer();
  return shell("gaIsoCubes", PAL(palette), body);
}

// Конфетти-шторм: бумажный вихрь.
export function buildConfettiStorm({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??80,SZ=o.size??1,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),a:Math.random()*6.28,s:.002+Math.random()*.004,r:(2+Math.random()*3)*SZ});`
    + `function draw(dt){T+=dt*.0012*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);for(let i=0;i<P.length;i++){const p=P[i];p.y+=p.s*(1+sx*2)*SP;p.a+=dt*.005*SP;p.x+=Math.sin(T*3+i)*.0008;if(p.y>1.05){p.y=-.05;p.x=Math.random()}cx.save();cx.translate(p.x*W,p.y*Hh);cx.rotate(p.a);cx.fillStyle=cols[i%cols.length];cx.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);cx.restore()}}` + footer();
  return shell("gaConfettiStorm", PAL(palette), body);
}

// Глаза из темноты: веки.
export function buildSpiderEyes({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??14,SZ=o.size??1,F=o.follow??1,P=[];for(let i=0;i<N;i++)P.push({x:.06+Math.random()*.88,y:.12+Math.random()*.76,p:Math.random()*6.28,s:1+Math.random()*3,r:(5+Math.random()*7)*SZ});`
    + `function draw(dt){T+=dt*.001*SP;cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);const qx=Math.max(0,Math.min(1,mx))-.5,qy=Math.max(0,Math.min(1,my))-.5;for(let i=0;i<P.length;i++){const p=P[i],o=Math.min(1,Math.abs(Math.sin(T*p.s+p.p))/.3),x=p.x*W,y=p.y*Hh,r=p.r,kt=.12+.95*o,kb=.1+.75*o;cx.fillStyle="#e8e4da";cx.beginPath();cx.moveTo(x-r,y);cx.quadraticCurveTo(x,y-r*kt,x+r,y);cx.quadraticCurveTo(x,y+r*kb,x-r,y);cx.closePath();cx.fill();const ir=r*.5*Math.min(1,(kt+kb)/1.5);if(ir>.9){const ix=x+qx*r*.5*F,iy=y+qy*r*.3*F;cx.fillStyle=cols[i%cols.length];cx.beginPath();cx.arc(ix,iy,ir,0,6.283);cx.fill();cx.fillStyle="#000";cx.beginPath();cx.arc(ix,iy,Math.max(.8,ir*.45),0,6.283);cx.fill()}cx.strokeStyle="#000";cx.lineWidth=2;cx.beginPath();cx.moveTo(x-r,y);cx.quadraticCurveTo(x,y-r*kt-1,x+r,y);cx.stroke();cx.globalAlpha=.5;cx.lineWidth=1;cx.beginPath();cx.moveTo(x-r,y);cx.quadraticCurveTo(x,y+r*kb+1,x+r,y);cx.stroke();cx.globalAlpha=.3;cx.beginPath();cx.moveTo(x-r*.75,y-r*kt*.75-r*.3);cx.quadraticCurveTo(x,y-r*kt-r*.55,x+r*.75,y-r*kt*.75-r*.3);cx.stroke();cx.globalAlpha=1}}` + footer();
  return shell("gaSpiderEyes", PAL(palette), body);
}

// Песочные часы: частицы сквозь горло.
export function buildClockParticles({ seed = 1, palette }) {
  const body = PRE
    + `const N=o.count??70,SP=o.speed??1;function draw(dt){T+=dt*.001*SP;cx.fillStyle=bgc;cx.globalAlpha=.2;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;const X=W/2,Y=Hh/2,S=Math.min(W,Hh)*(o.scale??.42);cx.strokeStyle=cols[0];cx.lineWidth=1.6;cx.beginPath();cx.moveTo(X-S/2,Y-S/2);cx.lineTo(X+S/2,Y-S/2);cx.lineTo(X-S/2,Y+S/2);cx.lineTo(X+S/2,Y+S/2);cx.closePath();cx.stroke();cx.beginPath();cx.moveTo(X-S/2,Y-S/2);cx.lineTo(X+S/2,Y+S/2);cx.moveTo(X+S/2,Y-S/2);cx.lineTo(X-S/2,Y+S/2);cx.stroke();for(let i=0;i<N;i++){const p=(i*.61803+T*(.2+(i%4)*.12))%1,w2=(.5-Math.abs(p-.5))*S*.8;cx.fillStyle=cols[i%cols.length];cx.fillRect(X+Math.sin(i*7)*w2*.5+(mx-.5)*w2,Y-S/2+p*S,1.8,1.8)}}` + footer();
  return shell("gaClockParticles", PAL(palette), body);
}

// --- Шейдеры ---

export function buildPlasmaSea() {
  return shaderShell("gaPlasmaSea", `float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}`
    + `void main(){vec2 u=(2.*gl_FragCoord.xy-r)/max(r.x,r.y);float e=1.-.5*dot(u,u);vec2 p=u*2.5*z;float v=sin(p.x+t)+sin(p.y*1.3-t*1.2)+sin((p.x+p.y)*.8+t*.7)+sin(length(p)*2.-t*1.5);v*=.25;vec3 c=mix(vec3(.1,.3,.7),vec3(.2,.9,.8),v*.5+.5);c=mix(c,vec3(.9,.4,.7),.5+.5*sin(v*3.+m.x*4.));c*=e*b;o=vec4(min(c,1.),1.);}`);
}

// --- CSS ---

function cssWrap(cls, body) {
  return `${body}@media(prefers-reduced-motion:reduce){${cls},${cls} *,${cls}::before,${cls}::after{animation:none!important}}`;
}

export function buildSpinGlitch() {
  return cssWrap(".ga-sp-glitch", `.ga-sp-glitch{width:calc(var(--ga-z,1)*34px);height:calc(var(--ga-z,1)*34px);background:currentColor;position:relative;animation:ga-sp-glitch-s calc(var(--ga-d,1)*1s) steps(2) infinite}.ga-sp-glitch::after{content:"";position:absolute;inset:0;background:currentColor;opacity:.5;transform:translate(calc(var(--ga-z,1)*4px),calc(var(--ga-z,1)*-3px));animation:ga-sp-glitch-c calc(var(--ga-d,1)*.4s) steps(2) infinite}@keyframes ga-sp-glitch-s{50%{transform:skewX(8deg)}}@keyframes ga-sp-glitch-c{50%{transform:translate(calc(var(--ga-z,1)*-4px),calc(var(--ga-z,1)*3px))}}`);
}
