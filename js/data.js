"use strict";
/* ---------- data ---------- */
const FLEET=[
 {name:'Pickup Truck',icon:'🛻',base:15,rate:.2},
 {name:'Box Van',icon:'🚐',base:120,rate:1.4},
 {name:'Day Cab Semi',icon:'🚛',base:1300,rate:9},
 {name:'Reefer Rig',icon:'🧊',base:14000,rate:50},
 {name:'Fuel Tanker',icon:'⛽',base:150000,rate:270},
 {name:'Car Hauler',icon:'🚗',base:1.6e6,rate:1500},
 {name:'Heavy Haul',icon:'🏗️',base:2e7,rate:8500},
 {name:'Road Train',icon:'🚂',base:3.3e8,rate:50000},
 {name:'Autonomous Convoy',icon:'🤖',base:5.1e9,rate:310000},
 {name:'Hyperfreight Pod',icon:'🚀',base:7.5e10,rate:2e6},
 {name:'Maglev Freighter',icon:'🚄',base:1e12,rate:1.3e7},
 {name:'Orbital Lifter',icon:'🛰️',base:1.4e13,rate:8e7},
 {name:'Warp Courier',icon:'🌀',base:1.7e14,rate:4.4e8},
];
const MILES=[10,25,50,100,150,200,250,300,400,500,600,700,800,900,1000,1250,1500,1750,2000,2500,3000];
const ROUTES=[
 {name:'Local Runs',icon:'🏘️',cost:0,mult:1,desc:'Groceries, furniture and garage-sale finds.'},
 {name:'Farm Country',icon:'🌾',cost:2.5e4,mult:1.5,desc:'Grain, feed and fresh produce.'},
 {name:'Mountain Pass',icon:'🏔️',cost:3e6,mult:2.5,desc:'Steep grades, big paydays.'},
 {name:'Desert Express',icon:'🌵',cost:5e8,mult:4,desc:'Long, hot hauls across the badlands.'},
 {name:'Ice Road',icon:'❄️',cost:1e11,mult:7,desc:'Frozen lakes. Hazard pay included.'},
 {name:'Neon Megacity',icon:'🌃',cost:3e13,mult:12,desc:'Round-the-clock deliveries in the city that never sleeps.'},
 {name:'Lunar Haul',icon:'🌕',cost:1e16,mult:25,desc:'Low gravity, astronomical rates.'},
 {name:'Mars Colony',icon:'🔴',cost:5e19,mult:60,desc:'Supply runs for the red-planet settlers.'},
 {name:'Asteroid Belt',icon:'☄️',cost:2e23,mult:150,desc:'Mining freight through a field of floating rock.'},
 {name:'Galactic Ring',icon:'🌌',cost:1e28,mult:400,desc:'The final frontier of freight.'},
];
const UPS=[];
const T=(id,cost,ic,name,desc,e)=>UPS.push({id,cost,ic,name,desc,e});
T('tap1',100,'🦶','Lead Foot','Tap value ×2',{tap:2});
T('tap2',750,'📯','Air Horn','Tap value ×2',{tap:2});
T('auto1',3000,'🧭','Auto-Dispatch','Your rig drives itself: 2 taps/sec',{auto:2});
T('tap3',1e4,'🛑','Jake Brake','Tap value ×2',{tap:2});
T('combo1',5e4,'🎵','Rhythm Driving','Combo bonus caps at ×5 instead of ×3',{combo:5});
T('tap4',1e5,'📻','CB Radio','Each tap also earns 1% of your $/sec',{pct:.01});
T('broker',3e5,'🤝','Freight Broker','Rush orders show up twice as often and stay longer',{broker:1});
T('night',2e6,'🌙','Night Shift Crews','Offline earnings 50% → 100%',{off:1});
T('auto2',5e6,'🛣️','Cruise Control','Auto-drive at 5 taps/sec',{auto:5});
T('tap5',1e7,'📱','Dispatch App','Taps earn +2% of $/sec',{pct:.02});
T('combo2',1e8,'🎸','Highway Rock','Combo bonus caps at ×8',{combo:8});
T('tap6',1e9,'🛰️','Satellite Routing','Taps earn +3% of $/sec',{pct:.03});
T('auto3',1e10,'🧠','Autopilot','Auto-drive at 10 taps/sec',{auto:10});
T('tap7',1e12,'⚡','Neural Dispatch','Taps earn +5% of $/sec',{pct:.05});
T('combo3',1e14,'🥁','Drum Solo','Combo bonus caps at ×12',{combo:12});
T('tap8',1e15,'🛸','Quantum Dispatch','Taps earn +8% of $/sec',{pct:.08});
T('auto4',1e16,'🦾','Robo-Drivers','Auto-drive at 20 taps/sec',{auto:20});
T('tap9',1e20,'🔮','Precog Routing','Taps earn +12% of $/sec',{pct:.12});
[[2e4,'💳','Fuel Card',1.25],[5e5,'📝','Union Contract',1.5],[5e7,'⚓','Port Partnership',2],[5e9,'🚆','Rail Intermodal',2],[5e11,'🛩️','Air Cargo Wing',2],[5e13,'🌐','Global Logistics Net',3],[5e15,'🪐','Orbital Depot',3],[5e17,'♾️','Infinite Supply Chain',5],[5e19,'🔭','Interplanetary Charter',5],[5e21,'🧲','Gravity Tethers',5],[5e23,'🌠','Wormhole Express',10],[5e26,'🕳️','Multiverse Logistics',10],[5e29,'✨','Cosmic Monopoly',25]]
 .forEach(([c,ic,n,g],k)=>T('g'+k,c,ic,n,'All income ×'+g,{g}));
