"use strict";
const $=s=>document.querySelector(s);
/* ---------- sound ---------- */
let AC=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type,g,when,slide){if(!S.sound)return;const a=ac();if(!a)return;const t0=a.currentTime+(when||0);const o=a.createOscillator(),gn=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+d);gn.gain.setValueAtTime(g||.04,t0);gn.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(gn).connect(a.destination);o.start(t0);o.stop(t0+d+.03)}
const SFX={
 tap:()=>tone(420+Math.min(combo,100)*5,.05,'triangle',.06),
 buy:()=>{tone(660,.07,'square',.025);tone(990,.1,'square',.025,.06)},
 horn:()=>{tone(233,.38,'sawtooth',.03);tone(294,.38,'sawtooth',.03);[1046,1318,1568].forEach((f,i)=>tone(f,.12,'triangle',.035,.3+i*.06))},
 gold:()=>[523,659,784,1046,1318].forEach((f,i)=>tone(f,.14,'square',.03,i*.05)),
 big:()=>[392,523,659,784,1046].forEach((f,i)=>tone(f,.22,'triangle',.05,i*.09)),
 err:()=>tone(150,.12,'square',.03),
};
const buzz=ms=>{if(S.haptic&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};

/* ---------- scenery ---------- */
const THEMES=[
 {sky:['#5ab8ff','#c4e9ff'],gr:'#5aa04c',road:'#3a3d45',line:'#ffd34d',far:['city','#8fb3d4'],mid:['hills','#69b562'],near:['trees','#2f7a3a']},
 {sky:['#6cc3ff','#fff0c4'],gr:'#c9a94a',road:'#44464d',line:'#ffffff',far:['hills','#9cc58a'],mid:['fields','#e2c25a'],near:['fence','#7a5231']},
 {sky:['#4e8fd9','#d2e4f7'],gr:'#3f7a4e',road:'#36383f',line:'#ffd34d',far:['peaks','#7b8fb0',1],mid:['pines','#2f6b4a'],near:['pines','#1f4f36']},
 {sky:['#ff9157','#ffe2a6'],gr:'#e2b66f',road:'#4a4038',line:'#ffffff',far:['mesa','#c46a3d'],mid:['hills','#e0a35e'],near:['cactus','#3f7f43']},
 {sky:['#93badf','#eef6ff'],gr:'#f2f7fd',road:'#8aa3bb',line:'#2f6aa3',far:['peaks','#a9bfd8',1],mid:['hills','#e2edf9'],near:['pines','#2c5a52',1]},
 {sky:['#0d0726','#3a1458'],gr:'#1a1030',road:'#1b1b29',line:'#3ff0ff',far:['city','#2a1a4f',1],mid:['city','#1c113d',1],near:['lamps','#ff3fa4'],night:1},
 {sky:['#010208','#141a2e'],gr:'#9fa2ad',road:'#5b5e69',line:'#ffb020',far:['hills','#4d5163'],mid:['craters','#868a99'],near:['beacons','#c9ccd6'],night:1,noTraffic:1,planet:'earth'},
 {sky:['#5a1e12','#e08a5a'],gr:'#b5552e',road:'#5a3326',line:'#ffd34d',far:['mesa','#8c3b22'],mid:['craters','#a84a2a'],near:['domes','#e6e9ef'],noTraffic:1},
 {sky:['#000005','#0d1022'],gr:'#3a3540',road:'#4a4450',line:'#3ff0ff',far:['rocks','#5a5466'],mid:['craters','#6b6475'],near:['beacons','#c9ccd6'],night:1,noTraffic:1,planet:'gas'},
 {sky:['#12002a','#5b1a7a'],gr:'#1c0f33',road:'#231740',line:'#ff3fa4',far:['city','#2a1450',1],mid:['city','#1a0c38',1],near:['lamps','#3ff0ff'],night:1,noTraffic:1,planet:'gas'},
];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const svgW=(W,H,inner)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${inner}</svg>`;
function wave(W,H,base,parts,col,extra){let d=`M0 ${H}`;for(let x=0;x<=W;x+=8){let y=base;for(const[a,k,p]of parts)y-=a*Math.sin(2*Math.PI*k*x/W+p);d+=` L${x} ${y.toFixed(1)}`}return `<path d="${d} L${W} ${H}Z" fill="${col}" ${extra||''}/>`}
function genLayer(spec,kind,seed){
 const [type,c,flag]=spec;const r=rng(seed);
 const W=kind==='near'?260:400,H=kind==='near'?60:100;let s='';
 if(type==='city'){let x=0;while(x<W){const w=14+r()*26|0,h=(kind==='far'?30:20)+r()*(kind==='far'?65:55),ww=Math.min(w,W-x);
   s+=`<rect x="${x}" y="${(H-h).toFixed(1)}" width="${ww}" height="${H}" fill="${c}"/>`;
   for(let wy=H-h+6;wy<H-6;wy+=9)for(let wx=x+3;wx<x+ww-4;wx+=7)if(r()<(flag?.45:.35))s+=`<rect x="${wx}" y="${wy.toFixed(1)}" width="3" height="4" fill="${flag?(r()<.5?'#ff3fa4':'#3ff0ff'):'#fff'}" opacity="${flag?.85:.3}"/>`;
   x+=ww+(r()*5|0)}}
 else if(type==='hills')s=wave(W,H,H*.5,[[10,2,r()*6],[6,5,r()*6],[3,9,r()*6]],c);
 else if(type==='fields'){s=wave(W,H,H*.55,[[8,2,1],[4,6,2]],c);for(let k=0;k<4;k++)s+=wave(W,H,H*(.68+k*.08),[[6-k,2,1],[3,6,2]],'none',`stroke="#00000022" stroke-width="2"`)}
 else if(type==='craters'){s=wave(W,H,H*.5,[[7,2,1],[4,7,3]],c);for(let k=0;k<6;k++){const x=20+k*62+r()*20;s+=`<ellipse cx="${x.toFixed(0)}" cy="${(H*.72+r()*H*.15).toFixed(0)}" rx="${(8+r()*12).toFixed(0)}" ry="${(3+r()*3).toFixed(0)}" fill="#00000033"/>`}}
 else if(type==='peaks'){const pts=[[0,H*.72]];let x=0;while(x<W-50){const pw=50+r()*60,px=x+pw/2,py=H*(.08+r()*.3);pts.push([px,py]);x=Math.min(x+pw,W);pts.push([x,H*(.5+r()*.2)])}
   pts[pts.length-1]=[W,H*.72];
   s=`<path d="M0 ${H} ${pts.map(p=>`L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')} L${W} ${H}Z" fill="${c}"/>`;
   if(flag)for(let k=1;k<pts.length-1;k+=2){const[p,a,b]=[pts[k],pts[k-1],pts[k+1]],l=(q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];const A=l(a,.3),B=l(b,.3);s+=`<path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${A[0].toFixed(1)} ${A[1].toFixed(1)} L${((A[0]+p[0])/2).toFixed(1)} ${(A[1]-3).toFixed(1)} L${p[0].toFixed(1)} ${(A[1]+2).toFixed(1)} L${((B[0]+p[0])/2).toFixed(1)} ${(B[1]-3).toFixed(1)} L${B[0].toFixed(1)} ${B[1].toFixed(1)}Z" fill="#fff"/>`}}
 else if(type==='mesa'){const base=H*.8;let d=`M0 ${H} L0 ${base}`,x=0;while(x<W-60){x+=10+r()*30;const top=H*(.2+r()*.3),w=30+r()*50;d+=` L${x.toFixed(0)} ${base} L${(x+8).toFixed(0)} ${top.toFixed(0)} L${(x+8+w).toFixed(0)} ${top.toFixed(0)} L${(x+16+w).toFixed(0)} ${base}`;x+=16+w}d+=` L${W} ${base} L${W} ${H}Z`;s=`<path d="${d}" fill="${c}"/><rect y="${base-1}" width="${W}" height="${H}" fill="${c}"/>`}
 else if(type==='pines'){const dense=kind==='mid';if(dense)s+=`<rect y="${H-10}" width="${W}" height="10" fill="${c}"/>`;
   for(let x=8;x<W-8;x+=(dense?9:34)*(.7+r()*.6)){const h=(dense?.35:.75)*H+r()*(dense?.4:.25)*H,w=h*.45,b=H-(dense?4:0);
    if(!dense)s+=`<rect x="${(x-2).toFixed(1)}" y="${(b-h*.18).toFixed(1)}" width="4" height="${(h*.18).toFixed(1)}" fill="#4a3424"/>`;
    for(let t=0;t<3;t++){const yb=b-h*.15-t*h*.25,yt=yb-h*.42;s+=`<path d="M${(x-w/2+t*w*.1).toFixed(1)} ${yb.toFixed(1)} L${x.toFixed(1)} ${yt.toFixed(1)} L${(x+w/2-t*w*.1).toFixed(1)} ${yb.toFixed(1)}Z" fill="${c}"/>`}
    if(flag)s+=`<path d="M${(x-w*.15).toFixed(1)} ${(b-h*.75).toFixed(1)} L${x.toFixed(1)} ${(b-h*.92).toFixed(1)} L${(x+w*.15).toFixed(1)} ${(b-h*.75).toFixed(1)}Z" fill="#fff"/>`}}
 else if(type==='trees'){for(let x=14;x<W-14;x+=40+r()*40){const h=H*(.55+r()*.35),rr=h*.33;s+=`<rect x="${(x-2.5).toFixed(1)}" y="${(H-h*.45).toFixed(1)}" width="5" height="${(h*.45).toFixed(1)}" fill="#5b4030"/><circle cx="${x.toFixed(1)}" cy="${(H-h+rr).toFixed(1)}" r="${rr.toFixed(1)}" fill="${c}"/><circle cx="${(x-rr*.5).toFixed(1)}" cy="${(H-h+rr*1.5).toFixed(1)}" r="${(rr*.75).toFixed(1)}" fill="${c}"/>`}
   for(let x=120;x<W;x+=260)s+=`<rect x="${x}" y="${H*.25}" width="3" height="${H*.75}" fill="#666"/><rect x="${x-10}" y="${H*.2}" width="40" height="${H*.22}" rx="2" fill="#2e7d4f"/><rect x="${x-8}" y="${H*.24}" width="36" height="${H*.14}" fill="none" stroke="#fff" stroke-width="1"/>`}
 else if(type==='fence'){s+=`<rect y="${H*.55}" width="${W}" height="3" fill="${c}"/><rect y="${H*.75}" width="${W}" height="3" fill="${c}"/>`;for(let x=6;x<W;x+=26)s+=`<rect x="${x}" y="${H*.45}" width="4" height="${H*.55}" fill="${c}"/>`;s+=`<circle cx="140" cy="${H*.3}" r="${H*.25}" fill="#3d7a3a"/><rect x="138" y="${H*.45}" width="4" height="${H*.55}" fill="#5b4030"/>`}
 else if(type==='cactus'){for(let x=20;x<W-20;x+=60+r()*70){const h=H*(.5+r()*.45),w=7;s+=`<rect x="${x-w/2}" y="${(H-h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="3.5" fill="${c}"/><path d="M${x-w/2} ${(H-h*.45).toFixed(1)} h-7 v-${(h*.25).toFixed(1)}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${x+w/2} ${(H-h*.6).toFixed(1)} h7 v-${(h*.2).toFixed(1)}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`;s+=`<ellipse cx="${(x+30).toFixed(0)}" cy="${H-3}" rx="9" ry="4" fill="#a8763f"/>`}}
 else if(type==='lamps'){for(let x=30;x<W;x+=130){s+=`<circle cx="${x+10}" cy="${H*.12}" r="14" fill="${c}" opacity=".25"/><rect x="${x}" y="${H*.1}" width="3" height="${H*.9}" fill="#3b3550"/><rect x="${x}" y="${H*.08}" width="16" height="3" fill="#3b3550"/><circle cx="${x+14}" cy="${H*.12}" r="3.5" fill="${c}"/>`}
   s+=`<rect x="70" y="${H*.15}" width="44" height="${H*.3}" rx="3" fill="none" stroke="#3ff0ff" stroke-width="2"/><rect x="190" y="${H*.25}" width="34" height="${H*.22}" rx="3" fill="none" stroke="#ff3fa4" stroke-width="2"/>`}
 else if(type==='beacons'){for(let x=40;x<W;x+=110)s+=`<rect x="${x}" y="${H*.35}" width="2" height="${H*.65}" fill="${c}"/><circle cx="${x+1}" cy="${H*.33}" r="3" fill="#ff4d4d"/><circle cx="${x+1}" cy="${H*.33}" r="8" fill="#ff4d4d" opacity=".2"/>`;s+=`<rect x="170" y="${H*.55}" width="30" height="${H*.45}" rx="4" fill="#d8dbe3"/><path d="M165 ${H*.55} q20 -18 40 0z" fill="#e8ebf2"/>`}
 else if(type==='domes'){for(let x=30;x<W;x+=120){const r0=H*.4;s+=`<path d="M${x-r0} ${H} A${r0} ${r0} 0 0 1 ${x+r0} ${H}Z" fill="${c}" opacity=".92"/><path d="M${(x-r0*.75).toFixed(1)} ${(H-r0*.45).toFixed(1)} H${(x+r0*.75).toFixed(1)}" stroke="#7dd3fc" stroke-width="2" opacity=".8"/><rect x="${(x+r0+12).toFixed(1)}" y="${H*.3}" width="2" height="${H*.7}" fill="#888"/><circle cx="${(x+r0+13).toFixed(1)}" cy="${H*.28}" r="3" fill="#ff4d4d"/>`}}
 else if(type==='rocks'){for(let k=0;k<8;k++){const cx=20+k*44+r()*20,cy=15+r()*55,rr=4+r()*12;let d='';for(let a=0;a<7;a++){const ang=a/7*Math.PI*2,q=rr*(.7+r()*.5);d+=(a?'L':'M')+(cx+Math.cos(ang)*q).toFixed(1)+' '+(cy+Math.sin(ang)*q).toFixed(1)}s+=`<path d="${d}Z" fill="${c}"/>`}}
 return `url("data:image/svg+xml,${encodeURIComponent(svgW(W,H,s))}")`;
}

