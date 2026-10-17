const KEY="kdp-book-manager-v2";
const SUGGEST_KEY="kdp-book-manager-suggestions";
const DB_NAME="kdp-book-manager-files";
const STATUSES=["💡 Idea","🔍 Research","📝 Outline","✏️ Writing","📑 Editing","📗 Ready for KDP","⏳ Waiting KDP","🚀 Published","📁 Paused","🚫 Blocked"];
const HIDDEN_STATUSES=["🚀 Published","📁 Paused","🚫 Blocked"];
const TYPES=["30-Day Challenge","Practical Guide","Novel"];
const AUTHORS=["Tomas Cornelles","Thomas A. Carter","Theodore A. Collins","Trevor A. Clark","Tyler A. Cooper","Timothy A. Campbell","Theresa A. Carter","Taylor A. Collins","Tiffany A. Clark","Tessa A. Cooper","Tabitha A. Campbell"];
const NICHES=[["productivity","Productivity & Time Management"],["personal-finance","Personal Finance & Money Management"],["self-improvement","Self-Improvement & Personal Development"],["health-and-wellness","Health & Wellness"],["fitness","Fitness & Exercise"],["mindfulness","Mindfulness & Stress Management"],["relationships","Relationships & Communication"],["parenting","Parenting & Family"],["career-and-business","Career & Business"],["hobbies-and-lifestyle","Hobbies & Lifestyle"],["scify","Scify"],["historical-fiction","Historical Fiction"]];
const PUB_FIELDS=[["description","Amazon description",9],["backText","Back cover text",6],["tags","Tags",4],["categories","Categories",4],["frontMatter","Front matter",8],["backMatter","Back matter",8]];
const PUB_HEADERS=Object.fromEntries(PUB_FIELDS.map(([k,label])=>[label.toUpperCase(),k]));

const PROMPTS={
research:`You are a publishing research assistant.\n\nBOOK IDEA:\n{{title}}\nNICHE:\n{{niche}}\nBOOK TYPE:\n{{type}}\n\nCreate a practical content brief covering: 10 reader problems, 10 reader questions, 10 desired outcomes, common beginner mistakes, topics to cover, topics outside scope, 10 unique angles, suggested table of contents, worksheet ideas, and claims requiring fact checking. Suggest Target reader.\nDo not invent statistics, studies, experts, quotes, or sources. Write in natural American English.`,
editorial:`You are a professional American English nonfiction editor.\n\nReview this manuscript for grammar, spelling, awkward phrasing, repetition, contradictions, missing information, generic AI-like writing, unsupported factual claims, inconsistent terminology and formatting.\n\nReturn a Markdown report with:\n# Editorial Review\n## Issues\n| Location | Problem | Recommended Change | Severity |\n|---|---|---|---|\n## Assessment: overall score (x/10)\nClarity (x/10):\nConsistency (x/10):\nPractical usefulness (x/10):\nOriginality (x/10):\nReader experience (x/10):\n\nDo not rewrite the entire manuscript.`,
metadata:`Generate Amazon KDP metadata for:\n\nTITLE: {{title}}\nAUTHOR: {{author}}\nTARGET READER: {{reader}}\nNICHE: {{niche}}\nTYPE: {{type}}\n\nReturn Markdown with a 250–350 word accurate book description, a short text for back cover, 7 keyword phrase ideas, and relevant category ideas.\n\nNo fake bestseller claims, reviews, competitor names or guarantees.\n\nAlso create front and back mater.\n\nFollow this structure:\n\n## Descripton\n\n \`\`\`\n [description]\n \`\`\`\n \n ## Back text\n\n \`\`\`\n [back text]\n \`\`\`\n \n ## Keywords\n \`\`\`\n [keywords]\n \`\`\`\n \n ## Categories\n \`\`\`\n [categories]\n \`\`\`\n \n ## Front matter\n \`\`\`\n [front matter]\n \`\`\`\n \n ## Back matter\n \`\`\`\n [back matter]\n \`\`\` `
};

