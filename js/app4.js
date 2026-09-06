function renderModal() {
  const ov = $("overlay");
  const m = state.modal;
  if (!m) { ov.className = "overlay"; ov.innerHTML = ""; return; }
  ov.className = "overlay open";
  if (m.type === "compose") {
    ov.innerHTML = `<div class="modal wide">
      <div class="row-between"><h2 style="font-size:16px">New message</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <div class="compose-row"><label>To</label><input id="cTo" value="${esc(m.to)}" /></div>
      <div class="compose-row"><label>Cc</label><input id="cCc" value="${esc(m.cc)}" /></div>
      <div class="compose-row"><label>Bcc</label><input id="cBcc" value="${esc(m.bcc)}" /></div>
      <div class="compose-row"><label>Subject</label><input id="cSub" value="${esc(m.subject)}" placeholder="Subject" /></div>
      <div class="tb">
        <button data-act="fmt" data-cmd="bold"><b>B</b></button>
        <button data-act="fmt" data-cmd="italic"><i>I</i></button>
        <button data-act="fmt" data-cmd="underline"><u>U</u></button>
        <select id="cFont" data-act="font">
          <option>IBM Plex Sans</option><option>Georgia</option><option>Times New Roman</option><option>Arial</option>
        </select>
        <select id="cSize" data-act="size">
          <option>13px</option><option selected>14px</option><option>16px</option><option>18px</option>
        </select>
        <input id="cColor" type="color" value="#1A1F26" title="Color" style="width:32px;height:28px;border:1px solid var(--line);border-radius:6px;padding:2px;background:var(--surface)" />
        <select id="cTpl" data-act="tpl">
          <option value="">Template</option>
          <option value="term">Term sheet follow-up</option>
          <option value="stip">Stip request</option>
          <option value="intro">Intro</option>
        </select>
        <button data-act="attach">Attach</button>
        <button data-act="draft">Save draft</button>
      </div>
      <div class="editor" id="cBody" contenteditable="true">${m.body}</div>
      <div class="row-between" style="margin-top:12px">
        <span class="dim" id="cAtt">No attachments</span>
        <button class="btn primary" data-act="send-mail">Send</button>
      </div>
    </div>`;
    $("cColor").addEventListener("input", (e) => document.execCommand("foreColor", false, e.target.value));
    return;
  }
  if (m.type === "file") {
    const l = lead();
    const i = Math.max(0, Math.min(l.files.length - 1, m.i | 0));
    m.i = i;
    const f = l.files[i];
    const z = state.fileZoom || 1.2;
    const pct = Math.round(z * 100);
    ov.innerHTML = `<div class="viewer" data-viewer="1">
      <div class="viewer-bar">
        <button title="Previous" data-act="file-prev">${ico("chevL",16)}</button>
        <button title="Next" data-act="file-next">${ico("chevR",16)}</button>
        <span class="fn">${esc(f.n)}.pdf</span>
        <span class="pg">${i+1} / ${l.files.length}</span>
        <button title="Zoom out" data-act="file-zoom" data-d="-1">${ico("minus",14)}</button>
        <span class="z">${pct}%</span>
        <button title="Zoom in" data-act="file-zoom" data-d="1">${ico("plus",14)}</button>
        <button title="Close" data-act="close">${ico("x",16)}</button>
      </div>
      <div class="viewer-stage">
        <div class="letter-wrap" style="width:${816*z}px;height:${1056*z}px">
          <div class="letter" style="transform:scale(${z})">${paperHtml(l, i)}</div>
        </div>
      </div>
    </div>`;
    return;
  }
  if (m.type === "stmt") {
    const l = lead();
    const accts = accountsOf(l);
    const ai = Math.max(0, Math.min(accts.length - 1, m.ai | 0));
    const a = accts[ai];
    const si = Math.max(0, Math.min(a.stmts.length - 1, m.si | 0));
    const s = a.stmts[si];
    const pages = s.pages || 6;
    const page = Math.max(0, Math.min(pages - 1, m.page | 0));
    m.ai = ai; m.si = si; m.page = page;
    const z = state.fileZoom || 1.2;
    const pct = Math.round(z * 100);
    ov.innerHTML = `<div class="viewer" data-viewer="1">
      <div class="viewer-bar">
        <button title="Previous page" data-act="file-prev">${ico("chevL",16)}</button>
        <button title="Next page" data-act="file-next">${ico("chevR",16)}</button>
        <span class="fn">${esc(s.m)} statement · ${esc(a.name)} · ${esc(a.acct)}</span>
        <span class="pg">${page+1} / ${pages}</span>
        <button title="Zoom out" data-act="file-zoom" data-d="-1">${ico("minus",14)}</button>
        <span class="z">${pct}%</span>
        <button title="Zoom in" data-act="file-zoom" data-d="1">${ico("plus",14)}</button>
        <button title="Close" data-act="close">${ico("x",16)}</button>
      </div>
      <div class="viewer-stage">
        <div class="letter-wrap" style="width:${816*z}px;height:${1056*z}px">
          <div class="letter" style="transform:scale(${z})">${stmtPaper(l, ai, si, page)}</div>
        </div>
      </div>
    </div>`;
    return;
  }
  if (m.type === "history") {
    const l = lead();
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:16px">History</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <h3 style="margin:16px 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)">Notes</h3>
      ${l.notes.map(n => `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="dim">${esc(n.who)} · ${esc(n.when)}</div><p style="margin-top:6px">${esc(n.txt)}</p></div>`).join("")}
      <h3 style="margin:16px 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)">Activity</h3>
      ${l.activity.map(a => `<div class="ev"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("")}
    </div>`;
    return;
  }
  if (m.type === "devices") {
    ov.innerHTML = `<div class="modal">
      <div class="row-between"><h2 style="font-size:16px">Phones</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <p class="dim" style="margin:8px 0 4px">Green Bluetooth means a phone is on. Tap a row to call as that line.</p>
      <div class="dev-list">${DEVICES.map(d => `
        <div class="dev-item ${d.id===state.dial.device?"on-row":""}">
          <span class="av" style="background:${d.on?"#3A3F46":"#C5CAD0"}">${ico("phone",14)}</span>
          <button data-act="set-device" data-id="${d.id}" style="border:0;background:transparent;text-align:left;padding:0;color:inherit">
            <div class="co">${esc(d.name)}</div>
            <div class="nm">${esc(d.kind)} · ${esc(d.did)}</div>
          </button>
          <button class="toggle ${d.on?"on":""}" data-act="toggle-dev" data-id="${d.id}">${d.on?"On":"Off"}</button>
        </div>`).join("")}</div>
    </div>`;
    return;
  }
  if (m.type === "mail-read") {
    const mail = lead().mails[m.i];
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:16px">${esc(mail.sub)}</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <div class="dim" style="margin-top:8px">${esc(mail.from)} · ${esc(mail.when)}</div>
      <p style="margin-top:16px;line-height:1.55">${esc(mail.preview)}</p>
      <button class="btn" style="margin-top:16px" data-act="compose">Reply</button>
    </div>`;
  }
}

function startCall(n, who) {
  state.modal = null;
  state.keypadOpen = false;
  state.dial.status = "dialing";
  state.dial.number = n;
  state.dial.contact = who || displayName(lead().contact);
  state.dial.muted = false; state.dial.elapsed = 0; state.dial.dtmf = "";
  renderAll();
  setTimeout(() => {
    if (state.dial.status !== "dialing") return;
    state.dial.status = "connected";
    state.dial.started = Date.now();
    startTick(); renderAll(); toast("Connected · " + device().name);
  }, 1400);
}
function startTick() {
  clearInterval(tick);
  tick = setInterval(() => {
    if (state.dial.status !== "connected") return;
    state.dial.elapsed = Math.floor((Date.now() - state.dial.started) / 1000);
    const t = $("timer");
    if (t) t.textContent = fmtElapsed(state.dial.elapsed);
  }, 1000);
}
