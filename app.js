const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{return JSON.parse(localStorage.getItem("uc_"+k))??d}catch{return d}},set(k,v){localStorage.setItem("uc_"+k,JSON.stringify(v))}};
const state={
  route:location.hash.slice(1)||"dashboard", expr:"", result:"0", memory:0, angle:"DEG",
  history:store.get("history",[]), favorites:store.get("favorites",[]),
  notes:store.get("notes",[{id:Date.now(),title:"Quadratic Equations",body:"x² + 5x + 6 = 0\\n\\nDiscriminant: Δ = b² − 4ac\\n\\nx₁ = -2\\nx₂ = -3"}]),
  settings:store.get("settings",{theme:"dark",precision:8,compact:false,reducedMotion:false,thousands:true})
};
function save(){store.set("history",state.history);store.set("favorites",state.favorites);store.set("notes",state.notes);store.set("settings",state.settings)}
function toast(msg,type="success"){const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=msg;$("#toast-root").append(el);setTimeout(()=>el.remove(),2400)}
function navigate(route){state.route=route;location.hash=route;render()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-route]");if(b){e.preventDefault();navigate(b.dataset.route)}});
document.addEventListener("click",e=>{
 const toggle=e.target.closest("[data-dashboard-toggle]");
 if(toggle){
   const submenu=$("#dashboardSubmenu");
   const expanded=toggle.getAttribute("aria-expanded")==="true";
   toggle.setAttribute("aria-expanded",String(!expanded));
   submenu?.classList.toggle("open",!expanded);
 }
});

function safeEval(expr){
  let s=expr.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replace(/(\d+(?:\.\d+)?)%/g,"($1/100)")
    .replace(/π/g,"Math.PI").replace(/\be\b/g,"Math.E").replace(/√/g,"Math.sqrt");
  if(!/^[0-9+\-*/().%\sA-Za-z_]+$/.test(s))throw Error("Invalid expression");
  if(/\b(?:constructor|prototype|window|document|globalThis|Function|eval)\b/i.test(s))throw Error("Invalid expression");
  return Function(`"use strict";return (${s})`)();
}
function fmt(n){if(!Number.isFinite(n))throw Error("Result is not finite");let p=Math.max(0,Math.min(12,+state.settings.precision||8));return new Intl.NumberFormat("en-US",{maximumFractionDigits:p,useGrouping:state.settings.thousands}).format(n)}
function addHistory(expr,result,type="calculation"){if(!expr)return;state.history.unshift({id:Date.now(),expr,result,type,at:new Date().toISOString()});state.history=state.history.slice(0,2000);save()}
function calculate(){try{const n=safeEval(state.expr);state.result=fmt(n);addHistory(state.expr,state.result);render();}catch(e){toast(e.message==="Result is not finite"?"Unable to calculate":e.message||"Invalid expression","error")}}
function inputCalc(v){state.expr+=v;state.result="";render()}
function clearCalc(){state.expr="";state.result="0";render()}
function backspace(){state.expr=state.expr.slice(0,-1);render()}
function memory(action){let n=Number((state.result||"0").replaceAll(",",""));if(!Number.isFinite(n))return;
 if(action==="M+")state.memory+=n;if(action==="M-")state.memory-=n;if(action==="MR"){state.expr+=String(state.memory);render();return}if(action==="MC")state.memory=0;render()}
function keyButton(label,cls=""){return `<button class="key ${cls}" data-key="${label}">${label}</button>`}

