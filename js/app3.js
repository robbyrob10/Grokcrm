function renderComms(l) {
  const tab = state.commsTab;
  const n = state.threadN || l.mobiles[0].n;
  if (tab === "msg") {
    const msgs = threadMsgs(l);
    return `
      <div class="num-switch">
        ${l.mobiles.map(p => `<button class="${n===p.n?"on":""}" data-act="thread-n" data-n="${esc(p.n)}">${esc(p.n)}</button>`).join("")}
        <button class="${state.threadCh==="sms"?"on":""}" data-act="thread-ch" data-k="sms">SMS</button>
        <button class="${state.threadCh==="wa"?"on":""}" data-act="thread-ch" data-k="wa">WhatsApp</button>
      </div>
      <div class="thread">${msgs.map(m => `
        <div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}">${esc(m.txt)}<div class="t">${esc(m.t)}</div></div>`).join("") || `<div class="empty">No ${state.threadCh==="wa"?"WhatsApp":"SMS"} on this number.</div>`}</div>
      <div class="composer">
        <textarea id="smsBox" placeholder="Message ${esc(n)}…"></textarea>
        <button class="btn primary" data-act="send-sms">${ico("send",14)}</button>
      </div>`;
  }
  if (tab === "all") {
    return `<div class="thread">${l.sms.slice(-4).map(m => `<div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}">${esc(m.txt)}<div class="t">${m.ch==="wa"?"WhatsApp":"SMS"} · ${esc(m.n || l.mobiles[0].n)} · ${esc(m.t)}</div></div>`).join("")}
      ${l.calls.slice(0,2).map(c => `<div class="bubble in"><strong>${c.dir==="in"?"Inbound":"Outbound"} call</strong> · ${esc(c.dur)}<div class="t">${esc(c.when)} · ${esc(c.dev)}</div></div>`).join("")}
      ${l.mails.slice(0,1).map(m => `<div class="bubble in"><strong>${esc(m.sub)}</strong><div class="t">${esc(m.when)}</div></div>`).join("")}
      </div>`;
  }
  if (tab === "mail") {
    return `${l.mails.map((m,i) => `<button class="mail" data-act="open-mail" data-i="${i}"><div class="sub">${esc(m.sub)}</div><div class="dim" style="margin-top:3px">${esc(m.from)} · ${esc(m.when)}</div><div class="pre">${esc(m.preview)}</div></button>`).join("") || `<div class="empty">No email.</div>`}
      <div style="padding:12px 16px"><button class="btn primary" data-act="compose">${ico("mail",14)} Compose</button></div>`;
  }
  if (tab === "calls") {
    return l.calls.map(c => `
      <div class="call-row">
        <div class="row-between"><strong>${c.dir==="in"?"Inbound":"Outbound"} · ${esc(c.who)}</strong><span class="num">${esc(c.dur)}</span></div>
        <div class="dim" style="margin-top:3px">${esc(c.when)} · ${esc(c.dev)} · ${esc(c.n)}</div>
        <p style="margin-top:6px">${esc(c.note)}</p>
        <button class="btn" style="margin-top:8px;height:28px" data-act="call" data-n="${esc(c.n)}" data-who="${esc(c.who)}">${ico("phone",14)} Call back</button>
      </div>`).join("") || `<div class="empty">No calls logged.</div>`;
  }
  return `<div style="padding:8px 16px 16px">
    <div class="cgroup"><h4>Mobile</h4>
    ${l.mobiles.map((p) => `<div class="line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, true, true)}</div>`).join("")}</div>
    <div class="cgroup"><h4>Email</h4>
    ${l.emails.map(p => `<div class="line"><span class="val">${esc(p.n)}</span><div class="qacts"><button data-act="email-one" data-n="${esc(p.n)}">${ico("mail",15)}</button></div></div>`).join("")}
    <button class="email-all" data-act="email-all">Email All</button></div>
    <div class="cgroup"><h4>Landline</h4>
    ${l.landlines.map((p) => `<div class="line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, false, false)}</div>`).join("")}</div>
  </div>`;
}
