/* Advance Digital — site etkileşimleri (bağımlılık yok) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Yeni sayfa her zaman en üstten açılsın (#bağlantı yoksa).
     Gömülü önizlemelerde dış sayfanın kaydırma konumu da sıfırlanır. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) {
    const toTop = () => {
      window.scrollTo(0, 0);
      try {
        const r = document.documentElement, sp = r.style.scrollPaddingTop;
        r.style.scrollPaddingTop = "0px";
        r.scrollIntoView({ block: "start" });
        r.style.scrollPaddingTop = sp;
      } catch (e) {}
    };
    toTop();
    window.addEventListener("load", toTop, { once: true });
  }

  /* Header: koyu zemin üzerinde şeffaf, kaydırınca katı; aşağı kaydırırken gizlen */
  const header = $("[data-header]");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 24);
    const menuOpen = document.body.classList.contains("menu-open");
    const megaOpen = $("[data-mega]")?.dataset.open === "true";
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !menuOpen && !megaOpen);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mega menü */
  const mega = $("[data-mega]");
  if (mega) {
    const btn = $("button", mega);
    let t;
    const set = (open) => { mega.dataset.open = open; btn.setAttribute("aria-expanded", open); header.classList.toggle("is-solid", open || window.scrollY > 24); };
    btn.addEventListener("click", () => set(mega.dataset.open !== "true"));
    mega.addEventListener("mouseenter", () => { clearTimeout(t); if (window.matchMedia("(hover:hover)").matches) set(true); });
    mega.addEventListener("mouseleave", () => { t = setTimeout(() => set(false), 180); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(false); btn.focus({ preventScroll: true }); } });
    document.addEventListener("click", (e) => { if (!mega.contains(e.target)) set(false); });
  }

  /* Mobil menü */
  const toggle = $("[data-menu-toggle]");
  toggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    document.body.style.overflow = open ? "hidden" : "";
    header.classList.add("is-solid");
  });

  /* Görünür olunca belirme */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* Videolar: yalnızca ekrandayken oynat (performans + pil) */
  const vio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !reduce) { v.play().catch(() => {}); }
      else { v.pause(); }
    });
  }, { threshold: 0.25 });
  $$("video[data-autoplay]").forEach((v) => vio.observe(v));

  /* Kartlarda hover ile video önizleme */
  if (window.matchMedia("(hover:hover)").matches && !reduce) {
    $$("[data-hover-video]").forEach((img) => {
      const card = img.closest(".card");
      let v;
      card.addEventListener("mouseenter", () => {
        if (!v) {
          v = document.createElement("video");
          Object.assign(v, { muted: true, loop: true, playsInline: true, src: img.dataset.hoverVideo });
          v.setAttribute("aria-hidden", "true");
          v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s;object-fit:" + (img.parentElement.classList.contains("contain") ? "contain;padding:14px" : "cover");
          img.parentElement.appendChild(v);
        }
        v.play().then(() => (v.style.opacity = 1)).catch(() => {});
      });
      card.addEventListener("mouseleave", () => { if (v) { v.style.opacity = 0; v.pause(); } });
    });
  }

  /* Anasayfa çözüm sekmeleri */
  const tabs = $("[data-tabs]");
  const panel = $("[data-tab-panel]");
  if (tabs && panel) {
    const cards = $$(".card", panel);
    const show = (cat) => {
      $$("[data-tab]", tabs).forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === cat));
      cards.forEach((c) => (c.hidden = c.dataset.cat !== cat));
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) show(b.dataset.tab); });
    tabs.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const list = $$("[data-tab]", tabs);
      const i = list.findIndex((b) => b.getAttribute("aria-selected") === "true");
      const n = list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length];
      n.focus(); show(n.dataset.tab);
    });
    show($("[data-tab]", tabs).dataset.tab);
  }

  /* Hero format makarası */
  const reel = $("[data-reel]");
  if (reel) {
    const slides = $$(".reel-slide", reel);
    const bars = $$(".reel-bars i", reel);
    const label = $("[data-reel-label]", reel), cat = $("[data-reel-cat]", reel), link = $("[data-reel-link]", reel);
    let i = 0, timer, visible = true;
    const DUR = 6500;
    const go = (n) => {
      const prev = slides[i];
      prev.classList.remove("is-active");
      const pv = $("video", prev); pv && pv.pause();
      i = (n + slides.length) % slides.length;
      const s = slides[i];
      s.classList.add("is-active");
      label.textContent = s.dataset.label; cat.textContent = s.dataset.cat; link.href = s.dataset.href;
      bars.forEach((b, k) => { b.className = k < i ? "done" : ""; });
      void bars[i].offsetWidth;
      bars[i].style.setProperty("--dur", DUR + "ms");
      bars[i].className = "run";
      const v = $("video", s);
      if (v && !reduce) { v.preload = "auto"; v.currentTime = 0; v.play().catch(() => {}); }
      // sıradaki videoyu önceden yükle
      const nv = $("video", slides[(i + 1) % slides.length]); if (nv) nv.preload = "auto";
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(() => visible && go(i + 1), DUR);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      const v = $("video", slides[i]);
      if (!visible) { clearTimeout(timer); v && v.pause(); } else { go(i); }
    }, { threshold: 0.2 }).observe(reel);
    reel.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const r = reel.getBoundingClientRect();
      go(e.clientX - r.left > r.width / 2 ? i + 1 : i - 1);
    });
  }

  /* İletişim formu: ?urun= parametresiyle çözümü önceden seç */
  const sel = $("#f-urun");
  if (sel) {
    const u = new URLSearchParams(location.search).get("urun");
    if (u && $(`option[value="${CSS.escape(u)}"]`, sel)) sel.value = u;
  }
})();
