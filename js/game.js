"use strict";
/* ---------- elements ---------- */
const scene=$('#scene'),fx=$('#fx'),truckEl=$('#truck'),truckWrap=$('#truckWrap'),panel=$('#panel');
const els={cash:$('#cash'),rate:$('#rate'),dBar:$('#dBar'),dLabel:$('#dLabel'),dPay:$('#dPay'),tapVal:$('#tapVal'),combo:$('#combo'),cBar:$('#cBar'),far:$('#far'),mid:$('#mid'),near:$('#near'),dash:$('#dash'),sun:$('#sun'),stars:$('#stars'),night:$('#night'),boosts:$('#boosts'),routeTag:$('#routeTag'),shareTag:$('#shareTag'),hint:$('#hint'),traffic:$('#traffic'),banner:$('#banner')};
let curTheme=-1,curTier=-1;
function applyTheme(){
 if(curTheme===S.route)return;curTheme=S.route;const th=THEMES[S.route];
 scene.style.setProperty('--s0',th.sky[0]);scene.style.setProperty('--s1',th.sky[1]);scene.style.setProperty('--gr',th.gr);scene.style.setProperty('--road',th.road);scene.style.setProperty('--line2',th.line);
 els.far.style.backgroundImage=genLayer(th.far,'far',11+S.route);els.mid.style.backgroundImage=genLayer(th.mid,'mid',23+S.route);els.near.style.backgroundImage=genLayer(th.near,'near',37+S.route);
 const pl=$('#planet');pl.style.display=th.planet?'block':'none';pl.className=th.planet==='gas'?'gas':'';
 els.traffic.innerHTML='';cars.length=0;
}
function truckTier(){let t=0;for(let i=0;i<FLEET.length;i++)if(S.fleet[i]>0)t=i;return t}
function applyTruck(announce){const t=truckTier();if(t===curTier)return;const up=curTier>=0&&t>curTier;curTier=t;truckEl.innerHTML=truckSVG(t);lastWs=0}

/* ---------- fx ---------- */
function floater(x,y,txt,cls){if(fx.childElementCount>(S.lowfx?8:40))return;const d=document.createElement('div');d.className='float '+(cls||'');d.textContent=txt;d.style.left=x+'px';d.style.top=y+'px';d.addEventListener('animationend',()=>d.remove());fx.appendChild(d)}
function truckBox(){const s=scene.getBoundingClientRect(),t=truckWrap.getBoundingClientRect();return{x:t.left-s.left,y:t.top-s.top,w:t.width,h:t.height}}
function puff(){if(S.lowfx||fx.childElementCount>40)return;const b=truckBox();const d=document.createElement('div');d.className='puff';d.style.left=(b.x+b.w-b.h*.85)+'px';d.style.top=(b.y-4)+'px';d.addEventListener('animationend',()=>d.remove());fx.appendChild(d)}
function confetti(x,y,n){if(S.lowfx)n=Math.min(n,4);const cs=['#ffb020','#4ade80','#60a5fa','#f472b6','#facc15','#fff'];for(let i=0;i<n;i++){const d=document.createElement('div');d.className='conf';d.style.left=x+'px';d.style.top=y+'px';d.style.background=cs[i%cs.length];const a=Math.random()*Math.PI*2,r=50+Math.random()*90;d.style.setProperty('--dx',Math.cos(a)*r+'px');d.style.setProperty('--dy',(Math.sin(a)*r-30)+'px');d.style.setProperty('--r',(Math.random()*720-360)+'deg');d.addEventListener('animationend',()=>d.remove());fx.appendChild(d)}}
function banner(t,s){els.banner.querySelector('.t').textContent=t;els.banner.querySelector('.s').textContent=s;els.banner.classList.remove('show');void els.banner.offsetWidth;els.banner.classList.add('show')}
function toast(msg,cls){const d=document.createElement('div');d.className='toast '+(cls||'');d.textContent=msg;const box=$('#toasts');box.appendChild(d);while(box.childElementCount>2)box.firstChild.remove();setTimeout(()=>d.remove(),2500)}
function modal(html,buttons){const m=$('#modal'),b=$('#mbox');b.innerHTML=html+`<div class="row2">${buttons.map((x,i)=>`<button class="btn ${x.cls||'ok'}" data-mb="${i}">${x.label}</button>`).join('')}</div>`;m.hidden=false;
 b.querySelectorAll('[data-mb]').forEach(el=>el.onclick=()=>{m.hidden=true;const f=buttons[+el.dataset.mb].fn;f&&f()})}

