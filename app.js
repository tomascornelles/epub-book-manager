const KEY="epub-book-manager-v2";
const SUGGEST_KEY="epub-book-manager-suggestions";
const DB_NAME="epub-book-manager-files";
const ARCHIVED_OPEN_KEY="epub-archived-open";
const WIP="✏️ WIP",ARCHIVED="📁 Archived";
const STATUSES=[WIP,"📗 Ready","⏳ Waiting","🚀 Published",ARCHIVED];
const LEGACY_STATUS={"Ready for KDP":"📗 Ready","Waiting KDP":"⏳ Waiting","Ready for ePub":"📗 Ready","Waiting ePub":"⏳ Waiting","Idea":WIP,"Research":WIP,"Outline":WIP,"Writing":WIP,"Editing":WIP,"Formatting":WIP,"Paused":ARCHIVED,"Blocked":ARCHIVED};
function normalizeStatus(s){
  if(STATUSES.includes(s))return s;
  const str=String(s||""),label=str.includes(" ")?str.slice(str.indexOf(" ")+1):str;
  return LEGACY_STATUS[label]||STATUSES[0];
}
const TYPES=["30-Day Challenge","Practical Guide","Novel"];
const LANGUAGES=["en-US","es-ES"];
const AUTHORS=["Tomas Cornelles","Thomas A. Carter","Theodore A. Collins","Trevor A. Clark","Tyler A. Cooper","Timothy A. Campbell","Theresa A. Carter","Taylor A. Collins","Tiffany A. Clark","Tessa A. Cooper","Tabitha A. Campbell"];
const NICHES=[["productivity","Productivity & Time Management"],["personal-finance","Personal Finance & Money Management"],["self-improvement","Self-Improvement & Personal Development"],["health-and-wellness","Health & Wellness"],["fitness","Fitness & Exercise"],["mindfulness","Mindfulness & Stress Management"],["relationships","Relationships & Communication"],["parenting","Parenting & Family"],["career-and-business","Career & Business"],["hobbies-and-lifestyle","Hobbies & Lifestyle"],["scify","Scify"],["historical-fiction","Historical Fiction"]];
const PUB_FIELDS=[["description","Publisher description",9],["backText","Back cover text",6],["tags","Keywords",4],["categories","Categories",4],["frontMatter","Front matter",8],["backMatter","Back matter",8]];
const PUB_HEADERS=Object.fromEntries(PUB_FIELDS.map(([k,label])=>[label.toUpperCase(),k]));
PUB_HEADERS["AMAZON DESCRIPTION"]="description"; // compatibilidad con book.txt exportados antes
PUB_HEADERS["TAGS"]="tags"; // compatibilidad con book.txt exportados antes

const PROMPTS={
research:`You are a publishing research assistant.\n\nBOOK IDEA:\n{{title}}\nNICHE:\n{{niche}}\nBOOK TYPE:\n{{type}}\n\nCreate a practical content brief covering: 10 reader problems, 10 reader questions, 10 desired outcomes, common beginner mistakes, topics to cover, topics outside scope, 10 unique angles, suggested table of contents, worksheet ideas, and claims requiring fact checking. Suggest Target reader.\nDo not invent statistics, studies, experts, quotes, or sources. Write in natural American English.`,
editorial:`You are a professional American English nonfiction editor.\n\nReview this manuscript for grammar, spelling, awkward phrasing, repetition, contradictions, missing information, generic AI-like writing, unsupported factual claims, inconsistent terminology and formatting.\n\nReturn a Markdown report with:\n# Editorial Review\n## Issues\n| Location | Problem | Recommended Change | Severity |\n|---|---|---|---|\n## Assessment: overall score (x/10)\nClarity (x/10):\nConsistency (x/10):\nPractical usefulness (x/10):\nOriginality (x/10):\nReader experience (x/10):\n\nDo not rewrite the entire manuscript.`,
metadata:`Generate ePub metadata for:\n\nTITLE: {{title}}\nAUTHOR: {{author}}\nTARGET READER: {{reader}}\nNICHE: {{niche}}\nTYPE: {{type}}\n\nReturn Markdown with a 250–350 word accurate book description, a short text for back cover, 7 keyword phrase ideas, and relevant category ideas.\n\nNo fake bestseller claims, reviews, competitor names or guarantees.\n\nAlso create front and back mater.\n\nFollow this structure:\n\n## Descripton\n\n \`\`\`\n [description]\n \`\`\`\n \n ## Back text\n\n \`\`\`\n [back text]\n \`\`\`\n \n ## Keywords\n \`\`\`\n [keywords]\n \`\`\`\n \n ## Categories\n \`\`\`\n [categories]\n \`\`\`\n \n ## Front matter\n \`\`\`\n [front matter]\n \`\`\`\n \n ## Back matter\n \`\`\`\n [back matter]\n \`\`\` `
};


const OUTLINE_PROMPTS={
workbook:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n## Introduction\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
challenge:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# (if proceds) Day [NUMBER] — (end if)[TITLE]\n\n[INTRODUCTION]\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
novel:`You are a professional fiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American fiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PLOT:\n[CHAPTER PLOT]\n\nWrite one complete chapter in natural American English between 10-20 pages. Use Markdown headings, long paragraphs, descriptive scenes and be consistent with the data. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n[CONTENT]\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`
};

const PROMPT_KEY="epub-prompt-steps-v1";
const FIELDS=[["type","Type"],["niche","Niche"],["status","Status"],["language","Language"],["author","Author"]];
const OPS=["is","is not","contains"];
const WILDCARDS=["title","author","reader","niche","type","language","status","price","archive-reason","description","backText","tags","categories","frontMatter","backMatter","chapter","purpose"];
const DEFAULT_STEPS=[
  {id:"research",title:"Research",description:"Content research brief",fileName:"01-research.txt",conditions:[],prompt:PROMPTS.research,hidden:false},
  {id:"outline",title:"Outline",description:"Book structure and chapter plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is not",value:"30-Day Challenge"},{field:"type",op:"is not",value:"Novel"}],prompt:OUTLINE_PROMPTS.workbook,hidden:false},
  {id:"outline-challenge",title:"Outline (30-Day Challenge)",description:"Day-by-day challenge plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is",value:"30-Day Challenge"}],prompt:OUTLINE_PROMPTS.challenge,hidden:false},
  {id:"outline-novel",title:"Outline (Novel)",description:"Chapter plot plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is",value:"Novel"}],prompt:OUTLINE_PROMPTS.novel,hidden:false},
  {id:"editorial",title:"Editorial review",description:"Quality and AI-like filler review",fileName:"05-editorial-review.md",conditions:[],prompt:PROMPTS.editorial,hidden:false},
  {id:"metadata",title:"ePub metadata",description:"Title, description, keywords and categories",fileName:"07-epub-metadata.txt",conditions:[],prompt:PROMPTS.metadata,hidden:false}
];
const LEGACY_SECTIONS={"RESEARCH":"research","OUTLINE":"outline","EDITORIAL":"editorial","METADATA":"metadata"};
let promptSteps=loadPromptSteps();
function loadPromptSteps(){
  try{const s=JSON.parse(localStorage.getItem(PROMPT_KEY)||"null");if(Array.isArray(s))return s}catch{}
  return JSON.parse(JSON.stringify(DEFAULT_STEPS));
}
function savePromptSteps(){localStorage.setItem(PROMPT_KEY,JSON.stringify(promptSteps))}
const COMBOS={author:{input:"authorInput",list:"authors"},niche:{input:"nicheInput",list:"niches"},type:{input:"typeInput",list:"types"},language:{input:"languageInput",list:"languages"}};

let books=load(), selectedId=null, activeIndex=-1, dbPromise=null;
let suggestions=loadSuggestions();

function $(id){return document.getElementById(id)}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function fileSafe(s){return String(s||"book").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"book"}
function fmtSize(n){return n<1024?n+" B":n<1048576?Math.round(n/1024)+" KB":(n/1048576).toFixed(1)+" MB"}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2000)}
function saveBlob(name,blob){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function download(name,text){saveBlob(name,new Blob([text],{type:"text/plain;charset=utf-8"}))}

/* ---------- Modals ---------- */
let modalOnClose=null;
function closeModal(){const back=modalOnClose;modalOnClose=null;if(back)return back();$("modal").classList.add("hidden")}
function openModal(title,body){modalOnClose=null;$("modalTitle").textContent=title;$("modalBody").innerHTML=body;$("modal").classList.remove("hidden")}
function showNotice(title,message){
  openModal(title,`<div class="form-editor"><p class="modal-text">${esc(message)}</p><div class="confirm-actions"><button class="primary" id="okBtn">OK</button></div></div>`);
  $("okBtn").onclick=closeModal;
}
function askConfirm(title,message,okLabel,onOk,danger=false){
  openModal(title,`<div class="form-editor"><p class="modal-text">${esc(message)}</p><div class="confirm-actions"><button class="secondary" id="cancelBtn">Cancel</button><button class="${danger?"danger":"primary"}" id="okBtn">${esc(okLabel)}</button></div></div>`);
  $("cancelBtn").onclick=closeModal;
  $("okBtn").onclick=()=>{closeModal();onOk()};
}

/* ---------- Attachments (IndexedDB) ---------- */
function openDb(){
  return dbPromise||(dbPromise=new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>r.result.createObjectStore("files");
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  }).then(migrateOldDb));
}
/* Migra adjuntos y capítulos de la base antigua (kdp-book-manager-files). Idempotente. */
const OLD_DB_NAME="kdp-book-manager-files";
const IDB_MIGRATED_KEY="epub-migrated-idb";
function idbRequest(req){return new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
function idbAllEntries(db){
  return new Promise((res,rej)=>{
    const out=[],c=db.transaction("files","readonly").objectStore("files").openCursor();
    c.onsuccess=()=>{const cur=c.result;if(cur){out.push([cur.key,cur.value]);cur.continue()}else res(out)};
    c.onerror=()=>rej(c.error);
  });
}
async function migrateOldDb(db){
  if(localStorage.getItem(IDB_MIGRATED_KEY))return db;
  try{
    const old=await idbRequest(indexedDB.open(OLD_DB_NAME));
    if(old.objectStoreNames.contains("files")){
      const entries=await idbAllEntries(old);
      const have=new Set(await idbRequest(db.transaction("files","readonly").objectStore("files").getAllKeys()));
      await new Promise((res,rej)=>{
        const t=db.transaction("files","readwrite"),st=t.objectStore("files");
        for(const [k,v] of entries)if(!have.has(k))st.put(v,k);
        t.oncomplete=()=>res();t.onerror=()=>rej(t.error);
      });
    }
    old.close();
    await new Promise(res=>{const r=indexedDB.deleteDatabase(OLD_DB_NAME);r.onsuccess=r.onerror=r.onblocked=()=>res()});
    localStorage.setItem(IDB_MIGRATED_KEY,"1");
  }catch(e){console.error("Attachment migration failed; will retry on next load:",e)}
  return db;
}
function fileOp(mode,fn){
  return openDb().then(d=>new Promise((res,rej)=>{
    const t=d.transaction("files",mode),req=fn(t.objectStore("files"));
    t.oncomplete=()=>res(req?req.result:undefined);
    t.onerror=()=>rej(t.error);
  }));
}
const getFile=k=>fileOp("readonly",s=>s.get(k));
const putFile=(k,v)=>fileOp("readwrite",s=>s.put(v,k));
const delFile=k=>fileOp("readwrite",s=>s.delete(k));

async function attachFile(kind,input){
  const f=input.files[0];input.value="";
  const id=selectedId;
  if(!f||!id)return;
  if(kind==="book"&&!/\.(epub|md)$/i.test(f.name))return showNotice("Unsupported file","Only .epub and .md files can be attached as the book.");
  if(kind==="cover"&&!f.type.startsWith("image/"))return showNotice("Unsupported file","The cover must be an image file.");
  await putFile(`${id}:${kind}`,{name:f.name,type:f.type,size:f.size,blob:f});
  if(kind==="cover")await saveThumb(id,f);
  await renderAttachments();
  await refreshCovers();
  toast("File attached");
}
async function downloadAttachment(kind){
  const rec=await getFile(`${selectedId}:${kind}`);
  if(rec)saveBlob(rec.name,rec.blob);
}
function removeAttachment(kind){
  askConfirm("Remove file","Remove this attachment from the book?","Remove",async()=>{
    await delFile(`${selectedId}:${kind}`);
    if(kind==="cover")await delFile(`${selectedId}:thumb`);
    await renderAttachments();
    await refreshCovers();
    toast("Attachment removed");
  },true);
}
function attachmentHtml(kind,rec,preview){
  const input=`<input type="file" id="${kind}Input" accept="${kind==="book"?".epub,.md":"image/*"}" hidden onchange="attachFile('${kind}',this)">`;
  if(!rec){
    const label=kind==="book"?"Attach .epub or .md":"Attach cover image";
    return `${input}<div class="drop"><p class="muted">No file attached yet.</p><button class="primary" onclick="$('${kind}Input').click()">${label}</button></div>`;
  }
  const thumb=kind==="cover"?`<img class="cover-thumb" src="${URL.createObjectURL(preview||rec.blob)}" alt="Cover">`:`<div class="file-icon">📘</div>`;
  return `${input}<div class="attachment">${thumb}<div class="att-info"><strong>${esc(rec.name)}</strong><span class="muted">${fmtSize(rec.size)}</span></div><div class="att-actions"><button class="secondary" onclick="downloadAttachment('${kind}')">Download</button><button class="secondary" onclick="$('${kind}Input').click()">Replace</button><button class="danger" onclick="removeAttachment('${kind}')">Remove</button></div></div>`;
}
async function renderAttachments(){
  const id=selectedId;if(!id)return;
  const [book,cover,thumb]=await Promise.all([getFile(`${id}:book`),getFile(`${id}:cover`),getFile(`${id}:thumb`)]);
  if(selectedId!==id)return;
  $("bookFile").innerHTML=attachmentHtml("book",book);
  $("coverFile").innerHTML=attachmentHtml("cover",cover,thumb?.blob);
}

/* ---------- Data ---------- */
function normalize(b){
  b.status=normalizeStatus(b.status);
  b.archiveReason=b.archiveReason||"";
  const n=NICHES.find(([slug])=>slug===b.niche);
  if(n)b.niche=n[1];
  b.publishing={...blankPublishing(),...(b.publishing||{})};
  b.language=b.language||"en-US";
  if(!b.steps){
    b.steps={research:b.research||"",outline:b.outline||"",editorial:b.editorial||"",metadata:b.metadata||""};
    delete b.research;delete b.outline;delete b.editorial;delete b.metadata;
  }
  return b;
}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]").map(normalize)}catch{return[]}}
function persist(){localStorage.setItem(KEY,JSON.stringify(books));renderList()}
function blankPublishing(){return Object.fromEntries(PUB_FIELDS.map(([k])=>[k,""]))}
function blank(){const now=new Date().toISOString();return{id:uid(),title:"New Book",author:"",niche:"",type:"Workbook",reader:"",price:"",language:"en-US",status:STATUSES[0],archiveReason:"",created:now,updated:now,steps:{},publishing:blankPublishing()}}
function selected(){return books.find(b=>b.id===selectedId)}

