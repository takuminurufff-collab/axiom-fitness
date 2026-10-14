/* ==========================================================
   AXIOM FITNESS — reserve.js（無料体験予約フォーム・デモ）
   ・送信しない（fetch / XHR / form action を使わない）
   ・保存しない（localStorage / Cookie 等を使わない）
   ・入力値は DOM 上にのみ存在し、完了時にすべて破棄する
   ========================================================== */
(() => {
  "use strict";

  const form = document.getElementById("trial-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("fieldset.step"));
  const progress = document.querySelector("[data-form-progress]");
  const progressItems = progress ? Array.from(progress.querySelectorAll(".progress li")) : [];
  const progressCount = document.querySelector("[data-progress-count]");
  const summary = document.getElementById("error-summary");
  const confirmList = form.querySelector("[data-confirm-list]");
  const complete = document.querySelector("[data-form-complete]");
  const submitBtn = form.querySelector("[data-submit]");
  const question = form.elements.question;
  const charCount = form.querySelector("[data-char-count]");

  const TOTAL = steps.length;
  const QUESTION_MAX = 500;
  let current = 1;
  let completed = false;

  /* ---------- 日付の範囲（明日〜30日後） ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  const MIN = toISO(minDate);
  const MAX = toISO(maxDate);

  ["date1", "date2"].forEach((name) => {
    form.elements[name].min = MIN;
    form.elements[name].max = MAX;
  });

  const inRange = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= MIN && v <= MAX;

  /* ---------- 検証ルール（エラー文言は§8-5） ---------- */
  const MSG = {
    date: "ご希望日を選択してください",
    time: "ご希望の時間帯を選択してください",
    name: "お名前を入力してください",
    kana: "フリガナは全角カタカナで入力してください",
    email: "メールアドレスの形式が正しくありません",
    tel: "電話番号は数字とハイフンで入力してください",
    agree: "個人情報の取り扱いへの同意が必要です",
  };

  // 電話番号：日本語入力のままでも通るよう、全角数字とハイフン類（全角ハイフン・長音符など）を半角にそろえる
  const toHalfWidthTel = (v) =>
    v
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[‐‑‒–—―−ーｰ－]/g, "-")
      .trim();

  const rules = {
    date1: (el) => (inRange(el.value) ? "" : MSG.date),
    time1: (el) => (el.value ? "" : MSG.time),
    date2: (el) => (el.value === "" || inRange(el.value) ? "" : MSG.date),
    name: (el) => (el.value.trim() ? "" : MSG.name),
    kana: (el) => (/^[ァ-ヺー・　 ]+$/.test(el.value.trim()) && /[ァ-ヺ]/.test(el.value) ? "" : MSG.kana),
    email: (el) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) ? "" : MSG.email),
    tel: (el) => (/^(?=.*\d)[0-9-]{10,13}$/.test(toHalfWidthTel(el.value)) ? "" : MSG.tel),
    agree: (el) => (el.checked ? "" : MSG.agree),
  };

  // 入力欄を離れたとき・ステップを進めるときに、表示中の値も半角にそろえる（変換中の値は書き換えない）
  const normalizers = {
    tel: (el) => {
      el.value = toHalfWidthTel(el.value);
    },
  };

  const stepFields = {
    1: ["date1", "time1", "date2"],
    2: ["name", "kana", "email", "tel"],
    3: ["agree"],
  };

  const setError = (el, message) => {
    const out = document.getElementById(`${el.id}-error`);
    if (message) {
      el.setAttribute("aria-invalid", "true");
    } else {
      el.removeAttribute("aria-invalid");
    }
    if (out) out.textContent = message;
  };

  const validateField = (name) => {
    const el = form.elements[name];
    const message = rules[name](el);
    setError(el, message);
    return message;
  };

  const clearSummary = () => {
    summary.replaceChildren();
  };

  const showSummary = (errors) => {
    const list = document.createElement("ul");
    errors.forEach(({ el, message }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${el.id}`;
      a.textContent = message;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        el.focus();
      });
      li.append(a);
      list.append(li);
    });
    summary.replaceChildren(list);
  };

  const validateStep = (n) => {
    const errors = [];
    stepFields[n].forEach((name) => {
      if (normalizers[name]) normalizers[name](form.elements[name]);
      const message = validateField(name);
      if (message) errors.push({ el: form.elements[name], message });
    });
    if (errors.length) {
      showSummary(errors);
      errors[0].el.focus();
      return false;
    }
    clearSummary();
    return true;
  };

  // 入力欄を離れた時点で検証、エラー表示中は入力のたびに再検証
  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    const evt = el.type === "checkbox" ? "change" : "blur";
    el.addEventListener(evt, () => {
      if (normalizers[name]) normalizers[name](el);
      validateField(name);
    });
    el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") validateField(name);
    });
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => validateField(name));
    }
  });

  /* ---------- ご質問：残り文字数 ---------- */
  const updateCount = () => {
    charCount.textContent = String(Math.max(0, QUESTION_MAX - question.value.length));
  };
  question.addEventListener("input", updateCount);

  /* ---------- ステップ切替 ---------- */
  const goTo = (n, focusTarget) => {
    current = n;
    steps.forEach((step) => {
      step.hidden = Number(step.dataset.step) !== n;
    });
    progressItems.forEach((li, i) => {
      if (i + 1 === n) {
        li.setAttribute("aria-current", "step");
      } else {
        li.removeAttribute("aria-current");
      }
      li.classList.toggle("is-done", i + 1 < n);
    });
    if (progressCount) progressCount.textContent = `${n}/${TOTAL}`;
    clearSummary();
    if (n === 3) buildConfirm();

    const target = focusTarget || steps[n - 1].querySelector(".step__title");
    target.focus();
  };

  /* ---------- 確認画面（textContent のみで挿入） ---------- */
  const WEEK = ["日", "月", "火", "水", "木", "金", "土"];
  const formatDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${y}年${m}月${d}日（${WEEK[date.getDay()]}）`;
  };
  const joinDateTime = (date, time) => [formatDate(date), time].filter(Boolean).join(" ");
  const checkedValues = (name) =>
    Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);

  const buildConfirm = () => {
    const f = form.elements;
    const rows = [
      ["第1希望", joinDateTime(f.date1.value, f.time1.value), 1, "date1"],
      ["第2希望", joinDateTime(f.date2.value, f.time2.value), 1, "date2"],
      ["お名前", f.name.value.trim(), 2, "name"],
      ["フリガナ", f.kana.value.trim(), 2, "kana"],
      ["メールアドレス", f.email.value.trim(), 2, "email"],
      ["電話番号", f.tel.value.trim(), 2, "tel"],
      ["年代", checkedValues("age").join("、"), 2, "age"],
      ["目的", checkedValues("purpose").join("、"), 2, "purpose"],
      ["運動経験", checkedValues("experience").join("、"), 2, "experience"],
      ["ご質問", f.question.value.trim(), 2, "question"],
    ];

    const fragment = document.createDocumentFragment();
    rows.forEach(([label, value, step, field]) => {
      const row = document.createElement("div");
      row.className = "confirm-list__row";

      const dt = document.createElement("dt");
      dt.textContent = label;

      const dd = document.createElement("dd");
      dd.textContent = value || "—";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "confirm-list__edit";
      edit.textContent = "変更";
      edit.setAttribute("aria-label", `${label}を変更`);
      edit.addEventListener("click", () => {
        const el = form.elements[field];
        const target = el instanceof RadioNodeList ? el[0] : el;
        goTo(step, target);
      });

      row.append(dt, dd, edit);
      fragment.append(row);
    });
    confirmList.replaceChildren(fragment);
  };

  /* ---------- 完了（デモ） ---------- */
  const finish = () => {
    // 連打などで完了処理が二重に走らないようにする
    completed = true;
    submitBtn.disabled = true;
    form.reset();
    updateCount();
    confirmList.replaceChildren();
    clearSummary();
    Object.keys(rules).forEach((name) => setError(form.elements[name], ""));

    form.hidden = true;
    if (progress) progress.hidden = true;
    complete.hidden = false;
    complete.querySelector("h3").focus();
  };

  /* ---------- イベント ---------- */
  form.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) {
      if (validateStep(current)) goTo(current + 1);
    } else if (e.target.closest("[data-prev]")) {
      goTo(current - 1);
    }
  });

  // 入力欄での Enter による暗黙の送信（勝手に次へ進む・完了する）を止める
  // ボタン上の Enter、textarea の改行、日本語入力の確定の Enter はそのまま
  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) return;
    if (e.target.matches('input:not([type="submit"]):not([type="button"]):not([type="reset"]), select')) {
      e.preventDefault();
    }
  });

  // 送信はすべてここで止める（外部送信は行わない）
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (completed) return;
    if (current < TOTAL) {
      if (validateStep(current)) goTo(current + 1);
      return;
    }
    if (validateStep(TOTAL)) finish();
  });

  submitBtn.disabled = false;
  updateCount();

  /* ---------- 後から表示する文言のWebフォントを事前に読み込む ---------- */
  // フォーム操作中に追加のフォント取得（外部通信）が起きないよう、ページ表示時に済ませておく
  if (document.fonts && document.fonts.load) {
    const section = document.getElementById("form");
    const text =
      (section ? section.textContent : "") +
      Object.values(MSG).join("") +
      "変更を—、年月日（）" +
      WEEK.join("") +
      "0123456789/";
    ["400", "500", "700"].forEach((w) => {
      document.fonts.load(`${w} 16px "Zen Kaku Gothic New"`, text).catch(() => {});
    });
  }
})();