/* ---------- tapping ---------- */
let combo=0,lastTap=0,tapKick=0,autoFloatT=0;
const comboMult=()=>1+(D.comboCap-1)*Math.min(combo,100)/100;
const need=()=>20+S.route*5;
function doTap(x,y,manual){
 const v=D.baseTap*(manual?comboMult():1);earn(v);
 if(manual){S.taps++;combo=Math.min(100,combo+2.2);lastTap=performance.now();if(combo>S.maxCombo)S.maxCombo=combo;tapKick=Math.min(tapKick+28,260);
  floater(x,y,'+'+money(v));puff();SFX.tap();buzz(6);
  truckEl.animate([{transform:'translateY(0)'},{transform:'translateY(-4px) scale(1.03)'},{transform:'translateY(0)'}],{duration:150});
  if(S.taps===12)els.hint.remove();}
 else{const t=performance.now();if(t-autoFloatT>350){autoFloatT=t;const b=truckBox();floater(b.x+b.w*.6,b.y,'+'+money(v),'sm')}}
 S.prog++;if(S.prog>=need())deliver();
}
function deliver(){
 S.prog=0;S.deliveries++;const v=D.baseTap*30*comboMult()+D.income*5;earn(v);
 const b=truckBox();banner('DELIVERED!','+'+money(v));confetti(b.x+b.w*.7,b.y+b.h*.3,16);SFX.horn();buzz([10,40,20]);
}
scene.addEventListener('pointerdown',e=>{if(e.target.closest('.gold'))return;e.preventDefault();const r=scene.getBoundingClientRect();doTap(e.clientX-r.left,e.clientY-r.top,true)});
scene.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- rush orders ---------- */
let goldEl=null,nextGold=performance.now()+20000;
function scheduleGold(){nextGold=performance.now()+(30000+Math.random()*40000)*(D.broker?.5:1)/D.rushMult}
function spawnGold(){
 const g=document.createElement('div');g.className='gold';g.textContent='📦';g.style.left=(8+Math.random()*70)+'%';g.style.top=(6+Math.random()*30)+'%';
 g.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();collectGold(g)});
 scene.appendChild(g);goldEl=g;
 if(has('magnet')&&S.autos.magnet)setTimeout(()=>collectGold(g),1400);
 const life=D.broker?16000:10000;setTimeout(()=>{if(goldEl===g){g.remove();goldEl=null;scheduleGold()}},life);
}
function collectGold(g){
 if(goldEl!==g)return;goldEl=null;S.goldens++;g.classList.add('out');setTimeout(()=>g.remove(),350);
 const r=Math.random(),now=Date.now(),sr=scene.getBoundingClientRect(),gr=g.getBoundingClientRect(),x=gr.left-sr.left+gr.width/2,y=gr.top-sr.top+gr.height/2;
 confetti(x,y,22);SFX.gold();buzz([15,30,15]);
 if(r<.5||D.income<1){const v=Math.max(D.income*120,D.baseTap*100);earn(v);banner('RUSH ORDER!','+'+money(v));toast(`📦 Rush order paid ${money(v)}!`,'gt')}
 else if(r<.8){S.boosts.push({k:'tail',m:3,until:now+30000});banner('TAILWIND!','×3 income for 30s');toast('🌬️ Tailwind! ×3 income for 30 seconds','gt')}
 else{S.boosts.push({k:'nitro',m:10,until:now+20000});banner('NITRO!','×10 tap value for 20s');toast('🔥 Nitro! ×10 tap value for 20 seconds — tap fast!','gt')}
 scheduleGold();
}

/* ---------- contracts ---------- */
const CTYPES=['deliver','earn','taps','rush','buy','combo'];
const ctrVal=t=>t==='deliver'?S.deliveries:t==='earn'?S.allEarn:t==='taps'?S.taps:t==='rush'?S.goldens:t==='buy'?S.bought:0;
function newContract(){
 const free=CTYPES.filter(t=>!S.contracts.some(c=>c.type===t));const type=free[Math.random()*free.length|0]||'deliver';
 const inc=Math.max(D.income,D.baseTap*3,1);let goal,mins,ic,name;const pick=a=>a[Math.random()*a.length|0];
 if(type==='deliver'){goal=pick([5,10,15,25]);mins=3+goal/6;ic='📦';name=`Complete ${goal} deliveries`}
 else if(type==='earn'){const secs=pick([90,180,300]);goal=inc*secs;mins=secs/60*1.5+1;ic='💵';name=`Earn ${money(goal)}`}
 else if(type==='taps'){goal=pick([100,200,300]);mins=goal/100+1.5;ic='👆';name=`Tap ${goal} times`}
 else if(type==='rush'){goal=1;mins=8;ic='🎯';name='Catch a rush order'}
 else if(type==='buy'){goal=pick([5,10,25]);mins=goal/2+3;ic='🛒';name=`Buy ${goal} vehicles`}
 else{goal=1;mins=3;ic='🔥';name='Max out your combo'}
 const div=S.ipos>0&&Math.random()<.35?Math.max(1,Math.floor(Math.log10(S.shares+1))):0;
 return {type,goal,start:ctrVal(type),until:Date.now()+mins*60000,ic,name,secs:Math.round(150+Math.random()*300),div,done:false,hit:false};
}
const cprog=c=>c.type==='combo'?(c.hit?1:0):Math.max(0,Math.min(c.goal,ctrVal(c.type)-c.start));
const cReward=c=>Math.max(D.income*c.secs,D.baseTap*c.secs*.6,50)*D.cMult;
function tickContracts(){
 while(S.contracts.length<3)S.contracts.push(newContract());
 const now=Date.now();
 S.contracts.forEach((c,i)=>{
  if(c.done)return;
  if(cprog(c)>=c.goal){c.done=true;if(has('autoClaim')&&S.autos.claim)claimContract(i,true);else{toast(`📋 Contract done: ${c.name} — claim it in Jobs`,'blue');SFX.gold()}}
  else if(now>c.until)S.contracts[i]=newContract();
 });
}
function claimContract(i,auto){const c=S.contracts[i];if(!c||!c.done)return;const v=cReward(c);earn(v);S.div+=c.div;S.contractsDone++;S.contracts[i]=newContract();
 toast(`📋 ${auto?'Auto-claimed':'Contract paid'}: +${money(v)}${c.div?` & 💠 ${c.div}`:''}`,'gt');if(!auto){SFX.horn();confetti(scene.clientWidth/2,scene.clientHeight*.4,18)}render(true)}
