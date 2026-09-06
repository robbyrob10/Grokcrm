function contactBlock(l) {
  const mobs = l.mobiles || [];
  const lands = l.landlines || [];
  const n = Math.max(mobs.length, lands.length);
  let html = "";
  for (let i = 0; i < n; i++) {
    const m = mobs[i];
    const d = lands[i];
    const left = m ? kv(m.l || "Mobile", esc(m.n), qactPhone(m.n, l.contact, true, true)) : "";
    const right = d ? kv(d.l || "Landline", esc(d.n), qactPhone(d.n, l.contact, false, false)) : "";
    html += pair(left, right);
  }
  const ems = l.emails || [];
  for (let i = 0; i < ems.length; i += 2) {
    const a = ems[i], b = ems[i + 1];
    const left = a ? kv(a.l || "Email", esc(a.n), `<div class="qacts"><button title="Email" data-act="email-one" data-n="${esc(a.n)}">${ico("mail",15)}</button></div>`) : "";
    let right = "";
    if (b) {
      right = kv(b.l || "Email", esc(b.n), `<div class="qacts"><button title="Email" data-act="email-one" data-n="${esc(b.n)}">${ico("mail",15)}</button></div>`);
    } else {
      right = `<div class="kv"><button class="email-all" data-act="email-all">Email All</button></div>`;
    }
    html += pair(left, right);
  }
  if (ems.length && ems.length % 2 === 0) html += pair(`<div class="kv"><button class="email-all" data-act="email-all">Email All</button></div>`, "");
  return html || `<div class="muted">No contact on file.</div>`;
}
function monthKv(a, ai, s, si) {
  if (!s) return "";
  const lab = monthShort(s.m);
  return `<button type="button" class="stmt-kv" data-act="stmt" data-ai="${ai}" data-si="${si}" title="Open ${esc(lab)} statement">
    <div class="k">${esc(lab)}</div>
    <div class="v">${money(s.dep)} <span class="end">${money(s.end)}</span></div>
  </button>`;
}
function statementsBlock(l) {
  const accts = accountsOf(l).slice(0, 2);
  if (!accts.length) return `<div class="muted">No statements</div>`;
  return `<div class="banks${accts.length > 1 ? " two" : ""}">${accts.map((a, ai) => {
    const months = (a.stmts || []).slice(0, 2);
    return `<div class="bank-col">
      ${pair(kv("Bank", esc(a.name)), kv("Account", `<span class="num">${esc(a.acct)}</span>`))}
      ${pair(monthKv(a, ai, months[0], 0), monthKv(a, ai, months[1], 1))}
    </div>`;
  }).join("")}</div>`;
}
function filesStrip(l) {
  const rank = {APP:0,JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12,MTD:13};
  const items = (l.files || []).map((f, i) => ({ i, lab: fileShort(f) }))
    .filter(x => x.lab)
    .sort((a, b) => (rank[a.lab] ?? 50) - (rank[b.lab] ?? 50));
  if (!items.length) return "";
  return `<div class="files-row">${items.map(x =>
    `<button type="button" class="file-doc" data-act="file" data-i="${x.i}" title="${esc(x.lab)}">
      <span class="paper"><i class="fold"></i><span class="lab">${esc(x.lab)}</span></span>
    </button>`
  ).join("")}</div>`;
}
function actKind(what) {
  const w = String(what || "").toLowerCase();
  if (/call/.test(w)) return {ico:"phone", verb:"Call"};
  if (/email|mail/.test(w)) return {ico:"mail", verb:"Email"};
  if (/whatsapp|\bwa\b/.test(w)) return {ico:"wa", verb:"Chat"};
  if (/sms|text/.test(w)) return {ico:"sms", verb:"SMS"};
  return {ico:"doc", verb:"Note"};
}
function actShort(what) {
  let s = String(what || "");
  s = s.replace(/^(SMS|Email|Call|WhatsApp|Mail)(\s+sent)?[^·]*·\s*/i, "");
  s = s.replace(/^to\s+[^·]+·\s*/i, "");
  const parts = s.split("·").map(x => x.trim()).filter(Boolean);
  if (parts.length > 2) s = parts.slice(0, 2).join(" · ");
  if (s.length > 48) s = s.slice(0, 46) + "…";
  return s;
}
function activityBlock(l) {
  const items = l.activity || [];
  const shown = state.actOpen ? items : items.slice(0, 2);
  const more = items.length - 2;
  return `<div class="below">
    <div class="pitch-block">
      <div class="k">Why this deal</div>
      <p class="pitch">${esc(l.pitch)}</p>
    </div>
    <div class="act-block">
      <div class="k">Activity</div>
      ${shown.map(a => {
        const k = actKind(a.what);
        return `<div class="act-row">
          <span class="act-ico">${ico(k.ico, 14)}</span>
          <span class="act-verb">${k.verb}</span>
          <span class="act-txt">${esc(actShort(a.what))}</span>
          <span class="act-when">${esc(a.when)}</span>
        </div>`;
      }).join("")}
      ${more > 0 ? `<button type="button" class="act-more" data-act="act-toggle">${state.actOpen ? "▴ close" : "▾ " + more}</button>` : ""}
    </div>
  </div>`;
}
function renderDesk() {
  const l = lead();
  const site = l.website ? `<a class="web" href="https://${esc(l.website)}" target="_blank" rel="noopener">${esc(l.website)}</a>` : "";
  const home = l.appAddress && l.appAddress !== l.address ? l.appAddress : l.address;
  const rev = roundRev(l.avg);
  const appr = rev + 150000;
  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-main">
          <div class="rec-title"><h1>${esc(l.company)}</h1>${site}</div>
        </div>
        <div class="money">
          <div><div class="k">Revenue</div><div class="v">${money(rev)}</div></div>
          <div><div class="k">Approval</div><div class="v">${money(appr)}</div></div>
        </div>
      </div>
      <div class="sheet-x">
        <div class="quad">
          <h3>Owner</h3>
          ${pair(kv("Name", esc(displayName(l.contact))), kv("Title", esc(l.title)))}
          ${pair(kv("SSN", esc(l.ssn)), kv("DOB", esc(l.dob)))}
          ${pair(kv("Home", esc(home)))}
        </div>
        <div class="quad">
          <h3>Business</h3>
          ${pair(kv("EIN", esc(l.ein)), kv("Industry", esc(l.industry)))}
          ${pair(kv("Time in business", esc(l.tib)), kv("Ownership", esc(ownPct(l))))}
          ${pair(kv("Office", esc(l.address)))}
        </div>
        <div class="quad r2">
          <h3>Contact</h3>
          ${contactBlock(l)}
        </div>
        <div class="quad r2">
          <h3>Statements</h3>
          ${statementsBlock(l)}
        </div>
      </div>
      ${filesStrip(l)}
      ${activityBlock(l)}
    </div>`;
}

function renderDock() {
  const l = lead();
  const unread = l.sms.filter(m => m.dir === "in").length ? 1 : 0;
  if (!state.threadN) state.threadN = l.mobiles[0].n;
  $("dock").innerHTML = `
    <div class="dock-head"><h2>Communications</h2><span class="dim" style="margin-left:auto">${esc(displayName(l.contact))}</span></div>
    <div class="dock-tabs">
      ${[["all","All"],["msg","Messages"],["calls","Call log"],["people","Contacts"],["mail","Email"]].map(([k,lab]) =>
        `<button class="${state.commsTab===k?"on":""}" data-act="comms-tab" data-k="${k}">${lab}${k==="msg" && unread ? ` <span class="unread">${unread}</span>` : ""}</button>`).join("")}
    </div>
    <div class="dock-body" id="commsBody">${renderComms(l)}</div>
    <div class="dialer" id="dialer">${renderDialer(l, state.dial)}</div>`;
  placePad();
}

function threadMsgs(l) {
  const n = state.threadN || l.mobiles[0].n;
  const ch = state.threadCh || "sms";
  return l.sms.filter(m => (m.n || l.mobiles[0].n) === n && (m.ch || "sms") === ch);
}