/* ---------- Autocomplete suggestions ---------- */
function defaultSuggestions(){return{authors:[...AUTHORS],niches:NICHES.map(([,label])=>label),types:[...TYPES],languages:[...LANGUAGES]}}
function loadSuggestions(){
  try{const s=JSON.parse(localStorage.getItem(SUGGEST_KEY)||"null");if(s){s.languages=s.languages||[...LANGUAGES];return s}}catch{}
  const s=defaultSuggestions();
  for(const b of books)rememberValues(b,s);
  return s;
}
function saveSuggestions(){localStorage.setItem(SUGGEST_KEY,JSON.stringify(suggestions))}
function addTo(list,value){
  const v=(value||"").trim();
  if(v&&!list.some(x=>x.toLowerCase()===v.toLowerCase()))list.push(v);
}
function rememberValues(b,s=suggestions){addTo(s.authors,b.author);addTo(s.niches,b.niche);addTo(s.types,b.type);addTo(s.languages,b.language)}
function removeSuggestion(name,value){
  const list=suggestions[COMBOS[name].list];
  const i=list.indexOf(value);
  if(i>=0)list.splice(i,1);
  saveSuggestions();
  showSuggest(name);
}
function showSuggest(name){
  const {input,list}=COMBOS[name],box=$(name+"Suggest"),q=$(input).value.trim().toLowerCase();
  const items=suggestions[list].filter(v=>!q||v.toLowerCase().includes(q)).sort((a,b)=>a.localeCompare(b));
  activeIndex=-1;
  if(!items.length){hideSuggest(name);return}
  box.innerHTML=items.map(v=>`<div class="suggest-item" data-value="${esc(v)}"><span>${esc(v)}</span><button type="button" class="suggest-remove" data-remove="${esc(v)}" title="Remove from list">×</button></div>`).join("");
  box.classList.remove("hidden");
}
function hideSuggest(name){$(name+"Suggest").classList.add("hidden");activeIndex=-1}
function onComboKey(e,name){
  if(e.key==="Escape"){hideSuggest(name);return}
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){
    e.preventDefault();
    if($(name+"Suggest").classList.contains("hidden"))showSuggest(name);
    const items=[...$(name+"Suggest").querySelectorAll(".suggest-item")];
    if(!items.length)return;
    activeIndex=(activeIndex+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;
    items.forEach((el,i)=>el.classList.toggle("active",i===activeIndex));
    items[activeIndex].scrollIntoView({block:"nearest"});
  }else if(e.key==="Enter"&&activeIndex>=0){
    e.preventDefault();
    const items=[...$(name+"Suggest").querySelectorAll(".suggest-item")];
    $(COMBOS[name].input).value=items[activeIndex].dataset.value;
    hideSuggest(name);
  }
}
function setupCombos(){
  for(const name of Object.keys(COMBOS)){
    const input=$(COMBOS[name].input),box=$(name+"Suggest");
    input.addEventListener("focus",()=>showSuggest(name));
    input.addEventListener("input",()=>showSuggest(name));
    input.addEventListener("keydown",e=>onComboKey(e,name));
    input.addEventListener("blur",()=>setTimeout(()=>hideSuggest(name),150));
    box.addEventListener("mousedown",e=>{
      e.preventDefault();
      const del=e.target.closest("[data-remove]");
      if(del){removeSuggestion(name,del.dataset.remove);return}
      const item=e.target.closest("[data-value]");
      if(item){input.value=item.dataset.value;hideSuggest(name)}
    });
  }
}

/* ---------- Books ---------- */
function saveCurrent(silent=false){
  const b=selected();if(!b)return;
  b.title=$("titleInput").value.trim()||"Untitled";
  b.author=$("authorInput").value.trim();
  b.niche=$("nicheInput").value.trim();
  b.type=$("typeInput").value.trim();
  b.price=$("priceInput").value;
  b.language=$("languageInput").value.trim()||"en-US";
  b.reader=$("readerInput").value;
  b.status=$("statusInput").value;
  b.archiveReason=$("archiveReasonInput").value.trim();
  b.publishing={};
  for(const [k] of PUB_FIELDS)b.publishing[k]=$("pub_"+k).value;
  b.updated=new Date().toISOString();
  rememberValues(b);saveSuggestions();
  persist();
  if(!silent)toast("Saved");
}
function newBook(){const b=blank();books.unshift(b);persist();openBook(b.id)}
function showEmpty(){selectedId=null;$("editor").classList.add("hidden");$("emptyState").classList.remove("hidden");renderList()}
let visibleBooks=[];
function renderList(){
  const q=$("searchInput").value.trim().toLowerCase(),f=$("statusFilter").value;
  const vs=books
    .filter(b=>!q||[b.title,b.author,b.niche].join(" ").toLowerCase().includes(q))
    .filter(b=>!f||b.status===f)
    .sort((a,b)=>STATUSES.indexOf(a.status)-STATUSES.indexOf(b.status)||(b.updated||"").localeCompare(a.updated||""));
  visibleBooks=vs;
  const item=b=>{const cover=coverUrls.get(b.id);return `<div class="book-item ${b.id===selectedId?"selected":""}" onclick="openBook('${b.id}')"><div class="book-item-row"><div class="book-item-text"><div class="book-item-title">${esc(b.status.split(" ")[0])} ${esc(b.title)}</div><div class="book-item-meta">${esc(b.author)}</div></div>${cover?`<img class="book-thumb" src="${cover}" alt="">`:""}</div></div>`};
  const active=vs.filter(b=>b.status!==ARCHIVED),archived=vs.filter(b=>b.status===ARCHIVED);
  let html=active.map(item).join("");
  if(archived.length){
    if(f){html+=archived.map(item).join("")}
    else{
      const open=archivedOpen();
      html+=`<button class="archived-toggle" onclick="toggleArchived()" aria-expanded="${open}"><span class="chev ${open?"open":""}">▸</span>Archived<span class="archived-count">${archived.length}</span></button>`;
      if(open)html+=archived.map(item).join("");
    }
  }
  $("bookList").innerHTML=html;
}
function archivedOpen(){return localStorage.getItem(ARCHIVED_OPEN_KEY)==="1"}
function toggleArchived(){localStorage.setItem(ARCHIVED_OPEN_KEY,archivedOpen()?"0":"1");renderList()}
function populate(){
  $("statusFilter").innerHTML='<option value="">All statuses</option>'+STATUSES.map(x=>`<option>${x}</option>`).join("");
  $("statusInput").innerHTML=STATUSES.map(x=>`<option>${x}</option>`).join("");
}
function openBook(id){
  selectedId=id;const b=selected();if(!b)return;
  $("emptyState").classList.add("hidden");
  $("editor").classList.remove("hidden");
  $("titleInput").value=b.title;
  $("authorInput").value=b.author;
  $("nicheInput").value=b.niche;
  $("typeInput").value=b.type;
  $("priceInput").value=b.price;
  $("languageInput").value=b.language||"en-US";
  $("readerInput").value=b.reader;
  $("statusInput").value=b.status;
  $("archiveReasonInput").value=b.archiveReason||"";
  syncArchiveField();
  renderList();renderWorkflow();renderPublishing();renderAttachments();renderBuild();
}
function setTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  for(const n of ["workflow","publishing","chapters","build"])$(n+"Tab").classList.toggle("hidden",n!==name);
  if(name==="build")fitTab("buildTab");
  if(name==="chapters"||name==="build")renderBuild();
}

/* ---------- Publishing tab ---------- */
function renderPublishing(){
  const b=selected();if(!b)return;
  $("publishingTab").innerHTML=`<div class="pub-grid">
    <div class="card"><h3>Book file</h3><div id="bookFile"></div></div>
    <div class="card"><h3>Cover</h3><div id="coverFile"></div></div>
  </div>
  <div class="card"><h3>Metadata</h3>${PUB_FIELDS.map(([k,label,rows])=>`<label class="pub-field"><span>${label}</span><textarea id="pub_${k}" rows="${rows}">${esc(b.publishing[k])}</textarea></label>`).join("")}</div>`;
}