function dashboard(){
 const recent=state.history.slice(0,5);
 return `<div class="page"><div class="page-head"><div><div class="eyebrow">Precision • Intelligence • Simplicity • Speed</div><h1>Welcome back</h1><p class="page-sub">Your mathematics workspace.</p></div><button class="btn primary" data-route="calculator">+ New Calculation</button></div>
 <div class="grid grid-4">
 ${quick("▣","Basic Calculator","125 × 8","= 1,000","calculator")}
 ${quick("∿","Scientific","sin(45°)","= 0.7071","scientific")}
 ${quick("⇄","Converter","100 km","→ 62.14 mi","converter")}
 ${quick("✎","Math Notes","Quadratic equations","Autosaved workspace","notes")}
 </div>
 <div class="grid grid-2" style="margin-top:18px"><section class="card pad"><div class="row between"><h2 class="section-title">Recent calculations</h2><button class="btn small" data-route="history">View all</button></div>${recent.length?`<div class="table-list">${recent.map(item=>listCalc(item)).join("")}</div>`:empty("🧮","No calculations yet","Your calculations will appear here after you start using the calculator.")}</section>
 <section class="card pad"><h2 class="section-title">Quick actions</h2><div class="stack"><button class="btn" data-route="calculator">▣ New Calculation</button><button class="btn" data-route="notes">✎ New Note</button><button class="btn" data-route="converter">⇄ Convert Units</button><button class="btn" data-route="scientific">∿ Open Scientific Calculator</button></div></section></div></div>`
}
function quick(icon,title,a,b,route){return `<button class="card quick-card" data-route="${route}" style="text-align:left"><div class="icon">${icon}</div><h3>${title}</h3><div class="formula">${a}</div><div class="muted">${b}</div></button>`}
function listCalc(i){return `<div class="list-item"><div><div class="formula">${esc(i.expr)}</div><strong>= ${esc(i.result)}</strong></div><button class="btn small" data-reuse="${i.id}">Reuse</button></div>`}
function empty(icon,title,sub){return `<div class="empty"><div style="font-size:28px">${icon}</div><strong>${title}</strong><div>${sub}</div></div>`}
function calculator(scientific=false){
 const keys=["AC","±","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="];
 return `<div class="page"><div class="page-head"><div><div class="eyebrow">${scientific?"Scientific calculator":"Calculator"}</div><h1>${scientific?"Scientific":"Basic"} calculator</h1><p class="page-sub">Fast, keyboard-friendly calculation with persistent history.</p></div></div>
 <div class="calculator-layout"><section class="card calc-card"><div class="display"><div class="expression">${esc(state.expr)||"&nbsp;"}</div><div class="result">${esc(state.result)}</div></div>
 <div class="calc-toolbar"><div class="modebar">${scientific?`<button class="${state.angle==="DEG"?"active":""}" data-angle="DEG">DEG</button><button class="${state.angle==="RAD"?"active":""}" data-angle="RAD">RAD</button>`:`<span class="memory">${state.memory!==0?"M":""}</span>`}</div><div class="row"><button class="btn small" data-memory="MC">MC</button><button class="btn small" data-memory="MR">MR</button><button class="btn small" data-memory="M-">M−</button><button class="btn small" data-memory="M+">M+</button></div></div>
 <div class="keypad">${keys.map(k=>keyButton(k,k==="="?"eq":(k==="0"?"wide":(["÷","×","−","+"].includes(k)?"op":"")))).join("")}</div>
 ${scientific?`<div class="scientific-keys">${["sin","cos","tan","asin","acos","atan","√","x²","xʸ","ln","log","!","π","e","(",")"].map(k=>`<button class="skey" data-sci="${k}">${k}</button>`).join("")}</div>`:""}</section>
 <aside class="card tool-card"><h3>Keyboard</h3><p class="muted">Use 0–9, +, −, ×, ÷, %, Enter, Escape and Backspace. Ctrl+K opens global search.</p><hr style="border:0;border-top:1px solid var(--border);margin:20px 0"><h3>Memory</h3><p class="muted">M+ adds the current result. M− subtracts it. MR recalls memory. MC clears it.</p></aside></div></div>`
}
function notes(){
 let active=state.notes[0];return `<div class="page"><div class="page-head"><div><div class="eyebrow">Math workspace</div><h1>Mathematics Notes</h1><p class="page-sub">A persistent notebook for equations, ideas and calculation blocks.</p></div><button class="btn primary" id="newNote">+ New Note</button></div>
 <div class="card notes-layout"><aside class="note-list"><input class="input" id="noteSearch" placeholder="Search notes..."><div id="noteItems">${state.notes.map(n=>`<button class="note-item ${n.id===active?.id?"active":""}" data-note="${n.id}" style="display:block;width:100%;text-align:left;background:transparent"><strong>${esc(n.title)}</strong><small class="muted">${esc(n.body.slice(0,55))}</small></button>`).join("")}</div></aside>
 <section class="note-editor-wrap">${active?`<input class="note-title" id="noteTitle" value="${attr(active.title)}"><div class="row between" style="margin-top:8px"><span class="muted" id="saveStatus">✓ Saved</span><button class="btn small" id="deleteNote">Delete</button></div><textarea class="note-editor" id="noteBody" aria-label="Math note">${esc(active.body)}</textarea>`:empty("📝","Your notebook is empty","Create your first note.")}</section></div></div>`
}
function converter(){
 const categories=["Length","Area","Volume"];
 return `<div class="page"><div class="page-head"><div><div class="eyebrow">Conversion tools</div><h1>Unit Converter</h1><p class="page-sub">Quick, transparent conversions without clutter.</p></div></div>
 <div class="card pad"><div class="converter-grid">${categories.map((c,i)=>`<button class="btn category ${i===0?"active":""}" data-category="${c}">${["📏","▧","◈"][i]} ${c}</button>`).join("")}</div>
 <div id="converterPanel" style="margin-top:22px">${converterPanel("Length")}</div></div>
 <div class="card pad" style="margin-top:18px"><div class="row between"><div><h2 class="section-title">Currency</h2><p class="muted">Architecture ready for live exchange-rate APIs; demo rates are clearly labeled.</p></div><span class="btn small">Live data</span></div>${currencyPanel()}</div></div>`
}
function converterPanel(cat){
 const units={
   Length:["Meter","Kilometer","Mile","Foot","Centimeter"],
   Area:["Square meter","Square kilometer","Square foot"],
   Volume:["Liter","Milliliter","Gallon"]
 }[cat]||["Unit"];
 return `<div class="convert-box">
   <label><span class="muted">FROM</span><input class="input convert-value" value="100">
   <select class="select from-unit">${units.map(u=>`<option>${u}</option>`).join("")}</select></label>
   <button class="swap" id="swap" aria-label="Swap units">⇄</button>
   <label><span class="muted">TO</span><input class="input result-field" readonly value="${cat==="Length"?"0.0621":"100"}">
   <select class="select to-unit">${units.map((u,i)=>`<option ${i===1?"selected":""}>${u}</option>`).join("")}</select></label>
 </div>
 <div style="margin-top:18px;text-align:center"><span class="stat result-caption">${cat==="Length"?"62.1371 Kilometer":"100 "+units[0]}</span></div>`;
}
function currencyPanel(){
 const currencies=[
   ["USD","🇺🇸","US Dollar"],["NGN","🇳🇬","Nigerian Naira"],["EUR","🇪🇺","Euro"],
   ["GBP","🇬🇧","British Pound"],["CAD","🇨🇦","Canadian Dollar"],["AUD","🇦🇺","Australian Dollar"],
   ["JPY","🇯🇵","Japanese Yen"],["CNY","🇨🇳","Chinese Yuan"],["INR","🇮🇳","Indian Rupee"],
   ["ZAR","🇿🇦","South African Rand"],["GHS","🇬🇭","Ghanaian Cedi"],["KES","🇰🇪","Kenyan Shilling"],
   ["AED","🇦🇪","UAE Dirham"],["SAR","🇸🇦","Saudi Riyal"],["CHF","🇨🇭","Swiss Franc"]
 ];
 const options=currencies.map(([code,flag,name])=>`<option value="${code}">${flag} ${code} — ${name}</option>`).join("");
 return `<div class="currency-card">
   <div class="currency-head">
     <div><h3 style="margin:0">Live Currency Converter</h3><p class="muted" style="margin:4px 0 0">Live rates from ExchangeRate-API Open Access · no API key required.</p></div>
     <button class="btn small" id="refreshCurrency">↻ Refresh rates</button>
   </div>
   <div class="convert-box" style="margin-top:18px">
     <label><span class="muted">FROM</span><input class="input" type="number" min="0" step="any" value="100" id="currencyAmount" aria-label="Currency amount"><select class="select" id="currencyFrom" aria-label="From currency">${options}</select></label>
     <button class="swap" id="currencySwap" aria-label="Swap currencies">⇄</button>
     <label><span class="muted">TO</span><input class="input" readonly value="Loading…" id="currencyResult" aria-label="Converted amount"><select class="select" id="currencyTo" aria-label="To currency"><option value="NGN" selected>🇳🇬 NGN — Nigerian Naira</option>${options.replace('<option value="NGN">🇳🇬 NGN — Nigerian Naira</option>','')}</select></label>
   </div>
   <div class="currency-meta">
     <div id="currencyRate">Getting live exchange rate…</div>
     <div id="currencyUpdated" class="muted">Connecting to ExchangeRate-API…</div>
   </div>
   <div id="currencyStatus" class="currency-status" role="status" aria-live="polite"></div>
 </div>`;
}

