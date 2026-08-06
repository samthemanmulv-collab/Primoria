
const MODULES=[
 window.PRIMORIA_WESTERN_HISTORY||[],window.PRIMORIA_CLASSICS||[],
 window.PRIMORIA_PHILOSOPHY||[],window.PRIMORIA_THEOLOGY||[],
 window.PRIMORIA_LAW||[],window.PRIMORIA_POLITICAL_THOUGHT||[]
];
const LESSONS=MODULES.flat().sort((a,b)=>a.chronology-b.chronology);
const COURSES=[...(window.PRIMORIA_COURSES||[]),...(window.PRIMORIA_ADDITIONAL_COURSES||[])];
const COURSE_LESSONS=[...(window.PRIMORIA_COURSE_LESSONS||[]),...(window.PRIMORIA_ADDITIONAL_COURSE_LESSONS||[])];
const SOURCES=window.PRIMORIA_SOURCE_REGISTRY||[];
const SCHOOLS=["Western History","Classics","Philosophy","Theology","Law","Political Thought"];
const KEY="primoria.v6";
const DEFAULTS={
 tab:"Home",lesson:null,course:null,courseLesson:null,completed:[],courseCompleted:[],
 bookmarks:[],xp:0,streak:1,lastVisit:null,query:"",fontSize:20,lineHeight:1.75,
 readerWidth:780,theme:"dark",readerMode:"study",onboarded:true,
 profile:{name:"",dailyMinutes:5,interests:[],startMode:"Chronological"},journal:{}
};
let state={...DEFAULTS};
try{
 const stored=JSON.parse(localStorage.getItem(KEY)||"{}");
 state={...state,...stored,profile:{...DEFAULTS.profile,...(stored.profile||{})},journal:stored.journal||{}};
}catch(e){console.warn("Could not restore Primoria data.",e)}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const today=new Date().toISOString().slice(0,10),yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(state.lastVisit!==today){state.streak=state.lastVisit===yesterday?(state.streak||0)+1:1;state.lastVisit=today;persist()}
function persist(){localStorage.setItem(KEY,JSON.stringify(state));chrome()}
function chrome(){
 $("#xp").textContent=state.xp;$("#done").textContent=state.completed.length+state.courseCompleted.length;
 $("#marks").textContent=state.bookmarks.length;$("#streak").textContent=state.streak;
 document.documentElement.dataset.theme=state.theme;
 document.documentElement.style.setProperty("--reader-size",state.fontSize+"px");
 document.documentElement.style.setProperty("--reader-leading",state.lineHeight);
 document.documentElement.style.setProperty("--reader-width",state.readerWidth+"px")
}
function route(tab,opts={}){
 state.tab=tab;state.lesson=opts.lesson||null;state.course=opts.course||null;state.courseLesson=opts.courseLesson||null;
 persist();location.hash=opts.courseLesson?`courseLesson=${opts.courseLesson}`:opts.course?`course=${opts.course}`:opts.lesson?`lesson=${opts.lesson}`:tab;
 scrollTo({top:0,behavior:"smooth"});render()
}
function go(t){route(t)}function openLesson(id){route("Lesson",{lesson:id})}
function openCourse(id){route("Course",{course:id})}function openCourseLesson(id){route("Course Lesson",{courseLesson:id})}
function nav(){
 const items=["Home","Courses","Journey","Quick Read","Library","Journal","Profile",...SCHOOLS];
 $("#nav").innerHTML=items.map(x=>`<button class="${state.tab===x?"active":""}" onclick="go('${x}')">${x}</button>`).join("")
}
function legacyCard(l){return `<article class="card clickable" onclick="openLesson('${l.id}')"><div class="eyebrow">${esc(l.school)} · ${esc(l.region)}</div><h3>${esc(l.title)}</h3><p>${esc(l.author)} · ${esc(l.date)}</p><div class="badges"><span class="badge">${l.estimatedMinutes||5} min</span>${state.completed.includes(l.id)?'<span class="badge verified">✓ Done</span>':''}</div></article>`}
function courseProgress(c){
 const ids=c.books.flatMap(b=>b.lessonIds),done=ids.filter(id=>state.courseCompleted.includes(id)).length;
 return {total:ids.length,done,pct:ids.length?Math.round(done/ids.length*100):0}
}
function courseCard(c){
 const p=courseProgress(c);
 return `<article class="course-card clickable" onclick="openCourse('${c.id}')"><div class="eyebrow">${esc(c.school)} · ${esc(c.civilization)}</div><h2>${esc(c.title)}</h2><p>${esc(c.author)} · ${esc(c.subtitle)}</p><div class="progress"><span style="width:${p.pct}%"></span></div><div class="badges"><span class="badge">${p.done}/${p.total} pilot lessons</span><span class="badge">${c.estimatedWeeks} week roadmap</span><span class="badge verified">Cleared source pilot</span></div></article>`
}
function home(){
 const c=COURSES[0],p=courseProgress(c);
 return `<section class="hero"><div class="eyebrow">Primoria · Work Courses V5</div><h2>Read deeply enough to connect across time and place.</h2><p>Courses now organize substantial passages by work, book, and daily reading. Finishing every page is not the only goal: understanding recurring questions, narrative choices, and institutional problems is.</p><div class="actions"><button class="btn primary" onclick="openCourse('${c.id}')">Begin the Caesar pilot</button><button class="btn" onclick="go('Courses')">View work courses</button><button class="btn" onclick="go('Quick Read')">Read for five minutes</button></div></section>
 <section class="dashboard-grid"><article class="panel feature-panel"><div class="eyebrow">Featured work course</div><h3>${esc(c.author)} — ${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="progress"><span style="width:${p.pct}%"></span></div><button class="btn primary" onclick="openCourse('${c.id}')">Continue course</button></article>
 <article class="panel"><div class="eyebrow">Editorial standard</div><h3>Source before scale</h3><p>The Caesar pilot identifies one edition, bundles only cleared public-domain passages, records provenance, and validates graded answers against the displayed text.</p></article></section>
 <h2 class="section-title">Verified model courses</h2><section class="course-grid">${COURSES.map(courseCard).join("")}</section>`
}
function coursesPage(){return `<section class="hero compact"><div class="eyebrow">Sustained reading</div><h2>Works become courses.</h2><p>Each course is divided into books or major sections, then into substantial daily readings with context, close reading, comparison, and private reflection.</p></section><section class="course-grid top-gap">${COURSES.map(courseCard).join("")}</section>`}
function coursePage(c){
 const p=courseProgress(c),src=SOURCES.find(s=>s.id===c.sourceId);
 return `<section class="work-hero"><div><div class="eyebrow">${esc(c.school)} · ${esc(c.civilization)}</div><h1>${esc(c.title)}</h1><p class="work-sub">${esc(c.subtitle)}</p><p>${esc(c.description)}</p><div class="badges"><span class="badge">${p.done}/${p.total} pilot readings</span><span class="badge">${c.estimatedWeeks} week roadmap</span><span class="badge verified">${esc(src.status)}</span></div></div><div class="work-seal">SPQR</div></section>
 <section class="source-panel"><h3>Edition and reuse record</h3><p><strong>Translation:</strong> ${esc(src.translator)} · ${esc(src.edition)}</p><p>${esc(src.reusePolicy)}</p><div class="actions"><a class="btn" target="_blank" rel="noopener" href="${src.sourceUrl}">View source record</a><a class="btn" target="_blank" rel="noopener" href="${src.providerLicenseUrl}">Provider license</a></div><small>${esc(src.territoryNote)}</small></section>
 <h2 class="section-title">Books and daily readings</h2>${c.books.map(b=>{
  const items=b.lessonIds.map(id=>COURSE_LESSONS.find(x=>x.id===id)).filter(Boolean);
  return `<section class="book-panel"><header><div><div class="eyebrow">Book ${b.number}</div><h2>${esc(b.title)}</h2><p>${esc(b.description)}</p></div><span class="book-count">${items.length?items.length+" days":"Planned"}</span></header>${items.length?`<div class="day-list">${items.map(l=>`<button class="${state.courseCompleted.includes(l.id)?"done":""}" onclick="openCourseLesson('${l.id}')"><span>Day ${l.day}</span><div><strong>${esc(l.title)}</strong><small>${esc(l.sectionLabel)} · ${l.estimatedMinutes} min</small></div></button>`).join("")}</div>`:'<div class="empty">Editorial planning stage. No passage is published until the edition and questions are verified.</div>'}</section>`
 }).join("")}`
}
function readerControls(){return `<aside class="reader-tools"><label>Mode <select onchange="state.readerMode=this.value;persist();render()">${["reading","study","scholar"].map(x=>`<option ${state.readerMode===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Text <input type="range" min="17" max="34" value="${state.fontSize}" oninput="state.fontSize=+this.value;persist()"></label><label>Spacing <input type="range" min="1.4" max="2.3" step=".1" value="${state.lineHeight}" oninput="state.lineHeight=+this.value;persist()"></label><label>Width <input type="range" min="560" max="1000" step="20" value="${state.readerWidth}" oninput="state.readerWidth=+this.value;persist()"></label><button class="btn" onclick="state.theme=state.theme==='dark'?'light':'dark';persist()">Light / dark</button></aside>`}
function courseLessonPage(l){
 const c=COURSES.find(x=>x.id===l.courseId),src=SOURCES.find(x=>x.id===l.sourceId);
 const guide=state.readerMode!=="reading",scholar=state.readerMode==="scholar";
 return `<div class="reader-shell"><div class="backbar"><button class="btn" onclick="openCourse('${c.id}')">← ${esc(c.title)}</button><span class="badge verified">Passage verified</span></div>${readerControls()}<article class="reader"><div class="meta"><span>Day ${l.day}</span><span>${esc(l.sectionLabel)}</span><span>${l.estimatedMinutes} min</span></div><h1>${esc(l.title)}</h1><p><strong>${esc(c.author)}</strong> · <em>${esc(c.title)}</em></p>
 ${scholar?`<div class="notice"><strong>Source:</strong> ${esc(src.translator)}, ${esc(src.edition)} · Project Gutenberg eBook #${src.ebookNumber}<br><small>${esc(src.reusePolicy)}</small></div>`:""}
 ${guide?`<h2>Orientation</h2><p>${esc(l.orientation)}</p>`:""}
 <section class="primary-text substantial"><h2>Primary-source reading</h2>${l.passage.split("\n\n").map(p=>`<p>${esc(p)}</p>`).join("")}</section>
 ${guide?`<h2>Vocabulary</h2><div class="vocab">${l.vocabulary.map(v=>`<div><strong>${esc(v[0])}</strong><br>${esc(v[1])}</div>`).join("")}</div>`:""}
 <section class="quiz"><h2>Close reading</h2>${l.questions.map((q,i)=>`<div class="question" id="cq${i}"><p><strong>${esc(q.prompt)}</strong></p>${q.choices.map((ch,j)=>`<button class="option" onclick="answerCourse('${l.id}',${i},${j},this)">${esc(ch)}</button>`).join("")}<div class="feedback"></div></div>`).join("")}</section>
 <section class="compare-panel"><h2>Across time and space</h2><p>${esc(l.comparison)}</p></section>
 <section class="journal-box"><h2>Private reflection</h2><p>${esc(l.reflection)}</p><textarea id="journalText" placeholder="Write privately on this device...">${esc(state.journal[l.id]||"")}</textarea><button class="btn primary" onclick="saveJournal('${l.id}')">Save reflection</button><small>Stored only in this browser. It is not uploaded.</small></section>
 </article></div>`
}
function answerCourse(id,qi,choice,b){
 const l=COURSE_LESSONS.find(x=>x.id===id),q=l.questions[qi],w=$("#cq"+qi);if(w.dataset.a)return;w.dataset.a=1;
 [...w.querySelectorAll(".option")].forEach((x,i)=>{x.disabled=true;if(i===q.answer)x.classList.add("correct")});if(choice!==q.answer)b.classList.add("wrong");
 w.querySelector(".feedback").innerHTML=`${choice===q.answer?"Correct.":"Not quite."}<details open><summary>Textual evidence</summary><blockquote>${esc(q.evidence)}</blockquote></details>`;
 if(!state.courseCompleted.includes(id)){state.courseCompleted.push(id);state.xp+=40;persist()}
}
function saveJournal(id){state.journal[id]=$("#journalText").value;persist();alert("Reflection saved on this device.")}
function journalPage(){
 const entries=Object.entries(state.journal).filter(([,v])=>v.trim());
 return `<section class="hero compact"><div class="eyebrow">Private notebook</div><h2>Your reflections</h2><p>These entries remain in this browser and are not sent to a server.</p></section><section class="journal-list top-gap">${entries.length?entries.map(([id,text])=>{const l=COURSE_LESSONS.find(x=>x.id===id);return `<article class="panel"><div class="eyebrow">${esc(l?.sectionLabel||id)}</div><h3>${esc(l?.title||id)}</h3><p>${esc(text)}</p><button class="text-link" onclick="openCourseLesson('${id}')">Return to reading →</button></article>`}).join(""):'<div class="empty">No saved reflections yet.</div>'}</section>`
}
function journey(){return `<section class="hero compact"><div class="eyebrow">Chronological orientation</div><h2>Explore the existing modules.</h2><p>Work courses provide depth; these modules preserve broad chronological navigation.</p></section><section class="grid top-gap">${LESSONS.map(legacyCard).join("")}</section>`}
function quickRead(){
 const c=COURSES[0],ids=c.books[0].lessonIds,l=COURSE_LESSONS.find(x=>x.id===ids.find(id=>!state.courseCompleted.includes(id)))||COURSE_LESSONS[0];
 return `<section class="hero compact"><div class="eyebrow">Five-minute alternative</div><h2>One substantial reading.</h2></section><article class="quick-card"><div class="eyebrow">${esc(l.sectionLabel)}</div><h2>${esc(l.title)}</h2><p>${esc(l.orientation)}</p><blockquote>${esc(l.passage.slice(0,700))}…</blockquote><button class="btn primary" onclick="openCourseLesson('${l.id}')">Continue reading</button></article>`
}
function library(){return `<section class="hero compact"><div class="eyebrow">Great Library</div><h2>Courses and exploratory modules</h2></section><h2 class="section-title">Work courses</h2><section class="course-grid">${COURSES.map(courseCard).join("")}</section><h2 class="section-title">Exploratory modules</h2><section class="grid">${LESSONS.map(legacyCard).join("")}</section>`}
function legacyLesson(l){return `<div class="reader-shell"><div class="backbar"><button class="btn" onclick="go('${l.school}')">← Back</button></div>${readerControls()}<article class="reader"><h1>${esc(l.title)}</h1><p>${esc(l.context)}</p><section class="primary-text"><blockquote>${esc(l.excerpt)}</blockquote></section><p class="fine-print">Exploratory module; exact edition verification may still be pending.</p></article></div>`}
function profile(){return `<section class="hero compact"><div class="eyebrow">Your academy</div><h2>${state.courseCompleted.length} course readings completed</h2><p>${state.xp} XP · ${state.streak}-day return streak · ${Object.keys(state.journal).length} journal entries</p></section>`}
function render(){
 nav();chrome();const main=$("#main");
 if(state.courseLesson){main.innerHTML=courseLessonPage(COURSE_LESSONS.find(x=>x.id===state.courseLesson));return}
 if(state.course){main.innerHTML=coursePage(COURSES.find(x=>x.id===state.course));return}
 if(state.lesson){main.innerHTML=legacyLesson(LESSONS.find(x=>x.id===state.lesson));return}
 main.innerHTML=state.tab==="Home"?home():state.tab==="Courses"?coursesPage():state.tab==="Journey"?journey():state.tab==="Quick Read"?quickRead():state.tab==="Library"?library():state.tab==="Journal"?journalPage():state.tab==="Profile"?profile():`<section class="hero compact"><h2>${esc(state.tab)}</h2></section><section class="grid top-gap">${LESSONS.filter(l=>l.school===state.tab).map(legacyCard).join("")}</section>`
}
const hash=decodeURIComponent(location.hash.slice(1));if(hash.startsWith("courseLesson=")){state.courseLesson=hash.split("=")[1]}else if(hash.startsWith("course=")){state.course=hash.split("=")[1]}else if(hash.startsWith("lesson=")){state.lesson=hash.split("=")[1]}else if(hash){state.tab=hash}
render();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}))}
