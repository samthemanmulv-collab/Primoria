
const LESSONS = (window.PRIMORIA_LESSONS || []).slice().sort((a,b)=>a.chronology-b.chronology);
const SCHOOLS = ["Western History","Classics","Philosophy","Theology","Law","Political Thought"];
const KEY = "primoria.premier.beta";
const DEFAULTS = {
  tab:"Home", lesson:null, completed:[], bookmarks:[], xp:0, streak:1, lastVisit:null,
  query:"", school:"All", region:"All", fontSize:20, lineHeight:1.75, readerWidth:780,
  theme:"dark", readerMode:"study", hideGuidance:false
};
let state = {...DEFAULTS};
try { state={...state,...JSON.parse(localStorage.getItem(KEY)||"{}")}; } catch {}
const today=new Date().toISOString().slice(0,10);
const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(state.lastVisit!==today){
  state.streak=state.lastVisit===yesterday?(state.streak||0)+1:1;
  state.lastVisit=today; persist();
}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function persist(){ localStorage.setItem(KEY,JSON.stringify(state)); updateChrome(); }
function updateChrome(){
  $("#xp").textContent=state.xp; $("#done").textContent=state.completed.length;
  $("#marks").textContent=state.bookmarks.length; $("#streak").textContent=state.streak;
  document.documentElement.dataset.theme=state.theme;
  document.documentElement.style.setProperty("--reader-size",state.fontSize+"px");
  document.documentElement.style.setProperty("--reader-leading",state.lineHeight);
  document.documentElement.style.setProperty("--reader-width",state.readerWidth+"px");
}
function go(tab){state.tab=tab;state.lesson=null;window.scrollTo({top:0,behavior:"smooth"});render()}
function openLesson(id){state.lesson=id;window.scrollTo({top:0,behavior:"smooth"});render()}
function toggleBookmark(id){
  state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];
  persist();render();
}
function nav(){
  const items=["Home","Journey","Quick Read","Library","Paths","Bookmarks",...SCHOOLS];
  $("#nav").innerHTML=items.map(x=>`<button class="${state.tab===x?"active":""}" onclick="go('${x}')">${x}</button>`).join("");
}
function desc(s){
 return {
  "Western History":"Egypt, Greece, Rome, England, France, Germany, Spain, and Portugal through primary evidence.",
  "Classics":"Epic, tragedy, poetry, and literature from Homer, Sophocles, Virgil, Ovid, and others.",
  "Philosophy":"A chronological path from ancient philosophy through Nietzsche.",
  "Theology":"Foundational biblical and Christian writings, distinguished by genre and historical setting.",
  "Law":"Written law, procedure, authority, rights, and codification from Babylon to modern Europe.",
  "Political Thought":"Citizenship, sovereignty, consent, democracy, civil society, and power."
 }[s]||"";
}
function statusBadge(l){
 const r=l.review||{};
 if(r.textVerified&&r.copyrightCleared)return `<span class="badge verified">Verified edition</span>`;
 return `<span class="badge review">Editorial review pending</span>`;
}
function card(l){
 return `<article class="card clickable" onclick="openLesson('${l.id}')">
  <div class="eyebrow">${esc(l.school)} · ${esc(l.region)}</div>
  <h3>${esc(l.title)}</h3>
  <p>${esc(l.author)} · ${esc(l.date)}</p>
  <div class="badges">
   <span class="badge">${l.estimatedMinutes||5} min</span>
   <span class="badge">Difficulty ${l.difficulty||2}/5</span>
   ${statusBadge(l)}
   ${state.completed.includes(l.id)?'<span class="badge verified">✓ Completed</span>':''}
  </div>
 </article>`;
}
function nextLesson(){
 return LESSONS.find(l=>!state.completed.includes(l.id))||LESSONS[0];
}
function home(){
 const next=nextLesson();
 const philosophy=LESSONS.filter(l=>l.school==="Philosophy");
 return `<section class="hero">
  <div class="eyebrow">Primoria · Premier Beta</div>
  <h2>Welcome to the Great Conversation.</h2>
  <p>Follow the development of Western ideas chronologically—or begin <em>in medias res</em> wherever curiosity leads. Primoria recommends an order without locking the library.</p>
  <div class="actions">
   <button class="btn primary" onclick="go('Journey')">Begin at the beginning</button>
   <button class="btn" onclick="go('Library')">Explore freely</button>
   <button class="btn" onclick="go('Quick Read')">I have five minutes</button>
  </div>
 </section>
 <section class="dashboard-grid">
  <article class="panel">
   <div class="eyebrow">Continue chronologically</div><h3>${esc(next.title)}</h3>
   <p>${esc(next.author)} · ${next.estimatedMinutes||5} minutes</p>
   <button class="btn primary" onclick="openLesson('${next.id}')">Continue</button>
  </article>
  <article class="panel"><div class="eyebrow">Your progress</div>
   <h3>${state.completed.length} of ${LESSONS.length} lessons</h3>
   <div class="progress"><span style="width:${Math.round(state.completed.length/LESSONS.length*100)}%"></span></div>
   <p>${state.xp} XP · ${state.streak}-day return streak</p>
  </article>
 </section>
 <h2 class="section-title">Schools</h2>
 <section class="grid">${SCHOOLS.map(s=>{
  const all=LESSONS.filter(l=>l.school===s),d=all.filter(l=>state.completed.includes(l.id)).length;
  return `<article class="card clickable" onclick="go('${s}')"><div class="eyebrow">${all.length} lessons</div><h3>${s}</h3><p>${desc(s)}</p><div class="progress"><span style="width:${all.length?d/all.length*100:0}%"></span></div></article>`
 }).join("")}</section>
 <h2 class="section-title">Philosophy through Nietzsche</h2>
 <section class="horizontal">${philosophy.map(card).join("")}</section>`;
}
function journey(){
 return `<section class="hero compact"><div class="eyebrow">Recommended order · nothing locked</div>
 <h2>Journey through civilization</h2><p>Chronology helps later writers become intelligible, but every lesson remains available. Green means completed; gold marks the recommended next lesson.</p></section>
 <section class="timeline">${LESSONS.map((l,i)=>{
  const done=state.completed.includes(l.id), next=l.id===nextLesson().id;
  return `<div class="timeline-item ${done?"done":""} ${next?"next":""}">
    <button onclick="openLesson('${l.id}')"><span>${i+1}</span><div><strong>${esc(l.title)}</strong><small>${esc(l.date)} · ${esc(l.school)}</small></div></button>
  </div>`
 }).join("")}</section>`;
}
function quickRead(){
 const pool=LESSONS.filter(l=>!state.completed.includes(l.id));
 const l=pool[Math.floor((new Date().getDate()+state.completed.length)%Math.max(pool.length,1))]||LESSONS[0];
 return `<section class="hero compact"><div class="eyebrow">Doomscroll replacement</div><h2>Five-minute reading</h2><p>One passage, one idea, one question. Stop after this or continue deeper.</p></section>
 <article class="quick-card"><div class="eyebrow">${esc(l.school)} · ${l.estimatedMinutes||5} min</div><h2>${esc(l.title)}</h2>
 <p>${esc(l.context)}</p><blockquote>${esc(l.excerpt)}</blockquote>
 <button class="btn primary" onclick="openLesson('${l.id}')">Read and answer</button></article>`;
}
function filtered(){
 const q=state.query.toLowerCase().trim();
 return LESSONS.filter(l=>(!q||JSON.stringify(l).toLowerCase().includes(q))&&(state.school==="All"||l.school===state.school)&&(state.region==="All"||l.region===state.region));
}
function filters(){
 const regions=[...new Set(LESSONS.map(l=>l.region))].sort();
 return `<div class="controls">
 <input value="${esc(state.query)}" placeholder="Search authors, works, ideas..." oninput="state.query=this.value;refreshList()">
 <select onchange="state.school=this.value;refreshList()"><option>All</option>${SCHOOLS.map(s=>`<option ${state.school===s?"selected":""}>${s}</option>`).join("")}</select>
 <select onchange="state.region=this.value;refreshList()"><option>All</option>${regions.map(r=>`<option ${state.region===r?"selected":""}>${esc(r)}</option>`).join("")}</select>
 </div>`;
}
function refreshList(){const e=$("#lessonList");if(e){const a=filtered();e.innerHTML=a.length?a.map(card).join(""):`<div class="empty">No matches.</div>`}}
function library(){
 return `<section class="hero compact"><div class="eyebrow">Open library</div><h2>Start anywhere.</h2><p>Search the full curriculum. Chronology is recommended, not required.</p></section>${filters()}<section id="lessonList" class="grid">${filtered().map(card).join("")}</section>`;
}
function schoolPage(s){
 const a=LESSONS.filter(l=>l.school===s);
 return `<section class="hero compact"><div class="eyebrow">${a.length} lessons</div><h2>${s}</h2><p>${desc(s)}</p></section><section class="grid top-gap">${a.map(card).join("")}</section>`;
}
function paths(){
 const g={};LESSONS.forEach(l=>(g[l.path]??=[]).push(l));
 return `<section class="hero compact"><div class="eyebrow">Thematic exploration</div><h2>Follow an idea.</h2><p>Use reading paths when you want a question rather than a period to guide you.</p></section>
 <section class="grid top-gap">${Object.entries(g).map(([p,a])=>`<article class="card clickable" onclick="state.query='${p.replaceAll("'","\\'")}';go('Library')"><div class="eyebrow">Reading path</div><h3>${esc(p)}</h3><p>${a.map(x=>x.author).join(" · ")}</p><span class="badge">${a.length} lessons</span></article>`).join("")}</section>`;
}
function bookmarks(){
 const a=LESSONS.filter(l=>state.bookmarks.includes(l.id));
 return `<section class="hero compact"><div class="eyebrow">Personal library</div><h2>Bookmarks</h2></section><section class="grid top-gap">${a.length?a.map(card).join(""):`<div class="empty">No bookmarks yet.</div>`}</section>`;
}
function readerControls(){
 return `<aside class="reader-tools" aria-label="Reading controls">
  <label>Mode <select onchange="state.readerMode=this.value;persist();render()">
   ${["story","reading","study","scholar"].map(x=>`<option value="${x}" ${state.readerMode===x?"selected":""}>${x[0].toUpperCase()+x.slice(1)}</option>`).join("")}
  </select></label>
  <label>Text <input type="range" min="17" max="32" value="${state.fontSize}" oninput="state.fontSize=+this.value;persist()"></label>
  <label>Spacing <input type="range" min="1.4" max="2.2" step=".1" value="${state.lineHeight}" oninput="state.lineHeight=+this.value;persist()"></label>
  <label>Width <input type="range" min="560" max="1000" step="20" value="${state.readerWidth}" oninput="state.readerWidth=+this.value;persist()"></label>
  <button class="btn" onclick="state.theme=state.theme==='dark'?'light':'dark';persist()">Light / dark</button>
 </aside>`;
}
function connections(l){
 const idx=LESSONS.findIndex(x=>x.id===l.id);
 const earlier=LESSONS.slice(Math.max(0,idx-3),idx);
 const later=LESSONS.slice(idx+1,idx+4);
 return `<section class="connections"><div><h3>Earlier voices</h3>${earlier.map(x=>`<button onclick="openLesson('${x.id}')">${esc(x.author)} — ${esc(x.work)}</button>`).join("")||"<p>Beginning of the path.</p>"}</div>
 <div><h3>Later voices</h3>${later.map(x=>`<button onclick="openLesson('${x.id}')">${esc(x.author)} — ${esc(x.work)}</button>`).join("")||"<p>End of current path.</p>"}</div></section>`;
}
function lessonView(l){
 const mode=state.readerMode;
 const showGuidance=mode==="study"||mode==="scholar"||mode==="story";
 const showScholar=mode==="scholar";
 return `<div class="reader-shell mode-${mode}">
  <div class="backbar"><button class="btn" onclick="go('${l.school}')">← Back</button><button class="btn" onclick="toggleBookmark('${l.id}')">${state.bookmarks.includes(l.id)?"★ Saved":"☆ Bookmark"}</button></div>
  ${readerControls()}
  <article class="reader">
   <div class="meta"><span>${esc(l.school)}</span><span>${esc(l.region)}</span><span>${esc(l.date)}</span><span>${l.estimatedMinutes||5} min</span></div>
   <h1>${esc(l.title)}</h1><p class="byline"><strong>${esc(l.author)}</strong> · <em>${esc(l.work)}</em></p>
   ${mode==="story"?`<section class="story-panel"><div class="story-orb"></div><p>${esc(l.context)}</p></section>`:""}
   ${showScholar?`<div class="notice"><strong>Editorial record:</strong> ${esc(l.status)}<br><small>${esc(l.source)}</small></div>`:""}
   ${showGuidance?`<section><h2>Learning objectives</h2><ul>${(l.objectives||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
   <h2>Historical context</h2><p>${esc(l.context)}</p>
   <h2>Why this matters</h2><p>${esc(l.whyItMatters)}</p>
   <h2>Before you read</h2><ul>${(l.beforeYouRead||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}
   <section class="primary-text"><h2>Primary-source passage</h2><blockquote>${esc(l.excerpt)}</blockquote></section>
   ${showGuidance?`<section><h2>Vocabulary</h2><div class="vocab">${l.vocabulary.map(v=>`<div><strong>${esc(v[0])}</strong><br>${esc(v[1])}</div>`).join("")}</div></section>`:""}
   <section class="quiz"><h2>Text-based check</h2>${l.questions.map((q,qi)=>`<div class="question" id="q${qi}"><p><strong>${esc(q.prompt)}</strong></p>${q.choices.map((c,ci)=>`<button class="option" onclick="answer('${l.id}',${qi},${ci},this)">${esc(c)}</button>`).join("")}<div class="feedback"></div>${showScholar?`<small>Evidence target: ${esc(q.evidenceCitation||l.work)}</small>`:""}</div>`).join("")}</section>
   ${showGuidance?connections(l):""}
   <section><h2>Read the complete work</h2><div class="link-row">${(l.fullTextLinks||[]).map(x=>`<a class="btn" target="_blank" rel="noopener" href="${esc(x.url)}">${esc(x.label)}</a>`).join("")}</div><p class="fine-print">Links open searches for lawful editions. Primoria must record the exact edition before marking a lesson verified.</p></section>
  </article>
 </div>`;
}
function answer(id,qi,ci,b){
 const l=LESSONS.find(x=>x.id===id),q=l.questions[qi],w=$("#q"+qi);
 if(w.dataset.answered)return;w.dataset.answered="1";
 [...w.querySelectorAll(".option")].forEach((x,i)=>{x.disabled=true;if(i===q.answer)x.classList.add("correct")});
 if(ci!==q.answer)b.classList.add("wrong");
 w.querySelector(".feedback").innerHTML=`${ci===q.answer?"Correct.":"Not quite."} ${esc(q.explanation)}<details><summary>Show textual evidence</summary><blockquote>${esc(q.evidenceText||l.excerpt)}</blockquote></details>`;
 if(!state.completed.includes(id)){state.completed.push(id);state.xp+=25;persist();w.querySelector(".feedback").innerHTML+=`<p><strong>Lesson completed · +25 XP</strong></p>`}
}
function render(){
 nav();updateChrome();
 const main=$("#main");
 if(state.lesson){main.innerHTML=lessonView(LESSONS.find(l=>l.id===state.lesson));return}
 main.innerHTML=state.tab==="Home"?home():state.tab==="Journey"?journey():state.tab==="Quick Read"?quickRead():state.tab==="Library"?library():state.tab==="Paths"?paths():state.tab==="Bookmarks"?bookmarks():schoolPage(state.tab);
}
const main=$("#main");render();