const FU=[[1,10,'Retreaded Tires'],[5,50,'Veteran Drivers'],[25,500,'GPS Telematics'],[50,5e4,'Aero Skirts'],[100,5e6,'Platooning'],[150,5e8,'Hydrogen Swap'],[200,5e10,'Fusion Drives'],[250,5e12,'Quantum Cargo'],[300,5e14,'Singularity Drives'],[400,5e17,'Reality Benders'],[500,5e20,'Time-Folded Freight']];
FLEET.forEach((f,i)=>FU.forEach(([need,m,n],k)=>UPS.push({id:`f${i}_${k}`,cost:f.base*m,ic:f.icon,name:n,desc:`${f.name}s ×2`,e:{f:i,x:2},need})));

const ACH=[
 ['🏁','First Delivery','Complete a delivery',()=>S.deliveries>=1],
 ['🛞','Road Warrior','100 deliveries',()=>S.deliveries>=100],
 ['🗺️','Million Miler','1,000 deliveries',()=>S.deliveries>=1000],
 ['👑','Road Legend','10,000 deliveries',()=>S.deliveries>=1e4],
 ['👆','Itchy Throttle','Tap 500 times',()=>S.taps>=500],
 ['💪','Iron Thumb','Tap 5,000 times',()=>S.taps>=5000],
 ['🪙','Pocket Change','Earn $1K total',()=>S.allEarn>=1e3],
 ['💵','Millionaire','Earn $1M total',()=>S.allEarn>=1e6],
 ['💰','Billionaire','Earn $1B total',()=>S.allEarn>=1e9],
 ['🏦','Trillionaire','Earn $1T total',()=>S.allEarn>=1e12],
 ['💎','Quadrillionaire','Earn $1Qa total',()=>S.allEarn>=1e15],
 ['🚚','Small Fleet','Own 10 vehicles',()=>fleetTotal()>=10],
 ['🚛','Fleet Owner','Own 100 vehicles',()=>fleetTotal()>=100],
 ['🏭','Logistics Giant','Own 500 vehicles',()=>fleetTotal()>=500],
 ['🎖️','Full Lineup','Own every vehicle type',()=>S.fleet.every(n=>n>0)],
 ['📦','Rush Hour','Catch a rush order',()=>S.goldens>=1],
 ['🎯','Freight Hunter','Catch 25 rush orders',()=>S.goldens>=25],
 ['🔥','In the Zone','Max out your combo',()=>S.maxCombo>=100],
 ['🏔️','Mountain Man','Reach Mountain Pass',()=>S.route>=2],
 ['🌕','To the Moon','Reach Lunar Haul',()=>S.route>=6],
 ['🔔','Ring the Bell','Go public',()=>S.ipos>=1],
 ['📈','Serial Founder','Go public 5 times',()=>S.ipos>=5],
 ['⏱️','Rolling','Earn $100/sec',()=>D.income>=100],
 ['🚀','Juggernaut','Earn $1M/sec',()=>D.income>=1e6],
 ['🌌','Unstoppable','Earn $1B/sec',()=>D.income>=1e9],
 ['💥','Trillion Per Sec','Earn $1T/sec',()=>D.income>=1e12],
 ['🔴','Red Planet Rig','Reach Mars Colony',()=>S.route>=7],
 ['🌀','Galaxy Brain','Reach the Galactic Ring',()=>S.route>=9],
 ['🌟','Sextillionaire','Earn $1Sx total',()=>S.allEarn>=1e21],
 ['🪐','Beyond Money','Earn $1Oc total',()=>S.allEarn>=1e27],
 ['🚢','Armada','Own 1,000 vehicles',()=>fleetTotal()>=1000],
 ['📋','Contractor','Complete 10 contracts',()=>S.contractsDone>=10],
 ['🗂️','Prime Contractor','Complete 100 contracts',()=>S.contractsDone>=100],
 ['💠','Board Member','Buy an executive perk',()=>perkTotal()>=1],
 ['🏛️','Chairman','Own 25 perk levels',()=>perkTotal()>=25],
 ['🤖','Hands Off','Own every automation perk',()=>['autoFleet','autoUp','autoRoute','magnet','autoClaim'].every(has)],
];
const PERKS=[
 {id:'start',ic:'💼',name:'Seed Capital',max:6,base:5,g:5,info:l=>l?`Start each run with ${money(Math.pow(1000,l))}`:'Start each run with $0'},
 {id:'keepRoute',ic:'🗺️',name:'Route Rights',max:9,base:10,g:4,info:l=>l?`Keep routes up to ${ROUTES[l].name} on IPO`:'Routes reset on IPO'},
 {id:'keepUps',ic:'🧳',name:'Corporate Memory',max:1,base:40,info:()=>'Keep tap, auto-drive, combo, broker & night-shift upgrades on IPO'},
 {id:'yield',ic:'📈',name:'Shareholder Value',max:10,base:15,g:3,info:l=>`Each share gives +${(2+l*.5).toFixed(1)}%`},
 {id:'brand',ic:'🏷️',name:'Brand Recognition',max:60,base:25,g:3.5,info:l=>`All income ×${fmt(Math.pow(2,l))}`},
 {id:'offline',ic:'📒',name:'Long-Haul Logbook',max:6,base:8,g:3,info:l=>`Offline earnings cap ${8+4*l}h`},
 {id:'rushHQ',ic:'📡',name:'Dispatch HQ',max:4,base:10,g:3,info:l=>`Rush orders ${(1+.25*l).toFixed(2)}× as often`},
 {id:'contracts',ic:'🤝',name:'Preferred Carrier',max:5,base:12,g:3,info:l=>`Contract rewards ×${(1+.5*l).toFixed(1)}`},
 {id:'autoFleet',ic:'🚛',name:'Fleet Manager',max:1,base:20,tog:'fleet',info:()=>'Automatically buys the best-value vehicle'},
 {id:'autoUp',ic:'🔧',name:'Procurement Dept.',max:1,base:35,tog:'up',info:()=>'Automatically buys affordable upgrades'},
 {id:'autoRoute',ic:'🧭',name:'Route Planner',max:1,base:50,tog:'route',info:()=>'Automatically unlocks the next route'},
 {id:'magnet',ic:'🧲',name:'Rush Magnet',max:1,base:30,tog:'magnet',info:()=>'Automatically catches rush orders'},
 {id:'autoClaim',ic:'📥',name:'Back Office',max:1,base:25,tog:'claim',info:()=>'Automatically claims finished contracts'},
];
const perkLvl=id=>S.perks[id]||0;
const has=id=>perkLvl(id)>0;
const perkTotal=()=>Object.values(S.perks).reduce((a,b)=>a+b,0);
const perkCost=p=>Math.ceil(p.base*Math.pow(p.g||1,perkLvl(p.id)));

