function fitLetterZoom() {
  const vv = window.visualViewport;
  const w = (vv && vv.width) || window.innerWidth || 1200;
  const h = (vv && vv.height) || window.innerHeight || 800;
  const z = Math.min((w - 88) / 816, (h - 96) / 1056);
  return Math.max(0.18, +z.toFixed(3));
}
function bumpZoom(dir) {
  const fit = fitLetterZoom();
  const cur = state.fileZoom || fit;
  const next = cur * (dir > 0 ? 1.14 : 1 / 1.14);
  state.fileZoom = +Math.min(fit * 2.2, Math.max(fit * 0.92, next)).toFixed(3);
}
(function () {
  const orig = ico;
  ico = function (name, s) {
    s = s == null ? 16 : s;
    if (name === "chevU" || name === "chevD") {
      const d = name === "chevU" ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6";
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    }
    return orig(name, s);
  };
})();
function lightboxShell(letterHtml, spec) {
  const z = state.fileZoom || fitLetterZoom();
  const pages = spec.pages || 1;
  const page = spec.page || 0;
  return `
    <div class="lb-cluster">
      <div class="lb-page">
        <div class="letter-wrap" style="width:${816 * z}px;height:${1056 * z}px">
          <div class="letter" style="transform:scale(${z})">${letterHtml}</div>
        </div>
      </div>
      <div class="lb-nav">
        <button type="button" class="lb-arrow" data-act="file-prev" title="Previous page">${ico("chevU",18)}</button>
        <button type="button" class="lb-arrow" data-act="file-next" title="Next page">${ico("chevD",18)}</button>
      </div>
      <div class="lb-pg">${page + 1} / ${pages}</div>
      <div class="lb-zoom">
        <button type="button" data-act="file-zoom" data-d="1" title="Zoom in">${ico("plus",16)}</button>
        <button type="button" data-act="file-zoom" data-d="-1" title="Zoom out">${ico("minus",16)}</button>
      </div>
    </div>`;
}
document.addEventListener("click", (e) => {
  const z = e.target.closest("[data-act='file-zoom']");
  if (!z) return;
  e.stopImmediatePropagation();
  bumpZoom(+z.dataset.d);
  renderModal();
}, true);
