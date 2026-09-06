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
  return `<div class="file-strip" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(x =>
    `<button type="button" class="file-chip" data-act="file" data-i="${x.i}">${esc(x.lab)}</button>`
  ).join("")}</div>`;
}
function renderDesk() {
  const l = lead();
  const tag = entityTag(l.entity);
  const site = l.website ? ` · <a href="https://${esc(l.website)}" target="_blank" rel="noopener">${esc(l.website)}</a>` : "";
  const home = l.appAddress && l.appAddress !== l.address ? l.appAddress : l.address;
  const rev = roundRev(l.avg);
  const appr = rev + 150000;
  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-title"><h1>${esc(l.company)}</h1>${tag ? `<span class="ent">${esc(tag)}</span>` : ""}</div>
        <div class="who">${esc(displayName(l.contact))}${site}</div>
      </div>
      <div class="money">
        <div><div class="k">Revenue</div><div class="v">${money(rev)}</div></div>
        <div><div class="k">Approval</div><div class="v">${money(appr)}</div></div>
      </div>
      <div class="sheet-x">
        <div class="quad">
          <h3>Owner</h3>
          ${pair(kv("Name", esc(displayName(l.contact))), kv("Title", esc(l.title)))}
          ${pair(kv("SSN", esc(l.ssn)), kv("DOB", esc(l.dob)))}
          ${pair(kv("Home", esc(home)), `<div class="kv"></div>`)}
        </div>
        <div class="quad">
          <h3>Business</h3>
          ${pair(kv("EIN", esc(l.ein)), kv("Industry", esc(l.industry)))}
          ${pair(kv("Time in business", esc(l.tib)), kv("Entity", esc(tag || l.entity)))}
          ${pair(kv("Office", esc(l.address)), kv("Ownership", esc(ownPct(l))))}
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
      <div class="below">
        <h3 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);font-weight:600;margin:8px 0 10px">Why this deal</h3>
        <div class="pitch-box"><p class="pitch">${esc(l.pitch)}</p></div>
        <h3 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);font-weight:600;margin:16px 0 10px">Activity</h3>
        ${l.notes.slice(0,1).map(n => `<div class="note" style="margin-bottom:10px"><div class="dim">${esc(n.who)} · ${esc(n.when)}</div><p>${esc(n.txt)}</p></div>`).join("")}
        ${l.activity.map(a => `<div class="ev"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("")}
        <button class="linkish" data-act="history">Full history</button>
      </div>
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
    <div class="dock-body" id="commsBody">${renderComms(l)}</div>`;
  placePad();
}

function threadMsgs(l) {
  const n = state.threadN || l.mobiles[0].n;
  const ch = state.threadCh || "sms";
  return l.sms.filter(m => (m.n || l.mobiles[0].n) === n && (m.ch || "sms") === ch);
}
