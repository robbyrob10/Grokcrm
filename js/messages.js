(function () {
  const p = params();
  let sel = LEADS.find(l => l.id === p.get("lead")) || LEADS.find(l => (l.sms || []).length) || LEADS[0];
  let q = "";

  function convos() {
    const qq = q.trim().toLowerCase();
    return LEADS.filter(l => (l.sms || []).length).filter(l => {
      if (!qq) return true;
      const last = lastSms(l);
      const hay = [l.company, l.contact, l.dba, last && last.txt].join(" ").toLowerCase();
      return hay.includes(qq);
    });
  }

  function renderList() {
    $("convoList").innerHTML = convos().map(l => {
      const last = lastSms(l);
      const unread = unreadOf(l);
      return `<button type="button" class="convo ${l.id === sel.id ? "on" : "}" data-id="${esc(l.id)}">
        <div class="av" style="background:${hue(l.contact)}">${esc(initials(l.contact))}</div>
        <div>
          <div class="t">${esc(displayName(l.contact))}${unread ? '<i class="unread"></i>' : ""}</div>
          <div class="s">${esc(last ? last.txt : l.dba)}</div>
        </div>
        <div class="when">${esc(last ? last.t : l.lastAgo)}</div>
      </button>`;
    }).join("") || `<div class="empty">No threads.</div>`;
  }

  function renderThread() {
    const l = sel;
    const lastN = (l.mobiles && l.mobiles[0] && l.mobiles[0].n) || "";
    $("threadHead").innerHTML = `
      <div>
        <h1>${esc(displayName(l.contact))}</h1>
        <div class="sub">${esc(l.company)} · ${esc(lastN)}</div>
      </div>
      <a class="btn" href="index.html?lead=${esc(l.id)}">Lead</a>`;
    $("thread").innerHTML = (l.sms || []).map(m =>
      `<div class="bubble ${m.dir}${m.ch === "wa" ? " wa" : "}">${esc(m.txt)}<div style="font-size:11px;opacity:.65;margin-top:4px">${esc(m.t)}${m.ch === "wa" ? " · WhatsApp" : ""}</div></div>`
    ).join("") || `<div class="empty">No messages yet.</div>`;
    $("thread").scrollTop = $("thread").scrollHeight;
  }

  function renderDevs() {
    $("devs").innerHTML = DEVICES.map(d =>
      `<span><b>${esc(d.name)}</b> · ${esc(d.kind)} · ${esc(d.did)} · <span class="${d.on ? "on" : "off"}">${d.on ? "connected" : "idle"}</span></span>`
    ).join("");
  }

  function render() { renderList(); renderThread(); }

  $("convoList").addEventListener("click", e => {
    const b = e.target.closest("[data-id]");
    if (!b) return;
    sel = LEADS.find(l => l.id === b.dataset.id) || sel;
    history.replaceState(null, "", `messages.html?lead=${sel.id}`);
    render();
  });
  $("msgQ").addEventListener("input", e => { q = e.target.value; renderList(); });
  $("send").addEventListener("click", send);
  $("draft").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
  function send() {
    const t = $("draft").value.trim();
    if (!t) return;
    sel.sms = sel.sms || [];
    sel.sms.push({dir:"out", ch:"sms", t:"Just now", txt:t});
    $("draft").value = "";
    render();
    toast("Sent");
  }
  renderDevs();
  render();
})();
