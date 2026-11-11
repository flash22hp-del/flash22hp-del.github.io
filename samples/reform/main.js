// すみつぐ工務店（Flash プレミアムプラン見本）共通スクリプト
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ヘッダー：少しスクロールしたら背景をつける
  const hd = $(".hd");
  const onScroll = () => hd.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // スマホのメニュー
  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$(".spnav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // スクロールで表示（data-reveal）と数字のカウントアップ（data-count）
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce) { el.textContent = end.toLocaleString(); return; }
    const t0 = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString();
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-in");
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { rootMargin: "0px 0px -10% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  // 施工事例のスライダー
  const slider = $(".slider");
  if (slider) {
    const bar = $(".slider-bar i");
    const step = () => slider.querySelector(".work").getBoundingClientRect().width + 26;
    const update = () => {
      const max = slider.scrollWidth - slider.clientWidth;
      const ratio = max > 0 ? slider.scrollLeft / max : 1;
      bar.style.width = `${Math.max(12, ratio * 100)}%`;
    };
    $(".slider-btn.prev").addEventListener("click", () => slider.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
    $(".slider-btn.next").addEventListener("click", () => slider.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
    slider.addEventListener("scroll", update, { passive: true });
    update();
  }

  // 施工事例の絞り込み
  const filter = $(".filter");
  if (filter) {
    $$("button", filter).forEach((b) => b.addEventListener("click", () => {
      $$("button", filter).forEach((x) => x.classList.toggle("is-active", x === b));
      const cat = b.dataset.cat;
      $$(".wcard").forEach((c) => c.classList.toggle("is-hide", cat !== "all" && c.dataset.cat !== cat));
    }));
  }

  // 施工事例の詳細（ポップアップ）
  const modal = $("#workModal");
  if (modal) {
    $$(".wcard").forEach((c) => c.addEventListener("click", () => {
      const img = $("img", c);
      $("#mImg", modal).src = img.src;
      $("#mImg", modal).alt = img.alt;
      $("#mCat", modal).textContent = $(".cat", c).textContent;
      $("#mTitle", modal).textContent = $(".wt", c).textContent;
      $("#mArea", modal).textContent = c.dataset.area;
      $("#mAge", modal).textContent = c.dataset.age;
      $("#mTerm", modal).textContent = c.dataset.term;
      $("#mCost", modal).textContent = c.dataset.cost;
      $("#mDesc", modal).textContent = $(".wdesc", c).textContent;
      modal.showModal();
    }));
    $(".modal-close", modal).addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  // 流れの線をスクロールに合わせて伸ばす
  const tl = $(".timeline");
  if (tl) {
    const line = $(".line", tl);
    const grow = () => {
      const r = tl.getBoundingClientRect();
      const seen = Math.min(Math.max(window.innerHeight * 0.7 - r.top, 0), r.height - 20);
      line.style.height = `${seen}px`;
    };
    grow();
    window.addEventListener("scroll", grow, { passive: true });
  }

  // 見本用：お店のリンクが入る場所を押したら説明を出す
  const toast = $("#toast");
  let timer;
  const showToast = (msg) => {
    toast.textContent = "見本のため移動しません：" + msg;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2600);
  };
  $$("[data-sample]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); showToast(a.dataset.sample); }));
  const form = $("#form");
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); showToast("ここで入力内容がお店のメールに届きます"); });

  // スマホ：最初の画面を過ぎたら下の固定ボタンを出す
  const fl = $("#float");
  const first = $(".hero, .page-hd");
  if (fl && first) new IntersectionObserver(([e]) => fl.classList.toggle("show", !e.isIntersecting)).observe(first);
})();
