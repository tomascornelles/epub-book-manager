const KEY="kdp-book-manager-v2";
const SUGGEST_KEY="kdp-book-manager-suggestions";
const DB_NAME="kdp-book-manager-files";
const WIP="✏️ WIP",ARCHIVED="📁 Archived";
const STATUSES=[WIP,"📗 Ready for KDP","⏳ Waiting KDP","🚀 Published",ARCHIVED];
const LEGACY_STATUS={"Idea":WIP,"Research":WIP,"Outline":WIP,"Writing":WIP,"Editing":WIP,"Formatting":WIP,"Paused":ARCHIVED,"Blocked":ARCHIVED};
function normalizeStatus(s){
  if(STATUSES.includes(s))return s;
  const str=String(s||""),label=str.includes(" ")?str.slice(str.indexOf(" ")+1):str;
  return LEGACY_STATUS[label]||STATUSES[0];
}
const TYPES=["30-Day Challenge","Practical Guide","Novel"];
const LANGUAGES=["en-US","es-ES"];
const AUTHORS=["Tomas Cornelles","Thomas A. Carter","Theodore A. Collins","Trevor A. Clark","Tyler A. Cooper","Timothy A. Campbell","Theresa A. Carter","Taylor A. Collins","Tiffany A. Clark","Tessa A. Cooper","Tabitha A. Campbell"];
const NICHES=[["productivity","Productivity & Time Management"],["personal-finance","Personal Finance & Money Management"],["self-improvement","Self-Improvement & Personal Development"],["health-and-wellness","Health & Wellness"],["fitness","Fitness & Exercise"],["mindfulness","Mindfulness & Stress Management"],["relationships","Relationships & Communication"],["parenting","Parenting & Family"],["career-and-business","Career & Business"],["hobbies-and-lifestyle","Hobbies & Lifestyle"],["scify","Scify"],["historical-fiction","Historical Fiction"]];
const PUB_FIELDS=[["description","Amazon description",9],["backText","Back cover text",6],["tags","Tags",4],["categories","Categories",4],["frontMatter","Front matter",8],["backMatter","Back matter",8]];
const PUB_HEADERS=Object.fromEntries(PUB_FIELDS.map(([k,label])=>[label.toUpperCase(),k]));

const PROMPTS={
research:`You are a publishing research assistant.\n\nBOOK IDEA:\n{{title}}\nNICHE:\n{{niche}}\nBOOK TYPE:\n{{type}}\n\nCreate a practical content brief covering: 10 reader problems, 10 reader questions, 10 desired outcomes, common beginner mistakes, topics to cover, topics outside scope, 10 unique angles, suggested table of contents, worksheet ideas, and claims requiring fact checking. Suggest Target reader.\nDo not invent statistics, studies, experts, quotes, or sources. Write in natural American English.`,
editorial:`You are a professional American English nonfiction editor.\n\nReview this manuscript for grammar, spelling, awkward phrasing, repetition, contradictions, missing information, generic AI-like writing, unsupported factual claims, inconsistent terminology and formatting.\n\nReturn a Markdown report with:\n# Editorial Review\n## Issues\n| Location | Problem | Recommended Change | Severity |\n|---|---|---|---|\n## Assessment: overall score (x/10)\nClarity (x/10):\nConsistency (x/10):\nPractical usefulness (x/10):\nOriginality (x/10):\nReader experience (x/10):\n\nDo not rewrite the entire manuscript.`,
metadata:`Generate Amazon KDP metadata for:\n\nTITLE: {{title}}\nAUTHOR: {{author}}\nTARGET READER: {{reader}}\nNICHE: {{niche}}\nTYPE: {{type}}\n\nReturn Markdown with a 250–350 word accurate book description, a short text for back cover, 7 keyword phrase ideas, and relevant category ideas.\n\nNo fake bestseller claims, reviews, competitor names or guarantees.\n\nAlso create front and back mater.\n\nFollow this structure:\n\n## Descripton\n\n \`\`\`\n [description]\n \`\`\`\n \n ## Back text\n\n \`\`\`\n [back text]\n \`\`\`\n \n ## Keywords\n \`\`\`\n [keywords]\n \`\`\`\n \n ## Categories\n \`\`\`\n [categories]\n \`\`\`\n \n ## Front matter\n \`\`\`\n [front matter]\n \`\`\`\n \n ## Back matter\n \`\`\`\n [back matter]\n \`\`\` `
};


