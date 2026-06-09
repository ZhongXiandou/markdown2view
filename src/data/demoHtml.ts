export const DEMO_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>markdown2view · 多场景排版与导出工作台</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@300;400;500;600&family=Noto+Serif+SC:wght@300;400;500;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<style>
  :root{
    /* ============ 主题色: 🖋 墨水经典 ============ */
    --ink:#0a0a0b;
    --ink-rgb:10,10,11;
    --paper:#f1efea;
    --paper-rgb:241,239,234;
    --paper-tint:#e8e5de;
    --ink-tint:#18181a;

    /* ============ 字体 ============ */
    --mono:"IBM Plex Mono",ui-monospace,monospace;
    --serif-en:"Playfair Display","Source Serif 4",Georgia,serif;
    --serif-body-en:"Source Serif 4",Georgia,serif;
    --serif-zh:"Noto Serif SC",source-han-serif-sc,serif;
    --sans-zh:"Noto Sans SC",source-han-sans-sc,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%;overflow:hidden;background:var(--ink);color:var(--paper);font-family:var(--sans-zh);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}

  /* ============ WebGL 背景 ============ */
  canvas.bg{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;display:block;transition:opacity 1.2s ease}
  canvas#bg-light{opacity:0}
  canvas#bg-dark{opacity:1}
  body.light-bg canvas#bg-light{opacity:1}
  body.light-bg canvas#bg-dark{opacity:0}
  body.low-power canvas.bg{display:none!important}

  /* ============ Deck 容器 + 翻页 ============ */
  #deck{position:fixed;inset:0;width:500vw;height:100vh;display:flex;flex-wrap:nowrap;transition:transform .9s cubic-bezier(.77,0,.175,1);z-index:10;will-change:transform}
  .slide{width:100vw;height:100vh;flex:0 0 100vw;position:relative;padding:6vh 6vw 10vh 6vw;display:flex;flex-direction:column;overflow:hidden}
  .slide.light{color:var(--ink);background:var(--paper)}
  .slide.dark{color:var(--paper);background:var(--ink)}

  .slide::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;transition:background .7s ease}
  .slide.light::before{background:rgba(var(--paper-rgb),.78);backdrop-filter:blur(3px)}
  .slide.dark::before{background:rgba(var(--ink-rgb),.78);backdrop-filter:blur(3px)}
  .slide.hero.light::before{background:rgba(var(--paper-rgb),.16);backdrop-filter:none}
  .slide.hero.dark::before{background:rgba(var(--ink-rgb),.12);backdrop-filter:none}
  .slide.hero::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none}
  .slide.hero.light::after{background:linear-gradient(180deg,rgba(var(--paper-rgb),.28) 0%,rgba(var(--paper-rgb),0) 14%,rgba(var(--paper-rgb),0) 86%,rgba(var(--paper-rgb),.28) 100%)}
  .slide.hero.dark::after{background:linear-gradient(180deg,rgba(var(--ink-rgb),.32) 0%,rgba(var(--ink-rgb),0) 14%,rgba(var(--ink-rgb),0) 86%,rgba(var(--ink-rgb),.32) 100%)}

  /* ============ chrome & foot ============ */
  .chrome{display:flex;justify-content:space-between;align-items:flex-start;font-family:var(--mono);font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.7}
  .chrome .left,.chrome .right{display:flex;gap:2.4em;align-items:center}
  .chrome .sep{width:40px;height:1px;background:currentColor;opacity:.4}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.55}
  .foot .title{font-family:var(--serif-zh);font-weight:400;letter-spacing:.05em;text-transform:none;opacity:.75;font-size:13px}

  .tag{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;padding:6px 14px;border:1px solid currentColor;opacity:.85}
  .rule{width:100%;height:1px;background:currentColor;opacity:.25;margin:3vh 0}

  .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.3em;text-transform:uppercase;opacity:.6;margin-bottom:2.6vh}
  .display-zh{font-family:var(--serif-zh);font-weight:700;font-size:5.8vw;line-height:1.15;letter-spacing:-.005em}
  .h-hero{font-family:var(--serif-zh);font-weight:900;font-size:7.5vw;line-height:.96;letter-spacing:-.02em}
  .h-xl{font-family:var(--serif-zh);font-weight:700;font-size:4.8vw;line-height:1.08;letter-spacing:-.01em}
  .h-sub{font-family:var(--serif-zh);font-weight:500;font-size:2.4vw;line-height:1.25;letter-spacing:0;opacity:.7}
  .h-md{font-family:var(--serif-zh);font-weight:600;font-size:2vw;line-height:1.3}
  .body-zh{font-family:var(--sans-zh);font-weight:400;font-size:max(15px,1.22vw);line-height:1.75;opacity:.82;letter-spacing:.01em}
  .lead{font-family:var(--serif-zh);font-weight:400;font-size:1.6vw;line-height:1.5;opacity:.86}
  .meta-row{display:flex;gap:1.2em;align-items:baseline;flex-wrap:wrap;font-family:var(--mono);font-size:max(12px,.92vw);letter-spacing:.16em;text-transform:uppercase;opacity:.6}

  /* ============ Grid 布局 ============ */
  .frame{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
  .grid-2-7-5{display:grid;grid-template-columns:7.2fr 4.8fr;gap:3vw 4vh;align-items:start}
  .grid-6{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:4vw 6vw;flex:1;align-content:center;padding:2vh 0}

  /* ============ Stat ============ */
  .stat-card{display:flex;flex-direction:column;gap:.8vh;align-items:flex-start;padding-top:1.6vh;border-top:1px solid currentColor;border-color:rgba(127,127,127,.3)}
  .stat-card .stat-label{font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.24em;text-transform:uppercase;opacity:.55}
  .stat-card .stat-nb{font-family:var(--serif-en);font-weight:800;font-size:4.8vw;line-height:.9;letter-spacing:-.03em;font-feature-settings:"tnum";margin-top:.4vh}
  .stat-card .stat-nb .stat-unit{font-family:var(--serif-zh);font-weight:500;font-size:.38em;letter-spacing:0;opacity:.72;margin-left:.14em}
  .stat-card .stat-note{font-family:var(--sans-zh);font-weight:400;font-size:max(13px,1.05vw);line-height:1.5;opacity:.72;margin-top:.6vh}

  /* ============ Callout ============ */
  .callout{padding:3vh 2.4vw;border-left:3px solid currentColor;position:relative;font-family:var(--serif-zh);font-size:max(14px,1.15vw);line-height:1.55;opacity:.92}
  .slide.light .callout{background:rgba(var(--ink-rgb),.05)}
  .slide.dark .callout{background:rgba(var(--paper-rgb),.06)}
  .callout-src{display:block;margin-top:1.6vh;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.6}

  /* ============ 图片 Frame ============ */
  .frame-img{overflow:hidden;position:relative;background:rgba(0,0,0,.04);box-sizing:border-box;width:100%;border-radius:4px}
  .slide.dark .frame-img{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12)}
  .frame-img > img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
  .frame-img.r-16x10{aspect-ratio:16/10;max-height:56vh}
  .img-cap{display:block;margin-top:.8vh;font-family:var(--mono);font-size:max(10px,.8vw);letter-spacing:.22em;text-transform:uppercase;opacity:.6}

  /* ============ 导航 ============ */
  #nav{position:fixed;left:50%;bottom:2.6vh;transform:translateX(-50%);z-index:30;display:flex;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(0,0,0,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
  #nav .dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;transition:all .3s ease;border:0;padding:0}
  #nav .dot:hover{background:rgba(255,255,255,.5);transform:scale(1.15)}
  #nav .dot.active{background:rgba(255,255,255,.95);width:22px;border-radius:999px}
  body.light-bg #nav{background:rgba(255,255,255,0.25)}
  body.light-bg #nav .dot{background:rgba(var(--ink-rgb),.25)}
  body.light-bg #nav .dot.active{background:rgba(var(--ink-rgb),.9)}
  #hint{position:fixed;bottom:3vh;right:3vw;z-index:30;font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.4;mix-blend-mode:difference;color:#aaa}
  body.low-power #hint{opacity:.72;color:var(--paper);mix-blend-mode:normal}
  body.light-bg.low-power #hint{color:var(--ink)}

  [data-anim]{opacity:1}
  body.motion-ready [data-anim]{opacity:0}
  body.motion-ready [data-anim="left"]{transform:translateX(-24px)}
  body.motion-ready [data-anim="right"]{transform:translateX(24px)}
  body.low-power #deck{transition:none!important}
  body.low-power.motion-ready [data-anim],
  body.low-power [data-anim]{opacity:1!important;transform:none!important}

  @media (max-width:900px){
    .display-zh{font-size:10vw}
    .h-hero{font-size:12vw}
    .h-xl{font-size:8vw}
    .grid-2-7-5{grid-template-columns:1fr}
  }
