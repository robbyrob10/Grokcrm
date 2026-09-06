const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&"+"amp;","<":"&"+"lt;",">":"&"+"gt;",'"':"&"+"quot;","'":"&#39;"}[c]));
const money = (n) => n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US");
const params = () => new URLSearchParams(location.search);

function displayName(n) { return String(n).replace(/^Dr\.\s+/i, ""); }
function hue(str) {
  const pal = {ns:"#2B6E72",hl:"#9A5628",bd:"#8A7020",ro:"#4E6230",lu:"#2E6A48",mw:"#7A3E50",kp:"#3A5480",ap:"#8A3A32"};
  const rest = ["#5C5348","#2B6E72","#9A5628","#8A7020","#4E6230","#2E6A48","#7A3E50","#3A5480","#8A3A32"];
  const s = String(str || "");
  if (typeof LEADS !== "undefined") {
    const l = LEADS.find(x => x.id===s || x.company===s || x.contact===s || displayName(x.contact)===s);
    if (l && pal[l.id]) return pal[l.id];
  }
  let h = 0; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return rest[h % rest.length];
}
function initials(n) {
  return displayName(n).split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}
function ico(name, s=16) {
  const p = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.2 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p[name]||""}</svg>`;
}
function toast(msg) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
function accountsOf(l) {
  return l.accounts || [{name: l.bank.name, acct: l.bank.acct, stmts: (l.stmts || []).map(s => ({...s, pages: s.pages || 6}))}];
}
function bankMark(name) {
  const n = String(name).toLowerCase();
  if (n.includes("chase")) return "CH";
  if (n.includes("td")) return "TD";
  if (n.includes("wells")) return "WF";
  if (n.includes("pnc")) return "PNC";
  if (n.includes("america")) return "BA";
  if (n.includes("mercury")) return "ME";
  if (n.includes("m&t")) return "MT";
  return initials(name);
}
function monthKey(label) {
  return String(label || "").split(" ")[0];
}
function nsfFor(l, monthLabel) {
  const idx = {September:0,October:1,November:2,December:3,January:4,February:5,March:6,April:7,May:8,June:9,July:10,August:11}[monthKey(monthLabel)];
  if (idx == null) return 0;
  return (l.nsf && l.nsf[idx]) || 0;
}
function stageOf(l) {
  const blob = [l.analysis, l.pitch, (l.activity||[]).map(a => a.what).join(" "), (l.notes||[]).map(n => n.txt).join(" ")].join(" ");
  if (/funded/i.test(blob) && /already funded|performing|wire landed|first ach/i.test(blob)) return "funded";
  if (/approv/i.test(blob)) return "approved";
  if (l.offer) return "terms";
  if ((l.calls || []).length) return "review";
  return "new";
}
const STAGES = [
  {id:"new", lab:"New"},
  {id:"review", lab:"Review"},
  {id:"terms", lab:"Term sheet"},
  {id:"approved", lab:"Approved"},
  {id:"funded", lab:"Funded"}
];
function allStmts() {
  const rows = [];
  for (const l of LEADS) {
    accountsOf(l).forEach((a, ai) => {
      (a.stmts || []).forEach((s, si) => {
        rows.push({
          id: `${l.id}-${a.acct}-${si}`,
          lead: l, acct: a, stmt: s, ai, si,
          nsf: nsfFor(l, s.m),
          pages: s.pages || 6
        });
      });
    });
  }
  return rows;
}
function lastSms(l) {
  const list = l.sms || [];
  return list[list.length - 1] || null;
}
function unreadOf(l) {
  const last = lastSms(l);
  return last && last.dir === "in" ? 1 : 0;
}

(function bootPhones() {
  function connected() {
    return DEVICES.some(d => d.on && (d.id === "poly" || d.id === "mobile" || d.id === "web"));
  }
  function paint() {
    const b = $("btBtn");
    if (!b) return;
    b.classList.toggle("on", connected());
    b.classList.toggle("off", !connected());
  }
  function close() {
    const ov = $("overlay");
    if (!ov) return;
    ov.className = "overlay";
    ov.innerHTML = "";
  }
  function open() {
    const ov = $("overlay");
    if (!ov) return;
    ov.className = "overlay open";
    ov.innerHTML = `<div class="modal">
      <div class="row-between"><h2 style="font-size:16px">Phones</h2><button class="icon-btn" data-act="close" type="button">${ico("x")}</button></div>
      <p class="dim" style="margin:8px 0 4px">Green Bluetooth means a phone is on.</p>
      <div class="dev-list">${DEVICES.map(d => `
        <div class="dev-item">
          <span class="av" style="background:${d.on?"#3A3F46":"#C5CAD0"}">${ico("phone",14)}</span>
          <span>
            <div class="co">${esc(d.name)}</div>
            <div class="nm">${esc(d.kind)} · ${esc(d.did)}</div>
          </span>
          <button class="toggle ${d.on?"on":""}" data-act="toggle-dev" data-id="${d.id}" type="button">${d.on?"On":"Off"}</button>
        </div>`).join("")}</div>
    </div>`;
  }
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "overlay") { close(); return; }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "devices") { open(); e.preventDefault(); return; }
    if (act === "close") { close(); return; }
    if (act === "toggle-dev") {
      const d = DEVICES.find(x => x.id === b.dataset.id);
      if (!d) return;
      d.on = !d.on;
      paint();
      open();
      toast(d.name + (d.on ? " on" : " off"));
    }
  });
  paint();
})();
