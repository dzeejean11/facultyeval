(() => {
const KEY = "fes-admin-v2", SK = "fes-session", $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let sess = null; try { sess = JSON.parse(sessionStorage.getItem(SK) || localStorage.getItem(SK)) } catch (e) {}
if (!sess || sess.role !== "Student Evaluator") { location.replace("login.html"); return }

/* ---- storage (shared with the admin site) ---- */
function load() {
 let d = null; try { d = JSON.parse(localStorage.getItem(KEY)) } catch (e) {}
 d = d || {};
 for (const k in window.FES_SEED) if (!d[k]) d[k] = JSON.parse(JSON.stringify(window.FES_SEED[k]));
 d.evaluations = d.evaluations || []; d.receipts = d.receipts || [];
 return d;
}
const store = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); return true } catch (e) { return false } };
let D = load();

/* ---- branding ---- */
(function brand() {
 const st = D.settings || {}; $("#inst").textContent = st.name || "Faculty Evaluation"; document.title = "Student Portal – " + (st.name || "Faculty Evaluation");
 const c = st.brandColor; if (!/^#[0-9a-f]{6}$/i.test(c || "")) return;
 let rgb = [1,3,5].map(i => parseInt(c.slice(i, i + 2), 16)); const lum = x => (.2126 * x[0] + .7152 * x[1] + .0722 * x[2]) / 255, root = document.documentElement, dk = root.classList.contains("dark");
 if (dk && lum(rgb) < .35) rgb = rgb.map(v => Math.round(v + (255 - v) * .45));
 const hex = "#" + rgb.map(v => v.toString(16).padStart(2, "0")).join(""), s = root.style;
 s.setProperty("--pri", hex); s.setProperty("--ring", hex); s.setProperty("--prif", lum(rgb) > .6 ? "#171717" : "#ffffff");
})();
$("#theme").addEventListener("click", () => { const dk = document.documentElement.classList.toggle("dark"); try { localStorage.setItem("fes-theme", dk ? "d" : "l") } catch (e) {} });
$("#logout").addEventListener("click", () => { try { sessionStorage.removeItem(SK); localStorage.removeItem(SK) } catch (e) {} location.replace("login.html") });
$("#who").textContent = sess.name;
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2800) };

/* ---- what this student can evaluate ---- */
const me = () => D.users.find(u => String(u.email).toLowerCase() === String(sess.email).toLowerCase()) || {};
const year = () => D.years.find(y => y.status === "Active");
const form = () => D.forms.find(f => f.audience === "Student evaluates faculty" && f.status === "Published");
function criteria() {
 const f = form(), act = D.criteria.filter(c => c.status === "Active");
 return f ? f.criteria.map(id => act.find(c => c.id === id)).filter(Boolean) : act;
}
const scale = () => Number((form() || {}).scale || D.settings.scale || 5);
const commentMode = () => (form() || {}).comments || "Optional";
function offerings() { const d = me().department; return D.subjects.filter(s => !d || s.department === d) }
const mine = y => D.receipts.filter(r => r.email === sess.email && String(r.year) === String(y.id));
const done = (y, code) => mine(y).some(r => r.code === code);

