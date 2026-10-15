/* ==========================================================
   AXIOM FITNESS — main.js
   ヘッダー / SPメニュー / 表示アニメーション / 下部固定CTA
   ※外部通信・ブラウザ保存は一切行わない
   ========================================================== */
(() => {
  "use strict";

  const body = document.body;

  /* ---------- Webフォント：初回描画の後に適用 ---------- */
  // フォントの CSS を最初の描画より前に当てると、フォントファイル（約200KB）の取得が最初の描画を待たせるため、
  // 最初のフレームを描いた後で media="print" を all に切り替える（最終的な見た目は同じ。display=swap）。
  // reserve.js はフォントの事前読み込みを、この Promise（CSS の適用と読み込みの完了）の後に行う。
  const fontLinks = Array.from(document.querySelectorAll("link[data-font-css]"));
  window.axiomFontsApplied = new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const loaded = fontLinks.map(
          (link) =>
            new Promise((done) => {
              if (link.sheet) {
                done();
              } else {
                link.addEventListener("load", done, { once: true });
                link.addEventListener("error", done, { once: true });
              }
            })
        );
        fontLinks.forEach((link) => {
          link.media = "all";
        });
        Promise.all(loaded).then(resolve);
      }, 0);
    });
  });

  /* ---------- Header：100pxスクロールで背景切替 ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    if ("IntersectionObserver" in window) {
      // ページ上端から99〜100pxに置いた1pxの目印が画面外に出たら（＝100pxを超えてスクロールしたら）切り替える
      // （scrollY を読むと最初の描画の前にレイアウトを強制するため、位置の読み取りは行わない）
      const marker = document.createElement("div");
      marker.setAttribute("aria-hidden", "true");
      marker.style.cssText = "position:absolute;top:99px;left:0;width:1px;height:1px;pointer-events:none;";
      body.append(marker); // 本文の構造（告知バーが先頭）を変えないよう末尾に置く（位置は absolute で上端から決まる）
      new IntersectionObserver((entries) => {
        const e = entries[0];
        header.classList.toggle("is-scrolled", !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(marker);
    } else {
      let ticking = false;
      const update = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 100);
        ticking = false;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
          }
        },
        { passive: true }
      );
    }
  }

  /* ---------- SPメニュー（全画面オーバーレイ） ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("global-nav");
  const spQuery = window.matchMedia("(max-width: 1079.98px)");

  if (toggle && nav) {
    const label = toggle.querySelector("[data-menu-label]");
    // メニュー表示中に背面を操作不可にする要素
    const outside = [
      document.querySelector(".skip-link"),
      document.querySelector(".notice"),
      document.querySelector("main"),
      document.querySelector(".site-footer"),
      document.querySelector("[data-sticky-cta]"),
      document.querySelector(".header-cta"),
    ].filter(Boolean);

    const setOpen = (open, { restoreFocus = true } = {}) => {
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "メニューを閉じる" : "メニューを開く";
      nav.classList.toggle("is-open", open);
      body.classList.toggle("is-menu-open", open);
      outside.forEach((el) => {
        el.inert = open;
      });
      if (open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (e) => {
      if (!nav.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // メニューを開いている間は、ロゴ・メニュー内リンク・閉じるボタンの間でフォーカスを循環させる
      // （Safari などリンクを Tab で飛ばすブラウザでも同じ順になるよう、移動はすべてここで行う）
      if (e.key === "Tab") {
        const items = [document.querySelector(".logo"), ...nav.querySelectorAll("a"), toggle].filter(Boolean);
        const index = items.indexOf(document.activeElement);
        const next = index === -1 ? 0 : (index + (e.shiftKey ? -1 : 1) + items.length) % items.length;
        e.preventDefault();
        items[next].focus();
      }
    });

    // メニュー内リンク（同一ページのアンカー含む）を押したら閉じる
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        setOpen(false, { restoreFocus: false });
      }
    });

    // PC幅に戻ったら閉じる
    spQuery.addEventListener("change", (e) => {
      if (!e.matches && nav.classList.contains("is-open")) {
        setOpen(false, { restoreFocus: false });
      }
    });
  }

  /* ---------- 表示アニメーション ---------- */
  // 番号付きカード等は80msずつ遅延
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    group.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 80}ms`);
    });
  });

  const revealTargets = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  // ページ内リンクやフォーカスで直接移動した場合も確実に表示する
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest && e.target.closest("[data-reveal]");
    if (el) el.classList.add("is-visible");
  });

  /* ---------- 下部固定CTA（SPのみ表示） ---------- */
  const sticky = document.querySelector("[data-sticky-cta]");
  const mode = body.dataset.sticky;

  if (sticky && "IntersectionObserver" in window) {
    const setHidden = (hidden) => {
      sticky.classList.toggle("is-hidden", hidden);
      sticky.inert = hidden;
    };

    if (mode === "after-hero") {
      const hero = document.querySelector(".hero");
      if (hero) {
        setHidden(true);
        new IntersectionObserver((entries) => {
          setHidden(entries[0].isIntersecting);
        }).observe(hero);
      }
    } else if (mode === "hide-on-form") {
      const form = document.getElementById("form");
      if (form) {
        new IntersectionObserver((entries) => {
          setHidden(entries[0].isIntersecting);
        }).observe(form);
      }
    }
  }
})();
