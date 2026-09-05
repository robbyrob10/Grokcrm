function stmtPaper(l, ai, si, page) {
  const a = accountsOf(l)[ai];
  const s = a.stmts[si];
  const pages = s.pages || 6;
  const p = Math.max(0, Math.min(pages - 1, page|0));
  if (p === 0) {
    return `<div class="stamp">SCANNED · ${p+1}/${pages}</div>
      <div class="bank">${esc(a.name.toUpperCase())}</div>
      <h2>Business checking · ${esc(s.m)}</h2>
      <table>
        <tr><th>Account holder</th><td>${esc(l.company)}</td></tr>
        <tr><th>Account number</th><td>${esc(a.acct)}</td></tr>
        <tr><th>Period</th><td>${esc(s.m)}</td></tr>
        <tr><th>Total deposits</th><td class="end">${money(s.dep)}</td></tr>
        <tr><th>Ending balance</th><td class="end">${money(s.end)}</td></tr>
      </table>
      <p style="margin-top:22px;font-size:12px;line-height:1.55;color:#5C564C">Page 1 of ${pages}. Use the arrows for subsequent activity pages. Figures as reported by ${esc(a.name)}.</p>`;
  }
  const rows = Array.from({length: 12}, (_, i) => {
    const day = 1 + ((p * 12 + i) % 28);
    const amt = Math.round((s.dep / (pages * 11)) * (0.7 + ((i * 3 + p) % 5) * 0.12));
    const names = ["ACH credit · batch", "Card settlement", "Wire in", "Counter credit", "ACH debit · vendor", "Payroll", "Rent draft"];
    const nm = names[(i + p) % names.length];
    const credit = !/debit|payroll|rent/i.test(nm);
    return `<tr><td>${esc(s.m.slice(0,3))} ${day}</td><td>${nm}</td><td class="end">${credit ? money(amt) : "\u2212" + money(amt)}</td></tr>`;
  }).join("");
  return `<div class="stamp">SCANNED · ${p+1}/${pages}</div>
    <div class="bank">${esc(a.name.toUpperCase())}</div>
    <h2>Activity · ${esc(s.m)} · p. ${p+1}</h2>
    <table>
      <tr><th>Date</th><th>Description</th><th>Amount</th></tr>
      ${rows}
    </table>
    <p style="margin-top:18px;font-size:12px;color:#5C564C">Continued · ${esc(a.acct)}</p>`;
}
function fmtElapsed(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return String(m).padStart(2,"0") + ":" + String(r).padStart(2,"0");
}
function filtered() {
  let list = LEADS.slice();
  if (state.filter === "mine") list = list.filter(l => l.rep === "Cole Brennan");
  if (state.filter === "star") list = list.filter(l => state.fav.has(l.id));
  if (state.filter === "today") list = list.filter(l => state.follow[l.id] === "2026-09-05");
  const q = state.query.trim().toLowerCase();
  if (q) list = list.filter(l => (l.company + l.contact + l.mobiles.map(p=>p.n).join(" ") + l.emails.map(e=>e.n).join(" ")).toLowerCase().includes(q));
  return list;
}
function qactPhone(n, who, sms, wa) {
  return `<div class="qacts">
    <button title="Call" data-act="call" data-n="${esc(n)}" data-who="${esc(who)}">${ico("phone",15)}</button>
    ${sms ? `<button title="SMS" data-act="sms" data-n="${esc(n)}">${ico("sms",15)}</button>` : ""}
    ${wa ? `<button title="WhatsApp" data-act="wa" data-n="${esc(n)}">${ico("wa",15)}</button>` : ""}
  </div>`;
}
function applyWidths() {
  const r = storeGet(LS.rail);
  const d = storeGet(LS.dock);
  document.documentElement.style.setProperty("--rail-w", (r ? +r : 400) + "px");
  document.documentElement.style.setProperty("--dock-w", (d ? +d : 500) + "px");
}
function placePad() {
  const pop = $("padPop");
  const dock = $("dock");
  if (!pop || !dock) return;
  if (!state.keypadOpen) { pop.classList.remove("open"); return; }
  const r = dock.getBoundingClientRect();
  pop.style.left = (r.right - 244) + "px";
  pop.style.top = (r.bottom - 75 - 12 - 214) + "px";
  pop.classList.add("open");
  pop.innerHTML = `<div class="pad">${[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*",""],["0","+"],["#",""]].map(([n,l]) =>
    `<button data-act="dtmf" data-k="${n}">${n}${l?`<small>${l}</small>`:""}</button>`).join("")}</div>`;
}

function renderRail() {
  const list = filtered();
  $("rail").innerHTML = `
    <div class="rail-head">
      <h2>Leads <span class="dim">${list.length}</span></h2>
      <button class="btn" style="margin-left:auto;height:28px;padding:0 10px" data-act="toast" data-msg="New lead is read-only in this desk.">${ico("plus",14)} New</button>
    </div>
    <div class="filters">
      ${[["all","All"],["mine","Mine"],["star","Starred"],["today","Due today"]].map(([k,l]) =>
        `<button class="chip ${state.filter===k?"on":""}" data-act="filter" data-k="${k}">${l}</button>`).join("")}
    </div>
    <div class="lead-list pane">
      ${list.map((l,i) => `
        <button class="lead-row ${l.id===state.selected?"on":""}" data-act="select" data-id="${l.id}">
          <span class="idx">${i+1}</span>
          <span class="av" style="background:${hue(l.company)}">${esc(initials(l.contact))}</span>
          <span>
            <div class="co">${esc(l.company)}</div>
            <div class="nm">${esc(displayName(l.contact))}</div>
          </span>
          <span class="right">
            <span class="amt">${money(l.avg)}</span>
            <span class="ago">${esc(l.lastAgo)}</span>
          </span>
        </button>`).join("") || `<div class="empty">No leads match.</div>`}
    </div>`;
}