const STEPS=[["research","Research","Content research brief","01-research.txt"],["outline","Outline","Book structure and chapter plan","02-outline.txt"],["editorial","Editorial review","Quality and AI-like filler review","05-editorial-review.md"],["metadata","KDP metadata","Title, description, keywords and categories","07-kdp-metadata.txt"]];

const OUTLINE_PROMPTS={
workbook:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n## Introduction\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
challenge:`You are a professional nonfiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American nonfiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PURPOSE:\n{{purpose}}\n\nWrite one complete chapter in natural American English. Use Markdown headings, short paragraphs, concrete examples and actionable exercises. Do not invent facts, statistics, citations, experts, or testimonials. Do not mention AI.\n\nUse this Markdown structure:\n# (if proceds) Day [NUMBER] — (end if)[TITLE]\n\n[INTRODUCTION]\n\n## Key Concept\n\n## Why It Matters\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Practical Exercise\n\n## Worksheet\n\n## Reflection\n\n## Action Checklist\n\n## Key Takeaways\n\n## Next Step\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`,
novel:`You are a professional fiction book editor.\n\nTITLE:\n{{title}}\n\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nNICHE:\n{{niche}}\n\nCreate a detailed outline with a logical progression. For every chapter create the PROMPT "You are an experienced American fiction workbook author.\n\nBOOK:\n{{title}}\nTARGET READER:\n{{reader}}\nBOOK TYPE:\n{{type}}\nCHAPTER:\n{{chapter}}\nCHAPTER PLOT:\n[CHAPTER PLOT]\n\nWrite one complete chapter in natural American English between 10-20 pages. Use Markdown headings, long paragraphs, descriptive scenes and be consistent with the data. Do not mention AI.\n\nUse this Markdown structure:\n# Chapter [NUMBER] — [TITLE]\n\n[CONTENT]\n\nReturn only the finished Markdown chapter." ready to paste. Avoid repetition and filler. Make every chapter materially useful. Write in natural American English.`
};

const SECTIONS={"RESEARCH":"research","OUTLINE":"outline","EDITORIAL":"editorial","METADATA":"metadata"};
const COMBOS={author:{input:"authorInput",list:"authors"},niche:{input:"nicheInput",list:"niches"},type:{input:"typeInput",list:"types"}};

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
function closeModal(){$("modal").classList.add("hidden")}
function openModal(title,body){$("modalTitle").textContent=title;$("modalBody").innerHTML=body;$("modal").classList.remove("hidden")}
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
  const st=STATUSES.includes(b.status)?b.status:(STATUSES.find(s=>s.endsWith(" "+b.status))||STATUSES[0]);
  b.status=st;
  const n=NICHES.find(([slug])=>slug===b.niche);
  if(n)b.niche=n[1];
  b.publishing={...blankPublishing(),...(b.publishing||{})};
  return b;
}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]").map(normalize)}catch{return[]}}
function persist(){localStorage.setItem(KEY,JSON.stringify(books));renderList()}
function blankPublishing(){return Object.fromEntries(PUB_FIELDS.map(([k])=>[k,""]))}
function blank(){const now=new Date().toISOString();return{id:uid(),title:"New Book",author:"",niche:"",type:"Workbook",reader:"",price:"",url:"",status:STATUSES[0],created:now,updated:now,research:"",outline:"",editorial:"",metadata:"",publishing:blankPublishing()}}
function selected(){return books.find(b=>b.id===selectedId)}