/* ---------- Workflow steps and prompts ---------- */
/* ---------- Prompt configuration and workflow steps ---------- */
function openPromptConfig(){renderPromptList()}
function condSummary(s){return (s.conditions||[]).map(c=>`${c.field} ${c.op} "${c.value}"`).join(" & ")||"Always"}
function renderPromptList(){
  openModal("Configure prompts",`<div class="pc-body">
    <div class="pc-head"><p class="modal-text">Steps appear in the workflow when they're visible and their conditions match the book.</p><div class="pc-tools"><button class="secondary" onclick="exportPrompts()">Export all</button><button class="secondary" onclick="importPrompts()">Import all</button><button class="primary" onclick="editPromptStep()">New step</button></div></div>
    <div class="pc-list">${promptSteps.map((s,i)=>`<div class="pc-row ${s.hidden?"is-hidden":""}" draggable="true" ondragstart="promptDragStart(event,${i})" ondragover="promptDragOver(event)" ondrop="promptDrop(event,${i})" ondragend="promptDragEnd()">
      <span class="grip" aria-hidden="true">⠿</span>
      <div class="pc-info"><strong>${esc(s.title)}</strong><span class="muted">${esc(s.description)}</span><span class="pc-meta">${s.hidden?"Hidden · ":""}${esc(condSummary(s))}</span></div>
      <div class="pc-side"><span class="pc-id">step.${s.id}</span><div class="pc-actions">
        <button class="secondary" onclick="editPromptStep('${s.id}')">Edit</button>
        <button class="secondary" onclick="togglePromptStep('${s.id}')">${s.hidden?"Show":"Hide"}</button>
        <button class="danger" onclick="deletePromptStep('${s.id}')">Delete</button>
      </div></div></div>`).join("")}</div>
  </div>`);
}
/* Reordenar steps por arrastre */
let promptDragFrom=null;
function promptDragStart(e,i){
  promptDragFrom=i;
  e.dataTransfer.effectAllowed="move";
  e.dataTransfer.setData("text/plain",String(i));
  e.currentTarget.classList.add("dragging");
}
function promptDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect="move";
  document.querySelectorAll(".pc-row.drop-target").forEach(el=>el.classList.remove("drop-target"));
  e.currentTarget.classList.add("drop-target");
}
function promptDragEnd(){
  document.querySelectorAll(".pc-row").forEach(el=>el.classList.remove("dragging","drop-target"));
  promptDragFrom=null;
}
function promptDrop(e,i){
  e.preventDefault();
  const from=promptDragFrom;promptDragFrom=null;
  if(from===null||from===i)return promptDragEnd();
  const [moved]=promptSteps.splice(from,1);
  promptSteps.splice(i,0,moved);
  savePromptSteps();renderPromptList();renderWorkflow();
}
let draft=null;
function editPromptStep(id){
  const s=id?promptSteps.find(x=>x.id===id):null;
  draft=s?JSON.parse(JSON.stringify(s)):{id:"step-"+uid().slice(0,8),title:"",description:"",fileName:"",conditions:[],prompt:"",hidden:false};
  openModal(`${s?"Edit":"New"} step — step.${draft.id}`,`<div class="ps-form">
    <label>Title<input id="psTitle"></label>
    <label>Description<input id="psDesc"></label>
    <div class="ps-conds"><div class="ps-label">Show when all of these match</div><div id="psCondRows"></div><button class="secondary" onclick="addCondRow()">Add condition</button></div>
    <label>Prompt<textarea id="psPrompt" class="ps-prompt" rows="12" spellcheck="false"></textarea></label>
    <div class="ps-wild"><span class="ps-label">Wildcards</span>${WILDCARDS.map(w=>`<button type="button" class="chip" onclick="insertWildcard('${w}')">{{${w}}}</button>`).join("")}</div>
    <p class="muted ps-note">Use {{step.ID}} to insert the saved text of another step, where ID is that step's id.</p>
    <div class="confirm-actions"><button class="secondary" onclick="renderPromptList()">Cancel</button><button class="primary" onclick="savePromptStep()">Save step</button></div>
  </div>`);
  $("psTitle").value=draft.title;
  $("psDesc").value=draft.description;
  $("psPrompt").value=draft.prompt;
  const pt=$("psPrompt");pt.oninput=()=>autoGrow(pt);autoGrow(pt);
  const rows=$("psCondRows");
  rows.oninput=rows.onchange=e=>{
    const i=Number(e.target.dataset.ci);
    if(Number.isNaN(i)||!draft.conditions[i])return;
    draft.conditions[i][e.target.dataset.k]=e.target.value;
  };
  renderCondRows();
  modalOnClose=renderPromptList;
}
function renderCondRows(){
  $("psCondRows").innerHTML=draft.conditions.map((c,i)=>`<div class="ps-cond">
      <select data-ci="${i}" data-k="field">${FIELDS.map(([v,l])=>`<option value="${v}" ${c.field===v?"selected":""}>${l}</option>`).join("")}</select>
      <select data-ci="${i}" data-k="op">${OPS.map(o=>`<option ${c.op===o?"selected":""}>${o}</option>`).join("")}</select>
      <input data-ci="${i}" data-k="value" value="${esc(c.value)}" placeholder="value">
      <button class="icon-btn danger-icon" onclick="removeCondRow(${i})" title="Remove">×</button></div>`).join("")||`<p class="muted">No conditions: always shown.</p>`;
}
function addCondRow(){draft.conditions.push({field:"type",op:"is",value:""});renderCondRows()}
function removeCondRow(i){draft.conditions.splice(i,1);renderCondRows()}
function insertWildcard(w){
  const t=$("psPrompt"),tok=`{{${w}}}`,s=t.selectionStart??t.value.length,e=t.selectionEnd??s;
  t.value=t.value.slice(0,s)+tok+t.value.slice(e);
  t.focus();t.selectionStart=t.selectionEnd=s+tok.length;
  autoGrow(t);
}
function savePromptStep(){
  draft.title=$("psTitle").value.trim()||"Untitled step";
  draft.description=$("psDesc").value.trim();
  draft.prompt=$("psPrompt").value;
  draft.conditions=draft.conditions.filter(c=>c.field&&c.op);
  const i=promptSteps.findIndex(x=>x.id===draft.id);
  if(i>=0)promptSteps[i]=draft;else promptSteps.push(draft);
  savePromptSteps();
  renderPromptList();
  renderWorkflow();
  toast("Step saved");
}
function togglePromptStep(id){
  const s=promptSteps.find(x=>x.id===id);if(!s)return;
  s.hidden=!s.hidden;savePromptSteps();renderPromptList();renderWorkflow();
}
function deletePromptStep(id){
  const s=promptSteps.find(x=>x.id===id);if(!s)return;
  askConfirm("Delete step",`Delete "${s.title}" from the prompts? Text already saved in books is kept but no longer shown.`,"Delete",()=>{
    promptSteps=promptSteps.filter(x=>x.id!==id);
    savePromptSteps();renderPromptList();renderWorkflow();toast("Step deleted");
  },true);
}

/* ---------- Visibility, wildcards and workflow ---------- */
function stepVisible(s,b){
  if(s.hidden)return false;
  return (s.conditions||[]).every(c=>{
    const v=String(b[c.field]??"").toLowerCase(),t=String(c.value??"").toLowerCase();
    if(c.op==="is")return v===t;
    if(c.op==="is not")return v!==t;
    if(c.op==="contains")return v.includes(t);
    return true;
  });
}
function wildcardMap(b){
  const map={
    title:b.title,author:b.author,reader:b.reader,niche:b.niche,type:b.type,language:b.language,
    status:b.status,price:b.price,"archive-reason":b.archiveReason||"",
    chapter:"[CHAPTER NUMBER AND TITLE]",purpose:"[CHAPTER PURPOSE]"
  };
  for(const [k,v] of Object.entries(b.publishing||{}))map[k]=v;
  for(const [k,v] of Object.entries(b.steps||{}))map["step."+k]=v;
  return map;
}
function template(s,b){
  const map=wildcardMap(b);
  return s.replace(/\{\{\s*([\w.-]+)\s*\}\}/g,(all,k)=>(k in map)?map[k]:all);
}
function renderWorkflow(){
  const b=selected();if(!b)return;
  const steps=promptSteps.filter(s=>stepVisible(s,b));
  $("workflowTab").innerHTML=steps.map((s,i)=>{
    const done=!!b.steps[s.id];
    return `<div class="step ${done?"done":""}"><div class="step-head"><div class="step-num">${i+1}</div><div class="step-title">${esc(s.title)}</div></div><div class="muted" style="margin-left:39px;margin-top:4px">${esc(s.description)}</div><div class="step-actions"><button class="primary-mini" onclick="showPrompt('${s.id}')">Prompt</button>${done?`<button class="edit-green" onclick="editTextStep('${s.id}')">Response</button>`:`<button onclick="editTextStep('${s.id}')">Response</button>`}</div></div>`;
  }).join("");
}
function showPrompt(id){
  const b=selected(),s=promptSteps.find(x=>x.id===id);if(!s)return;
  openModal(`Prompt — ${s.title}`,`<div class="modal-body"><textarea class="prompt-area" id="promptText">${esc(template(s.prompt,b))}</textarea></div><div class="modal-footer"><button class="primary" onclick="copyPrompt()">Copy prompt</button><button class="secondary" onclick="editTextStep('${id}')">Edit / paste result</button></div>`);
  autoGrow($("promptText"));
}
function autoGrow(t){t.style.height="auto";t.style.height=t.scrollHeight+"px"}
async function copyPrompt(){await navigator.clipboard.writeText($("promptText").value);toast("Prompt copied")}
function editTextStep(id){
  const b=selected(),s=promptSteps.find(x=>x.id===id);if(!s)return;
  openModal(`Edit / paste — ${s.title}`,`<div class="form-editor">
    <div class="editor-bar"><div class="segmented"><button data-sview="code" class="active" onclick="setStepView('code')">Code</button><button data-sview="preview" onclick="setStepView('preview')">Preview</button></div></div>
    <textarea id="stepContent" class="md-code" spellcheck="false">${esc(b.steps[id]||"")}</textarea>
    <div id="stepPreview" class="md-preview hidden"></div>
    <div><button class="primary" onclick="saveTextStep('${id}')">Save</button></div>
  </div>`);
}
function setStepView(view){
  document.querySelectorAll("[data-sview]").forEach(b=>b.classList.toggle("active",b.dataset.sview===view));
  $("stepContent").classList.toggle("hidden",view!=="code");
  $("stepPreview").classList.toggle("hidden",view!=="preview");
  if(view==="preview")$("stepPreview").innerHTML=mdToHtml($("stepContent").value,{copy:true});
}
function saveTextStep(id){
  const b=selected();
  b.steps[id]=$("stepContent").value;
  b.updated=new Date().toISOString();
  persist();
  closeModal();
  renderWorkflow();
  toast("Saved");
}

/* ---------- Export / import ---------- */
function bookTxt(b){return `EPUB BOOK MANAGER V2\n\nID: ${b.id}\nTitle: ${b.title}\nAuthor: ${b.author}\nNiche: ${b.niche}\nType: ${b.type}\nTarget reader: ${b.reader}\nStatus: ${b.status}\nArchive reason: ${b.archiveReason||""}\nPrice: ${b.price}\nLanguage: ${b.language}\nCreated: ${b.created}\nUpdated: ${b.updated}\n${Object.entries(b.steps||{}).map(([k,v])=>`\n=== STEP ${k} ===\n${v}\n`).join("")}${PUB_FIELDS.map(([k,label])=>`\n=== ${label.toUpperCase()} ===\n${b.publishing[k]}\n`).join("")}`}


function parseBookTxt(text){
  const b=blank(),fields={"ID":"id","Title":"title","Author":"author","Niche":"niche","Type":"type","Target reader":"reader","Status":"status","Archive reason":"archiveReason","Price":"price","Language":"language","Created":"created","Updated":"updated"};
  let section=null;
  for(const line of text.split(/\r?\n/)){
    if(line.startsWith("=== ")&&line.endsWith(" ===")){
      const name=line.slice(4,-4);
      if(name.startsWith("STEP ")){const k=name.slice(5).trim();b.steps[k]="";section={holder:"steps",key:k}}
      else if(LEGACY_SECTIONS[name]){const k=LEGACY_SECTIONS[name];b.steps[k]="";section={holder:"steps",key:k}}
      else if(PUB_HEADERS[name])section={holder:"publishing",key:PUB_HEADERS[name]};
      else section=null;
      continue;
    }
    if(section){b[section.holder][section.key]+=line+"\n";continue}
    const m=line.match(/^([^:]+):\s*(.*)$/);
    if(m&&fields[m[1]])b[fields[m[1]]]=m[2];
  }
  for(const k of Object.keys(b.steps))b.steps[k]=b.steps[k].replace(/\s+$/,"");
  for(const [k] of PUB_FIELDS)b.publishing[k]=b.publishing[k].replace(/\s+$/,"");
  return normalize(b);
}