/* ---- views ---- */
let state = {view:"home", code:null};
function render() {
 D = load();
 const y = year(), v = $("#view");
 if (!y) { v.innerHTML = `<h1>Student Portal</h1><div class="card empty2">No evaluation period is open right now. Please check again later.</div>`; return }
 if (!form() && !D.criteria.some(c => c.status === "Active")) { v.innerHTML = `<h1>Student Portal</h1><div class="card empty2">The evaluation form is not ready yet. Please check again later.</div>`; return }
 if (state.view === "eval") { const o = offerings().find(s => s.code === state.code); if (o && !done(y, o.code)) return evalView(v, y, o); state.view = "home" }
 home(v, y);
}
function home(v, y) {
 const subs = offerings(), n = subs.filter(s => done(y, s.code)).length, left = subs.length - n, pct = subs.length ? n / subs.length * 100 : 0;
 const hist = mine(y).slice().sort((a, b) => b.date.localeCompare(a.date));
 v.innerHTML = `<h1>Hello, ${esc(sess.name.split(" ")[0])}</h1>
 <div class="sub">Evaluate your teachers for <span class="pill">${esc(y.name)} · ${esc(y.term)}</span></div>
 <div class="grid st" style="grid-template-columns:repeat(3,1fr);margin-top:20px;margin-bottom:0">
  <div class="card"><div class="ch"><h3>Subjects</h3></div><div class="cb"><div class="big">${subs.length}</div><div class="ss">This term</div></div></div>
  <div class="card"><div class="ch"><h3>Submitted</h3></div><div class="cb"><div class="big">${n}</div><div class="ss">Evaluations</div></div></div>
  <div class="card"><div class="ch"><h3>To do</h3></div><div class="cb"><div class="big">${left}</div><div class="ss">${left ? "Still to evaluate" : "All done"}</div></div></div></div>
 <div class="prog"><div class="track" role="img" aria-label="${n} of ${subs.length} evaluations submitted"><div class="fill" style="width:${pct}%"></div></div></div>
 <h2 style="font-size:16px;margin-bottom:12px">My subjects</h2>
 ${subs.length ? `<div class="subs">${subs.map(s => `<div class="card sc"><b>${esc(s.code)} · ${esc(s.name)}</b><span class="m">${esc(s.faculty)}</span>${done(y, s.code) ? '<div class="done">Submitted ✓</div>' : `<button class="btn" data-ev="${esc(s.code)}">Evaluate</button>`}</div>`).join("")}</div>` : '<div class="card empty2">No subjects are listed for your department yet. Please contact the administrator.</div>'}
 ${hist.length ? `<h2 style="font-size:16px;margin-bottom:12px">My submissions</h2><div class="card"><div class="tw"><table><thead><tr><th>Subject</th><th>Faculty</th><th>Submitted</th></tr></thead><tbody>${hist.map(r => `<tr><td>${esc(r.code)}</td><td>${esc(r.faculty)}</td><td>${esc(new Date(r.date).toLocaleString())}</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
}
function evalView(v, y, o) {
 const sc = scale(), cm = commentMode(), anon = D.settings.anonymous === "Yes";
 v.innerHTML = `<button class="btn ghost sm back" data-back>← Back</button>
 <h1>${esc(o.name)}</h1><div class="sub">${esc(o.code)} · ${esc(o.faculty)} · ${esc(y.name)} ${esc(y.term)}</div>
 <div class="note2">${anon ? "Your evaluation is anonymous. Your name is not attached to your ratings or comments. We only keep a record that you submitted, so you can't submit twice." : "Your evaluation will be linked to your name."} Please be honest, specific and respectful.</div>
 <form id="ef" novalidate>${criteria().map(c => `<fieldset class="card q" data-c="${c.id}" style="border:1px solid var(--bd)"><legend class="sr" style="position:absolute;left:-9999px">${esc(c.name)}</legend><h3>${esc(c.name)}</h3><div class="d">${esc(c.description)}</div><div class="rate">${Array.from({length:sc}, (_, i) => `<label><input type="radio" name="c${c.id}" value="${i + 1}" aria-label="${esc(c.name)}: ${i + 1} of ${sc}"><span>${i + 1}</span></label>`).join("")}</div><div class="ends"><span>1 = Poor</span><span>${sc} = Excellent</span></div><div class="errt" hidden>Choose a rating</div></fieldset>`).join("")}
 ${cm === "Off" ? "" : `<div class="card q" id="cq"><h3>Comments ${cm === "Required" ? "" : "(optional)"}</h3><div class="d">What did your teacher do well? What could be better? English, Filipino or mixed is fine.</div><textarea class="cm" id="cm" maxlength="1000" aria-label="Comments"></textarea><div class="errt" hidden>Please write a comment</div></div>`}
 <div class="fa" style="justify-content:flex-start"><button class="btn" type="submit">Submit evaluation</button><button class="btn ghost" type="button" data-back>Cancel</button></div></form>`;
}

/* ---- events ---- */
$("#view").addEventListener("click", e => {
 const b = e.target.closest("button"); if (!b) return;
 if (b.dataset.ev) { state = {view:"eval", code:b.dataset.ev}; render(); window.scrollTo(0, 0) }
 else if (b.hasAttribute("data-back")) { state = {view:"home"}; render(); window.scrollTo(0, 0) }
});
$("#view").addEventListener("change", e => { const q = e.target.closest(".q"); if (q && e.target.type === "radio") { q.classList.remove("bad"); q.querySelector(".errt").hidden = true } });
$("#view").addEventListener("input", e => { if (e.target.id === "cm" && e.target.value.trim()) { $("#cq").classList.remove("bad"); $("#cq .errt").hidden = true } });
let pending = null;
$("#view").addEventListener("submit", e => {
 e.preventDefault(); if (e.target.id !== "ef") return;
 const ratings = {}; let ok = true, first = null;
 criteria().forEach(c => {
  const r = e.target.querySelector(`input[name="c${c.id}"]:checked`), box = e.target.querySelector(`[data-c="${c.id}"]`);
  box.classList.toggle("bad", !r); box.querySelector(".errt").hidden = !!r;
  if (r) ratings[c.id] = Number(r.value); else { ok = false; first = first || box }
 });
 const cmEl = $("#cm"), text = cmEl ? cmEl.value.trim() : "";
 if (cmEl && commentMode() === "Required" && !text) { ok = false; $("#cq").classList.add("bad"); $("#cq .errt").hidden = false; first = first || $("#cq") } else if (cmEl) { $("#cq").classList.remove("bad"); $("#cq .errt").hidden = true }
 if (!ok) { first.scrollIntoView({block:"center"}); return }
 pending = {ratings, text};
 $("#cmsg").textContent = "You can't change it after submitting.";
 $("#cdlg").showModal();
});
$("#cno").addEventListener("click", () => $("#cdlg").close());
$("#cyes").addEventListener("click", () => {
 $("#cdlg").close();
 const fresh = load(), y = fresh.years.find(a => a.status === "Active"), o = D.subjects.find(s => s.code === state.code);
 if (!y || !o || !pending) return;
 if (fresh.receipts.some(r => r.email === sess.email && String(r.year) === String(y.id) && r.code === o.code)) { toast("You already evaluated this subject."); state = {view:"home"}; return render() }
 const now = new Date().toISOString(), anon = fresh.settings.anonymous === "Yes", ev = {id:Date.now(), code:o.code, faculty:o.faculty, type:"Student", year:y.id, date:now, via:"Web", ratings:pending.ratings};
 if (!anon) ev.evaluator = sess.name;
 fresh.evaluations.push(ev);
 fresh.receipts.push({email:sess.email, code:o.code, faculty:o.faculty, year:y.id, date:now});
 if (pending.text) { fresh.feedback = fresh.feedback || []; fresh.feedback.push({id:Date.now() + 1, text:pending.text, faculty:o.faculty, source:"Student", manual:""}) }
 if (!store(fresh)) return toast("Your browser blocked saving. Allow site data and try again.");
 pending = null; state = {view:"home"}; render(); window.scrollTo(0, 0); toast("Evaluation submitted. Thank you!");
});
render();
})();