/* ---------- Autocomplete suggestions ---------- */
function defaultSuggestions(){return{authors:[...AUTHORS],niches:NICHES.map(([,label])=>label),types:[...TYPES]}}
function loadSuggestions(){
  try{const s=JSON.parse(localStorage.getItem(SUGGEST_KEY)||"null");if(s)return s}catch{}
  const s=defaultSuggestions();
  for(const b of books)rememberValues(b,s);
  return s;
}
function saveSuggestions(){localStorage.setItem(SUGGEST_KEY,JSON.stringify(suggestions))}
function addTo(list,value){
  const v=(value||"").trim();
  if(v&&!list.some(x=>x.toLowerCase()===v.toLowerCase()))list.push(v);
}
function rememberValues(b,s=suggestions){addTo(s.authors,b.author);addTo(s.niches,b.niche);addTo(s.types,b.type)}
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
  b.url=$("urlInput").value;
  b.reader=$("readerInput").value;
  b.status=$("statusInput").value;
  b.publishing={};
  for(const [k] of PUB_FIELDS)b.publishing[k]=$("pub_"+k).value;
  b.updated=new Date().toISOString();
  rememberValues(b);saveSuggestions();
  persist();
  if(!silent)toast("Saved");
}
function newBook(){const b=blank();books.unshift(b);persist();openBook(b.id)}
function showEmpty(){selectedId=null;$("editor").classList.add("hidden");$("emptyState").classList.remove("hidden");renderList()}
function template(s,b){return s.replaceAll("{{title}}",b.title).replaceAll("{{author}}",b.author).replaceAll("{{reader}}",b.reader).replaceAll("{{niche}}",b.niche).replaceAll("{{type}}",b.type).replaceAll("{{chapter}}","[CHAPTER NUMBER AND TITLE]").replaceAll("{{purpose}}","[CHAPTER PURPOSE]")}
function renderList(){
  const q=$("searchInput").value.trim().toLowerCase(),f=$("statusFilter").value;
  const vs=books
    .filter(b=>f||!HIDDEN_STATUSES.includes(b.status))
    .filter(b=>!q||[b.title,b.niche,b.status].join(" ").toLowerCase().includes(q))
    .filter(b=>!f||b.status===f)
    .sort((a,b)=>STATUSES.indexOf(a.status)-STATUSES.indexOf(b.status)||(b.updated||"").localeCompare(a.updated||""));
  $("exportAllBtn").textContent=`Export all ${books.length} book${books.length===1?"":"s"}`;
  $("bookList").innerHTML=vs.map(b=>`<div class="book-item ${b.id===selectedId?"selected":""}" onclick="openBook('${b.id}')"><div class="book-item-title">${esc(b.status.split(" ")[0])} ${esc(b.title)}</div><div class="book-item-meta">${esc(b.author)}</div></div>`).join("");
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
  $("authorName").textContent=b.author;
  $("authorInput").value=b.author;
  $("nicheInput").value=b.niche;
  $("typeInput").value=b.type;
  $("priceInput").value=b.price;
  $("urlInput").value=b.url;
  $("readerInput").value=b.reader;
  $("statusInput").value=b.status;
  renderList();renderWorkflow();renderPublishing();renderAttachments();
}
function setTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  $("workflowTab").classList.toggle("hidden",name!=="workflow");
  $("publishingTab").classList.toggle("hidden",name!=="publishing");
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
function stepName(key){return STEPS.find(x=>x[0]===key)[1]}
function renderWorkflow(){
  const b=selected();
  $("workflowTab").innerHTML=STEPS.map(([key,name,desc,file],i)=>{
    const done=!!b[key],ext=file.split(".").pop();
    return `<div class="step ${done?"done":""}"><div class="step-head"><div class="step-num">${i+1}</div><div class="step-title">${name}</div></div><div class="muted" style="margin-left:39px;margin-top:4px">${desc}</div><div class="step-actions"><button class="primary-mini" onclick="showPrompt('${key}')">View prompt</button>${done?`<button class="edit-green" onclick="editTextStep('${key}')">Edit response</button>`:`<button onclick="editTextStep('${key}')">Paste response</button>`}${done&&ext==="md"?`<button onclick="downloadStep('${key}')">Save .${ext}</button>`:""}</div></div>`;
  }).join("");
}
function selectedOutline(){
  const t=selected().type.toLowerCase();
  if(t==="novel")return OUTLINE_PROMPTS.novel;
  if(t==="30-day challenge")return OUTLINE_PROMPTS.challenge;
  return OUTLINE_PROMPTS.workbook;
}
function showPrompt(key){
  const b=selected();
  const text=key==="outline"?selectedOutline():PROMPTS[key];
  openModal(`Prompt — ${stepName(key)}`,`<div class="modal-body"><textarea class="prompt-area" id="promptText">${esc(template(text,b))}</textarea></div><div class="modal-footer"><button class="primary" onclick="copyPrompt()">Copy prompt</button><button class="secondary" onclick="editTextStep('${key}')">Edit / paste result</button></div>`);
}
async function copyPrompt(){await navigator.clipboard.writeText($("promptText").value);toast("Prompt copied")}
function editTextStep(key){
  const b=selected();
  openModal(`Edit / paste — ${stepName(key)}`,`<div class="form-editor"><label>Content<textarea id="stepContent">${esc(b[key]||"")}</textarea></label><div><button class="primary" onclick="saveTextStep('${key}')">Save</button></div></div>`);
}
function saveTextStep(key){
  const b=selected();
  b[key]=$("stepContent").value;
  b.updated=new Date().toISOString();
  persist();
  closeModal();
  renderWorkflow();
  toast(`Saved ${key}`);
}
function downloadStep(key){const b=selected(),step=STEPS.find(x=>x[0]===key);download(step[3],b[key]||"")}

