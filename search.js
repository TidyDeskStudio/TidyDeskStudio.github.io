
(() => {
  const q = document.getElementById("q"), box = document.getElementById("res");
  if (!q) return;
  let idx = null, sel = -1;
  const load = () => idx ? Promise.resolve(idx) : fetch("/search.json").then(r => r.json()).then(d => (idx = d));
  const esc = s => s.replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  function run() {
    const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) { box.style.display = "none"; return; }
    load().then(d => {
      const hits = d.map(x => {
        const title = x.title.toLowerCase(), all = (x.title + " " + x.text).toLowerCase();
        if (!words.every(w => all.includes(w))) return null;
        return [x, words.reduce((s, w) => s + (title.includes(w) ? 3 : 1), 0) + (x.t === "template" ? 0.5 : 0)];
      }).filter(Boolean).sort((a, b) => b[1] - a[1]).slice(0, 8);
      sel = -1;
      box.innerHTML = hits.length ? hits.map(([x]) => `<a href="${x.url}"><b>${x.t}</b>${esc(x.title)}<small>${esc(x.text.slice(0, 90))}</small></a>`).join("")
        : '<a href="/templates/"><small>No matches - browse all templates</small></a>';
      box.style.display = "block";
    });
  }
  q.addEventListener("input", run);
  q.addEventListener("focus", () => { load(); if (q.value) run(); });
  q.addEventListener("keydown", e => {
    const items = [...box.querySelectorAll("a")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, Math.min(items.length - 1, sel + (e.key === "ArrowDown" ? 1 : -1))); items.forEach((a, i) => a.classList.toggle("on", i === sel)); }
    if (e.key === "Enter" && items.length) location.href = items[Math.max(sel, 0)].href;
    if (e.key === "Escape") box.style.display = "none";
  });
  document.addEventListener("click", e => { if (!e.target.closest(".search")) box.style.display = "none"; });
})();