function rerollContract(i,btn){if(Date.now()<S.rerollAt)return fail(btn);S.contracts[i]=newContract();S.rerollAt=Date.now()+60000;SFX.buy();render(true)}

/* ---------- automation ---------- */
function bestFleet(affordable){let bi=-1,bv=Infinity;for(const i of visFleet()){if(!(D.unit[i]>0))continue;const c=costN(i,1);if(affordable&&S.cash<c)continue;const v=c/D.unit[i];if(v<bv){bv=v;bi=i}}return bi}
function autoTick(){
 if(has('autoRoute')&&S.autos.route&&S.route<ROUTES.length-1&&S.cash>=ROUTES[S.route+1].cost)buyRoute(S.route+1,null);
 if(has('autoUp')&&S.autos.up){let n=0;for(const u of visUps()){if(n>=8)break;if(S.cash>=u.cost){S.cash-=u.cost;S.ups[u.id]=1;n++}}if(n)calc()}
 if(has('autoFleet')&&S.autos.fleet){let n=0;for(;n<25;n++){const i=bestFleet(true);if(i<0)break;buyFleet(i,null,true,1)}if(n)calc()}
}

/* ---------- purchases ---------- */
const costN=(i,n)=>FLEET[i].base*Math.pow(1.15,S.fleet[i])*(Math.pow(1.15,n)-1)/.15;
function maxN(i){const c0=FLEET[i].base*Math.pow(1.15,S.fleet[i]);if(S.cash<c0)return 0;return Math.floor(Math.log(S.cash*.15/c0+1)/Math.log(1.15))}
const buyCount=i=>S.buyAmt==='max'?Math.max(1,maxN(i)):S.buyAmt;
function fail(btn){SFX.err();if(btn){btn.classList.remove('shake');void btn.offsetWidth;btn.classList.add('shake')}}
function buyFleet(i,btn,quiet,forceN){
 const n=forceN||buyCount(i),c=costN(i,n);if(S.cash<c){if(!quiet)fail(btn);return false}
 const before=milestones(S.fleet[i]);S.cash-=c;S.fleet[i]+=n;S.bought+=n;
 if(!quiet){SFX.buy();buzz(8)}
 if(S.fleet[i]===n&&n>0&&i>0)toast(`🎉 New vehicle: ${FLEET[i].name}!`,'blue');
 if(milestones(S.fleet[i])>before&&!quiet){toast(`⭐ ${S.fleet[i]} ${FLEET[i].name}s — output ×2!`,'ach');SFX.big()}
 if(!quiet)calc();applyTruck(true);if(!quiet)render();return true
}
function buyAllUps(){let n=0;for(const u of visUps())if(S.cash>=u.cost){S.cash-=u.cost;S.ups[u.id]=1;n++}if(n){SFX.big();toast(`🔧 Bought ${n} upgrade${n>1?'s':''}`);calc();render(true)}else fail()}
function buyPerk(id,btn){const p=PERKS.find(x=>x.id===id);if(!p||perkLvl(id)>=p.max)return;const c=perkCost(p);if(S.div<c)return fail(btn);S.div-=c;S.perks[id]=perkLvl(id)+1;if(p.tog)S.autos[p.tog]=1;SFX.big();buzz(10);toast(`${p.ic} ${p.name}${p.max>1?' Lv '+S.perks[id]:''}: ${p.info(S.perks[id])}`,'blue');calc();render(true)}
function buyUp(id,btn){const u=UPS.find(x=>x.id===id);if(!u||S.ups[id])return;if(S.cash<u.cost)return fail(btn);S.cash-=u.cost;S.ups[id]=1;SFX.buy();buzz(8);toast(`${u.ic} ${u.name}: ${u.desc}`);calc();render(true)}
function buyRoute(i,btn){if(i!==S.route+1||i>=ROUTES.length)return;const r=ROUTES[i];if(S.cash<r.cost)return fail(btn);S.cash-=r.cost;S.route=i;S.prog=0;SFX.big();buzz([20,40,20]);applyTheme();banner('NEW ROUTE!',`${r.icon} ${r.name} · ×${r.mult} income`);confetti(scene.clientWidth/2,scene.clientHeight*.4,30);calc();render(true)}
function doIPO(){
 const p=pendingShares();if(p<1)return;
 modal(`<div class="em">🔔</div><h2>Go Public?</h2><p>Sell your fleet, upgrades, routes and cash to Wall Street. You get <b>${fmt(p)} new shares</b> forever, plus <b>💠 ${fmt(p)} dividends</b> to spend on Executive Board perks.</p><p>Share bonus after IPO: <b>+${fmt((S.shares+p)*D.shareRate*100)}%</b> income &amp; tap value.</p>${perkLvl('start')||perkLvl('keepRoute')||has('keepUps')?'<p>Your perks carry over: '+[perkLvl('start')?'seed capital':'',perkLvl('keepRoute')?'route rights':'',has('keepUps')?'corporate memory':''].filter(Boolean).join(', ')+'.</p>':''}`,
 [{label:'Not yet',cls:'ghost'},{label:'Ring the bell',fn:()=>{const keep=S.shares+p,dv=S.div+p,rt=Math.min(S.route,perkLvl('keepRoute')),ups={};if(has('keepUps'))for(const id in S.ups)if(/^(tap|auto|combo|broker|night)/.test(id))ups[id]=1;
  Object.assign(S,runState());S.shares=keep;S.div=dv;S.route=rt;S.ups=ups;S.cash=perkLvl('start')?Math.pow(1000,perkLvl('start')):0;S.ipos++;combo=0;calc();applyTheme();applyTruck(false);tab==='empire'&&(esub='board');render(true);save();banner('IPO!',`${fmt(keep)} shares · 💠 +${fmt(p)}`);SFX.big();confetti(scene.clientWidth/2,scene.clientHeight*.4,40)}}]);
}

