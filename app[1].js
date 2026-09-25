const MODULES=[
 window.PRIMORIA_WESTERN_HISTORY||[],window.PRIMORIA_CLASSICS||[],
 window.PRIMORIA_PHILOSOPHY||[],window.PRIMORIA_THEOLOGY||[],
 window.PRIMORIA_LAW||[],window.PRIMORIA_POLITICAL_THOUGHT||[]
];
const LESSONS=MODULES.flat().sort((a,b)=>a.chronology-b.chronology);
const COURSES=[...(window.PRIMORIA_COURSES||[]),...(window.PRIMORIA_ADDITIONAL_COURSES||[])];
const COURSE_LESSONS=[...(window.PRIMORIA_COURSE_LESSONS||[]),...(window.PRIMORIA_ADDITIONAL_COURSE_LESSONS||[])];
const SOURCES=window.PRIMORIA_SOURCE_REGISTRY||[];
const AUTHORS=window.PRIMORIA_AUTHORS||[];
const SCHOOLS=["Western History","Classics","Philosophy","Theology","Law","Political Thought"];
const KEY="primoria.v7",LEGACY_KEY="primoria.v6";
const DEFAULTS={
 tab:"Home",lesson:null,course:null,courseLesson:null,author:null,
 completed:[],courseCompleted:[],courseAnswers:{},bookmarks:[],xp:0,streak:1,lastVisit:null,
 query:"",librarySchool:"All",librarySort:"Chronological",fontSize:20,lineHeight:1.75,
 readerWidth:780,theme:"dark",readerMode:"guided",onboarded:true,
 profile:{name:"",dailyMinutes:5,interests:[],startMode:"Chronological"},journal:{}
};
let state={...DEFAULTS};
try{
 const fresh=localStorage.getItem(KEY),legacy=localStorage.getItem(LEGACY_KEY);
 const stored=JSON.parse(fresh||legacy||"{}");
 state={...state,...stored,profile:{...DEFAULTS.profile,...(stored.profile||{})},journal:stored.journal||{},courseAnswers:stored.courseAnswers||{}};
 if(state.readerMode==="study")state.readerMode="guided";
 if(state.readerMode==="reading")state.readerMode="reader";
 if(state.readerMode==="scholar")state.readerMode="seminar";
}catch(e){console.warn("Could not restore Primoria data.",e)}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const today=new Date().toISOString().slice(0,10),yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(state.lastVisit!==today){state.streak=state.lastVisit===yesterday?(state.streak||0)+1:1;state.lastVisit=today;persist()}
function persist(){localStorage.setItem(KEY,JSON.stringify(state));chrome()}
function chrome(){
 if($("#xp"))$("#xp").textContent=state.xp;if($("#done"))$("#done").textContent=state.completed.length+state.courseCompleted.length;
 if($("#marks"))$("#marks").textContent=state.bookmarks.length;if($("#streak"))$("#streak").textContent=state.streak;
 document.documentElement.dataset.theme=state.theme;
 document.documentElement.style.setProperty("--reader-size",state.fontSize+"px");
 document.documentElement.style.setProperty("--reader-leading",state.lineHeight);
 document.documentElement.style.setProperty("--reader-width",state.readerWidth+"px")
}
function route(tab,opts={}){
 state.tab=tab;state.lesson=opts.lesson||null;state.course=opts.course||null;state.courseLesson=opts.courseLesson||null;state.author=opts.author||null;
 persist();
 location.hash=opts.courseLesson?`courseLesson=${opts.courseLesson}`:opts.course?`course=${opts.course}`:opts.lesson?`lesson=${opts.lesson}`:opts.author?`author=${opts.author}`:tab;
 scrollTo({top:0,behavior:"smooth"});render()
}
function go(t){route(t)}
function openLesson(id){route("Lesson",{lesson:id})}
function openCourse(id){route("Course",{course:id})}
function openCourseLesson(id){route("Course Lesson",{courseLesson:id})}
function openAuthor(id){route("Author",{author:id})}
function nav(){
 const items=["Home","Library","Authors","Courses","Journey","Quick Read","Sources","Journal","Profile",...SCHOOLS];
 $("#nav").innerHTML=items.map(x=>`<button class="${state.tab===x?"active":""}" onclick="go('${x}')">${x}</button>`).join("")
}
function sourceForCourse(c){return SOURCES.find(s=>s.id===c?.sourceId)}
function authorForName(name){return AUTHORS.find(a=>a.name===name)}
function initials(name){return name.split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function sourceLine(src){
 if(!src)return "Source record pending";
 const tr=src.translator&&src.translator!=="Not identified in the Project Gutenberg header"?` · trans. ${src.translator}`:" · translator not identified in source header";
 return `${src.provider} eBook #${src.ebookNumber}${tr}`
}
function sourceBadge(src){return src?`<span class="badge source-badge">↗ ${esc(src.provider)} #${esc(src.ebookNumber)}</span>`:""}
function authorButton(name){const a=authorForName(name);return a?`<button class="author-link" onclick="event.stopPropagation();openAuthor('${a.id}')">${esc(name)}</button>`:esc(name)}
function legacyCard(l){return `<article class="card clickable" onclick="openLesson('${l.id}')"><div class="eyebrow">${esc(l.school)} · ${esc(l.region)}</div><h3>${esc(l.title)}</h3><p>${esc(l.author)} · ${esc(l.date)}</p><div class="badges"><span class="badge">${l.estimatedMinutes||5} min</span>${state.completed.includes(l.id)?'<span class="badge verified">✓ Done</span>':''}<span class="badge review">Exploratory</span></div></article>`}
function courseProgress(c){
 const ids=c.books.flatMap(b=>b.lessonIds),done=ids.filter(id=>state.courseCompleted.includes(id)).length;
 return {total:ids.length,done,pct:ids.length?Math.round(done/ids.length*100):0}
}
function courseCard(c){
 const p=courseProgress(c),src=sourceForCourse(c);
 return `<article class="course-card clickable" onclick="openCourse('${c.id}')">
  <div class="card-top"><div class="eyebrow">${esc(c.school)} · ${esc(c.civilization)}</div><span class="sequence">${p.pct}%</span></div>
  <h2>${esc(c.title)}</h2><p class="card-author">${authorButton(c.author)}</p><p>${esc(c.subtitle)}</p>
  <div class="progress"><span style="width:${p.pct}%"></span></div>
  <div class="source-inline"><strong>Source & Edition</strong><small>${esc(sourceLine(src))}</small></div>
  <div class="badges"><span class="badge">${p.done}/${p.total} readings</span>${sourceBadge(src)}<span class="badge verified">Verified course</span></div>
 </article>`
}
function sourceRecord(src,compact=false){
 if(!src)return `<section class="source-panel"><h3>Source & Edition</h3><p>Source record pending editorial review.</p></section>`;
 return `<section class="source-panel ${compact?"compact-source":""}"><div class="source-heading"><div><div class="eyebrow">Primary text provenance</div><h3>Source & Edition</h3></div><span class="badge verified">${esc(src.status)}</span></div>
 <dl class="source-grid"><div><dt>Work</dt><dd>${esc(src.author)} — <em>${esc(src.title)}</em></dd></div><div><dt>Translation</dt><dd>${esc(src.translator)}</dd></div><div><dt>Edition</dt><dd>${esc(src.edition)}</dd></div><div><dt>Provider</dt><dd>${esc(src.provider)} eBook #${esc(src.ebookNumber)}</dd></div></dl>
 ${compact?"":`<p class="fine-source">${esc(src.reusePolicy)}</p>`}
 <div class="actions"><a class="btn primary-source" target="_blank" rel="noopener" href="${src.sourceUrl}">View original edition ↗</a>${compact?"":`<a class="btn" target="_blank" rel="noopener" href="${src.providerLicenseUrl}">Provider policy ↗</a>`}</div>
 ${compact?"":`<small>${esc(src.territoryNote)}</small>`}</section>`
}
function home(){
 const c=COURSES.find(x=>courseProgress(x).done<courseProgress(x).total)||COURSES[0],p=courseProgress(c);
 return `<section class="hero"><div class="eyebrow">Primoria · Platform V7</div><h2>A library for reading the originals.</h2><p>V7 puts provenance, authors, and the reading experience at the center. Every verified course now carries its edition with it, and every reading can move between Guided, Reader, and Seminar modes without losing your place.</p><div class="actions"><button class="btn primary" onclick="openCourse('${c.id}')">${p.done?"Continue":"Begin"} ${esc(c.title)}</button><button class="btn" onclick="go('Library')">Enter the Library</button><button class="btn" onclick="go('Authors')">Meet the authors</button></div></section>
 <section class="dashboard-grid"><article class="panel feature-panel"><div class="eyebrow">Current work</div><h3>${esc(c.author)} — ${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="progress"><span style="width:${p.pct}%"></span></div><p class="muted-line">${p.done}/${p.total} readings complete</p><button class="btn primary" onclick="openCourse('${c.id}')">Continue course</button></article>
 <article class="panel"><div class="eyebrow">V7 standard</div><h3>Every passage has a trail back to its edition.</h3><p>Project Gutenberg provenance is visible in the Library, on the work page, and inside the reading interface.</p><button class="btn" onclick="go('Sources')">Browse source records</button></article></section>
 <h2 class="section-title">Verified courses</h2><section class="course-grid">${COURSES.map(courseCard).join("")}</section>`
}
function coursesPage(){return `<section class="hero compact"><div class="eyebrow">Sustained reading</div><h2>Works become courses.</h2><p>Each course is built around a specific edition, substantial primary text, close reading, and private reflection.</p></section><section class="course-grid top-gap">${COURSES.map(courseCard).join("")}</section>`}
function coursePage(c){
 const p=courseProgress(c),src=sourceForCourse(c),a=authorForName(c.author);
 return `<section class="work-hero"><div><div class="eyebrow">${esc(c.school)} · ${esc(c.civilization)}</div><h1>${esc(c.title)}</h1><p class="work-sub">${esc(c.subtitle)}</p><p class="work-author">by ${a?`<button class="author-link large" onclick="openAuthor('${a.id}')">${esc(c.author)}</button>`:esc(c.author)}</p><p>${esc(c.description)}</p><div class="badges"><span class="badge">${p.done}/${p.total} readings</span><span class="badge">${c.estimatedWeeks} week roadmap</span><span class="badge verified">${esc(src?.status||"Source review")}</span></div></div><div class="work-seal">${initials(c.author)}</div></section>
 ${sourceRecord(src)}
 <h2 class="section-title">Books and daily readings</h2>${c.books.map(b=>{
  const items=b.lessonIds.map(id=>COURSE_LESSONS.find(x=>x.id===id)).filter(Boolean);
  return `<section class="book-panel"><header><div><div class="eyebrow">${b.number?`Book ${b.number}`:"Course section"}</div><h2>${esc(b.title)}</h2><p>${esc(b.description)}</p></div><span class="book-count">${items.length?items.length+" days":"Planned"}</span></header>${items.length?`<div class="day-list">${items.map(l=>`<button class="${state.courseCompleted.includes(l.id)?"done":""}" onclick="openCourseLesson('${l.id}')"><span>Day ${l.day}</span><div><strong>${esc(l.title)}</strong><small>${esc(l.sectionLabel)} · ${l.estimatedMinutes} min${state.bookmarks.includes(l.id)?" · ★ Saved":""}</small></div></button>`).join("")}</div>`:'<div class="empty">Editorial planning stage. No passage is published until the edition and questions are verified.</div>'}</section>`
 }).join("")}`
}
function setReaderMode(mode){state.readerMode=mode;persist();render()}
function readerControls(){
 const modes=[
  ["guided","Guided","Context + text + close reading"],
  ["reader","Reader","Primary text with minimal interface"],
  ["seminar","Seminar","Full notes, provenance, and discussion prompts"]
 ];
 return `<aside class="reader-tools v7-tools"><div class="mode-switch" role="group" aria-label="Reading mode">${modes.map(([id,label,desc])=>`<button class="mode-button ${state.readerMode===id?"selected":""}" onclick="setReaderMode('${id}')"><strong>${label}</strong><small>${desc}</small></button>`).join("")}</div><div class="reader-sliders"><label>Text <input type="range" min="17" max="34" value="${state.fontSize}" oninput="state.fontSize=+this.value;persist()"></label><label>Spacing <input type="range" min="1.4" max="2.3" step=".1" value="${state.lineHeight}" oninput="state.lineHeight=+this.value;persist()"></label><label>Width <input type="range" min="560" max="1000" step="20" value="${state.readerWidth}" oninput="state.readerWidth=+this.value;persist()"></label><label>Theme <select onchange="state.theme=this.value;persist()"><option value="dark" ${state.theme==="dark"?"selected":""}>Dark</option><option value="light" ${state.theme==="light"?"selected":""}>Light</option><option value="sepia" ${state.theme==="sepia"?"selected":""}>Sepia</option></select></label></div></aside>`
}
function toggleBookmark(id){
 state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];persist();render()
}
function completeReading(id){if(!state.courseCompleted.includes(id)){state.courseCompleted.push(id);state.xp+=40;persist()}render()}
function courseLessonPage(l){
 if(!l)return `<div class="empty">This reading could not be found.</div>`;
 const c=COURSES.find(x=>x.id===l.courseId),src=SOURCES.find(x=>x.id===l.sourceId),saved=state.bookmarks.includes(l.id),done=state.courseCompleted.includes(l.id);
 const guided=state.readerMode==="guided",seminar=state.readerMode==="seminar",reader=state.readerMode==="reader";
 return `<div class="reader-shell mode-${state.readerMode}"><div class="backbar"><button class="btn" onclick="openCourse('${c.id}')">← ${esc(c.title)}</button><div class="actions tight"><button class="btn ${saved?"saved-btn":""}" onclick="toggleBookmark('${l.id}')">${saved?"★ Saved":"☆ Save"}</button><span class="badge verified">Passage verified</span></div></div>${readerControls()}<article class="reader">
 <div class="meta"><span>Day ${l.day}</span><span>${esc(l.sectionLabel)}</span><span>${l.estimatedMinutes} min</span><span>${state.readerMode[0].toUpperCase()+state.readerMode.slice(1)} mode</span></div>
 <h1>${esc(l.title)}</h1><p class="byline"><strong>${esc(c.author)}</strong> · <em>${esc(c.title)}</em></p>
 <div class="reader-source-strip"><div><strong>${esc(src?.provider||"Source")} ${src?.ebookNumber?`#${esc(src.ebookNumber)}`:""}</strong><small>${esc(src?.translator||"")} · ${esc(src?.edition||"")}</small></div>${src?`<a target="_blank" rel="noopener" href="${src.sourceUrl}">Original edition ↗</a>`:""}</div>
 ${guided||seminar?`<section class="orientation"><h2>Orientation</h2><p>${esc(l.orientation)}</p></section>`:""}
 ${seminar?`<section class="seminar-note"><div class="eyebrow">Seminar lens</div><p>${esc(l.comparison)}</p></section>`:""}
 <section class="primary-text substantial"><div class="reading-heading"><h2>Primary-source reading</h2>${done?'<span class="badge done-on-paper">✓ Complete</span>':''}</div>${l.passage.split("\n\n").map((p,i)=>`<p data-paragraph="${i+1}">${esc(p)}</p>`).join("")}</section>
 ${guided||seminar?`<section><h2>Vocabulary</h2><div class="vocab">${l.vocabulary.map(v=>`<div><strong>${esc(v[0])}</strong><br>${esc(v[1])}</div>`).join("")}</div></section>`:""}
 ${guided||seminar?`<section class="quiz"><h2>Close reading</h2><p class="quiz-intro">Answer from the passage above. Primoria stores the textual evidence with each question.</p>${l.questions.map((q,i)=>`<div class="question" id="cq${i}"><p><strong>${esc(q.prompt)}</strong></p>${q.choices.map((ch,j)=>`<button class="option" onclick="answerCourse('${l.id}',${i},${j},this)">${esc(ch)}</button>`).join("")}<div class="feedback"></div></div>`).join("")}</section>`:""}
 ${guided||seminar?`<section class="compare-panel"><h2>${seminar?"Seminar discussion":"Across time and space"}</h2><p>${esc(l.comparison)}</p></section>`:""}
 ${seminar?sourceRecord(src,true):""}
 ${guided||seminar?`<section class="journal-box"><h2>Private reflection</h2><p>${esc(l.reflection)}</p><textarea id="journalText" placeholder="Write privately on this device...">${esc(state.journal[l.id]||"")}</textarea><button class="btn primary" onclick="saveJournal('${l.id}')">Save reflection</button><small>Stored only in this browser. It is not uploaded.</small></section>`:""}
 <section class="reading-complete"><p>${done?"This reading is marked complete.":reader?"Reader mode does not require the close-reading questions.":"Finish the close reading or mark the passage complete when you are ready."}</p><button class="btn ${done?"":"primary"}" onclick="completeReading('${l.id}')">${done?"✓ Reading complete":"Mark reading complete"}</button></section>
 </article></div>`
}
function answerCourse(id,qi,choice,b){
 const l=COURSE_LESSONS.find(x=>x.id===id),q=l.questions[qi],w=$("#cq"+qi);if(w.dataset.a)return;w.dataset.a=1;
 [...w.querySelectorAll(".option")].forEach((x,i)=>{x.disabled=true;if(i===q.answer)x.classList.add("correct")});if(choice!==q.answer)b.classList.add("wrong");
 w.querySelector(".feedback").innerHTML=`${choice===q.answer?"Correct.":"Not quite."}<details open><summary>Textual evidence</summary><blockquote>${esc(q.evidence)}</blockquote></details>`;
 state.courseAnswers[id]={...(state.courseAnswers[id]||{}),[qi]:choice};
 if(Object.keys(state.courseAnswers[id]).length>=l.questions.length&&!state.courseCompleted.includes(id)){state.courseCompleted.push(id);state.xp+=40}
 persist()
}
function saveJournal(id){state.journal[id]=$("#journalText").value;persist();alert("Reflection saved on this device.")}
function authorCard(a){
 const live=a.works.filter(w=>w.courseId).length;
 return `<article class="author-card clickable" onclick="openAuthor('${a.id}')"><div class="author-medallion">${initials(a.name)}</div><div><div class="eyebrow">${esc(a.period)}</div><h2>${esc(a.name)}</h2><p class="author-dates">${esc(a.dates)}</p><p>${esc(a.tagline)}</p><div class="badges"><span class="badge">${live} verified course${live===1?"":"s"}</span>${a.themes.slice(0,3).map(t=>`<span class="badge">${esc(t)}</span>`).join("")}</div></div></article>`
}
function authorsPage(){return `<section class="hero compact"><div class="eyebrow">People behind the texts</div><h2>Authors are part of the curriculum.</h2><p>Each profile places a work in a life, a period, and a continuing intellectual conversation.</p></section><section class="author-grid top-gap">${AUTHORS.map(authorCard).join("")}</section>`}
function authorLinkChip(id){const a=AUTHORS.find(x=>x.id===id);return a?`<button class="connection-chip" onclick="openAuthor('${a.id}')">${esc(a.name)}</button>`:""}
function authorPage(a){
 if(!a)return `<div class="empty">Author profile not found.</div>`;
 return `<section class="author-hero"><div class="author-medallion hero-medallion">${initials(a.name)}</div><div><div class="eyebrow">${esc(a.period)} · ${esc(a.civilization)}</div><h1>${esc(a.name)}</h1><p class="author-dates">${esc(a.dates)}</p><p class="lead">${esc(a.tagline)}</p><div class="badges">${a.themes.map(t=>`<span class="badge">${esc(t)}</span>`).join("")}</div></div></section>
 <section class="author-layout"><article class="panel author-bio"><div class="eyebrow">Biography</div><h2>Life and context</h2>${a.biography.map(p=>`<p>${esc(p)}</p>`).join("")}<blockquote>${esc(a.note)}</blockquote></article>
 <aside class="panel"><div class="eyebrow">Timeline</div><h2>At a glance</h2><div class="mini-timeline">${a.timeline.map(([date,text])=>`<div><strong>${esc(date)}</strong><span>${esc(text)}</span></div>`).join("")}</div></aside></section>
 <h2 class="section-title">Works in Primoria</h2><section class="works-grid">${a.works.map(w=>w.courseId?`<article class="work-tile available clickable" onclick="openCourse('${w.courseId}')"><div class="eyebrow">Available now</div><h3>${esc(w.title)}</h3><span>Begin reading →</span></article>`:`<article class="work-tile"><div class="eyebrow">Planned</div><h3>${esc(w.title)}</h3><span>Editorial roadmap</span></article>`).join("")}</section>
 <section class="conversation-panel"><div class="eyebrow">Intellectual conversation</div><h2>Read across centuries</h2><p>These links are starting points for comparison, response, inheritance, and disagreement—not claims that every later author simply follows the earlier one.</p><div class="connection-row">${a.conversation.map(authorLinkChip).join("")}</div></section>`
}
function updateLibrarySearch(v){state.query=v;persist();render()}
function updateLibrarySchool(v){state.librarySchool=v;persist();render()}
function updateLibrarySort(v){state.librarySort=v;persist();render()}
function filteredCourses(){
 const q=(state.query||"").trim().toLowerCase();
 let items=COURSES.filter(c=>state.librarySchool==="All"||c.school===state.librarySchool).filter(c=>!q||[c.title,c.author,c.subtitle,c.school,c.civilization,...(c.themes||[])].join(" ").toLowerCase().includes(q));
 if(state.librarySort==="Author")items.sort((a,b)=>a.author.localeCompare(b.author));
 if(state.librarySort==="Title")items.sort((a,b)=>a.title.localeCompare(b.title));
 return items
}
function library(){
 const items=filteredCourses();
 return `<section class="library-hero"><div><div class="eyebrow">The Great Library</div><h1>Read by work, author, period, or question.</h1><p>Verified courses are kept separate from exploratory modules so you always know which material has completed the current source-and-evidence review.</p></div><div class="library-number"><strong>${COURSES.length}</strong><span>verified works</span></div></section>
 <section class="library-controls"><label class="search-field"><span>Search</span><input value="${esc(state.query)}" oninput="updateLibrarySearch(this.value)" placeholder="Author, work, idea, civilization…"></label><label><span>School</span><select onchange="updateLibrarySchool(this.value)"><option ${state.librarySchool==="All"?"selected":""}>All</option>${SCHOOLS.map(s=>`<option ${state.librarySchool===s?"selected":""}>${s}</option>`).join("")}</select></label><label><span>Sort</span><select onchange="updateLibrarySort(this.value)">${["Chronological","Author","Title"].map(s=>`<option ${state.librarySort===s?"selected":""}>${s}</option>`).join("")}</select></label></section>
 <div class="shelf-heading"><div><div class="eyebrow">Verified shelf</div><h2>${items.length} work${items.length===1?"":"s"}</h2></div><button class="text-link" onclick="go('Sources')">View all source records →</button></div>
 <section class="course-grid">${items.length?items.map(courseCard).join(""):'<div class="empty">No verified courses match those filters.</div>'}</section>
 <details class="archive"><summary>Exploratory archive · ${LESSONS.length} older modules</summary><p>These remain useful for broad navigation, but exact edition verification may still be pending. They are intentionally separated from the verified shelf.</p><section class="grid">${LESSONS.map(legacyCard).join("")}</section></details>`
}
function sourcesPage(){return `<section class="hero compact"><div class="eyebrow">Sources & Editions</div><h2>Every verified text should be traceable.</h2><p>These are the edition records currently used by the sustained Primoria courses. The original-edition button opens the canonical Project Gutenberg eBook landing page.</p></section><section class="source-list top-gap">${SOURCES.map(src=>sourceRecord(src)).join("")}</section>`}
function journey(){
 const active=COURSES.find(c=>courseProgress(c).done<courseProgress(c).total)||COURSES[0];
 const completeCourses=COURSES.filter(c=>courseProgress(c).pct===100).length;
 return `<section class="journey-hero"><div><div class="eyebrow">Your Journey</div><h1>See the larger conversation.</h1><p>Progress is measured by sustained readings, not by racing through a catalog.</p></div><div class="journey-stats"><div><strong>${state.courseCompleted.length}</strong><span>readings</span></div><div><strong>${completeCourses}</strong><span>works</span></div><div><strong>${state.streak}</strong><span>day streak</span></div></div></section>
 <section class="dashboard-grid"><article class="panel"><div class="eyebrow">Continue</div><h3>${esc(active.author)} — ${esc(active.title)}</h3><div class="progress"><span style="width:${courseProgress(active).pct}%"></span></div><p>${courseProgress(active).done}/${courseProgress(active).total} readings complete</p><button class="btn primary" onclick="openCourse('${active.id}')">Continue reading</button></article><article class="panel"><div class="eyebrow">Why this next?</div><h3>Build familiarity before breadth.</h3><p>Finish a sustained work, then move to another author who asks a related question in a different historical setting.</p><button class="btn" onclick="go('Authors')">Explore authors</button></article></section>
 <h2 class="section-title">Course progress</h2><section class="journey-course-list">${COURSES.map(c=>{const p=courseProgress(c);return `<button onclick="openCourse('${c.id}')"><div><strong>${esc(c.title)}</strong><small>${esc(c.author)} · ${esc(c.civilization)}</small></div><div class="journey-progress"><span>${p.pct}%</span><div class="progress"><span style="width:${p.pct}%"></span></div></div></button>`}).join("")}</section>`
}
function quickRead(){
 const all=COURSE_LESSONS, l=all.find(x=>!state.courseCompleted.includes(x.id))||all[0];
 return `<section class="hero compact"><div class="eyebrow">Five-minute alternative</div><h2>Open one real text instead.</h2><p>The goal is not to finish a book in five minutes. It is to make returning to primary sources easy enough to become habitual.</p></section><article class="quick-card"><div class="eyebrow">${esc(l.sectionLabel)}</div><h2>${esc(l.title)}</h2><p>${esc(l.orientation)}</p><blockquote>${esc(l.passage.slice(0,700))}…</blockquote><button class="btn primary" onclick="openCourseLesson('${l.id}')">Continue reading</button></article>`
}
function journalPage(){
 const entries=Object.entries(state.journal).filter(([,v])=>v.trim());
 return `<section class="hero compact"><div class="eyebrow">Private notebook</div><h2>Your reflections</h2><p>These entries remain in this browser and are not sent to a server.</p></section><section class="journal-list top-gap">${entries.length?entries.map(([id,text])=>{const l=COURSE_LESSONS.find(x=>x.id===id);return `<article class="panel"><div class="eyebrow">${esc(l?.sectionLabel||id)}</div><h3>${esc(l?.title||id)}</h3><p>${esc(text)}</p><button class="text-link" onclick="openCourseLesson('${id}')">Return to reading →</button></article>`}).join(""):'<div class="empty">No saved reflections yet.</div>'}</section>`
}
function legacyLesson(l){return `<div class="reader-shell"><div class="backbar"><button class="btn" onclick="go('${l.school}')">← Back</button></div>${readerControls()}<article class="reader"><h1>${esc(l.title)}</h1><p>${esc(l.context)}</p><section class="primary-text"><blockquote>${esc(l.excerpt)}</blockquote></section><p class="fine-print">Exploratory module; exact edition verification may still be pending.</p></article></div>`}
function profile(){
 const pct=COURSE_LESSONS.length?Math.round(state.courseCompleted.length/COURSE_LESSONS.length*100):0;
 return `<section class="hero compact"><div class="eyebrow">Your academy</div><h2>${state.courseCompleted.length} verified readings completed</h2><p>${state.xp} XP · ${state.streak}-day return streak · ${Object.keys(state.journal).length} journal entries · ${state.bookmarks.length} saved readings</p></section><section class="profile-grid"><article class="panel"><div class="eyebrow">Verified curriculum</div><div class="profile-number">${pct}%</div><p>${state.courseCompleted.length} of ${COURSE_LESSONS.length} current model-course readings completed.</p></article><article class="panel"><div class="eyebrow">Reading setup</div><h3>${state.readerMode[0].toUpperCase()+state.readerMode.slice(1)} mode</h3><p>${state.fontSize}px text · ${state.lineHeight} line spacing · ${state.theme} theme</p><button class="btn" onclick="openCourseLesson('${COURSE_LESSONS[0]?.id||""}')">Open reader settings</button></article></section>`
}
function render(){
 nav();chrome();const main=$("#main");
 if(state.courseLesson){main.innerHTML=courseLessonPage(COURSE_LESSONS.find(x=>x.id===state.courseLesson));return}
 if(state.course){main.innerHTML=coursePage(COURSES.find(x=>x.id===state.course));return}
 if(state.lesson){main.innerHTML=legacyLesson(LESSONS.find(x=>x.id===state.lesson));return}
 if(state.author){main.innerHTML=authorPage(AUTHORS.find(x=>x.id===state.author));return}
 main.innerHTML=state.tab==="Home"?home():state.tab==="Library"?library():state.tab==="Authors"?authorsPage():state.tab==="Courses"?coursesPage():state.tab==="Journey"?journey():state.tab==="Quick Read"?quickRead():state.tab==="Sources"?sourcesPage():state.tab==="Journal"?journalPage():state.tab==="Profile"?profile():`<section class="hero compact"><h2>${esc(state.tab)}</h2></section><section class="grid top-gap">${LESSONS.filter(l=>l.school===state.tab).map(legacyCard).join("")}</section>`
}
const hash=decodeURIComponent(location.hash.slice(1));
if(hash.startsWith("courseLesson=")){state.courseLesson=hash.split("=")[1]}
else if(hash.startsWith("course=")){state.course=hash.split("=")[1]}
else if(hash.startsWith("lesson=")){state.lesson=hash.split("=")[1]}
else if(hash.startsWith("author=")){state.author=hash.split("=")[1]}
else if(hash){state.tab=hash}
render();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}))}
