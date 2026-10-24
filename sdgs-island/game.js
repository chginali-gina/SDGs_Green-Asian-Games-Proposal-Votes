
const MODE=window.SDG_MODE==="pro"?"pro":"basic"; const PRO=MODE==="pro";
const BADGES=PRO?BADGES_PRO:BADGES_BASIC;
/* language */
let lang="both";
try{lang=localStorage.getItem("sdgIsleLang")||"both"}catch(e){}
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const L=(zh,en)=>`<span class="zh">${zh}</span><span class="en">${en}</span>`;
const Li=(zh,en)=>`<span class="zh">${zh}</span><span class="en i">${en}</span>`;
const T=(zh,en)=>lang==="zh"?zh:lang==="en"?en:`${zh} / ${en}`;
function setLang(l){lang=l;document.body.dataset.lang=l;try{localStorage.setItem("sdgIsleLang",l)}catch(e){}
  document.querySelectorAll(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===l))}
const set=(id,h)=>{document.getElementById(id).innerHTML=h};
const $=id=>document.getElementById(id);

set("stagePill",PRO?Li("後期進階版","Advanced"):Li("初期基本版","Starter"));
if(PRO){
  set("h1",L("SDGs 永續島議會：四個角色，一張桌子，十七個難題","SDGs Island Council: four roles, one table, seventeen hard choices"));
  set("intro",L("一組四人共用一台裝置，每人扮演一個角色。每項決議都要先預測代價、引用證據、寫出理由，至少三票同意才能通過。小心，有些決定的後果會晚兩回合才出現。","Four students share one device, each playing a role. For every decision, predict the cost, use evidence, give a reason, and get at least three votes. Watch out: some choices bring consequences two rounds later."));
}else{
  set("h1",L("SDGs 永續島：17 座浮島，等你上島做決定","SDGs Island: 17 floating islands are waiting for your decisions"));
  set("intro",L("你手上的永續幣有限。到英文補給站賺幣，替每座島做出兩難決定，接通協作線、撐過危機卡，最後拿到你的島主頭銜。","Your coins are limited. Earn coins at the Word Stops, make tough choices for each island, connect the links, survive the crisis cards, and win your Island Title."));
}
set("hud",`
  ${PRO?`<div class="stat click" id="roleStat" role="button" tabindex="0"><span class="lb">${L("角色","Roles")}</span><b>4</b></div>`:""}
  <div class="stat coin" id="coinStat"><span class="lb">${L(PRO?"小組永續幣":"永續幣",PRO?"Team coins":"Coins")}</span><b id="hCoin"></b></div>
  <div class="stat"><span class="lb">${L(PRO?"決議":"任務",PRO?"Decisions":"Missions")}</span><b id="hMis">0</b>/17</div>
  <div class="stat"><span class="lb">${L("協作線","Links")}</span><b id="hLink">0</b>/12</div>
  ${PRO?`<div class="stat"><span class="lb">${L("預測命中","Predictions")}</span><b id="hPred">0</b></div>`:""}
  <div class="stat"><span class="lb">${L("徽章","Badges")}</span><b id="hBadge">0</b>/${BADGES.length}</div>
  <div class="stat" id="whoStat" hidden><span class="lb">${L("報到","Player")}</span><b id="hWho" style="font-size:15px"></b></div>`);
set("toggleLines",Li("協作線","Links"));set("randomIsle",Li("隨機登島","Random Island"));set("resetBtn",Li("重新開始","Restart"));
set("ledgerH",Li("永續帳本","Trade-off Ledger"));
set("ledgerSub",L("正數是決定幫到的目標，負數是付出代價的目標。沒有零代價的選擇。","Positive numbers show the goals your choices helped. Negative numbers show the goals that paid the price. No choice is free."));
set("badgeH",Li("徽章牆","Badge Wall"));set("badgeSub",L("灰色的徽章還沒解鎖。","Grey badges are still locked."));
if(PRO){set("endH",Li("議會結算","Council Debrief"));set("endSub",L("完成 6 項決議後，揭曉每個角色的秘密任務，並產生小組決議紀錄。","After 6 decisions, reveal each role's secret mission and create your group's decision record."))}
else{set("endH",Li("島主頭銜","Your Island Title"));set("endSub",L("SDGs 分成 5P：人、地球、繁榮、和平、夥伴。你最常守護哪一個，就決定你的頭銜。","The SDGs fall into 5 Ps: People, Planet, Prosperity, Peace and Partnership. The P you protect most decides your title."))}

const emptySheet=()=>PRO?`<div class="empty"><h2>${L("議會開議","The council is open")}</h2>
  <p>${L("點一座島，小組依照五個步驟做出決議：","Tap an island. Your group makes a decision in five steps:")}</p>
  <ol>
   <li>${L("投票：四個角色各投 A、B 或你們自創的 C","Vote: each role votes A, B, or your own C option.")}</li>
   <li>${L("預測：這個選擇會犧牲哪個目標？","Predict: which goal will this choice cost?")}</li>
   <li>${L("證據：選一張支持你們決定的證據卡","Evidence: choose the card that supports your choice.")}</li>
   <li>${L("理由：用英文寫一句理由","Reason: write one reason in English.")}</li>
   <li>${L("少數意見：投反對票的人寫下自己的看法","Minority view: anyone who voted differently writes their view.")}</li>
  </ol>
  <p class="note">${L("至少三票同意才能通過。卡住的時候，打開「協商句型」。","You need at least three votes to pass. If you get stuck, open “Talk Frames.”")}</p></div>`
 :`<div class="empty"><h2>${L("選一座島登陸","Pick an island to land on")}</h2>
  <p>${L("點地圖上任一座島，小圓點「你」會走過去。","Tap any island on the map, and the “You” marker will walk there.")}</p>
  <ol>
   <li>${L("英文補給站：答對單字題 +10 幣","Word Stop: answer a word question correctly to earn 10 coins.")}</li>
   <li>${L("島民任務：花幣做決定，決定後不能反悔","Island Mission: spend coins to decide. You can't change your mind later.")}</li>
   <li>${L("一條線兩端的島都完成任務，協作線會變金色，再 +5 幣","When both islands on a link are done, the link turns gold and you get 5 more coins.")}</li>
   <li>${L("每完成 3 個任務，會抽到一張危機卡","After every 3 missions, you'll draw a crisis card.")}</li>
  </ol></div>`;