/* ---------- format ---------- */
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n){
 if(!isFinite(n))return '∞'; if(n<0)return '-'+fmt(-n);
 if(n<1000)return n<10?(Math.floor(n*10)/10).toString():Math.floor(n).toString();
 if(S&&S.sci&&n>=1e6)return n.toExponential(2).replace('+','');
 const i=Math.floor(Math.log10(n)/3);
 if(i<SUF.length){const v=n/Math.pow(10,i*3);return (v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v).toString())+SUF[i];}
 return n.toExponential(2).replace('+','');
}
const money=n=>'$'+fmt(n);
function dur(s){if(!isFinite(s))return '∞';s=Math.floor(s);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d>999?'999d+':d?`${d}d ${h}h`:h?`${h}h ${m}m`:m?`${m}m ${s%60}s`:`${s}s`}

/* ---------- state ---------- */
const KEY='haulEmpire_v1';
const runState=()=>({cash:0,runEarn:0,fleet:FLEET.map(()=>0),ups:{},route:0,prog:0,boosts:[]});
const newGame=()=>Object.assign(runState(),{allEarn:0,shares:0,ipos:0,taps:0,deliveries:0,goldens:0,maxCombo:0,ach:{},sound:true,haptic:true,buyAmt:1,last:Date.now(),started:Date.now(),div:0,perks:{},autos:{fleet:1,up:1,route:1,magnet:1,claim:1},contracts:[],contractsDone:0,bought:0,rerollAt:0,sci:false,lowfx:false});
let S=null,D={},noSave=false;
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&typeof d==='object'){const ng=newGame();S=Object.assign(ng,d);S.autos=Object.assign(newGame().autos,d.autos||{});while(S.fleet.length<FLEET.length)S.fleet.push(0);return true}}catch(e){}S=newGame();return false}
function save(){if(noSave)return;S.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const fleetTotal=()=>S.fleet.reduce((a,b)=>a+b,0);
const milestones=n=>MILES.filter(m=>n>=m).length;
const nextMile=n=>MILES.find(m=>m>n)||Infinity;
const prevMile=n=>{let p=0;for(const m of MILES)if(n>=m)p=m;return p};
const totalSharesFor=e=>Math.floor(Math.sqrt(e/1e7));
const pendingShares=()=>Math.max(0,totalSharesFor(S.allEarn)-S.shares);

function calc(){
 const now=Date.now();
 if(S.boosts.length)S.boosts=S.boosts.filter(b=>b.until>now);
 let tapMult=1,tapPct=0,auto=0,global=1,comboCap=3,offline=.5,broker=false;
 const fm=FLEET.map((f,i)=>Math.pow(2,milestones(S.fleet[i])));
 for(const u of UPS){if(!S.ups[u.id])continue;const e=u.e;
  if(e.tap)tapMult*=e.tap;if(e.pct)tapPct+=e.pct;if(e.auto)auto=Math.max(auto,e.auto);if(e.g)global*=e.g;
  if(e.combo)comboCap=Math.max(comboCap,e.combo);if(e.off)offline=e.off;if(e.broker)broker=true;if('f' in e)fm[e.f]*=e.x}
 const achN=Object.keys(S.ach).length;
 const shareRate=.02+.005*perkLvl('yield');
 const perm=ROUTES[S.route].mult*(1+shareRate*S.shares)*(1+.01*achN)*global*Math.pow(2,perkLvl('brand'));
 let tail=1,nitro=1;for(const b of S.boosts){if(b.k==='tail')tail*=b.m;if(b.k==='nitro')nitro*=b.m}
 const unit=FLEET.map((f,i)=>f.rate*fm[i]*perm);
 const income=unit.reduce((a,u,i)=>a+u*S.fleet[i],0)*tail;
 const baseTap=(tapMult*perm+income*tapPct)*nitro;
 D={tapMult,tapPct,auto,global,comboCap,offline,broker,fm,unit,income,baseTap,perm,tail,nitro,achN,shareRate,offCap:(8+4*perkLvl('offline'))*3600,rushMult:1+.25*perkLvl('rushHQ'),cMult:1+.5*perkLvl('contracts')};
}
function earn(v){S.cash+=v;S.runEarn+=v;S.allEarn+=v}

