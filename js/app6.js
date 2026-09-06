(function resize() {
  let side = null, startX = 0, startW = 0;
  document.addEventListener("mousedown", (e) => {
    const h = e.target.closest(".handle");
    if (!h) return;
    side = h.dataset.side;
    startX = e.clientX;
    startW = side === "rail"
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("--rail-w"), 10) || 320
      : parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dock-w"), 10) || 400;
    h.classList.add("drag");
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!side) return;
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-scale")) || 1;
    const dx = (e.clientX - startX) / scale;
    if (side === "rail") {
      const w = Math.min(560, Math.max(260, startW + dx));
      document.documentElement.style.setProperty("--rail-w", w + "px");
    } else {
      const w = Math.min(640, Math.max(300, startW - dx));
      document.documentElement.style.setProperty("--dock-w", w + "px");
    }
    placePad();
  });
  document.addEventListener("mouseup", () => {
    if (!side) return;
    document.querySelectorAll(".handle").forEach(h => h.classList.remove("drag"));
    storeSet(LS.rail, parseInt(getComputedStyle(document.documentElement).getPropertyValue("--rail-w"), 10));
    storeSet(LS.dock, parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dock-w"), 10));
    side = null;
  });
  document.addEventListener("dblclick", (e) => {
    const h = e.target.closest(".handle");
    if (!h) return;
    if (h.dataset.side === "rail") { document.documentElement.style.setProperty("--rail-w", "320px"); storeSet(LS.rail, 320); }
    else { document.documentElement.style.setProperty("--dock-w", "400px"); storeSet(LS.dock, 400); }
    placePad();
  });
})();

sizeApp();
applyWidths();
try { renderAll(); }
catch (err) {
  const r = document.getElementById("rail");
  if (r) r.innerHTML = `<div class="empty" style="padding:24px">Couldn’t start the desk.<br><br>${esc(err && err.message)}</div>`;
}