/* ---------- panel ---------- */
let tab='fleet',panelKey='',esub='board';
function visFleet(){const o=[];for(let i=0;i<FLEET.length;i++){if(i===0||S.fleet[i]>0||S.fleet[i-1]>0||S.runEarn>=FLEET[i].base*.3)o.push(i);else break}return o}
function visUps(){return UPS.filter(u=>!S.ups[u.id]&&('f' in u.e?S.fleet[u.e.f]>=u.need:S.runEarn>=u.cost*.25||S.cash>=u.cost*.5)).sort((a,b)=>a.cost-b.cost).slice(0,40)}
function structKey(){if(tab==='fleet')return 'f'+visFleet().length+S.buyAmt;if(tab==='upgrades')return 'u'+visUps().map(u=>u.id).join();if(tab==='routes')return 'r'+S.route;if(tab==='jobs')return 'j'+S.contracts.map(c=>c.name+c.done).join();return 'e'+esub+D.achN+(pendingShares()>0)+S.sound+S.haptic+S.sci+S.lowfx+JSON.stringify(S.perks)+JSON.stringify(S.autos)}
function build(){
 let h='';
 if(tab==='fleet'){
  h=`<div class="buybar"><span>BUY</span>${[1,10,25,'max'].map(a=>`<button class="seg ${S.buyAmt===a?'on':''}" data-amt="${a}">${a==='max'?'MAX':'×'+a}</button>`).join('')}</div>`;
  const v=visFleet();
  for(const i of v){const f=FLEET[i];h+=`<div class="card" data-fi="${i}"><div class="ic">${f.icon}</div><div class="info"><div class="nm">${f.name}<span class="own" data-own>0</span><span class="best" data-best hidden>BEST</span></div><div class="sub" data-sub></div><div class="ms"><i data-msb></i></div></div><button class="buy" data-buy="${i}"><small data-q></small><b data-c></b></button></div>`}
  if(v.length<FLEET.length){const f=FLEET[v.length];h+=`<div class="card mystery"><div class="ic">${f.icon}</div><div class="info"><div class="nm">??? Locked</div><div class="sub">Earn ${money(f.base*.3)} this run to reveal</div></div></div>`}
 }else if(tab==='upgrades'){
  const v=visUps();const owned=Object.keys(S.ups).length;
  h=`<button class="btn ok" data-act="buyall" style="margin:0 0 4px">Buy all affordable</button><div class="sect">Available · ${owned} owned</div>`;
  if(!v.length)h+=`<div class="empty">🔧 Nothing in the shop right now.<br>Keep hauling and buying trucks — new upgrades unlock as your empire grows.</div>`;
  for(const u of v)h+=`<div class="card" data-ui="${u.id}"><div class="ic">${u.ic}</div><div class="info"><div class="nm">${u.name}</div><div class="sub">${u.desc}</div></div><button class="buy" data-up="${u.id}"><small>Buy</small><b>${money(u.cost)}</b></button></div>`;
 }else if(tab==='routes'){
  h=`<div class="sect">Routes · each one multiplies all income</div>`;
  ROUTES.forEach((r,i)=>{const cur=i===S.route,own=i<=S.route,next=i===S.route+1;
   h+=`<div class="card route ${cur?'cur':''} ${!own&&!next?'locked':''}"><div class="ic">${r.icon}</div><div class="info"><div class="nm">${r.name}</div><div class="sub">×${r.mult} income · ${r.desc}</div></div>${own?`<button class="buy done"><small>${cur?'Driving':'Done'}</small><b>${cur?'📍':'✓'}</b></button>`:`<button class="buy" ${next?`data-route="${i}"`:''}><small>${next?'Unlock':'Locked'}</small><b>${money(r.cost)}</b></button>`}</div>`});
 }else if(tab==='jobs'){
  h=`<div class="sect">Contracts · ${S.contractsDone} completed</div>`;
  S.contracts.forEach((c,i)=>{h+=`<div class="card" data-ci="${i}"><div class="ic">${c.ic}</div><div class="info"><div class="nm">${c.name}</div><div class="sub" data-cr></div><div class="prog"><i data-cp></i></div><div class="cl" data-ct></div></div><button class="buy" data-claim="${i}"><small data-cs></small><b data-cb></b></button></div>`});
  h+=`<p class="empty" style="padding:10px 16px;font-size:12px">Finish contracts before the timer runs out. Rewards scale with your income${S.ipos?' and some pay 💠 dividends':''}. You can reroll one contract a minute.</p>`;
 }else{
  h=`<div class="subnav">${[['board','🏛️ Board'],['awards','🏆 Awards'],['stats','📊 Stats'],['settings','⚙️ Settings']].map(([k,l])=>`<button class="seg ${esub===k?'on':''}" data-esub="${k}">${l}</button>`).join('')}</div>`;
  if(esub==='board'){h+=`<div class="ipo"><h3>📈 Go Public</h3><p>Shares held: <b data-e="sh"></b> · bonus <b data-e="shb"></b></p><p>Shares from an IPO now:</p><div class="big" data-e="pend"></div><p data-e="nxt"></p><button class="btn" data-act="ipo" data-e="ipob">Ring the bell</button></div>`;
  h+=`<div class="sect">Executive Board · permanent perks</div><div class="divbar"><span>💠 Dividends</span><b data-e="div"></b></div>`;
  if(!S.ipos&&!S.div)h+=`<div class="empty" style="padding:10px 16px">Go public to earn your first dividends. Every new share pays one.</div>`;
  for(const p of PERKS){const l=perkLvl(p.id),mx=l>=p.max;
   h+=`<div class="card" data-pk="${p.id}"><div class="ic">${p.ic}</div><div class="info"><div class="nm">${p.name}${p.max>1?`<span class="lv">Lv ${l}/${p.max}</span>`:''}</div><div class="sub">${p.tog?p.info(1):mx?p.info(l):l?`${p.info(l)}<br>Next: <b>${p.info(l+1)}</b>`:p.info(1)}</div></div>`+
    (p.tog&&l?`<button class="tog ${S.autos[p.tog]?'on':''}" data-tog="${p.tog}">${S.autos[p.tog]?'ON':'OFF'}</button>`:mx?`<button class="buy done"><small>Maxed</small><b>✓</b></button>`:`<button class="buy" data-perk="${p.id}"><small>${l?'Upgrade':'Buy'}</small><b>💠 ${fmt(perkCost(p))}</b></button>`)+`</div>`}
  }else if(esub==='awards'){
  h+=`<div class="sect">Achievements · <span data-e="achc"></span> (+1% income each)</div><div class="achs">${ACH.map((a,i)=>`<div class="ach ${S.ach[i]?'got':''}"><div class="ai">${a[0]}</div><b>${a[1]}</b>${a[2]}</div>`).join('')}</div>`;
  }else if(esub==='stats'){
  h+=`<div class="sect">Stats</div><div class="stats">${[['Earned this run','re'],['Earned all time','ae'],['Deliveries','dl'],['Taps','tp'],['Vehicles','vh'],['Rush orders caught','go'],['Contracts completed','cc'],['IPOs','ip'],['Dividends held','dh'],['Perk levels','pl'],['Best combo','bc'],['Offline cap','oc'],['Playing for','pf']].map(([l,k])=>`<div><span>${l}</span><b data-e="${k}"></b></div>`).join('')}</div>`;
  h+=`<div class="sect">Income by vehicle</div><div class="stats">${FLEET.map((f,i)=>S.fleet[i]?`<div><span>${f.icon} ${f.name} ×${S.fleet[i]}</span><b data-inc="${i}"></b></div>`:'').join('')||'<div><span>No vehicles yet</span><b></b></div>'}</div>`;
  }else{
  h+=`<div class="sect">Settings</div><div class="row2"><button class="btn ghost" data-act="sound">${S.sound?'🔊 Sound on':'🔇 Sound off'}</button><button class="btn ghost" data-act="haptic">${S.haptic?'📳 Haptics on':'📴 Haptics off'}</button></div><div class="row2"><button class="btn ghost" data-act="sci">${S.sci?'🔬 Scientific':'🔤 Letters (1.5M)'}</button><button class="btn ghost" data-act="lowfx">${S.lowfx?'🐢 Low effects':'✨ Full effects'}</button></div><div class="row2"><button class="btn ghost" data-act="export">💾 Export save</button><button class="btn ghost" data-act="import">📥 Import save</button></div><button class="btn danger" data-act="reset">Reset all progress</button><p style="text-align:center;color:var(--mut);font-size:11px;margin-top:14px">Haul Empire · progress saves automatically on this device</p>`;
  }
 }
 panel.innerHTML=h;
}
function update(){
 if(tab==='fleet'){const bi=bestFleet(false),tot=D.income/D.tail||1;panel.querySelectorAll('[data-fi]').forEach(card=>{const i=+card.dataset.fi,own=S.fleet[i],n=buyCount(i),c=costN(i,n);
  card.querySelector('[data-own]').textContent=own;card.querySelector('[data-best]').hidden=i!==bi;card.classList.toggle('isbest',i===bi);
  const nm=nextMile(own),pm=prevMile(own),sh=own?Math.round(D.unit[i]*own/tot*100):0;
  card.querySelector('[data-sub]').innerHTML=`${money(D.unit[i])}/s each${own?` · <b>${money(D.unit[i]*own*D.tail)}/s</b>`:''}<br>Next ×2 at ${nm}${own?` · ${sh}% of income`:''}`;
  card.querySelector('[data-msb]').style.width=((own-pm)/(nm-pm)*100)+'%';
  card.querySelector('[data-q]').textContent=S.cash>=c||!(D.income>0)?'×'+n:'⏱ '+dur((c-S.cash)/D.income);card.querySelector('[data-c]').textContent=money(c);
  card.querySelector('.buy').classList.toggle('ok',S.cash>=c)})}
 else if(tab==='upgrades'){let n=0;panel.querySelectorAll('[data-ui]').forEach(card=>{const u=UPS.find(x=>x.id===card.dataset.ui),ok=S.cash>=u.cost;if(ok)n++;card.querySelector('.buy').classList.toggle('ok',ok)});const ba=panel.querySelector('[data-act="buyall"]');if(ba){ba.textContent=n?`Buy all affordable (${n})`:'Nothing affordable yet';ba.classList.toggle('ok',n>0)}}
 else if(tab==='jobs'){const now=Date.now();panel.querySelectorAll('[data-ci]').forEach(card=>{const i=+card.dataset.ci,c=S.contracts[i];if(!c)return;const pr=cprog(c);
  card.querySelector('[data-cr]').innerHTML=`Reward: <b>${money(cReward(c))}</b>${c.div?` + <span style="color:#c4b5fd;font-weight:700">💠 ${c.div}</span>`:''}`;
  card.querySelector('[data-cp]').style.width=(pr/c.goal*100)+'%';
  card.querySelector('[data-ct]').textContent=c.done?'✅ Complete!':`${c.type==='earn'?money(pr):fmt(pr)} / ${c.type==='earn'?money(c.goal):fmt(c.goal)} · ⏱ ${dur((c.until-now)/1000)} left`;
  const b=card.querySelector('.buy'),rr=Math.ceil((S.rerollAt-now)/1000);b.classList.toggle('ok',c.done);b.classList.toggle('done',false);
  card.querySelector('[data-cs]').textContent=c.done?'Claim':'Reroll';card.querySelector('[data-cb]').textContent=c.done?'💰':rr>0?rr+'s':'🔄'})}
 else if(tab==='routes'){const b=panel.querySelector('[data-route]');if(b)b.classList.toggle('ok',S.cash>=ROUTES[+b.dataset.route].cost)}
 else{const p=pendingShares(),q=k=>panel.querySelector(`[data-e="${k}"]`),set=(k,v)=>{const e=q(k);if(e)e.textContent=v};
  set('sh',fmt(S.shares));set('shb','+'+fmt(S.shares*D.shareRate*100)+'%');set('pend',p>0?`+${fmt(p)} shares (+${fmt(p*D.shareRate*100)}%)`:'0 shares');set('div',fmt(S.div));
  panel.querySelectorAll('[data-perk]').forEach(b=>{const pk=PERKS.find(x=>x.id===b.dataset.perk);b.classList.toggle('ok',S.div>=perkCost(pk))});
  panel.querySelectorAll('[data-inc]').forEach(e=>{const i=+e.dataset.inc;e.textContent=`${money(D.unit[i]*S.fleet[i]*D.tail)}/s`});
  set('cc',fmt(S.contractsDone));set('dh',fmt(S.div));set('pl',perkTotal());set('oc',(D.offCap/3600)+'h at '+(D.offline*100)+'%');
  const tot=totalSharesFor(S.allEarn);set('nxt',`Next share at ${money(Math.pow(tot+1,2)*1e7)} earned all time (now ${money(S.allEarn)})`);
  const ib=q('ipob');if(ib){ib.classList.toggle('ok',p>0);ib.textContent=p>0?`Ring the bell · +${fmt(p)} shares`:'Need more lifetime earnings'}
  set('achc',`${D.achN}/${ACH.length}`);set('re',money(S.runEarn));set('ae',money(S.allEarn));set('dl',fmt(S.deliveries));set('tp',fmt(S.taps));set('vh',fmt(fleetTotal()));set('go',S.goldens);set('ip',S.ipos);set('bc','×'+(1+(D.comboCap-1)*Math.min(S.maxCombo,100)/100).toFixed(2));set('pf',dur((Date.now()-S.started)/1000))}
}
function render(force){const k=structKey();if(force||k!==panelKey){panelKey=k;build()}update()}
function exportSave(){save();const code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));
 modal(`<div class="em">💾</div><h2>Export save</h2><p>Copy this code and keep it somewhere safe, or paste it into another device.</p><textarea class="code" readonly>${code}</textarea>`,[{label:'Close',cls:'ghost'},{label:'Copy',fn:()=>{if(navigator.clipboard)navigator.clipboard.writeText(code).then(()=>toast('📋 Save code copied'),()=>toast('Copy failed — select the text and copy it'));else toast('Select the text and copy it')}}])}
