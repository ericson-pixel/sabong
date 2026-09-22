import Peer from "peerjs";

let isMusicOn=false,bgMusic,fightMusic,audioCtx;
window.toggleMusic=async()=>{
bgMusic=document.getElementById('bgMusic');fightMusic=document.getElementById('fightMusic');
const btn=document.getElementById('musicBtn');
try{
if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
if(audioCtx.state==='suspended') await audioCtx.resume();
if(!isMusicOn){bgMusic.volume=0.25;fightMusic.volume=0.35;bgMusic.currentTime=0;await bgMusic.play();btn.innerHTML="🔊 ON";btn.classList.add('on');isMusicOn=true;}
else{bgMusic.pause();fightMusic.pause();btn.innerHTML="🔇 MUSIC";btn.classList.remove('on');isMusicOn=false;}
}catch(e){}
}
function playFightMusic(){if(!isMusicOn) return;try{bgMusic.pause();fightMusic.currentTime=0;fightMusic.play();}catch{}}
function stopFightMusic(){if(!isMusicOn) return;try{fightMusic.pause();bgMusic.play();}catch{}}

let pesos=parseInt(localStorage.getItem('pesos'))||50000;
let feeds=parseInt(localStorage.getItem('feeds'))||50;
let feedInv=JSON.parse(localStorage.getItem('feedInv')||'null')||{feed:5,corn:5,vitamin:2,hpfood:2};
let chickens=JSON.parse(localStorage.getItem('chickens')||'null')||[
{id:'c1',name:'Alas',breed:'Shamo',atk:110,hp:400,maxHp:400,spd:70,grit:90,gender:'male',price:0},
{id:'c2',name:'Bagsik',breed:'Asil',atk:105,hp:420,maxHp:420,spd:65,grit:85,gender:'female',price:0}
];
let selectedChicken=null,currentFeedChicken=null,currentSellChicken=null;
let liveMyChicken=null;
let liveMode='fight';
let spriteFrame=0;

const BREEDS_20=[
{name:'Shamo',icon:'🐔',price:20000,atk:110,spd:68,desc:'King',hp:380},
{name:'Asil',icon:'🐔💪',price:22000,atk:108,spd:65,desc:'Warrior',hp:400},
{name:'Kelso',icon:'🐔⚡',price:25000,atk:112,spd:78,desc:'Speed',hp:360},
{name:'Sweater',icon:'🐔💪',price:28000,atk:115,spd:74,desc:'Power',hp:420},
{name:'Hatch',icon:'🐔🌪️',price:30000,atk:118,spd:70,desc:'Storm',hp:440},
{name:'Roundhead',icon:'🐔🎯',price:32000,atk:120,spd:72,desc:'Sniper',hp:400},
{name:'Albany',icon:'🐔❤️',price:35000,atk:122,spd:80,desc:'Heart',hp:380},
{name:'Claret',icon:'🐔🩸',price:38000,atk:125,spd:76,desc:'Blood',hp:460},
{name:'Grey',icon:'🐔🌫️',price:40000,atk:128,spd:82,desc:'Ghost',hp:420},
{name:'Whitehackle',icon:'🐔🤍',price:42000,atk:130,spd:75,desc:'Legend',hp:480},
{name:'Brownred',icon:'🐔🤎',price:45000,atk:132,spd:77,desc:'Beast',hp:500},
{name:'Butcher',icon:'🐔🔪',price:48000,atk:135,spd:79,desc:'Cutter',hp:460},
{name:'Spangled',icon:'🐔✨',price:50000,atk:138,spd:81,desc:'Shine',hp:440},
{name:'Dom',icon:'🐔⚫',price:55000,atk:140,spd:73,desc:'Dom',hp:520},
{name:'Lemons',icon:'🐔🍋',price:58000,atk:142,spd:84,desc:'Lemon',hp:480},
{name:'Radio',icon:'🐔📻',price:60000,atk:145,spd:83,desc:'Radio',hp:500},
{name:'YLH',icon:'🐔💛',price:65000,atk:148,spd:85,desc:'Yellow Leg',hp:540},
{name:'Black',icon:'🐔🖤',price:70000,atk:150,spd:78,desc:'Black',hp:560},
{name:'Gold',icon:'🐔🥇',price:75000,atk:155,spd:86,desc:'Gold',hp:580},
{name:'Apex',icon:'🐔🏆',price:80000,atk:160,spd:88,desc:'Apex',hp:600},
];

const fighters=BREEDS_20.map((b,i)=>({
id:'f'+(i+1),
name:b.name,
breed:b.name,
atk:b.atk+Math.floor(Math.random()*10),
hp:b.hp+Math.floor(Math.random()*40),
maxHp:b.hp+Math.floor(Math.random()*40),
spd:b.spd,
price:b.price,
icon:b.icon
}));

const bettorsData=[
{id:'b1',name:'Mang Juan',avatar:'👨‍🌾',money:15000,type:'normal'},
{id:'b2',name:'Boss Amo',avatar:'😎',money:85000,type:'whale'},
{id:'b3',name:'Aling Nena',avatar:'👵',money:8000,type:'small'},
{id:'b4',name:'Pareng Boy',avatar:'🧔',money:45000,type:'rich'},
{id:'b5',name:'Tisay',avatar:'👩',money:12000,type:'normal'},
{id:'b6',name:'Batang Hamog',avatar:'🧒',money:5000,type:'small'},
{id:'b7',name:'Kapitan',avatar:'👨‍✈️',money:120000,type:'whale'},
{id:'b8',name:'Mayor',avatar:'🤵',money:95000,type:'whale'},
{id:'b9',name:'Tondo Boy',avatar:'😈',money:25000,type:'normal'},
{id:'b10',name:'Binondo King',avatar:'🐉',money:150000,type:'whale'},
{id:'b11',name:'Manila Boy',avatar:'🏙️',money:18000,type:'normal'},
{id:'b12',name:'Cebuano',avatar:'🌊',money:35000,type:'rich'},
{id:'b13',name:'Davao King',avatar:'🦅',money:110000,type:'whale'},
{id:'b14',name:'Ilocano',avatar:'🌾',money:9000,type:'small'},
{id:'b15',name:'Bicolano',avatar:'🌶️',money:22000,type:'normal'},
{id:'b16',name:'Waray',avatar:'💪',money:28000,type:'normal'},
{id:'b17',name:'Pangasinan',avatar:'🐟',money:42000,type:'rich'},
{id:'b18',name:'Batangas',avatar:'☕',money:67000,type:'rich'},
{id:'b19',name:'Laguna Boy',avatar:'🦆',money:11000,type:'small'},
{id:'b20',name:'Pampanga',avatar:'🍲',money:55000,type:'rich'},
{id:'b21',name:'Bossing Vic',avatar:'🎬',money:200000,type:'whale'},
{id:'b22',name:'Rich Kid',avatar:'💰',money:180000,type:'whale'},
{id:'b23',name:'Sabungero',avatar:'🐓',money:30000,type:'normal'},
{id:'b24',name:'Tari King',avatar:'👑',money:75000,type:'rich'},
{id:'b25',name:'Pitmaster',avatar:'🔥',money:48000,type:'rich'},
{id:'b26',name:'Kristo',avatar:'🤝',money:15000,type:'normal'},
{id:'b27',name:'Mananaya',avatar:'💸',money:6000,type:'small'},
{id:'b28',name:'High Roller',avatar:'🎰',money:250000,type:'whale'},
{id:'b29',name:'Lucky Boy',avatar:'🍀',money:38000,type:'rich'},
{id:'b30',name:'Bets Master',avatar:'🧠',money:90000,type:'whale'},
].map(b=>({...b,side:0,bet:0,trash:'',winning:false}));

