/* Spec Rehberi: kopyalama ve arama */
(function () {
  var toast = document.querySelector("[data-spec-toast]"), tt;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add("on");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("on"); }, 1800);
  }
  function itemText(row) {
    var t = row.querySelector("h3").textContent.trim();
    var head = [row.dataset.network, row.dataset.model, row.dataset.device].filter(Boolean).join(" · ");
    var lines = Array.prototype.map.call(row.querySelectorAll(".spec-lines li"), function (li) { return "- " + li.textContent.trim(); });
    var note = row.querySelector(".spec-note");
    if (note) lines.push("Not: " + note.textContent.trim());
    return t + "\n" + head + "\n" + lines.join("\n");
  }
  function copy(text, msg, btn) {
    function done() {
      say(msg);
      if (btn) { var o = btn.textContent; btn.textContent = "Kopyalandı ✓"; btn.classList.add("ok"); setTimeout(function () { btn.textContent = o; btn.classList.remove("ok"); }, 1500); }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  function visibleRows(scope) {
    return Array.prototype.filter.call((scope || document).querySelectorAll("[data-spec-item]"), function (r) { return !r.hidden; });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy-item],[data-copy-group],[data-copy-all]");
    if (!b) return;
    if (b.hasAttribute("data-copy-item")) {
      copy(itemText(b.closest("[data-spec-item]")), "Spec kopyalandı", b);
    } else if (b.hasAttribute("data-copy-group")) {
      var g = b.closest("[data-spec-group]");
      copy(visibleRows(g).map(itemText).join("\n\n"), g.querySelector("h2").textContent.trim() + " kopyalandı", b);
    } else {
      copy("Advance Digital Spec Rehberi\n\n" + visibleRows().map(itemText).join("\n\n"), "Tüm spec kopyalandı", b);
    }
  });

  // Ağ menüsü: aşağı kaydırırken gizle, yukarı kaydırınca göster
  var fbar = document.querySelector(".spec-nav");
  if (fbar) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, dy = y - lastY;
        if (Math.abs(dy) > 4) {
          var stuck = fbar.getBoundingClientRect().top <= parseFloat(getComputedStyle(fbar).top) + 1;
          fbar.classList.toggle("is-hidden", dy > 0 && stuck); lastY = y;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // Arama
  var input = document.getElementById("specSearch");
  if (input) {
    function norm(s) { return s.toLocaleLowerCase("tr").replace(/×/g, "x").replace(/\s+/g, " "); }
    var rows = Array.prototype.slice.call(document.querySelectorAll("[data-spec-item]"));
    rows.forEach(function (r) { r._t = norm(r.textContent + " " + r.dataset.network + " " + r.dataset.model + " " + r.dataset.device); });
    input.addEventListener("input", function () {
      var q = norm(input.value.trim()), any = false;
      rows.forEach(function (r) { r.hidden = q && r._t.indexOf(q) === -1; if (!r.hidden) any = true; });
      document.querySelectorAll("[data-spec-group]").forEach(function (g) { g.hidden = !visibleRows(g).length; });
      document.querySelector("[data-spec-empty]").hidden = any;
    });
  }
})();