/* ---------- truck art ---------- */
const TCOL=['#e63946','#f4a261','#2a9d8f','#3d7cc9','#e76f51','#7b4fbf','#f2c94c','#d62828','#e5e7eb','#2a1650','#cfd6e2','#2b3d5c','#14121f'];
const POD={9:['#1f1235','#ff3fa4','#3ff0ff'],10:['#e4e9f1','#3ff0ff','#3ff0ff'],11:['#22324a','#ffb020','#ff7a1a'],12:['#0b0b12','#facc15','#c084fc']};
function wheel(x,glow){return `<g class="wh" style="transform-origin:${x}px 50px"><circle cx="${x}" cy="50" r="9" fill="#1a1a1a"/><circle cx="${x}" cy="50" r="4.2" fill="${glow||'#b8bec9'}"/><rect x="${x-.8}" y="42.5" width="1.6" height="15" fill="#444"/></g>`}
function beam(x,y){return `<path class="beam" d="M${x} ${y} L${x+120} ${y-14} L${x+120} ${y+18}Z" fill="url(#bm)"/>`}
const DEFS=`<defs><linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#fff6b0" stop-opacity=".7"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".5" stop-color="#aab2bf"/><stop offset="1" stop-color="#e3e7ee"/></linearGradient></defs>`;
function cab(x,col,style){
 const win=style==='auto'?`<path d="M${x+22} 14 H${x+28} L${x+39} 27 H${x+22}Z" fill="#111"/><rect x="${x+23}" y="20" width="14" height="2" fill="#3ff0ff"/>`:style==='hyper'?`<path d="M${x+18} 15 H${x+30} L${x+40} 27 H${x+18}Z" fill="#ff3fa4" opacity=".7"/>`:`<path d="M${x+24} 14 H${x+28} L${x+38} 26 H${x+24}Z" fill="#9fd6ff"/>`;
 const body=style==='hyper'?`<path d="M${x} 46 V20 Q${x} 10 ${x+14} 10 H${x+28} Q${x+46} 22 ${x+46} 38 V46Z" fill="${col}"/>`:`<path d="M${x} 46 V18 Q${x} 10 ${x+8} 10 H${x+27} L${x+40} 26 Q${x+45} 28 ${x+45} 34 V46Z" fill="${col}"/>`;
 return beam(x+44,32)+body+win+`<rect x="${x+4}" y="${style==='hyper'?6:1}" width="4" height="13" rx="1" fill="#9aa1ab"/><rect x="${x+40}" y="40" width="7" height="7" rx="1" fill="#d5d9e0"/><rect x="${x+41}" y="30" width="4" height="4" rx="1" fill="#fff6b0"/><rect x="${x+10}" y="30" width="10" height="2" fill="#0003"/>`;
}
function truckSVG(t){
 const c=TCOL[t];let inner,W;
 if(t===0){W=104;inner=beam(98,32)+`<path d="M4 46 V30 H50 V14 Q50 12 53 12 H70 L84 28 Q100 29 100 35 V46Z" fill="${c}"/><path d="M55 16 H68 L79 28 H55Z" fill="#9fd6ff"/><rect x="6" y="26" width="42" height="4" fill="#0003"/><rect x="97" y="31" width="4" height="4" fill="#fff6b0"/><rect x="10" y="20" width="16" height="10" rx="2" fill="#a0703f"/><rect x="28" y="22" width="14" height="8" rx="2" fill="#c48a4c"/>`+wheel(24)+wheel(80);}
 else if(t===1){W=104;inner=beam(98,32)+`<rect x="4" y="6" width="62" height="40" rx="3" fill="#f1f1f1"/><rect x="4" y="30" width="62" height="5" fill="${c}"/><text x="35" y="24" font-family="Impact,Arial Black,sans-serif" font-size="9" text-anchor="middle" fill="${c}">HAUL</text><path d="M66 46 V18 H82 L96 31 Q100 32 100 37 V46Z" fill="${c}"/><path d="M70 21 H81 L91 31 H70Z" fill="#9fd6ff"/><rect x="96" y="33" width="4" height="4" fill="#fff6b0"/>`+wheel(22)+wheel(84);}
 else{
  const L=t===7?150:t>=9?108:100;W=L+52;const cx=L+6;let tr='',xw='';
  if(t===2||t===8){const sc=t===8?'#3ff0ff':c;tr=`<rect x="2" y="4" width="${L}" height="37" rx="2" fill="${t===8?'#f4f6fa':'#e9ecf1'}"/><rect x="2" y="30" width="${L}" height="4" fill="${sc}"/><text x="${L/2+2}" y="23" font-family="Impact,Arial Black,sans-serif" font-size="11" text-anchor="middle" fill="${t===8?'#1b1b29':c}">${t===8?'AUTOFREIGHT':'HAUL EMPIRE'}</text>`}
  else if(t===3){tr=`<rect x="2" y="4" width="${L}" height="37" rx="2" fill="#f7f9fc"/><rect x="${L-8}" y="8" width="10" height="22" rx="2" fill="#cfd5de"/><rect x="${L-6}" y="11" width="6" height="2" fill="#888"/><rect x="${L-6}" y="15" width="6" height="2" fill="#888"/><text x="${L/2-4}" y="25" font-family="Impact,Arial Black,sans-serif" font-size="11" text-anchor="middle" fill="${c}">❄ FRESH</text>`}
  else if(t===4){tr=`<rect x="2" y="39" width="${L}" height="4" fill="#333"/><rect x="2" y="9" width="${L}" height="30" rx="15" fill="url(#chrome)"/><path d="M${L/2-6} 24 l6 -6 l6 6 l-6 6z" fill="#e63946"/><rect x="10" y="5" width="${L-16}" height="3" rx="1" fill="#8a929e"/>`}
  else if(t===5){tr=`<rect x="2" y="40" width="${L}" height="3" fill="#555"/><rect x="2" y="22" width="${L}" height="2.5" fill="#666"/><rect x="2" y="4" width="3" height="39" fill="#666"/><rect x="${L-1}" y="4" width="3" height="39" fill="#666"/><rect x="${L/2}" y="4" width="2.5" height="39" fill="#666"/>`;
   const cc=['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7','#f97316'];[[8,8],[54,8],[8,26],[54,26]].forEach(([x,y],k)=>{tr+=`<path d="M${x} ${y+12} V${y+6} Q${x} ${y+3} ${x+6} ${y+3} L${x+14} ${y} H${x+28} L${x+36} ${y+5} Q${x+40} ${y+6} ${x+40} ${y+9} V${y+12}Z" fill="${cc[k]}"/><rect x="${x+16}" y="${y+2}" width="10" height="4" fill="#9fd6ff"/>`})}
  else if(t===6){tr=`<rect x="2" y="36" width="${L}" height="6" fill="#333"/><rect x="10" y="12" width="56" height="24" rx="3" fill="#f2b705"/><rect x="18" y="16" width="20" height="12" fill="#9fd6ff"/><path d="M60 16 L86 2 L94 8 L72 22Z" fill="#f2b705"/><path d="M90 6 L96 26 L86 26Z" fill="#555"/><rect x="8" y="30" width="62" height="6" rx="3" fill="#222"/><path d="M2 36 h${L}" stroke="#ff7a1a" stroke-width="2" stroke-dasharray="6 6"/>`}
  else if(t===7){const h=L/2-3;tr=`<rect x="2" y="4" width="${h}" height="37" rx="2" fill="#e9ecf1"/><rect x="${h+6}" y="4" width="${h}" height="37" rx="2" fill="#e9ecf1"/><rect x="2" y="30" width="${L}" height="4" fill="${c}"/><rect x="${h+2}" y="38" width="4" height="4" fill="#333"/><text x="${h/2+2}" y="23" font-family="Impact,Arial Black,sans-serif" font-size="10" text-anchor="middle" fill="${c}">ROAD</text><text x="${h*1.5+6}" y="23" font-family="Impact,Arial Black,sans-serif" font-size="10" text-anchor="middle" fill="${c}">TRAIN</text>`;xw=wheel(h-14)+wheel(h+20)}
  else if(t>=9){const P=POD[t];tr=`<rect x="2" y="8" width="${L}" height="33" rx="16" fill="${P[0]}"/><rect x="10" y="22" width="${L-16}" height="3" rx="1.5" fill="${P[1]}"/><rect x="10" y="22" width="${L-16}" height="3" rx="1.5" fill="${P[1]}" opacity=".5" style="filter:blur(2px)"/><circle cx="${L-12}" cy="16" r="3" fill="${P[2]}"/>`;
   if(t===10)tr+=`<rect x="6" y="12" width="${L-30}" height="6" rx="3" fill="#9fd6ff" opacity=".6"/><path d="M6 47 H${L+44}" stroke="#3ff0ff" stroke-width="2.5" opacity=".75"/>`;
   if(t===11)tr+=`<path d="M12 10 L-6 0 L2 17Z M12 39 L-6 49 L2 32Z" fill="#3a4c6a"/><path class="flame" d="M2 18 L-26 24.5 L2 31Z" fill="#ffb020"/><path class="flame" d="M2 21 L-14 24.5 L2 28Z" fill="#fff3b0"/>`;
   if(t===12)tr+=`<ellipse class="ring" cx="${L/2}" cy="24" rx="${L/2+14}" ry="10" fill="none" stroke="#c084fc" stroke-width="2" opacity=".85"/><ellipse class="ring r2" cx="${L/2}" cy="24" rx="${L/2+28}" ry="16" fill="none" stroke="#facc15" stroke-width="1.5" opacity=".55"/>`;}
  const g=t>=9?POD[t][1]:t===8?'#3ff0ff':null;
  inner=`<rect x="2" y="43" width="${L+48}" height="4" fill="#2b2b2b"/>`+tr+cab(cx,c==='#e5e7eb'?'#d9dde4':c,t===8?'auto':t>=9?'hyper':'')+wheel(16,g)+wheel(35,g)+xw+wheel(cx+15,g)+wheel(cx+37,g);
 }
 return `<svg viewBox="0 0 ${W} 62" xmlns="http://www.w3.org/2000/svg">${DEFS}${inner}</svg>`;
}
function carSVG(col){return `<svg viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg"><path d="M2 22 V16 Q2 12 8 12 L18 4 H40 L50 12 Q62 12 62 18 V22Z" fill="${col}"/><path d="M21 7 H31 V12 H15Z M34 7 H39 L46 12 H34Z" fill="#9fd6ff"/><rect x="58" y="15" width="4" height="3" fill="#fff6b0"/><circle cx="15" cy="23" r="6" fill="#1a1a1a"/><circle cx="49" cy="23" r="6" fill="#1a1a1a"/><circle cx="15" cy="23" r="2.5" fill="#aaa"/><circle cx="49" cy="23" r="2.5" fill="#aaa"/></svg>`}

