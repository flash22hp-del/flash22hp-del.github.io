// Flash LP: 業種で見本を入れ替える ＋ かんたん相談（業種・今のホームページ・公開の希望の3問 → LINE に答えを入れた文で開く）
// ＋ 料金の「やめた月の早見」（プランと月を押すと、払った分・やめるときに払う分・合計が替わる）
// 1問目（業種）は見本の切り替えと連動する。「最初の1通」の中でも選べて、そこには見本の無い「そのほか」がある。
(() => {
  const LINE_ADD = "https://line.me/R/ti/p/@667amiig"; // 友だち追加
  const LINE_ID = "%40667amiig"; // 公式 LINE の ID（@ は %40）
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const val = (b) => b.textContent.replace(/​/g, "").trim(); // BudouX の区切り（ゼロ幅スペース）を除く

  const panels = $$("[data-panel]");
  const tradeButtons = $$(".js-trade");
  const questions = $$("#soudan .q");
  const rest = $("#qRest");
  const msg = $("#qMsg");
  const send = $("#qSend");
  const sendLabel = $("#qSendLabel"); // ボタンの中の言葉（アイコンは残す）
  const pc = $("#qPc");
  const qr = $("#qQr");
  const copy = $("#qCopy");
  const COPY_LABEL = copy.textContent;
  // LINE へ進むボタンの言葉は2種類だけ: 友だち追加＝LABEL_ADD、文が入った状態で LINE を開く＝LABEL_OPEN
  const LABEL_ADD = "LINEで相談する";
  const LABEL_OPEN = "この文でLINEを開く";
  const tradeNow = $("#qTrade"); // 「最初の1通」の業種は1行の表示。選択肢は「変える」で開く
  const change = $("#qChange");
  const tradeList = $("#qTradeList");
  const openTrades = (on) => { tradeList.hidden = !on; change.setAttribute("aria-expanded", String(on)); };
  let answers = { "業種": tradeButtons[0].dataset.trade };
  document.documentElement.classList.add("js");

  // 見本: 選んだ業種の1枚だけ出す
  const showPanel = (trade, animate) => {
    if (!panels.some((p) => p.dataset.panel === trade)) return; // 「そのほか」には見本が無い。出ている見本はそのまま
    panels.forEach((p) => {
      const on = p.dataset.panel === trade;
      p.hidden = !on;
      p.classList.toggle("is-in", on && animate);
    });
    tradeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.trade === trade)));
  };

  // 相談: 答えの表示と、送る文
  const render = () => {
    questions.forEach((q) => $$(".opt", q).forEach((b) => b.setAttribute("aria-pressed", String(answers[q.dataset.key] === val(b)))));
    tradeNow.textContent = answers["業種"];
    const left = questions.filter((q) => !answers[q.dataset.key]).length;
    const done = left === 0;
    // 文には答えた行だけを入れる。まだ選んでいない行は入れない（どの時点で送っても、そのまま通じる文にする）
    const lines = questions.map((q) => q.dataset.key).filter((key) => answers[key]).map((key) => `\n${key}：${answers[key]}`);
    msg.textContent = `ホームページの相談です。${lines.join("")}`;
    rest.hidden = done;
    if (!done) $("#qLeft").textContent = String(left);
    const sendsText = isMobile; // スマホは文が入った状態で LINE を開く。PC は友だち追加＋コピー
    send.href = sendsText ? `https://line.me/R/oaMessage/${LINE_ID}/?${encodeURIComponent(msg.textContent)}` : LINE_ADD;
    sendLabel.textContent = sendsText ? LABEL_OPEN : LABEL_ADD;
    pc.hidden = isMobile;
    qr.hidden = isMobile; // QR はパソコンだけ（スマホでは読めない）
    copy.hidden = isMobile; // 文のコピーはパソコンだけ（スマホは文が入った状態で LINE が開く）
    copy.textContent = COPY_LABEL;
  };
  const answer = (key, value) => { answers = { ...answers, [key]: value }; render(); };

  tradeButtons.forEach((b) => b.addEventListener("click", () => {
    showPanel(b.dataset.trade, true);
    answer("業種", b.dataset.trade);
  }));
  questions.forEach((q) => $$(".opt", q).forEach((b) => b.addEventListener("click", () => {
    const isTrade = q.dataset.key === "業種";
    if (isTrade) showPanel(val(b), false);
    answer(q.dataset.key, val(b));
    if (isTrade) { openTrades(false); change.focus(); } // 選んだら1行の表示に戻す
  })));
  change.addEventListener("click", () => openTrades(tradeList.hidden));
  $$(".js-consult").forEach((a) => a.addEventListener("click", () => answer("業種", a.dataset.trade))); // 見本の下の「この業種で相談の文を作る」
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(msg.textContent); copy.textContent = "コピーしました"; }
    catch { copy.textContent = "コピーできませんでした。文を選んでコピーしてください"; }
  });

  change.hidden = false;
  openTrades(false);
  showPanel(answers["業種"], false);
  render();

  // やめた月の早見（毎月払い）。利用規約 第7条: 最低契約期間は6か月。6か月より前にやめるときは、6か月に足りない月の月額をまとめて払う
  const MIN_MONTHS = 6;
  const Z = "\u200B"; // 文節の切れ目（iPhone で語の途中で折れないように、注記の文に入れておく）
  const NOTE_EARLY = ["6か月目の", "終わりまで", "公開して、", "解約に", "なります。"].join(Z);
  const NOTE_FREE = ["次回の", "お支払い日の", "前日までに", "連絡すれば、", "お支払い済みの", "期間が", "終わった", "ところで", "解約に", "なります。"].join(Z);
  const planButtons = $$(".qp");
  const monthButtons = $$(".qm");
  const fmt = (n) => n.toLocaleString("ja-JP");
  let quit = { plan: planButtons[0].dataset.plan, yen: Number(planButtons[0].dataset.yen), month: 2 };
  const renderQuit = () => {
    const rest = Math.max(MIN_MONTHS - quit.month, 0); // 6か月に足りない月数
    const paid = quit.yen * quit.month;
    const due = quit.yen * rest;
    planButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.plan === quit.plan)));
    monthButtons.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.m) === quit.month)));
    $("#calcPlan").textContent = quit.plan;
    $("#calcMonth").textContent = `${quit.month}か月`;
    $("#calcPaidM").textContent = `${quit.month}か月分`;
    $("#calcPaid").textContent = fmt(paid);
    $("#calcDueM").textContent = rest > 0 ? `残り${rest}か月分` : "追加のお支払い";
    $("#calcDue").textContent = rest > 0 ? fmt(due) : "なし";
    $("#calcDueY").hidden = rest === 0;
    $("#calcTotalM").textContent = `${quit.month + rest}か月分`;
    $("#calcTotal").textContent = fmt(paid + due);
    $("#calcNote").textContent = rest > 0 ? NOTE_EARLY : NOTE_FREE;
  };
  const setQuit = (patch) => { quit = { ...quit, ...patch }; renderQuit(); };
  planButtons.forEach((b) => b.addEventListener("click", () => setQuit({ plan: b.dataset.plan, yen: Number(b.dataset.yen) })));
  monthButtons.forEach((b) => b.addEventListener("click", () => setQuit({ month: Number(b.dataset.m) })));
  renderQuit();
})();
