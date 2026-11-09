"use strict";
/* ---------- network map UI ---------- */
let mapView=null,mapSel=null,mapKey='',bestMove=null,bestAt=0;
const loadOf=(r,k)=>(D.sol&&D.sol.load[r+':'+k])||0;
const loadCol=x=>x<.6?'#4ade80':x<.85?'#facc15':'#f87171';
const stars=n=>'●'.repeat(n)+'○'.repeat(4-n);
function viewR(){if(mapView==null||mapView>S.route)mapView=S.route;return mapView}
function arcIncome(r,m,c){const lam=D.lam;return m>lam?c*(m-lam)*D.perm*D.tail:0}

/* every possible network move with its payback, for the "best move" hint and Civil Engineers */
function netMoves(onlyRoads){
 const out=[];
 for(let r=0;r<=S.route;r++){const M=getMap(r);
  for(const ln of M.lanes){const lv=laneLv(r,ln.id);
   if(lv&&lv<roadMax(r))out.push({t:'road',r,ln,cost:roadCost(r,ln),dv:netDelta(()=>{net(r).l[ln.id]=lv+1},()=>{net(r).l[ln.id]=lv})});
   else if(!onlyRoads&&laneOpenable(r,ln))out.push({t:'lane',r,ln,cost:laneOpenCost(r,ln),dv:netDelta(()=>{net(r).l[ln.id]=1},()=>{delete net(r).l[ln.id]})});
  }
  if(!onlyRoads)M.cities.forEach((c,ci)=>{const h=hubAt(r,ci);if(h<NK.hubMax&&(h||cityLinked(r,ci)))out.push({t:'hub',r,ci,cost:hubCost(r,ci),dv:netDelta(()=>{net(r).h[ci]=h+1},()=>{if(h)net(r).h[ci]=h;else delete net(r).h[ci]})})});
 }
 for(const m of out)m.pb=m.dv>0?m.cost/m.dv:Infinity;
 return out.filter(m=>m.dv>0).sort((a,b)=>a.pb-b.pb);
}
function findBest(){const now=performance.now();if(now-bestAt>1500){bestAt=now;bestMove=netMoves()[0]||null}return bestMove}
const moveName=m=>{const C=getMap(m.r).cities;return m.t==='hub'?`${hubAt(m.r,m.ci)?'Upgrade':'Build'} hub in ${C[m.ci].name}`:m.t==='lane'?`Open ${C[m.ln.a].name} ⇄ ${C[m.ln.b].name}`:`Upgrade ${C[m.ln.a].name} ⇄ ${C[m.ln.b].name} to ${ROADS[laneLv(m.r,m.ln.id)]}`};