/* map */
const R=34, W=Math.sqrt(3)*R, VS=1.5*R;
const rows=[[1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3],[1,2]];
const pos={}; let k=0;
rows.forEach((cols,ri)=>cols.forEach(ci=>{pos[++k]={x:44+ci*W+(ri%2?W/2:0),y:48+ri*VS}}));
const hexPts=(cx,cy,r)=>Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-30);return (cx+r*Math.cos(a)).toFixed(1)+","+(cy+r*Math.sin(a)).toFixed(1)}).join(" ");
const NS="http://www.w3.org/2000/svg";
const svg=$("map");
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
const lineLayer=el("g",{},svg), isleLayer=el("g",{},svg);
LINKS.forEach(([a,b])=>{const p=pos[a],q=pos[b];el("path",{class:"collab","data-a":a,"data-b":b,d:`M${p.x},${p.y} Q${(p.x+q.x)/2},${(p.y+q.y)/2-14} ${q.x},${q.y}`},lineLayer)});
SDG.forEach(s=>{
  const {x,y}=pos[s.n];
  const g=el("g",{class:"hex",tabindex:0,role:"button","aria-label":`SDG ${s.n} ${s.isle[0]} ${s.isle[1]}`,"data-n":s.n},isleLayer);
  const lift=el("g",{class:"lift"},g);
  el("polygon",{points:hexPts(x,y+8,R*.9),fill:s.c,style:"filter:brightness(.62)"},lift);
  el("polygon",{points:hexPts(x,y,R*.9),fill:s.c,stroke:"rgba(255,255,255,.55)","stroke-width":1.5},lift);
  [[-12,4],[2,9],[11,-2]].forEach(([dx,dy],i)=>{const h=6+i*2;
    el("rect",{x:x+dx-3.5,y:y+dy-h,width:7,height:h,rx:1,fill:"rgba(255,255,255,.88)"},lift);
    el("rect",{x:x+dx-3.5,y:y+dy-h,width:7,height:2.2,rx:1,fill:"rgba(0,0,0,.25)"},lift)});
  const tr=el("g",{class:"tree"},lift);
  el("polygon",{points:`${x-20},${y+14} ${x-15},${y+3} ${x-10},${y+14}`,fill:"#1f6b35"},tr);
  el("polygon",{points:`${x-7},${y+17} ${x-3},${y+8} ${x+1},${y+17}`,fill:"#2f8a45"},tr);
  const sp=el("g",{class:"spark"},lift);
  el("circle",{cx:x-17,cy:y-14,r:4.5,fill:"#f2c14e",stroke:"#fff","stroke-width":1.2},sp);
  const t=el("text",{class:"num",x,y:y-9,"text-anchor":"middle"},lift);t.textContent=s.n;
  const f=el("g",{class:"flag"},lift);
  el("line",{x1:x+16,y1:y-4,x2:x+16,y2:y-22,stroke:"#fff","stroke-width":1.6},f);
  el("polygon",{points:`${x+16},${y-22} ${x+27},${y-18} ${x+16},${y-14}`,fill:"#fff"},f);
  g.addEventListener("click",()=>go(s.n));
  g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go(s.n)}});
});
const pin=el("g",{class:"pin",transform:`translate(${pos[9].x},${pos[9].y+64})`},svg);
el("ellipse",{cx:0,cy:2,rx:9,ry:2.5,fill:"rgba(0,0,0,.25)"},pin);
el("rect",{x:-15,y:-21,width:30,height:16,rx:8,fill:"var(--paper)",stroke:"var(--ink)","stroke-width":2},pin);
const pt=el("text",{x:0,y:-9.5,"text-anchor":"middle","font-size":9,"font-family":"Noto Sans TC",fill:"var(--ink)","font-weight":700,textLength:24,lengthAdjust:"spacingAndGlyphs"},pin);pt.textContent=PRO?"小組 Us":"你 You";
const bb=svg.getBBox();svg.setAttribute("viewBox",`${(bb.x-8).toFixed(0)} ${(bb.y-30).toFixed(0)} ${(bb.width+16).toFixed(0)} ${(bb.height+40).toFixed(0)}`);

/* state */
const KEY=PRO?"sdgIslePro1":"sdgIsleBasic1";
const FRESH=()=>({setup:!PRO,names:{},coins:PRO?80:60,choices:{},draft:{},quiz:{},crises:[],ripples:[],rippled:[],linkPaid:[],badges:[],name:"",sentence:"",turn:0});
let st=FRESH();
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s)st=Object.assign(FRESH(),s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
/* learning-trace logging (Google Apps Script endpoint from config.js) */
const CFG=window.SDG_CONFIG||{};
let who=null;try{who=JSON.parse(localStorage.getItem(KEY+"-who")||"null")}catch(e){}
const SID=Math.random().toString(36).slice(2,10);
let outbox=[];try{outbox=JSON.parse(localStorage.getItem(KEY+"-outbox")||"[]")}catch(e){}
let flushing=false,flushT=null;
const keepBox=()=>{try{localStorage.setItem(KEY+"-outbox",JSON.stringify(outbox.slice(-400)))}catch(e){}};
function log(type,o={}){if(!who)return;
  outbox.push({v:MODE,cls:who.cls,id:who.id,name:who.name,type,island:o.island??"",option:o.option??null,correct:o.correct??null,d:o.d||{},t:new Date().toISOString(),sid:SID});
  keepBox();clearTimeout(flushT);flushT=setTimeout(flush,1200)}
function flush(){if(!CFG.endpoint||!outbox.length||flushing)return;const batch=outbox.slice(0,25);flushing=true;
  fetch(CFG.endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({events:batch}),keepalive:true})
   .then(()=>{outbox=outbox.slice(batch.length);keepBox();flushing=false;if(outbox.length)setTimeout(flush,300)})
   .catch(()=>{flushing=false;setTimeout(flush,8000)})}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flush()});
setInterval(flush,15000);
const visitAt={};
const byN=n=>SDG[n-1];
const tag=(n,sign)=>`<span class="tag" style="background:${byN(n).c}">${sign} SDG ${n}</span>`;
const optOf=(n,i)=>i===2?(()=>{const c=st.choices[n]&&st.choices[n].c||st.draft[n]&&st.draft[n].c;return c?[c.text,c.text,c.gain,c.cost]:null})():byN(n).o[i];
const costOf=o=>o?(o.isC?30:10*o[2].length):0;
const priceOf=(n,i)=>i===2?30:10*byN(n).o[i][2].length;
const helped=(g,c)=>`${g.length?`<span>${Li("幫到","Helps")}</span> ${g.map(x=>tag(x,"+")).join(" ")}`:""}${c.length?`　<span>${Li("代價","Costs")}</span> ${c.map(x=>tag(x,"−")).join(" ")}`:""}`;
const roleName=r=>st.names[r.id]?`${esc(st.names[r.id])}`:"";
let current=null;
const secsOn=n=>visitAt[n]?Math.round((Date.now()-visitAt[n])/1000):null;

