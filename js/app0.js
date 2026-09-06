function accountsOf(l) {
  return l.accounts || [{name: l.bank.name, acct: l.bank.acct, stmts: l.stmts || []}];
}
const LS = { rail: "forge.railW", dock: "forge.dockW" };
function storeGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function storeSet(k, v) {
  try { localStorage.setItem(k, v); } catch (e) {}
}
const _bootLead = new URLSearchParams(location.search).get("lead");
const state = {
  selected: (_bootLead && LEADS.some(l => l.id === _bootLead)) ? _bootLead : "ns",
  filter: "all",
  query: "",
  commsTab: "all",
  threadN: "",
  threadCh: "sms",
  fileZoom: 1.2,
  keypadOpen: false,
  fav: new Set(LEADS.filter(l => l.fav).map(l => l.id)),
  follow: Object.fromEntries(LEADS.filter(l => l.follow).map(l => [l.id, l.follow])),
  modal: null,
  drafts: {},
  dial: { status:"idle", device:"poly", number:"", contact:"", elapsed:0, started:0, muted:false, hold:false, speaker:false, dtmf:"" }
};
let tick = null;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&"+"amp;","<":"&"+"lt;",">":"&"+"gt;",'"':"&"+"quot;","'":"&#39;"}[c]));
const money = (n) => n == null ? "\u2014" : "$" + Math.round(n).toLocaleString("en-US");
const lead = () => LEADS.find(l => l.id === state.selected) || LEADS[0];
const device = () => DEVICES.find(d => d.id === state.dial.device) || DEVICES[0];
function displayName(n) { return String(n).replace(/^Dr\.\s+/i, ""); }
function hue(str) {
  const pal = {ns:"#2B6E72",hl:"#9A5628",bd:"#8A7020",ro:"#4E6230",lu:"#2E6A48",mw:"#7A3E50",kp:"#3A5480",ap:"#8A3A32"};
  const s = String(str || "");
  if (typeof LEADS !== "undefined") {
    const l = LEADS.find(x => x.id===s || x.company===s || x.contact===s || displayName(x.contact)===s);
    if (l && pal[l.id]) return pal[l.id];
  }
  let h = 0; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return "hsl(" + ((h * 137) % 360) + " 40% 36%)";
}
function initials(n) {
  return displayName(n).split(/\s+/).slice(0,2).map(p => p[0]).join("").toUpperCase();
}
function ico(name, s=16) {
  const p = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.2 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
    mail: '<path d="M4 4h16v16H4z"/><path d="m4 4 8 9 8-9"/>',
    sms: '<path d="M4 4h16v12H7l-3 4V4z"/>',
    wa: '<path d="M12 3a8 8 0 0 0-6.9 12.1L4 21l6-1.1A8 8 0 1 0 12 3z"/><path d="M9.2 9.6c.2-.5.3-.5.6-.5h.5c.2 0 .3.1.4.4l.6 1.5c.1.2 0 .4-.1.5l-.4.4c-.1.1-.1.3 0 .4.3.5.8 1 1.3 1.3.2.1.3.1.4 0l.4-.4c.2-.2.4-.2.5-.1l1.5.6c.2.1.4.2.4.4v.5c0 .2 0 .4-.5.6A6 6 0 0 1 9.2 9.6z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    hold: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
    spk: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4 4 10-10"/>',
    chevL: '<path d="M15 6l-6 6 6 6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    minus: '<path d="M5 12h14"/>',
    doc: '<path d="M7 3h8l5 5v13H7z"/><path d="M15 3v5h5"/>'
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p[name]||""}</svg>`;
}
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
function field(k,v){ return `<div class="field"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`; }
function spark(values) {
  const w = 320, h = 36, min = Math.min(...values) * 0.82, max = Math.max(...values);
  const pts = values.map((v,i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 2;
    return [x, y];
  });
  const d = pts.map((p,i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${area}" fill="rgba(28,31,36,.10)"/><path d="${d}" fill="none" stroke="#1C1F24" stroke-width="1.75"/></svg>`;
}
function paperHtml(l, i) {
  const f = l.files[i];
  const kind = (f.n || "").toLowerCase();
  const acct = "\u2022\u2022\u2022\u2022 " + String(l.bank.acct).slice(-4);
  if (kind.includes("application")) {
    return `<div class="stamp">SCANNED \u00b7 APPLICATION</div>
      <div class="bank">FORGE MERCHANT DESK</div>
      <h2>Merchant Cash Advance Application</h2>
      <table>
        <tr><th>Legal name</th><td>${esc(l.company)}</td></tr>
        <tr><th>DBA</th><td>${esc(l.dba)}</td></tr>
        <tr><th>Owner</th><td>${esc(displayName(l.contact))} \u00b7 ${esc(l.title)}</td></tr>
        <tr><th>Address</th><td>${esc(l.address)}</td></tr>
        <tr><th>EIN</th><td>${esc(l.ein)}</td></tr>
        <tr><th>Requested</th><td class="end">${money(l.ask)}</td></tr>
        <tr><th>Use of funds</th><td>${esc(l.use)}</td></tr>
        <tr><th>Avg monthly deposits</th><td class="end">${money(l.avg)}</td></tr>
        <tr><th>Bank</th><td>${esc(l.bank.name)} \u00b7 ${esc(l.bank.acct)}</td></tr>
      </table>
      <p style="margin-top:28px;font-size:12px;color:#5C564C">Signed electronically \u00b7 ${esc(displayName(l.contact))} \u00b7 ${esc(l.started)}</p>`;
  }
  const stmt = kind.includes("july") ? l.stmts[1] : kind.includes("mtd") ? null : l.stmts[0];
  if (kind.includes("mtd")) {
    return `<div class="stamp">SCANNED \u00b7 MTD</div>
      <div class="bank">${esc(l.bank.name.toUpperCase())}</div>
      <h2>Month-to-date activity \u00b7 ${esc(l.mtd.m)}</h2>
      <table>
        <tr><th>Account</th><td>${esc(l.bank.acct)}</td></tr>
        <tr><th>MTD deposits</th><td class="end">${money(l.mtd.dep)}</td></tr>
        <tr><th>Current balance</th><td class="end">${money(l.mtd.bal)}</td></tr>
        <tr><th>Daily cash flow</th><td class="end">${money(Math.round(l.avg/30))}</td></tr>
      </table>
      <p style="margin-top:22px;font-size:12px;color:#5C564C">Activity through today. Not a final statement.</p>`;
  }
  const s = stmt || l.stmts[0];
  return `<div class="stamp">SCANNED \u00b7 STATEMENT</div>
    <div class="bank">${esc(l.bank.name.toUpperCase())}</div>
    <h2>Business checking \u00b7 ${esc(s.m)}</h2>
    <table>
      <tr><th>Account holder</th><td>${esc(l.company)}</td></tr>
      <tr><th>Account number</th><td>${esc(l.bank.acct)}</td></tr>
      <tr><th>Total deposits</th><td class="end">${money(s.dep)}</td></tr>
      <tr><th>Ending balance</th><td class="end">${money(s.end)}</td></tr>
    </table>
    <p style="margin-top:22px;font-size:12px;line-height:1.55;color:#5C564C">This is a true copy of the ${esc(s.m)} statement on file. Deposits and ending balance as reported by ${esc(l.bank.name)}.</p>`;
}