let bettors=[];

const trashLines={
wala:["WALA ako! Maliit lang pero tiwala ako!","Dehado WALA pero may palo yan!","WALA ako 5k lang","Boss WALA tayo kaya yan!","WALA pero malakas yan!","5k WALA baka sakali!","WALA ako small bet lang","Dehado pero WALA ako may laban"],
meron:["MERON ako! Malaki taya ko!","MERON syempre lamang yan!","MERON 20k ako!","MERON ako sigurado yan!","MERON 50k!","MERON all in ako!","MERON kita sa katawan!","50k MERON! Sure win!"],
neutral:["Magkano na pot?","Sino lamang?","Grabe laban ah","Panay WALA ah","MERON malakas","Magkano kayo boss?","Anong balita?","Sino manok mo?","Ano pustahan?","May laban ba?","Mainit laban ah","Grabe taya ni bossing","Laki pot ah","Sino mananalo?","Dikit laban ah"],
talking:["Boss @BOSS kaya yan WALA mo!","Pre @NAME lakihan MERON!","Bossing @BOSS laki taya ah!","@NAME all in ka na?","Grabe boss @BOSS 50k!","@NAME small lang ako","Boss @BOSS pahingi tip!","Pre @NAME magkano ka?","Bossing @BOSS WALA ka rin?","@NAME MERON ka ba?","Boss @BOSS sabay WALA!","@NAME lakihan MERON mo!"]
};