function toast(msg){const t=$("toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)}
function addCoins(d){st.coins+=d;const s=$("coinStat");s.classList.remove("bump");void s.offsetWidth;s.classList.add("bump")}
function scores(){
  const sc={};SDG.forEach(s=>sc[s.n]=0);
  Object.entries(st.choices).forEach(([n,ch])=>{const o=optOf(+n,ch.o);if(!o)return;o[2].forEach(x=>sc[x]++);o[3].forEach(x=>sc[x]--)});
  st.crises.forEach(([ci,p])=>{const o=CRISES[ci].o[p];o[3].forEach(x=>sc[x]++);o[4].forEach(x=>sc[x]--)});
  st.rippled.forEach(key=>{const r=RIPPLES[key];r[1].forEach(x=>sc[x]++);r[2].forEach(x=>sc[x]--)});
  return sc;
}
const activeLinks=()=>LINKS.filter(([a,b])=>st.choices[a]!=null&&st.choices[b]!=null);

/* modal queue */
let modalView=null; const queue=[];
function openModal(html,view){modalView=view;$("modal").innerHTML=html;$("overlay").hidden=false;const f=$("modal").querySelector("button,input");if(f)f.focus()}
function pump(){if(!$("overlay").hidden||!queue.length)return;queue.shift()()}
function closeModal(){$("overlay").hidden=true;modalView=null;setTimeout(pump,250)}
function enqueue(fn){queue.push(fn);setTimeout(pump,700)}

function go(n){
  if(!who){login();return}
  if(!st.setup){setupRoles();return}
  if(current!==n){visitAt[n]=Date.now();log("visit",{island:n})}
  current=n;
  document.querySelectorAll(".hex").forEach(h=>h.classList.toggle("sel",+h.dataset.n===n));
  document.querySelectorAll(".collab").forEach(l=>l.classList.toggle("hot",+l.dataset.a===n||+l.dataset.b===n));
  pin.setAttribute("transform",`translate(${pos[n].x},${pos[n].y+2})`);
  render(n);
}

function headHTML(s){return `<div class="sheet-head" style="background:${s.c}">
      <div class="n">ISLAND ${String(s.n).padStart(2,"0")} · SDG ${s.n}</div>
      <h2>${L(s.isle[0],s.isle[1])}</h2>
      <div class="sdgname">${Li(s.zh,s.en)}</div></div>`}
function contextHTML(s){return `<div><div class="sec-label"><span>${Li("島民心聲","Islander's Voice")}</span></div><p class="voice">${L(s.v[0],s.v[1])}</p></div>
      <div><div class="sec-label"><span>${Li("島上建築","Buildings")}</span></div>
        <ul class="blds">${s.b.map(b=>`<li><span class="b" style="background:${s.c}"></span><div>${L(b[0],b[1])}</div></li>`).join("")}</ul></div>`}
function quizHTML(s){const qa=st.quiz[s.n];return `<div class="box"><div class="sec-label"><span>${Li("英文補給站","Word Stop")}</span><em>${Li("答對 +10 幣","+10 coins")}</em></div>
    <p>Which word means “${s.q[0]}”?</p>
    <div class="opts qz">${s.q[1].map((w,i)=>{let c="";if(qa!=null){if(i===s.q[2])c=" right";else if(i===qa)c=" wrong"}
      return `<button class="opt${c}" data-q="${i}" ${qa!=null?"disabled":""}>${w}</button>`}).join("")}</div>
    ${qa!=null?`<div class="result">${qa===s.q[2]?L("答對了！+10 幣","Correct! +10 coins"):L(`這題沒拿到幣。答案是 <b>${s.q[1][s.q[2]]}</b>（${s.q[3]}）。`,`No coins this time. The answer is <b>${s.q[1][s.q[2]]}</b>.`)}</div>`:""}</div>`}
function linksHTML(n){const act=activeLinks();const h=LINKS.filter(l=>l[0]===n||l[1]===n).map(l=>{const o=l[0]===n?l[1]:l[0];const on=act.includes(l);
    return `<button class="link-btn${on?" on":""}" data-go="${o}">${on?"★":"↔"} ${o} ${Li(byN(o).isle[0]+"・"+l[2],byN(o).isle[1]+": "+l[3])}</button>`}).join("");
  return h?`<div><div class="sec-label"><span>${Li("協作線","Linked Islands")}</span></div><div class="links">${h}</div></div>`:""}
function bindCommon(n){
  const s=byN(n);
  $("sheet").querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>{
    const i=+b.dataset.q;st.quiz[n]=i;log("quiz",{island:n,option:i,correct:i===s.q[2],d:{word:s.q[1][s.q[2]],picked:s.q[1][i]}});if(i===s.q[2]){addCoins(10);toast(T("答對！永續幣 +10","Correct! +10 coins"))}save();render(n);refresh()}));
  $("sheet").querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(+b.dataset.go)));
}
function render(n){
  if(n==null){$("sheet").innerHTML=emptySheet();return}
  PRO?renderPro(n):renderBasic(n);
}

/* ---------- basic ---------- */
function renderBasic(n){
  const s=byN(n), ch=st.choices[n], pick=ch?ch.o:null;
  const mission=`<div class="box"><div class="sec-label"><span>${Li("島民任務","Your Call")}</span><em>${Li("決定後不能反悔","No take-backs")}</em></div>
    <p>${L(s.m[0],s.m[1])}</p>
    <div class="opts">${s.o.map((o,i)=>{const c=priceOf(n,i);const dis=pick!=null||st.coins<c;
      return `<button class="opt${pick===i?" picked":""}" data-i="${i}" ${dis?"disabled":""}><span class="cost">${c} ${Li("幣","coins")}</span><b>${"AB"[i]}</b>${L(o[0],o[1])}</button>`}).join("")}</div>
    ${pick==null&&s.o.some((o,i)=>st.coins<priceOf(n,i))?`<div class="hint">${L("幣不夠了？先到其他島的英文補給站賺幣。","Not enough coins? Earn more at other islands' Word Stops.")}</div>`:""}
    ${pick!=null?`<div class="result">${helped(s.o[pick][2],s.o[pick][3])}</div>`:""}</div>`;
  $("sheet").innerHTML=`${headHTML(s)}<div class="sheet-body">${contextHTML(s)}${quizHTML(s)}${mission}${linksHTML(n)}</div>`;
  bindCommon(n);
  $("sheet").querySelectorAll("[data-i]").forEach(b=>b.addEventListener("click",()=>{
    const i=+b.dataset.i;if(st.choices[n]!=null)return;const c=priceOf(n,i);if(st.coins<c)return;
    addCoins(-c);st.choices[n]={o:i};
    log("decide",{island:n,option:i,d:{coins:st.coins,secs:secsOn(n)}});
    afterDecision(n,i);
  }));
}