function importSave(){modal(`<div class="em">📥</div><h2>Import save</h2><p>Paste a save code. This replaces your current progress.</p><textarea class="code" id="impTxt" placeholder="Paste code here"></textarea>`,[{label:'Cancel',cls:'ghost'},{label:'Load',fn:()=>{try{const d=JSON.parse(decodeURIComponent(escape(atob($('#impTxt').value.trim()))));if(!d||typeof d!=='object'||!Array.isArray(d.fleet))throw 0;noSave=true;localStorage.setItem(KEY,JSON.stringify(d));location.reload()}catch(e){toast('⚠️ That save code is not valid')}}}])}
let holdT=null,holdRep=false;
panel.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-buy]');if(!b)return;holdRep=false;clearTimeout(holdT);const i=+b.dataset.buy;
 holdT=setTimeout(function rep(){holdRep=true;if(buyFleet(i,null,false))holdT=setTimeout(rep,90);else holdT=null},420)});
['pointerup','pointercancel'].forEach(ev=>window.addEventListener(ev,()=>{clearTimeout(holdT);holdT=null}));
panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(holdRep&&b.dataset.buy!=null){holdRep=false;return}
 if(b.dataset.amt){S.buyAmt=b.dataset.amt==='max'?'max':+b.dataset.amt;render(true)}
 else if(b.dataset.buy!=null)buyFleet(+b.dataset.buy,b);
 else if(b.dataset.up)buyUp(b.dataset.up,b);
 else if(b.dataset.route!=null)buyRoute(+b.dataset.route,b);
 else if(b.dataset.claim!=null){const i=+b.dataset.claim;S.contracts[i]&&S.contracts[i].done?claimContract(i):rerollContract(i,b)}
 else if(b.dataset.perk)buyPerk(b.dataset.perk,b);
 else if(b.dataset.tog){S.autos[b.dataset.tog]=S.autos[b.dataset.tog]?0:1;SFX.buy();render(true)}
 else if(b.dataset.esub){esub=b.dataset.esub;render(true);panel.scrollTop=0}
 else if(b.dataset.act==='buyall')buyAllUps();
 else if(b.dataset.act==='sci'){S.sci=!S.sci;lastCash='';lastRate='';render(true)}
 else if(b.dataset.act==='lowfx'){S.lowfx=!S.lowfx;render(true)}
 else if(b.dataset.act==='export')exportSave();
 else if(b.dataset.act==='import')importSave();
 else if(b.dataset.act==='ipo')doIPO();
 else if(b.dataset.act==='sound'){S.sound=!S.sound;render(true);SFX.buy()}
 else if(b.dataset.act==='haptic'){S.haptic=!S.haptic;render(true);buzz(20)}
 else if(b.dataset.act==='reset')modal(`<div class="em">⚠️</div><h2>Reset everything?</h2><p>This wipes your trucks, shares and achievements. There's no undo.</p>`,[{label:'Cancel',cls:'ghost'},{label:'Reset',cls:'danger',fn:()=>{noSave=true;localStorage.removeItem(KEY);location.reload()}}]);
});
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));panel.scrollTop=0;render(true)}));
function dots(){const d=document.querySelectorAll('#tabs .dot');
 d[0].classList.toggle('show',visFleet().some(i=>S.cash>=costN(i,1)));
 d[1].classList.toggle('show',visUps().some(u=>S.cash>=u.cost));
 d[2].classList.toggle('show',S.route<ROUTES.length-1&&S.cash>=ROUTES[S.route+1].cost);
 d[3].classList.toggle('show',S.contracts.some(c=>c.done));
 const p=pendingShares();d[4].classList.toggle('show',p>=Math.max(1,S.shares)||PERKS.some(pk=>perkLvl(pk.id)<pk.max&&S.div>=perkCost(pk)))}
