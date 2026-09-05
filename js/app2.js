function renderDesk() {
  const l = lead();
  const daily = Math.round(l.avg / 30);
  const exp = l.expenses[0];
  const sameAddr = l.address === l.appAddress;
  const accts = accountsOf(l);
  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <h2>${esc(l.company)}</h2>
      </div>
      <div class="lead-facts">
        <div class="who">${esc(displayName(l.contact))} · ${esc(l.title)}</div>
        <div class="meta">
          ${esc(l.address)}
          ${sameAddr ? "" : "<br>Application: " + esc(l.appAddress)}
          <br>EIN ${esc(l.ein)} · SSN ${esc(l.ssn)} · DOB ${esc(l.dob)} · Opened ${esc(l.started)}
        </div>
      </div>
      <div class="sheet2">
        <div class="col">
          <div class="block">
            <h3>Contact</h3>
            <div class="cgroup">
              <h4>Mobile</h4>
              ${l.mobiles.map((p) => `<div class="line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, true, true)}</div>`).join("")}
            </div>
            <div class="cgroup">
              <h4>Email</h4>
              ${l.emails.map(p => `<div class="line"><span class="val">${esc(p.n)}</span><div class="qacts"><button title="Email" data-act="email-one" data-n="${esc(p.n)}">${ico("mail",15)}</button></div></div>`).join("")}
              <button class="email-all" data-act="email-all">Email All</button>
            </div>
            <div class="cgroup">
              <h4>Landline</h4>
              ${l.landlines.map((p) => `<div class="line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, false, false)}</div>`).join("")}
            </div>
          </div>
        </div>
        <div class="col">
          <div class="block">
            <h3>Company</h3>
            <div class="fields">
              ${field("Legal name", esc(l.company))}
              ${field("DBA", esc(l.dba))}
              ${field("Owner", esc(displayName(l.contact)))}
              ${field("Industry", esc(l.industry))}
              ${field("Time in business", esc(l.tib))}
              ${field("Annual revenue", money(l.avg*12))}
              ${field("Requested", money(l.ask))}
              ${field("Approval", l.offer ? money(l.offer) : "\u2014")}
            </div>
          </div>
        </div>
      </div>
      <div class="sheet-fin">
        <div class="block">
          <h3>Statements</h3>
          ${accts.map((a,ai) => `
            <div class="bank-block">
              <div class="bank-label">${esc(a.name)}<span>${esc(a.acct)}</span></div>
              <div class="stmt-grid">
                ${a.stmts.map((s,si) => `<div class="stmt-card">
                  <div class="top">
                    <span class="mo">${esc(s.m)}</span>
                    <button class="doc" title="Open ${esc(s.m)} statement" data-act="stmt" data-ai="${ai}" data-si="${si}">${ico("doc",15)}</button>
                  </div>
                  <div class="figs">
                    <div class="fig"><div class="k">Deposits</div><div class="v">${money(s.dep)}</div></div>
                    <div class="fig"><div class="k">Ending</div><div class="v">${money(s.end)}</div></div>
                  </div>
                </div>`).join("")}
              </div>
            </div>`).join("")}
        </div>
        <div class="fin-grid">
          <div class="col">
            <div class="block">
              <h3>Financials</h3>
              <div class="fields">
                ${field("Avg monthly deposits", `<span class="num">${money(l.avg)}</span>`)}
                ${field("Requested / approval", money(l.ask) + " · " + (l.offer ? money(l.offer) : "\u2014"))}
                ${field("MTD deposits", `<span class="num">${money(l.mtd.dep)}</span>`)}
                ${field("MTD balance", `<span class="num">${money(l.mtd.bal)}</span>`)}
                ${field("Daily cash flow", `<span class="num">${money(daily)}</span>`)}
              </div>
            </div>
          </div>
          <div class="col">
            <div class="block">
              <h3>Cash-flow pressure</h3>
              <div class="fields">
                ${field("Largest expense", esc(exp[0]))}
                ${field("Amount", `<span class="num">${money(exp[1])}</span>`)}
                ${field("Cadence", esc(exp[2]))}
                ${field("Impact", esc(exp[3] || "\u2014"))}
              </div>
              ${l.mca.length ? l.mca.map(m => `
                <div class="fields" style="margin-top:14px">
                  ${field("MCA lender", esc(m.who))}
                  ${field("Payment", `<span class="num">${money(m.daily)}</span>`)}
                  ${field("Cadence", esc(m.cad))}
                  ${field("Est. monthly burden", `<span class="num">${money(m.daily*22)}</span>`)}
                </div>`).join("") : `<p class="muted" style="margin-top:10px">No existing advances on file.</p>`}
            </div>
          </div>
        </div>
        <div class="block">
          <h3>Opening pitch</h3>
          <div class="pitch-box"><p class="pitch">${esc(l.pitch)}</p></div>
        </div>
        <div class="block">
          <h3>Files</h3>
          <div class="files">
            ${l.files.filter(f => /application|mtd/i.test(f.n)).map((f,i) => {
              const idx = l.files.indexOf(f);
              return `<button class="file" data-act="file" data-i="${idx}"><span class="ico">${esc(f.t)}</span>${esc(f.n)}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="block activity-foot">
          <h3>Activity</h3>
          ${l.notes.slice(0,1).map(n => `<div class="note" style="margin-bottom:10px"><div class="dim">${esc(n.who)} · ${esc(n.when)}</div><p>${esc(n.txt)}</p></div>`).join("")}
          ${l.activity.map(a => `<div class="ev"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("")}
          <button class="linkish" data-act="history">Full history</button>
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
    <div class="dev-strip">${DEVICES.map(x => `<span><b>${esc(x.name)}</b> · ${esc(x.kind)} · <span class="${x.on?"on":"off"}">${x.on?"On":"Off"}</span></span>`).join("")}</div>
    <div class="dock-body" id="commsBody">${renderComms(l)}</div>
    ${renderDialer(l, d)}`;
  placePad();
}

function threadMsgs(l) {
  const n = state.threadN || l.mobiles[0].n;
  const ch = state.threadCh || "sms";
  return l.sms.filter(m => (m.n || l.mobiles[0].n) === n && (m.ch || "sms") === ch);
}