/* ---------- pro ---------- */
function predCandidates(n,o){
  const truth=o[3][0];const ex=new Set([...o[2],truth]);const out=[truth];
  for(let j=1;j<=17&&out.length<4;j++){const x=(n+j*5)%17+1;if(!ex.has(x)&&!out.includes(x))out.push(x)}
  return out.sort((a,b)=>((a*13+n)%17)-((b*13+n)%17));
}
function renderPro(n){
  const s=byN(n), ch=st.choices[n];
  if(ch){renderProDone(n);return}
  const d=st.draft[n]||(st.draft[n]={votes:{},pred:null,ev:null,reason:"",minority:{},c:null,cOpen:false});
  const counts=[0,0,0];Object.values(d.votes).forEach(v=>counts[v]++);
  const lead=counts.indexOf(Math.max(...counts));const leadOK=counts[lead]>=3;
  const leadOpt=leadOK?optOf(n,lead):null;
  const isC=lead===2;
  const dissent=ROLES.filter(r=>d.votes[r.id]!=null&&d.votes[r.id]!==lead);
  const allVoted=ROLES.every(r=>d.votes[r.id]!=null);
  const predOK=isC||d.pred!=null;
  const evOK=d.ev!=null, reasonOK=d.reason.trim().split(/\s+/).filter(Boolean).length>=6;
  const price=leadOK?priceOf(n,lead):0;
  const canPay=st.coins>=price;
  const ready=leadOK&&allVoted&&predOK&&evOK&&reasonOK&&canPay;
  const optsList=[0,1].map(i=>`<div class="static-opt${leadOK&&lead===i?" lead":""}"><span class="cost">${priceOf(n,i)} ${Li("幣","coins")}</span><b>${"AB"[i]}</b>${L(s.o[i][0],s.o[i][1])}</div>`).join("")
    +(d.c?`<div class="static-opt${leadOK&&lead===2?" lead":""}"><span class="cost">30 ${Li("幣","coins")}</span><b>C</b>${esc(d.c.text)}<div class="result">${helped(d.c.gain,d.c.cost)}</div></div>`:"");
  const cForm=d.cOpen&&!d.c?`<div class="box" id="cBox"><div class="sec-label"><span>${Li("提出折衷方案 C","Create option C")}</span><em>${Li("30 幣","30 coins")}</em></div>
      <div class="field"><label for="cText">${L("你們的方案（中英文皆可）","Your idea (Chinese or English)")}</label><textarea id="cText" placeholder="e.g. Keep the pool open on weekends only."></textarea></div>
      <p class="note">${L("選最多 2 個會幫到的目標：","Choose up to 2 goals it helps:")}</p>
      <div class="chips" id="cGain">${SDG.map(x=>`<button class="chip mini" style="background:${x.c}" data-g="${x.n}" aria-pressed="false">${x.n}</button>`).join("")}</div>
      <p class="note">${L("一定要選 1 個會付出代價的目標。沒有零代價的方案。","You must choose 1 goal that pays the price. No plan is free.")}</p>
      <div class="chips" id="cCost">${SDG.map(x=>`<button class="chip mini" style="background:${x.c}" data-k="${x.n}" aria-pressed="false">${x.n}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px"><button class="main-btn" id="cSave" disabled>${Li("加入投票選項","Add to the vote")}</button></div></div>`:"";
  const vote=`<div class="box"><div class="sec-label"><span><span class="step${leadOK&&allVoted?" ok":""}">1</span>${Li("投票","Vote")}</span><em>${Li("至少 3 票通過","3 votes to pass")}</em></div>
    <p>${L(s.m[0],s.m[1])}</p>
    <div class="opts" style="margin-bottom:10px">${optsList}</div>
    ${!d.c&&!d.cOpen?`<button class="ghost" id="cOpen" style="margin-bottom:10px">＋ ${Li("我們有更好的折衷方案 C","We have a better option C")}</button>`:""}
    ${cForm}
    <div class="vote">${ROLES.map(r=>`<div class="vrow"><div class="who">${Li(r.zh,r.en)} ${roleName(r)?`<small>${roleName(r)}</small>`:""}</div>
      <div class="vbtns">${["A","B"].concat(d.c?["C"]:[]).map((x,i)=>`<button data-v="${r.id}" data-o="${i}" aria-pressed="${d.votes[r.id]===i}">${x}</button>`).join("")}</div></div>`).join("")}</div>
    <div class="tally">A ${counts[0]}　B ${counts[1]}${d.c?`　C ${counts[2]}`:""}　${leadOK?L(`目前 ${"ABC"[lead]} 過半`,`${"ABC"[lead]} has a majority`):L("還沒有選項拿到 3 票，請繼續討論。","No option has 3 votes yet. Keep talking.")}</div>
    <details class="frames" style="margin-top:8px"><summary>${Li("協商句型","Talk Frames")}</summary>
      <ul>${FRAMES.map(f=>`<li><b>${Li(f[0],f[1])}</b>：${f[2].join(" / ")}</li>`).join("")}</ul></details></div>`;
  const predict=leadOK&&!isC?`<div class="box"><div class="sec-label"><span><span class="step${d.pred!=null?" ok":""}">2</span>${Li("預測代價","Predict the cost")}</span><em>${Li("猜對才算命中","Score on a hit")}</em></div>
    <p>${L(`如果選 ${"AB"[lead]}，你們認為哪個目標會付出代價？`,`If you choose ${"AB"[lead]}, which goal do you think will pay the price?`)}</p>
    <div class="chips">${predCandidates(n,leadOpt).map(x=>`<button class="chip" style="background:${byN(x).c}" data-p="${x}" aria-pressed="${d.pred===x}">${x} ${Li(byN(x).zh,byN(x).en)}</button>`).join("")}</div></div>`:"";
  const evidence=leadOK?`<div class="box"><div class="sec-label"><span><span class="step${evOK?" ok":""}">${isC?2:3}</span>${Li("引用證據","Choose evidence")}</span></div>
    <p class="note" style="margin:0 0 8px">${L("選一張你們的理由會用到的卡。也可以引用支持另一邊的卡，再說明為什麼它不夠有力。","Pick the card your reason will use. You can also pick a card for the other side and explain why it is not strong enough.")}</p>
    <div class="evs">${s.ev.map((e,i)=>`<button class="ev" data-e="${i}" aria-pressed="${d.ev===i}"><span class="side">${"AB"[i]}</span><span>${L(e[0],e[1])}</span></button>`).join("")}</div></div>`:"";
  const reason=leadOK?`<div class="box"><div class="sec-label"><span><span class="step${reasonOK?" ok":""}">${isC?3:4}</span>${Li("寫出理由","Give a reason")}</span><em>${Li("至少 6 個英文字","6+ English words")}</em></div>
    <textarea id="reason" placeholder="We chose ${"ABC"[lead]} because ___, even though ___.">${esc(d.reason)}</textarea>
    <div class="starters" style="margin-top:6px">${[`We chose ${"ABC"[lead]} because ___.`,"The evidence shows that ___, so ___.","Although it costs ___, we believe ___."].map(x=>`<button data-st="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`:"";
  const minority=leadOK&&dissent.length?`<div class="box"><div class="sec-label"><span><span class="step">${isC?4:5}</span>${Li("少數意見","Minority view")}</span><em>${Li("選填，會寫進紀錄","Optional, saved in the record")}</em></div>
    ${dissent.map(r=>`<div class="field" style="margin-bottom:8px"><label for="mi-${r.id}">${Li(r.zh,r.en)}：${L(`我投 ${"ABC"[d.votes[r.id]]}，因為…`,`I voted ${"ABC"[d.votes[r.id]]} because…`)}</label><input id="mi-${r.id}" data-m="${r.id}" value="${esc(d.minority[r.id]||"")}" placeholder="I see your point, but ___."></div>`).join("")}</div>`:"";
  const lock=`<div class="box"><div class="row"><button class="main-btn" id="lockBtn" ${ready?"":"disabled"}>${Li("通過決議","Pass the decision")}${leadOK?`　−${price}`:""}</button></div>
    <ul class="checklist">
      <li class="${leadOK&&allVoted?"ok":""}">${leadOK&&allVoted?"✓":"○"} ${Li("四人都投票，且有選項拿到 3 票","All four voted, and one option has 3 votes")}</li>
      ${isC?"":`<li class="${d.pred!=null?"ok":""}">${d.pred!=null?"✓":"○"} ${Li("完成代價預測","Cost predicted")}</li>`}
      <li class="${evOK?"ok":""}">${evOK?"✓":"○"} ${Li("選了證據卡","Evidence chosen")}</li>
      <li class="${reasonOK?"ok":""}">${reasonOK?"✓":"○"} ${Li("理由至少 6 個英文字","Reason has 6+ English words")}</li>
      ${leadOK&&!canPay?`<li style="color:var(--bad)">○ ${Li("永續幣不夠，先去英文補給站","Not enough coins. Visit a Word Stop first.")}</li>`:""}
    </ul></div>`;
  $("sheet").innerHTML=`${headHTML(s)}<div class="sheet-body">${contextHTML(s)}${quizHTML(s)}${vote}${predict}${evidence}${reason}${minority}${lock}${linksHTML(n)}</div>`;
  bindCommon(n);
  const sh=$("sheet");
  const keepScroll=fn=>{const y=window.scrollY;fn();save();renderPro(n);window.scrollTo(0,y)};
  sh.querySelectorAll("[data-v]").forEach(b=>b.addEventListener("click",()=>keepScroll(()=>{d.votes[b.dataset.v]=+b.dataset.o;d.pred=null})));
  sh.querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>keepScroll(()=>{d.pred=+b.dataset.p})));
  sh.querySelectorAll("[data-e]").forEach(b=>b.addEventListener("click",()=>keepScroll(()=>{d.ev=+b.dataset.e})));
  const co=$("cOpen");if(co)co.addEventListener("click",()=>keepScroll(()=>{d.cOpen=true}));
  if($("cBox")){
    const g=new Set(),kc={v:null};const chk=()=>{$("cSave").disabled=!($("cText").value.trim().length>=4&&g.size>=1&&kc.v)};
    sh.querySelectorAll("[data-g]").forEach(b=>b.addEventListener("click",()=>{const x=+b.dataset.g;if(g.has(x))g.delete(x);else if(g.size<2&&x!==kc.v)g.add(x);
      sh.querySelectorAll("[data-g]").forEach(c=>c.setAttribute("aria-pressed",g.has(+c.dataset.g)));chk()}));
    sh.querySelectorAll("[data-k]").forEach(b=>b.addEventListener("click",()=>{const x=+b.dataset.k;if(g.has(x))return;kc.v=kc.v===x?null:x;
      sh.querySelectorAll("[data-k]").forEach(c=>c.setAttribute("aria-pressed",+c.dataset.k===kc.v));chk()}));
    $("cText").addEventListener("input",chk);
    $("cSave").addEventListener("click",()=>keepScroll(()=>{d.c={text:$("cText").value.trim(),gain:[...g],cost:[kc.v]};d.cOpen=false}));
  }
  const rs=$("reason");
  if(rs){rs.addEventListener("input",()=>{d.reason=rs.value;save();updLock()});
    sh.querySelectorAll("[data-st]").forEach(b=>b.addEventListener("click",()=>{if(!rs.value){rs.value=b.dataset.st;d.reason=rs.value;save();updLock()}rs.focus()}))}
  sh.querySelectorAll("[data-m]").forEach(i=>i.addEventListener("input",()=>{d.minority[i.dataset.m]=i.value;save()}));
  function updLock(){const ok=d.reason.trim().split(/\s+/).filter(Boolean).length>=6;
    const li=sh.querySelectorAll(".checklist li");const idx=isC?2:3;if(li[idx]){li[idx].className=ok?"ok":"";li[idx].firstChild.textContent=(ok?"✓":"○")+" "}
    $("lockBtn").disabled=!(leadOK&&allVoted&&predOK&&evOK&&ok&&canPay)}
  $("lockBtn").addEventListener("click",()=>{
    if(st.choices[n])return;
    addCoins(-price);
    st.choices[n]={o:lead,pred:isC?null:d.pred,hit:isC?null:d.pred===leadOpt[3][0],ev:d.ev,reason:d.reason.trim(),votes:{...d.votes},minority:Object.fromEntries(Object.entries(d.minority).filter(([k,v])=>v.trim()&&dissent.some(r=>r.id===k))),c:isC?d.c:null,unan:counts[lead]===4};
    delete st.draft[n];
    {const c=st.choices[n];log("decide",{island:n,option:lead,correct:c.hit,d:{votes:c.votes,pred:c.pred,ev:c.ev,reason:c.reason,minority:c.minority,c:c.c,unan:c.unan,coins:st.coins,secs:secsOn(n)}})}
    if(!isC&&st.choices[n].hit)setTimeout(()=>toast(T("預測命中！","Prediction hit!")),400);
    afterDecision(n,lead);
  });
}
function renderProDone(n){
  const s=byN(n),ch=st.choices[n],o=optOf(n,ch.o);
  const label=ch.o===2?esc(ch.c.text):L(o[0],o[1]);
  const mins=Object.entries(ch.minority||{});
  const body=`<div class="box"><div class="sec-label"><span>${Li("已通過的決議","Decision passed")}</span><em>${ch.unan?Li("四票全數通過","Unanimous"):Li("多數通過","Majority")}</em></div>
    <div class="static-opt lead"><b>${"ABC"[ch.o]}</b>${label}</div>
    <div class="result">${helped(o[2],o[3])}</div>
    ${ch.o!==2?`<p class="note">${ch.hit?L(`預測命中：你們猜到會犧牲 SDG ${ch.pred}。`,`Prediction hit: you guessed SDG ${ch.pred} would pay the price.`):L(`預測未中：你們猜 SDG ${ch.pred}，實際是 SDG ${o[3][0]}。想想看，為什麼會影響到它？`,`Missed: you guessed SDG ${ch.pred}, but it was SDG ${o[3][0]}. Why do you think this goal was affected?`)}</p>`:""}
    <p class="note">${Li("證據","Evidence")}：${L(s.ev[ch.ev][0],s.ev[ch.ev][1])}</p>
    <p class="note">${Li("理由","Reason")}：${esc(ch.reason)}</p>
    ${mins.length?`<p class="note">${Li("少數意見","Minority view")}：${mins.map(([id,t])=>`${ROLES.find(r=>r.id===id).en}: ${esc(t)}`).join("；")}</p>`:""}</div>`;
  $("sheet").innerHTML=`${headHTML(s)}<div class="sheet-body">${contextHTML(s)}${quizHTML(s)}${body}${linksHTML(n)}</div>`;
  bindCommon(n);
}

