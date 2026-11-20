// すみつぐ工務店 v4（Flash の見本）: 見本の説明・スマホのメニュー・前後の比較・スクロールで出る演出
(() => {
  const toast = document.getElementById("toast");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer;
  const show = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2800);
  };

  // 見本のため、電話・LINE・地図は移動しない
  document.querySelectorAll("[data-sample]").forEach((a) => {
    a.addEventListener("click", (e) => { e.preventDefault(); show("見本のため移動しません：" + a.dataset.sample); });
  });

  // 見本のため、フォームは送信しない（必須の入力はブラウザが先に確かめる）
  const form = document.querySelector("form[data-sample-form]");
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); show("見本のため送信されません：実際のサイトでは、この内容が会社に届きます"); });

  // スマホのメニュー
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("spnav");
  if (btn && nav) {
    const set = (open) => { btn.setAttribute("aria-expanded", String(open)); nav.hidden = !open; };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !nav.hidden) { set(false); btn.focus(); } });
  }

  // 前後の比較: 境目を動かす
  const NUDGE_MS = 1500;
  const NUDGE_WIDTH = 22;
  document.querySelectorAll(".ba").forEach((fig) => {
    const range = fig.querySelector(".ba-range");
    const set = (v) => fig.style.setProperty("--pos", v + "%");
    let touched = false;
    range.addEventListener("input", () => { touched = true; set(range.value); });
    set(range.value);
    if (calm || !("IntersectionObserver" in window)) return;
    // 画面に入ったら、境目が一度だけ左右に揺れる（動かせることを伝える）。さわったら止まる
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / NUDGE_MS);
        if (touched) return;
        set(50 - Math.sin(t * Math.PI * 2) * NUDGE_WIDTH * (1 - t * 0.3));
        if (t < 1) requestAnimationFrame(tick); else set(50);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(fig);
  });

  // スクロールで出る演出（動きを減らす設定・非対応のブラウザでは最初から見える）
  const targets = document.querySelectorAll(".rv");
  if (calm || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
  }
})();