function mapSVG(r){
 const M=getMap(r),C=M.cities,th=THEMES[r];let s='';
 s+=`<rect x="0" y="0" width="100" height="64" rx="3" fill="${th.gr}"/><rect x="0" y="0" width="100" height="64" rx="3" fill="#0b0d14" opacity=".72"/>`;
 for(const ln of M.lanes){const A=C[ln.a],B=C[ln.b],lv=laneLv(r,ln.id),op=laneOpenable(r,ln),sel=mapSel&&mapSel.t==='lane'&&mapSel.r===r&&mapSel.id===ln.id;
  if(sel)s+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#fff" stroke-width="${2.4+lv*.22}" opacity=".35" stroke-linecap="round"/>`;
  if(lv)s+=`<line data-lc="${ln.id}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${loadCol(loadOf(r,'l'+ln.id))}" stroke-width="${.7+lv*.22}" stroke-linecap="round"/>`;
  else s+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${op?'#aab3c5':'#4a5164'}" stroke-width="${op?.6:.4}" stroke-dasharray="${op?'1.6 1.2':'.6 1.4'}" opacity="${op?.9:.6}"/>`;
  if(lv&&!S.lowfx){const n=Math.max(1,Math.round(loadOf(r,'l'+ln.id)*3)),dur=(ln.d/9).toFixed(1);
   for(let k=0;k<n;k++)s+=`<circle r=".85" fill="#ffd34d" stroke="#000" stroke-width=".25"><animateMotion dur="${dur}s" begin="-${(k*ln.d/9/n).toFixed(2)}s" repeatCount="indefinite" path="M${A.x} ${A.y}L${B.x} ${B.y}L${A.x} ${A.y}"/></circle>`}
  if(surgeOn(r,ln.id))s+=`<text x="${(A.x+B.x)/2}" y="${(A.y+B.y)/2+1.4}" font-size="4.2" text-anchor="middle" class="zap">⚡</text>`;
  s+=`<line data-l="${ln.id}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="transparent" stroke-width="5"/>`;
 }
 C.forEach((c,i)=>{const h=hubAt(r,i),lk=h||cityLinked(r,i),rad=1.9+c.pop*.42,sel=mapSel&&mapSel.t==='city'&&mapSel.r===r&&mapSel.ci===i;
  if(sel)s+=`<circle cx="${c.x}" cy="${c.y}" r="${rad+1.6}" fill="none" stroke="#fff" stroke-width=".5"/>`;
  if(h)s+=`<circle cx="${c.x}" cy="${c.y}" r="${rad+.9}" fill="none" stroke="#ffb020" stroke-width=".55" opacity=".9"/>`;
  s+=`<circle cx="${c.x}" cy="${c.y}" r="${rad}" fill="${h?'#ffb020':lk?'#d6dbe6':'#5b6377'}" stroke="#0b0d14" stroke-width=".5"/>`;
  if(h)s+=`<text x="${c.x}" y="${c.y+1.05}" font-size="2.9" font-weight="800" text-anchor="middle" fill="#2a1700">${i===0?'★':h}</text>`;
  s+=`<text x="${c.x}" y="${c.y+rad+3.2}" font-size="2.6" font-weight="700" text-anchor="middle" fill="${lk?'#e8ecf4':'#8a93a6'}" class="cn">${c.name}</text>`;
  s+=`<circle data-c="${i}" cx="${c.x}" cy="${c.y}" r="4.6" fill="transparent"/>`;
 });
 return `<svg class="map" viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function mapStructKey(){const r=viewR();return 'm'+r+S.route+JSON.stringify(S.net[r]||{})+JSON.stringify(mapSel)+(surge&&Date.now()<surge.until?surge.r+'_'+surge.id:'')+S.lowfx}
function mapBuild(){
 const r=viewR();let h='';
 h+=`<div class="chips">${ROUTES.map((R,i)=>i<=S.route?`<button class="chip2 ${i===r?'on':''}" data-rv="${i}">${R.icon} ${R.name}</button>`:i===S.route+1?`<button class="chip2 lock" data-rsel="${i}">🔒 ${R.name} · ${money(R.cost)}</button>`:'').join('')}</div>`;
 h+=`<div class="netstat"><div class="nsrow"><span>🚛 Fleet in use</span><b data-m="util"></b></div><div class="nbar"><i data-m="ubar"></i></div><div class="nhint" data-m="hint"></div></div>`;
 h+=`<div class="mapwrap">${mapSVG(r)}</div>`;
 h+=`<div class="sheet" data-m="sheet">${sheetHTML()}</div>`;
 h+=`<div class="legend"><span><i style="background:#4ade80"></i>flowing</span><span><i style="background:#facc15"></i>busy</span><span><i style="background:#f87171"></i>congested</span><span><i class="dash"></i>can open</span></div>`;
 return h;
}
function sheetHTML(){
 const s=mapSel;
 if(!s){const b=findBest();
  return `<div class="sh-t">🗺️ ${ROUTES[viewR()].name} <span class="sh-s">×${fmt(ROUTES[viewR()].val)} pay</span></div><p class="sh-p">Tap a <b>city</b> to build a hub, or a <b>dashed lane</b> next to a hub to open it. Trucks only earn on lanes, and congested roads waste trucks.</p>`+
   (b?`<button class="tip" data-bestmove="1">💡 <b>Best value:</b> ${moveName(b)} <span>pays back in ${dur(b.pb)}</span></button>`:'');}
 if(s.t==='region'){const R=ROUTES[s.r];return `<div class="sh-t">${R.icon} ${R.name}</div><p class="sh-p">${R.desc}<br>Lanes here pay <b>×${fmt(R.val)}</b> per truck (vs ×${fmt(ROUTES[S.route].val)} now) and roads carry <b>${fmt(R.cap/ROUTES[S.route].cap)}×</b> more freight.</p><button class="buy wide" data-act="region" data-v="${s.r}"><small>Unlock region</small><b>${money(R.cost)}</b></button>`}
 const r=s.r,M=getMap(r),C=M.cities;
 if(s.t==='lane'){const ln=M.lanes[s.id],lv=laneLv(r,ln.id),A=C[ln.a],B=C[ln.b],m=laneM(r,ln);
  let h=`<div class="sh-t">${A.name} ⇄ ${B.name}${surgeOn(r,ln.id)?' <span class="zapb">⚡ ×3 surge</span>':''}</div><div class="kv"><span>Distance</span><b>${Math.round(ln.d*9)} mi</b><span>Pay per truck</span><b>×${fmt(m)}</b>`;
  if(lv){h+=`<span>Road</span><b>${ROADS[lv-1]} (${lv}/${roadMax(r)})</b><span>Load</span><b data-m="ld"></b><span>Earning</span><b data-m="le" class="g"></b></div>`;
   h+=lv<roadMax(r)?`<button class="buy wide" data-act="road" data-v="${ln.id}"><small>Upgrade to ${ROADS[lv]} · <span data-m="dv"></span></small><b data-m="cost"></b></button>`:`<button class="buy wide done"><small>Fully upgraded</small><b>✓</b></button>`;}
  else{h+=`<span>Capacity</span><b>${money(laneC(r,ln,1)*m*D.perm)}/s</b></div>`;
   h+=laneOpenable(r,ln)?`<button class="buy wide" data-act="lane" data-v="${ln.id}"><small>Open lane · <span data-m="dv"></span></small><b data-m="cost"></b></button>`:`<p class="sh-p">🔒 Build a hub in ${A.name} or ${B.name} first.</p>`;}
  return h;}
 const c=C[s.ci],h=hubAt(r,s.ci),lk=h||cityLinked(r,s.ci),lanes=M.lanes.filter(ln=>ln.a===s.ci||ln.b===s.ci);
 let o=`<div class="sh-t">${c.name}${s.ci===0?' <span class="sh-s">★ HQ</span>':''}</div><div class="kv"><span>Size</span><b>${stars(c.pop)}</b><span>Hub</span><b>${h?`Level ${h}/${NK.hubMax}`:'None'}</b><span>Lanes</span><b>${lanes.filter(l=>laneLv(r,l.id)).length} open / ${lanes.length}</b>`;
 if(h)o+=`<span>Depot earning</span><b data-m="he" class="g"></b>`;
 o+=`</div><p class="sh-p">A hub adds a local depot and makes every lane touching ${c.name} pay +${NK.hubVal*100}% more per level.</p>`;
 o+=h>=NK.hubMax?`<button class="buy wide done"><small>Hub maxed</small><b>✓</b></button>`:lk?`<button class="buy wide" data-act="hub" data-v="${s.ci}"><small>${h?'Upgrade hub':'Build hub'} · <span data-m="dv"></span></small><b data-m="cost"></b></button>`:`<p class="sh-p">🔒 Open a lane to ${c.name} first.</p>`;
 return o;
}
let sheetDvAt=0,sheetDv=0;
function mapUpdate(){
 const q=k=>panel.querySelector(`[data-m="${k}"]`),set=(k,v)=>{const e=q(k);if(e)e.textContent=v},r=viewR();
 const u=D.util;set('util',`${Math.round(u*100)}%`);const ub=q('ubar');if(ub){ub.style.width=(u*100)+'%';ub.style.background=u<.7?'#f87171':u<.9?'#facc15':'#4ade80'}
 const avgLoad=D.arcs.length?D.arcs.reduce((a,x)=>a+loadOf(x.r,x.k),0)/D.arcs.length:0;
 set('hint',!(D.F>0)?'Buy trucks in the Fleet tab — they need lanes to earn.':u<.7?`🚧 Network bottleneck: ${Math.round((1-u)*100)}% of your truck capacity is stuck. Open lanes, build hubs or upgrade red roads.`:u>.93&&avgLoad<.6?'🚚 Fleet bottleneck: roads have spare room. Buy more trucks.':'✅ Fleet and network are well balanced.');
 const M=getMap(r);
 panel.querySelectorAll('[data-lc]').forEach(e=>{e.setAttribute('stroke',loadCol(loadOf(r,'l'+e.dataset.lc)))});
 const s=mapSel;if(!s)return;
 const now=performance.now(),btn=panel.querySelector('.sheet [data-act]');
 if(s.t==='region'){if(btn)btn.classList.toggle('ok',S.cash>=ROUTES[s.r].cost);return}
 let cost=0,mv=null;
 if(s.t==='lane'){const ln=M.lanes[s.id],lv=laneLv(r,ln.id),m=laneM(r,ln);
  if(lv){const c=laneC(r,ln),ld=loadOf(r,'l'+ln.id);set('ld',`${Math.round(ld*100)}%${ld>=.85?' · congested':''}`);set('le',money(arcIncome(r,m,c))+'/s');
   if(lv<roadMax(r)){cost=roadCost(r,ln);mv=()=>netDelta(()=>{net(r).l[ln.id]=lv+1},()=>{net(r).l[ln.id]=lv})}}
  else if(laneOpenable(r,ln)){cost=laneOpenCost(r,ln);mv=()=>netDelta(()=>{net(r).l[ln.id]=1},()=>{delete net(r).l[ln.id]})}}
 else if(s.t==='city'){const h=hubAt(r,s.ci);if(h)set('he',money(arcIncome(r,localM(r),localC(r,s.ci)))+'/s');
  if(h<NK.hubMax&&(h||cityLinked(r,s.ci))){cost=hubCost(r,s.ci);mv=()=>netDelta(()=>{net(r).h[s.ci]=h+1},()=>{if(h)net(r).h[s.ci]=h;else delete net(r).h[s.ci]})}}
 if(mv){if(now-sheetDvAt>700){sheetDvAt=now;sheetDv=mv()}set('dv',`+${money(sheetDv)}/s`);set('cost',money(cost));if(btn)btn.classList.toggle('ok',S.cash>=cost)}
}
function mapAction(act,v,btn){
 const r=viewR(),M=getMap(r);let ok=false,msg='';
 if(act==='region'){return buyRoute(+v,btn)}
 if(act==='lane'){const ln=M.lanes[+v];ok=doOpenLane(r,ln);msg=`🛣️ Lane open: ${M.cities[ln.a].name} ⇄ ${M.cities[ln.b].name}`}
 else if(act==='road'){const ln=M.lanes[+v];ok=doRoad(r,ln);msg=`🚧 Upgraded to ${ROADS[laneLv(r,ln.id)-1]}`}
 else if(act==='hub'){const ci=+v;ok=doHub(r,ci);msg=`🏗️ Hub level ${hubAt(r,ci)} in ${M.cities[ci].name}`}
 if(!ok)return fail(btn);
 SFX.buy();buzz(10);toast(msg,'blue');calc();bestAt=0;render(true);
}
function mapClick(e){
 const t=e.target.closest('[data-l],[data-c]');if(!t)return false;
 const r=viewR();mapSel=t.dataset.l!=null?{t:'lane',r,id:+t.dataset.l}:{t:'city',r,ci:+t.dataset.c};sheetDvAt=0;SFX.tap();render(true);return true;
}
function selectMove(m){mapView=m.r;mapSel=m.t==='hub'?{t:'city',r:m.r,ci:m.ci}:{t:'lane',r:m.r,id:m.ln.id};sheetDvAt=0;render(true)}

/* lane surges: a random lane near your network pays x3 for a while */
let nextSurge=performance.now()+45000;
function surgeTick(t){
 if(t<nextSurge)return;nextSurge=t+(60000+Math.random()*60000)/D.rushMult;
 const r=S.route,M=getMap(r),pool=M.lanes.filter(ln=>laneLv(r,ln.id)||laneOpenable(r,ln));if(!pool.length)return;
 const ln=pool[Math.random()*pool.length|0];surge={r,id:ln.id,until:Date.now()+90000};
 const nm=`${M.cities[ln.a].name} ⇄ ${M.cities[ln.b].name}`;
 toast(`⚡ Freight surge: ${nm} pays ×${NK.surgeM} for 90s${laneLv(r,ln.id)?'':' — open it to cash in!'}`,'gt');SFX.gold();
}
