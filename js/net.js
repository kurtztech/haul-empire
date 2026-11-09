"use strict";
/* ---------- freight network ----------
   Every region is a map of cities joined by possible lanes.
   Your fleet produces haul capacity (F). Capacity only earns money where the
   network can carry it: each open lane / hub depot is an "arc" with a pay
   rate m and a capacity c. Putting a units of fleet on an arc earns
   m*c*(1-exp(-a/c)): more trucks than the road can carry => congestion.
   The fleet is spread across arcs optimally (water-filling), so the marginal
   value of one more unit of fleet is lambda, the solver's shadow price. */
const ROADS=['Dirt Track','Gravel Road','Paved Road','Highway','Divided Highway','Freeway','Interstate','Superhighway','Smart Road','Maglev Line','Hyperloop','Warp Lane'];
const CITYN=[
 ['Millbrook','Ashford','Cedar Falls','Pine Hollow','Riverton','Oakdale','Fairview','Elm Creek','Stonebridge'],
 ['Haystack','Wheatland','Barley Flats','Grainger','Silo City','Cornwell','Prairie Rose','Harvest Bend','Clover'],
 ['Basecamp','Granite Pass','Eagle Ridge','Timberline','Boulder Gap','Frostpeak','Echo Valley','Ironhill','Pinecrest'],
 ['Oasis','Mesa Verde','Sandstone','Coyote Bluff','Sun Valley','Rattler Springs','Red Rock','Cactus Flat','Dry Gulch'],
 ['Frostholm','Polar Bay','Glacier Point','Snowmass','Icefield','Whiteout','Tundra Camp','Aurora','Coldwater'],
 ['Neo Core','Chrome Row','Pulse District','Grid 9','Lumen Heights','Circuit Bay','Synth Square','Arc Tower','Night Market'],
 ['Tranquility','Copernicus','Shackleton','Apollo Base','Mare Vista','Lunar Gate','Crater 7','Selene','Dark Side'],
 ['Ares Prime','Olympus','Valles','Red Dome','Jezero','Gale Station','Utopia','Hellas','Tharsis'],
 ['Ceres','Vesta','Pallas','Hygiea','Rock 42','Ore Haven','Drift Port','Psyche','Juno'],
 ['Ring Hub','Nova','Andromeda Gate','Sirius','Vega','Orion Yard','Polaris','Halo','Event Horizon'],
];
// tuning knobs
const NK={roadCap:3,roadCost:5,laneEsc:1.25,hubVal:.25,hubLocal:.5,hubCost:6,hubEsc:7,hubMax:5,surgeM:3};

const MAPS=[];
function _rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function _cross(p1,p2,p3,p4){const d=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);const d1=d(p3,p4,p1),d2=d(p3,p4,p2),d3=d(p1,p2,p3),d4=d(p1,p2,p4);return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0))}
function _segDist(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(a.x+t*dx-p.x,a.y+t*dy-p.y)}
function getMap(r){
 if(MAPS[r])return MAPS[r];
 const rnd=_rng(9001+r*131),names=CITYN[r],C=[{x:11,y:32,pop:3,name:names[0]}];
 let t=0;while(C.length<names.length&&t++<6000){const x=7+rnd()*86,y=7+rnd()*50;if(C.every(c=>Math.hypot(c.x-x,c.y-y)>=15))C.push({x,y,pop:1+(rnd()*4|0),name:names[C.length]})}
 const P=[];for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)P.push([i,j,Math.hypot(C[i].x-C[j].x,C[i].y-C[j].y)]);
 P.sort((a,b)=>a[2]-b[2]);
 const par=C.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i])),E=[],deg=C.map(()=>0);
 const ok=p=>!E.some(e=>e[0]!==p[0]&&e[0]!==p[1]&&e[1]!==p[0]&&e[1]!==p[1]&&_cross(C[e[0]],C[e[1]],C[p[0]],C[p[1]]))&&!C.some((c,k)=>k!==p[0]&&k!==p[1]&&_segDist(c,C[p[0]],C[p[1]])<4.5);
 for(const p of P){const a=find(p[0]),b=find(p[1]);if(a!==b&&ok(p)){par[a]=b;E.push(p);deg[p[0]]++;deg[p[1]]++}}
 for(const p of P){const a=find(p[0]),b=find(p[1]);if(a!==b){par[a]=b;E.push(p);deg[p[0]]++;deg[p[1]]++}} // guarantee connected
 for(const p of P){if(E.includes(p)||p[2]>36||deg[p[0]]>=4||deg[p[1]]>=4||!ok(p))continue;E.push(p);deg[p[0]]++;deg[p[1]]++}
 MAPS[r]={cities:C,lanes:E.map(([a,b,d],id)=>({id,a,b,d}))};
 return MAPS[r];
}

