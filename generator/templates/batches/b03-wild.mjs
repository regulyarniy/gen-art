// b03-wild — 4 эффекта промотированы в пак, остальные 16 отклонены и удалены.
// Builder'ы остаются здесь как дом промотированных эффектов.
import { shell, lifecycle, footer } from "../canvas-extra.mjs";

const PAL = (palette) => `const COLS=${JSON.stringify(palette.strokes)},BG=${JSON.stringify(palette.bg)};`;
const PRE = `const cols=o.colors??COLS,bgc=o.bg??BG;const R0=Math.random;`
  + `function bg(){cx.fillStyle=bgc;cx.fillRect(0,0,W||300,Hh||150)}` + lifecycle();

// Падающие тире: матричный дождь без глифов.
export function buildRainFall({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,N=o.count??70,LN=o.len??1,P=[];for(let i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),s:.3+Math.random()*.9,l:4+Math.random()*10});`
    + `function draw(dt){T+=dt*.001*SP*(1+sx);cx.fillStyle=bgc;cx.globalAlpha=.18;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;cx.lineWidth=2;`
    + `for(let i=0;i<P.length;i++){const d=P[i];d.y+=dt*.00035*d.s*SP*(1+sx*2);if(d.y>1.05){d.y=-.05;d.x=Math.random()}`
    + `const x=d.x*W,y=d.y*Hh;cx.strokeStyle=cols[i%cols.length];cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y+d.l*LN);cx.stroke();`
    + `cx.fillStyle=cols[i%cols.length];cx.beginPath();cx.arc(x,y,1.6,0,6.283);cx.fill()}}` + footer();
  return shell("gaRainFall", PAL(palette), body);
}

// Калейдоскоп: шесть лепестков из дрожащих линий.
export function buildKaleido({ seed = 1, palette }) {
  const body = PRE
    + `const N=o.count??6,SP=o.speed??1,SZ=o.size??1;`
    + `function draw(dt){T+=dt*.001*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);const S=N,U=Math.min(W,Hh)/300;cx.lineWidth=1.2;`
    + `for(let g=0;g<S;g++){const ba=g/S*6.283+T*.25;cx.strokeStyle=cols[g%cols.length];`
    + `for(let q=0;q<3;q++){cx.globalAlpha=.75;cx.beginPath();`
    + `for(let k=0;k<=24;k++){const t=k/24,an=ba+t*.9+Math.sin(T+q+t*5)*.2,R=(20+q*26+t*30)*U*SZ;`
    + `const x=W/2+Math.cos(an)*R,y=Hh/2+Math.sin(an)*R;k?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}}cx.globalAlpha=1}` + footer();
  return shell("gaKaleido", PAL(palette), body);
}

// Телеппомехи: 320 искр за кадр.
export function buildStaticNoise({ seed = 1, palette }) {
  const body = PRE
    + `const N=o.count??320,TR=o.tear??.12,SZ=o.size??2;`
    + `function draw(dt){T+=dt*.001;cx.fillStyle=bgc;cx.globalAlpha=.55;cx.fillRect(0,0,W,Hh);cx.globalAlpha=1;`
    + `for(let i=0;i<N;i++){cx.fillStyle=cols[(Math.random()*cols.length)|0];cx.fillRect(Math.random()*W,Math.random()*Hh,SZ,SZ)}`
    + `if(Math.random()<TR){cx.globalAlpha=.3;cx.fillStyle=cols[0];cx.fillRect(0,Math.random()*Hh,W,1);cx.globalAlpha=1}}` + footer();
  return shell("gaStaticNoise", PAL(palette), body);
}

// Спираль жизни: двойная нить с перекладинами.
export function buildDnaHelix({ seed = 1, palette }) {
  const body = PRE
    + `const SP=o.speed??1,A=o.amp??1,ST=o.step??8;`
    + `function draw(dt){T+=dt*.0014*SP*(1+sx);cx.fillStyle=bgc;cx.fillRect(0,0,W,Hh);const mid=Hh/2,amp=Hh*.22*(0.6+my*.7)*A;let n=0;`
    + `for(let x=0;x<=W;x+=ST){const p=x*.045+T*2.2,y1=mid+Math.sin(p)*amp,y2=mid-Math.sin(p)*amp;`
    + `if(n++%3===0){cx.globalAlpha=.4;cx.strokeStyle=cols[2];cx.lineWidth=1;cx.beginPath();cx.moveTo(x,y1);cx.lineTo(x,y2);cx.stroke()}`
    + `cx.globalAlpha=.95;cx.fillStyle=cols[0];cx.beginPath();cx.arc(x,y1,2.2,0,6.283);cx.fill();`
    + `cx.fillStyle=cols[1];cx.beginPath();cx.arc(x,y2,2.2,0,6.283);cx.fill()}cx.globalAlpha=1}` + footer();
  return shell("gaDnaHelix", PAL(palette), body);
}
