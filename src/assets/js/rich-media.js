/* Rich Media Stüdyosu: canlı örnekleri ölçekler, görünür olunca yükler ve boyuta göre filtreler */
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll(".rm-frame"));
  if (!frames.length) return;

  function fit(f) {
    var el = f.firstElementChild;
    var w = +f.dataset.w, h = +(f.dataset.cur || f.dataset.h);
    var stage = f.parentElement, cs = getComputedStyle(stage);
    var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var s = Math.min(1, avail / w);
    el.style.width = w + "px";
    el.style.height = Math.max(h, +f.dataset.h) + "px";
    el.style.transform = "scale(" + s + ")";
    f.style.width = w * s + "px";
    f.style.height = h * s + "px";
  }
  function fitAll() { frames.forEach(fit); }
  window.addEventListener("resize", fitAll);
  fitAll();

  // Örnekleri ekrana yaklaşınca yükle, uzaklaşınca videoyu durdur
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var el = e.target.firstElementChild;
      if (e.isIntersecting) {
        if (!el.getAttribute("src")) el.setAttribute("src", el.dataset.src);
        if (el.tagName === "VIDEO") { var p = el.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (el.tagName === "VIDEO") {
        el.pause();
      }
    });
  }, { rootMargin: "300px 0px" });
  frames.forEach(function (f) { io.observe(f); });

  // Yayın mockup videoları: görünür olunca yükle ve oynat
  var mio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute("src")) v.setAttribute("src", v.dataset.src);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else { v.pause(); }
    });
  }, { rootMargin: "200px 0px" });
  document.querySelectorAll(".rm-mockup video").forEach(function (v) { mio.observe(v); });

  // Pushdown örneği genişleyince alanı büyüt
  window.addEventListener("message", function (e) {
    if (!e.data || e.data.type !== "ad-resize") return;
    frames.forEach(function (f) {
      var el = f.firstElementChild;
      if (el.tagName === "IFRAME" && el.contentWindow === e.source) { f.dataset.cur = e.data.height; fit(f); }
    });
  });

  // Filtre çubuğu: aşağı kaydırırken gizle, yukarı kaydırınca göster
  var fbar = document.querySelector(".rm-filter");
  if (fbar) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, dy = y - lastY;
        if (Math.abs(dy) > 4) {
          var stuck = fbar.getBoundingClientRect().top <= parseFloat(getComputedStyle(fbar).top) + 1;
          fbar.classList.toggle("is-hidden", dy > 0 && stuck);
          lastY = y;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // Boyut filtresi
  var bar = document.querySelector("[data-rm-filter]");
  if (bar) {
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-size]");
      if (!b) return;
      var size = b.dataset.size;
      bar.querySelectorAll("[data-size]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.querySelectorAll(".rm-item").forEach(function (it) { it.hidden = !(size === "all" || it.dataset.size === size); });
      document.querySelectorAll("[data-rm-group]").forEach(function (g) { g.hidden = !g.querySelector(".rm-item:not([hidden])"); });
      fitAll();
      var cat = document.querySelector(".rm-catalog");
      if (cat && cat.getBoundingClientRect().top < 0) cat.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