const OUTLINE_PROMPTS={
workbook:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n## Introduction\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
challenge:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# (if proceds) Day [NUMBER] — (end if)[TITLE]\n\n[INTRODUCTION]\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
novel:`You are a professional fiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American fiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PLOT:\n[CHAPTER PLOT]\n\nWrite one complete chapter in natural American English between 10-20 pages. Use Markdown headings, long paragraphs, descriptive scenes and be consistent with the data. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n[CONTENT]\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`
};

const PROMPT_KEY="kdp-prompt-steps-v1";
const FIELDS=[["type","Type"],["niche","Niche"],["status","Status"],["language","Language"],["author","Author"]];
const OPS=["is","is not","contains"];
const WILDCARDS=["title","author","reader","niche","type","language","status","price","archive-reason","description","backText","tags","categories","frontMatter","backMatter","chapter","purpose"];
const DEFAULT_STEPS=[
  {id:"research",title:"Research",description:"Content research brief",fileName:"01-research.txt",conditions:[],prompt:PROMPTS.research,hidden:false},
  {id:"outline",title:"Outline",description:"Book structure and chapter plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is not",value:"30-Day Challenge"},{field:"type",op:"is not",value:"Novel"}],prompt:OUTLINE_PROMPTS.workbook,hidden:false},
  {id:"outline-challenge",title:"Outline (30-Day Challenge)",description:"Day-by-day challenge plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is",value:"30-Day Challenge"}],prompt:OUTLINE_PROMPTS.challenge,hidden:false},
  {id:"outline-novel",title:"Outline (Novel)",description:"Chapter plot plan",fileName:"02-outline.txt",conditions:[{field:"type",op:"is",value:"Novel"}],prompt:OUTLINE_PROMPTS.novel,hidden:false},
  {id:"editorial",title:"Editorial review",description:"Quality and AI-like filler review",fileName:"05-editorial-review.md",conditions:[],prompt:PROMPTS.editorial,hidden:false},
  {id:"metadata",title:"KDP metadata",description:"Title, description, keywords and categories",fileName:"07-kdp-metadata.txt",conditions:[],prompt:PROMPTS.metadata,hidden:false}
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
  }));
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
    await renderAttachments();
    await refreshCovers();
    toast("Attachment removed");
  },true);
}
function attachmentHtml(kind,rec){
  const input=`<input type="file" id="${kind}Input" accept="${kind==="book"?".epub,.md":"image/*"}" hidden onchange="attachFile('${kind}',this)">`;
  if(!rec){
    const label=kind==="book"?"Attach .epub or .md":"Attach cover image";
    return `${input}<div class="drop"><p class="muted">No file attached yet.</p><button class="primary" onclick="$('${kind}Input').click()">${label}</button></div>`;
  }
  const thumb=kind==="cover"?`<img class="cover-thumb" src="${URL.createObjectURL(rec.blob)}" alt="Cover">`:`<div class="file-icon">📘</div>`;
  return `${input}<div class="attachment">${thumb}<div class="att-info"><strong>${esc(rec.name)}</strong><span class="muted">${fmtSize(rec.size)}</span></div><div class="att-actions"><button class="secondary" onclick="downloadAttachment('${kind}')">Download</button><button class="secondary" onclick="$('${kind}Input').click()">Replace</button><button class="danger" onclick="removeAttachment('${kind}')">Remove</button></div></div>`;
}
async function renderAttachments(){
  const id=selectedId;if(!id)return;
  const [book,cover]=await Promise.all([getFile(`${id}:book`),getFile(`${id}:cover`)]);
  if(selectedId!==id)return;
  $("bookFile").innerHTML=attachmentHtml("book",book);
  $("coverFile").innerHTML=attachmentHtml("cover",cover);
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
  box.innerHTML=items.map(v=>`<div class="suggest-item" data-value="${esc(v)}"><span>${esc(v)}</span><button type="button" class="suggest-remove" data-remove="${esc(v)}" title="Quitar de la lista">×</button></div>`).join("");
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
function renderList(){
  const q=$("searchInput").value.trim().toLowerCase(),f=$("statusFilter").value;
  const vs=books
    .filter(b=>f||b.status!==ARCHIVED||!!q)
    .filter(b=>!q||[b.title,b.author,b.niche].join(" ").toLowerCase().includes(q))
    .filter(b=>!f||b.status===f)
    .sort((a,b)=>STATUSES.indexOf(a.status)-STATUSES.indexOf(b.status)||(b.updated||"").localeCompare(a.updated||""));
  $("exportAllBtn").textContent=`Export all ${books.length} book${books.length===1?"":"s"}`;
  $("bookList").innerHTML=vs.map(b=>{const cover=coverUrls.get(b.id);return `<div class="book-item ${b.id===selectedId?"selected":""}" onclick="openBook('${b.id}')"><div class="book-item-row"><div class="book-item-text"><div class="book-item-title">${esc(b.status.split(" ")[0])} ${esc(b.title)}</div><div class="book-item-meta">${esc(b.author)}</div></div>${cover?`<img class="book-thumb" src="${cover}" alt="">`:""}</div></div>`}).join("");
}
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
/* ---------- Configuración de prompts y pasos del workflow ---------- */
function openPromptConfig(){renderPromptList()}
function condSummary(s){return (s.conditions||[]).map(c=>`${c.field} ${c.op} "${c.value}"`).join(" & ")||"Always"}
function renderPromptList(){
  openModal("Configure prompts",`<div class="pc-body">
    <div class="pc-head"><p class="modal-text">Steps appear in the workflow when they're visible and their conditions match the book.</p><button class="primary" onclick="editPromptStep()">New step</button></div>
    <div class="pc-list">${promptSteps.map(s=>`<div class="pc-row ${s.hidden?"is-hidden":""}">
      <div class="pc-info"><strong>${esc(s.title)}</strong><span class="muted">${esc(s.description)}</span><span class="pc-meta">${s.hidden?"Hidden · ":""}${esc(condSummary(s))}</span></div>
      <div class="pc-side"><span class="pc-id">step.${s.id}</span><div class="pc-actions">
        <button class="secondary" onclick="editPromptStep('${s.id}')">Edit</button>
        <button class="secondary" onclick="togglePromptStep('${s.id}')">${s.hidden?"Show":"Hide"}</button>
        <button class="danger" onclick="deletePromptStep('${s.id}')">Delete</button>
      </div></div></div>`).join("")}</div>
  </div>`);
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

/* ---------- Visibilidad, wildcards y workflow ---------- */
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
    return `<div class="step ${done?"done":""}"><div class="step-head"><div class="step-num">${i+1}</div><div class="step-title">${esc(s.title)}</div></div><div class="muted" style="margin-left:39px;margin-top:4px">${esc(s.description)}</div><div class="step-actions"><button class="primary-mini" onclick="showPrompt('${s.id}')">View prompt</button>${done?`<button class="edit-green" onclick="editTextStep('${s.id}')">Edit response</button>`:`<button onclick="editTextStep('${s.id}')">Paste response</button>`}</div></div>`;
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
  openModal(`Edit / paste — ${s.title}`,`<div class="form-editor"><label>Content<textarea id="stepContent">${esc(b.steps[id]||"")}</textarea></label><div><button class="primary" onclick="saveTextStep('${id}')">Save</button></div></div>`);
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
function bookTxt(b){return `KDP BOOK MANAGER V2\n\nID: ${b.id}\nTitle: ${b.title}\nAuthor: ${b.author}\nNiche: ${b.niche}\nType: ${b.type}\nTarget reader: ${b.reader}\nStatus: ${b.status}\nArchive reason: ${b.archiveReason||""}\nPrice: ${b.price}\nLanguage: ${b.language}\nCreated: ${b.created}\nUpdated: ${b.updated}\n${Object.entries(b.steps||{}).map(([k,v])=>`\n=== STEP ${k} ===\n${v}\n`).join("")}${PUB_FIELDS.map(([k,label])=>`\n=== ${label.toUpperCase()} ===\n${b.publishing[k]}\n`).join("")}`}


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


/* ---------- ZIP (sin dependencias) ---------- */
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
  if(eocd<0)throw new Error("El archivo no es un ZIP válido.");
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
    else throw new Error("Método de compresión no soportado.");
    if(!name.endsWith("/"))files.set(name,data);
    p+=46+nameLen+extraLen+commentLen;
  }
  return files;
}
const MIME={epub:"application/epub+zip",md:"text/markdown",txt:"text/plain",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif"};
function mimeOf(name){return MIME[name.split(".").pop().toLowerCase()]||"application/octet-stream"}

/* ---------- Export / import de libros completos (.zip) ---------- */
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
async function exportAll(){
  if(!books.length)return;
  const entries=[];
  for(const [i,b] of books.entries())entries.push(...await bookEntries(b,`${String(i+1).padStart(2,"0")}-${fileSafe(b.title)}/`));
  saveBlob("kdp-books.zip",buildZip(entries));
  toast("Export started");
}
async function importZip(file){
  const files=await readZip(await file.arrayBuffer());
  const roots=[...files.keys()].filter(n=>n==="book.txt"||n.endsWith("/book.txt"));
  for(const root of roots){
    const dir=root.slice(0,root.length-"book.txt".length);
    const b=parseBookTxt(new TextDecoder().decode(files.get(root)));
    books=books.filter(x=>x.id!==b.id);
    books.unshift(b);
    rememberValues(b);
    for(const kind of ["book","cover"]){
      const prefix=`${dir}files/${kind}/`;
      const hit=[...files.keys()].find(n=>n.startsWith(prefix)&&!n.slice(prefix.length).includes("/"));
      if(hit){
        const name=hit.split("/").pop(),data=files.get(hit);
        await putFile(`${b.id}:${kind}`,{name,type:mimeOf(name),size:data.length,blob:new Blob([data],{type:mimeOf(name)})});
      }
    }
    const chPrefix=`${dir}chapters/`;
    const chNames=[...files.keys()]
      .filter(n=>n.startsWith(chPrefix)&&!n.slice(chPrefix.length).includes("/"))
      .sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    await setChapters(b.id,chNames.map(n=>({id:uid(),name:n.slice(chPrefix.length).replace(/^\d+-/,""),md:new TextDecoder().decode(files.get(n))})));
  }
  return roots.length;
}

/* ---------- Miniaturas de portada en la lista ---------- */
const coverUrls=new Map();
async function refreshCovers(){
  for(const url of coverUrls.values())URL.revokeObjectURL(url);
  coverUrls.clear();
  const keys=await fileOp("readonly",s=>s.getAllKeys());
  for(const key of keys.filter(k=>String(k).endsWith(":cover"))){
    const rec=await getFile(key);
    if(rec)coverUrls.set(String(key).slice(0,-6),URL.createObjectURL(rec.blob));
  }
  renderList();
}

/* ---------- Pestaña Build: capítulos, previsualización y generación ---------- */
const EPUB_CSS=`body{font-family:Georgia,serif;line-height:1.55;margin:5%}h1,h2,h3{font-family:Helvetica,Arial,sans-serif;line-height:1.2}h1{margin-top:1.2em}img{max-width:100%}.cover{text-align:center;margin:0;padding:0}.cover img{max-height:100%}.title-page{text-align:center;margin-top:30%}.author{font-style:italic}blockquote{margin:1em 2em;font-style:italic}pre{white-space:pre-wrap;font-size:.9em}ol,ul{padding-left:1.4em}`;
const BASE_CSS=`body{margin:0;color:#222;background:#fdfdfb;line-height:1.6}img{max-width:100%}pre{white-space:pre-wrap;background:#f1f1ee;padding:12px;border-radius:6px}code{font-size:.9em}blockquote{margin:1em 2em;font-style:italic;color:#444}section{padding-top:20px;margin-top:28px;border-top:1px solid #e5e5e0}.title-page{text-align:center;padding:40px 0;border:0;margin:0}.title-page .cover{max-width:260px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.25);margin-bottom:28px}.author{font-style:italic;color:#666}@media screen{body{max-width:680px;margin:0 auto;padding:24px}}@media print{body{background:#fff}section{border:0;margin:0;padding-top:0}.title-page{break-after:page;padding:30% 0 0}section.chapter{break-before:page}}`;
const TEMPLATES={
  classic:{label:"Classic",size:"A5",margin:"18mm 16mm",css:`body{font-family:Georgia,"Times New Roman",serif}h1,h2,h3{font-family:Georgia,serif;text-align:center}`},
  modern:{label:"Modern",size:"A4",margin:"20mm 18mm",css:`body{font-family:Helvetica,Arial,sans-serif}h1{color:#3b67f2;border-bottom:3px solid #3b67f2;padding-bottom:.2em}h2,h3{color:#222}.author{color:#3b67f2;font-style:normal}`},
  minimal:{label:"Minimal",size:"A5",margin:"25mm 22mm",css:`body{font-family:"Times New Roman",serif;font-size:1.05em}h1,h2,h3{font-weight:normal;letter-spacing:.02em}section{border:0}`}
};
let currentTemplate="classic";
let currentFormat="epub";

function xmlEsc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[m]))}
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function pad(n){return String(n).padStart(2,"0")}
function anchorOf(t){return t.toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-")}
function splitList(s){return String(s||"").split(/[\n,]/).map(x=>x.trim()).filter(Boolean)}
function chapterTitle(c){const h=c.md.match(/^#\s+(.+)$/m);return h?h[1].trim():c.name.replace(/\.(md|txt)$/i,"").replace(/[-_]+/g," ")}
function withH1(md,title){const first=md.trimStart().split("\n")[0];return /^#\s+/.test(first)?md:`# ${title}\n\n${md}`}

/* Markdown -> HTML (subconjunto suficiente para libros) */
function inline(s){
  const codes=[];
  let x=esc(s).replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return `\u0000${codes.length-1}\u0000`});
  x=x.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>');
  x=x.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g,"$1<em>$2</em>");
  return x.replace(/\u0000(\d+)\u0000/g,(_,i)=>`<code>${esc(codes[i])}</code>`);
}
function mdToHtml(md){
  const lines=md.replace(/\r\n/g,"\n").split("\n");const out=[];let i=0;
  const LIST=/^\s*([-*+]|\d+\.)\s+/, BLOCK=/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s|(\*\*\*|---|___)\s*$)/;
  while(i<lines.length){
    const l=lines[i];let m;
    if(/^```/.test(l)){
      const code=[];i++;
      while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);
      i++;out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);continue;
    }
    if(!l.trim()){i++;continue}
    if((m=l.match(/^(#{1,6})\s+(.*)$/))){out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);i++;continue}
    if(/^(\*\*\*|---|___)\s*$/.test(l)){out.push("<hr/>");i++;continue}
    if(/^>\s?/.test(l)){
      const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,""));
      out.push(`<blockquote>${mdToHtml(q.join("\n"))}</blockquote>`);continue;
    }
    if(LIST.test(l)){
      const ordered=/^\s*\d+\./.test(l),items=[];
      while(i<lines.length&&LIST.test(lines[i]))items.push(lines[i++].replace(LIST,""));
      const tag=ordered?"ol":"ul";
      out.push(`<${tag}>${items.map(t=>`<li>${inline(t)}</li>`).join("")}</${tag}>`);continue;
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

/* Enlaza las entradas del índice del frontmatter con su capítulo */
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

/* Datos para generar: metadatos guardados, capítulos y portada */
async function buildModel(b){
  const [chapters,cover]=await Promise.all([getChapters(b.id),getFile(`${b.id}:cover`)]);
  return{title:b.title,author:b.author,lang:b.language||"en-US",pub:b.publishing||blankPublishing(),chapters,cover,id:b.id};
}

/* Formatos de salida */
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
  const t=TEMPLATES[tpl]||TEMPLATES.classic;
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

/* Interfaz de la pestaña */
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
    <div class="card-head"><select id="contentsSelect" class="contents-select" onchange="jumpToChapter(this.value)" ${count?"":"disabled"}><option value="">Contents</option>${m.chapters.map((c,i)=>`<option value="ch-${i+1}">${esc(chapterTitle(c))}</option>`).join("")}</select><div class="build-controls"><div class="segmented format-group">${["epub","md","txt","pdf"].map(f=>`<button class="${currentFormat===f?"active":""}" onclick="setFormat('${f}')">${f}</button>`).join("")}</div>${currentFormat==="pdf"?`<select id="templateSelect" class="contents-select template-select" onchange="currentTemplate=this.value;renderBuild()" title="Template">${Object.entries(TEMPLATES).map(([k,t])=>`<option value="${k}" ${k===currentTemplate?"selected":""}>${t.label}</option>`).join("")}</select>`:""}<button class="primary" onclick="exportBuild(currentFormat)">Generate</button></div></div>
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

/* ---------- Ordenar capítulos por arrastre ---------- */
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

/* ---------- Crear y editar capítulos ---------- */
async function openChapterEditor(chapterId){
  const id=selectedId;if(!id)return;
  const list=await getChapters(id);
  const c=chapterId?list.find(x=>x.id===chapterId):{md:`# Chapter ${list.length+1}\n\n`};
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
  if(view==="preview")$("chapterPreview").innerHTML=mdToHtml($("chapterMd").value);
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
    await delFile(`${b.id}:chapters`);
    books=books.filter(x=>x.id!==b.id);
    persist();showEmpty();await refreshCovers();toast("Book deleted");
  },true);
};
$("searchInput").oninput=renderList;
$("statusFilter").onchange=renderList;
$("statusInput").onchange=()=>{syncArchiveField();saveCurrent(true)};
$("closeModal").onclick=closeModal;
$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("exportBookBtn").onclick=exportBook;
$("exportAllBtn").onclick=exportAll;
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setTab(t.dataset.tab));
$("importInput").onchange=async e=>{
  let imported=0;
  try{
    for(const f of e.target.files){
      if(/\.zip$/i.test(f.name)){imported+=await importZip(f);continue}
      const t=await f.text();
      if(f.name==="book.txt"||t.startsWith("KDP BOOK MANAGER")){
        const b=parseBookTxt(t);
        books=books.filter(x=>x.id!==b.id);
        books.unshift(b);
        rememberValues(b);
        imported++;
      }
    }
  }catch(err){
    showNotice("Import failed",err.message||"The file could not be imported.");
  }
  saveSuggestions();
  e.target.value="";
  persist();
  await refreshCovers();
  if(books[0])openBook(books[0].id);
  toast(imported?`Imported ${imported} book${imported===1?"":"s"}`:"Nothing imported");
};