let currencyState={from:"USD",to:"NGN",amount:100,rates:null,updated:null};

async function loadCurrencyRates(){
 const status=$("#currencyStatus"), result=$("#currencyResult");
 if(!status||!result)return;
 status.textContent="Updating live exchange rates…";
 status.className="currency-status loading";
 try{
   const response=await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(currencyState.from)}`,{cache:"no-store"});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const data=await response.json();
   if(data.result!=="success"||!data.rates)throw new Error(data["error-type"]||"Rate data unavailable");
   currencyState.rates=data.rates;
   currencyState.updated=data.time_last_update_utc||new Date().toUTCString();
   updateCurrencyResult();
   status.textContent="✓ Live rates updated";
   status.className="currency-status success";
 }catch(err){
   result.value="Unavailable";
   $("#currencyRate").textContent="Live rate unavailable";
   $("#currencyUpdated").textContent="Check your internet connection and try Refresh.";
   status.textContent="⚠ Could not retrieve live rates. The calculator itself remains available offline.";
   status.className="currency-status error";
 }
}

function updateCurrencyResult(){
 if(!currencyState.rates)return;
 const rate=currencyState.rates[currencyState.to];
 if(typeof rate!=="number"){
   $("#currencyResult").value="Unavailable";
   return;
 }
 const amount=Number(currencyState.amount)||0;
 const converted=amount*rate;
 $("#currencyResult").value=new Intl.NumberFormat("en-US",{maximumFractionDigits:8}).format(converted);
 $("#currencyRate").textContent=`1 ${currencyState.from} = ${new Intl.NumberFormat("en-US",{maximumFractionDigits:8}).format(rate)} ${currencyState.to}`;
 $("#currencyUpdated").textContent=`Last updated: ${currencyState.updated||"just now"}`;
}

function bindCurrency(){
 const amount=$("#currencyAmount"),from=$("#currencyFrom"),to=$("#currencyTo");
 if(!amount||!from||!to)return;
 from.value=currencyState.from;to.value=currencyState.to;amount.value=currencyState.amount;
 amount.addEventListener("input",()=>{currencyState.amount=amount.value;updateCurrencyResult()});
 from.addEventListener("change",()=>{currencyState.from=from.value;currencyState.rates=null;loadCurrencyRates()});
 to.addEventListener("change",()=>{currencyState.to=to.value;updateCurrencyResult()});
 $("#currencySwap")?.addEventListener("click",()=>{
   [currencyState.from,currencyState.to]=[currencyState.to,currencyState.from];
   from.value=currencyState.from;to.value=currencyState.to;
   loadCurrencyRates();
 });
 $("#refreshCurrency")?.addEventListener("click",loadCurrencyRates);
 loadCurrencyRates();
}
function historyPage(fav=false){let arr=fav?state.favorites:state.history;return `<div class="page"><div class="page-head"><div><div class="eyebrow">Library</div><h1>${fav?"Favorites":"History"}</h1><p class="page-sub">${fav?"Saved calculations and reusable work.":"Search and reuse previous calculations."}</p></div>${!fav?`<button class="btn danger" id="clearHistory">Clear All</button>`:""}</div><div class="card pad"><input class="input" id="historySearch" placeholder="🔍 Search calculations..."><div class="table-list" id="historyList" style="margin-top:8px">${arr.length?arr.map(i=>listCalc(i)).join(""):empty(fav?"☆":"🧮",fav?"No favorites yet":"No calculations yet",fav?"Save useful calculations to find them here.":"Start calculating to build your history.")}</div></div></div>`}
function settings(){
 return `<div class="page"><div class="page-head"><div><div class="eyebrow">Preferences</div><h1>Settings</h1><p class="page-sub">Control appearance, calculator behavior, accessibility and data.</p></div></div>
 <div class="grid grid-2"><section class="card settings-section"><h2 class="section-title">Appearance</h2>${settingSelect("Theme","Choose how the interface looks",`<select class="select" id="themeSelect"><option value="dark" ${state.settings.theme==="dark"?"selected":""}>Dark</option><option value="light" ${state.settings.theme==="light"?"selected":""}>Light</option><option value="system" ${state.settings.theme==="system"?"selected":""}>System</option></select>`)}${settingToggle("Compact mode","Reduce visual spacing","compact")}${settingToggle("Reduced motion","Minimize interface animation","reducedMotion")}</section>
 <section class="card settings-section"><h2 class="section-title">Calculator</h2>${settingSelect("Decimal precision","Maximum displayed decimal places",`<input class="input" id="precision" type="number" min="0" max="12" value="${state.settings.precision}">`)}${settingToggle("Thousands separator","Format large results with grouping","thousands")}</section>
 <section class="card settings-section"><h2 class="section-title">Data</h2><div class="setting"><div><strong>Export workspace</strong><small>Download history, notes, favorites and settings as JSON.</small></div><button class="btn" id="exportData">Export</button></div><div class="setting"><div><strong>Import workspace</strong><small>Restore a previously exported backup.</small></div><button class="btn" id="importData">Import</button></div><div class="setting"><div><strong>Reset application</strong><small>Clear local data and restore defaults.</small></div><button class="btn danger" id="resetData">Reset</button></div></section></div></div>`
}
function settingToggle(label,desc,key){return `<div class="setting"><div><strong>${label}</strong><small>${desc}</small></div><button class="toggle ${state.settings[key]?"on":""}" data-setting="${key}" aria-label="${label}"><span></span></button></div>`}
function settingSelect(label,desc,control){return `<div class="setting"><div><strong>${label}</strong><small>${desc}</small></div><div style="width:180px">${control}</div></div>`}
function help(){return `<div class="page"><div class="page-head"><div><div class="eyebrow">Guides</div><h1>Help</h1><p class="page-sub">Everything you need to work quickly in Ultimate Calculator.</p></div></div><div class="grid grid-2">${["Calculator controls","Keyboard shortcuts","Scientific functions","Converter usage","Currency data","Math Notes","History & Favorites","Themes & Accessibility","Data export/import"].map((x,i)=>`<section class="card pad"><h2 class="section-title">${x}</h2><p class="muted">${["Use the keypad or keyboard. Enter calculates, Escape clears, Backspace deletes the last character.","Digits and operators work directly. Ctrl+K opens search. Use Tab to navigate controls.","Use DEG/RAD, trig, inverse trig, powers, logarithms, factorial, π and e.","Choose a category, select units, enter a value and swap directions as needed.","Live exchange rates are retrieved from ExchangeRate-API Open Access when you are online.","Notes autosave to browser storage and support mathematical symbols and equation text.","Calculations persist locally and can be reused or saved as favorites.","Dark, light and system themes are supported, with reduced-motion and keyboard accessibility.","Export creates a JSON backup containing your local workspace."][i]}</p></section>`).join("")}</div></div>`}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
const attr=esc;

function render(){
 applyTheme();
 const views={dashboard:dashboard,calculator:()=>calculator(false),scientific:()=>calculator(true),notes,converter,history:()=>historyPage(false),favorites:()=>historyPage(true),settings,help};
 $("#main").innerHTML=(views[state.route]||dashboard)();
 $$(".nav-group button").forEach(b=>b.classList.toggle("active",b.dataset.route===state.route));
 bindView();
}
function applyTheme(){
 let t=state.settings.theme;if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;
}
function bindView(){
 $$(".key").forEach(b=>b.onclick=()=>{let k=b.dataset.key;if(k==="AC")clearCalc();else if(k==="=")calculate();else if(k==="±"){if(state.expr)state.expr=state.expr.startsWith("-")?state.expr.slice(1):"-"+state.expr;render()}else if(k==="%")inputCalc("%");else inputCalc(k)});
 $$("[data-memory]").forEach(b=>b.onclick=()=>memory(b.dataset.memory));
 $$("[data-angle]").forEach(b=>b.onclick=()=>{state.angle=b.dataset.angle;render()});
 $$("[data-sci]").forEach(b=>b.onclick=()=>{const k=b.dataset.sci;const map={sin:"Math.sin(",cos:"Math.cos(",tan:"Math.tan(",asin:"Math.asin(",acos:"Math.acos(",atan:"Math.atan(", "√":"Math.sqrt(","x²":"**2","xʸ":"**","ln":"Math.log(","log":"Math.log10(","!":"!","π":"π","e":"e"};if(k==="x²")state.expr=`(${state.expr})**2`;else if(k==="xʸ")state.expr+=`**`;else if(k==="!")state.expr+=`!`;else state.expr+=map[k]||k;render()});
 $$("[data-reuse]").forEach(b=>b.onclick=()=>{let x=state.history.find(i=>String(i.id)===b.dataset.reuse);if(x){state.expr=x.expr;state.result=x.result;navigate("calculator")}});
 $("#clearHistory")?.addEventListener("click",()=>{state.history=[];save();toast("History cleared");render()});
 $("#newNote")?.addEventListener("click",()=>{const n={id:Date.now(),title:"Untitled Note",body:""};state.notes.unshift(n);save();render();setTimeout(()=>$("#noteTitle")?.focus(),50)});
 $("#deleteNote")?.addEventListener("click",()=>{if(state.notes[0]){state.notes=state.notes.filter(n=>n!==state.notes[0]);save();toast("Note deleted");render()}});
 $("#noteTitle")?.addEventListener("input",e=>{state.notes[0].title=e.target.value;save();$("#saveStatus").textContent="✓ Saved"});
 $("#noteBody")?.addEventListener("input",e=>{state.notes[0].body=e.target.value;save();$("#saveStatus").textContent="✓ Saved"});
 $$(".category").forEach(b=>b.onclick=()=>{$$(".category").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#converterPanel").innerHTML=converterPanel(b.dataset.category);bindConverter()});
 bindConverter();
 bindCurrency();
 $("#historySearch")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();$$(".list-item","#historyList").forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?"flex":"none")});
 $("#noteSearch")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();$$(".note-item").forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?"block":"none")});
 $("#themeSelect")?.addEventListener("change",e=>{state.settings.theme=e.target.value;save();render();toast("Theme changed")});
 $("#precision")?.addEventListener("change",e=>{state.settings.precision=Math.max(0,Math.min(12,+e.target.value||8));save();toast("Precision updated")});
 $$("[data-setting]").forEach(b=>b.onclick=()=>{const k=b.dataset.setting;state.settings[k]=!state.settings[k];save();render()});
 $("#exportData")?.addEventListener("click",exportData);$("#importData")?.addEventListener("click",importData);
 $("#resetData")?.addEventListener("click",()=>{if(confirm("Reset all local application data?")){localStorage.clear();location.reload()}});
}
function bindConverter(){
 $("#swap")?.addEventListener("click",()=>{const f=$(".from-unit"),t=$(".to-unit");[f.value,t.value]=[t.value,f.value];updateConversion()});
 $$(".convert-value,.from-unit,.to-unit").forEach(x=>x.addEventListener("input",updateConversion));
}
function updateConversion(){
 const value=+$(".convert-value")?.value||0,from=$(".from-unit")?.value,to=$(".to-unit")?.value;
 if(!$(".result-field"))return;
 let out=value;

 const length={
   "Meter":1,"Kilometer":1000,"Mile":1609.344,"Foot":0.3048,"Centimeter":0.01
 };
 const area={
   "Square meter":1,"Square kilometer":1e6,"Square foot":0.09290304
 };
 const volume={
   "Liter":1,"Milliliter":0.001,"Gallon":3.785411784
 };

 if(from===to){
   out=value;
 }else if(length[from]&&length[to]){
   out=value*length[from]/length[to];
 }else if(area[from]&&area[to]){
   out=value*area[from]/area[to];
 }else if(volume[from]&&volume[to]){
   out=value*volume[from]/volume[to];
 }

 $(".result-field").value=fmt(out);
 $(".result-caption").textContent=`${fmt(value)} ${from} → ${fmt(out)} ${to}`;
}
function exportData(){const blob=new Blob([JSON.stringify({history:state.history,favorites:state.favorites,notes:state.notes,settings:state.settings},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="calculator-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Workspace exported")}
function importData(){const i=document.createElement("input");i.type="file";i.accept=".json";i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||typeof d!=="object")throw 0;if(Array.isArray(d.history))state.history=d.history;if(Array.isArray(d.favorites))state.favorites=d.favorites;if(Array.isArray(d.notes))state.notes=d.notes;if(d.settings)state.settings={...state.settings,...d.settings};save();render();toast("Workspace imported")}catch{toast("Invalid backup file","error")}};r.readAsText(f)};i.click()}
function openSearch(){
 const backdrop=document.createElement("div");backdrop.className="modal-backdrop";backdrop.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="Global search"><div class="modal-search"><input class="input" id="globalSearch" autofocus placeholder="Search tools, notes, history..."></div><div class="command-results" id="searchResults"></div></div>`;$("#modal-root").append(backdrop);
 const data=[["Basic Calculator","calculator"],["Scientific Calculator","scientific"],["Math Notes","notes"],["Unit Converter","converter"],["History","history"],["Favorites","favorites"],["Settings","settings"],["Help","help"],["sin()","scientific"],["Length","converter"],["Area","converter"],["Volume","converter"],...state.notes.map(n=>[n.title,"notes"]),...state.history.slice(0,30).map(h=>[h.expr+" = "+h.result,"calculator"])];
 const input=$("#globalSearch"),results=$("#searchResults");function update(){const q=input.value.toLowerCase();results.innerHTML=data.filter(x=>x[0].toLowerCase().includes(q)).slice(0,12).map(x=>`<button class="command" data-go="${x[1]}" style="display:block;width:100%;text-align:left;background:transparent">→ ${esc(x[0])}</button>`).join("")||`<div class="empty">No matching results</div>`;$$("[data-go]",results).forEach(b=>b.onclick=()=>{backdrop.remove();navigate(b.dataset.go)})}input.oninput=update;update();backdrop.onclick=e=>{if(e.target===backdrop)backdrop.remove()};
}
$("#searchTrigger").onclick=openSearch;$("#themeBtn").onclick=()=>{state.settings.theme=state.settings.theme==="dark"?"light":"dark";save();applyTheme();toast("Theme changed")};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}if(state.route==="calculator"||state.route==="scientific"){if(e.target.matches("input,textarea"))return;if(/^[0-9.]$/.test(e.key))inputCalc(e.key);else if(["+","-","*","/","%","(",")"].includes(e.key))inputCalc(e.key==="*"?"×":e.key);else if(e.key==="Enter")calculate();else if(e.key==="Escape")clearCalc();else if(e.key==="Backspace")backspace()}});
window.addEventListener("hashchange",()=>{state.route=location.hash.slice(1)||"dashboard";render()});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
render();