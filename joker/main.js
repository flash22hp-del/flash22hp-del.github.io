// メニューの開け閉め
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.menu-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  document.querySelectorAll('.hd nav a').forEach((a) => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
});
