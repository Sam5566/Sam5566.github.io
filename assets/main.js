(function(){
/* ===== Edit these: profile links (empty ones are hidden) and map places ===== */
// Hero galaxy: 'sim' = FIRE-2 m12i in 3D (assets/galaxy3d.js), 'toy' = the original 2D animation
const GALAXY='sim';
const LINKS=[
  {label:'Open CV',action:'cv'},
  {label:'INSPIRE',url:'https://inspirehep.net/authors/1735317'},
  {label:'ORCID',url:'https://orcid.org/0000-0003-1490-1339'},
  {label:'Google Scholar',url:'https://scholar.google.com/citations?user=BZGBn8oAAAAJ'},
  {label:'GitHub',url:''},
  {label:'LinkedIn',url:''},
];
const PLACES=[
  {name:'New Brunswick, New Jersey',lat:40.50,lon:-74.45,items:[['work','Ph.D., Rutgers University, 2023 – now'],['work','Instructor, Rutgers physics, 2023 – 2025'],['collab','Matthew Buckley, David Shih and Ian Pang, Rutgers University',2026]]},
  {name:'Taiwan',lat:24.2,lon:120.9,items:[['work','M.Sc. and research assistant, National Taiwan University, Taipei, 2020 – 2023'],['work','Academia Sinica, Taipei, 2018 – 2019'],['work','B.Sc. and ATLAS group, National Tsing Hua University, Hsinchu, 2016 – 2020'],['talk','Talk, Dec 2025: Inferring DM scales from stellar kinematic distributions in MW-like galaxies. International Joint Workshop on the Standard Model and Beyond, Taipei'],['talk','Talk, Jan 2023: Updated constraints on the GM model and its EWPT and associated GWs. Physical Society of Taiwan Annual Meeting, Kaohsiung'],['collab','Cheng-Wei Chiang, National Taiwan University',2023],['collab','Van Que Tran, National Taiwan University',2019],['collab','Tzu-Chiang Yuan, Academia Sinica',2019],['collab','Pai-Hsien Jennifer Hsu, National Tsing Hua University',2020]]},
  {name:'Seoul, South Korea',lat:37.59,lon:127.05,items:[['collab','Raymundo Ramos, Korea Institute for Advanced Study',2019]]},
  {name:'Eastern China',lat:31.5,lon:119.4,items:[['collab','Yue-Lin Sming Tsai, Purple Mountain Observatory, Nanjing',2019],['collab','Bo-Qiang Lu, Huzhou Normal University',2022]]},
  {name:'Tokyo, Japan',lat:35.68,lon:139.69,items:[['talk','Talk (online), Aug 2021: EWPT in the Georgi–Machacek model under constraints of LHC data. Asia-Pacific Workshop on Particle Physics and Cosmology']]},
  {name:'Pittsburgh, Pennsylvania',lat:40.44,lon:-79.99,items:[['talk','Talk, May 2026: Joint spatial–spectral Gaussian process modeling of the Galactic Center Excess. Phenomenology Symposium 2026']]},
  {name:'Madison, Wisconsin',lat:43.07,lon:-89.40,items:[['collab','Ting-Kuo Chen, University of Wisconsin–Madison',2022]]},
  {name:'Montréal, Canada',lat:45.50,lon:-73.58,items:[['collab','Yitian Sun, McGill University',2026]]},
  {name:'Cambridge, Massachusetts',lat:42.36,lon:-71.09,items:[['collab','Tracy Slatyer, MIT',2026]]},
  {name:'Southern England',lat:51.1,lon:-1.0,items:[['talk','Talk, Jul 2026: A universal distribution of dark matter in Milky Way-like galaxies and how to infer it. Dark Matter and Stars, Southampton'],['collab','Justin Read, University of Surrey, Guildford',2026]]},
  {name:'Tenerife, Spain',lat:28.29,lon:-16.63,items:[['talk','Talk, Sep 2026: Joint spatial–spectral Gaussian process modeling of the Galactic Center Excess. 2nd UNDARK workshop']]},
];
const MAP={step:2.5,lat0:80,cols:144,rows:["000000007ff7ffff8003e000000700000000","000000c00787ffff00020000000040000000","00000018ff007fff00000003001ff801d000","00000375af003ffe0000000408fffff0c000","01fe007f23783ffe0000f0001bffffffff08","c3fffff7fe5c1fe00003ff1ffbffffffffff","27fffffffa781f01c00f3cffffffffffffff","03ffffffe2080e00003effffffffffffffbf","07f9ffffc0700000003e4ffffffffffffc60","00601fffe07e000002063fffffffffff0180","02000ffffe7f80000210fffffffffffc0380","000007fffe7fc0000bbfffffffffffff8200","000007fffff8400000ffffffffffffff4000","000003fffffc200001ffffffffffffff0000","000003fffffa000001fbf5e7fffffffe0000","000003fffff000000f9de067fffffff08000","000003ffffc000000f12dff7ffffff608000","000001ffff8000000f041ff3ffffff910000","000000ffffc0000007f007ffffffff070000","0000007fff0000000ffc83ffffffff080000","0000001ff20000000fffffefffffff800000","0000002f810000001ffffbf7ffffff000000","00000017800000003ffffdfa1fffff800000","00000003830000007ffffeff0ff7fc000000","00000003884000007ffffefe07c7c0000000","00000001f80000003ffffe7c0783e0800000","000000001e0000007fffff700301f0800000","00000000060000007fffff80030170800000","00000000022e00003ffffff0030121000000","00000000007f80001ffffff0008000200000","00000000007fe0000d3fffe0000283000000","00000000007ff000000fffc0000146000000","0000000000fff000000fff800000ce000000","0000000000fffe00000fff000000ce870000","0000000001ffff800007ff0000000001c000","0000000000ffffc00007ff0000001801e000","00000000007fffc00007ff00000000401000","00000000007fff800007ff000000000e0000","00000000003fff000007ff100000003c4000","00000000001fff000007fe300000007fc000","00000000000fff000007fc20000000ffe000","00000000000ffe000003fc60000007fff000","00000000000ff8000003fc20000007fff800","00000000000ff8000003f800000003fff800","00000000001ff0000001f000000003fff800","00000000001fe0000001e000000003c3f800","00000000001f80000000000000000001f000","00000000001f80000000000000000000f000","00000000001e000000000000000000000002","00000000003e000000000000000000002008","00000000003c000000000000000000000010","00000000003c000000000000000000000000","000000000038000000000000000000000000","000000000030000000000000000000000000","00000000000c000000000000000000000000","000000000000000000000000000000000000"]};
window.WORLD_MAP=MAP; // also drawn as the dotted Earth in the research zoom (zoom3d.js)

const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

// Justify (with hyphenation) any paragraph, caption or map entry longer than two sentences, like a
// LaTeX paragraph; shorter ones stay left-aligned. Re-run when text is added later (INSPIRE papers,
// the galaxy caption).
// a full stop after a single capital letter is an initial (C.-T. Huang), not a sentence end
const sentences=t=>t.split(/(?<![A-Z])[.!?](?=\s+[A-Z(\u201C"]|\s*$)/).filter(x=>x.trim().length>1).length;
function justifyLong(){document.querySelectorAll('p, figcaption, .place li').forEach(e=>e.classList.toggle('justify',sentences(e.textContent)>2))}
let jt=0;new MutationObserver(()=>{clearTimeout(jt);jt=setTimeout(justifyLong,100)}).observe(document.body,{childList:true,subtree:true,characterData:true});
justifyLong();
if(GALAXY==='sim'){const m=document.createElement('script');m.type='module';m.src='assets/galaxy3d.js?v=40';document.head.append(m)}
// research section: scroll-driven zoom from the cosmic web to Earth (falls back to the ladder)
if(!RM){const m=document.createElement('script');m.type='module';m.src='assets/zoom3d.js?v=74';document.head.append(m)}
const hasG=typeof gsap!=='undefined';
const NS='http://www.w3.org/2000/svg';
const $=s=>document.querySelector(s);
const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const wave=(x1,y1,x2,y2,amp,n)=>{const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;let d='';for(let i=0;i<=60;i++){const t=i/60,s=Math.sin(t*n*2*Math.PI)*amp;d+=(i?'L':'M')+(x1+dx*t+nx*s).toFixed(2)+' '+(y1+dy*t+ny*s).toFixed(2)}return d};

/* ---- links + CV ---- */
const dlg=$('#cv');
function openCV(){
  if(typeof dlg.showModal!=='function'){dlg.setAttribute('open','');return}
  dlg.showModal();document.body.style.overflow='hidden';
  // the entrance is a CSS animation (dialog#cv[open]), so the CV can never be left half-transparent
}
function closeCV(){const done=()=>{dlg.close();document.body.style.overflow=''};
  done()}
$('#cv-close').onclick=closeCV;
// Show the PDF download only when assets/cv.pdf has been added to the site
fetch('assets/cv.pdf',{method:'HEAD'}).then(r=>{if(r.ok&&(r.headers.get('content-type')||'').includes('pdf'))$('#cv-pdf').hidden=false}).catch(()=>{});
dlg.addEventListener('cancel',e=>{e.preventDefault();closeCV()});
dlg.addEventListener('click',e=>{if(e.target===dlg)closeCV()});
if(location.hash==='#cv')setTimeout(openCV,300);
function renderLinks(el){LINKS.forEach(l=>{
  if(l.action==='cv'){const b=document.createElement('button');b.type='button';b.textContent=l.label;b.onclick=openCV;el.append(b);return}
  if(!l.url)return;const a=document.createElement('a');a.href=l.url;a.target='_blank';a.rel='noopener';a.textContent=l.label;el.append(a)})}
renderLinks($('#herolinks'));renderLinks($('#footlinks'));
// clicking the address copies it; a short note confirms
const em=$('#email'),note=document.createElement('span');note.className='copied';note.setAttribute('aria-live','polite');em.after(note);
em.setAttribute('role','button');em.tabIndex=0;em.title='Click to copy';
const copyEmail=async()=>{try{await navigator.clipboard.writeText(em.textContent);note.textContent='Copied'}
  catch(_){const r=document.createRange();r.selectNodeContents(em);const s=getSelection();s.removeAllRanges();s.addRange(r);note.textContent='Selected, press ⌘C / Ctrl+C'}
  clearTimeout(copyEmail.t);copyEmail.t=setTimeout(()=>note.textContent='',1800)};
em.onclick=copyEmail;em.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();copyEmail()}};

/* ---- figures ---- */
const gh=$('#g-higgs');
gh.append(mk('path',{d:'M6 42 L46 42','class':'draw acc',pathLength:1,'stroke-width':2,'stroke-dasharray':'4 3'}));
gh.append(mk('path',{d:wave(46,42,80,18,3,3.5),'class':'draw',pathLength:1,stroke:'currentColor','stroke-width':1.4}));
gh.append(mk('path',{d:wave(46,42,80,66,3,3.5),'class':'draw',pathLength:1,stroke:'currentColor','stroke-width':1.4}));
[[80,18,110,6],[80,18,110,30],[80,66,110,54],[80,66,110,78]].forEach((p,i)=>gh.append(mk('path',{d:`M${p[0]} ${p[1]} L${p[2]} ${p[3]}`,'class':'draw'+(i%2?'':' hot'),pathLength:1,stroke:'currentColor','stroke-width':1.4})));
const lab=(x,y,s)=>{const t=mk('text',{x,y});t.textContent=s;gh.append(t)};
lab(14,35,'H');lab(54,20,'W');lab(54,75,'W*');lab(113,9,'e');lab(113,33,'ν');lab(113,57,'μ');lab(113,81,'ν');
[[46,42],[80,18],[80,66]].forEach(p=>gh.append(mk('circle',{cx:p[0],cy:p[1],r:2.4,fill:'currentColor'})));

const gf=$('#g-flow');
for(let i=0;i<70;i++){const x0=60+gauss()*12,y0=42+gauss()*11,left=i%2===0,x1=(left?32:88)+gauss()*7,y1=(left?52:30)+gauss()*7;
  const c=mk('circle',{cx:x0.toFixed(1),cy:y0.toFixed(1),r:1.8,fill:left?'var(--accent)':'var(--heat)'});
  c.style.setProperty('--dx',(x1-x0).toFixed(1)+'px');c.style.setProperty('--dy',(y1-y0).toFixed(1)+'px');
  if(RM){c.setAttribute('cx',x1.toFixed(1));c.setAttribute('cy',y1.toFixed(1))}gf.append(c)}

// stochastic GW background from a phase transition: broken power-law peak + detector sensitivity bucket
const gw=$('#g-gw');
gw.append(mk('line',{x1:8,y1:78,x2:116,y2:78,stroke:'currentColor','stroke-width':1,opacity:.3}));
gw.append(mk('line',{x1:8,y1:78,x2:8,y2:4,stroke:'currentColor','stroke-width':1,opacity:.3}));
let ds='',dd='';
for(let i=0;i<=100;i++){const x=8+i*1.08,u=(i-48)/16;
  const s=3/(1+Math.pow(Math.abs(u)+.0001,1)*(u<0?1:1))-.0; const y=70-48*Math.exp(-u*u/2.2)*(u<0?1:1);ds+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);
  const v=(i-58)/18,yd=10+28*v*v;dd+=(i?'L':'M')+x.toFixed(1)+' '+Math.min(yd,78).toFixed(1)}
gw.append(mk('path',{d:dd,'class':'draw hot',pathLength:1,'stroke-width':1.3,'stroke-dasharray':'4 3'}));
gw.append(mk('path',{d:ds,'class':'draw acc',pathLength:1,'stroke-width':2}));
const t1=mk('text',{x:116,y:86,'text-anchor':'end'});t1.textContent='f';gw.append(t1);
const t2=mk('text',{x:0,y:8});t2.textContent='Ω';gw.append(t2);
const t3=mk('text',{x:96,y:12});t3.textContent='LISA';gw.append(t3);

/* ---- map ---- */
const MW=1440,MH=560,px=(lat,lon)=>[(lon+180)/360*MW,(MAP.lat0-lat)/(MAP.step*MAP.rows.length)*MH];
let ld='';const cell=MW/MAP.cols,r=cell*.3;
MAP.rows.forEach((row,ri)=>{for(let ci=0;ci<MAP.cols;ci++){if(parseInt(row[ci>>2],16)>>(3-(ci&3))&1){const x=ci*cell+cell/2,y=ri*cell+cell/2;ld+=`M${(x-r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2*r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2*r).toFixed(1)} 0`}}});
$('#land').setAttribute('d',ld);
const PIN={work:'accent',talk:'heat',collab:'tert'};
const mapc=$('#mapc'),placeEl=$('#place');const pins=[];
function showPlace(i){const p=PLACES[i];pins.forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
  placeEl.innerHTML=`<h3>${p.name}</h3><ul>${p.items.map(([t,s])=>`<li class="${t}">${s}</li>`).join('')}</ul>`;
  if(hasG&&!RM)gsap.from(placeEl.children,{y:8,opacity:0,duration:.35,stagger:.05,ease:'power2.out'})}
PLACES.forEach((p,i)=>{const [x,y]=px(p.lat,p.lon),b=document.createElement('button');
  const kinds=['work','talk','collab'].filter(k=>p.items.some(it=>it[0]===k));
  b.className='pin '+kinds[0];b.style.setProperty('--fill',kinds.length>1?`conic-gradient(${kinds.map((k,j)=>`var(--${PIN[k]}) 0 ${(j+1)/kinds.length*100}%`).join(',')})`:`var(--${PIN[kinds[0]]})`);b.style.left=(x/MW*100)+'%';b.style.top=(y/MH*100)+'%';
  b.setAttribute('aria-label',p.name);b.innerHTML='<i></i>';b.onclick=e=>{if(!e.detail)showPlace(i)};mapc.append(b);pins.push(b)});
// Pins near each other overlap, so a mouse click or tap picks the closest pin centre instead of the topmost button
mapc.addEventListener('click',e=>{if(!e.detail)return;let best=-1,bd=34;
  pins.forEach((b,j)=>{const r=b.getBoundingClientRect(),d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));if(d<bd){bd=d;best=j}});
  if(best>=0)showPlace(best)});
showPlace(0);
// collaborator arcs, from New Brunswick out to every other place with a collaborator.
// A collab item's third entry is the year we last worked together; the arc fades one step per
// five years since then (1, .7, .4, then stays at .2 so it never disappears). Pins don't fade.
const home=px(PLACES[0].lat,PLACES[0].lon),thisYear=new Date().getFullYear();
PLACES.slice(1).filter(p=>p.items.some(it=>it[0]==='collab')).forEach(p=>{const [x,y]=px(p.lat,p.lon),d=Math.hypot(x-home[0],y-home[1]);
  const last=Math.max(...p.items.filter(it=>it[0]==='collab').map(it=>it[2]||thisYear)),op=Math.max(.2,1-.3*Math.floor((thisYear-last)/5));
  $('#collab-links').append(mk('path',{opacity:op,d:`M${home[0].toFixed(1)} ${home[1].toFixed(1)} Q ${((x+home[0])/2).toFixed(1)} ${Math.max(Math.min(y,home[1])-d*.35,24-Math.min(y,home[1])).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,pathLength:1,'stroke-dasharray':1}))});

/* ===== Galaxy masthead ===== */
const cv=$('#gal'),g=cv.getContext('2d');
const vVis=r=>{const x=r/4;return 205*x/(.45+.55*Math.pow(x,1.5))};
const vHalo=r=>{const rc=6;return 175*Math.sqrt(Math.max(0,1-rc/r*Math.atan(r/rc)))};
const vTot=r=>Math.hypot(vVis(r),vHalo(r));
let W=0,H=0,dpr=1,cx=0,cy=0,R=0,stars=[],halo=true,haloA=1,t=0;
const INC=Math.cos(62*Math.PI/180),PA=-22*Math.PI/180,cpa=Math.cos(PA),spa=Math.sin(PA);
const PITCH=Math.tan(15*Math.PI/180),OMP=.05;
function makeStars(n){stars=[];
  for(let i=0;i<n;i++){let r0,bulge=Math.random()<.14;
    if(bulge)r0=Math.abs(gauss())*1.1+.05;else r0=Math.max(.4,-3.2*Math.log(1-Math.random()*(1-Math.exp(-19/3.2))));
    const th=Math.random()*2*Math.PI;
    stars.push({r0,r:r0,vr:0,th,L:r0*vTot(r0),bulge,b:.35+Math.random()*.65,a:1});}
  stars.push({r0:8.2,r:8.2,vr:0,th:2.4,L:8.2*vTot(8.2),bulge:false,b:1,a:1,sun:true});
}
function layout(){const rect=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=rect.width;H=rect.height;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
  if(W>860){cx=W*.68;cy=H*.45;R=Math.min(W*.3,H*.55)}else{cx=W*.5;cy=H*.5;R=Math.min(W*.56,H*.34)}
  if(!stars.length)makeStars(W>860?6000:3400);
}
function proj(r,th){const x=r*Math.cos(th),y=r*Math.sin(th)*INC,s=R/13;return [cx+(x*cpa-y*spa)*s,cy+(x*spa+y*cpa)*s]}
function step(dt){t+=dt;
  for(const s of stars){
    if(halo){s.r+=(s.r0-s.r)*Math.min(1,dt*1.4);s.vr=0;s.a=Math.min(1,s.a+dt)}
    else{const acc=s.L*s.L/(s.r*s.r*s.r)-vVis(s.r)**2/s.r;s.vr+=acc*.0028*dt;s.r+=s.vr*dt;if(s.r<.2){s.r=.2;s.vr=Math.abs(s.vr)}if(s.r>40)s.a=Math.max(0,s.a-dt*.8)}
    s.th+=s.L/(s.r*s.r)*.0042*dt;
  }
}
function draw(){
  g.fillStyle='#04060E';g.fillRect(0,0,W,H);
  // dark matter halo haze
  if(haloA>.01){const hg=g.createRadialGradient(cx,cy,0,cx,cy,R*1.5);hg.addColorStop(0,`rgba(90,110,255,${.16*haloA})`);hg.addColorStop(.55,`rgba(70,85,220,${.07*haloA})`);hg.addColorStop(1,'rgba(60,70,200,0)');g.fillStyle=hg;g.beginPath();g.ellipse(cx,cy,R*1.5,R*1.25,PA,0,Math.PI*2);g.fill()}
  // bulge / galactic-center glow
  const bg=g.createRadialGradient(cx,cy,0,cx,cy,R*.22);bg.addColorStop(0,'rgba(255,190,130,.75)');bg.addColorStop(.4,'rgba(255,138,76,.25)');bg.addColorStop(1,'rgba(255,138,76,0)');g.fillStyle=bg;g.beginPath();g.arc(cx,cy,R*.22,0,Math.PI*2);g.fill();
  g.globalCompositeOperation='lighter';
  const sz=Math.max(1,R/300);let sun=null;
  for(const s of stars){if(s.a<=0)continue;if(s.sun){sun=s;continue}
    const [x,y]=proj(s.r,s.th);
    let arm=0;if(!s.bulge){const ph=s.th-OMP*t-Math.log(s.r0/1.2)/PITCH;arm=Math.pow((1+Math.cos(2*ph))/2,4)}
    const al=(s.bulge?.5:.2+.75*arm)*s.b*s.a;
    g.fillStyle=s.bulge?`rgba(255,205,160,${al})`:(arm>.5?`rgba(205,215,255,${al})`:`rgba(160,175,240,${al})`);
    const k=s.bulge?sz:sz*(1+arm*.8);g.fillRect(x,y,k,k)}
  g.globalCompositeOperation='source-over';
  if(sun&&sun.a>0){const [x,y]=proj(sun.r,sun.th);g.strokeStyle=`rgba(255,215,140,${sun.a})`;g.lineWidth=1.2;g.beginPath();g.arc(x,y,5,0,Math.PI*2);g.stroke();g.fillStyle=`rgba(255,215,140,${sun.a})`;g.beginPath();g.arc(x,y,1.6,0,Math.PI*2);g.fill();
    g.font='12px "IBM Plex Sans", sans-serif';g.fillText('Sun',x+9,y+4)}
}
let raf=0,last=0,vis=true,stopped=false;
// galaxy3d.js calls this once the simulated galaxy is ready to take over the hero
window.toyGalaxy={stop(){stopped=true;vis=false;cancelAnimationFrame(raf);raf=0;cv.hidden=true}};
function loop(ts){const dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;step(dt);draw();raf=vis?requestAnimationFrame(loop):0;if(!vis)last=0}
new ResizeObserver(()=>{layout();draw()}).observe(cv);
layout();draw();
if(!RM){new IntersectionObserver(es=>{vis=!stopped&&es[0].isIntersecting&&!document.hidden;if(vis&&!raf)raf=requestAnimationFrame(loop)}).observe(cv);
  document.addEventListener('visibilitychange',()=>{vis=!stopped&&!document.hidden;if(vis&&!raf)raf=requestAnimationFrame(loop)})}

// rotation-curve inset, computed from the same model the galaxy uses
const rc=$('#rc'),X=r=>34+r/25*196,Y=v=>122-v/300*112;
const ax=(x1,y1,x2,y2)=>rc.append(mk('line',{x1,y1,x2,y2,'class':'ax'}));
ax(34,122,230,122);ax(34,122,34,8);
[0,10,20].forEach(r=>{ax(X(r),122,X(r),125);const tx=mk('text',{x:X(r),y:135,'text-anchor':'middle'});tx.textContent=r;rc.append(tx)});
[0,100,200,300].forEach(v=>{ax(31,Y(v),34,Y(v));const tx=mk('text',{x:28,y:Y(v)+3,'text-anchor':'end'});tx.textContent=v;rc.append(tx)});
const xl=mk('text',{x:230,y:148,'text-anchor':'end'});xl.textContent='radius (kpc)';rc.append(xl);
const yl=mk('text',{x:38,y:6});yl.textContent='orbital speed (km/s)';rc.append(yl);
let pt='',pv='';for(let i=1;i<=100;i++){const r=i*.25;pt+=(i>1?'L':'M')+X(r).toFixed(1)+' '+Y(vTot(r)).toFixed(1);pv+=(i>1?'L':'M')+X(r).toFixed(1)+' '+Y(vVis(r)).toFixed(1)}
const pTot=mk('path',{d:pt,'class':'tot'}),pVis=mk('path',{d:pv,'class':'vis'});rc.append(pVis,pTot);
[3,5,7,9,11,13,15,17,19,21,23].forEach((r,i)=>{const v=vTot(r)+((i*37)%11-5)*2.2,y=Y(v);rc.append(mk('line',{x1:X(r),y1:y-5,x2:X(r),y2:y+5,stroke:'#fff','stroke-width':.8,opacity:.6}));rc.append(mk('circle',{cx:X(r),cy:y,r:2,'class':'obs'}))});
const lt=mk('text',{x:X(25),y:Y(vTot(25))-16,'text-anchor':'end',fill:'#93A2FF'});lt.textContent='stars + gas + dark matter';lt.style.fill='#93A2FF';rc.append(lt);
const lv=mk('text',{x:X(25),y:Y(vVis(25))+14,'text-anchor':'end'});lv.textContent='stars + gas only';lv.style.fill='#FF8A4C';rc.append(lv);

const hb=$('#halo');
hb.onclick=()=>{halo=!halo;hb.setAttribute('aria-checked',halo);pTot.style.opacity=halo?1:.25;lt.style.opacity=halo?1:.35;
  if(!halo)for(const s of stars){s.vr=0}
  if(hasG&&!RM)gsap.to({v:haloA},{v:halo?1:0,duration:1.2,ease:'power2.inOut',onUpdate(){haloA=this.targets()[0].v}});else{haloA=halo?1:0;draw()}};

/* ===== §2 Fig. 1: the cosmic web and the weak-lensing map it makes ===== */
// Plays on its own while on screen (not scroll-driven), drifting between cosmologies.
// Zel'dovich approximation: particles start on a grid and move by D * psi, where psi is the displacement
// field of one fixed Gaussian random field (power-law spectrum, computed once by FFT) and D grows with
// sigma8. Left: the density of one slice. Right: the convergence, i.e. the matter of that slice and
// three more behind it, weighted along the line of sight and by Omega_m, smoothed, plus shape noise.
let wlSet=()=>{};
(function(){
  const web=$('#wlweb'),map=$('#wlmap');if(!web||!map)return;
  const N=256,NS=4,rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
  const g=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  function fft(re,im,inv){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
    for(let len=2;len<=n;len<<=1){const a=(inv?2:-2)*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);
      for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const ur=re[i+k],ui=im[i+k],vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci,vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
        re[i+k]=ur+vr;im[i+k]=ui+vi;re[i+k+len/2]=ur-vr;im[i+k+len/2]=ui-vi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}
    if(inv)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}}
  function fft2(re,im,inv){const r=new Float64Array(N),c=new Float64Array(N);
    for(let y=0;y<N;y++){for(let x=0;x<N;x++){r[x]=re[y*N+x];c[x]=im[y*N+x]}fft(r,c,inv);for(let x=0;x<N;x++){re[y*N+x]=r[x];im[y*N+x]=c[x]}}
    for(let x=0;x<N;x++){for(let y=0;y<N;y++){r[y]=re[y*N+x];c[y]=im[y*N+x]}fft(r,c,inv);for(let y=0;y<N;y++){re[y*N+x]=r[y];im[y*N+x]=c[y]}}}
  // displacement fields psi = grad(phi), with phi(k) = delta(k) / k^2 and P(k) ~ k^-1.4 cut at small scales
  const psi=[];
  for(let s=0;s<NS;s++){const re=new Float64Array(N*N),im=new Float64Array(N*N);for(let i=0;i<N*N;i++)re[i]=g();fft2(re,im,false);
    const xr=new Float64Array(N*N),xi=new Float64Array(N*N),yr=new Float64Array(N*N),yi=new Float64Array(N*N);let dv=0;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const kx=(x<N/2?x:x-N)*2*Math.PI/N,ky=(y<N/2?y:y-N)*2*Math.PI/N,k2=kx*kx+ky*ky;if(!k2)continue;
      const amp=Math.pow(Math.sqrt(k2),-0.7)*Math.exp(-k2/(2*.55*.55))/k2,i=y*N+x,a=re[i]*amp,b=im[i]*amp;
      xr[i]=-kx*b;xi[i]=kx*a;yr[i]=-ky*b;yi[i]=ky*a;dv+=k2*k2*(a*a+b*b)}       // psi = i k phi; div psi = -k^2 phi
    fft2(xr,xi,true);fft2(yr,yi,true);
    const norm=1/Math.sqrt(dv/(N*N)/(N*N)); // unit rms linear density contrast
    psi.push([Float32Array.from(xr,v=>v*norm),Float32Array.from(yr,v=>v*norm)])}
  const noise=Float32Array.from({length:N*N},()=>g());
  const rho=Array.from({length:NS},()=>new Float32Array(N*N)),kap=new Float32Array(N*N),tmp=new Float32Array(N*N),show=new Float32Array(N*N);
  function deposit(s,D){const r=rho[s];r.fill(0);const [px,py]=psi[s];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;let X=x+D*px[i],Y=y+D*py[i];X=((X%N)+N)%N;Y=((Y%N)+N)%N;
      const x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,x1=(x0+1)%N,y1=(y0+1)%N;   // cloud-in-cell
      r[y0*N+x0]+=(1-fx)*(1-fy);r[y0*N+x1]+=fx*(1-fy);r[y1*N+x0]+=(1-fx)*fy;r[y1*N+x1]+=fx*fy}}
  function blur(a,s){const k=[],R=Math.ceil(3*s);let t=0;for(let i=-R;i<=R;i++){k.push(Math.exp(-i*i/(2*s*s)));t+=k[k.length-1]}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(let i=-R;i<=R;i++)v+=a[y*N+((x+i+N)%N)]*k[i+R];tmp[y*N+x]=v/t}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(let i=-R;i<=R;i++)v+=tmp[((y+i+N)%N)*N+x]*k[i+R];a[y*N+x]=v/t}}
  const W=[.5,1,1,.6];   // lensing weight of each slice along the line of sight
  function compute(s8,Om){const D=1.15*s8/.8;
    for(let s=0;s<NS;s++)deposit(s,D);
    for(let i=0;i<N*N;i++){let k=0;for(let s=0;s<NS;s++)k+=W[s]*(rho[s][i]-1);kap[i]=k*Om/.3}
    blur(kap,1.6);for(let i=0;i<N*N;i++)kap[i]+=.35*noise[i];
    show.set(rho[0]);blur(show,1.1)}   // a touch of smoothing hides the starting grid of particles in the voids
  // colour scales fixed at the fiducial cosmology, so changes in contrast are real
  compute(.8,.3);
  // percentiles rather than min/max, so one extreme peak doesn't set the whole scale
  const pct=(a,q)=>{const s=Float32Array.from(a).sort();return s[Math.floor(q*(s.length-1))]};
  const webMax=Math.log1p(pct(show,.998)),kl=pct(kap,.01),kh=pct(kap,.997);
  // The web depends only on sigma8, and the lensing map on Omega_m only through a factor, so each
  // sigma8 step (0.025) is simulated once, in idle time, and frames blend between the two nearest
  const S0=.55,DS=.025,NB=19,cache=new Array(NB);
  function bucket(b){if(cache[b])return cache[b];const s8=S0+b*DS,D=1.15*s8/.8;
    for(let s=0;s<NS;s++)deposit(s,D);
    const kb=new Float32Array(N*N);for(let i=0;i<N*N;i++){let k=0;for(let s=0;s<NS;s++)k+=W[s]*(rho[s][i]-1);kb[i]=k}
    blur(kb,1.6);show.set(rho[0]);blur(show,1.1);
    const wv=new Uint8Array(N*N);for(let i=0;i<N*N;i++)wv[i]=Math.min(255,Math.round(Math.log1p(show[i])/webMax*255));
    return cache[b]={wv,kb}}
  const warm=()=>{const next=[...Array(NB).keys()].find(k=>!cache[k]);if(next===undefined)return;bucket(next);(window.requestIdleCallback||setTimeout)(warm)};
  const isDark=()=>matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light'||document.documentElement.dataset.theme==='dark';
  // colour lookup tables (256 entries, as packed RGBA), rebuilt when the theme changes
  const lutOf=stops=>{const t=new Uint32Array(256);for(let k=0;k<256;k++){const v=k/255;let j=0;while(j<stops.length-2&&v>stops[j+1][0])j++;
      const [t0,c0]=stops[j],[t1,c1]=stops[j+1],u=(v-t0)/(t1-t0),c=c0.map((a,q)=>Math.round(a+(c1[q]-a)*u));t[k]=(255<<24)|(c[2]<<16)|(c[1]<<8)|c[0]}return t};
  let luts;const makeLuts=()=>{const d=isDark(),bg=d?[6,8,16]:[240,242,248];
    luts={web:lutOf([[0,bg],[.35,d?[90,40,20]:[230,180,140]],[.7,d?[255,138,76]:[210,84,26]],[1,d?[255,240,210]:[90,30,10]]]),
          map:lutOf([[0,bg],[.55,d?[60,75,170]:[160,175,235]],[.8,d?[147,162,255]:[46,68,201]],[1,d?[255,255,255]:[20,30,90]]])}};
  makeLuts();
  // one offscreen canvas per panel: a GPU canvas may copy lazily, so a shared one could leave both
  // panels showing whichever image was drawn last
  const img=new ImageData(N,N),px=new Uint32Array(img.data.buffer),offs=new Map();
  const blit=cv=>{let o=offs.get(cv);if(!o){const c=document.createElement('canvas');c.width=c.height=N;o=c.getContext('2d');offs.set(cv,o)}
    o.putImageData(img,0,0);const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(o.canvas,0,0,cv.width,cv.height)};
  let cur=[.8,.3];const read=$('#wlread');
  function draw(){const [s8,Om]=cur,f=Math.min(NB-1.001,Math.max(0,(s8-S0)/DS)),b=Math.floor(f),u=f-b,A=bucket(b),B=bucket(b+1),sc=Om/.3,inv=255/(kh-kl);
    for(let p=0;p<N*N;p++)px[p]=luts.web[Math.round(A.wv[p]+(B.wv[p]-A.wv[p])*u)];
    blit(web);
    for(let p=0;p<N*N;p++){const k=((A.kb[p]+(B.kb[p]-A.kb[p])*u)*sc+.35*noise[p]-kl)*inv;px[p]=luts.map[k<0?0:k>255?255:k|0]}
    blit(map);
    read.innerHTML=`σ<sub>8</sub> = ${s8.toFixed(2)} · Ω<sub>m</sub> = ${Om.toFixed(2)} · <b>S<sub>8</sub> = ${(s8*Math.sqrt(Om/.3)).toFixed(2)}</b>`}
  wlSet=(s8,Om)=>{if(s8===cur[0]&&Om===cur[1])return;cur=[s8,Om];draw()};
  // while on screen, drift continuously between universes: sigma8 between 0.55 and 1.0 (10 s cycle),
  // Omega_m between 0.2 and 0.42 (17 s cycle, so the two wander out of step); about 24 redraws a second
  if(!RM){let t0=0,last=0,raf=0,vis=false;
    const tick=ts=>{raf=vis?requestAnimationFrame(tick):0;if(ts-last<40)return;last=ts;const t=(ts-t0)/1000;
      wlSet(.775-.225*Math.cos(2*Math.PI*t/10),.31-.11*Math.cos(2*Math.PI*t/17))};
    new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!raf){t0=t0||performance.now();raf=requestAnimationFrame(tick)}}).observe(web);
    // simulate the rest of the sigma8 steps in idle time once the figure is near
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();(window.requestIdleCallback||setTimeout)(warm)}},{rootMargin:'800px'}).observe(web)}
  draw();
  const retheme=()=>{makeLuts();draw()};
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',retheme);
  new MutationObserver(retheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();

/* ===== §2 Fig. 2: toy template decomposition of the inner galaxy ===== */
let elzP=1,drawELZ=()=>{};
(function(){
  const N=96,deg=40/N,rnd=(()=>{let x=7;return()=>(x=(x*16807)%2147483647)/2147483647})();
  const g2=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const dif=new Float32Array(N*N),ps=new Float32Array(N*N),ex=new Float32Array(N*N),dat=new Float32Array(N*N);
  const srcs=[];for(let i=0;i<26;i++)srcs.push([(rnd()-.5)*38,g2()*(rnd()<.6?3:9),Math.exp(Math.log(.6)+rnd()*Math.log(14))]);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const l=-20+(i+.5)*deg,b=20-(j+.5)*deg,k=j*N+i;
    const bub=Math.max(0,1-((l/9)**2+((Math.abs(b)-11)/9.5)**2));
    dif[k]=5*Math.exp(-Math.abs(b)/2.2)*(1+.35*Math.exp(-l*l/300))+.9*Math.exp(-Math.abs(b)/9)+.25+.55*Math.min(1,bub*3);
    let v=0;for(const s of srcs){const d2=(l-s[0])**2+(b-s[1])**2;v+=s[2]*Math.exp(-d2/(2*.55*.55))}ps[k]=v;
    const r2=l*l+b*b;ex[k]=4.2*Math.pow(r2+.6,-.6);
    const tot=dif[k]+ps[k]+ex[k];dat[k]=Math.max(0,tot+Math.sqrt(tot/5)*g2());
  }
  const vmax=Math.log(1+13);
  const stops=[[4,6,14],[26,33,96],[86,92,240],[255,138,76],[255,236,190]];
  const cmap=t=>{t=Math.min(1,Math.max(0,t))*(stops.length-1);const i=Math.min(stops.length-2,Math.floor(t)),f=t-i,a=stops[i],c=stops[i+1];return [a[0]+(c[0]-a[0])*f,a[1]+(c[1]-a[1])*f,a[2]+(c[2]-a[2])*f]};
  [dat,dif,ps,ex].forEach((arr,ci)=>{
    const c=document.querySelectorAll('#decomp canvas')[ci],x=c.getContext('2d'),im=x.createImageData(N,N);
    for(let k=0;k<N*N;k++){const [r,g,b]=cmap(Math.log(1+arr[k])/vmax);im.data[k*4]=r;im.data[k*4+1]=g;im.data[k*4+2]=b;im.data[k*4+3]=255}
    x.putImageData(im,0,0);
  });
})();

/* ===== §2 Fig. 3: toy E–Lz plane ===== */
(function(){
  const c=$('#elz'),x=c.getContext('2d');
  let rs=11;const rnd=()=>(rs=(rs*16807)%2147483647)/2147483647;
  const g2=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const P=[];
  for(let i=0;i<900;i++){const E=-1.85+rnd()*.75,L=1.0+(E+1.9)*3.3-Math.abs(g2())*.35;P.push({L,E,g:-1})}
  for(let i=0;i<520;i++){P.push({L:g2()*.95+.3,E:-1.75+Math.pow(rnd(),.8)*.95,g:-1})}
  const G=[
    {name:'Gaia–Enceladus',col:'--heat',mL:0,sL:.33,mE:-1.36,sE:.15,n:430},
    {name:'Sequoia',col:'--accent',mL:-2.55,sL:.33,mE:-.97,sE:.07,n:110},
    {name:'Helmi streams',col:'--tert',mL:1.3,sL:.14,mE:-1.2,sE:.05,n:90},
  ];
  G.forEach((gr,gi)=>{for(let i=0;i<gr.n;i++)P.push({L:gr.mL+g2()*gr.sL,E:Math.min(-.62,gr.mE+g2()*gr.sE),g:gi})});
  for(let i=P.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[P[i],P[j]]=[P[j],P[i]]}
  let W=0,H=0;
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgba=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
  const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
  function size(){const r=c.getBoundingClientRect();if(!r.width)return;const d=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0)}
  drawELZ=function(){
    if(!W)size();if(!W)return;
    const ink=css('--ink'),mut=css('--muted'),line=css('--line');
    const m={l:52,r:14,t:14,b:42},pw=W-m.l-m.r,ph=H-m.t-m.b;
    const X=L=>m.l+(L+4)/8*pw,Y=E=>m.t+(-.6-E)/1.4*ph;
    x.clearRect(0,0,W,H);
    x.strokeStyle=line;x.lineWidth=1;x.font='11px "IBM Plex Sans", sans-serif';x.fillStyle=mut;
    x.beginPath();x.moveTo(m.l,m.t);x.lineTo(m.l,m.t+ph);x.lineTo(m.l+pw,m.t+ph);x.stroke();
    x.textAlign='center';[-4,-2,0,2,4].forEach(v=>{const px=X(v);x.beginPath();x.moveTo(px,m.t+ph);x.lineTo(px,m.t+ph+4);x.stroke();x.fillText(v,px,m.t+ph+16)});
    x.fillText('angular momentum Lz  (10³ kpc km/s)',m.l+pw/2,H-6);
    x.textAlign='right';[-2,-1.6,-1.2,-.8].forEach(v=>{const py=Y(v);x.beginPath();x.moveTo(m.l-4,py);x.lineTo(m.l,py);x.stroke();x.fillText(v.toFixed(1),m.l-7,py+4)});
    x.save();x.translate(13,m.t+ph/2);x.rotate(-Math.PI/2);x.textAlign='center';x.fillText('energy E  (10⁵ km²/s²)',0,0);x.restore();
    x.setLineDash([3,4]);x.beginPath();x.moveTo(X(0),m.t);x.lineTo(X(0),m.t+ph);x.stroke();x.setLineDash([]);
    x.textAlign='right';x.fillText('retrograde',X(-.15),m.t+ph-8);x.textAlign='left';x.fillText('prograde',X(.15),m.t+ph-8);
    const p=elzP,colorT=ease((p-.3)/.4),ringT=ease((p-.7)/.3);
    const cols=G.map(gr=>css(gr.col));const rad=Math.max(1.3,W/520);
    for(const s of P){const px=X(s.L),py=Y(s.E);if(px<m.l||py>m.t+ph||py<m.t)continue;
      if(s.g<0){x.fillStyle=rgba(mut,.55-.3*colorT);x.beginPath();x.arc(px,py,rad,0,6.283);x.fill()}
      else{x.fillStyle=colorT<.02?rgba(mut,.55):rgba(cols[s.g],.35+.55*colorT);x.beginPath();x.arc(px,py,rad*(1+.35*colorT),0,6.283);x.fill()}}
    if(ringT>0){G.forEach((gr,gi)=>{x.strokeStyle=cols[gi];x.lineWidth=1.3;
      [1.3,2.4].forEach((k,ki)=>{x.globalAlpha=ringT*(ki?.45:.9);x.beginPath();x.ellipse(X(gr.mL),Y(gr.mE),gr.sL*k/8*pw,gr.sE*k/1.4*ph,0,0,6.283*ringT);x.stroke()});
      x.globalAlpha=ringT;x.fillStyle=cols[gi];x.font='500 12px "IBM Plex Sans", sans-serif';
      const lx=X(gr.mL)+(gr.mL>1?gr.sL*2.6/8*pw+6:0),ly=Y(gr.mE)-(gr.mL>1?-4:gr.sE*2.4/1.4*ph+9);
      x.textAlign=gr.mL>1?'left':'center';x.fillText(gr.name,lx,ly);x.globalAlpha=1})}
    if(W>520){x.globalAlpha=ringT*.9;x.fillStyle=mut;x.textAlign='right';x.font='11px "IBM Plex Sans", sans-serif';x.fillText('stars born in the disk',X(3.9),Y(-1.62));x.globalAlpha=1}
  };
  new ResizeObserver(()=>{size();drawELZ()}).observe(c);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',drawELZ);
  new MutationObserver(drawELZ).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();

/* ===== §3 summaries + scale links ===== */
const plist=$('#papers-list');
// keeps the button's word (summary or abstract) when toggling
const setOpen=(li,o)=>{const b=li.querySelector('.abs-t');li.classList.toggle('open',o);if(!b)return;
  const kind=/abstract/i.test(b.textContent)?'abstract':'summary';b.setAttribute('aria-expanded',o);b.textContent=(o?'Hide ':'Show ')+kind};
plist.addEventListener('click',e=>{
  const b=e.target.closest('.abs-t');
  if(b){const li=b.closest('.ax'),o=!li.classList.contains('open');
    // only one open at a time: opening this one closes the others
    plist.querySelectorAll(':scope > .ax.open').forEach(x=>{if(x!==li)setOpen(x,false)});
    setOpen(li,o);return}
  const a=e.target.closest('.meta a[href^="#r-"]');if(!a)return;
  const r=document.querySelector(a.getAttribute('href'));if(!r)return;r.classList.remove('flash');void r.offsetWidth;setTimeout(()=>r.classList.add('flash'),450)});
let typeIds=()=>{};

/* ===== §3 papers, synced from INSPIRE on every visit =====
   INSPIRE supplies the list, authors, journal refs and citations. An entry already in index.html
   with the same data-arxiv keeps its hand-written title and summary (author names, including
   Sam's, are always shown as published); data-manual entries
   (not on INSPIRE) are merged in by data-date. If INSPIRE can't be reached the HTML list stays. */
const INSPIRE_ID='1735317';
const JOURNALS={'Phys.Rev.D':['Phys. Rev. D','PRD'],'Phys.Rev.Lett.':['Phys. Rev. Lett.','PRL'],'JHEP':['JHEP','JHEP'],'JCAP':['JCAP','JCAP'],
  'Astrophys.J.':['Astrophys. J.','ApJ'],'Mon.Not.Roy.Astron.Soc.':['MNRAS','MNRAS'],'Phys.Lett.B':['Phys. Lett. B','PLB'],'Eur.Phys.J.C':['Eur. Phys. J. C','EPJC']};
let AUTO={};  // assets/summaries.json, written daily by .github/workflows/summaries.yml
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const el=(t,cls,txt)=>{const e=document.createElement(t);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const link=(href,txt,cls)=>{const a=el('a',cls,txt);a.href=href;if(!href.startsWith('#')){a.target='_blank';a.rel='noopener'}return a};
const isSelf=a=>(a.record?.$ref||'').endsWith('/'+INSPIRE_ID);
const fullName=a=>a.full_name.split(', ').reverse().join(' ');
const initials=f=>f.split(' ').map(w=>w.split('-').map(p=>p[0]+'.').join('-')).join(' ');
const shortName=a=>{const [last,first]=a.full_name.split(', ');return first?initials(first)+' '+last:last};

function fromInspire(h){const m=h.metadata,ax=m.arxiv_eprints?.[0],pub=(m.publication_info||[]).find(p=>p.journal_title);
  const doi=m.dois?.[0]?.value,date=m.earliest_date||'',j=pub&&(JOURNALS[pub.journal_title]||[pub.journal_title.replace(/\.(?=\S)/g,'. '),pub.journal_title]);
  const coll=m.collaborations?.[0]?.value,many=(m.author_count||0)>15;
  return {arxiv:ax?.value,cat:ax?.categories?.[0]||'',date,doi,recid:h.id,cites:m.citation_count||0,
    title:m.titles[0].title,abstract:(m.abstracts||[]).find(a=>a.source==='arXiv')?.value||m.abstracts?.[0]?.value||'',
    authors:coll&&many?[{text:coll+' Collaboration'}]:m.authors.slice(0,many?10:99).map(a=>({text:fullName(a),short:shortName(a),self:isSelf(a)})).concat(many?[{text:'et al.'}]:[]),
    journal:j&&{name:j[0],short:j[1],vol:pub.journal_volume||'',page:pub.artid||pub.page_start||'',year:pub.year||date.slice(0,4)}}}

function paperLi(p,old){const li=el('li','ax'),body=el('div');li.dataset.arxiv=p.arxiv||'';li.append(el('span','k'),body);
  const aid=el('div','aid'),id=p.arxiv?'arXiv:'+p.arxiv:'INSPIRE:'+p.recid,idA=link(p.arxiv?'https://arxiv.org/abs/'+p.arxiv:'https://inspirehep.net/literature/'+p.recid,id,'id');
  idA.dataset.id=id;const lk=el('span');lk.append('[');
  const ls=[p.arxiv&&link('https://arxiv.org/pdf/'+p.arxiv,'pdf'),p.doi&&link('https://doi.org/'+p.doi,'journal'),link('https://inspirehep.net/literature/'+p.recid,'inspire')].filter(Boolean);
  ls.forEach((a,i)=>{if(i)lk.append(', ');lk.append(a)});lk.append(']');aid.append(idA,lk);if(p.cat)aid.append(el('span','cat',p.cat));
  const h=old?.querySelector('h3')?.cloneNode(true)||el('h3','tex',p.title);
  const au=el('p','au');p.authors.forEach((a,i)=>{if(i)au.append(', ');au.append(a.self?el('b',null,a.text):a.text)});
  const meta=el('dl','meta'),row=(k,v)=>{meta.append(el('dt',null,k));const d=el('dd');d.append(...v);meta.append(d)};
  if(p.journal){const n=el('i',null,p.journal.name);row('Journal-ref',[n,` ${p.journal.vol}${p.journal.page?', '+p.journal.page:''} (${p.journal.year})`])}
  else row('Status',[`arXiv preprint (${MONTHS[+p.date.slice(5,7)-1]||''} ${p.date.slice(0,4)})`]);
  if(p.cites)row('Citations',[link('https://inspirehep.net/literature?q=refersto%3Arecid%3A'+p.recid,p.cites+' on INSPIRE')]);
  const auto=AUTO[p.arxiv||'inspire:'+p.recid];
  body.append(aid,h,au,meta);
  const abs=old?.querySelector('.abs');
  if(abs||auto||p.abstract){const b=el('button','abs-t','Show summary');b.type='button';b.setAttribute('aria-expanded','false');
    let box=abs?.cloneNode(true);
    if(!box&&auto){box=el('div','abs');const w=el('div'),para=el('p');para.append(auto.summary);w.append(para);box.append(w)}
    if(!box){box=el('div','abs');const w=el('div'),para=el('p','tex');para.append(el('b',null,'Abstract.'),' '+p.abstract);w.append(para);box.append(w);b.textContent='Show abstract'}
    body.append(b,box)}
  return li}

function cvRow(p,old){if(old)return old;const r=el('div','cv-row');r.dataset.arxiv=p.arxiv||'';
  r.append(el('b','tex',p.title),el('span','d',p.journal?`${p.journal.short} ${p.journal.year}`:`arXiv ${p.date.slice(0,4)}`),el('p',null,p.authors.map(a=>a.short||a.text).join(', ')));return r}

function renderTex(root){if(!root.querySelector('.tex')||!/\$/.test(root.textContent))return;
  const go=()=>root.querySelectorAll('.tex').forEach(n=>renderMathInElement(n,{delimiters:[{left:'$',right:'$',display:false}],throwOnError:false}));
  if(window.renderMathInElement)return go();
  const css=el('link');css.rel='stylesheet';css.href='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';document.head.append(css);
  const load=src=>new Promise((ok,no)=>{const s=el('script');s.src=src;s.onload=ok;s.onerror=no;document.head.append(s)});
  load('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js').then(()=>load('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js')).then(go).catch(()=>{})}

(async()=>{try{
  const f='titles,abstracts,authors.full_name,authors.record,author_count,collaborations,arxiv_eprints,publication_info,dois,earliest_date,citation_count';
  const [r]=await Promise.all([fetch(`https://inspirehep.net/api/literature?q=authors.recid:${INSPIRE_ID}&sort=mostrecent&size=100&fields=${f}`),
    fetch('assets/summaries.json',{cache:'no-cache'}).then(x=>x.ok?x.json():{}).then(j=>{AUTO=j}).catch(()=>{})]);
  if(!r.ok)return;const hits=(await r.json()).hits.hits;if(!hits.length)return;
  const ps=hits.map(fromInspire);
  const merge=(box,make)=>{const old={},manual=[];box.querySelectorAll(':scope > [data-arxiv],:scope > [data-manual]').forEach(n=>n.hasAttribute('data-manual')?manual.push(n):old[n.dataset.arxiv]=n);
    const items=ps.map(p=>({date:p.date,node:make(p,old[p.arxiv])})).concat(manual.map(n=>({date:n.dataset.date||'',node:n})));
    items.sort((a,b)=>b.date.localeCompare(a.date));box.replaceChildren(...items.map(i=>i.node));return items.length};
  const n=merge(plist,paperLi);plist.querySelectorAll(':scope > .ax > .k').forEach((k,i)=>k.textContent=`[${i+1}]`);
  merge($('#cv-pubs'),cvRow);
  renderTex(plist);renderTex($('#cv-pubs'));
  const sync=$('#papers-sync');sync.replaceChildren(`${n} papers, synced from `,link('https://inspirehep.net/authors/'+INSPIRE_ID,'INSPIRE'),` on ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}.`);
  typeIds(plist.querySelectorAll('.aid .id'));
}catch(_){}})();

/* ===== GSAP choreography ===== */
if(!hasG||RM)return;
gsap.registerPlugin(ScrollTrigger);
// the hero's entrance is a CSS animation (style.css, "hero intro"): it runs on the compositor, so it
// stays smooth while the 3D galaxy is still loading and setting up on the main thread

// the scale axis fills as you scroll down the ladder; each figure draws as it arrives
gsap.fromTo('#ladder',{'--p':0},{'--p':1,ease:'none',scrollTrigger:{trigger:'#ladder',start:'top 70%',end:'bottom 60%',scrub:.4}});
document.querySelectorAll('.rung').forEach(row=>{
  const paths=row.querySelectorAll('.draw');
  const tl2=gsap.timeline({scrollTrigger:{trigger:row,start:'top 78%'}});
  tl2.from(row.querySelector('.scale'),{x:-14,opacity:.2,duration:.6,ease:'power2.out'});
  if(paths.length)tl2.fromTo(paths,{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDashoffset:0,duration:1.3,ease:'power2.inOut',stagger:.1},'<');
});
const mtl=gsap.timeline({scrollTrigger:{trigger:'#mapc',start:'top 75%'}});
mtl.from('#scanr',{attr:{width:0},duration:1.4,ease:'power2.inOut'})
   .fromTo('#collab-links path',{strokeDashoffset:1},{strokeDashoffset:0,duration:1.2,ease:'power2.inOut',stagger:.15},'-=.4')
   .from('.pin',{scale:0,duration:.6,ease:'back.out(3)',stagger:.12},'-=.5');

// Fig. 2: components peel out of the data panel as you scroll
const panels=gsap.utils.toArray('#decomp .panel');
const shift=i=>()=>{const a=panels[0].getBoundingClientRect(),b=panels[i].getBoundingClientRect();return a.left-b.left};
const dtl=gsap.timeline({scrollTrigger:{trigger:'#decomp',start:'top 82%',end:'top 35%',scrub:.6,invalidateOnRefresh:true}});
panels.slice(1).forEach((pn,k)=>{const i=k+1;
  dtl.fromTo(pn.querySelector('.sq'),{x:shift(i),opacity:0},{x:0,opacity:1,ease:'power2.out',duration:1},k*.25);
  dtl.fromTo([pn.querySelector('.op'),pn.querySelector('.lbl')],{opacity:0},{opacity:1,duration:.4},k*.25+.6);
});
dtl.fromTo('#decomp .ex canvas',{boxShadow:'0 0 0 0 rgba(255,138,76,0)'},{boxShadow:'0 0 0 3px rgba(255,138,76,.7)',duration:.4},'>-0.1');

// Fig. 3: groups light up, then flow-density contours draw
gsap.fromTo({v:0},{v:0},{v:1,ease:'none',scrollTrigger:{trigger:'#elz',start:'top 80%',end:'bottom 55%',scrub:.5},onUpdate(){elzP=this.targets()[0].v;drawELZ()}});
elzP=0;drawELZ();

// arXiv IDs type in, like a fresh listing
typeIds=els=>{els.forEach(el=>{const full=el.dataset.id;
  ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter(){const o={n:0};el.textContent='';
    gsap.to(o,{n:full.length,duration:.04*full.length,ease:'none',onUpdate(){el.textContent=full.slice(0,Math.round(o.n))}})}})});ScrollTrigger.refresh()};
typeIds(document.querySelectorAll('.aid .id'));
})();