/* ---------- Tema (día / noche / sistema) ---------- */
const THEME_KEY="kdp-theme";
const systemDark=window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const pref=localStorage.getItem(THEME_KEY)||"system";
  const resolved=pref==="system"?(systemDark.matches?"dark":"light"):pref;
  document.documentElement.dataset.theme=resolved;
  document.querySelectorAll("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===pref));
}
function setTheme(pref){localStorage.setItem(THEME_KEY,pref);applyTheme()}
systemDark.addEventListener("change",applyTheme);

/* ---------- Menú de la barra lateral ---------- */
$("menuBtn").onclick=e=>{e.stopPropagation();$("appMenu").classList.toggle("hidden")};
document.addEventListener("click",e=>{if(!e.target.closest(".menu-wrap"))$("appMenu").classList.add("hidden")});
$("appMenu").addEventListener("click",e=>{
  const choice=e.target.closest("[data-theme-choice]");
  if(choice){setTheme(choice.dataset.themeChoice);return}
  if(e.target.closest(".menu-item"))$("appMenu").classList.add("hidden");
});
$("importBtn").onclick=()=>$("importInput").click();
$("promptsBtn").onclick=openPromptConfig;

document.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if(!$("modal").classList.contains("hidden"))closeModal();
  $("appMenu").classList.add("hidden");
});
applyTheme();
populate();
setupCombos();
renderList();
if(books.length)openBook(books[0].id);else showEmpty();
refreshCovers();