/* ---------- shared after-decision flow ---------- */
function afterDecision(n,i){
  st.turn++;
  activeLinks().forEach(l=>{const key=l[0]+"-"+l[1];if(!st.linkPaid.includes(key)){st.linkPaid.push(key);addCoins(5);setTimeout(()=>toast(T(`協作線「${l[2]}」接通！+5 幣`,`Link “${l[3]}” is gold! +5 coins`)),900)}});
  if(PRO){
    const due=st.ripples.filter(r=>r.due<=st.turn);
    due.forEach(r=>{st.ripples=st.ripples.filter(x=>x!==r);enqueue(()=>ripple(r.key))});
    const key=n+"-"+i;if(RIPPLES[key])st.ripples.push({key,due:st.turn+2});
  }
  save();render(n);refresh();
  const done=Object.keys(st.choices).length;
  if(done%3===0&&st.crises.length<Math.min(CRISES.length,done/3))enqueue(crisis);
}
function ripple(key){
  const r=RIPPLES[key];if(st.rippled.includes(key))return closeModal();
  st.rippled.push(key);save();refresh();log("ripple",{island:+key.split("-")[0],d:{key,text:r[0][1]}});
  const [n,i]=key.split("-").map(Number);const s=byN(n);
  openModal(`<span class="crisis-head ripple">${Li("連鎖效應","RIPPLE EFFECT")}</span>
    <h2>${L(`${s.isle[0]}的決定，兩回合後…`,`Two rounds after your choice on ${s.isle[1]}…`)}</h2>
    <p class="sub">${L(r[0][0],r[0][1])}</p>
    <div class="result">${helped(r[1],r[2])}</div>
    <p class="note">${L("討論：當初做決定時，你們有想到這一步嗎？","Discuss: did your group see this coming when you decided?")}</p>
    <div class="row" style="margin-top:14px"><button class="main-btn" id="mClose">${Li("回到議會","Back to the council")}</button></div>`,"info");
  $("mClose").addEventListener("click",closeModal);
}
function crisis(){
  const ci=st.crises.length;const c=CRISES[ci];
  if(!c)return closeModal();
  openModal(`<span class="crisis-head">${Li("危機卡","CRISIS")} ${ci+1}</span><h2>${L(c.t[0],c.t[1])}</h2><p class="sub">${L(c.m[0],c.m[1])}</p>
   <div class="opts">${c.o.map((o,i)=>`<button class="opt" data-c="${i}" ${st.coins<o[2]?"disabled":""}><span class="cost">${o[2]?o[2]+" "+Li("幣","coins"):Li("免費","Free")}</span><b>${"AB"[i]}</b>${L(o[0],o[1])}</button>`).join("")}</div>
   <p class="sub" style="margin-top:10px">${L(`目前有 ${st.coins} 幣。${PRO?"危機卡由小組快速討論後決定，限時 1 分鐘。":""}`,`You have ${st.coins} coins now.${PRO?" Your group has one minute to decide.":""}`)}</p>`,"crisis");
  $("modal").querySelectorAll("[data-c]").forEach(b=>b.addEventListener("click",()=>{
    const i=+b.dataset.c;const o=c.o[i];addCoins(-o[2]);st.crises.push([ci,i]);save();log("crisis",{option:i,d:{card:ci,title:c.t[1]}});modalView="info";
    $("modal").innerHTML=`<span class="crisis-head">${Li("危機卡","CRISIS")} ${ci+1}</span><h2>${L("你的處理結果","Here's what happened")}</h2>
     <div class="result">${helped(o[3],o[4])}</div>
     <div class="row" style="margin-top:14px"><button class="main-btn" id="mClose">${Li("回到島上","Back to the islands")}</button></div>`;
    $("mClose").addEventListener("click",closeModal);$("mClose").focus();refresh();render(current);
  }));
}

