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
function stmtCard(a, ai, s, si, mark) {
  return `<button type="button" class="stmt-card" data-act="stmt" data-ai="${ai}" data-si="${si}" title="Open ${esc(s.m)} statement">
    <div class="top">
      <span class="mo"><span class="mark-mini">${esc(mark)}</span>${esc(s.m)}</span>
      <span class="doc">${ico("doc",15)}</span>
    </div>
    <div class="figs">
      <div class="fig"><div class="k">Deposits</div><div class="v">${money(s.dep)}</div></div>
      <div class="fig"><div class="k">Ending</div><div class="v">${money(s.end)}</div></div>
    </div>
  </button>`;
}
function statementsBlock(l) {
  const accts = accountsOf(l).slice(0, 2);
  if (!accts.length) return `<div class="muted">No statements</div>`;
  const cols = accts.map((a, ai) => {
    const mark = bankMark(a.name);
    const months = (a.stmts || []).slice(0, 2);
    const cards = months.map((s, si) => stmtCard(a, ai, s, si, mark));
    if (ai === 0 && l.mtd) {
      cards.push(`<div class="stmt-card">
        <div class="top"><span class="mo"><span class="mark-mini">${esc(mark)}</span>${esc(l.mtd.m || "MTD")}</span></div>
        <div class="figs">
          <div class="fig"><div class="k">Deposits</div><div class="v">${money(l.mtd.dep)}</div></div>
          <div class="fig"><div class="k">Balance</div><div class="v">${money(l.mtd.bal)}</div></div>
        </div>
      </div>`);
    }
    return `<div class="bank-col">
      <div class="bank-lab">${esc(a.name)}<span class="acct">${esc(a.acct)}</span></div>
      <div class="stmt-grid">${cards.slice(0, 3).join("")}</div>
    </div>`;
  }).join("");
  return `<div class="banks${accts.length > 1 ? " two" : ""}">${cols}</div>`;
}
function renderDesk() {
  const l = lead();
  const tag = entityTag(l.entity);
  const site = l.website ? ` · <a href="https://${esc(l.website)}" target="_blank" rel="noopener">${esc(l.website)}</a>` : "";
  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-title"><h1>${esc(l.company)}</h1>${tag ? `<span class="ent">${esc(tag)}</span>` : ""}</div>
        <div class="who">${esc(displayName(l.contact))}${site}</div>
      </div>
      <div class="money">
        <div><div class="k">Revenue</div><div class="v">${money(l.avg * 12)}</div></div>
        <div><div class="k">Approval</div><div class="v">${l.offer ? money(l.offer) : "—"}${l.ask ? `<div class="asked">asked ${money(l.ask)}</div>` : ""}</div></div>
      </div>
      <div class="sheet-x">
        <div class="quad">
          <h3>Owner</h3>
          ${pair(kv("Name", esc(displayName(l.contact))), kv("Title", esc(l.title)))}
          ${pair(kv("SSN", esc(l.ssn)), kv("DOB", esc(l.dob)))}
          ${pair(kv("Home", esc(l.appAddress && l.appAddress !== l.address ? l.appAddress : l.address)), "")}
        </div>
        <div class="quad">
          <h3>Business</h3>
          ${pair(kv("EIN", esc(l.ein)), kv("Industry", esc(l.industry)))}
          ${pair(kv("Time in business", esc(l.tib)), kv("Office", esc(l.address)))}
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
      <div class="below">
        <h3 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);font-weight:600;margin:8px 0 10px">Why this deal</h3>
        <div class="pitch-box"><p class="pitch">${esc(l.pitch)}</p></div>
        <div class="below-grid">
          <div class="quad">
            <h3>Activity</h3>
            ${l.notes.slice(0,1).map(n => `<div class="note" style="margin-bottom:10px"><div class="dim">${esc(n.who)} · ${esc(n.when)}</div><p>${esc(n.txt)}</p></div>`).join("")}
            ${l.activity.map(a => `<div class="ev"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("")}
            <button class="linkish" data-act="history">Full history</button>
          </div>
          <div class="quad">
            <h3>Files</h3>
            <div class="files">
              ${l.files.map((f,i) => `<button class="file" data-act="file" data-i="${i}"><span class="ico">${esc(f.t)}</span>${esc(f.n)}</button>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderDock() {
  const l = lead();
  const d = state.dial;
  const unread = l.sms.filter(m => m.dir === "in").length ? 1 : 0;
  if (!state.threadN) state.threadN = l.mobiles[0].n;
  $("dock").innerHTML = `
    <div class="dock-head"><h2>Communications</h2><span class="dim" style="margin-left:auto">${esc(displayName(l.contact))}</span></div>
    <div class="dock-tabs">
      ${[["all","All"],["msg","Messages"],["calls","Call log"],["people","Contacts"],["mail","Email"]].map(([k,lab]) =>
        `<button class="${state.commsTab===k?"on":""}" data-act="comms-tab" data-k="${k}">${lab}${k==="msg" && unread ? ` <span class="unread">${unread}</span>` : ""}</button>`).join("")}
    </div>
    <div class="dock-body" id="commsBody">${renderComms(l)}</div>
    ${renderDialer(l, d)}`;
  placePad();
}

function threadMsgs(l) {
  const n = state.threadN || l.mobiles[0].n;
  const ch = state.threadCh || "sms";
  return l.sms.filter(m => (m.n || l.mobiles[0].n) === n && (m.ch || "sms") === ch);
}