/* ---------- ZIP (no dependencies) ---------- */
const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(d){let c=0xFFFFFFFF;for(let i=0;i<d.length;i++)c=CRC_TABLE[(c^d[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function buildZip(entries){
  const enc=new TextEncoder(),now=new Date();
  const dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
  const dosDate=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const parts=[],central=[];let offset=0;
  for(const {name,data} of entries){
    const nb=enc.encode(name),crc=crc32(data),size=data.length;
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
    lh.setUint16(10,dosTime,true);lh.setUint16(12,dosDate,true);lh.setUint32(14,crc,true);
    lh.setUint32(18,size,true);lh.setUint32(22,size,true);lh.setUint16(26,nb.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),nb,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);
    ch.setUint16(12,dosTime,true);ch.setUint16(14,dosDate,true);ch.setUint32(16,crc,true);
    ch.setUint32(20,size,true);ch.setUint32(24,size,true);ch.setUint16(28,nb.length,true);ch.setUint32(42,offset,true);
    central.push(new Uint8Array(ch.buffer),nb);
    offset+=30+nb.length+size;
  }
  const cdSize=central.reduce((n,p)=>n+p.length,0);
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
  end.setUint32(12,cdSize,true);end.setUint32(16,offset,true);
  return new Blob([...parts,...central,new Uint8Array(end.buffer)],{type:"application/zip"});
}
async function readZip(buf){
  const dv=new DataView(buf),u8=new Uint8Array(buf),dec=new TextDecoder();
  let eocd=-1;
  for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-65557);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw new Error("The file is not a valid ZIP archive.");
  const count=dv.getUint16(eocd+10,true);let p=dv.getUint32(eocd+16,true);
  const files=new Map();
  for(let n=0;n<count;n++){
    const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nameLen=dv.getUint16(p+28,true),
          extraLen=dv.getUint16(p+30,true),commentLen=dv.getUint16(p+32,true),local=dv.getUint32(p+42,true);
    const name=dec.decode(u8.subarray(p+46,p+46+nameLen));
    const start=local+30+dv.getUint16(local+26,true)+dv.getUint16(local+28,true);
    const raw=u8.subarray(start,start+csize);
    let data;
    if(method===0)data=raw;
    else if(method===8)data=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    else throw new Error("Unsupported compression method.");
    if(!name.endsWith("/"))files.set(name,data);
    p+=46+nameLen+extraLen+commentLen;
  }
  return files;
}
const MIME={epub:"application/epub+zip",md:"text/markdown",txt:"text/plain",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif"};
function mimeOf(name){return MIME[name.split(".").pop().toLowerCase()]||"application/octet-stream"}

/* ---------- Export / import of full books (.zip) ---------- */
async function bookEntries(b,prefix){
  const out=[{name:prefix+"book.txt",data:new TextEncoder().encode(bookTxt(b))}];
  for(const kind of ["book","cover"]){
    const rec=await getFile(`${b.id}:${kind}`);
    if(rec)out.push({name:`${prefix}files/${kind}/${rec.name}`,data:new Uint8Array(await rec.blob.arrayBuffer())});
  }
  const chapters=await getChapters(b.id);
  chapters.forEach((c,i)=>out.push({name:`${prefix}chapters/${pad(i+1)}-${c.name}`,data:new TextEncoder().encode(c.md)}));
  return out;
}
async function exportBook(){
  const b=selected();if(!b)return;
  saveBlob(`${fileSafe(b.title)}-book.zip`,buildZip(await bookEntries(b,"")));
  toast("Book exported");
}
/* ---------- Book picker (export and import) ---------- */
function openBookPicker({title,intro,items,confirmLabel,onConfirm}){
  const sel=new Set(items.filter(i=>i.checked!==false).map(i=>String(i.id)));
  openModal(title,`<div class="picker">
    <p class="modal-text">${intro}</p>
    <label class="pick-head"><input type="checkbox" id="pickAll"><span id="pickCount"></span></label>
    <div class="pick-list">${items.map(i=>`<label class="pick-row ${i.warn?"warn":""}">
      <input type="checkbox" data-id="${esc(i.id)}" ${sel.has(String(i.id))?"checked":""}>
      <div class="pick-info"><strong>${esc(i.title)}</strong><span class="muted">${esc(i.meta||"")}</span></div>
      ${i.warn?`<span class="warn-icon" title="${esc(i.warn)}" aria-label="${esc(i.warn)}">⚠</span>`:""}
    </label>`).join("")}</div>
    <div class="confirm-actions"><button class="secondary" id="pickCancel">Cancel</button><button class="primary" id="pickOk">${esc(confirmLabel)}</button></div>
  </div>`);
  const sync=()=>{
    const all=items.length>0&&sel.size===items.length;
    const pa=$("pickAll");
    pa.checked=all;pa.indeterminate=sel.size>0&&!all;
    $("pickCount").textContent=`${sel.size} of ${items.length} selected`;
    $("pickOk").disabled=sel.size===0;
  };
  $("pickAll").onchange=e=>{
    items.forEach(i=>sel[e.target.checked?"add":"delete"](String(i.id)));
    document.querySelectorAll(".pick-list input[data-id]").forEach(cb=>cb.checked=e.target.checked);
    sync();
  };
  document.querySelectorAll(".pick-list input[data-id]").forEach(cb=>cb.onchange=()=>{
    cb.checked?sel.add(cb.dataset.id):sel.delete(cb.dataset.id);
    sync();
  });
  $("pickCancel").onclick=closeModal;
  $("pickOk").onclick=()=>{
    const ids=items.filter(i=>sel.has(String(i.id))).map(i=>String(i.id));
    closeModal();
    onConfirm(ids);
  };
  sync();
}

/* ---------- Export books ---------- */
function openExportPicker(){
  if(!visibleBooks.length)return showNotice("No books","There are no books in the current list to export.");
  const q=$("searchInput").value.trim(),f=$("statusFilter").value;
  const scope=[f?`status "${f}"`:"",q?`search "${q}"`:""].filter(Boolean).join(" and ")||"all books";
  openBookPicker({
    title:"Export books",
    intro:`You're about to export these books (filter: ${esc(scope)}). Choose which ones to include.`,
    items:visibleBooks.map(b=>({id:b.id,title:b.title,meta:`${b.author||"No author"} · ${b.status}`})),
    confirmLabel:"Export",
    onConfirm:exportBooks
  });
}
async function exportBooks(ids){
  const list=ids.map(id=>books.find(b=>b.id===id)).filter(Boolean);
  if(!list.length)return;
  const entries=[];
  for(const [i,b] of list.entries())entries.push(...await bookEntries(b,`${String(i+1).padStart(2,"0")}-${fileSafe(b.title)}/`));
  saveBlob("epub-books.zip",buildZip(entries));
  toast(`Exported ${list.length} book${list.length===1?"":"s"}`);
}

/* ---------- Prompts: export and import all ---------- */
/* ---------- General helpers ---------- */
function fmtDate(iso){
  const d=new Date(iso);if(isNaN(d))return "";
  const p=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---------- Export / import items with picker and conflicts ---------- */
function openItemExport({kind,list,fileName,wrap,describe}){
  openBookPicker({
    title:`Export ${kind}s`,
    intro:`Choose which ${kind}s to export.`,
    items:list.map((x,i)=>{const d=describe(x);return{id:String(i),title:d.label,meta:d.detail}}),
    confirmLabel:"Export",
    onConfirm:ids=>{
      const chosen=ids.map(i=>list[Number(i)]);
      saveBlob(fileName,new Blob([JSON.stringify(wrap(chosen),null,2)],{type:"application/json"}));
      toast(`Exported ${chosen.length} ${kind}${chosen.length===1?"":"s"}`);
    }
  });
}
function readJsonFile(accept,onData){
  const inp=document.createElement("input");
  inp.type="file";inp.accept=accept;
  inp.onchange=async()=>{
    const f=inp.files[0];if(!f)return;
    try{onData(JSON.parse(await f.text()))}
    catch(err){showNotice("Import failed",err.message||"The file could not be read.")}
  };
  inp.click();
}
function askItemConflict(kind,cur,inc,describe,diffs){
  return new Promise(resolve=>{
    const c=describe(cur),i=describe(inc);
    openModal(`Duplicate ${kind}`,`<div class="conflict">
      <p class="modal-text">A ${esc(kind)} with the same ID already exists. Which version do you want to keep?</p>
      <div class="conflict-grid">
        <div class="conflict-card"><h4>Current</h4><strong>${esc(c.label)}</strong><ul class="conflict-meta"><li>${esc(c.detail)}</li></ul><button class="secondary" id="keepCurrent">Keep current</button></div>
        <div class="conflict-card"><h4>Imported</h4><strong>${esc(i.label)}</strong><ul class="conflict-meta"><li>${esc(i.detail)}</li></ul><button class="primary" id="useImported">Use imported</button></div>
      </div>
      <p class="modal-text"><strong>Differences:</strong> ${diffs.length?esc(diffs.join(", ")):"none"}</p>
    </div>`);
    let done=false;
    const finish=v=>{if(done)return;done=true;modalOnClose=null;closeModal();resolve(v)};
    $("keepCurrent").onclick=()=>finish("current");
    $("useImported").onclick=()=>finish("imported");
    modalOnClose=()=>finish("current");
  });
}
function openItemImport({kind,incoming,existing,keys,describe,apply}){
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const items=incoming.map((x,i)=>{
    const cur=existing.find(e=>e.id===x.id),d=describe(x),identical=!!cur&&same(cur,x);
    return{id:String(i),title:d.label,meta:identical?`${d.detail} · identical to the current one`:d.detail,checked:!identical,warn:cur&&!identical?`A ${kind} with this ID already exists`:null};
  });
  openBookPicker({
    title:`Import ${kind}s`,
    intro:`These ${kind}s were found in the file. Choose which ones to import. Items marked ⚠ already exist, and you'll be asked which version to keep.`,
    items,confirmLabel:"Import",
    onConfirm:async ids=>{
      let result=existing.slice();
      for(const i of ids.map(Number)){
        const inc=incoming[i],idx=result.findIndex(e=>e.id===inc.id);
        if(idx<0){result.push(inc);continue}
        const cur=result[idx];
        if(same(cur,inc))continue;
        const diffs=keys.filter(([k])=>!same(cur[k]??null,inc[k]??null)).map(([,label])=>label);
        const choice=await askItemConflict(kind,cur,inc,describe,diffs);
        if(choice==="imported")result[idx]=inc;
      }
      apply(result);
      toast(`Imported ${ids.length} ${kind}${ids.length===1?"":"s"}`);
    }
  });
}

/* ---------- Prompts: export and import ---------- */
function exportPrompts(){
  openItemExport({
    kind:"prompt step",list:promptSteps,fileName:"epub-prompts.json",
    wrap:steps=>({type:"epub-prompts",version:1,steps}),
    describe:x=>({label:x.title,detail:`${x.hidden?"Hidden · ":""}${condSummary(x)}`})
  });
}
function importPrompts(){
  readJsonFile(".json,application/json",data=>{
    const raw=Array.isArray(data)?data:data.steps;
    if(!Array.isArray(raw)||!raw.every(s=>s&&s.id&&s.title&&typeof s.prompt==="string"))throw new Error("The file doesn't contain valid prompts.");
    const incoming=raw.map(s=>({description:"",conditions:[],hidden:false,...s}));
    openItemImport({
      kind:"prompt step",incoming,existing:promptSteps,
      keys:[["title","Title"],["description","Description"],["prompt","Prompt"],["hidden","Visibility"],["conditions","Conditions"]],
      describe:x=>({label:x.title,detail:`${x.hidden?"Hidden · ":""}${condSummary(x)}`}),
      apply:steps=>{promptSteps=steps;savePromptSteps();renderPromptList();renderWorkflow()}
    });
  });
}

/* ---------- Templates: configure, export and import ---------- */
let templateDraft=null;
function openTemplateConfig(){renderTemplateList()}
function renderTemplateList(){
  openModal("Configure templates",`<div class="pc-body">
    <div class="pc-head"><p class="modal-text">Templates style the Preview and PDF output. Markdown, TXT and EPUB don't use them.</p>
      <div class="pc-tools"><button class="secondary" onclick="exportTemplates()">Export all</button><button class="secondary" onclick="importTemplates()">Import all</button><button class="primary" onclick="editTemplate()">New template</button></div></div>
    <div class="pc-list">${templates.map(t=>`<div class="pc-row">
      <div class="pc-info"><strong>${esc(t.label)}</strong><span class="pc-meta">${esc(t.size)} · margin ${esc(t.margin)}</span></div>
      <div class="pc-side"><span class="pc-id">${esc(t.id)}</span><div class="pc-actions"><button class="secondary" onclick="editTemplate('${t.id}')">Edit</button><button class="danger" onclick="deleteTemplate('${t.id}')" ${templates.length<2?"disabled":""}>Delete</button></div></div>
    </div>`).join("")}</div>
  </div>`);
}
function editTemplate(id){
  const t=id?templates.find(x=>x.id===id):null;
  templateDraft=t?{...t}:{id:"tpl-"+uid().slice(0,8),label:"",size:"A5",margin:"18mm 16mm",css:""};
  openModal(`${t?"Edit":"New"} template — ${templateDraft.id}`,`<div class="ps-form">
    <label>Name<input id="tplLabel"></label>
    <label>Page size<select id="tplSize"><option>A4</option><option>A5</option><option>Letter</option></select></label>
    <label>Margin<input id="tplMargin" placeholder="18mm 16mm"></label>
    <label>CSS<textarea id="tplCss" class="ps-prompt" spellcheck="false"></textarea></label>
    <p class="muted ps-note">The shared base styles (cover page, chapter page breaks, preview width) are applied first; this CSS is added after them.</p>
    <div class="confirm-actions"><button class="secondary" onclick="renderTemplateList()">Cancel</button><button class="primary" onclick="saveTemplate()">Save template</button></div>
  </div>`);
  $("tplLabel").value=templateDraft.label;
  $("tplSize").value=templateDraft.size;
  $("tplMargin").value=templateDraft.margin;
  const css=$("tplCss");
  css.value=templateDraft.css;
  css.oninput=()=>autoGrow(css);
  autoGrow(css);
  modalOnClose=renderTemplateList;
}
function saveTemplate(){
  templateDraft.label=$("tplLabel").value.trim()||"Untitled";
  templateDraft.size=$("tplSize").value;
  templateDraft.margin=$("tplMargin").value.trim()||"18mm";
  templateDraft.css=$("tplCss").value;
  const i=templates.findIndex(x=>x.id===templateDraft.id);
  if(i>=0)templates[i]=templateDraft;else templates.push(templateDraft);
  saveTemplates();
  renderTemplateList();
  if(selectedId)renderBuild();
  toast("Template saved");
}
function deleteTemplate(id){
  const t=templates.find(x=>x.id===id);if(!t||templates.length<2)return;
  askConfirm("Delete template",`Delete "${t.label}"?`,"Delete",()=>{
    templates=templates.filter(x=>x.id!==id);
    if(currentTemplate===id)currentTemplate=templates[0].id;
    saveTemplates();renderTemplateList();if(selectedId)renderBuild();toast("Template deleted");
  },true);
}
function exportTemplates(){
  openItemExport({
    kind:"template",list:templates,fileName:"epub-templates.json",
    wrap:list=>({type:"epub-templates",version:1,templates:list}),
    describe:x=>({label:x.label,detail:`${x.size} · margin ${x.margin}`})
  });
}
function importTemplates(){
  readJsonFile(".json,application/json",data=>{
    const raw=Array.isArray(data)?data:data.templates;
    if(!Array.isArray(raw)||!raw.every(t=>t&&t.id&&t.label&&t.size&&t.margin&&typeof t.css==="string"))throw new Error("The file doesn't contain valid templates.");
    openItemImport({
      kind:"template",incoming:raw,existing:templates,
      keys:[["label","Name"],["size","Page size"],["margin","Margin"],["css","CSS"]],
      describe:x=>({label:x.label,detail:`${x.size} · margin ${x.margin}`}),
      apply:list=>{templates=list;saveTemplates();if(!templates.some(t=>t.id===currentTemplate))currentTemplate=templates[0].id;renderTemplateList();if(selectedId)renderBuild()}
    });
  });
}

/* ---------- Full backup ---------- */
const SETTINGS_KEYS=()=>[KEY,SUGGEST_KEY,PROMPT_KEY,TEMPLATES_KEY,THEME_KEY];
function idbDump(){
  return openDb().then(d=>new Promise((res,rej)=>{
    const t=d.transaction("files","readonly"),s=t.objectStore("files");
    const keys=s.getAllKeys(),vals=s.getAll();
    t.oncomplete=()=>res(keys.result.map((key,i)=>({key,value:vals.result[i]})));
    t.onerror=()=>rej(t.error);
  }));
}
function idbRestore(records){
  return openDb().then(d=>new Promise((res,rej)=>{
    const t=d.transaction("files","readwrite"),s=t.objectStore("files");
    s.clear();
    for(const r of records)s.put(r.value,r.key);
    t.oncomplete=()=>res();
    t.onerror=()=>rej(t.error);
  }));
}
async function createBackup(){
  const enc=new TextEncoder(),entries=[];
  const manifest={app:"epub-book-manager",version:1,createdAt:new Date().toISOString(),localStorage:{},idb:[]};
  for(const k of SETTINGS_KEYS()){const v=localStorage.getItem(k);if(v!==null)manifest.localStorage[k]=v}
  let n=0;
  for(const {key,value} of await idbDump()){
    if(value&&value.blob instanceof Blob){
      const file=`blobs/${String(++n).padStart(4,"0")}.bin`;
      entries.push({name:file,data:new Uint8Array(await value.blob.arrayBuffer())});
      manifest.idb.push({key,kind:"blob",file,fileName:value.name,type:value.type,size:value.size});
    }else{
      manifest.idb.push({key,kind:"json",value});
    }
  }
  entries.unshift({name:"manifest.json",data:enc.encode(JSON.stringify(manifest))});
  saveBlob(`epub-backup-${new Date().toISOString().slice(0,10)}.zip`,buildZip(entries));
  toast("Backup created");
}
async function restoreBackup(file){
  const files=await readZip(await file.arrayBuffer());
  const raw=files.get("manifest.json");
  if(!raw)throw new Error("This file is not a valid backup.");
  const manifest=JSON.parse(new TextDecoder().decode(raw));
  if(!["epub-book-manager","kdp-book-manager"].includes(manifest.app))throw new Error("This file is not a valid backup.");
  const records=manifest.idb.map(r=>r.kind==="blob"
    ?{key:r.key,value:{name:r.fileName,type:r.type,size:r.size,blob:new Blob([files.get(r.file)],{type:r.type})}}
    :{key:r.key,value:r.value});
  await idbRestore(records);
  for(const k of SETTINGS_KEYS())localStorage.removeItem(k);
  for(const [k,v] of Object.entries(manifest.localStorage||{}))localStorage.setItem(k,v);
  location.reload();
}
function openBackup(){
  openModal("Backup",`<div class="conflict">
    <p class="modal-text">A backup contains everything: books, chapters, cover and book files, prompts, suggestions and settings. Restoring one replaces all current data.</p>
    <div class="backup-actions"><button class="primary" id="makeBackup">Create backup</button><button class="secondary" id="restoreBackupBtn">Restore backup…</button></div>
  </div>`);
  $("makeBackup").onclick=async()=>{closeModal();await createBackup()};
  $("restoreBackupBtn").onclick=()=>{
    const inp=document.createElement("input");
    inp.type="file";inp.accept=".zip";
    inp.onchange=()=>{
      const f=inp.files[0];if(!f)return;
      closeModal();
      askConfirm("Restore backup","This replaces all current books, chapters, files, prompts and settings. Continue?","Restore",async()=>{
        try{await restoreBackup(f)}catch(err){showNotice("Restore failed",err.message||"The backup could not be read.")}
      },true);
    };
    inp.click();
  };
}

/* ---------- Import: duplicate detection ---------- */
async function readZipBooks(file){
  const files=await readZip(await file.arrayBuffer());
  const roots=[...files.keys()].filter(n=>n==="book.txt"||n.endsWith("/book.txt"));
  return roots.map(root=>{
    const dir=root.slice(0,root.length-"book.txt".length);
    const book=parseBookTxt(new TextDecoder().decode(files.get(root)));
    const chPrefix=`${dir}chapters/`;
    const chNames=[...files.keys()]
      .filter(n=>n.startsWith(chPrefix)&&!n.slice(chPrefix.length).includes("/"))
      .sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const chapters=chNames.map(n=>({id:uid(),name:n.slice(chPrefix.length).replace(/^\d+-/,""),md:new TextDecoder().decode(files.get(n))}));
    const attachments={};
    for(const kind of ["book","cover"]){
      const prefix=`${dir}files/${kind}/`;
      const hit=[...files.keys()].find(n=>n.startsWith(prefix)&&!n.slice(prefix.length).includes("/"));
      if(hit){const name=hit.split("/").pop(),data=files.get(hit);attachments[kind]={name,type:mimeOf(name),size:data.length,data}}
    }
    return {book,chapters,attachments};
  });
}
async function commitBook(c){
  const b=c.book;
  books=books.filter(x=>x.id!==b.id);
  books.unshift(b);
  rememberValues(b);
  if(c.chapters)await setChapters(b.id,c.chapters);
  for(const kind of ["book","cover"]){
    const a=c.attachments&&c.attachments[kind];
    if(a)await putFile(`${b.id}:${kind}`,{name:a.name,type:a.type,size:a.size,blob:new Blob([a.data],{type:a.type})});
  }
}
function bookDiffs(cur,curCh,inc,incCh){
  const diffs=[];
  const fields={title:"Title",author:"Author",niche:"Niche",type:"Type",reader:"Target reader",price:"Price",language:"Language",status:"Status",archiveReason:"Archive reason"};
  for(const k in fields)if(String(cur[k]??"")!==String(inc[k]??""))diffs.push(fields[k]);
  for(const [k,label] of PUB_FIELDS)if(String(cur.publishing?.[k]??"")!==String(inc.publishing?.[k]??""))diffs.push(label);
  for(const k of new Set([...Object.keys(cur.steps||{}),...Object.keys(inc.steps||{})]))
    if(String(cur.steps?.[k]??"")!==String(inc.steps?.[k]??""))diffs.push(`Step ${k}`);
  if(incCh){
    const a=curCh.map(c=>c.name+"\n"+c.md).join("\u0001"),b=incCh.map(c=>c.name+"\n"+c.md).join("\u0001");
    if(a!==b)diffs.push("Chapters");
  }
  return diffs;
}
function bookSummary(b,chCount){
  return `<strong>${esc(b.title)}</strong>
    <ul class="conflict-meta"><li>${esc(b.author||"No author")} · ${esc(b.status)}</li><li>Last edited: ${esc(fmtDate(b.updated))}</li><li>Chapters: ${chCount}</li></ul>`;
}
function askImportConflict(cur,curCh,c){
  return new Promise(resolve=>{
    const incCh=c.chapters;
    const diffs=bookDiffs(cur,curCh,c.book,incCh);
    const incCount=incCh?incCh.length:"kept from current";
    openModal("Duplicate book",`<div class="conflict">
      <p class="modal-text">A book with the same ID already exists. Which version do you want to keep?</p>
      <div class="conflict-grid">
        <div class="conflict-card"><h4>Current</h4>${bookSummary(cur,curCh.length)}<button class="secondary" id="keepCurrent">Keep current</button></div>
        <div class="conflict-card"><h4>Imported</h4>${bookSummary(c.book,incCount)}<button class="primary" id="useImported">Use imported</button></div>
      </div>
      <p class="modal-text"><strong>Differences:</strong> ${diffs.length?esc(diffs.join(", ")):"none, only the edit date differs"}</p>
    </div>`);
    let done=false;
    const finish=v=>{if(done)return;done=true;modalOnClose=null;closeModal();resolve(v)};
    $("keepCurrent").onclick=()=>finish("current");
    $("useImported").onclick=()=>finish("imported");
    modalOnClose=()=>finish("current");
  });
}
function sameBook(cur,curCh,c){
  return cur.updated===c.book.updated&&bookDiffs(cur,curCh,c.book,c.chapters).length===0;
}
async function importCandidates(candidates){
  let imported=0;
  for(const c of candidates){
    const cur=books.find(x=>x.id===c.book.id);
    if(cur){
      const curCh=await getChapters(cur.id);
      if(sameBook(cur,curCh,c))continue;
      const choice=await askImportConflict(cur,curCh,c);
      if(choice!=="imported")continue;
    }
    await commitBook(c);
    imported++;
  }
  return imported;
}
$("importInput").onchange=async e=>{
  const files=[...e.target.files];
  e.target.value="";
  let candidates=[];
  try{
    for(const f of files){
      if(/\.zip$/i.test(f.name))candidates.push(...await readZipBooks(f));
      else{
        const t=await f.text();
        if(f.name==="book.txt"||(t.startsWith("EPUB BOOK MANAGER")||t.startsWith("KDP BOOK MANAGER")))candidates.push({book:parseBookTxt(t),chapters:null,attachments:null});
      }
    }
  }catch(err){
    return showNotice("Import failed",err.message||"The file could not be imported.");
  }
  if(!candidates.length)return showNotice("Nothing to import","No books were found in the selected files.");
  const items=[];
  for(const [i,c] of candidates.entries()){
    const cur=books.find(x=>x.id===c.book.id);
    const curCh=cur?await getChapters(cur.id):[];
    const same=!!cur&&sameBook(cur,curCh,c);
    const meta=`${c.book.author||"No author"} · ${c.book.status} · edited ${fmtDate(c.book.updated)}`;
    items.push({
      id:String(i),title:c.book.title,
      meta:same?`${meta} · identical to the one in your library`:meta,
      checked:!same,
      warn:cur&&!same?"A book with this ID already exists in your library":null
    });
  }
  openBookPicker({
    title:"Import books",
    intro:"These books were found in the selected files. Choose which ones to import. Books marked ⚠ already exist in your library, and you'll be asked which version to keep.",
    items,confirmLabel:"Import",
    onConfirm:async ids=>{
      const imported=await importCandidates(ids.map(i=>candidates[Number(i)]));
      saveSuggestions();
      persist();
      await refreshCovers();
      if(books[0])openBook(books[0].id);
      toast(imported?`Imported ${imported} book${imported===1?"":"s"}`:"Nothing imported");
    }
  });
};

/* ---------- Cover thumbnails in the list ---------- */
/* Miniatura de portada: 128x205, recorte centrado que cubre todo el marco. El original no se toca. */
const THUMB_W=128,THUMB_H=205;
async function makeThumb(blob){
  const img=await createImageBitmap(blob);
  const c=document.createElement("canvas");c.width=THUMB_W;c.height=THUMB_H;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,THUMB_W,THUMB_H);
  const k=Math.max(THUMB_W/img.width,THUMB_H/img.height),w=img.width*k,h=img.height*k;
  ctx.imageSmoothingQuality="high";
  ctx.drawImage(img,(THUMB_W-w)/2,(THUMB_H-h)/2,w,h);
  img.close?.();
  return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Thumbnail encoding failed")),"image/jpeg",0.9));
}
async function saveThumb(id,blob){
  try{
    const t=await makeThumb(blob);
    await putFile(`${id}:thumb`,{name:"thumb.jpg",type:"image/jpeg",size:t.size,blob:t});
    return true;
  }catch(e){console.error("Could not create cover thumbnail:",e);return false}
}
const coverUrls=new Map();
async function refreshCovers(){
  for(const url of coverUrls.values())URL.revokeObjectURL(url);
  coverUrls.clear();
  const keys=await fileOp("readonly",s=>s.getAllKeys());
  for(const key of keys.filter(k=>String(k).endsWith(":cover"))){
    const id=String(key).slice(0,-6);
    let rec=await getFile(`${id}:thumb`);
    if(!rec){ // libros anteriores a las miniaturas: se generan una sola vez
      const orig=await getFile(key);
      if(orig&&await saveThumb(id,orig.blob))rec=await getFile(`${id}:thumb`);
    }
    if(!rec)rec=await getFile(key); // si no se puede generar, se usa el original
    if(rec)coverUrls.set(id,URL.createObjectURL(rec.blob));
  }
  renderList();
}

/* ---------- Build tab: chapters, preview and generation ---------- */
const EPUB_CSS=`body{font-family:Georgia,serif;line-height:1.55;margin:5%}h1,h2,h3{font-family:Helvetica,Arial,sans-serif;line-height:1.2}h1{margin-top:1.2em}img{max-width:100%}.cover{text-align:center;margin:0;padding:0}.cover img{max-height:100%}.title-page{text-align:center;margin-top:30%}.author{font-style:italic}blockquote{margin:1em 2em;font-style:italic}pre{white-space:pre-wrap;font-size:.9em}ol,ul{padding-left:1.4em}table{border-collapse:collapse;margin:0 0 1em;width:auto;max-width:100%}th,td{border:1px solid #d6d6d0;padding:6px 10px;text-align:left;vertical-align:top}th{background:#f1f1ee;font-weight:600}.table-wrap{overflow-x:auto;max-width:100%}`;
const BASE_CSS=`body{margin:0;color:#222;background:#fdfdfb;line-height:1.6}img{max-width:100%}pre{white-space:pre-wrap;background:#f1f1ee;padding:12px;border-radius:6px}code{font-size:.9em}blockquote{margin:1em 2em;font-style:italic;color:#444}section{padding-top:20px;margin-top:28px;border-top:1px solid #e5e5e0}.title-page{text-align:center;padding:40px 0;border:0;margin:0}.title-page .cover{max-width:260px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.25);margin-bottom:28px}.author{font-style:italic;color:#666}@media screen{body{max-width:680px;margin:0 auto;padding:24px}}@media print{body{background:#fff}section{border:0;margin:0;padding-top:0}.title-page{break-after:page;padding:30% 0 0}section.chapter{break-before:page}}table{border-collapse:collapse;margin:0 0 1em;width:auto;max-width:100%}th,td{border:1px solid #d6d6d0;padding:6px 10px;text-align:left;vertical-align:top}th{background:#f1f1ee;font-weight:600}.table-wrap{overflow-x:auto;max-width:100%}`;
const TEMPLATES_KEY="epub-templates-v1";
const DEFAULT_TEMPLATES=[
  {id:"classic",label:"Classic",size:"A5",margin:"18mm 16mm",css:`body{font-family:Georgia,"Times New Roman",serif}h1,h2,h3{font-family:Georgia,serif;text-align:center}`},
  {id:"modern",label:"Modern",size:"A4",margin:"20mm 18mm",css:`body{font-family:Helvetica,Arial,sans-serif}h1{color:#3b67f2;border-bottom:3px solid #3b67f2;padding-bottom:.2em}h2,h3{color:#222}.author{color:#3b67f2;font-style:normal}`},
  {id:"minimal",label:"Minimal",size:"A5",margin:"25mm 22mm",css:`body{font-family:"Times New Roman",serif;font-size:1.05em}h1,h2,h3{font-weight:normal;letter-spacing:.02em}section{border:0}`}
];
function loadTemplates(){
  try{const t=JSON.parse(localStorage.getItem(TEMPLATES_KEY)||"null");if(Array.isArray(t)&&t.length)return t}catch{}
  return JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
}
function saveTemplates(){localStorage.setItem(TEMPLATES_KEY,JSON.stringify(templates))}
let templates=loadTemplates();
function tplById(id){return templates.find(t=>t.id===id)||templates[0]}
let currentTemplate="classic";
let currentFormat="epub";

function xmlEsc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[m]))}
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function pad(n){return String(n).padStart(2,"0")}
function anchorOf(t){return t.toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-")}
function splitList(s){return String(s||"").split(/[\n,]/).map(x=>x.trim()).filter(Boolean)}
function chapterTitle(c){const h=c.md.match(/^#\s+(.+)$/m);return h?h[1].trim():c.name.replace(/\.(md|txt)$/i,"").replace(/[-_]+/g," ")}
function withH1(md,title){const first=md.trimStart().split("\n")[0];return /^#\s+/.test(first)?md:`# ${title}\n\n${md}`}

/* Markdown -> HTML (subset sufficient for books) */
function inline(s){
  const codes=[];
  let x=esc(s).replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return `\u0000${codes.length-1}\u0000`});
  x=x.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>');
  x=x.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g,"$1<em>$2</em>");
  return x.replace(/\u0000(\d+)\u0000/g,(_,i)=>`<code>${esc(codes[i])}</code>`);
}
const COPY_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
function mdToHtml(md,opts={}){
  const lines=md.replace(/\r\n/g,"\n").split("\n");const out=[];let i=0;
  const LIST=/^\s*([-*+]|\d+\.)\s+/, BLOCK=/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s|(\*\*\*|---|___)\s*$)/;
  while(i<lines.length){
    const l=lines[i];let m;
    if(/^```/.test(l)){
      const code=[];i++;
      while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);
      i++;out.push(opts.copy?`<div class="code-block"><button type="button" class="code-copy" title="Copy code" aria-label="Copy code">${COPY_ICON}</button><pre><code>${esc(code.join("\n"))}</code></pre></div>`:`<pre><code>${esc(code.join("\n"))}</code></pre>`);continue;
    }
    if(!l.trim()){i++;continue}
    if((m=l.match(/^(#{1,6})\s+(.*)$/))){out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);i++;continue}
    if(/^(\*\*\*|---|___)\s*$/.test(l)){out.push("<hr/>");i++;continue}
    if(/^>\s?/.test(l)){
      const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,""));
      out.push(`<blockquote>${mdToHtml(q.join("\n"),opts)}</blockquote>`);continue;
    }
    if(LIST.test(l)){
      const ordered=/^\s*\d+\./.test(l),items=[];
      while(i<lines.length&&LIST.test(lines[i]))items.push(lines[i++].replace(LIST,""));
      const tag=ordered?"ol":"ul";
      out.push(`<${tag}>${items.map(t=>`<li>${inline(t)}</li>`).join("")}</${tag}>`);continue;
    }
    if(l.includes("|")&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(lines[i+1])){
      const cells=r=>r.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(c=>c.trim());
      const aligns=cells(lines[i+1]).map(c=>c.startsWith(":")&&c.endsWith(":")?"center":c.endsWith(":")?"right":c.startsWith(":")?"left":"");
      const style=k=>aligns[k]?` style="text-align:${aligns[k]}"`:"";
      const heads=cells(l);i+=2;
      const rows=[];
      while(i<lines.length&&lines[i].trim()&&lines[i].includes("|"))rows.push(cells(lines[i++]));
      out.push(`<div class="table-wrap"><table><thead><tr>${heads.map((c,k)=>`<th${style(k)}>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,k)=>`<td${style(k)}>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const para=[];
    while(i<lines.length&&lines[i].trim()&&!BLOCK.test(lines[i]))para.push(lines[i++]);
    if(!para.length){i++;continue}
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}
function plain(md){
  return md.replace(/^#{1,6}\s+/gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1")
    .replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/^>\s?/gm,"")
    .replace(/^(\s*)[*+]\s+/gm,"$1- ").replace(/^\s*(\*\*\*|---|___)\s*$/gm,"* * *");
}

/* Links the front matter index entries to their chapter */
function linkIndex(md,titles,hrefOf){
  if(!md)return md;
  const order=titles.map((t,i)=>({t:t.trim(),i})).filter(x=>x.t).sort((a,b)=>b.t.length-a.t.length);
  return md.split("\n").map(line=>{
    if(/\]\(/.test(line))return line;
    for(const {t,i} of order){
      const re=new RegExp(`(?<![\\w])${escRe(t)}(?![\\w])`,"i");
      if(re.test(line))return line.replace(re,m=>`[${m}](${hrefOf(i)})`);
    }
    return line;
  }).join("\n");
}
function buildParts(m,target){
  const titles=m.chapters.map(chapterTitle);
  const hrefOf=target==="epub"?i=>`chapter-${pad(i+1)}.xhtml`:target==="md"?i=>`#${anchorOf(titles[i])}`:i=>`#ch-${i+1}`;
  const fm=target==="txt"?m.pub.frontMatter:linkIndex(m.pub.frontMatter,titles,hrefOf);
  return{
    titles,fm,bm:m.pub.backMatter,back:m.pub.backText,
    chapters:m.chapters.map((c,i)=>({title:titles[i],md:withH1(c.md,titles[i])}))
  };
}

/* Data for generation: saved metadata, chapters and cover */
async function buildModel(b){
  const [chapters,cover]=await Promise.all([getChapters(b.id),getFile(`${b.id}:cover`)]);
  return{title:b.title,author:b.author,lang:b.language||"en-US",pub:b.publishing||blankPublishing(),chapters,cover,id:b.id};
}

/* Output formats */
function buildMarkdown(m){
  const p=buildParts(m,"md");
  const parts=[`# ${m.title}`];
  if(m.author)parts.push(`**${m.author}**`);
  if(p.fm)parts.push(p.fm.trim());
  parts.push(...p.chapters.map(c=>c.md.trim()));
  if(p.bm)parts.push(p.bm.trim());
  if(p.back)parts.push(`## About this book\n\n${p.back.trim()}`);
  return parts.join("\n\n---\n\n")+"\n";
}
function buildTxt(m){
  const p=buildParts(m,"txt");
  const parts=[m.title];
  if(m.author)parts.push(m.author);
  if(p.fm)parts.push(plain(p.fm));
  parts.push(...p.chapters.map(c=>plain(c.md)));
  if(p.bm)parts.push(plain(p.bm));
  if(p.back)parts.push("About this book\n\n"+plain(p.back));
  return parts.join("\n\n* * *\n\n")+"\n";
}
function buildDocument(m,coverUrl,tpl,mode){
  const t=tplById(tpl);
  const p=buildParts(m,"html");
  const print=mode==="print";
  const printCss=print?`@page{size:${t.size};margin:${t.margin}}
@page cover{size:${t.size};margin:0}
.cover-page{page:cover;break-after:page;margin:0;padding:0;border:0;height:100vh}
.cover-page img{display:block;width:100%;height:100vh;object-fit:cover}
.cover-page.no-cover{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 12mm}
.cover-page.no-cover h1{border:0;padding:0;margin:0 0 .3em;font-size:2.8em}
.cover-page.no-cover .author{font-size:1.3em}`:"";
  const titlePage=print
    ? (coverUrl
        ? `<section class="cover-page"><img src="${coverUrl}" alt=""></section>`
        : `<section class="cover-page no-cover"><h1>${esc(m.title)}</h1><p class="author">${esc(m.author)}</p></section>`)
    : `<section class="title-page">${coverUrl?`<img class="cover" src="${coverUrl}" alt="">`:""}<h1>${esc(m.title)}</h1><p class="author">${esc(m.author)}</p></section>`;
  return `<!DOCTYPE html><html lang="${esc(m.lang)}"><head><meta charset="utf-8"><title>${esc(m.title)}</title><style>${BASE_CSS}${t.css}${printCss}</style></head><body>
${titlePage}
${p.fm?`<section class="front">${mdToHtml(p.fm)}</section>`:""}
${p.chapters.map((c,i)=>`<section id="ch-${i+1}" class="chapter">${mdToHtml(c.md)}</section>`).join("")}
${p.bm?`<section class="back">${mdToHtml(p.bm)}</section>`:""}
${p.back?`<section class="back-cover"><h2>About this book</h2>${mdToHtml(p.back)}</section>`:""}
</body></html>`;
}
function buildHtmlPreview(m,coverUrl,tpl){return buildDocument(m,coverUrl,tpl,"screen")}
function printPdf(m,tpl){
  const coverUrl=m.cover?URL.createObjectURL(m.cover.blob):null;
  const frame=document.createElement("iframe");
  frame.style.cssText="position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0";
  frame.onload=()=>{
    const w=frame.contentWindow;
    w.focus();w.print();
    setTimeout(()=>{frame.remove();if(coverUrl)URL.revokeObjectURL(coverUrl)},1500);
  };
  frame.srcdoc=buildDocument(m,coverUrl,tpl,"print");
  document.body.appendChild(frame);
}
function xhtml(title,body,lang){
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}"><head><meta charset="UTF-8"/><title>${xmlEsc(title)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head><body>${body}</body></html>`;
}
async function buildEpub(m){
  const enc=new TextEncoder(),p=buildParts(m,"epub"),uuid=crypto.randomUUID?crypto.randomUUID():uid();
  const pages=[],images=[];
  pages.push({id:"title",href:"title.xhtml",title:m.title,noNav:true,body:`<section class="title-page"><h1>${xmlEsc(m.title)}</h1><p class="author">${xmlEsc(m.author)}</p></section>`});
  if(m.cover){
    const ext=(m.cover.name.split(".").pop()||"jpg").toLowerCase().replace("jpeg","jpg");
    images.push({href:`images/cover.${ext}`,type:mimeOf(m.cover.name),data:new Uint8Array(await m.cover.blob.arrayBuffer())});
    pages.unshift({id:"cover",href:"cover.xhtml",title:"Cover",noNav:true,body:`<section class="cover"><img src="images/cover.${ext}" alt="${xmlEsc(m.title)}"/></section>`});
  }
  if(p.fm)pages.push({id:"front",href:"front.xhtml",title:"Front matter",body:`<section>${mdToHtml(p.fm)}</section>`});
  p.chapters.forEach((c,i)=>pages.push({id:`ch${i+1}`,href:`chapter-${pad(i+1)}.xhtml`,title:c.title,body:`<section id="ch-${i+1}" epub:type="chapter">${mdToHtml(c.md)}</section>`}));
  if(p.bm)pages.push({id:"back",href:"back.xhtml",title:"Back matter",body:`<section>${mdToHtml(p.bm)}</section>`});
  if(p.back)pages.push({id:"about",href:"about.xhtml",title:"About this book",body:`<section>${mdToHtml(p.back)}</section>`});

  const navPages=pages.filter(pg=>!pg.noNav);
  const navXhtml=xhtml("Contents",`<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${navPages.map(pg=>`<li><a href="${pg.href}">${xmlEsc(pg.title)}</a></li>`).join("")}</ol></nav>`,m.lang);
  const ncx=`<?xml version="1.0" encoding="UTF-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:uuid:${uuid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${xmlEsc(m.title)}</text></docTitle><navMap>${navPages.map((pg,i)=>`<navPoint id="np-${i+1}" playOrder="${i+1}"><navLabel><text>${xmlEsc(pg.title)}</text></navLabel><content src="${pg.href}"/></navPoint>`).join("")}</navMap></ncx>`;

  const subjects=[...new Set([...splitList(m.pub.tags),...splitList(m.pub.categories)])];
  const desc=plain(m.pub.description||"").trim();
  const now=new Date().toISOString().replace(/\.\d{3}Z$/,"Z");
  const opf=`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${xmlEsc(m.lang)}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
<dc:title>${xmlEsc(m.title)}</dc:title>
<dc:creator>${xmlEsc(m.author)}</dc:creator>
<dc:language>${xmlEsc(m.lang)}</dc:language>
${desc?`<dc:description>${xmlEsc(desc)}</dc:description>`:""}
${subjects.map(s=>`<dc:subject>${xmlEsc(s)}</dc:subject>`).join("\n")}
<meta property="dcterms:modified">${now}</meta>
${images.length?'<meta name="cover" content="cover-img"/>':""}
</metadata>
<manifest>
${pages.map(pg=>`<item id="${pg.id}" href="${pg.href}" media-type="application/xhtml+xml"/>`).join("\n")}
${images.map(im=>`<item id="cover-img" href="${im.href}" media-type="${im.type}" properties="cover-image"/>`).join("\n")}
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="css" href="styles.css" media-type="text/css"/>
</manifest>
<spine toc="ncx">
${pages.map(pg=>`<itemref idref="${pg.id}"/>`).join("\n")}
</spine>
</package>`;
  const container=`<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;

  const entries=[
    {name:"mimetype",data:enc.encode("application/epub+zip")},
    {name:"META-INF/container.xml",data:enc.encode(container)},
    {name:"OEBPS/content.opf",data:enc.encode(opf)},
    {name:"OEBPS/nav.xhtml",data:enc.encode(navXhtml)},
    {name:"OEBPS/toc.ncx",data:enc.encode(ncx)},
    {name:"OEBPS/styles.css",data:enc.encode(EPUB_CSS)},
    ...pages.map(pg=>({name:"OEBPS/"+pg.href,data:enc.encode(xhtml(pg.title,pg.body,m.lang))})),
    ...images.map(im=>({name:"OEBPS/"+im.href,data:im.data}))
  ];
  return new Blob([buildZip(entries)],{type:"application/epub+zip"});
}

/* Tab interface */
async function getChapters(id){return (await getFile(`${id}:chapters`))||[]}
async function setChapters(id,list){await putFile(`${id}:chapters`,list)}
function byName(a,b){return a.name.localeCompare(b.name,undefined,{numeric:true})}
let previewUrl=null;
function fitTab(id){
  const el=$(id);
  if(el.classList.contains("hidden"))return;
  const top=el.getBoundingClientRect().top+window.scrollY;
  el.style.height=Math.max(420,window.innerHeight-top-24)+"px";
}
window.addEventListener("resize",()=>fitTab("buildTab"));
async function renderBuild(){
  const id=selectedId;if(!id)return;
  currentTemplate=tplById(currentTemplate).id;
  const b=selected();
  const m=await buildModel(b);
  if(selectedId!==id)return;
  if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}
  previewUrl=m.cover?URL.createObjectURL(m.cover.blob):null;
  const count=m.chapters.length;
  $("chaptersTab").innerHTML=`
  <div class="card chapters-card">
    <div class="card-head"><h3>Chapters</h3><div class="card-actions">
      <button class="secondary" onclick="$('chaptersInput').click()">Upload .md / .txt</button>
      <button class="secondary" onclick="openChapterEditor()">New chapter</button>
      <button class="secondary" onclick="sortChapters()" ${count<2?"disabled":""}>Sort by name</button>
    </div></div>
    <input type="file" id="chaptersInput" accept=".md,.txt" multiple hidden onchange="uploadChapters(this)">
    ${count?`<ol class="chapter-list">${m.chapters.map((c,i)=>`<li class="chapter-item" draggable="true" ondragstart="chapterDragStart(event,${i})" ondragover="chapterDragOver(event)" ondrop="chapterDrop(event,${i})" ondragend="chapterDragEnd()"><span class="grip" title="Arrastra para reordenar">⋮⋮</span><span class="chapter-num">${i+1}</span><div class="chapter-info"><strong>${esc(chapterTitle(c))}</strong><span class="muted">${esc(c.name)}</span></div><div class="chapter-actions"><button class="icon-btn" onclick="openChapterEditor('${c.id}')" title="Edit">✎</button><button class="icon-btn" onclick="moveChapter(${i},-1)" ${i===0?"disabled":""} title="Move up">▲</button><button class="icon-btn" onclick="moveChapter(${i},1)" ${i===count-1?"disabled":""} title="Move down">▼</button><button class="icon-btn danger-icon" onclick="removeChapter(${i})" title="Remove">×</button></div></li>`).join("")}</ol>`:`<p class="muted">No chapters yet. Upload .md or .txt files, or create one. They're added in file-name order, and you can reorder them here.</p>`}
  </div>`;
  $("buildTab").innerHTML=`
  <div class="card build-card">
    <div class="card-head"><select id="contentsSelect" class="contents-select" onchange="jumpToChapter(this.value)" ${count?"":"disabled"}><option value="">Contents</option>${m.chapters.map((c,i)=>`<option value="ch-${i+1}">${esc(chapterTitle(c))}</option>`).join("")}</select><div class="build-controls"><div class="segmented format-group">${["epub","md","txt","pdf"].map(f=>`<button class="${currentFormat===f?"active":""}" onclick="setFormat('${f}')">${f}</button>`).join("")}</div>${`<select id="templateSelect" class="contents-select template-select" onchange="currentTemplate=this.value;renderBuild()" title="Template">${templates.map(t=>`<option value="${t.id}" ${t.id===currentTemplate?"selected":""}>${esc(t.label)}</option>`).join("")}</select>`}<button class="primary" onclick="exportBuild(currentFormat)">Generate</button></div></div>
    <div class="build-preview" id="previewBox"></div>
  </div>`;
  const box=$("previewBox");
  if(!count){
    box.innerHTML='<p class="muted preview-empty">Add chapters to see the preview.</p>';
  }else{
    const frame=document.createElement("iframe");
    frame.title="Preview";
    frame.srcdoc=buildHtmlPreview(m,previewUrl,currentTemplate);
    box.appendChild(frame);
  }
  fitTab("buildTab");
}
async function uploadChapters(input){
  const id=selectedId,files=[...input.files].filter(f=>/\.(md|txt)$/i.test(f.name));
  input.value="";
  if(!id)return;
  if(!files.length)return showNotice("Unsupported files","Only .md and .txt files can be used as chapters.");
  files.sort(byName);
  const list=await getChapters(id);
  for(const f of files)list.push({id:uid(),name:f.name,md:await f.text()});
  await setChapters(id,list);
  renderBuild();
  toast(`${files.length} chapter${files.length===1?"":"s"} added`);
}
async function sortChapters(){const id=selectedId,list=await getChapters(id);list.sort(byName);await setChapters(id,list);renderBuild()}
async function moveChapter(i,d){
  const id=selectedId,list=await getChapters(id),j=i+d;
  if(j<0||j>=list.length)return;
  [list[i],list[j]]=[list[j],list[i]];
  await setChapters(id,list);renderBuild();
}
function removeChapter(i){
  askConfirm("Remove chapter","Remove this chapter from the book?","Remove",async()=>{
    const id=selectedId,list=await getChapters(id);
    list.splice(i,1);
    await setChapters(id,list);renderBuild();toast("Chapter removed");
  },true);
}
async function exportBuild(fmt){
  const b=selected();if(!b)return;
  const m=await buildModel(b);
  if(!m.chapters.length)return showNotice("No chapters","Upload at least one .md or .txt file first.");
  if(fmt==="epub")saveBlob(`${fileSafe(b.title)}.epub`,await buildEpub(m));
  else if(fmt==="md")saveBlob(`${fileSafe(b.title)}.md`,new Blob([buildMarkdown(m)],{type:"text/markdown;charset=utf-8"}));
  else if(fmt==="pdf"){printPdf(m,currentTemplate);return}
  else saveBlob(`${fileSafe(b.title)}.txt`,new Blob([buildTxt(m)],{type:"text/plain;charset=utf-8"}));
  toast(`${fmt.toUpperCase()} generated`);
}

function syncArchiveField(){$("archiveField").classList.toggle("hidden",$("statusInput").value!==ARCHIVED)}

/* ---------- Sort chapters by drag and drop ---------- */
let dragFrom=null;
function chapterDragStart(e,i){
  dragFrom=i;
  e.dataTransfer.effectAllowed="move";
  e.dataTransfer.setData("text/plain",String(i));
  e.currentTarget.classList.add("dragging");
}
function chapterDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect="move";
  document.querySelectorAll(".chapter-item.drop-target").forEach(el=>el.classList.remove("drop-target"));
  e.currentTarget.classList.add("drop-target");
}
function chapterDragEnd(){
  document.querySelectorAll(".chapter-item").forEach(el=>el.classList.remove("dragging","drop-target"));
  dragFrom=null;
}
async function chapterDrop(e,i){
  e.preventDefault();
  const from=dragFrom;dragFrom=null;
  if(from===null||from===i)return chapterDragEnd();
  const id=selectedId,list=await getChapters(id);
  const [moved]=list.splice(from,1);
  list.splice(i,0,moved);
  await setChapters(id,list);
  renderBuild();
}

/* ---------- Create and edit chapters ---------- */
async function openChapterEditor(chapterId){
  const id=selectedId;if(!id)return;
  const list=await getChapters(id);
  const c=chapterId?list.find(x=>x.id===chapterId):{md:""};
  if(!c)return;
  openModal(chapterId?"Edit chapter":"New chapter",`<div class="chapter-editor">
    <div class="editor-bar"><div class="segmented"><button data-view="code" class="active">Code</button><button data-view="preview">Preview</button></div></div>
    <textarea id="chapterMd" class="md-code" spellcheck="false"></textarea>
    <div id="chapterPreview" class="md-preview hidden"></div>
    <div class="confirm-actions"><button class="secondary" id="cancelChapter">Cancel</button><button class="primary" id="saveChapter">Save chapter</button></div>
  </div>`);
  $("chapterMd").value=c.md;
  document.querySelectorAll("[data-view]").forEach(btn=>btn.onclick=()=>setChapterView(btn.dataset.view));
  $("cancelChapter").onclick=closeModal;
  $("saveChapter").onclick=()=>saveChapterEdit(chapterId||null);
}
function setChapterView(view){
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("chapterMd").classList.toggle("hidden",view!=="code");
  $("chapterPreview").classList.toggle("hidden",view!=="preview");
  if(view==="preview")$("chapterPreview").innerHTML=mdToHtml($("chapterMd").value,{copy:true});
}
async function saveChapterEdit(chapterId){
  const id=selectedId,md=$("chapterMd").value;
  const list=await getChapters(id);
  if(chapterId){
    const c=list.find(x=>x.id===chapterId);
    if(c)c.md=md;
  }else{
    const title=(md.match(/^#\s+(.+)$/m)||[])[1]||`chapter ${list.length+1}`;
    list.push({id:uid(),name:`${anchorOf(title)||"chapter"}.md`,md});
  }
  await setChapters(id,list);
  closeModal();
  renderBuild();
  toast("Chapter saved");
}

function setFormat(f){currentFormat=f;renderBuild()}
function jumpToChapter(anchor){
  const frame=document.querySelector("#buildTab .build-preview iframe");
  if(!frame||!anchor)return;
  const target=frame.contentDocument&&frame.contentDocument.getElementById(anchor);
  if(target)target.scrollIntoView({block:"start"});
}

/* ---------- Event wiring ---------- */
$("newBookBtn").onclick=newBook;
$("emptyNewBtn").onclick=newBook;
$("saveBtn").onclick=()=>saveCurrent();
$("deleteBtn").onclick=()=>{
  const b=selected();if(!b)return;
  askConfirm("Delete book",`Delete "${b.title}"? This can't be undone.`,"Delete",async()=>{
    await delFile(`${b.id}:book`);
    await delFile(`${b.id}:cover`);
    await delFile(`${b.id}:thumb`);
    await delFile(`${b.id}:chapters`);
    books=books.filter(x=>x.id!==b.id);
    persist();showEmpty();await refreshCovers();toast("Book deleted");
  },true);
};
const searchEl=$("searchInput");
searchEl.addEventListener("input",()=>{searchEl.parentElement.classList.toggle("has-value",!!searchEl.value);renderList()});
$("searchClear").onclick=()=>{searchEl.value="";searchEl.parentElement.classList.remove("has-value");renderList();searchEl.focus()};
$("statusFilter").onchange=renderList;
$("statusInput").onchange=()=>{syncArchiveField();saveCurrent(true)};
$("closeModal").onclick=closeModal;
$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("exportBookBtn").onclick=exportBook;
$("exportAllBtn").onclick=openExportPicker;
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setTab(t.dataset.tab));