/* ---------- login ---------- */
function login(){
  openModal(`<h2>${L("登島報到","Check in")}</h2>
   <p class="sub">${L(PRO?"填上班級和組別，老師才看得到你們這組的決議紀錄。":"填上班級、座號和名字，老師才看得到你的學習紀錄。",PRO?"Enter your class and group number so your teacher can see your decisions.":"Enter your class, seat number and name so your teacher can see your progress.")}</p>
   <div class="field"><label for="lgCls">${Li("班級","Class")}</label><input id="lgCls" inputmode="numeric" placeholder="208" maxlength="10"></div>
   ${PRO?`<div class="field" style="margin-top:8px"><label for="lgSeat">${Li("組別","Group")}</label><input id="lgSeat" inputmode="numeric" placeholder="3" maxlength="4"></div>`
     :`<div class="row" style="margin-top:8px;align-items:end"><div class="field" style="flex:1"><label for="lgSeat">${Li("座號","Seat no.")}</label><input id="lgSeat" inputmode="numeric" placeholder="15" maxlength="4"></div>
       <div class="field" style="flex:2"><label for="lgName">${Li("名字","Name")}</label><input id="lgName" placeholder="王小明" maxlength="20"></div></div>`}
   <p class="hint" id="lgErr" hidden></p>
   <div class="row" style="margin-top:14px"><button class="main-btn" id="lgGo">${Li("報到","Check in")}</button></div>`,"login");
  $("lgGo").addEventListener("click",()=>{
    const cls=$("lgCls").value.trim(),seat=$("lgSeat").value.trim(),name=PRO?"":$("lgName").value.trim();
    if(!cls||!seat||(!PRO&&!name)){$("lgErr").hidden=false;$("lgErr").textContent=T("每一格都要填喔","Please fill in every box.");return}
    who={cls,id:PRO?`${cls}-G${seat}`:`${cls}-${seat}`,name:PRO?`Group ${seat}`:name};
    try{localStorage.setItem(KEY+"-who",JSON.stringify(who))}catch(e){}
    if(!PRO&&!st.name){st.name=`${cls}-${seat} ${name}`;save()}
    log("start",{d:{lang}});
    closeModal();
    if(!st.setup)setupRoles();else{refresh();toast(T("報到完成！點一座島開始","Checked in! Tap an island to start."))}
  });
}
function whoLabel(){return who?`${esc(who.cls)} · ${esc(PRO?who.name:who.id.split("-").pop()+" "+who.name)}`:""}

/* ---------- roles (pro) ---------- */
function setupRoles(){
  openModal(`<h2>${L("議會成員就位","Council members, take your seats")}</h2>
   <p class="sub">${L("四人各選一個角色，填上名字。接著輪流拿手機，按「偷看」讀自己的秘密任務，看完再按一次蓋起來，不要讓別人看到。","Each of you picks a role and types your name. Then pass the device around. Tap “Peek” to read your secret mission, tap again to hide it, and don't let others see.")}</p>
   <div class="roles">${ROLES.map(r=>`<div class="role-card"><div class="t">${L(r.zh,r.en)}</div>
     <input data-name="${r.id}" value="${esc(st.names[r.id]||"")}" placeholder="${T("名字或座號","Name or seat no.")}" aria-label="${r.en} name">
     <button class="peek" data-peek="${r.id}">${Li("偷看秘密任務","Peek")}</button><div class="d" id="sec-${r.id}" hidden>${L(r.d[0],r.d[1])}</div></div>`).join("")}</div>
   <div class="row" style="margin-top:14px"><button class="main-btn" id="startPro">${Li("開始議會","Start the council")}</button></div>`,"role");
  $("modal").querySelectorAll("[data-name]").forEach(i=>i.addEventListener("input",()=>{st.names[i.dataset.name]=i.value;save()}));
  $("modal").querySelectorAll("[data-peek]").forEach(b=>b.addEventListener("click",()=>{const s=$("sec-"+b.dataset.peek);s.hidden=!s.hidden}));
  $("startPro").addEventListener("click",()=>{st.setup=true;save();log("roles",{d:{names:st.names}});closeModal();toast(T("議會開始！點一座島","The council is open! Tap an island."))});
}
function showRoles(){
  openModal(`<h2>${L("角色與秘密任務","Roles and secret missions")}</h2>
   <p class="sub">${L("輪流按「偷看」確認自己的任務。結算前請保密。","Take turns tapping “Peek” to check your own mission. Keep it secret until the debrief.")}</p>
   <div class="roles">${ROLES.map(r=>`<div class="role-card"><div class="t">${L(r.zh,r.en)}</div>${roleName(r)?`<div class="d">${roleName(r)}</div>`:""}
     <button class="peek" data-peek="${r.id}">${Li("偷看","Peek")}</button><div class="d" id="sec-${r.id}" hidden>${L(r.d[0],r.d[1])}</div></div>`).join("")}</div>
   <div class="row" style="margin-top:14px"><button class="main-btn" id="mClose">${Li("回到議會","Back to the council")}</button></div>`,"info");
  $("modal").querySelectorAll("[data-peek]").forEach(b=>b.addEventListener("click",()=>{const s=$("sec-"+b.dataset.peek);s.hidden=!s.hidden}));
  $("mClose").addEventListener("click",closeModal);
}

