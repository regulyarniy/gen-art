// 3 extra WebGL2 shader snippets: aurora, ember cells, interference rings.
// Same contract: globalThis.gaX.mount(el) -> {destroy}, Canvas2D gradient fallback.

function shaderShell(global, fragBody) {
  const src = `globalThis.${global}=(()=>{const VS="#version 300 es\\nlayout(location=0)in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";` +
  `const FS="#version 300 es\\nprecision highp float;uniform float t;uniform vec2 m;uniform float s;uniform vec2 r;uniform float z;uniform float b;out vec4 o;${fragBody}";` +
  `function mount(el,o={}){if(getComputedStyle(el).position=="static")el.style.position="relative";const cv=document.createElement("canvas");cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block";el.appendChild(cv);` +
  `let W=0,Hh=0,raf=0,run=true,vis=true,t=Math.random()*100,mx=.5,my=.5,sx=0;const t0=performance.now();const SP=o.speed??1,ZM=o.zoom??1,BR=o.bright??1;` +
  `function fb(){const cx=cv.getContext("2d");if(!cx)return{destroy(){cv.remove()}};function d(){if(!run)return;const g=cx.createLinearGradient(0,0,W||300,Hh||150);g.addColorStop(0,"#0b1020");g.addColorStop(1,"#123324");cx.fillStyle=g;cx.fillRect(0,0,cv.width,cv.height)}function rs(){const r=el.getBoundingClientRect();W=Math.max(2,r.width|0);Hh=Math.max(2,r.height|0);cv.width=W;cv.height=Hh;d()}rs();const ro=(typeof ResizeObserver!="undefined")?new ResizeObserver(rs):null;ro&&ro.observe(el);return{destroy(){run=false;ro&&ro.disconnect();cv.remove()}}}` +
  `const gl=cv.getContext("webgl2",{antialias:false,alpha:false});if(!gl)return fb();` +
  `function sh(k,s){const h=gl.createShader(k);gl.shaderSource(h,s);gl.compileShader(h);return h}` +
  `const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return fb();gl.useProgram(pr);` +
  `const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);` +
  `const ut=gl.getUniformLocation(pr,"t"),um=gl.getUniformLocation(pr,"m"),us=gl.getUniformLocation(pr,"s"),ur=gl.getUniformLocation(pr,"r"),uz=gl.getUniformLocation(pr,"z"),ub=gl.getUniformLocation(pr,"b");` +
  `function rs(){const r=el.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,1.5);cv.width=Math.max(2,r.width*d|0);cv.height=Math.max(2,r.height*d|0);gl.viewport(0,0,cv.width,cv.height)}rs();` +
  `const ro=(typeof ResizeObserver!="undefined")?new ResizeObserver(rs):null;ro&&ro.observe(el);` +
  `const io=new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&run&&!raf)loop()},{threshold:0});io.observe(el);` +
  `function ev(e){const r=el.getBoundingClientRect();mx=((e.clientX??r.left+r.width/2)-r.left)/r.width;my=1-((e.clientY??r.top)-r.top)/r.height}` +
  `addEventListener("pointermove",ev,{passive:true});` +
  `function fr(){const r=el.getBoundingClientRect();const vh=innerHeight||1;sx=Math.min(1,Math.max(0,-r.top/(r.height+vh)+.5))}addEventListener("scroll",fr,{passive:true});fr();` +
  `const rm=matchMedia("(prefers-reduced-motion: reduce)");function frame(){gl.uniform1f(ut,t);gl.uniform2f(um,mx,my);gl.uniform1f(us,sx);gl.uniform2f(ur,cv.width,cv.height);gl.uniform1f(uz,ZM);gl.uniform1f(ub,BR);gl.drawArrays(gl.TRIANGLES,0,3)}` +
  `if(rm.matches){t=1;frame();return{destroy:off}}` +
  `function loop(){if(!run||!vis){raf=0;return}t=(performance.now()-t0)/1000*.6*SP;frame();raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop);` +
  `function off(){run=false;cancelAnimationFrame(raf);raf=0;ro&&ro.disconnect();io.disconnect();removeEventListener("pointermove",ev);removeEventListener("scroll",fr);try{gl.getExtension("WEBGL_lose_context")?.loseContext()}catch(e){}cv.remove()}` +
  `return{destroy:off}}return{mount}})();`;
  return src;
}

export { shaderShell };