function saveGame(){localStorage.setItem('chickens',JSON.stringify(chickens));localStorage.setItem('pesos',pesos);localStorage.setItem('feeds',feeds);localStorage.setItem('feedInv',JSON.stringify(feedInv));}
function addLog(t){const l=document.getElementById('watchLog');if(l) l.innerHTML='<div>• '+t+'</div>'+l.innerHTML;}
function updateRes(){
document.getElementById('pesos').innerText=pesos.toLocaleString();
document.getElementById('feeds').innerText=feeds;
const farmPesos=document.getElementById('farmPesos');if(farmPesos) farmPesos.innerText='P'+pesos.toLocaleString();
const farmFeeds=document.getElementById('farmFeeds');if(farmFeeds) farmFeeds.innerText=feeds;
const farmCount=document.getElementById('farmCount');if(farmCount) farmCount.innerText=chickens.length+' manok';
const m1=document.getElementById('marketPesos');if(m1) m1.innerText=pesos.toLocaleString();
const inv=document.getElementById('invCount');if(inv) inv.innerText=Object.values(feedInv).reduce((a,b)=>a+b,0);
saveGame();
}
function renderFarm(){
const g=document.getElementById('farmGrid');if(!g) return;g.innerHTML='';
chickens.forEach(c=>{
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
const hpPct=(c.hp/c.maxHp*100);
const hpColor=hpPct<30?'#ff4444':hpPct<60?'#ffb400':'#4caf50';
const d=document.createElement('div');d.className='farm-card';
d.innerHTML='<div class="farm-card-name">'+bData.icon+' '+c.name+'</div><div class="farm-card-breed">'+c.breed+' HP:'+c.maxHp+'</div><div class="farm-card-stats"><div class="farm-card-stat">ATK <b>'+c.atk+'</b></div><div class="farm-card-stat">SPD <b>'+c.spd+'</b></div></div><div class="farm-card-hp"><div style="font-size:9px;color:#666;margin-bottom:4px">HP '+c.hp+'/'+c.maxHp+'</div><div class="farm-card-hp-bar"><div class="farm-card-hp-fill" style="width:'+hpPct+'%;background:'+hpColor+'"></div></div></div><div class="farm-card-actions"><button class="feed-btn" onclick="openFeedModal(\''+c.id+'\');event.stopPropagation()">FEED</button><button class="select-btn" onclick="selectForLive(\''+c.id+'\');event.stopPropagation()">SELECT</button></div>';
g.appendChild(d);
});
updateBreedSelectors();updateRes();renderSellGrid();
}
function renderSellGrid(){
const g=document.getElementById('sellChickenGrid');if(!g) return;g.innerHTML='';
if(chickens.length===0){g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:#666">Wala pa manok</div>';return;}
chickens.forEach(c=>{
const sellPrice=Math.floor(c.atk*120+c.maxHp*80);
const d=document.createElement('div');d.className='farm-card';
d.innerHTML='<div class="farm-card-name">'+c.name+'</div><div style="text-align:center;margin:8px 0"><b style="color:#fff;font-size:14px">P'+sellPrice.toLocaleString()+'</b></div><button class="sell-btn" style="width:100%;padding:10px;border:none;border-radius:8px;font-family:Black Ops One" onclick="openSellModal(\''+c.id+'\')">BENTA</button>';
g.appendChild(d);
});
}
window.selectForLive=(id)=>{
const c=chickens.find(x=>x.id===id);if(!c) return;liveMyChicken=c;const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};const sel=document.getElementById('liveChickenSel');if(sel) sel.value=id;const info=document.getElementById('liveMyChickenInfo');if(info) info.innerHTML='Selected: <b style="color:#fff">'+bData.icon+' '+c.name+'</b> ATK:'+c.atk+' HP:'+c.maxHp+' READY';setLiveMode('fight');showPage('watch');addLog('Selected '+c.name);
}
window.openSellModal=(id)=>{
const c=chickens.find(x=>x.id===id);if(!c) return;currentSellChicken=c;
const sellPrice=Math.floor(c.atk*120+c.maxHp*80);
document.getElementById('sellChickenInfo').innerHTML='<b>'+c.name+'</b><br>'+c.breed+' HP:'+c.maxHp+'<br>P'+sellPrice.toLocaleString();
document.getElementById('confirmSellBtn').onclick=()=>confirmSell();
document.getElementById('sellModal').style.display='flex';
}
window.closeSellModal=()=>{document.getElementById('sellModal').style.display='none';currentSellChicken=null;}
window.confirmSell=()=>{
if(!currentSellChicken) return;
const sellPrice=Math.floor(currentSellChicken.atk*120+currentSellChicken.maxHp*80);
pesos+=sellPrice;chickens=chickens.filter(c=>c.id!==currentSellChicken.id);
if(liveMyChicken&&liveMyChicken.id===currentSellChicken.id) liveMyChicken=null;
addLog('Benta: '+currentSellChicken.name+' P'+sellPrice.toLocaleString());closeSellModal();updateRes();renderFarm();renderBreed();
}
function updateBreedSelectors(){
const maleSel=document.getElementById('maleSel'),femaleSel=document.getElementById('femaleSel');
if(!maleSel) return;
maleSel.innerHTML='<option value="">Lalaki...</option>';
femaleSel.innerHTML='<option value="">Babae...</option>';
chickens.forEach(c=>{
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
const opt='<option value="'+c.id+'">'+bData.icon+' '+c.name+' ('+c.atk+')</option>';
if(c.gender==='male') maleSel.innerHTML+=opt;
else femaleSel.innerHTML+=opt;
});
const liveSel=document.getElementById('liveChickenSel');
if(liveSel){
liveSel.innerHTML='<option value="">Pili manok...</option>';
chickens.forEach(c=>{
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
liveSel.innerHTML+='<option value="'+c.id+'">'+bData.icon+' '+c.name+' ATK:'+c.atk+' HP:'+c.maxHp+'</option>';
});
if(liveMyChicken) liveSel.value=liveMyChicken.id;
}
updatePairPreview();
}
function updatePairPreview(){
const mId=document.getElementById('maleSel')?.value;
const fId=document.getElementById('femaleSel')?.value;
const mPrev=document.getElementById('malePreview');
const fPrev=document.getElementById('femalePreview');
if(!mPrev||!fPrev) return;
if(mId){const m=chickens.find(c=>c.id===mId);if(m){const bData=BREEDS_20.find(b=>b.name===m.breed)||{icon:'🐓'};mPrev.innerHTML='<b>'+bData.icon+' '+m.name+'</b> ATK:'+m.atk;mPrev.classList.add('has-chicken');}}else{mPrev.innerHTML='Pili...';mPrev.classList.remove('has-chicken');}
if(fId){const f=chickens.find(c=>c.id===fId);if(f){const bData=BREEDS_20.find(b=>b.name===f.breed)||{icon:'🐓'};fPrev.innerHTML='<b>'+bData.icon+' '+f.name+'</b> ATK:'+f.atk;fPrev.classList.add('has-chicken');}}else{fPrev.innerHTML='Pili...';fPrev.classList.remove('has-chicken');}
}
window.setLiveMode=(mode)=>{
liveMode=mode;
const fightBtn=document.getElementById('modeFightBtn'),watchBtn=document.getElementById('modeWatchBtn'),playerBox=document.getElementById('playerSelectBox'),watchBox=document.getElementById('watchModeBox');
if(mode==='fight'){fightBtn.classList.add('active');watchBtn.classList.remove('active');playerBox.style.display='flex';watchBox.style.display='none';}
else{watchBtn.classList.add('active');fightBtn.classList.remove('active');playerBox.style.display='none';watchBox.style.display='block';}
resetBettingUI();
}
window.selectLiveChicken=()=>{
const sel=document.getElementById('liveChickenSel');
if(!sel.value){alert('Pili ka muna');return;}
const c=chickens.find(x=>x.id===sel.value);if(!c) return;liveMyChicken=c;
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
const info=document.getElementById('liveMyChickenInfo');
if(info) info.innerHTML='Selected: <b style="color:#fff">'+bData.icon+' '+c.name+'</b> HP:'+c.maxHp+' READY';
addLog('Selected '+c.name);setLiveMode('fight');
}
window.openFeedModal=(id)=>{
const c=chickens.find(x=>x.id===id);if(!c) return;currentFeedChicken=c;
document.getElementById('feedChickenName').innerText=c.name;
document.getElementById('feedChickenStats').innerHTML='<b>'+c.name+'</b> '+c.breed+'<br>HP: '+c.hp+'/'+c.maxHp+' ATK:'+c.atk;
const list=document.getElementById('feedInventoryList');list.innerHTML='';
const items=[{key:'corn',icon:'🌽',name:'Corn',desc:'+30 HP'},{key:'vitamin',icon:'💊',name:'Vitamin',desc:'+10 ATK'},{key:'hpfood',icon:'❤️',name:'HP Food',desc:'+40 MAX HP'}];
items.forEach(it=>{
const has=feedInv[it.key]>0;
const div=document.createElement('div');div.style.cssText='background:'+(has?'#111':'#050505')+';border:1px solid #1a1a1a;padding:10px;border-radius:8px;display:flex;justify-content:space-between;cursor:'+(has?'pointer':'not-allowed')+';opacity:'+(has?'1':'0.4');
div.innerHTML='<div><b>'+it.icon+' '+it.name+'</b> <span style="color:#666">'+it.desc+'</span></div><div>x'+feedInv[it.key]+'</div>';
if(has) div.onclick=()=>useFeed(it.key);
list.appendChild(div);
});
document.getElementById('feedModal').style.display='flex';
}
window.closeFeedModal=()=>{document.getElementById('feedModal').style.display='none';currentFeedChicken=null;}
window.useFeed=(type)=>{
if(!currentFeedChicken) return;
if(feedInv[type]<=0){alert('Wala stock');return;}
feedInv[type]--;
if(type==='corn') currentFeedChicken.hp=Math.min(currentFeedChicken.maxHp,currentFeedChicken.hp+30);
if(type==='vitamin') currentFeedChicken.atk+=10;
if(type==='hpfood'){currentFeedChicken.maxHp+=40;currentFeedChicken.hp+=40;}
addLog(currentFeedChicken.name+' + '+type);updateRes();renderFarm();
if(currentFeedChicken) openFeedModal(currentFeedChicken.id);
}
window.breedNow=()=>{
const maleSel=document.getElementById('maleSel'),femaleSel=document.getElementById('femaleSel'),msg=document.getElementById('breedMsg'),inc=document.getElementById('incubator');
const m=maleSel?.value,f=femaleSel?.value;
if(!m||!f){msg.innerText='Pili lalaki at babae';msg.className='breed-msg error';return;}
if(m===f){msg.innerText='Same bawal';msg.className='breed-msg error';return;}
const male=chickens.find(c=>c.id==m),female=chickens.find(c=>c.id==f);
if(male.gender===female.gender){msg.innerText='Same gender bawal';msg.className='breed-msg error';return;}
if(feeds<30){msg.innerText='Kulang 30 feeds';msg.className='breed-msg error';return;}
feeds-=30;msg.innerText='Breeding...';msg.className='breed-msg';
inc.innerHTML='Incubating '+male.name+' x '+female.name+'...';
setTimeout(()=>{
const newBreedData=BREEDS_20[Math.floor(Math.random()*BREEDS_20.length)];
const baseAtk=Math.floor((male.atk+female.atk)/2);
const baseHp=Math.floor((male.maxHp+female.maxHp)/2);
const newName=['Alas','Bagsik','Kidlat','Bagyo','Aguila','Tigre','Lakas','Tapang','Bilis','Talim'][Math.floor(Math.random()*10)]+' '+Math.floor(Math.random()*99);
const newC={id:'c'+Date.now(),name:newName,breed:newBreedData.name,atk:baseAtk+Math.floor(Math.random()*10)+newBreedData.atk-110,hp:newBreedData.hp,maxHp:baseHp+Math.floor(Math.random()*30)+100,spd:60+Math.floor(Math.random()*20)+newBreedData.spd-70,grit:80,gender:Math.random()>0.5?'male':'female',price:0};
newC.hp=newC.maxHp;chickens.push(newC);
msg.innerHTML='Hatched: '+newName+' HP:'+newC.maxHp+' MAKUNAT!';msg.className='breed-msg success';
inc.innerHTML='Hatched! '+newName+' MAKUNAT!';
updateRes();renderFarm();renderBreed();
setTimeout(()=>{inc.innerText='Walang itlog...';},4000);
},2000);
}
function renderBreed(){
const g=document.getElementById('breedGrid');if(!g) return;g.innerHTML='';
chickens.forEach(c=>{
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
const d=document.createElement('div');d.className='farm-card';
d.innerHTML='<div class="farm-card-name">'+bData.icon+' '+c.name+'</div><div class="farm-card-breed">'+c.breed+' HP:'+c.maxHp+'</div><div class="farm-card-stats"><div>ATK <b>'+c.atk+'</b></div><div>SPD <b>'+c.spd+'</b></div></div><div style="display:flex;gap:4px;margin-top:6px"><button class="feed-btn" onclick="openFeedModal(\''+c.id+'\')">FEED</button><button class="select-btn" onclick="selectBreedPair(\''+c.id+'\')">PAIR</button></div>';
g.appendChild(d);
});
}
window.selectBreedPair=(id)=>{
const c=chickens.find(x=>x.id===id);if(!c) return;
if(c.gender==='male'){document.getElementById('maleSel').value=id;}
else{document.getElementById('femaleSel').value=id;}
updatePairPreview();
}