</style>
</head>
<body>
<script>
  (function(){
    const KEY = 'm2v-low-power';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stored = localStorage.getItem(KEY);
    window.__lowPowerMode = stored === '1' || (stored === null && reduced);
    function updateHint(){
      const hint = document.getElementById('hint');
      if(hint) hint.textContent = \`← → 翻页 · B \${window.__lowPowerMode ? '动态' : '静态'} · ESC 索引\`;
    }
    window.__setLowPowerMode = function(on, opts={}){
      window.__lowPowerMode = !!on;
      document.body.classList.toggle('low-power', window.__lowPowerMode);
      if(opts.persist !== false) localStorage.setItem(KEY, window.__lowPowerMode ? '1' : '0');
      if(window.__lowPowerMode && document.getAnimations){
        document.getAnimations().forEach(a=>a.cancel());
      }
      updateHint();
      dispatchEvent(new CustomEvent('ppt-low-power-change', {detail:{on:window.__lowPowerMode}}));
      if(window.__playSlide) window.__playSlide(window.__currentSlideIndex || 0);
    };
    document.body.classList.toggle('low-power', window.__lowPowerMode);
    addEventListener('DOMContentLoaded', updateHint, {once:true});
  })();
</script>

<canvas id="bg-dark" class="bg"></canvas>
<canvas id="bg-light" class="bg"></canvas>
<div id="hint">← → 翻页 · B 静态 · ESC 索引</div>

<div id="deck">

  <!-- SLIDE 1: COVER -->
  <section class="slide hero dark">
    <div class="chrome">
      <div>markdown2view</div>
      <div>Vol.01</div>
    </div>
    <div class="frame" style="display:grid; gap:4vh; align-content:center; min-height:80vh">
      <div class="kicker" data-anim>PRODUCT SLIDESHOW</div>
      <h1 class="h-hero" data-anim>markdown2view</h1>
      <h2 class="h-sub" data-anim>纯前端多场景排版与导出工作台</h2>
      <p class="lead" style="max-width:60vw" data-anim>
        把同一份内容渲染为面向不同受众的成品形态，利用浏览器原生的排版与截图机制，免去复杂的服务器环境。
      </p>
      <div class="meta-row" data-anim>
        <span>零后端部署</span><span>·</span><span>100% 隐私安全</span><span>·</span><span>一键复制导出</span>
      </div>
    </div>
    <div class="foot">
      <div>多场景排版工作流</div>
      <div>— 2026 —</div>
    </div>
  </section>

  <!-- SLIDE 2: ACT DIVIDER -->
  <section class="slide hero light">
    <div class="chrome">
      <div>第 一 幕 · 设计哲学</div>
      <div>ACT I · 02 / 05</div>
    </div>
    <div class="frame" style="display:grid; gap:6vh; align-content:center; min-height:80vh">
      <div class="kicker" data-anim>ACT I</div>
      <h1 class="display-zh" data-anim>信息的叙事与排版</h1>
      <p class="lead" style="max-width:55vw" data-anim>
        排版不是无意义的装饰，而是帮助读者以最佳的路径去理解信息。
      </p>
    </div>
    <div class="foot">
      <div>第一幕：排版与分发</div>
      <div>— · —</div>
    </div>
  </section>

  <!-- SLIDE 3: GRID 2 COL (TEXT + IMAGE) -->
  <section class="slide light">
    <div class="chrome">
      <div>核心范式 · The Paradigm</div>
      <div>03 / 05</div>
    </div>
    <div class="frame grid-2-7-5" style="padding-top:6vh">
      <div style="display:flex; flex-direction:column; justify-content:space-between; gap:3vh">
        <div>
          <div class="kicker" data-anim>THE TWIST</div>
          <h2 class="h-xl" data-anim>把设计交给原生引擎</h2>
          <p class="lead" style="margin-top:3vh" data-anim>
            无论是公众号排版、A4 规范文档报告、小红书多图卡片，还是 Web 网页演示稿，均在本地浏览器一秒渲染。
          </p>
        </div>
        <div class="callout" data-anim>
          "这是一种极其自由的工作方式。内容依然是 Markdown，输出形式则是根据需要任意变形的成品。"
          <div class="callout-src">— 产品设计团队</div>
        </div>
      </div>
      <figure class="frame-img r-16x10" data-anim>
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=375&fit=crop&q=80" alt="极简工作流">
        <figcaption class="img-cap">纯前端排版 · 极简工作空间</figcaption>
      </figure>
    </div>
    <div class="foot">
      <div>Page 03 · 极致的分发效率</div>
      <div>— · —</div>
    </div>
  </section>

  <!-- SLIDE 4: BIG NUMBERS -->
  <section class="slide light">
    <div class="chrome">
      <div>核心特性 · Features</div>
      <div>04 / 05</div>
    </div>
    <div class="frame" style="padding-top:6vh">
      <div class="kicker" data-anim>CORE CAPABILITIES</div>
      <h2 class="h-xl" data-anim>强大的功能矩阵</h2>
      <p class="lead" style="margin-bottom:5vh" data-anim>我们用最轻量的设计，实现多平台的格式打通。</p>

      <div class="grid-6" style="margin-top:4vh">
        <div class="stat-card" data-anim>
          <div class="stat-label">MODES</div>
          <div class="stat-nb">4 <span class="stat-unit">大模式</span></div>
          <div class="stat-note">长图文/A4/小红书/画布</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">PRIVACY</div>
          <div class="stat-nb">100%</div>
          <div class="stat-note">完全本地计算，零网络传输</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">DEPLOYMENT</div>
          <div class="stat-nb">0 <span class="stat-unit">后端</span></div>
          <div class="stat-note">开箱即用，静态托管</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">DEBOUNCE</div>
          <div class="stat-nb">500 <span class="stat-unit">ms</span></div>
          <div class="stat-note">轻量级防抖，编辑实时响应</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">STABILITY</div>
          <div class="stat-nb">150 <span class="stat-unit">ms</span></div>
          <div class="stat-note">DOM 稳定性自适应导出</div>
        </div>
        <div class="stat-card" data-anim>
          <div class="stat-label">LICENSE</div>
          <div class="stat-nb">MIT</div>
          <div class="stat-note">完全开源自由授权</div>
        </div>
      </div>
    </div>
    <div class="foot">
      <div>Page 04 · 特性矩阵</div>
      <div>— · —</div>
    </div>
  </section>

  <!-- SLIDE 5: CLOSING -->
  <section class="slide hero dark">
    <div class="chrome">
      <div>收束 · Conclusion</div>
      <div>05 / 05</div>
    </div>
    <div class="frame" style="display:grid; gap:8vh; align-content:center; min-height:80vh">
      <div class="kicker" data-anim>THE TAKEAWAY</div>
      <h1 class="h-hero" style="font-size:6.4vw; line-height:1.2">
        <span data-anim style="display:block">今天，就开始</span>
        <span data-anim style="display:block">用新一代工作流，</span>
        <span data-anim style="display:block">倍增你的内容分发效率。</span>
      </h1>
      <p class="lead" style="max-width:50vw" data-anim>
        立即在左侧编辑器中尝试。切换不同的主题、组件，组合出只属于你的排版。
      </p>
    </div>
    <div class="foot">
      <div>Page 05 · 感谢阅读</div>
      <div>— · —</div>
    </div>
  </section>

</div>

<div id="nav"></div>

<script>
/* =============== WebGL 背景渲染逻辑 =============== */
const VS = \`attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}\`;

const FS_DARK = \`precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
vec3 palette(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(6.28318*(c*t+d));}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse*2.0-1.0;m.x*=u_resolution.x/u_resolution.y;
  float md=length(p-m);
  float mr=sin(md*15.0-u_time*4.0)*exp(-md*3.0);p+=mr*0.08;
  vec2 p0=p;
  for(float i=1.0;i<4.0;i++){
    p.x+=0.1/i*sin(i*3.0*p.y+u_time*0.4)+0.05;
    p.y+=0.1/i*cos(i*2.0*p.x+u_time*0.3)-0.05;
  }
  float r=length(p);float ang=atan(p.y,p.x);
  vec3 a=vec3(0.12,0.12,0.13);
  vec3 b=vec3(0.03,0.04,0.05);
  vec3 c=vec3(1.0,1.0,1.0);
  vec3 d=vec3(0.1,0.2,0.4);
  vec3 col=palette(r*1.5+p0.x*0.5+u_time*0.1,a,b,c,d);
  float disp=sin(r*25.0-u_time*1.5+ang*2.0)*0.5+0.5;
  col+=vec3(disp*0.015,disp*0.01,disp*0.02);
  float hi=pow(sin(p.x*4.0+p.y*3.0+u_time)*0.5+0.5,8.0);
  col+=hi*0.08;
  vec3 base=vec3(0.05,0.05,0.06);
  col=mix(base,col,0.85);
  gl_FragColor=vec4(col,1.0);
}\`;

const FS_LIGHT = \`precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1,0));
  float c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*2.02;a*=0.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse;m.x*=u_resolution.x/u_resolution.y;
  vec2 md=p-m;float dl=length(md);
  p+=normalize(md+vec2(0.0001))*exp(-dl*5.0)*0.03;
  vec2 q=vec2(fbm(p*1.8+u_time*0.07),fbm(p*1.8+vec2(5.2,1.3)+u_time*0.06));
  vec2 r=vec2(fbm(p*2.0+q*1.3+vec2(1.7,9.2)+u_time*0.05),
              fbm(p*2.0+q*1.3+vec2(8.3,2.8)+u_time*0.04));
  float f=fbm(p*2.2+r*1.5);
  vec3 silverDark=vec3(0.86,0.85,0.84);
  vec3 paper=vec3(0.955,0.945,0.925);
  vec3 col=mix(silverDark,paper,f);
  float ph=r.x*2.2+u_time*0.35;
  col+=vec3(0.78,0.62,0.92)*sin(ph)*0.055;
  col+=vec3(0.55,0.72,0.95)*sin(ph*0.8+2.0)*0.05;
  float hl=smoothstep(0.48,0.92,f);
  col+=hl*0.06;
  gl_FragColor=vec4(col,1.0);
}\`;

const mouse={x:0.5,y:0.5};
addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth;mouse.y=e.clientY/innerHeight});

function bootGL(canvasId, fsSrc){
  const canvas=document.getElementById(canvasId);
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  if(!gl) return ()=>false;
  const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh};
  const prog=gl.createProgram();
  gl.attachShader(prog,mk(gl.VERTEX_SHADER,VS));
  gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,fsSrc));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(prog,'position');
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const lRes=gl.getUniformLocation(prog,'u_resolution');
  const lT=gl.getUniformLocation(prog,'u_time');
  const lM=gl.getUniformLocation(prog,'u_mouse');
  const resize=()=>{
    const d=Math.min(window.devicePixelRatio||1,2);
    canvas.width=innerWidth*d;canvas.height=innerHeight*d;
    gl.viewport(0,0,canvas.width,canvas.height);
  };
  addEventListener('resize',resize);resize();
  return (tSec)=>{
    gl.uniform2f(lRes,canvas.width,canvas.height);
    gl.uniform1f(lT,tSec);
    gl.uniform2f(lM,mouse.x,1-mouse.y);
    gl.drawArrays(gl.TRIANGLES,0,6);
    return true;
  };
}
let drawDark=null, drawLight=null, glRAF=0, glT0=Date.now();
function startGL(){
  if(window.__lowPowerMode || glRAF) return;
  if(!drawDark) drawDark=bootGL('bg-dark',FS_DARK);
  if(!drawLight) drawLight=bootGL('bg-light',FS_LIGHT);
  glT0=Date.now();
  function loop(){
    if(window.__lowPowerMode){glRAF=0;return;}
    const t=(Date.now()-glT0)/1000;
    drawDark(t);drawLight(t);
    glRAF=requestAnimationFrame(loop);
  }
  glRAF=requestAnimationFrame(loop);
}
function stopGL(){
  if(glRAF) cancelAnimationFrame(glRAF);
  glRAF=0;
}
startGL();
addEventListener('ppt-low-power-change', e=>{e.detail.on ? stopGL() : startGL();});

// =============== 翻页与指示器逻辑 ===============
const deck=document.getElementById('deck');
const slides=deck.querySelectorAll('.slide');
const nav=document.getElementById('nav');
let idx=0,total=slides.length,lock=false;

deck.style.width=(total*100)+'vw';

slides.forEach((s,i)=>{
  const b=document.createElement('button');
  b.className='dot';b.dataset.i=i;b.setAttribute('aria-label','Page '+(i+1));
  b.onclick=()=>go(i);
  nav.appendChild(b);
});

function go(n){
  if(lock)return;
  idx=Math.max(0,Math.min(total-1,n));
  window.__currentSlideIndex = idx;
  deck.style.transform=\`translateX(\${-idx*100}vw)\`;
  nav.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  const el=slides[idx];
  const th=el.dataset.theme || (el.classList.contains('light')?'light':'dark');
  document.body.classList.toggle('light-bg',th==='light');
  if(window.__playSlide) setTimeout(()=>window.__playSlide(idx), 450);
  lock=true;setTimeout(()=>lock=false,700);
}

// 键盘与滚轮导航支持
addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();return;}
  if(e.key && e.key.toLowerCase()==='b'){
    e.preventDefault();
    window.__setLowPowerMode(!window.__lowPowerMode);
    return;
  }
  if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ') go(idx+1);
  if(e.key==='ArrowLeft'||e.key==='PageUp') go(idx-1);
  if(e.key==='Home') go(0);
  if(e.key==='End') go(total-1);
});

let wheelTO=null,wheelAcc=0;
addEventListener('wheel',e=>{
  wheelAcc+=e.deltaY+e.deltaX;
  if(Math.abs(wheelAcc)>50){
    go(idx+(wheelAcc>0?1:-1));wheelAcc=0;
  }
  clearTimeout(wheelTO);wheelTO=setTimeout(()=>wheelAcc=0,150);
},{passive:true});

go(0);
</script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>

<script type="module">
let motion;
try {
  motion = await import('https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm');
} catch(e) {
  console.warn('[motion] Failed to load animation library.', e);
  document.querySelectorAll('[data-anim]').forEach(el=>{el.style.opacity='1';el.style.transform='none'});
}

if(motion){
  const { animate, stagger } = motion;
  document.body.classList.add('motion-ready');
  const EASE = [.22, 1, .36, 1];
  const slides = [...document.querySelectorAll('.slide')];

  function revealStatic(slide){
    document.getAnimations?.().forEach(a=>a.cancel());
    slide.querySelectorAll('[data-anim]').forEach(el=>{
      el.style.opacity='1';
      el.style.transform='none';
    });
  }

  function playSlide(i){
    const slide = slides[i];
    if(!slide) return;

    if(window.__lowPowerMode){
      revealStatic(slide);
      return;
    }

    const els = [...slide.querySelectorAll('[data-anim]')];
    if(els.length === 0) return;

    // 重置状态
    els.forEach(el=>{
      el.style.opacity='0';
      if(el.dataset.anim === 'left') el.style.transform='translateX(-24px)';
      else if(el.dataset.anim === 'right') el.style.transform='translateX(24px)';
      else el.style.transform='translateY(16px)';
    });

    // 运行动画
    animate(els, 
      i === 0 || slide.classList.contains('hero') 
        ? { opacity: [0, 1], y: [16, 0], x: (el)=>el.dataset.anim === 'left' ? [-24, 0] : el.dataset.anim === 'right' ? [24, 0] : [0, 0] }
        : { opacity: [0, 1], y: [12, 0], x: (el)=>el.dataset.anim === 'left' ? [-16, 0] : el.dataset.anim === 'right' ? [16, 0] : [0, 0] },
      { delay: stagger(0.12), duration: 0.85, easing: EASE }
    );
  }

  window.__playSlide = playSlide;
  playSlide(0);
}
</script>
</body>
</html>`;
