/* ==========================================================
   和文フォント（Zen Kaku Gothic New）の文字リストを更新するスクリプト
   ----------------------------------------------------------
   和文フォントは Google Fonts の text= 指定で「サイトで使う文字だけ」を
   読み込んでいます（表示速度のため）。HTMLやエラー文言を書き換えたら、
   このフォルダの1つ上（サイトのルート）で次を実行してください。

     node tools/update-font-subset.mjs

   ※Node.js 18以上。外部ライブラリは不要です。
   ========================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "service.html", "reserve.html"];
const SCRIPTS = ["assets/js/reserve.js"];

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

let text = "";
for (const page of PAGES) {
  let html = readFileSync(join(root, page), "utf8");
  html = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  text += [...html.matchAll(/data-label="([^"]*)"/g)].map((m) => m[1]).join("");
  text += decode(html.replace(/<[^>]+>/g, " "));
}
for (const file of SCRIPTS) {
  const js = readFileSync(join(root, file), "utf8");
  text += [...js.matchAll(/"([^"\n]*)"|`([^`]*)`/g)].map((m) => m[1] || m[2] || "").join("");
}

const chars = [...new Set([...text].filter((c) => !/\s/.test(c)))].sort().join("");
const url =
  "https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&amp;display=swap&amp;text=" +
  encodeURIComponent(chars);

const pattern = /https:\/\/fonts\.googleapis\.com\/css2\?family=Zen\+Kaku\+Gothic\+New[^"]*/g;
for (const page of PAGES) {
  const path = join(root, page);
  const html = readFileSync(path, "utf8");
  writeFileSync(path, html.replace(pattern, url));
}
console.log(`更新しました：${chars.length}文字`);
