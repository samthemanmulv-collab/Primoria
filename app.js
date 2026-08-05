
const MODULES=[
 window.PRIMORIA_WESTERN_HISTORY||[],window.PRIMORIA_CLASSICS||[],
 window.PRIMORIA_PHILOSOPHY||[],window.PRIMORIA_THEOLOGY||[],
 window.PRIMORIA_LAW||[],window.PRIMORIA_POLITICAL_THOUGHT||[]
];
const LESSONS=MODULES.flat().sort((a,b)=>a.chronology-b.chronology);
const SCHOOLS=["Western History","Classics","Philosophy","Theology","Law","Political Thought"];
const KEY="primoria.premier.v4";
const DEFAULTS={
 tab:"Home",lesson:null,completed:[],bookmarks:[],xp:0,streak:1,lastVisit:null,
 query:"",school:"All",region:"All",era:"All",fontSize:20,lineHeight:1.75,
 readerWidth:780,theme:"dark",readerMode:"study",onboarded:false,
 reduceMotion:false,profile:{name:"",goal:"Explore",dailyMinutes:5,interests:[],startMode:"Chronological"}
};
let state={...DEFAULTS};
try{state={...state,...JSON.parse(localStorage.getItem(KEY)||"{}"),profile:{...DEFAULTS.profile,...(JSON.parse(localStorage.getItem(KEY)||"{}").profile)}}catch{}
const today=new Date().toISOString().slice(0,10),yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(state.lastVisit!==today){state.streak=state.lastVisit===yesterday?(state.streak||0)+1:1;state.lastVisit=today;save()}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function save(){localStorage.setItem(KEY,JSON.stringify(state));chrome()}
function chrome(){
 $("#xp").textContent=state.xp;$("#done").textContent=state.completed.length;
 $("#marks").textContent=state.bookmarks.length;$("#streak").textContent=state.streak;
 document.documentElement.dataset.theme=state.theme;
 document.documentElement.dataset.motion=state.reduceMotion?"reduced":"full";
 document.documentElement.style.setProperty("--reader-size",state.fontSize+"px");
 document.documentElement.style.setProperty("--reader-leading",state.lineHeight);
 document.documentElement.style.setProperty("--reader-width",state.readerWidth+"px")
}
function route(tab,lesson=null){state.tab=tab;state.lesson=lesson;save();location.hash=lesson?`lesson=${lesson}`:tab;scrollTo({top:0,behavior:state.reduceMotion?"auto":"smooth"});render()}
function go(tab){route(tab)}function openLesson(id){route("Lesson",id)}
function toggleBookmark(id){state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();render()}
function nextLesson(){return LESSONS.find(l=>!state.completed.includes(l.id))||LESSONS[0]}
function nav(){const items=["Home","Journey","Quick Read","Map","Library","Paths","Bookmarks","Profile",...SCHOOLS];$("#nav").innerHTML=items.map(x=>`<button class="${state.tab===x?"active":""}" onclick="go('${x}')">${x}</button>`).join("")}
function desc(s){return {"Western History":"Primary evidence from Egypt, Greece, Rome, England, France, Germany, Spain, and Portugal.","Classics":"Epic, tragedy, poetry, and literature from Homer through Rome.","Philosophy":"A chronological path from ancient philosophy through Nietzsche.","Theology":"Foundational biblical and Christian writings in historical sequence.","Law":"Written law, procedure, authority, rights, and codification.","Political Thought":"Citizenship, sovereignty, consent, democracy, civil society, and power."}[s]||""}
function badge(l){return l.review?.textVerified&&l.review?.copyrightCleared?'<span class="badge verified">Verified edition</span>':'<span class="badge review">Text review pending</span>'}
function card(l){return `<article class="card clickable" onclick="openLesson('${l.id}')"><div class="card-top"><div class="eyebrow">${esc(l.era)} · ${esc(l.region)}</div><span class="sequence">${l.sequence}</span></div><h3>${esc(l.title)}</h3><p>${esc(l.author)} · ${esc(l.date)}</p><div class="badges"><span class="badge">${l.estimatedMinutes||5} min</span><span class="badge">Level ${l.difficulty||2}</span>${badge(l)}${state.completed.includes(l.id)?'<span class="badge verified">✓ Done</span>':''}</div></article>`}
function recommendation(){
 const interests=state.profile.interests||[];
 return LESSONS.find(l=>interests.includes(l.school)||interests.some(i=>JSON.stringify(l).includes(i)))||nextLesson()
}
function home(){
 const next=state.profile.startMode==="Interest-led"?recommendation():nextLesson(),daily=LESSONS[(new Date().getDate()+new Date().getMonth())%LESSONS.length];
 const pct=Math.round(state.completed.length/LESSONS.length*100);
 return `<section class="hero"><div class="eyebrow">Primoria · Premier V4</div><h2>Read the originals.<br>Join the conversation.</h2><p>A free, public-domain humanities academy for sustained study and the five minutes when you might otherwise scroll.</p><div class="actions"><button class="btn primary" onclick="openLesson('${next.id}')">Continue your path</button><button class="btn" onclick="go('Quick Read')">I have five minutes</button><button class="btn" onclick="go('Library')">Explore freely</button></div></section>
 <section class="dashboard-grid"><article class="panel feature-panel"><div class="eyebrow">Recommended next</div><h3>${esc(next.title)}</h3><p>${esc(next.author)} · ${next.estimatedMinutes||5} min</p><button class="btn primary" onclick="openLesson('${next.id}')">Begin</button></article>
 <article class="panel"><div class="eyebrow">Daily passage</div><h3>${esc(daily.author)}</h3><blockquote>${esc(daily.excerpt)}</blockquote><button class="text-link" onclick="openLesson('${daily.id}')">Open lesson →</button></article>
 <article class="panel"><div class="eyebrow">Your academy</div><h3>${state.completed.length}/${LESSONS.length} complete</h3><div class="progress"><span style="width:${pct}%"></span></div><p>${state.xp} XP · ${state.streak}-day streak · ${state.bookmarks.length} saved</p></article></section>
 <h2 class="section-title">Enter the curriculum</h2><section class="grid">${SCHOOLS.map(s=>{const a=LESSONS.filter(l=>l.school===s),d=a.filter(l=>state.completed.includes(l.id)).length;return `<article class="card clickable" onclick="go('${s}')"><div class="eyebrow">${a.length} modules</div><h3>${s}</h3><p>${desc(s)}</p><div class="progress"><span style="width:${a.length?d/a.length*100:0}%"></span></div></article>`}).join("")}</section>
 ${!state.onboarded?survey():""}`
}
function survey(){
 const interests=["Western History","Classics","Philosophy","Theology","Law","Political Thought","Justice","Faith","Virtue","Liberty","Power"];
 return `<div class="modal-backdrop"><section class="onboarding"><div class="seal">P</div><div class="eyebrow">Personalize Primoria</div><h1>What brings you here?</h1><p>This survey changes recommendations only. It never locks content.</p>
 <label class="field">Your name or nickname<input id="surveyName" value="${esc(state.profile.name)}" placeholder="Optional"></label>
 <div class="survey-block"><strong>Interests</strong><div class="interest-grid">${interests.map(i=>`<label><input type="checkbox" value="${esc(i)}" ${state.profile.interests.includes(i)?"checked":""}> ${esc(i)}</label>`).join("")}</div></div>
 <div class="survey-row"><label>Daily session<select id="surveyMinutes"><option value="2">2 minutes</option><option value="5" selected>5 minutes</option><option value="10">10 minutes</option><option value="20">20 minutes</option></select></label>
 <label>Starting style<select id="surveyStart"><option>Chronological</option><option>Interest-led</option><option>Explore freely</option></select></label></div>
 <div class="actions"><button class="btn primary" onclick="finishSurvey()">Save profile</button><button class="btn" onclick="skipSurvey()">Skip for now</button></div></section></div>`
}
function finishSurvey(){
 state.profile.name=$("#surveyName").value.trim();
 state.profile.dailyMinutes=+$("#surveyMinutes").value;
 state.profile.startMode=$("#surveyStart").value;
 state.profile.interests=[...document.querySelectorAll(".interest-grid input:checked")].map(x=>x.value);
 state.onboarded=true;save();render()
}
function skipSurvey(){state.onboarded=true;save();render()}
function profile(){
 const p=state.profile,pct=Math.round(state.completed.length/LESSONS.length*100);
 const bySchool=SCHOOLS.map(s=>{const a=LESSONS.filter(l=>l.school===s),d=a.filter(l=>state.completed.includes(l.id)).length;return `<div class="profile-progress"><span>${s}</span><div class="progress"><b style="width:${a.length?d/a.length*100:0}%"></b></div><small>${d}/${a.length}</small></div>`}).join("");
 return `<section class="hero compact"><div class="eyebrow">Local profile</div><h2>${p.name?`Welcome, ${esc(p.name)}.`:"Your Primoria profile"}</h2><p>Your profile and progress remain in this browser. No account or personal information is sent anywhere.</p></section>
 <section class="profile-grid"><article class="panel"><h3>Learning preferences</h3><label class="field">Name<input value="${esc(p.name)}" onchange="state.profile.name=this.value;save()"></label>
 <label class="field">Daily goal<select onchange="state.profile.dailyMinutes=+this.value;save()">${[2,5,10,20,30].map(n=>`<option value="${n}" ${p.dailyMinutes===n?"selected":""}>${n} minutes</option>`).join("")}</select></label>
 <label class="field">Path<select onchange="state.profile.startMode=this.value;save()">${["Chronological","Interest-led","Explore freely"].map(x=>`<option ${p.startMode===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <button class="btn" onclick="state.onboarded=false;save();go('Home')">Retake interest survey</button></article>
 <article class="panel"><h3>Progress</h3><div class="profile-number">${pct}%</div>${bySchool}</article>
 <article class="panel"><h3>Interests</h3><div class="badges">${(p.interests.length?p.interests:["No interests selected"]).map(x=>`<span class="badge">${esc(x)}</span>`).join("")}</div><h3>Achievements</h3><div class="achievement-grid"><span class="${state.completed.length>=1?"earned":""}">First lesson</span><span class="${state.completed.length>=5?"earned":""}">Five lessons</span><span class="${state.streak>=3?"earned":""}">Three-day return</span><span class="${state.bookmarks.length>=3?"earned":""}">Collector</span></div></article></section>`
}
function journey(){const eras=[...new Set(LESSONS.map(l=>l.era))];return `<section class="hero compact"><div class="eyebrow">Recommended path · all lessons open</div><h2>Journey through civilization</h2><p>Chronology is encouraged but never enforced.</p></section>${eras.map(e=>`<section class="era-section"><header><div class="eyebrow">Era</div><h2>${e}</h2></header><div class="timeline">${LESSONS.filter(l=>l.era===e).map(l=>`<div class="timeline-item ${state.completed.includes(l.id)?"done":""} ${l.id===nextLesson().id?"next":""}"><button onclick="openLesson('${l.id}')"><span>${l.sequence}</span><div><strong>${esc(l.title)}</strong><small>${esc(l.author)} · ${esc(l.date)} · ${esc(l.school)}</small></div></button></div>`).join("")}</div></section>`).join("")}`}
function quickRead(){const a=LESSONS.filter(l=>!state.completed.includes(l.id)),l=(a.length?a:LESSONS)[(new Date().getDate()+state.xp)%Math.max(a.length||LESSONS.length,1)];return `<section class="hero compact"><div class="eyebrow">Doomscroll replacement</div><h2>One passage. One idea.</h2><p>Designed around your ${state.profile.dailyMinutes||5}-minute goal.</p></section><article class="quick-card"><div class="eyebrow">${esc(l.school)} · ${esc(l.era)}</div><h2>${esc(l.title)}</h2><p>${esc(l.context)}</p><blockquote>${esc(l.excerpt)}</blockquote><button class="btn primary" onclick="openLesson('${l.id}')">Read and answer</button></article>`}
function mapPage(){const places=[["Egypt",18,48,"kadesh"],["Greece",44,54,"iliad"],["Rome",49,48,"twelve"],["England",43,29,"magna"],["France",39,34,"montaigne"],["Germany",49,31,"kant"],["Spain",31,45,"columbus"],["Portugal",26,43,"lusiads"],["Denmark",48,20,"kierkegaard"],["Russia",72,31,"dostoevsky"]];return `<section class="hero compact"><div class="eyebrow">Civilization map · beta</div><h2>Travel through the sources.</h2></section><section class="map-card"><svg viewBox="0 0 100 65"><path class="land" d="M10 48 L18 35 L31 28 L40 20 L52 17 L64 20 L76 17 L91 25 L88 39 L76 43 L64 41 L56 49 L43 47 L33 55 L20 57 Z"/><path class="sea" d="M25 45 Q45 38 66 46 Q50 57 27 54 Z"/>${places.map(([n,x,y,id])=>`<g class="map-point" onclick="openLesson('${id}')"><circle cx="${x}" cy="${y}" r="1.7"/><text x="${x+2.5}" y="${y+1}">${n}</text></g>`).join("")}</svg></section>`}
function filtered(){const q=state.query.toLowerCase();return LESSONS.filter(l=>(!q||JSON.stringify(l).toLowerCase().includes(q))&&(state.school==="All"||l.school===state.school)&&(state.region==="All"||l.region===state.region)&&(state.era==="All"||l.era===state.era))}
function filters(){const regions=[...new Set(LESSONS.map(l=>l.region))].sort(),eras=[...new Set(LESSONS.map(l=>l.era))];return `<div class="controls"><input value="${esc(state.query)}" placeholder="Search authors, works, ideas..." oninput="state.query=this.value;refreshList()"><select onchange="state.school=this.value;refreshList()"><option>All</option>${SCHOOLS.map(s=>`<option ${state.school===s?"selected":""}>${s}</option>`).join("")}</select><select onchange="state.era=this.value;refreshList()"><option>All</option>${eras.map(e=>`<option ${state.era===e?"selected":""}>${e}</option>`).join("")}</select><select onchange="state.region=this.value;refreshList()"><option>All</option>${regions.map(r=>`<option ${state.region===r?"selected":""}>${esc(r)}</option>`).join("")}</select></div>`}
function refreshList(){const e=$("#lessonList");if(e){const a=filtered();e.innerHTML=a.length?a.map(card).join(""):'<div class="empty">No matches.</div>'}}
function library(){return `<section class="hero compact"><div class="eyebrow">Great Library</div><h2>Start anywhere.</h2><p>Everything remains available.</p></section>${filters()}<section id="lessonList" class="grid">${filtered().map(card).join("")}</section>`}
function schoolPage(s){const a=LESSONS.filter(l=>l.school===s);return `<section class="hero compact"><div class="eyebrow">${a.length} modules</div><h2>${s}</h2><p>${desc(s)}</p></section><section class="grid top-gap">${a.map(card).join("")}</section>`}
function paths(){const g={};LESSONS.forEach(l=>(g[l.path]??=[]).push(l));return `<section class="hero compact"><div class="eyebrow">Thematic journeys</div><h2>Follow an idea.</h2></section><section class="grid top-gap">${Object.entries(g).map(([p,a])=>`<article class="card clickable" onclick="state.query='${p.replaceAll("'","\\'")}';go('Library')"><div class="eyebrow">Reading path</div><h3>${esc(p)}</h3><p>${a.map(x=>x.author).join(" · ")}</p><span class="badge">${a.length} modules</span></article>`).join("")}</section>`}
function bookmarks(){const a=LESSONS.filter(l=>state.bookmarks.includes(l.id));return `<section class="hero compact"><div class="eyebrow">Personal library</div><h2>Bookmarks</h2></section><section class="grid top-gap">${a.length?a.map(card).join(""):'<div class="empty">No bookmarks yet.</div>'}</section>`}
function readerControls(){return `<aside class="reader-tools"><label>Mode <select onchange="state.readerMode=this.value;save();render()">${["story","reading","study","scholar"].map(x=>`<option ${state.readerMode===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Text <input type="range" min="17" max="34" value="${state.fontSize}" oninput="state.fontSize=+this.value;save()"></label><label>Spacing <input type="range" min="1.4" max="2.3" step=".1" value="${state.lineHeight}" oninput="state.lineHeight=+this.value;save()"></label><label>Width <input type="range" min="560" max="1000" step="20" value="${state.readerWidth}" oninput="state.readerWidth=+this.value;save()"></label><button class="btn" onclick="state.theme=state.theme==='dark'?'light':'dark';save()">Light / dark</button></aside>`}
function lessonView(l){const guide=state.readerMode!=="reading",scholar=state.readerMode==="scholar";return `<div class="reader-shell"><div class="backbar"><button class="btn" onclick="go('${l.school}')">← Back</button><button class="btn" onclick="toggleBookmark('${l.id}')">${state.bookmarks.includes(l.id)?"★ Saved":"☆ Bookmark"}</button></div>${readerControls()}<article class="reader"><div class="meta"><span>Module ${l.sequence}</span><span>${esc(l.era)}</span><span>${esc(l.date)}</span></div><h1>${esc(l.title)}</h1><p><strong>${esc(l.author)}</strong> · <em>${esc(l.work)}</em></p>${scholar?`<div class="notice"><strong>Editorial status:</strong> ${esc(l.status)}<br><small>${esc(l.source)}</small></div>`:""}${guide?`<h2>Introduction</h2><p>${esc(l.context)}</p><h2>Why read this?</h2><p>${esc(l.whyItMatters)}</p>`:""}<section class="primary-text"><h2>Primary-source passage</h2><blockquote>${esc(l.excerpt)}</blockquote></section>${guide?`<h2>Vocabulary</h2><div class="vocab">${l.vocabulary.map(v=>`<div><strong>${esc(v[0])}</strong><br>${esc(v[1])}</div>`).join("")}</div>`:""}<section class="quiz"><h2>Text-based check</h2>${l.questions.map((q,i)=>`<div class="question" id="q${i}"><p><strong>${esc(q.prompt)}</strong></p>${q.choices.map((c,j)=>`<button class="option" onclick="answer('${l.id}',${i},${j},this)">${esc(c)}</button>`).join("")}<div class="feedback"></div></div>`).join("")}</section><h2>Read the complete work</h2><div class="link-row">${(l.fullTextLinks||[]).map(x=>`<a class="btn" target="_blank" rel="noopener" href="${esc(x.url)}">${esc(x.label)}</a>`).join("")}</div></article></div>`}
function answer(id,qi,ci,b){const l=LESSONS.find(x=>x.id===id),q=l.questions[qi],w=$("#q"+qi);if(w.dataset.a)return;w.dataset.a=1;[...w.querySelectorAll(".option")].forEach((x,i)=>{x.disabled=true;if(i===q.answer)x.classList.add("correct")});if(ci!==q.answer)b.classList.add("wrong");w.querySelector(".feedback").innerHTML=`${ci===q.answer?"Correct.":"Not quite."} ${esc(q.explanation)}<details><summary>Show evidence</summary><blockquote>${esc(q.evidenceText||l.excerpt)}</blockquote></details>`;if(!state.completed.includes(id)){state.completed.push(id);state.xp+=25;save()}}
function render(){nav();chrome();const main=$("#main");if(state.lesson){const l=LESSONS.find(x=>x.id===state.lesson);main.innerHTML=lessonView(l);return}main.innerHTML=state.tab==="Home"?home():state.tab==="Journey"?journey():state.tab==="Quick Read"?quickRead():state.tab==="Map"?mapPage():state.tab==="Library"?library():state.tab==="Paths"?paths():state.tab==="Bookmarks"?bookmarks():state.tab==="Profile"?profile():schoolPage(state.tab)}
const hash=decodeURIComponent(location.hash.slice(1));if(hash.startsWith("lesson=")){state.lesson=hash.split("=")[1];state.tab="Lesson"}else if(hash)state.tab=hash;render();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));}