function drawPixelChicken(ctx,x,y,animType,frame,side,fearLevel,isDead){
ctx.save();
ctx.translate(x,y);
if(side===2){ctx.scale(-1,1);}
const isWala=side===1;
let peckOffset=0, wingFlap=0, headBob=0;
if(animType==='attack'){
  peckOffset=Math.sin(frame*2.5)*18;
  wingFlap=Math.sin(frame*3)*12;
  headBob=Math.sin(frame*2.5)*6;
}else if(animType==='hit'){
  peckOffset=-10;
  headBob=-8;
}else if(animType==='walk'){
  headBob=Math.sin(frame*1.5)*3;
  wingFlap=Math.sin(frame*2)*4;
}else{
  headBob=Math.sin(frame*0.5)*1;
}
ctx.fillStyle='rgba(0,0,0,0.5)';
ctx.beginPath();ctx.ellipse(0,26,28,8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=isDead?'#333':'#ffaa00';
ctx.strokeStyle='#000';ctx.lineWidth=1;
ctx.fillRect(-10,18,4,14);ctx.strokeRect(-10,18,4,14);
ctx.fillRect(6,18,4,14);ctx.strokeRect(6,18,4,14);
ctx.fillStyle='#ff6600';
ctx.beginPath();ctx.moveTo(-12,32);ctx.lineTo(-8,32);ctx.lineTo(-10,36);ctx.fill();
ctx.beginPath();ctx.moveTo(-6,32);ctx.lineTo(-2,32);ctx.lineTo(-4,36);ctx.fill();
ctx.beginPath();ctx.moveTo(6,32);ctx.lineTo(10,32);ctx.lineTo(8,36);ctx.fill();
ctx.beginPath();ctx.moveTo(12,32);ctx.lineTo(16,32);ctx.lineTo(14,36);ctx.fill();
const grad=ctx.createRadialGradient(-8,-10,0,0,0,30);
if(isDead){
  grad.addColorStop(0,'#555');grad.addColorStop(1,'#222');
}else if(isWala){
  grad.addColorStop(0,'#ff7777');grad.addColorStop(0.3,'#ff3333');grad.addColorStop(0.7,'#cc0000');grad.addColorStop(1,'#880000');
}else{
  grad.addColorStop(0,'#7777ff');grad.addColorStop(0.3,'#3333ff');grad.addColorStop(0.7,'#0000cc');grad.addColorStop(1,'#000088');
}
ctx.fillStyle=grad;
ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
if(!isDead){
  ctx.strokeStyle=isWala?'#ff0000aa':'#0000ffaa';ctx.lineWidth=1;
  for(let i=-1;i<=1;i++){
    ctx.beginPath();ctx.arc(0,2+i*8,20-i*2,0.2,0.8);ctx.stroke();
  }
}
ctx.strokeStyle=isDead?'#333':'#fff';ctx.lineWidth=isDead?1:2;ctx.stroke();
ctx.fillStyle=isWala?'#aa0000':'#0000aa';
ctx.save();
ctx.translate(-8,0);ctx.rotate(wingFlap*0.03);
ctx.beginPath();ctx.ellipse(0,0,14,10,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke();
ctx.restore();
ctx.save();
ctx.translate(8,-2);ctx.rotate(-wingFlap*0.03);
ctx.beginPath();ctx.ellipse(0,0,12,9,0,0,Math.PI*2);ctx.fill();
ctx.stroke();
ctx.restore();
const headX=22+peckOffset;
const headY=-14+headBob;
ctx.fillStyle=isWala?'#ff4444':'#4444ff';
if(isDead) ctx.fillStyle='#444';
ctx.beginPath();ctx.arc(headX,headY,13,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=1.5;ctx.stroke();
ctx.fillStyle=isDead?'#333':isWala?'#ff0000':'#ff6666';
ctx.beginPath();ctx.arc(headX-6,headY-12,5,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(headX,headY-14,4,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(headX+5,headY-12,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle=isDead?'#222':'#fff';
ctx.beginPath();ctx.arc(headX+5,headY-2,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle=isDead?'#111':'#000';
ctx.beginPath();ctx.arc(headX+7,headY,3,0,Math.PI*2);ctx.fill();
if(!isDead){
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(headX+8,headY-1,1.5,0,Math.PI*2);ctx.fill();
}
if(!isDead && animType==='attack'){
  ctx.fillStyle='#ffff00';ctx.beginPath();ctx.arc(headX+7,headY,1,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle=isDead?'#555':'#ffcc00';
ctx.beginPath();
if(animType==='attack'){
  ctx.moveTo(headX+12,headY-2);
  ctx.lineTo(headX+28,headY);
  ctx.lineTo(headX+12,headY+2);
}else{
  ctx.moveTo(headX+11,headY-3);
  ctx.lineTo(headX+26,headY);
  ctx.lineTo(headX+11,headY+3);
}
ctx.closePath();ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke();
if(animType==='attack'){
  ctx.fillStyle='#ff8800';
  ctx.beginPath();ctx.arc(headX+26,headY,2,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle='#fff';ctx.font='800 8px Inter';ctx.textAlign='center';
ctx.fillText(isWala?'WALA':'MERON',0,5);
ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.strokeText(isWala?'WALA':'MERON',0,5);ctx.fillText(isWala?'WALA':'MERON',0,5);
if(isDead){
  ctx.fillStyle='#ff0000';ctx.font='900 11px Black Ops One';ctx.textAlign='center';
  ctx.fillText('DEAD',0,-30);
}
if(animType==='attack' && !isDead){
  ctx.strokeStyle='#ffff00';ctx.lineWidth=2;
  for(let i=0;i<3;i++){
    const px=headX+28+Math.random()*10;
    const py=headY+Math.random()*8-4;
    ctx.beginPath();ctx.moveTo(headX+20,headY);ctx.lineTo(px,py);ctx.stroke();
  }
  ctx.fillStyle='rgba(255,255,0,0.9)';
  ctx.font='900 18px Black Ops One';ctx.textAlign='center';
  ctx.fillText('TUK!',headX+32,headY-14);
  ctx.fillStyle='#fff';
  for(let i=0;i<4;i++){
    ctx.fillRect(headX+24+Math.random()*12,headY-8+Math.random()*16,3,3);
  }
}
if(animType==='hit' && !isDead){
  ctx.fillStyle='#ff0000';ctx.font='900 12px Black Ops One';ctx.textAlign='center';
  ctx.fillText('ARAY!',0,-36);
  ctx.fillStyle='#ffff00';
  for(let i=0;i<3;i++){
    const sx=Math.random()*20-10;
    const sy=-40+Math.random()*10;
    ctx.fillText('★',sx,sy);
  }
}
ctx.restore();
}

function drawArena(ctx){
ctx.fillStyle='#050505';ctx.fillRect(0,0,800,320);
ctx.fillStyle='#0a0a0a';ctx.fillRect(0,160,800,160);
ctx.fillStyle='#111';ctx.fillRect(0,200,800,120);
ctx.strokeStyle='#ff6600';ctx.lineWidth=2;ctx.shadowColor='#ff4400';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(400,230,160,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
ctx.strokeStyle='#ff660055';ctx.lineWidth=1;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(400,230,110,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='#ff6600';ctx.font='800 11px Black Ops One';ctx.textAlign='center';
ctx.fillText('WALA',160,140);
ctx.fillText('MERON',640,140);
ctx.fillStyle='#ff8800';ctx.font='700 10px Black Ops One';ctx.fillText('● ARENA COOL ● DIKIT TUKAAN ●',400,28);
}

let bettingTimerInterval=null,fightInterval2=null,walkInterval=null;
let bettingTimeLeft=0,isBettingPhase=false,isFighting=false,isWalking=false;
let currentLeftIdx=0,currentRightIdx=1;
let totalBetLeft=0,totalBetRight=0,userBet=null,userBetSide=0;
let bettorsInterval=null,trashTalkInterval=null,talkInterval=null;
let leftPos={x:100,y:220,anim:'idle',frame:0,fear:0,dead:false};
let rightPos={x:700,y:220,anim:'idle',frame:0,fear:0,dead:false};

window.initWatch=()=>{
bettors=JSON.parse(JSON.stringify(bettorsData));
bettors.forEach(b=>{b.side=0;b.bet=0;b.trash=trashLines.neutral[Math.floor(Math.random()*trashLines.neutral.length)];b.winning=false;});
renderBettors();resetBettingUI();
const liveSel=document.getElementById('liveChickenSel');
if(liveSel){
liveSel.innerHTML='<option value="">Pili manok...</option>';
chickens.forEach(c=>{
const bData=BREEDS_20.find(b=>b.name===c.breed)||{icon:'🐓'};
liveSel.innerHTML+='<option value="'+c.id+'">'+bData.icon+' '+c.name+' HP:'+c.maxHp+'</option>';
});
if(liveMyChicken) liveSel.value=liveMyChicken.id;
}
drawIdleFighters();
}
function drawIdleFighters(){
const canvas=document.getElementById('watchCanvas');if(!canvas) return;
const ctx=canvas.getContext('2d');
ctx.clearRect(0,0,canvas.width,canvas.height);
drawArena(ctx);
leftPos={x:200,y:220,anim:'idle',frame:0,fear:0,dead:false};
rightPos={x:600,y:220,anim:'idle',frame:0,fear:0,dead:false};
drawPixelChicken(ctx,leftPos.x,leftPos.y,'idle',spriteFrame%4,1,0,false);
drawPixelChicken(ctx,rightPos.x,rightPos.y,'idle',spriteFrame%4,2,0,false);
}
function renderBettors(){
const list=document.getElementById('bettorsList');if(!list) return;list.innerHTML='';
bettors.forEach(b=>{
const sideClass=b.side===1?'wala':b.side===2?'meron':'';
const moneyClass=b.type==='whale'?'whale':b.type==='rich'?'rich':'';
const sideText=b.side===1?'WALA':b.side===2?'MERON':'-';
const betText=b.bet>0?'P'+b.bet.toLocaleString():'-';
const div=document.createElement('div');div.className='bettor-card '+sideClass+' '+(b.winning?'winning':'');
div.innerHTML='<div class="bettor-header"><div class="bettor-name">'+b.avatar+' '+b.name+'</div><div class="bettor-money '+moneyClass+'">P'+b.money.toLocaleString()+'</div></div><div class="bettor-bet '+sideClass+'"><span>'+sideText+'</span><b>'+betText+'</b></div><div class="bettor-trash" id="trash-'+b.id+'">'+b.trash+'</div>';
list.appendChild(div);
});
}
function updateBettorTrash(id,text,isReal=false){
const el=document.getElementById('trash-'+id);if(!el) return;el.innerText=text;el.classList.add('talking');if(isReal) el.classList.add('real');setTimeout(()=>{el.classList.remove('talking');el.classList.remove('real');},1200);
}
function resetBettingUI(){
const phase=document.getElementById('bettingPhase'),timer=document.getElementById('bettingTimer'),status=document.getElementById('bettingStatus'),winner=document.getElementById('watchWinner'),btn=document.getElementById('startLiveBtn'),betBtn1=document.getElementById('betBtn1'),betBtn2=document.getElementById('betBtn2');
if(phase){phase.className='';phase.style.display='block';}
if(timer){timer.innerText='20';timer.className='';}
if(btn){btn.disabled=false;btn.style.opacity='1';btn.innerHTML='LABAN';}
if(betBtn1) betBtn1.disabled=true;
if(betBtn2) betBtn2.disabled=true;
document.getElementById('watchHp1').style.width='100%';
document.getElementById('watchHp2').style.width='100%';
totalBetLeft=0;totalBetRight=0;updateBetTotals();
if(liveMode==='fight'){
if(liveMyChicken){const bData=BREEDS_20.find(b=>b.name===liveMyChicken.breed)||{icon:'🐓'};if(status) status.innerText='Ready: '+bData.icon+' '+liveMyChicken.name+' (WALA) HP:'+liveMyChicken.maxHp+' MAKUNAT';if(winner) winner.innerText=liveMyChicken.name+' vs MERON';}
else{if(status) status.innerText='Pili manok mo';if(winner) winner.innerText='Pili manok';if(btn) btn.innerHTML='PILI MUNA';}
}else{if(status) status.innerText='Watch: WALA vs MERON COOL';if(winner) winner.innerText='WALA vs MERON COOL';if(btn) btn.innerHTML='LABAN';}
bettors=bettorsData.map(b=>({...b,side:0,bet:0,trash:trashLines.neutral[Math.floor(Math.random()*trashLines.neutral.length)],winning:false}));
renderBettors();drawIdleFighters();
}
function updateBetTotals(){
const leftCount=bettors.filter(b=>b.side===1).length;
const rightCount=bettors.filter(b=>b.side===2).length;
const pot=totalBetLeft+totalBetRight;
document.getElementById('watchBet1').innerText='P'+totalBetLeft.toLocaleString()+' • '+leftCount;
document.getElementById('watchBet2').innerText='P'+totalBetRight.toLocaleString()+' • '+rightCount;
const potEl=document.getElementById('totalPot');if(potEl) potEl.innerText='POT: P'+pot.toLocaleString();
}
window.startBettingPhase=()=>{
if(liveMode==='fight'&&!liveMyChicken){alert('Pili ka muna manok');return;}
if(isBettingPhase||isFighting||isWalking){alert('May laban pa');return;}
let leftF,rightF;
if(liveMode==='fight'){
leftF=liveMyChicken;
currentRightIdx=Math.floor(Math.random()*BREEDS_20.length);
rightF=fighters[currentRightIdx];
document.getElementById('watchName1').innerText=leftF.name+' (WALA)';
document.getElementById('watchName2').innerText=rightF.name+' (MERON)';
document.getElementById('watchHpText1').innerText='HP: '+leftF.maxHp+' WALA MAKUNAT';
document.getElementById('watchHpText2').innerText='HP: '+rightF.maxHp+' MERON MAKUNAT';
}else{
currentLeftIdx=Math.floor(Math.random()*BREEDS_20.length);
do{currentRightIdx=Math.floor(Math.random()*BREEDS_20.length);}while(currentRightIdx===currentLeftIdx);
leftF=fighters[currentLeftIdx];
rightF=fighters[currentRightIdx];
document.getElementById('watchName1').innerText=leftF.name+' (WALA)';
document.getElementById('watchName2').innerText=rightF.name+' (MERON)';
document.getElementById('watchHpText1').innerText='HP: '+leftF.maxHp+' WALA';
document.getElementById('watchHpText2').innerText='HP: '+rightF.maxHp+' MERON';
}
document.getElementById('watchHp1').style.width='100%';
document.getElementById('watchHp2').style.width='100%';
totalBetLeft=0;totalBetRight=0;userBet=null;userBetSide=0;
updateBetTotals();
bettors=bettorsData.map(b=>({...b,side:0,bet:0,trash:trashLines.neutral[Math.floor(Math.random()*trashLines.neutral.length)],winning:false}));
renderBettors();
const canvas=document.getElementById('watchCanvas'),ctx=canvas.getContext('2d');
ctx.clearRect(0,0,canvas.width,canvas.height);
drawArena(ctx);
leftPos={x:100,y:220,anim:'walk',frame:0,fear:0,dead:false};
rightPos={x:700,y:220,anim:'walk',frame:0,fear:0,dead:false};
bettingTimeLeft=20;isBettingPhase=true;
const phase=document.getElementById('bettingPhase'),timer=document.getElementById('bettingTimer'),status=document.getElementById('bettingStatus'),winner=document.getElementById('watchWinner'),btn=document.getElementById('startLiveBtn'),betBtn1=document.getElementById('betBtn1'),betBtn2=document.getElementById('betBtn2'),log=document.getElementById('watchLog');
phase.classList.add('betting-active');status.className='betting';
status.innerText='Tayaan: '+leftF.name+' WALA ('+leftF.maxHp+' HP) vs '+rightF.name+' MERON ('+rightF.maxHp+' HP) COOL!';
winner.innerText='TAYAAN • WALA vs MERON • DIKIT TUKAAN!';
winner.className='';btn.disabled=true;btn.innerHTML='TAYAAN 20s';btn.style.opacity='0.5';
betBtn1.disabled=false;betBtn2.disabled=false;
log.innerHTML='<div style="color:#ff8800">COOL LABAN! WALA '+leftF.maxHp+' HP vs MERON '+rightF.maxHp+' HP!</div>'+log.innerHTML;
if(bettingTimerInterval) clearInterval(bettingTimerInterval);
if(bettorsInterval) clearInterval(bettorsInterval);
if(talkInterval) clearInterval(talkInterval);
let bettorIdx=0;
bettorsInterval=setInterval(()=>{
if(bettorIdx>=bettors.length) return;
const b=bettors[bettorIdx];
if(b.side===0){
const side=Math.random()>0.5?1:2;
let betAmt=0;
if(b.type==='whale') betAmt=Math.floor(Math.random()*40000)+15000;
else if(b.type==='rich') betAmt=Math.floor(Math.random()*15000)+5000;
else if(b.type==='normal') betAmt=Math.floor(Math.random()*8000)+1000;
else betAmt=Math.floor(Math.random()*3000)+500;
betAmt=Math.min(betAmt,b.money);
b.side=side;b.bet=betAmt;
if(side===1) totalBetLeft+=betAmt; else totalBetRight+=betAmt;
const lines=side===1?trashLines.wala:trashLines.meron;
b.trash=lines[Math.floor(Math.random()*lines.length)];
log.innerHTML='<div style="color:'+(side===1?'#ff6666':'#6666ff')+'">'+b.name+' P'+betAmt.toLocaleString()+' '+(side===1?'WALA':'MERON')+'</div>'+log.innerHTML;
renderBettors();updateBettorTrash(b.id,b.trash);updateBetTotals();bettorIdx++;
}
},500);
talkInterval=setInterval(()=>{
if(!isBettingPhase) return;
const talker=bettors[Math.floor(Math.random()*bettors.length)];
const target=bettors[Math.floor(Math.random()*bettors.length)];
if(talker.id===target.id) return;
const templates=trashLines.talking;
let msg=templates[Math.floor(Math.random()*templates.length)];
msg=msg.replace('@BOSS',target.name.split(' ')[0]).replace('@NAME',target.name.split(' ')[0]);
updateBettorTrash(talker.id,msg,true);
document.getElementById('watchTrashTalk').innerText=talker.name+': '+msg;
},1200);
bettingTimerInterval=setInterval(()=>{
bettingTimeLeft--;
timer.innerText=bettingTimeLeft;
if(bettingTimeLeft<=10) timer.className='warning';
if(bettingTimeLeft<=5) timer.className='danger';
if(bettingTimeLeft<=0){clearInterval(bettingTimerInterval);clearInterval(bettorsInterval);clearInterval(talkInterval);isBettingPhase=false;startWalkPhase();}
},1000);
}

function startWalkPhase(){
isWalking=true;
const phase=document.getElementById('bettingPhase'),timer=document.getElementById('bettingTimer'),status=document.getElementById('bettingStatus'),log=document.getElementById('watchLog');
phase.classList.remove('betting-active');phase.classList.add('fighting');
timer.innerText='...';status.className='fighting';status.innerText='Lakad gitna... DIKIT TUKAAN NA!';
log.innerHTML='<div style="color:#888">Lakad... WALA at MERON didikit na!</div>'+log.innerHTML;
leftPos={x:80,y:220,anim:'walk',frame:0,fear:0,dead:false};
rightPos={x:720,y:220,anim:'walk',frame:0,fear:0,dead:false};
let walkSteps=0;
const canvas=document.getElementById('watchCanvas'),ctx=canvas.getContext('2d');
walkInterval=setInterval(()=>{
walkSteps++;
leftPos.x+=18;
rightPos.x-=18;
leftPos.frame=(leftPos.frame+1)%4;
rightPos.frame=(rightPos.frame+1)%4;
ctx.clearRect(0,0,canvas.width,canvas.height);
drawArena(ctx);
drawPixelChicken(ctx,leftPos.x,leftPos.y,'walk',leftPos.frame,1,0,false);
drawPixelChicken(ctx,rightPos.x,rightPos.y,'walk',rightPos.frame,2,0,false);
ctx.fillStyle='#ff6600';ctx.font='800 10px Black Ops One';ctx.textAlign='center';
ctx.fillText('WALA → ← MERON DIKIT '+walkSteps+'/18',400,50);
if(leftPos.x>=320&&rightPos.x<=480){
clearInterval(walkInterval);isWalking=false;
leftPos.x=340;rightPos.x=460;
leftPos.anim='idle';rightPos.anim='idle';
setTimeout(()=>startLiveFight(),500);
}
},150);
}

function startLiveFight(){
isFighting=true;
const phase=document.getElementById('bettingPhase'),timer=document.getElementById('bettingTimer'),status=document.getElementById('bettingStatus'),btn=document.getElementById('startLiveBtn'),betBtn1=document.getElementById('betBtn1'),betBtn2=document.getElementById('betBtn2');
timer.innerText='FIGHT';status.className='fighting';
const leftF=liveMode==='fight'?liveMyChicken:fighters[currentLeftIdx];
const rightF=fighters[currentRightIdx];
status.innerText='DIKIT TUKAAN: WALA vs MERON!';
btn.innerHTML='DIKIT TUKAAN!';betBtn1.disabled=true;betBtn2.disabled=true;
let hp1=leftF.maxHp,hp2=rightF.maxHp;
const canvas=document.getElementById('watchCanvas'),ctx=canvas.getContext('2d'),log=document.getElementById('watchLog'),winnerDiv=document.getElementById('watchWinner');
winnerDiv.innerText='WALA vs MERON - DIKIT TUKAAN!';
log.innerHTML='<div>DIKIT LABAN NA! TUKAAN!</div>'+log.innerHTML;
playFightMusic();
let t=0;
if(trashTalkInterval) clearInterval(trashTalkInterval);
trashTalkInterval=setInterval(()=>{
const randomB=bettors[Math.floor(Math.random()*bettors.length)];
let msg=randomB.side===1?'WALA dikit tuka pa!':'MERON dikit ubusin mo!';
if(hp1<hp2*0.5) msg=randomB.side===1?'WALA delikado dikit pa!':'MERON patay na WALA dikit!';
if(hp2<hp1*0.5) msg=randomB.side===2?'MERON delikado dikit!':'WALA patay na MERON dikit!';
updateBettorTrash(randomB.id,msg);
document.getElementById('watchTrashTalk').innerText=randomB.name+': '+msg;
},800);
let hitLeft=false,hitRight=false;
fightInterval2=setInterval(()=>{
t++;
const attacker=Math.random()>0.5?1:2;
let dmg=0;
const leftTarget=340;
const rightTarget=460;
if(attacker===1){
dmg=Math.floor(Math.random()*6+leftF.atk*0.04+2);hp2-=dmg;if(hp2<0) hp2=0;
hitRight=true;leftPos.anim='attack';leftPos.frame+=2;
rightPos.anim='hit';rightPos.frame+=1;
leftPos.x=leftTarget+Math.sin(t*0.5)*4;
rightPos.x=rightTarget+Math.sin(t*0.5)*2;
setTimeout(()=>{hitRight=false;leftPos.anim='idle';rightPos.anim='idle';},400);
log.innerHTML='<div style="color:#ff6666;font-size:10px">🔥 WALA TUKA! -'+dmg+' HP:'+hp2+'</div>'+log.innerHTML;
}else{
dmg=Math.floor(Math.random()*6+rightF.atk*0.04+2);hp1-=dmg;if(hp1<0) hp1=0;
hitLeft=true;rightPos.anim='attack';rightPos.frame+=2;
leftPos.anim='hit';leftPos.frame+=1;
rightPos.x=rightTarget-Math.sin(t*0.5)*4;
leftPos.x=leftTarget-Math.sin(t*0.5)*2;
setTimeout(()=>{hitLeft=false;rightPos.anim='idle';leftPos.anim='idle';},400);
log.innerHTML='<div style="color:#6666ff;font-size:10px">💙 MERON TUKA! -'+dmg+' HP:'+hp1+'</div>'+log.innerHTML;
}
const hpPct1=(hp1/leftF.maxHp*100);const hpPct2=(hp2/rightF.maxHp*100);
document.getElementById('watchHp1').style.width=Math.max(0,hpPct1)+'%';
document.getElementById('watchHp2').style.width=Math.max(0,hpPct2)+'%';
document.getElementById('watchHpText1').innerText='HP: '+hp1+'/'+leftF.maxHp+' MAKUNAT';
document.getElementById('watchHpText2').innerText='HP: '+hp2+'/'+rightF.maxHp+' MAKUNAT';
ctx.clearRect(0,0,canvas.width,canvas.height);
drawArena(ctx);
if(hitLeft||hitRight){
  ctx.fillStyle='rgba(255,255,0,0.15)';
  ctx.fillRect(320,160,160,100);
  ctx.fillStyle='rgba(255,255,255,0.9)';
  for(let i=0;i<8;i++){
    ctx.fillRect(360+Math.random()*80,170+Math.random()*60,Math.random()*12+4,Math.random()*12+4);
  }
  ctx.fillStyle='#fff';ctx.font='900 20px Black Ops One';ctx.textAlign='center';
  ctx.fillText('-'+dmg+' TUKA!',400,90);
  ctx.font='800 14px Inter';
  ctx.fillText('DIKIT LABAN!',400,110);
}
drawPixelChicken(ctx,leftPos.x,leftPos.y,leftPos.anim,leftPos.frame,1,0,hp1<=0);
drawPixelChicken(ctx,rightPos.x,rightPos.y,rightPos.anim,rightPos.frame,2,0,hp2<=0);
ctx.strokeStyle='rgba(255,100,0,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
ctx.beginPath();ctx.moveTo(400,180);ctx.lineTo(400,260);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='#ff6600';ctx.font='800 11px Black Ops One';ctx.textAlign='center';
ctx.fillText('🔥 WALA ↔ MERON DIKIT TUKAAN! ROUND '+t+' 🔥',400,46);
ctx.fillStyle='#fff';ctx.font='600 10px Inter';
ctx.fillText('WALA '+hp1+' HP vs MERON '+hp2+' HP • MAKUNAT',400,62);
if(hp1<=0||hp2<=0){
clearInterval(fightInterval2);clearInterval(trashTalkInterval);isFighting=false;stopFightMusic();
const winnerSide=hp1>0?1:2;
if(winnerSide===1){rightPos.dead=true;}else{leftPos.dead=true;}
setTimeout(()=>showWinner(winnerSide,leftF,rightF,hp1,hp2),600);
}
},750);
}

function showWinner(winnerSide,leftF,rightF,hp1,hp2){
const canvas=document.getElementById('watchCanvas'),ctx=canvas.getContext('2d'),winnerDiv=document.getElementById('watchWinner'),log=document.getElementById('watchLog'),phase=document.getElementById('bettingPhase'),status=document.getElementById('bettingStatus'),timer=document.getElementById('bettingTimer'),btn=document.getElementById('startLiveBtn');
ctx.fillStyle='rgba(0,0,0,0.9)';ctx.fillRect(0,0,canvas.width,canvas.height);drawArena(ctx);
if(winnerSide===1){
drawPixelChicken(ctx,400,180,'idle',0,1,0,false);
ctx.fillStyle='#fff';ctx.font='900 24px Black Ops One';ctx.textAlign='center';
ctx.fillText('WALA WIN DIKIT!',400,80);
ctx.fillStyle='#ff8800';ctx.font='600 12px Inter';
ctx.fillText(leftF.name+' • WALA WIN • '+leftF.maxHp+' HP TUKAAN!',400,240);
}else{
drawPixelChicken(ctx,400,180,'idle',0,2,0,false);
ctx.fillStyle='#fff';ctx.font='900 24px Black Ops One';ctx.textAlign='center';
ctx.fillText('MERON WIN DIKIT!',400,80);
ctx.fillStyle='#ff8800';ctx.font='600 12px Inter';
ctx.fillText(rightF.name+' • MERON WIN • '+rightF.maxHp+' HP TUKAAN!',400,240);
}
for(let i=0;i<40;i++){ctx.fillStyle=['#fff','#ff6600','#ff8800'][Math.floor(Math.random()*3)];ctx.fillRect(Math.random()*800,Math.random()*320,Math.random()*8+2,Math.random()*8+2);}
let winnerName=winnerSide===1?(liveMode==='fight'?'WALA '+leftF.name:leftF.name+' (WALA)'):rightF.name+' (MERON)';
winnerDiv.innerHTML=winnerName+' WIN DIKIT TUKAAN!';
winnerDiv.className='winner';phase.classList.remove('fighting');status.className='finished';
status.innerText=winnerName+' panalo DIKIT TUKAAN!';
timer.innerText=winnerSide===1?'WALA WIN':'MERON WIN';
bettors.forEach(b=>{b.winning=b.side===winnerSide;});renderBettors();
log.innerHTML='<div style="color:#fff;background:#111;padding:6px;border-radius:6px;border:1px solid #ff6600">DIKIT WIN: '+winnerName+' '+Math.floor(leftF.maxHp>rightF.maxHp?leftF.maxHp:rightF.maxHp)+' HP!</div>'+log.innerHTML;
bettors.forEach(b=>{if(b.side===winnerSide && b.bet>0){updateBettorTrash(b.id,'PANALO DIKIT! +P'+(b.bet*2).toLocaleString()+'!');}else if(b.side!==0){updateBettorTrash(b.id,'Talo DIKIT -P'+b.bet.toLocaleString());}});
if(liveMode==='fight'&&winnerSide===1){leftF.atk+=5;leftF.maxHp+=20;leftF.hp=leftF.maxHp;const idx=chickens.findIndex(c=>c.id===leftF.id);if(idx>-1){chickens[idx]=leftF;renderFarm();}pesos+=5000;addLog('WALA WIN DIKIT +5 ATK +20 HP +P5k');}
if(userBet){if(userBetSide===winnerSide){const win=userBet*2;pesos+=win;log.innerHTML='<div style="color:#fff;background:#ff6600;padding:6px;border-radius:6px;border:1px solid #fff">IKAW PANALO DIKIT +P'+win.toLocaleString()+'</div>'+log.innerHTML;}else{pesos-=userBet;log.innerHTML='<div style="color:#666;background:#0a0a0a;padding:6px;border-radius:6px">IKAW TALO -P'+userBet.toLocaleString()+'</div>'+log.innerHTML;}userBet=null;updateRes();}else{if(liveMode==='fight'&&winnerSide===1) updateRes();}
btn.disabled=false;btn.innerHTML='LABAN ULIT';phase.style.display='block';
document.getElementById('watchTrashTalk').innerText=winnerName+' panalo DIKIT TUKAAN! Ganda laban!';
}

window.betOnNpc=(side)=>{
if(!isBettingPhase){alert('Hindi pa tayaan');return;}
const amt=parseInt(document.getElementById('watchBetAmount').value);
if(!amt||amt<100){alert('Min 100');return;}
if(amt>pesos){alert('Kulang P'+pesos.toLocaleString()+' lang');return;}
userBet=amt;userBetSide=side;
if(side===1) totalBetLeft+=amt; else totalBetRight+=amt;
updateBetTotals();
let chosenName=side===1?'WALA':'MERON';
document.getElementById('watchLog').innerHTML='<div style="color:#fff">Ikaw P'+amt.toLocaleString()+' '+chosenName+' DIKIT!</div>'+document.getElementById('watchLog').innerHTML;
}

function renderMarket(){
const shop=document.getElementById('fullChickenShop');
if(shop){shop.innerHTML='';BREEDS_20.forEach(b=>{const d=document.createElement('div');d.className='chicken-shop-card';d.innerHTML='<div style="font-size:28px">'+b.icon+'</div><h4>'+b.name+'</h4><p>'+b.desc+' • ATK '+b.atk+' • HP '+b.hp+' MAKUNAT</p><p style="color:#fff;font-family:Black Ops One;margin-top:6px">P'+b.price.toLocaleString()+'</p><button onclick="buyChicken(\''+b.name+'\')">BUY P'+b.price.toLocaleString()+'</button>';shop.appendChild(d);});}
const feedShop=document.getElementById('feedShop');
if(feedShop){feedShop.innerHTML='';const items=[{key:'feed',icon:'🌾',name:'Feed x10',desc:'Breed',price:50,stock:'feed'},{key:'corn',icon:'🌽',name:'Corn',desc:'+30 HP',price:100,stock:'corn'},{key:'vitamin',icon:'💊',name:'Vitamin',desc:'+10 ATK',price:500,stock:'vitamin'},{key:'hpfood',icon:'❤️',name:'HP Food',desc:'+40 MAX HP MAKUNAT',price:800,stock:'hpfood'}];
items.forEach(it=>{const div=document.createElement('div');div.className='feed-shop-card';div.setAttribute('onclick',"buyFeed('"+it.key+"',"+it.price+")");div.innerHTML='<div><b>'+it.icon+' '+it.name+'</b> <span style="color:#666">x'+feedInv[it.stock]+' • '+it.desc+'</span></div><div style="font-family:Black Ops One">P'+it.price+'</div>';feedShop.appendChild(div);});}
updateRes();renderSellGrid();
}
window.buyChicken=(breed)=>{
const bData=BREEDS_20.find(b=>b.name===breed);if(pesos<bData.price){alert('Kulang P'+bData.price.toLocaleString());return;}pesos-=bData.price;
const newName=bData.name+' '+Math.floor(Math.random()*99+1);
const c={id:'c'+Date.now(),name:newName,breed,atk:bData.atk+Math.floor(Math.random()*8),hp:bData.hp,maxHp:bData.hp+Math.floor(Math.random()*30),spd:bData.spd+Math.floor(Math.random()*8),grit:80,gender:Math.random()>0.5?'male':'female',price:0};c.hp=c.maxHp;chickens.push(c);updateRes();renderFarm();renderBreed();addLog('Bought '+newName+' MAKUNAT HP:'+c.maxHp);}

window.buyFeed=(type,price)=>{
if(pesos<price){alert('Kulang');return;}pesos-=price;
if(type==='feed'){feeds+=10;feedInv.feed++;}else{feedInv[type]++;}
updateRes();renderFarm();addLog('Bought '+type);renderMarket();
}
let peer=null;
function renderGlobalPlayers(){const el=document.getElementById('globalPlayers');if(!el) return;el.innerHTML='<div style="color:#666;text-align:center;padding:10px">Global - COOL DIKIT ARENA</div>';}
window.autoJoinGlobal=()=>{
const status=document.getElementById('myRoomId');status.innerText='Connecting...';
if(peer) try{peer.destroy();}catch{}peer=new Peer('sabong-'+Math.floor(Math.random()*99999));
peer.on('open',id=>{status.innerText='ID: '+id+' • LOBBY: cool-dikit-tukaan';document.getElementById('peerCount').innerText='🟢 ONLINE';addGlobalChat('System','Connected • COOL DIKIT TUKAAN ARENA');});
}
window.sendGlobalChat=()=>{
const input=document.getElementById('chatInput');if(!input||!input.value.trim()) return;addGlobalChat('Ikaw',input.value);input.value='';
setTimeout(()=>{const randomB=BREEDS_20[Math.floor(Math.random()*BREEDS_20.length)];addGlobalChat(randomB.name,'DIKIT TUKA? '+randomB.icon);},1000);
}
function addGlobalChat(user,msg){const box=document.getElementById('chatBox');if(!box) return;const div=document.createElement('div');div.style.cssText='background:#111;border:1px solid #ff660033;padding:6px 10px;border-radius:8px;font-size:11px';div.innerHTML='<b style="color:#fff">'+user+':</b> <span style="color:#888">'+msg+'</span>';box.appendChild(div);box.scrollTop=box.scrollHeight;}
window.showPage=(id)=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));document.getElementById(id).classList.add('active');const btns=document.querySelectorAll('nav button');btns.forEach(b=>{if(b.textContent.toLowerCase().includes(id) || (id==='watch'&&b.textContent.includes('LIVE')) || (id==='farm'&&b.textContent.includes('FARM'))) b.classList.add('active');});if(id==='farm') renderFarm();if(id==='breed'){renderBreed();updateBreedSelectors();}if(id==='watch') initWatch();if(id==='market') renderMarket();if(id==='auction') renderGlobalPlayers();}
document.addEventListener('DOMContentLoaded',()=>{const ms=document.getElementById('maleSel'),fs=document.getElementById('femaleSel');if(ms) ms.addEventListener('change',updatePairPreview);if(fs) fs.addEventListener('change',updatePairPreview);});
setInterval(()=>{spriteFrame++;if(document.getElementById('watch').classList.contains('active')&&!isFighting&&!isWalking&&!isBettingPhase){const canvas=document.getElementById('watchCanvas');if(canvas){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);drawArena(ctx);drawPixelChicken(ctx,200,220,'idle',spriteFrame%4,1,0,false);drawPixelChicken(ctx,600,220,'idle',spriteFrame%4,2,0,false);}}},350);
(function(){updateRes();renderFarm();initWatch();renderMarket();setLiveMode('fight');renderGlobalPlayers();addLog('Arena ready • COOL • DIKIT TUKAAN • MAKUNAT 380-600 HP • Matagal laban!');})();