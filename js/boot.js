const __pack = {"DEVICES":[{"id":"poly","name":"Poly Edge E450","kind":"Desk","did":"(212) 555-0140","q":4,"on":true},{"id":"mobile","name":"iPhone 16 Pro","kind":"Cellular","did":"(917) 555-0166","q":3,"on":true},{"id":"bt","name":"AirPods Pro","kind":"Bluetooth","did":"via iPhone","q":3,"on":true},{"id":"web","name":"Forge desktop","kind":"PC / WebRTC","did":"(212) 555-0140","q":4,"on":true},{"id":"backup","name":"Backup DID","kind":"Twilio","did":"(646) 555-0199","q":2,"on":false}],"AGOS":["30m ago","1h ago","3h ago","1d ago","2d ago","4d ago","1w ago","2w ago"]};
const DEVICES = __pack.DEVICES;
const AGOS = __pack.AGOS;
let LEADS = [];
async function boot() {
  const ids = ["ns","hl","bd","ro","lu","mw","kp","ap"];
  LEADS = await Promise.all(ids.map(id => fetch("leads/" + id + ".json", {cache:"no-store"}).then(r => {
    if (!r.ok) throw new Error("lead " + id);
    return r.json();
  })));
  applyWidths();
  try { renderAll(); }
  catch (err) {
    const r = document.getElementById("rail");
    if (r) r.innerHTML = `<div class="empty" style="padding:24px">Couldn’t start the desk.<br><br>${esc(err && err.message)}</div>`;
  }
}
boot();