/* state helpers: S.net[r] = {l:{laneId:roadLevel}, h:{cityIdx:hubLevel}} */
function net(r){if(!S.net)S.net={};return S.net[r]||(S.net[r]={l:{},h:{0:1}})}
let surge=null; // {r,id,until}
const surgeOn=(r,id)=>surge&&surge.r===r&&surge.id===id&&Date.now()<surge.until;
const hubAt=(r,ci)=>net(r).h[ci]||0;
const laneLv=(r,id)=>net(r).l[id]||0;
const laneM=(r,ln)=>ROUTES[r].val*(.5+ln.d/25)*(1+NK.hubVal*(hubAt(r,ln.a)+hubAt(r,ln.b)))*(surgeOn(r,ln.id)?NK.surgeM:1);
const laneC=(r,ln,lv)=>{const C=getMap(r).cities;return ROUTES[r].cap*C[ln.a].pop*C[ln.b].pop/(ln.d/20)*Math.pow(NK.roadCap,(lv||laneLv(r,ln.id))-1)};
const localM=r=>ROUTES[r].val*1.1;
const localC=(r,ci,h)=>ROUTES[r].cap*getMap(r).cities[ci].pop*NK.hubLocal*Math.pow(2,(h||hubAt(r,ci))-1);
const openCount=r=>Object.keys(net(r).l).length;
const hubCount=r=>Object.keys(net(r).h).length;
const laneOpenable=(r,ln)=>!laneLv(r,ln.id)&&(hubAt(r,ln.a)>0||hubAt(r,ln.b)>0);
const cityLinked=(r,ci)=>getMap(r).lanes.some(ln=>laneLv(r,ln.id)&&(ln.a===ci||ln.b===ci));
const laneBaseCost=(r,ln)=>ROUTES[r].c0*(ln.d/20);
const laneOpenCost=(r,ln)=>laneBaseCost(r,ln)*Math.pow(NK.laneEsc,openCount(r))*(1-.08*perkLvl('survey'));
const roadCost=(r,ln)=>laneBaseCost(r,ln)*2*Math.pow(NK.roadCost,laneLv(r,ln.id))*(1-.08*perkLvl('survey'));
const roadMax=r=>ROADS.length;
const hubCost=(r,ci)=>ROUTES[r].c0*NK.hubCost*getMap(r).cities[ci].pop*Math.pow(NK.hubEsc,hubAt(r,ci))*Math.pow(1.5,Math.max(0,hubCount(r)-1))*(1-.08*perkLvl('survey'));

/* all arcs that can carry freight right now */
function netArcs(){
 const A=[];
 for(let r=0;r<=S.route;r++){const n=net(r),M=getMap(r);
  for(const ci in n.h)A.push({r,k:'h'+ci,m:localM(r),c:localC(r,+ci)});
  for(const ln of M.lanes)if(n.l[ln.id])A.push({r,k:'l'+ln.id,m:laneM(r,ln),c:laneC(r,ln)});
 }
 return A;
}
/* optimal spread of fleet capacity F over arcs. returns income (before global
   multipliers), lambda (marginal $ per unit of fleet), used capacity, per-arc load */
function solveNet(F,A){
 if(!(F>0)||!A.length)return{inc:0,lam:A.length?Math.max(...A.map(a=>a.m)):0,used:0,load:{}};
 let sc=0,scl=0,mn=Infinity,mx=-Infinity;
 for(const a of A){const l=Math.log(a.m);sc+=a.c;scl+=a.c*l;if(l<mn)mn=l;if(l>mx)mx=l}
 let L=(scl-F)/sc;
 if(L>mn){let lo=mn,hi=mx;for(let i=0;i<60;i++){const mid=(lo+hi)/2;let g=0;for(const a of A){const d=Math.log(a.m)-mid;if(d>0)g+=a.c*d}if(g>F)lo=mid;else hi=mid}L=(lo+hi)/2}
 const lam=Math.exp(L);let inc=0,used=0;const load={};
 for(const a of A){if(a.m>lam){inc+=a.c*(a.m-lam);used+=a.c*(1-lam/a.m);load[a.r+':'+a.k]=1-lam/a.m}else load[a.r+':'+a.k]=0}
 return{inc,lam,used,load};
}
/* income change if the network were modified by fn (fn mutates, undo reverts) */
function netDelta(fn,undo){const F=D.F,b=solveNet(F,netArcs()).inc;fn();const a=solveNet(F,netArcs()).inc;undo();return(a-b)*D.perm*D.tail}

/* actions (pure state changes; UI wraps them) */
function doOpenLane(r,ln){const c=laneOpenCost(r,ln);if(!laneOpenable(r,ln)||S.cash<c)return false;S.cash-=c;net(r).l[ln.id]=1;S.lanesOpened=(S.lanesOpened||0)+1;return true}
function doRoad(r,ln){const lv=laneLv(r,ln.id);if(!lv||lv>=roadMax(r))return false;const c=roadCost(r,ln);if(S.cash<c)return false;S.cash-=c;net(r).l[ln.id]=lv+1;S.roadsBuilt=(S.roadsBuilt||0)+1;return true}
function doHub(r,ci){const h=hubAt(r,ci);if(h>=NK.hubMax||(!h&&!cityLinked(r,ci)))return false;const c=hubCost(r,ci);if(S.cash<c)return false;S.cash-=c;net(r).h[ci]=h+1;S.hubsBuilt=(S.hubsBuilt||0)+1;return true}