/* ---------- refresh + end ---------- */
function refresh(){
  const sc=scores();
  $("cells").innerHTML=SDG.map(s=>{const v=sc[s.n];return `<div class="cell" style="background:${s.c};opacity:${v===0?.45:1}" title="${s.zh} ${s.en}">${s.n}<span>${v>0?"+"+v:v<0?"−"+(-v):"0"}</span></div>`}).join("");
  document.querySelectorAll(".hex").forEach(h=>{h.classList.toggle("done",st.choices[h.dataset.n]!=null);h.classList.toggle("quizzed",st.quiz[h.dataset.n]===byN(+h.dataset.n).q[2])});
  const act=activeLinks();
  document.querySelectorAll(".collab").forEach(l=>l.classList.toggle("on",act.some(x=>x[0]==l.dataset.a&&x[1]==l.dataset.b)));
  const ch=Object.values(st.choices), done=ch.length;
  const right=SDG.filter(s=>st.quiz[s.n]===s.q[2]).length;
  const met=ROLES.filter(r=>done>0&&Object.entries(r.goal).every(([n,m])=>sc[n]>=m)).length;
  const hits=ch.filter(c=>c.hit).length;
  const got=PRO?{first:done>=1,consensus:ch.filter(c=>c.unan).length>=3,forecast:hits>=5,creative:ch.some(c=>c.o===2),
      voice:ch.reduce((a,c)=>a+Object.keys(c.minority||{}).length,0)>=3,link:act.length>=3,crisis:st.crises.length>=2,winwin:met>=3}
    :{first:done>=1,hopper:done>=8,word:right>=10,link:act.length>=3,crisis:st.crises.length>=2,balance:done>=8&&SDG.every(s=>sc[s.n]>=-1),all:done===17};
  BADGES.forEach(([id,zh,en])=>{if(got[id]&&!st.badges.includes(id)){st.badges.push(id);log("badge",{d:{id,name:en}});setTimeout(()=>toast(T(`解鎖徽章：${zh}`,`Badge unlocked: ${en}`)),1600)}});
  save();
  $("whoStat").hidden=!who;$("hWho").innerHTML=whoLabel();
  $("hCoin").textContent=st.coins;$("hMis").textContent=done;$("hLink").textContent=act.length;$("hBadge").textContent=st.badges.length;
  if(PRO)$("hPred").textContent=`${hits}/${ch.filter(c=>c.o!==2).length}`;
  $("badges").innerHTML=BADGES.map(([id,zh,en,dz,de])=>`<div class="badge${st.badges.includes(id)?" got":""}"><div class="t">${L(zh,en)}</div><div class="d">${L(dz,de)}</div></div>`).join("");
  PRO?renderDebrief(sc,done):renderTitle(sc,done);
}
function copyBind(card,extra){
  $("copyCard").addEventListener("click",()=>{const txt=card();log("card",{d:Object.assign({text:txt},extra?extra():{})});flush();
    navigator.clipboard.writeText(txt).then(()=>{$("copyMsg").textContent=T("已複製，可以貼到 Classroom","Copied! Paste it into Classroom.")},()=>{const rg=document.createRange();rg.selectNodeContents($("cardOut"));const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);$("copyMsg").textContent=T("已選取文字，請手動複製","Text selected. Please copy it yourself.")})});
}
function p5bars(sc){
  const ps=P5.map(p=>[p,p[2].reduce((a,n)=>a+Math.max(sc[n],0),0)]);
  const max=Math.max(1,...ps.map(x=>x[1]));
  return {ps,html:`<div class="pbars">${ps.map(([p,v])=>`<div class="pbar"><span>${Li(p[0],p[1])}</span><div class="track"><div class="fill" style="width:${v/max*100}%"></div></div><span class="v">${v}</span></div>`).join("")}</div>`};
}
function renderTitle(sc,done){
  const tc=$("titlecard");const {ps,html:bars}=p5bars(sc);
  const top=ps.slice().sort((a,b)=>b[1]-a[1])[0];
  if(done<5){tc.innerHTML=`${bars}<p class="sub" style="margin:0">${L(`再完成 ${5-done} 個任務，就能解鎖你的島主頭銜和反思卡。`,`Finish ${5-done} more mission${5-done>1?"s":""} to unlock your Island Title and reflection card.`)}</p>`;return}
  const low=SDG.map(s=>[s,sc[s.n]]).filter(x=>x[1]<0).sort((a,b)=>a[1]-b[1]).slice(0,2);
  const tz=top[1]>0?top[0][3]:"觀望中的島民", te=top[1]>0?top[0][4]:"Undecided Islander";
  tc.innerHTML=`<div class="ptitle">${L(tz,te)}</div>${bars}
    <div>${L(`你最常讓步的目標：${low.length?low.map(x=>`<b>${x[0].zh}</b>`).join("、"):"幾乎沒有，真的嗎？回頭檢查一次帳本"}。這些目標背後，是哪些人在承擔？`,
      `The goals you gave up most: ${low.length?low.map(x=>`<b>${x[0].en}</b>`).join(" and "):"almost none. Really? Check your ledger again"}. Who pays the price behind these goals?`)}</div>
    <div class="field"><label for="nm">${Li("姓名或座號","Name or seat number")}</label><input id="nm" value="${esc(st.name)}" placeholder="208-15"></div>
    <div class="field"><label for="sen">${L("用英文替你最難的決定辯護（1–2 句）","Defend your hardest decision in English (1–2 sentences).")}</label><textarea id="sen" placeholder="I chose ___ because ___, but it costs ___.">${esc(st.sentence)}</textarea></div>
    <div class="starters">${["I chose ___ because ___, but it costs ___.","Although ___, I believe ___ matters more.","If I were ___, I would feel ___ because ___."].map(x=>`<button data-st="${x}">${x}</button>`).join("")}</div>
    <div class="wordbank">${Li("可以用的字","Useful words")}：<b>trade-off</b>、<b>in the long run</b>、<b>at the cost of</b>、<b>benefit</b>、<b>sacrifice</b>、<b>priority</b></div>
    <div class="row"><button class="main-btn" id="copyCard">${Li("複製我的島主卡","Copy my Island Card")}</button><span class="sub" id="copyMsg" style="margin:0"></span></div>
    <pre id="cardOut"></pre>`;
  const card=()=>`【SDGs 永續島・島主卡 SDGs Island Card｜初期基本版】\n${st.name||"（未填 No name）"}\n頭銜 Title：${tz} ${te}\n任務 Missions ${done}/17｜協作線 Links ${activeLinks().length}/12｜徽章 Badges ${st.badges.length}/${BADGES.length}\n最常讓步 Gave up most：${low.map(x=>"SDG "+x[0].n+" "+x[0].en).join(", ")||"-"}\n我的辯護 My defense：${st.sentence||"-"}`;
  const upd=()=>{$("cardOut").textContent=card()};upd();
  $("nm").addEventListener("input",e=>{st.name=e.target.value;save();upd()});
  $("sen").addEventListener("input",e=>{st.sentence=e.target.value;save();upd()});
  tc.querySelectorAll("[data-st]").forEach(b=>b.addEventListener("click",()=>{const t=$("sen");if(!t.value){t.value=b.dataset.st;st.sentence=t.value;save();upd()}t.focus()}));
  copyBind(card,()=>({title:`${tz} ${te}`,sentence:st.sentence,name:st.name}));
}
function renderDebrief(sc,done){
  const tc=$("titlecard");const {html:bars}=p5bars(sc);
  if(done<6){tc.innerHTML=`${bars}<p class="sub" style="margin:0">${L(`再通過 ${6-done} 項決議，就能揭曉秘密任務並產生決議紀錄。`,`Pass ${6-done} more decision${6-done>1?"s":""} to reveal the secret missions and create your record.`)}</p>`;return}
  const entries=Object.entries(st.choices).map(([n,c])=>[+n,c]).sort((a,b)=>a[0]-b[0]);
  const hits=entries.filter(([,c])=>c.hit).length, tries=entries.filter(([,c])=>c.o!==2).length;
  const secrets=ROLES.map(r=>{const ok=Object.entries(r.goal).every(([n,m])=>sc[n]>=m);return [r,ok]});
  const split=entries.filter(([,c])=>!c.unan);
  const log=entries.map(([n,c])=>{const s=byN(n),o=optOf(n,c.o);
    return `<div class="logitem" style="border-color:${s.c}"><b>SDG ${n} ${Li(s.isle[0],s.isle[1])}</b>：${"ABC"[c.o]} ${c.o===2?esc(c.c.text):Li(o[0],o[1])}
      <div class="note">${c.unan?"4–0":"3–1"}｜${c.o===2?Li("自創方案","Own option"):c.hit?Li("預測命中","Hit"):Li("預測未中","Miss")}｜${esc(c.reason)}</div></div>`}).join("");
  tc.innerHTML=`${bars}
    <div><div class="sec-label"><span>${Li("秘密任務揭曉","Secret missions revealed")}</span></div>
      <div class="badges">${secrets.map(([r,ok])=>`<div class="secret${ok?" met":""}"><b>${Li(r.zh,r.en)}</b>${roleName(r)?` · ${roleName(r)}`:""}<div class="note">${L(r.d[0],r.d[1])}</div><div>${ok?L("✓ 達成","✓ Complete"):L("✗ 未達成","✗ Not complete")}</div></div>`).join("")}</div></div>
    <div><div class="sec-label"><span>${Li("決議紀錄","Decision log")}</span><em>${L(`預測命中 ${hits}/${tries}`,`Predictions ${hits}/${tries}`)}</em></div><div class="log">${log}</div></div>
    <div><div class="sec-label"><span>${Li("小組討論","Group discussion")}</span></div>
      <ol class="qs">
        <li>${L("哪一項決議最難達成共識？你們最後是怎麼說服彼此的？","Which decision was hardest to agree on? How did you finally convince each other?")}</li>
        <li>${L("秘密任務揭曉後，你重新理解了哪位隊友當時的投票？","Now that the secret missions are revealed, whose vote makes more sense to you?")}</li>
        <li>${L("哪一個連鎖效應最讓你們意外？下次決定前，你們會多問自己什麼問題？","Which ripple effect surprised you most? What question will you ask yourselves next time?")}</li>
        <li>${L("預測沒猜中的地方，說明了哪些目標之間有你們沒看見的關聯？","Where your predictions missed, what hidden links between goals did you discover?")}</li>
      </ol>
      ${split.length?`<p class="note">${L(`你們有 ${split.length} 項決議不是全票通過，討論時先從這些開始。`,`${split.length} of your decisions were not unanimous. Start your discussion with those.`)}</p>`:""}</div>
    <div class="row"><button class="main-btn" id="copyCard">${Li("複製小組決議紀錄","Copy our council record")}</button><span class="sub" id="copyMsg" style="margin:0"></span></div>
    <pre id="cardOut"></pre>`;
  const card=()=>{
    const members=ROLES.map(r=>`${r.en}${st.names[r.id]?"("+st.names[r.id]+")":""}`).join(", ");
    const lines=entries.map(([n,c])=>{const s=byN(n),o=optOf(n,c.o);
      const mins=Object.entries(c.minority||{}).map(([id,t])=>`${ROLES.find(r=>r.id===id).en}: ${t}`).join("; ");
      return `▸ SDG ${n} ${s.en}｜${"ABC"[c.o]} ${c.o===2?c.c.text:o[1]}｜${c.unan?"4-0":"3-1"}｜${c.o===2?"own option":c.hit?"prediction hit":"prediction miss"}\n  Evidence: ${s.ev[c.ev][1]}\n  Reason: ${c.reason}${mins?`\n  Minority: ${mins}`:""}`}).join("\n");
    return `【SDGs 永續島議會・決議紀錄 Council Record｜後期進階版】\nMembers: ${members}\nDecisions ${done}/17｜Links ${activeLinks().length}/12｜Predictions ${hits}/${tries}｜Badges ${st.badges.length}/${BADGES.length}\nSecret missions met: ${secrets.filter(x=>x[1]).map(x=>x[0].en).join(", ")||"none"}\n\n${lines}`};
  $("cardOut").textContent=card();
  copyBind(card,()=>({hits,tries,secrets:secrets.filter(x=>x[1]).map(x=>x[0].id)}));
}