/* ---------- Export / import ---------- */
function bookTxt(b){return `KDP BOOK MANAGER V2\n\nID: ${b.id}\nTitle: ${b.title}\nAuthor: ${b.author}\nNiche: ${b.niche}\nType: ${b.type}\nTarget reader: ${b.reader}\nStatus: ${b.status}\nPrice: ${b.price}\nSales URL: ${b.url}\nCreated: ${b.created}\nUpdated: ${b.updated}\n\n=== RESEARCH ===\n${b.research}\n\n=== OUTLINE ===\n${b.outline}\n\n=== EDITORIAL ===\n${b.editorial}\n\n=== METADATA ===\n${b.metadata}\n${PUB_FIELDS.map(([k,label])=>`\n=== ${label.toUpperCase()} ===\n${b.publishing[k]}\n`).join("")}`}


function parseBookTxt(text){
  const b=blank(),fields={"ID":"id","Title":"title","Author":"author","Niche":"niche","Type":"type","Target reader":"reader","Status":"status","Price":"price","Sales URL":"url","Created":"created","Updated":"updated"};
  let section=null;
  for(const line of text.split(/\r?\n/)){
    if(line.startsWith("=== ")&&line.endsWith(" ===")){
      const name=line.slice(4,-4);
      if(SECTIONS[name])section={holder:"",key:SECTIONS[name]};
      else if(PUB_HEADERS[name])section={holder:"publishing",key:PUB_HEADERS[name]};
      else section=null;
      continue;
    }
    if(section){(section.holder?b[section.holder]:b)[section.key]+=line+"\n";continue}
    const m=line.match(/^([^:]+):\s*(.*)$/);
    if(m&&fields[m[1]])b[fields[m[1]]]=m[2];
  }
  for(const s of Object.values(SECTIONS))b[s]=b[s].replace(/\s+$/,"");
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
  }
  return roots.length;
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
    books=books.filter(x=>x.id!==b.id);
    persist();showEmpty();toast("Book deleted");
  },true);
};
$("searchInput").oninput=renderList;
$("statusFilter").onchange=renderList;
$("statusInput").onchange=()=>saveCurrent(true);
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
  if(books[0])openBook(books[0].id);
  toast(imported?`Imported ${imported} book${imported===1?"":"s"}`:"Nothing imported");
};

populate();
setupCombos();
renderList();
if(books.length)openBook(books[0].id);else showEmpty();