function checkAch(){ACH.forEach((a,i)=>{if(!S.ach[i]&&a[3]()){S.ach[i]=1;toast(`🏆 ${a[1]} — +1% income`,'ach');SFX.gold()}})}

/* ---------- scene loop ---------- */
let off=0,speed=80,lastWs=0;const cars=[];let nextCar=0;
const CARC=['#ef4444','#3b82f6','#22c55e','#eab308','#f8fafc','#a855f7','#111827','#f97316'];
function animScene(dt,t){
 const target=60+22*Math.log10(1+D.income)+combo*1.3;speed+=(target+tapKick-speed)*Math.min(1,dt*4);tapKick*=Math.pow(.08,dt);
 off=(off+speed*dt)%1e7;
 els.far.style.backgroundPositionX=(-off*.06).toFixed(1)+'px';els.mid.style.backgroundPositionX=(-off*.2).toFixed(1)+'px';els.near.style.backgroundPositionX=(-off*.55).toFixed(1)+'px';els.dash.style.backgroundPositionX=(-off).toFixed(1)+'px';
 const ws=Math.max(.06,Math.min(1,34/speed));if(Math.abs(ws-lastWs)/ws>.15){lastWs=ws;truckEl.style.setProperty('--ws',ws.toFixed(2)+'s')}
 const th=THEMES[S.route];let n;
 if(th.night){n=1;els.night.style.opacity=0;els.sun.style.opacity=0}
 else{const cyc=(Date.now()/1000%300)/300,day=.5+.5*Math.cos(2*Math.PI*cyc);n=Math.max(0,Math.min(1,(.3-day)/.25));els.night.style.opacity=(n*.55).toFixed(2);
  const W=scene.clientWidth,H=scene.clientHeight,a=cyc*2*Math.PI;els.sun.style.opacity=Math.max(0,Math.min(1,day*2-.4)).toFixed(2);els.sun.style.left=(W*.5+Math.sin(a)*W*.42-22)+'px';els.sun.style.top=(H*.08+(1-day)*H*.4)+'px'}
 els.stars.style.opacity=n.toFixed(2);scene.style.setProperty('--n',n.toFixed(2));truckWrap.style.setProperty('--n',n.toFixed(2));
 if(!th.noTraffic&&!S.lowfx&&t>nextCar){nextCar=t+1800+Math.random()*4500;const c=document.createElement('div');c.className='car';c.innerHTML=carSVG(CARC[Math.random()*CARC.length|0]);els.traffic.appendChild(c);cars.push({el:c,x:scene.clientWidth+20,v:120+Math.random()*80})}
 for(let i=cars.length-1;i>=0;i--){const c=cars[i];c.x-=(c.v+speed)*dt;c.el.style.left=c.x.toFixed(1)+'px';if(c.x<-90){c.el.remove();cars.splice(i,1)}}
}

