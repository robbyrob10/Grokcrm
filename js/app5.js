function hang() {
  const l = lead();
  const dur = fmtElapsed(state.dial.elapsed);
  if (state.dial.status === "connected") {
    l.calls.unshift({who: state.dial.contact, dir:"out", dur, when:"Just now", dev: device().name, n: state.dial.number, note:"Logged from dialer."});
    l.activity.unshift({when:"Just now", what:`Call · ${state.dial.contact} · ${dur}`});
    l.lastAgo = "just now";
  }
  state.dial.status = "idle"; state.dial.elapsed = 0; state.keypadOpen = false;
  clearInterval(tick); renderAll(); toast("Call ended");
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) {
    if (state.keypadOpen && !e.target.closest("#padPop") && !e.target.closest("[data-act='toggle-pad']")) {
      state.keypadOpen = false; placePad();
    }
    return;
  }
  const act = b.dataset.act;
  const l = lead();
  if (act === "select") { state.selected = b.dataset.id; state.keypadOpen = false; state.threadN = ""; state.threadCh = "sms"; state.actOpen = false; renderAll(); return; }
  if (act === "filter") { state.filter = b.dataset.k; renderRail(); return; }
  if (act === "comms-tab") { state.commsTab = b.dataset.k; renderDock(); return; }
  if (act === "thread-n") { state.threadN = b.dataset.n; state.commsTab = "msg"; renderDock(); return; }
  if (act === "thread-ch") { state.threadCh = b.dataset.k; state.commsTab = "msg"; renderDock(); return; }
  if (act === "call") { startCall(b.dataset.n, b.dataset.who); return; }
  if (act === "hang") { hang(); return; }
  if (act === "mute") { state.dial.muted = !state.dial.muted; renderDialerBar(); return; }
  if (act === "spk") { state.dial.speaker = !state.dial.speaker; renderDialerBar(); return; }
  if (act === "toggle-pad") { state.keypadOpen = !state.keypadOpen; placePad(); return; }
  if (act === "dtmf") {
    const k = b.dataset.k;
    if (state.dial.status === "idle") {
      const raw = (state.dial.number || "").replace(/\D/g,"");
      if (raw.length < 10) state.dial.number = (state.dial.number || "") + k;
      renderDialerBar();
    } else { state.dial.dtmf += k; toast("DTMF " + k); }
    return;
  }
  if (act === "devices") { state.modal = {type:"devices"}; renderModal(); return; }
  if (act === "toggle-dev") {
    const d = DEVICES.find(x => x.id === b.dataset.id);
    if (!d) return;
    d.on = !d.on;
    paintBt();
    renderModal();
    toast(d.name + (d.on ? " on" : " off"));
    return;
  }
  if (act === "set-device") { state.dial.device = b.dataset.id; state.modal = null; renderAll(); toast("Calling as " + device().name); return; }
  if (act === "sms" || act === "wa") {
    state.threadN = b.dataset.n;
    state.threadCh = act === "wa" ? "wa" : "sms";
    state.commsTab = "msg";
    renderDock();
    setTimeout(()=>$("smsBox")?.focus(), 40);
    return;
  }
  if (act === "send-sms") {
    const t = $("smsBox")?.value.trim(); if (!t) return;
    l.sms.push({dir:"out", ch: state.threadCh || "sms", n: state.threadN || l.mobiles[0].n, t:"Just now", txt:t});
    l.activity.unshift({when:"Just now", what:"SMS to " + l.contact});
    l.lastAgo = "just now";
    $("smsBox").value = ""; renderDock(); toast("Sent"); return;
  }
  if (act === "email-all") { openCompose({ all:true }); return; }
  if (act === "email-one") { openCompose({ to:b.dataset.n, bcc:"" }); return; }
  if (act === "compose") { openCompose({}); return; }
  if (act === "fmt") { document.execCommand(b.dataset.cmd, false, null); return; }
  if (act === "font") { document.execCommand("fontName", false, $("cFont").value); return; }
  if (act === "size") { $("cBody").style.fontSize = $("cSize").value; return; }
  if (act === "tpl") {
    const v = $("cTpl").value;
    const first = displayName(l.contact).split(" ")[0];
    const map = {
      term: {s:"Term sheet — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Term sheet is attached. ${money(roundRev(l.avg) + 150000)} as discussed. Call me when you’ve had a look.</div>`},
      stip: {s:"Stips outstanding — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Need the remaining statements to lock the file. Everything else is in.</div>`},
      intro:{s:"Intro — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Elena suggested we talk. I help shops like yours with working capital. Ten minutes this week?</div>`}
    };
    if (map[v]) { $("cSub").value = map[v].s; $("cBody").innerHTML = map[v].b + `<div><br></div><div>Cole Brennan<br>Forge · Merchant desk</div>`; }
    return;
  }
  if (act === "attach") { $("cAtt").textContent = "term-sheet.pdf"; toast("Attached term-sheet.pdf"); return; }
  if (act === "draft") {
    state.drafts[l.id] = { to:$("cTo").value, cc:$("cCc").value, bcc:$("cBcc").value, subject:$("cSub").value, body:$("cBody").innerHTML };
    toast("Draft saved"); return;
  }
  if (act === "send-mail") {
    const sub = $("cSub").value.trim() || "(no subject)";
    const body = $("cBody").innerText.trim();
    l.mails.unshift({sub, from:"Cole Brennan", to:$("cTo").value, when:"Just now", preview:body.slice(0,140)});
    l.activity.unshift({when:"Just now", what:"Email · " + sub});
    l.lastAgo = "just now";
    state.modal = null; renderAll(); toast("Sent"); return;
  }
  if (act === "open-mail") { state.modal = {type:"mail-read", i:+b.dataset.i}; renderModal(); return; }
  if (act === "file") { state.modal = {type:"file", i:+b.dataset.i, page:0}; state.fileZoom = 1.2; renderModal(); return; }
  if (act === "stmt") {
    state.modal = {type:"stmt", ai:+b.dataset.ai, si:+b.dataset.si, page:0};
    state.fileZoom = 1.2;
    renderModal(); return;
  }
  if (act === "file-prev" || act === "file-next") {
    const dir = act === "file-next" ? 1 : -1;
    if (state.modal?.type === "stmt") {
      const a = accountsOf(lead())[state.modal.ai];
      const n = a.stmts.length;
      state.modal.si = (state.modal.si + dir + n) % n;
      state.modal.page = 0;
      renderModal(); return;
    }
    const n = lead().files.length;
    state.modal = {type: "file", i: ((state.modal.i || 0) + dir + n) % n, page: 0};
    renderModal(); return;
  }
  if (act === "page-go") {
    if (state.modal) { state.modal.page = +b.dataset.p; renderModal(); }
    return;
  }
  if (act === "file-zoom") {
    const d = +b.dataset.d;
    state.fileZoom = Math.min(2, Math.max(0.8, +(state.fileZoom + d * 0.1).toFixed(1)));
    renderModal(); return;
  }
  if (act === "history") { state.modal = {type:"history"}; renderModal(); return; }
  if (act === "act-toggle") { state.actOpen = !state.actOpen; renderDesk(); return; }
  if (act === "close") { state.modal = null; renderModal(); return; }
  if (act === "toast") { toast(b.dataset.msg); return; }
});

$("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") { state.modal = null; renderModal(); }});
$("q").addEventListener("input", (e) => { state.query = e.target.value; renderRail(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.isContentEditable !== true) {
    e.preventDefault(); $("q").focus();
  }
  if (state.modal?.type === "file") {
    if (e.key === "ArrowLeft") { e.preventDefault(); document.querySelector("[data-act=file-prev]")?.click(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); document.querySelector("[data-act=file-next]")?.click(); return; }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); state.fileZoom = Math.min(2, +(state.fileZoom + 0.1).toFixed(1)); renderModal(); return; }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); state.fileZoom = Math.max(0.8, +(state.fileZoom - 0.1).toFixed(1)); renderModal(); return; }
  }
  if (e.key === "Escape") { state.modal = null; state.keypadOpen = false; renderAll(); }
});
window.addEventListener("resize", () => { sizeApp(); placePad(); });
if (window.visualViewport) window.visualViewport.addEventListener("resize", () => { sizeApp(); placePad(); });
