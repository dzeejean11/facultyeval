(() => {
const $ = s => document.querySelector(s);
const KEY = "fes-admin-v2";
const hash = s => { let n = 7; for (const c of String(s)) n = (n * 31 + c.charCodeAt(0)) % 9973; return n / 9973 };
const PERMS = window.FES_PERMS;
const NAV = {users:PERMS[0],roles:PERMS[1],subjects:PERMS[2],years:PERMS[3],criteria:PERMS[4],forms:PERMS[5],reports:"View reports|View own results",evaluators:"View reports|View own results",feedback:PERMS[8],nlp:PERMS[9],settings:PERMS[10],audit:PERMS[11]};
const SCALES = [{v:"4",l:"4-point"},{v:"5",l:"5-point"},{v:"10",l:"10-point"}];
const SENTS = ["Positive","Neutral","Negative"];
const PRESETS = [["Blue","#2563eb"],["Indigo","#4f46e5"],["Violet","#7c3aed"],["Purple","#9333ea"],["Pink","#db2777"],["Rose","#e11d48"],["Red","#dc2626"],["Maroon","#7f1d1d"],["Orange","#ea580c"],["Amber","#d97706"],["Gold","#b45309"],["Yellow","#ca8a04"],["Lime","#65a30d"],["Green","#16a34a"],["Emerald","#059669"],["Teal","#0d9488"],["Cyan","#0891b2"],["Sky","#0284c7"],["Navy","#1e3a8a"],["Slate","#475569"]];
const toRgb = c => [1,3,5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = r => "#" + r.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (r, b, a) => r.map((v, i) => v + (b[i] - v) * a);
const shadeHTML = c => { const r = toRgb(c); return [[[0,0,0],.45],[[0,0,0],.25],[[0,0,0],0],[[255,255,255],.25],[[255,255,255],.45]].map(([b,a]) => { const h = toHex(mix(r, b, a)); return `<button type="button" class="sw" data-color="${h}" style="background:${h}" title="${h}" aria-label="Use shade ${h}"></button>` }).join("") };

/* NLP-START  Prototype lexicon analyzer for English, Filipino and code-switched text.
   Replace analyze() with a call to the fine-tuned multilingual transformer when it is ready. */
const lex = s => Object.fromEntries(s.split(" ").map(p => p.split(":")).map(([w,v]) => [w,+v]));
const words = s => s.split(" ");
const LEX_EN = lex("good:1 great:2 excellent:2 clear:1 helpful:2 engaging:2 patient:1 responsive:1 organized:1 knowledgeable:2 approachable:1 fair:1 supportive:2 respectful:1 understandable:1 interesting:1 friendly:1 amazing:2 best:2 love:2 thank:1 thanks:1 nice:1 effective:1 prepared:1 motivating:2 bad:-2 poor:-2 boring:-2 confusing:-2 unclear:-2 late:-1 slow:-1 fast:-1 rude:-3 unfair:-2 absent:-2 unprepared:-2 difficult:-1 hard:-1 disorganized:-2 strict:-1 lacking:-1 worst:-3 terrible:-3 stressful:-2 useless:-2");
const LEX_FI = lex("malinaw:1 mabait:2 magaling:2 mahusay:2 maayos:1 matiyaga:2 nakakatulong:2 nakatulong:2 masaya:1 galing:2 salamat:1 maganda:1 magalang:1 matulungin:2 masipag:1 organisado:1 nakakaengganyo:2 nahihirapan:-2 mahirap:-1 magulo:-2 nakakabagot:-2 bastos:-3 pangit:-2 mabagal:-1 huli:-1 nakakainis:-2 nakakalito:-2 kulang:-1 masama:-2 palpak:-2 pabaya:-2 tamad:-2");
const LEX = Object.assign({}, LEX_EN, LEX_FI);
const EN_STOP = words("the a an and or but is are was were be been to of in on for with it this that very too so i my we our you your he she his her their they as by from not no can could would will have has had really just also if when then than there here more most some all one");
const FI_STOP = words("ang ng sa ay na ko mo po naman kasi kaya ba mga ako ka si ni yung pero para lang din rin ito iyon akong namin nila niya siya kung dahil ngunit pa nang may mas kay minsan talaga sobrang napaka masyadong hindi di wala walang ayaw kami tayo sila iyan dito doon opo");
const EN_SET = new Set([...EN_STOP, ...words("questions lessons lectures lecture assignments assignment instructions grading discussions discussion activities learning teacher class classes pace pacing feedback explanations explanation hours consultation project exam exams lesson student students professor time topic topics subject"), ...Object.keys(LEX_EN)]);
const FI_SET = new Set([...FI_STOP, ...words("magturo pagtuturo sumunod mabilis klase guro titser aralin sagot tanong gawain"), ...Object.keys(LEX_FI)]);
const ANY_STOP = new Set([...EN_STOP, ...FI_STOP, "sir", "maam", "at"]);
const NEGW = new Set(words("hindi di wala walang not no never ayaw dont doesnt isnt wasnt cant cannot without"));
const INTW = new Set(words("very super sobrang napaka talaga masyadong too really extremely"));
function analyze(text) {
 const tk = String(text).toLowerCase().replace(/['’]/g, "").replace(/[^a-zñ\s-]/g, " ").split(/[\s-]+/).filter(Boolean);
 let score = 0, neg = 0, mul = 0, en = 0, fi = 0; const sk = [], ok = [];
 tk.forEach(w => {
  const e = EN_SET.has(w), f = FI_SET.has(w);
  if (e && !f) en++; else if (f && !e) fi++;
  if (NEGW.has(w)) { neg = 2; return }
  if (INTW.has(w)) { mul = 2; return }
  if (LEX[w] != null) { let s = LEX[w]; if (mul) s *= 1.5; if (neg) s = -s; score += s; neg = mul = 0; if (!sk.includes(w)) sk.push(w); return }
  if (neg) neg--; if (mul) mul--;
  if (w.length > 3 && !ANY_STOP.has(w) && !ok.includes(w)) ok.push(w);
 });
 const t = en + fi;
 return {
  language: !t ? "Unknown" : Math.min(en, fi) / t >= .25 ? "Code-switched" : fi > en ? "Filipino" : "English",
  sentiment: score >= 1 ? "Positive" : score <= -1 ? "Negative" : "Neutral",
  score: Math.round(score * 10) / 10, keywords: [...sk, ...ok].slice(0, 4), clean: tk.join(" ")
 };
}
/* NLP-END */
const enrich = r => { const a = analyze(r.text); r.language = a.language; r.sentiment = a.sentiment; r.score = a.score; r.keywords = a.keywords.join(", "); return r };

/* ---------- data ---------- */
const seed = window.FES_SEED;
let D; try { D = JSON.parse(localStorage.getItem(KEY)) } catch (e) {}
D = D || {};
for (const k in seed) if (!D[k]) D[k] = JSON.parse(JSON.stringify(seed[k]));
D.settings = Object.assign({tint:"Neutral",brandColor:"",retention:2}, D.settings);
D.audit = D.audit || [];
D.roles.forEach(r => { if (r.name === "Administrator") r.permissions = PERMS.slice() });
D.feedback.forEach(r => { if (!r.language) enrich(r) });
D.subjects.forEach((s, i) => { if (s.enrolled == null) s.enrolled = [40, 35, 30][i] || 30 });
if (!D.evaluations) {
 const ay = (D.years.find(y => y.status === "Active") || D.years[0] || {id:0}).id, ev = [];
 D.subjects.forEach(s => { const n = Math.round(s.enrolled * (.35 + .55 * hash(s.code))); for (let i = 0; i < n; i++) ev.push({id:ev.length + 1,code:s.code,faculty:s.faculty,type:"Student",year:ay,date:new Date(Date.UTC(2026, 9, 1 + Math.floor(hash(s.code + i) * 40))).toISOString(),via:i % 3 ? "Web" : "Mobile app",sample:true}) });
 D.evaluations = ev;
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)) } catch (e) {} };

/* ---------- helpers ---------- */
let page = "dashboard", editing = null, ry = "", rd = "";
let sess = null; try { sess = JSON.parse(sessionStorage.getItem("fes-session") || localStorage.getItem("fes-session")) } catch (e) {}
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2600) };
const opt = o => typeof o === "object" ? o : {v:o,l:o};
const depts = () => D.settings.departments.split(",").map(s => s.trim()).filter(Boolean);
const termOpts = () => ({Semester:["1st Semester","2nd Semester","Summer"],Trimester:["1st Trimester","2nd Trimester","3rd Trimester"],Quarter:["1st Quarter","2nd Quarter","3rd Quarter","4th Quarter"]})[D.settings.terms] || [];
const roleNames = () => D.roles.map(r => r.name);
const staff = () => D.users.filter(u => u.role === D.settings.staffRole && u.status === "Active");
const critAll = () => D.criteria.map(c => ({v:c.id,l:c.name + (c.status === "Active" ? "" : " (inactive)")}));
const curYear = () => D.years.find(y => y.status === "Active") || D.years[D.years.length - 1];
const yr = () => String(ry || (curYear() ? curYear().id : 0));
const myRole = () => D.roles.find(r => r.name === (sess && sess.role));
const can = p => !p || !sess || !sess.role || p.split("|").some(x => !!(myRole() && myRole().permissions.includes(x)));
const ownOnly = () => !!(sess && sess.role) && !can("View reports") && can("View own results");
const log = a => { D.audit.unshift({id:Date.now() + Math.random(),time:new Date().toISOString(),user:(sess && sess.name) || "System",action:a}); D.audit = D.audit.slice(0, 300) };
const lab = r => r.name || r.code || (r.text || "").slice(0, 32);
const pct = x => (x * 100).toFixed(1) + "%";
const PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
function download(name, rows) {
 const a = document.createElement("a");
 a.href = URL.createObjectURL(new Blob([rows.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], {type:"text/csv"}));
 a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

/* ---------- entity config ---------- */
const E = {
 users:{title:"Users",one:"user",desc:"Create accounts for administrators, evaluators, faculty, supervisors and IT experts.",
  cols:[["name","Name"],["email","Email"],["role","Role"],["department","Department"],["status","Status"]],
  f:() => [{k:"name",l:"Full name"},{k:"email",l:"Email",t:"email"},{k:"role",l:"Role",o:roleNames()},{k:"department",l:"Department",o:depts()},{k:"password",l:"Sign-in password",t:"password",opt:true,hint:"Needed for students to sign in to the student portal. Demo only: stored as plain text in this browser."},{k:"status",l:"Status",o:["Active","Inactive"]}],
  validate:(r,id) => D.users.some(u => u.id !== id && u.email.toLowerCase() === String(r.email).toLowerCase()) ? {email:"Email is already in use"} : {}},
 subjects:{title:"Subjects",one:"subject",desc:"Create subjects and assign them to the faculty who teach them.",
  cols:[["code","Code"],["name","Subject"],["department","Department"],["units","Units"],["enrolled","Enrolled students"],["faculty","Assigned to"]],
  f:() => [{k:"code",l:"Subject code"},{k:"name",l:"Subject name"},{k:"department",l:"Department",o:depts()},{k:"units",l:"Units",t:"number",min:1,max:12},{k:"enrolled",l:"Enrolled students (expected evaluators)",t:"number",min:0,max:500},{k:"faculty",l:"Assigned to",o:staff().map(u => u.name)}],
  validate:(r,id) => D.subjects.some(s => s.id !== id && s.code.toLowerCase() === String(r.code).toLowerCase()) ? {code:"Subject code already exists"} : {}},
 years:{title:"Academic Years",one:"academic year",desc:"Set up evaluation periods. Only one can be Active at a time.",
  cols:[["name","Academic year"],["term","Term"],["start","Start"],["end","End"],["status","Status"]],
  f:() => [{k:"name",l:"Academic year (e.g. 2026-2027)"},{k:"term",l:"Term",o:termOpts()},{k:"start",l:"Start date",t:"date"},{k:"end",l:"End date",t:"date"},{k:"status",l:"Status",o:["Upcoming","Active","Closed"]}],
  validate:(r,id) => {
   const e = {};
   if (!/^\d{4}-\d{4}$/.test(r.name)) e.name = "Use the format 2026-2027";
   if (r.end && r.start && r.end <= r.start) e.end = "End date must be after the start date";
   if (D.years.some(y => y.id !== id && y.name === r.name && y.term === r.term)) e.term = "This term already exists for that year";
   return e;
  },
  after:r => { if (r.status === "Active") D.years.forEach(y => { if (y.id !== r.id && y.status === "Active") y.status = "Closed" }) }},
 criteria:{title:"Criteria",one:"criterion",desc:"Define the evaluation items and how much each counts toward the result.",
  cols:[["name","Criterion"],["category","Category"],["weight","Weight",v => v + "%"],["status","Status"]],
  f:() => [{k:"name",l:"Criterion name"},{k:"category",l:"Category",hint:"For grouping, such as Teaching or Assessment."},{k:"description",l:"Description shown on the form",t:"area"},{k:"weight",l:"Weight (%)",t:"number",min:1,max:100},{k:"status",l:"Status",o:["Active","Inactive"]}],
  validate:(r,id) => D.criteria.some(c => c.id !== id && c.name.toLowerCase() === String(r.name).toLowerCase()) ? {name:"A criterion with this name exists"} : {},
  canDelete:r => D.forms.some(f => f.criteria.includes(r.id)) ? "This criterion is used by an evaluation form. Remove it from the form first." : null,
  note:() => { const t = D.criteria.filter(c => c.status === "Active").reduce((a,c) => a + c.weight, 0); return `<div class="note${t === 100 ? "" : " warn"}">Active criteria weights total <b>${t}%</b>${t === 100 ? "." : ". Aim for 100% so scores are easy to compare."}</div>` }},
 forms:{title:"Evaluation Forms",one:"evaluation form",desc:"Build forms for each evaluator type: choose the scale, the criteria and whether comments are collected.",
  cols:[["name","Form"],["audience","Used for"],["scale","Scale",v => v + "-point"],["criteria","Criteria",v => v.length],["comments","Comments"],["status","Status"]],
  f:() => [{k:"name",l:"Form name"},{k:"audience",l:"Who evaluates whom",o:["Student evaluates faculty","Peer evaluates faculty","Supervisor evaluates faculty","Faculty self-evaluation"]},{k:"scale",l:"Rating scale",o:SCALES},{k:"criteria",l:"Criteria on this form",t:"multi",num:true,o:critAll()},{k:"comments",l:"Written comments (English, Filipino or mixed)",o:["Required","Optional","Off"]},{k:"status",l:"Status",o:["Draft","Published","Archived"]}],
  validate:(r,id) => D.forms.some(f => f.id !== id && f.name.toLowerCase() === String(r.name).toLowerCase()) ? {name:"A form with this name exists"} : {}},
 roles:{title:"Roles & Permissions",one:"role",desc:"Role-based access control: choose what each role can open and change.",
  cols:[["name","Role"],["description","Description"],["permissions","Permissions",v => v.length ? v.length + " of " + PERMS.length : "None"]],
  f:() => [{k:"name",l:"Role name"},{k:"description",l:"Description",opt:true},{k:"permissions",l:"Permissions",t:"multi",opt:true,o:PERMS}],
  validate:(r,id) => {
   const old = D.roles.find(x => x.id === id), e = {};
   if (D.roles.some(x => x.id !== id && x.name.toLowerCase() === String(r.name).toLowerCase())) e.name = "A role with this name exists";
   if (old && old.name === "Administrator" && r.name !== "Administrator") e.name = "The Administrator role can't be renamed";
   return e;
  },
  before:(r,id) => {
   const old = D.roles.find(x => x.id === id);
   if (old && old.name !== r.name) { D.users.forEach(u => { if (u.role === old.name) u.role = r.name }); if (D.settings.staffRole === old.name) D.settings.staffRole = r.name }
   if (r.name === "Administrator") r.permissions = PERMS.slice();
  },
  canDelete:r => r.name === "Administrator" ? "The Administrator role can't be deleted." : D.users.some(u => u.role === r.name) ? "Users still have this role. Reassign them first." : r.name === D.settings.staffRole ? "This role is set as the evaluated role in Institution Settings." : null},
 feedback:{title:"Feedback Comments",one:"feedback comment",desc:"Textual feedback with language, sentiment and keywords. The original comment is always kept for review.",
  cols:[["id","ID",(v,r) => "NLP" + String(D.feedback.indexOf(r) + 1).padStart(3,"0")],["text","Original comment",v => v.length > 60 ? v.slice(0,57) + "…" : v],["faculty","Faculty"],["source","From"],["language","Language"],["sentiment","Sentiment"],["keywords","Keywords"],["manual","Manual label",v => v || "—"]],
  f:() => [{k:"text",l:"Comment (English, Filipino or mixed)",t:"area"},{k:"faculty",l:"Faculty evaluated",o:staff().map(u => u.name)},{k:"source",l:"Evaluator type",o:["Student","Peer","Supervisor"]},{k:"manual",l:"Manual label (for validation)",opt:true,o:SENTS,hint:"Optional. Compared with the system label on the Sentiment Validation page."}],
  before:r => enrich(r),
  note:() => {
   const cnt = (k, v) => D.feedback.filter(f => f[k] === v).length;
   return `<div class="card" style="margin-bottom:16px"><div class="ch"><div><div class="ct2">Import from the mobile app</div><div class="cd">Paste the JSON exported from the student evaluator app. Each comment is analyzed and added as a Student comment.</div></div></div><div class="cb"><div class="fld"><label for="imp">Exported JSON</label><textarea id="imp" rows="3"></textarea></div><button class="btn" id="impbtn" type="button">Import comments</button></div></div><div class="card" style="margin-bottom:16px"><div class="ch"><div><div class="ct2">Analyze a comment</div><div class="cd">Try English, Filipino or mixed text. Nothing is saved until you add it as a record. This prototype uses a word-list analyzer; the final system will use the fine-tuned multilingual model.</div></div></div><div class="cb"><div class="fld"><label for="at">Comment</label><textarea id="at" rows="3" placeholder="Malinaw magturo pero sobrang bilis ng discussion."></textarea></div><div class="fa" style="margin-top:10px;justify-content:flex-start"><button class="btn" data-analyze>Analyze</button></div><div id="ares" aria-live="polite"></div></div></div>
   <div class="chips" style="margin:0 0 16px">${["English","Filipino","Code-switched"].map(l => `<span class="chip">${l} · ${cnt("language", l)}</span>`).join("")}${SENTS.map(s => `<span class="chip"><span class="${s}">●</span> ${s} · ${cnt("sentiment", s)}</span>`).join("")}</div>`;
  }}
};
const SET = () => [
 {k:"name",l:"Institution name"},{k:"email",l:"Contact email",t:"email"},
 {k:"departments",l:"Departments or colleges",t:"area",wide:true,hint:"Separate names with commas. These appear in user, subject and report filters."},
 {k:"terms",l:"Term system",o:["Semester","Trimester","Quarter"]},
 {k:"scale",l:"Default rating scale",o:SCALES},
 {k:"staffRole",l:"Role that is evaluated",o:roleNames(),hint:"Reports and subject assignment use people with this role."},
 {k:"anonymous",l:"Anonymous evaluator responses",o:["Yes","No"],hint:"Yes keeps evaluator identity out of comment records and reports."},
 {k:"threshold",l:"Minimum acceptable rating (%)",t:"number",min:1,max:100,hint:"Results below this share of the scale are marked Needs review."},
 {k:"retention",l:"Research data retention (years)",t:"number",min:1,max:10,hint:"Identifiable records are deleted or de-identified after this period."},
 {k:"brandColor",l:"Brand color",t:"color",opt:true,wide:true,hint:"Used for buttons, bars and highlights across the portal and login page. Pick a swatch or any color. Default keeps the neutral look."},
 {k:"tint",l:"Surface style",o:["Neutral","Tinted"],hint:"Tinted adds a soft wash of the brand color to the sidebar, tabs and borders."}];

/* ---------- form fields ---------- */
function fieldHTML(f, rec) {
 const val = rec[f.k] != null ? rec[f.k] : "", id = "f_" + f.k; let inp;
 if (f.t === "multi") inp = `<div class="chk" id="${id}">${f.o.map(o => { o = opt(o); return `<label><input type="checkbox" value="${esc(o.v)}"${(val || []).map(String).includes(String(o.v)) ? " checked" : ""}>${esc(o.l)}</label>` }).join("")}</div>`;
 else if (f.o) { const os = f.o.map(opt); if (val !== "" && !os.some(o => String(o.v) === String(val))) os.push({v:val,l:val}); inp = `<select id="${id}"><option value="">Select…</option>${os.map(o => `<option value="${esc(o.v)}"${String(o.v) === String(val) ? " selected" : ""}>${esc(o.l)}</option>`).join("")}</select>` }
 else if (f.t === "color") inp = `<div class="clr"><input type="color" id="${id}" value="${val || "#2563eb"}" data-def="${val ? "0" : "1"}" aria-label="Brand color">${PRESETS.map(p => `<button type="button" class="sw" data-color="${p[1]}" style="background:${p[1]}" title="${p[0]}" aria-label="${p[0]}"></button>`).join("")}<button type="button" class="btn ghost sm" data-color="">Default</button></div><div class="cd" style="margin:10px 0 6px">Shades of the selected color</div><div class="clr" id="shades">${shadeHTML(val || "#2563eb")}</div>`;
 else if (f.t === "area") inp = `<textarea id="${id}" rows="3">${esc(val)}</textarea>`;
 else inp = `<input id="${id}" type="${f.t || "text"}" value="${esc(val)}"${f.t === "number" ? ` min="${f.min}" max="${f.max}"` : ""}>`;
 return `<div class="fld${f.wide ? " wide" : ""}"><label for="${id}">${f.l}</label>${inp}${f.hint ? `<div class="hint">${f.hint}</div>` : ""}<div class="err" id="e_${f.k}"></div></div>`;
}
function collect(fs) {
 const rec = {}, errs = {};
 fs.forEach(f => {
  let v;
  if (f.t === "multi") { v = [...document.querySelectorAll(`#f_${f.k} input:checked`)].map(i => f.num ? Number(i.value) : i.value); if (!v.length && !f.opt) errs[f.k] = "Choose at least one" }
  else {
   const el = $("#f_" + f.k); v = el.dataset.def === "1" ? "" : el.value.trim();
   if (!v && !f.opt) errs[f.k] = "Required";
   else if (f.t === "email" && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) errs[f.k] = "Enter a valid email";
   else if (f.t === "number" && v) { v = Number(v); if (!(v >= f.min && v <= f.max)) errs[f.k] = `Enter a number from ${f.min} to ${f.max}` }
  }
  rec[f.k] = v;
 });
 return {rec, errs};
}
function showErrs(fs, errs) { let ok = true; fs.forEach(f => { const m = errs[f.k] || "", e = $("#e_" + f.k); if (e) e.textContent = m; if (m) ok = false }); return ok }
function merge(errs, extra) { for (const k in extra) if (!errs[k]) errs[k] = extra[k] }

/* ---------- reports (ratings are sample data; comment sentiment is real) ---------- */
const thr = () => Number(D.settings.threshold);
function report(year, dept) {
 const sc = Number(D.settings.scale), crit = D.criteria.filter(c => c.status === "Active"), tw = crit.reduce((a,c) => a + c.weight, 0) || 1;
 const rows = staff().filter(u => (!dept || u.department === dept) && (!ownOnly() || u.email === sess.email)).map(u => {
  const cs = crit.map(c => sc * (.5 + .5 * hash(u.name + c.name + year)));
  const avg = crit.length ? cs.reduce((a,x,i) => a + x * crit[i].weight, 0) / tw : 0;
  const fb = D.feedback.filter(f => f.faculty === u.name), pos = fb.filter(f => f.sentiment === "Positive").length;
  return {name:u.name,dept:u.department,subs:D.subjects.filter(s => s.faculty === u.name).length,comments:fb.length,avg,pct:avg / sc * 100,pos:fb.length ? Math.round(pos / fb.length * 100) : null,cs};
 });
 return {rows,crit,sc};
}
function critBars(r) {
 if (!r.crit.length) return '<div class="cd">No active criteria yet. Add some under Criteria.</div>';
 return r.crit.map((c,i) => { const a = r.rows.length ? r.rows.reduce((s,x) => s + x.cs[i], 0) / r.rows.length : 0; return `<div class="row"><div class="l">${esc(c.name)}</div><div class="track"><div class="fill" style="width:${a / r.sc * 100}%"></div></div><div class="v">${a.toFixed(1)}</div></div>` }).join("");
}
const statCards = a => a.map(s => `<div class="card"><div class="ch"><h3>${s[0]}</h3></div><div class="cb"><div class="big">${esc(s[1])}</div><div class="ss">${esc(s[2])}</div></div></div>`).join("");

/* ---------- views ---------- */
function dashboard() {
 const y = curYear(), r = report(yr(), ""), crit = D.criteria.filter(c => c.status === "Active"), n = D.feedback.length || 1;
 const pub = D.forms.filter(f => f.status === "Published").length, col = {Positive:"var(--pos)",Neutral:"var(--neu)",Negative:"var(--neg)"};
 const sp = Object.fromEntries(SENTS.map(s => [s, Math.round(D.feedback.filter(f => f.sentiment === s).length / n * 100)]));
 const kw = {}; D.feedback.forEach(f => (f.keywords || "").split(", ").filter(Boolean).forEach(k => kw[k] = (kw[k] || 0) + 1));
 const themes = Object.entries(kw).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6);
 const recent = D.feedback.slice(-3).reverse(), seeText = can(NAV.feedback);
 return `<div class="tr"><div><h1>Dashboard</h1><div class="sub">${y ? `Current term: ${esc(y.name)}, ${esc(y.term)}. ` : "No academic year yet. "}Rating bars use sample data; sentiment comes from the feedback records.</div></div></div>
 <div class="grid st">${statCards([["Faculty",staff().length,"Active staff being evaluated"],["Evaluators",D.users.filter(u => /Evaluator/.test(u.role)).length,"Students and peers with accounts"],["Comments analyzed",D.feedback.length,"English, Filipino and code-switched"],["Published forms",pub,"of " + D.forms.length + " evaluation forms"]])}</div>
 <div class="grid two"><div class="card c4"><div class="ch"><div><div class="ct2">Average rating by criteria</div><div class="cd">Out of ${r.sc}, ${ownOnly() ? "your results" : "all faculty combined"} · ${crit.length} active criteria</div></div></div><div class="cb">${critBars(r)}</div></div>
 <div class="card c3"><div class="ch"><div><div class="ct2">Feedback sentiment</div><div class="cd">${D.feedback.length} comments analyzed</div></div></div><div class="cb"><div class="seg" role="img" aria-label="Sentiment split">${SENTS.map(k => `<i style="width:${sp[k]}%;background:${col[k]}"></i>`).join("")}</div><div class="leg">${SENTS.map(k => `<span><span class="dot" style="background:${col[k]}"></span>${k} ${sp[k]}%</span>`).join("")}</div><div class="cd" style="margin-top:18px">Recurring keywords</div><div class="chips">${themes.map(t => `<span class="chip">${esc(t[0])} · ${t[1]}</span>`).join("") || '<span class="cd">No comments yet.</span>'}</div></div></div></div>
 <div class="card" style="margin-top:16px"><div class="ch"><div><div class="ct2">Recent feedback</div><div class="cd">${seeText ? "Original comments, shown to roles allowed to review them" : "Original comments are hidden for your role"}${D.settings.anonymous === "Yes" ? ". Evaluators stay anonymous." : ""}</div></div></div><div class="cb">${recent.map(f => `<div class="fb"><b>${esc(f.faculty)}</b> <small>${esc(f.source)} · ${esc(f.language)}</small> <span class="bdg ${f.sentiment}">${f.sentiment}</span><p>${seeText ? esc(f.text) : "Keywords: " + esc(f.keywords)}</p></div>`).join("")}</div></div>`;
}
function reports() {
 const r = report(yr(), rd), t = thr(), n = r.rows.length, avg = n ? r.rows.reduce((a,x) => a + x.avg, 0) / n : 0, low = r.rows.filter(x => x.pct < t).length;
 return `<div class="tr"><div><h1>Reports</h1><div class="sub">${ownOnly() ? "Your evaluation results. " : "Results by academic year and department. "}Ratings are sample data until real evaluations are collected; comment counts and sentiment come from the feedback records.</div></div><div class="fa"><button class="btn ghost" data-csv>Export CSV</button><button class="btn ghost" data-print>Print</button></div></div>
 <div class="filters"><select id="ry" aria-label="Academic year">${D.years.map(y => `<option value="${y.id}"${String(y.id) === yr() ? " selected" : ""}>${esc(y.name)} · ${esc(y.term)}</option>`).join("")}</select>${ownOnly() ? "" : `<select id="rd" aria-label="Department"><option value="">All departments</option>${depts().map(d => `<option${d === rd ? " selected" : ""}>${esc(d)}</option>`).join("")}</select>`}</div>
 <div class="grid st" style="grid-template-columns:repeat(3,1fr)">${statCards([["Faculty evaluated",n,"In this selection"],["Average rating",avg.toFixed(2) + " / " + r.sc,"Weighted by criteria"],["Needs review",low,"Below " + t + "% of the scale"]])}</div>
 <div class="card" style="margin-bottom:16px"><div class="ch"><div class="ct2">Results by criteria</div></div><div class="cb">${critBars(r)}</div></div>
 <div class="card"><div class="tw"><table><thead><tr><th>Faculty</th><th>Department</th><th>Subjects</th><th>Comments analyzed</th><th>Average rating</th><th>Positive comments</th><th>Result</th></tr></thead><tbody>${r.rows.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.dept)}</td><td>${x.subs}</td><td>${x.comments}</td><td>${x.avg.toFixed(2)} / ${r.sc}</td><td>${x.pos == null ? "—" : x.pos + "%"}</td><td><span class="bdg ${x.pct >= t ? "Active" : "Closed"}">${x.pct >= t ? "Meets target" : "Needs review"}</span></td></tr>`).join("")}</tbody></table></div>${n ? "" : '<div class="empty">No faculty match these filters.</div>'}</div>`;
}
function nlp() {
 const L = D.feedback.filter(f => SENTS.includes(f.manual)), n = L.length;
 const cm = SENTS.map(() => SENTS.map(() => 0)); L.forEach(f => cm[SENTS.indexOf(f.manual)][SENTS.indexOf(f.sentiment)]++);
 const ok = SENTS.reduce((a,_,i) => a + cm[i][i], 0);
 const m = SENTS.map((_,i) => { const tp = cm[i][i], sup = cm[i].reduce((a,b) => a + b, 0), pp = cm.reduce((a,row) => a + row[i], 0), p = pp ? tp / pp : 0, r = sup ? tp / sup : 0; return {p,r,f:p + r ? 2 * p * r / (p + r) : 0,sup} });
 const act = m.filter(x => x.sup), macro = act.length ? act.reduce((a,x) => a + x.f, 0) / act.length : 0;
 const langs = ["English","Filipino","Code-switched"].map(l => { const s = L.filter(f => f.language === l); return [l, s.length, s.length ? s.filter(f => f.manual === f.sentiment).length / s.length : null] });
 const bad = L.filter(f => f.manual !== f.sentiment);
 if (!n) return `<div class="tr"><div><h1>Sentiment Validation</h1><div class="sub">Compare system labels with manually labeled feedback.</div></div></div><div class="card"><div class="empty">No comments have a manual label yet. Add a manual label to feedback comments to see accuracy, precision, recall, F1-score and the confusion matrix.</div></div>`;
 return `<div class="tr"><div><h1>Sentiment Validation</h1><div class="sub">System labels compared with manually labeled feedback (validation record, Form D). Results describe this labeled set only.</div></div><div class="fa"><button class="btn ghost" data-nlpcsv>Export validation record</button></div></div>
 <div class="grid st" style="grid-template-columns:repeat(3,1fr)">${statCards([["Labeled comments",n,"In the validation set"],["Accuracy",pct(ok / n),ok + " of " + n + " correct"],["Macro F1-score",pct(macro),"Average across classes with data"]])}</div>
 <div class="grid two" style="margin-bottom:16px"><div class="card c4"><div class="ch"><div class="ct2">Confusion matrix</div></div><div class="cb tw"><table><thead><tr><th>Manual \\ System</th>${SENTS.map(s => `<th>${s}</th>`).join("")}</tr></thead><tbody>${SENTS.map((s,i) => `<tr><td><b>${s}</b></td>${cm[i].map((v,j) => `<td${i === j ? ' style="font-weight:700"' : ""}>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>
 <div class="card c3"><div class="ch"><div class="ct2">Accuracy by language</div></div><div class="cb tw"><table><thead><tr><th>Language</th><th>Comments</th><th>Accuracy</th></tr></thead><tbody>${langs.map(l => `<tr><td>${l[0]}</td><td>${l[1]}</td><td>${l[2] == null ? "—" : pct(l[2])}</td></tr>`).join("")}</tbody></table></div></div></div>
 <div class="card" style="margin-bottom:16px"><div class="ch"><div class="ct2">Precision, recall and F1-score</div></div><div class="cb tw"><table><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1-score</th><th>Support</th></tr></thead><tbody>${SENTS.map((s,i) => `<tr><td>${s}</td><td>${pct(m[i].p)}</td><td>${pct(m[i].r)}</td><td>${pct(m[i].f)}</td><td>${m[i].sup}</td></tr>`).join("")}</tbody></table></div></div>
 <div class="card"><div class="ch"><div><div class="ct2">Misclassified examples</div><div class="cd">Review these for patterns in language, context or code-switching.</div></div></div><div class="cb">${bad.length ? bad.map(f => `<div class="fb"><small>${esc(f.language)} · manual <b>${f.manual}</b> · system <b>${f.sentiment}</b></small><p>${esc(f.text)}</p></div>`).join("") : '<div class="cd">No misclassified comments in this set.</div>'}</div></div>`;
}
function evaluators() {
 const y = yr(), own = ownOnly(), me = own && sess ? (D.users.find(u => u.email === sess.email) || {}).name : null;
 const ev = D.evaluations.filter(e => String(e.year) === y && (!own || e.faculty === me));
 const subs = D.subjects.filter(s => !own || s.faculty === me);
 const rows = subs.map(s => { const n = ev.filter(e => e.code === s.code && e.type === "Student").length, exp = Number(s.enrolled) || 0; return {code:s.code,name:s.name,faculty:s.faculty,exp,n,rate:exp ? Math.min(1, n / exp) : null} });
 const exp = rows.reduce((a,r) => a + r.exp, 0), got = rows.reduce((a,r) => a + r.n, 0), t = thr();
 const types = ["Student","Peer","Supervisor"].map(k => [k, ev.filter(e => e.type === k).length]), mx = Math.max(1, ...types.map(x => x[1]));
 const mob = ev.filter(e => e.via === "Mobile app").length, low = rows.filter(r => r.rate != null && r.rate < .5).length;
 const recent = ev.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8), anon = D.settings.anonymous === "Yes";
 const hasSample = ev.some(e => e.sample);
 return `<div class="tr"><div><h1>Evaluators</h1><div class="sub">${own ? "Who has evaluated you. " : "Participation of student, peer and supervisor evaluators. "}${anon ? "Evaluators stay anonymous: only counts and times are shown. " : ""}${hasSample ? "Some records are sample data until real evaluations are imported." : ""}</div></div><div class="fa"><button class="btn ghost" data-evcsv>Export CSV</button></div></div>
 <div class="filters"><select id="ry" aria-label="Academic year">${D.years.map(a => `<option value="${a.id}"${String(a.id) === y ? " selected" : ""}>${esc(a.name)} · ${esc(a.term)}</option>`).join("")}</select></div>
 <div class="grid st">${statCards([["Expected evaluators",exp,"Enrolled students in these subjects"],["Student evaluations",got,"Submitted"],["Response rate",exp ? pct(got / exp) : "—","Submitted of expected"],["Via mobile app",mob,"Of " + ev.length + " submissions"]])}</div>
 <div class="grid" style="margin-bottom:16px"><div class="card"><div class="ch"><div><div class="ct2">Participation by subject</div><div class="cd">${low ? low + " subject(s) below 50% response" : "All subjects at or above 50% response"}</div></div></div><div class="tw"><table><thead><tr><th>Subject</th><th>Faculty</th><th>Submitted</th><th>Response</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.code)} · ${esc(r.name)}</td><td>${esc(r.faculty)}</td><td>${r.n} / ${r.exp}</td><td><div class="row" style="margin:0"><div class="track" style="min-width:70px"><div class="fill" style="width:${r.rate == null ? 0 : r.rate * 100}%"></div></div><div class="v">${r.rate == null ? "—" : Math.round(r.rate * 100) + "%"}</div></div></td></tr>`).join("") || '<tr><td colspan="4"><div class="empty">No subjects yet.</div></td></tr>'}</tbody></table></div></div>
 <div class="card"><div class="ch"><div><div class="ct2">Evaluators by type</div><div class="cd">Submitted evaluations</div></div></div><div class="cb">${types.map(x => `<div class="row"><div class="l">${x[0]}</div><div class="track"><div class="fill" style="width:${x[1] / mx * 100}%"></div></div><div class="v">${x[1]}</div></div>`).join("")}</div></div></div>
 <div class="card"><div class="ch"><div><div class="ct2">Recent submissions</div><div class="cd">${anon ? "Names are hidden by the anonymity setting" : "Anonymity is off: names are shown for web submissions"}</div></div></div><div class="tw"><table><thead><tr><th>When</th><th>Evaluator</th><th>Subject</th><th>Faculty</th><th>Via</th></tr></thead><tbody>${recent.map(e => `<tr><td>${esc(new Date(e.date).toLocaleString())}</td><td>${e.evaluator && !anon ? esc(e.evaluator) : "Anonymous " + esc(e.type.toLowerCase())}</td><td>${esc(e.code)}</td><td>${esc(e.faculty)}</td><td>${esc(e.via)}</td></tr>`).join("") || '<tr><td colspan="5"><div class="empty">No submissions yet for this term.</div></td></tr>'}</tbody></table></div></div>`;
}
function auditView() {
 const q = $("#q").value.toLowerCase(), rows = D.audit.filter(a => !q || (a.user + a.action).toLowerCase().includes(q));
 return `<div class="tr"><div><h1>Audit Log</h1><div class="sub">Who changed what, and when. Kept for accountability and review.</div></div></div><div class="card"><div class="tw"><table><thead><tr><th>Time</th><th>User</th><th>Action</th></tr></thead><tbody>${rows.map(a => `<tr><td>${esc(new Date(a.time).toLocaleString())}</td><td>${esc(a.user)}</td><td>${esc(a.action)}</td></tr>`).join("")}</tbody></table></div>${rows.length ? "" : '<div class="empty">No activity recorded yet.</div>'}</div>`;
}
function settings() {
 return `<div class="tr"><div><h1>Institution Settings</h1><div class="sub">Set names, terms, scales, privacy and appearance to match how your institution works.</div></div></div><div class="card"><form id="sform" class="sf" novalidate>${SET().map(f => fieldHTML(f, D.settings)).join("")}<div class="fa"><button class="btn" type="submit">Save settings</button></div></form></div>`;
}
function table(key) {
 const c = E[key], q = $("#q").value.toLowerCase(), rows = D[key].filter(r => !q || JSON.stringify(r).toLowerCase().includes(q));
 return `<div class="tr"><div><h1>${c.title}</h1><div class="sub">${c.desc}</div></div><button class="btn" data-add>${PLUS}Add ${c.one}</button></div>${c.note ? c.note() : ""}
 <div class="card"><div class="tw"><table><thead><tr>${c.cols.map(x => `<th>${x[1]}</th>`).join("")}<th></th></tr></thead><tbody>${rows.map(r => `<tr>${c.cols.map(x => { const v = x[2] ? x[2](r[x[0]], r) : r[x[0]]; return `<td>${x[0] === "status" || x[0] === "sentiment" ? `<span class="bdg ${esc(v)}">${esc(v)}</span>` : esc(v)}</td>` }).join("")}<td class="act"><button class="ib" data-edit="${r.id}" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button><button class="ib" data-del="${r.id}" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></td></tr>`).join("")}</tbody></table></div>${rows.length ? "" : `<div class="empty">No ${c.title.toLowerCase()} found. Use “Add ${c.one}” to create one.</div>`}</div>`;
}
function render() {
 applyBrand(D.settings.brandColor);
 $("#view").innerHTML = {dashboard,reports,evaluators,settings,nlp,audit:auditView}[page] ? {dashboard,reports,evaluators,settings,nlp,audit:auditView}[page]() : table(page);
 document.querySelectorAll(".nav").forEach(n => n.classList.toggle("on", n.dataset.p === page));
}
function applyBrand(c, t) {
 const s = document.documentElement.style;
 ["--pri","--prif","--ring","--side","--muted","--bd"].forEach(p => s.removeProperty(p));
 if (!/^#[0-9a-f]{6}$/i.test(c || "")) return;
 if (t === undefined) t = D.settings.tint;
 const dark = document.documentElement.classList.contains("dark"), lum = x => (.2126 * x[0] + .7152 * x[1] + .0722 * x[2]) / 255, base = toRgb(c);
 const rgb = dark && lum(base) < .35 ? mix(base, [255,255,255], .45) : base, hex = toHex(rgb);
 s.setProperty("--pri", hex); s.setProperty("--ring", hex); s.setProperty("--prif", lum(rgb) > .6 ? "#171717" : "#ffffff");
 if (t === "Tinted") {
  const b = dark ? [10,10,10] : [255,255,255], k = dark ? [.10,.16,.22] : [.05,.10,.18];
  s.setProperty("--side", toHex(mix(b, base, k[0]))); s.setProperty("--muted", toHex(mix(b, base, k[1]))); s.setProperty("--bd", toHex(mix(b, base, k[2])));
 }
}
function preview() {
 const i = $("#f_brandColor"), t = $("#f_tint"); if (!i) return;
 applyBrand(i.dataset.def === "1" ? "" : i.value, t ? t.value : undefined);
 const sh = $("#shades"); if (sh) sh.innerHTML = shadeHTML(i.value);
}
function brand() { applyBrand(D.settings.brandColor); $(".brand b").textContent = D.settings.name; $(".brand small").textContent = "DDFES-FA Admin"; document.title = D.settings.name + " – Faculty Evaluation" }
function applyNav() {
 document.querySelectorAll(".nav").forEach(n => { n.hidden = !can(NAV[n.dataset.p]) });
 document.querySelectorAll(".grp").forEach(g => { let el = g.nextElementSibling, any = false; while (el && !el.classList.contains("grp")) { if (!el.hidden) any = true; el = el.nextElementSibling } g.hidden = !any });
}
function go(p) { if (NAV[p] && !can(NAV[p])) p = "dashboard"; page = p; $("#q").value = ""; render(); side(false); window.scrollTo(0, 0) }

/* ---------- dialog ---------- */
function openForm(id) {
 const c = E[page], rec = id ? D[page].find(r => r.id === id) : (page === "forms" ? {scale:D.settings.scale} : {});
 editing = id || null;
 $("#dt").textContent = (id ? "Edit " : "Add ") + c.one;
 $("#ff").innerHTML = c.f().map(f => fieldHTML(f, rec)).join("");
 $("#dlg").showModal();
 const first = $("#ff input,#ff select,#ff textarea"); if (first) first.focus();
}
$("#form").addEventListener("submit", e => {
 e.preventDefault();
 const c = E[page], fs = c.f(), {rec, errs} = collect(fs);
 if (c.validate) merge(errs, c.validate(rec, editing));
 if (!showErrs(fs, errs)) return;
 if (c.before) c.before(rec, editing);
 if (editing) { rec.id = editing; D[page] = D[page].map(r => r.id === editing ? rec : r) } else { rec.id = Date.now(); D[page].push(rec) }
 if (c.after) c.after(rec);
 log((editing ? "Updated " : "Created ") + c.one + ": " + lab(rec));
 save(); $("#dlg").close(); applyNav(); render(); toast((editing ? "Updated " : "Created ") + c.one);
});
$("#cancel").addEventListener("click", () => $("#dlg").close());

/* ---------- events ---------- */
$("#view").addEventListener("submit", e => {
 if (e.target.id !== "sform") return;
 e.preventDefault();
 const fs = SET(), {rec, errs} = collect(fs);
 if (!rec.departments.split(",").some(s => s.trim())) errs.departments = "Add at least one department";
 if (!showErrs(fs, errs)) return;
 D.settings = rec; log("Updated institution settings"); save(); brand(); toast("Settings saved");
});
$("#view").addEventListener("click", e => {
 const b = e.target.closest("button"); if (!b) return;
 if (b.hasAttribute("data-evcsv")) {
  const y = yr(); return download("evaluators-" + y + ".csv", [["Date","Evaluator type","Subject","Faculty","Via"]].concat(D.evaluations.filter(e => String(e.year) === y && (!ownOnly() || e.faculty === ((D.users.find(u => u.email === sess.email) || {}).name))).map(e => [e.date,e.type,e.code,e.faculty,e.via])));
 }
 if (b.id === "impbtn") {
  let j; try { j = JSON.parse($("#imp").value) } catch (x) { return toast("That is not valid JSON.") }
  if (!j || j.format !== "ddfes-evaluations-v1" || !Array.isArray(j.responses)) return toast("Unrecognized export file.");
  let n = 0; const ay = (curYear() || {}).id;
  j.responses.forEach(r => { D.evaluations.push({id:Date.now() + Math.random(),code:r.offeringCode,faculty:r.faculty,type:"Student",year:ay,date:new Date().toISOString(),via:"Mobile app",ratings:r.ratings}); const t = String(r.comment || "").trim(); if (!t) return; D.feedback.push(enrich({id:Date.now() + n,text:t,faculty:r.faculty,source:"Student",manual:""})); n++ });
  log("Imported " + j.responses.length + " evaluation(s) from mobile app"); save(); render(); return toast(j.responses.length + " evaluation(s) imported, " + n + " with comments.");
 }
 if (b.hasAttribute("data-add")) openForm();
 else if (b.dataset.edit) openForm(Number(b.dataset.edit));
 else if (b.dataset.del) {
  const c = E[page], rec = D[page].find(r => r.id === Number(b.dataset.del)), why = c.canDelete && c.canDelete(rec);
  if (why) return toast(why);
  if (confirm("Delete this " + c.one + "? This can't be undone.")) {
   D[page] = D[page].filter(r => r.id !== rec.id);
   if (page === "criteria") D.forms.forEach(f => { f.criteria = f.criteria.filter(i => i !== rec.id) });
   log("Deleted " + c.one + ": " + lab(rec)); save(); render(); toast("Deleted " + c.one);
  }
 }
 else if (b.hasAttribute("data-color")) {
  const i = $("#f_brandColor"), c = b.dataset.color;
  if (c) { i.value = c; i.dataset.def = "0" } else i.dataset.def = "1";
  preview();
 }
 else if (b.hasAttribute("data-analyze")) {
  const t = $("#at").value.trim(), out = $("#ares");
  if (!t) { out.innerHTML = '<div class="err">Type a comment first.</div>'; return }
  const a = analyze(t);
  out.innerHTML = `<div class="fb"><span class="bdg ${a.sentiment}">${a.sentiment}</span> <small>Language: <b>${a.language}</b> · Score: ${a.score}</small><div class="chips">${a.keywords.map(k => `<span class="chip">${esc(k)}</span>`).join("") || '<span class="cd">No keywords found.</span>'}</div><p class="cd">Preprocessed: ${esc(a.clean)}</p></div>`;
 }
 else if (b.hasAttribute("data-print")) window.print();
 else if (b.hasAttribute("data-csv")) {
  const r = report(yr(), rd), L = [["Faculty","Department","Subjects","Comments analyzed","Average (of " + r.sc + ")","Average %","Positive comments %","Result"]];
  r.rows.forEach(x => L.push([x.name,x.dept,x.subs,x.comments,x.avg.toFixed(2),x.pct.toFixed(0),x.pos == null ? "" : x.pos,x.pct >= thr() ? "Meets target" : "Needs review"]));
  download("faculty-report.csv", L);
 }
 else if (b.hasAttribute("data-nlpcsv")) {
  const L = [["ID","De-identified Feedback","Language","Manual/Gold Label","System Label","Correct?","Extracted Keyword(s)","Reviewer Note"]];
  D.feedback.filter(f => SENTS.includes(f.manual)).forEach(f => L.push(["NLP" + String(D.feedback.indexOf(f) + 1).padStart(3,"0"),f.text,f.language,f.manual,f.sentiment,f.manual === f.sentiment ? "Yes" : "No",f.keywords,""]));
  download("nlp-validation-record.csv", L);
 }
});
$("#view").addEventListener("input", e => { if (e.target.id === "f_brandColor") { e.target.dataset.def = "0"; preview() } });
$("#view").addEventListener("change", e => { if (e.target.id === "ry") { ry = e.target.value; render() } else if (e.target.id === "rd") { rd = e.target.value; render() } else if (e.target.id === "f_tint") preview() });
document.querySelectorAll(".nav").forEach(n => n.addEventListener("click", () => go(n.dataset.p)));
$("#q").addEventListener("input", () => { if (E[page] || page === "audit") render() });
function side(o) { $("#side").classList.toggle("open", o); $("#scrim").classList.toggle("open", o) }
$("#menu").addEventListener("click", () => side(true));
$("#scrim").addEventListener("click", () => side(false));
document.addEventListener("keydown", e => { if (e.key === "Escape") side(false) });

/* ---------- theme ---------- */
const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>', MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
function theme(d) { document.documentElement.classList.toggle("dark", d); applyBrand(D.settings.brandColor); $("#ti").innerHTML = d ? SUN : MOON; try { localStorage.setItem("fes-theme", d ? "d" : "l") } catch (e) {} }
let st = null; try { st = localStorage.getItem("fes-theme") } catch (e) {}
theme(st ? st === "d" : matchMedia("(prefers-color-scheme: dark)").matches);
$("#theme").addEventListener("click", () => theme(!document.documentElement.classList.contains("dark")));

/* ---------- session ---------- */
if (sess && sess.name) {
 $(".me b").textContent = sess.name; $(".me small").textContent = sess.role || sess.email;
 $(".me .av").textContent = sess.name.replace(/^(Dr|Prof|Engr)\.\s*/, "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
$("#logout").addEventListener("click", () => { log("Signed out"); save(); try { sessionStorage.removeItem("fes-session"); localStorage.removeItem("fes-session") } catch (e) {} location.replace("login.html") });
brand(); applyNav(); render();
})();