/* ---------- main loop ---------- */
let lastT=performance.now(),tickAcc=0,uiAcc=1,achAcc=0,saveAcc=0,autoAcc=0,lastCash='',lastRate='',boostAcc=0;
function frame(t){
 const real=Math.max(0,Math.min((t-lastT)/1000,D.offCap||28800)),dt=Math.min(real,.1);lastT=t;
 calc();
 earn(D.income*real);
 if(D.auto){autoAcc+=D.auto*Math.min(real,1);while(autoAcc>=1){autoAcc--;doTap(0,0,false)}}
 if(t-lastTap>450)combo=Math.max(0,combo-(combo>60?45:30)*dt);
 if(combo>=99)for(const c of S.contracts)if(c.type==='combo')c.hit=true;
 if(!goldEl&&t>nextGold)spawnGold();
 animScene(dt,t);
 const cs=money(S.cash);if(cs!==lastCash){els.cash.textContent=cs;lastCash=cs}
 const rs=`<b>${money(D.income)}</b> /sec${D.tail>1?' 🌬️':''}`;if(rs!==lastRate){els.rate.innerHTML=rs;lastRate=rs}
 const nd=need();els.dBar.style.width=(S.prog/nd*100)+'%';
 boostAcc+=dt;
 if(boostAcc>.15){boostAcc=0;
  els.dLabel.textContent=`📦 Delivery #${fmt(S.deliveries+1)} · ${S.prog}/${nd}`;
  els.dPay.textContent='+'+money(D.baseTap*30*comboMult()+D.income*5);
  els.tapVal.textContent=`${money(D.baseTap*comboMult())} / tap${D.auto?` · 🤖 ${D.auto}/s`:''}`;
  const cm=comboMult();els.combo.textContent=`Combo ×${cm.toFixed(2)}`;els.combo.classList.toggle('hot',combo>=99);els.cBar.style.width=Math.min(combo,100)+'%';
  const now=Date.now();els.boosts.innerHTML=S.boosts.map(b=>`<div class="chip ${b.k}">${b.k==='tail'?'🌬️ ×'+b.m+' income':'🔥 ×'+b.m+' taps'} ${Math.ceil((b.until-now)/1000)}s</div>`).join('');
  els.routeTag.textContent=`${ROUTES[S.route].icon} ${ROUTES[S.route].name} ×${ROUTES[S.route].mult}`;
  els.shareTag.hidden=!S.shares&&!S.div;els.shareTag.textContent=`📈 ${fmt(S.shares)} · 💠 ${fmt(S.div)}`;
 }
 uiAcc+=dt;if(uiAcc>.2){uiAcc=0;render();dots()}
 tickAcc+=dt;if(tickAcc>.5){tickAcc=0;autoTick();tickContracts()}
 achAcc+=dt;if(achAcc>1){achAcc=0;checkAch()}
 saveAcc+=dt;if(saveAcc>5){saveAcc=0;save()}
 requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
window.addEventListener('pagehide',save);

/* ---------- boot ---------- */
const had=load();
calc();tickContracts();applyTheme();applyTruck(false);render(true);
if(S.taps>=12)els.hint.remove();
if(had){const away=Math.min((Date.now()-S.last)/1000,D.offCap);
 if(away>30&&D.income>0){const g=D.income*away*D.offline;earn(g);
  modal(`<div class="em">🌙</div><h2>Welcome back!</h2><p>Your drivers kept hauling for ${dur(away)}${D.offline<1?' (50% offline rate)':''}.</p><div class="money">+${money(g)}</div>`,[{label:'Collect',fn:()=>{SFX.horn()}}])}}
else modal(`<div class="em">🚚</div><h2>Haul Empire</h2><p>You've got one beat-up pickup and a dream.</p><p>👆 <b>Tap the road</b> to drive deliveries — tap fast for combos.<br>🚛 <b>Buy trucks</b> that haul while you're away.<br>📦 <b>Catch rush orders</b> for big bonuses.<br>🗺️ <b>Unlock routes</b> from Main Street to the stars.</p>`,[{label:"Let's roll",fn:()=>{ac();SFX.horn()}}]);
requestAnimationFrame(t=>{lastT=t;requestAnimationFrame(frame)});