/* ---------- wiring ---------- */
document.querySelectorAll(".lang button").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
$("toggleLines").addEventListener("click",e=>{const on=e.currentTarget.getAttribute("aria-pressed")!=="true";e.currentTarget.setAttribute("aria-pressed",on);lineLayer.style.display=on?"":"none"});
$("randomIsle").addEventListener("click",()=>{const left=SDG.filter(s=>st.choices[s.n]==null);const pool=left.length?left:SDG;go(pool[Math.floor(Math.random()*pool.length)].n)});
if(PRO){$("roleStat").addEventListener("click",showRoles);$("roleStat").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();showRoles()}})}
const canClose=()=>who&&st.setup&&modalView!=="crisis"&&modalView!=="role"&&modalView!=="login";
$("overlay").addEventListener("click",e=>{if(e.target.id==="overlay"&&canClose())closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("overlay").hidden&&canClose())closeModal()});
$("resetBtn").addEventListener("click",e=>{const b=e.currentTarget;
  if(!b.dataset.arm){b.dataset.arm=1;b.innerHTML=Li("再按一次確認","Tap again to confirm");setTimeout(()=>{delete b.dataset.arm;b.innerHTML=Li("重新開始","Restart")},3000);return}
  log("reset");flush();
  st=FRESH();save();current=null;queue.length=0;who=null;try{localStorage.removeItem(KEY+"-who")}catch(e){}delete b.dataset.arm;b.innerHTML=Li("重新開始","Restart");
  document.querySelectorAll(".hex").forEach(h=>h.classList.remove("sel"));document.querySelectorAll(".collab").forEach(l=>l.classList.remove("hot"));
  pin.setAttribute("transform",`translate(${pos[9].x},${pos[9].y+64})`);render(null);refresh();login()});
setLang(lang);
render(null);refresh();
if(!who)login();else if(!st.setup)setupRoles();
