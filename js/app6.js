(function resize() {
  let side = null, startX = 0, startW = 0;
  document.addEventListener("mousedown", (e) => {
    const h = e.target.closest(".handle");
    if (!h) return;
    side = h.dataset.side;
    startX = e.clientX;
    startW = side === "rail" ? $("rail").getBoundingClientRect().width : $("dock").getBoundingClientRect().width;
    h.classList.add("drag");
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!side) return;
    const dx = e.clientX - startX;
    if (side === "rail") {
      const w = Math.min(560, Math.max(280, startW + dx));
      document.documentElement.style.setProperty("--rail-w", w + "px");
    } else {
      const w = Math.min(620, Math.max(400, startW - dx));
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
    if (h.dataset.side === "rail") { document.documentElement.style.setProperty("--rail-w", "400px"); storeSet(LS.rail, 400); }
    else { document.documentElement.style.setProperty("--dock-w", "500px"); storeSet(LS.dock, 500); }
    placePad();
  });
})();

applyWidths();
try { renderAll(); }
catch (err) {
  const r = document.getElementById("rail");
  if (r) r.innerHTML = `<div class="empty" style="padding:24px">Couldn’t start the desk.<br><br>${esc(err && err.message)}</div>`;
}