/* ---------- Theme (day / night / system) ---------- */
const THEME_KEY="epub-theme";
const systemDark=window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const pref=localStorage.getItem(THEME_KEY)||"system";
  const resolved=pref==="system"?(systemDark.matches?"dark":"light"):pref;
  document.documentElement.dataset.theme=resolved;
  document.querySelectorAll("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===pref));
}
function setTheme(pref){localStorage.setItem(THEME_KEY,pref);applyTheme()}
systemDark.addEventListener("change",applyTheme);

/* ---------- Sidebar menu ---------- */
$("menuBtn").onclick=e=>{e.stopPropagation();$("appMenu").classList.toggle("hidden")};
document.addEventListener("click",e=>{if(!e.target.closest(".menu-wrap"))$("appMenu").classList.add("hidden")});
$("appMenu").addEventListener("click",e=>{
  const choice=e.target.closest("[data-theme-choice]");
  if(choice){setTheme(choice.dataset.themeChoice);return}
  if(e.target.closest(".menu-item"))$("appMenu").classList.add("hidden");
});
$("importBtn").onclick=()=>$("importInput").click();
$("promptsBtn").onclick=openPromptConfig;
$("templatesBtn").onclick=openTemplateConfig;
$("backupBtn").onclick=openBackup;

/* ---------- Install app (PWA) ---------- */
let deferredInstall=null;
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e});
window.addEventListener("appinstalled",()=>{deferredInstall=null;$("installBtn").classList.add("hidden");toast("App installed")});
async function installApp(){
  if(isStandalone())return showNotice("Already installed","ePub Book Manager is already running as an app.");
  if(deferredInstall){
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall=null;
    return;
  }
  if(location.protocol==="file:")return showNotice("Install app","To install the app, open it from its website (https://epub-book-manager.netlify.app) or from localhost.");
  if(/iphone|ipad|ipod/i.test(navigator.userAgent))return showNotice("Install app","Tap the Share button in Safari, then choose \"Add to Home Screen\".");
  showNotice("Install app","Use the install icon in the address bar, or the browser menu, and choose \"Install ePub Book Manager\".");
}
$("installBtn").onclick=installApp;
if(isStandalone())$("installBtn").classList.add("hidden");

document.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if(!$("modal").classList.contains("hidden"))closeModal();
  $("appMenu").classList.add("hidden");
});
document.addEventListener("click",async e=>{
  const btn=e.target.closest(".code-copy");if(!btn)return;
  const text=btn.parentElement.querySelector("code").textContent;
  let ok=false;
  try{await navigator.clipboard.writeText(text);ok=true}catch{
    const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";
    document.body.appendChild(ta);ta.select();ok=document.execCommand("copy");ta.remove();
  }
  if(!ok){toast("Could not copy the code");return}
  btn.classList.add("copied");btn.innerHTML=CHECK_ICON;
  setTimeout(()=>{btn.classList.remove("copied");btn.innerHTML=COPY_ICON},1400);
  toast("Code copied");
});
applyTheme();
populate();
setupCombos();
renderList();
if(books.length)openBook(books[0].id);else showEmpty();
refreshCovers();
