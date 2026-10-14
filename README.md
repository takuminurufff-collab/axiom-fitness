# AXIOM FITNESS（架空デモサイト）

株式会社すみ卓 Web制作事業のテスト案件（ポートフォリオ兼用）として制作した、**架空のパーソナルジム**のデモサイトです。
掲載している店舗・料金・サービス・連絡先はすべて架空のもので、実在しません。予約フォームはデモで、入力内容は送信も保存もされません。

## 公開URL

**https://takuminurufff-collab.github.io/axiom-fitness/**

| ページ | URL |
| --- | --- |
| トップ | https://takuminurufff-collab.github.io/axiom-fitness/ |
| 料金・サービス | https://takuminurufff-collab.github.io/axiom-fitness/service.html |
| 店舗・無料体験予約 | https://takuminurufff-collab.github.io/axiom-fitness/reserve.html |

GitHub Pages（`main` ブランチのルート）で公開しています。リポジトリ：https://github.com/takuminurufff-collab/axiom-fitness

## 概要

- 全ページの最上部に告知バー、フッターに架空案件の注記を常に表示しています。
- 全ページに `<meta name="robots" content="noindex, nofollow">` を設定しているため、検索エンジンには載りません。
  - 同梱の `robots.txt`（`Disallow: /`）は、ドメイン直下に置いたときに働くものです。現在の公開URL（`/axiom-fitness/` 配下）では検索エンジンに読まれないため、検索除外は上記の `noindex` で行っています。独自ドメインやユーザーサイト（`<ユーザー名>.github.io` リポジトリ）で公開する場合は、そのまま有効になります。
- 依存ライブラリのない静的サイト（HTML＋CSS＋素のJavaScript）です。外部から読み込むのは Google Fonts だけです。

## ファイル構成

```
├── index.html          トップ
├── service.html        料金・サービス
├── reserve.html        店舗情報・無料体験予約（デモフォーム）
├── robots.txt          Disallow: /
├── assets/
│   ├── css/
│   │   ├── tokens.css      色・文字・余白の変数（デザイントークン）
│   │   ├── base.css        リセット・タイポ・共通レイアウト・ヘッダー・フッター
│   │   ├── components.css  ボタン・カード・FAQ・フォーム等
│   │   └── pages.css       ページ固有の装飾
│   ├── js/
│   │   ├── main.js         ヘッダー・SPメニュー・表示アニメ・下部固定CTA
│   │   └── reserve.js      予約フォーム（reserve.html のみ読み込み）
│   └── img/                logo.svg / favicon.svg / favicon-32.png / ogp.png / plate.svg
└── tools/
    └── update-font-subset.mjs  和文フォントの文字リスト更新（文言を変えたときに実行）
```

## ローカルでの確認方法

`index.html` をブラウザで直接開いても表示できますが、本番に近い状態で確認するにはローカルサーバーを使います。

```bash
# このフォルダで実行（どちらか一方）
python -m http.server 8000
npx serve .
```

ブラウザで `http://localhost:8000/` を開きます。スマートフォン表示は、ブラウザの開発者ツールのデバイスモード（幅 360／390／768px など）で確認できます。

## GitHub Pages での公開手順

1. GitHub で新しいリポジトリを作成します（例：`axiom-fitness`）。
2. このフォルダの中身をリポジトリのルートに push します。
   ```bash
   git init
   git add .
   git commit -m "AXIOM FITNESS demo site"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/axiom-fitness.git
   git push -u origin main
   ```
3. リポジトリの **Settings → Pages** を開き、「Build and deployment」の Source を **Deploy from a branch**、Branch を **main / (root)** にして保存します。
4. 数分後、`https://<ユーザー名>.github.io/axiom-fitness/` で公開されます。
5. 各HTMLの `<head>` にある次の3か所を、公開URLに合わせます（現在は上記の公開URLで設定済み。公開先やリポジトリ名を変えたときに更新してください）。
   - `<link rel="canonical">`：そのページの公開URL（トップはルートのURL）
   - `og:url`：canonical と同じURL
   - `og:image`：OGP画像の絶対URL（`<公開URL>/assets/img/ogp.png`）

Cloudflare Pages の場合は、リポジトリを接続し、ビルドコマンドは空欄、出力ディレクトリは `/` のままで公開できます。

> 架空のデモサイトのため、`noindex` と `robots.txt` は公開後もそのまま残してください。

## 文言を差し替える場所

| 差し替えたい内容 | 場所 |
| --- | --- |
| 架空案件の告知バー | 各HTMLの `<div class="notice" role="note">`（3ファイルとも同じ文言） |
| ヘッダー・ナビ・フッター | 各HTMLの `<header class="site-header">` と `<footer class="site-footer">`（3ファイル共通の内容） |
| ページタイトル・説明文・OGP | 各HTMLの `<head>` 内の `<title>`、`meta name="description"`、`og:*` |
| トップの各セクション | `index.html` 内のコメント `<!-- HERO -->` `<!-- 01 PROBLEM -->` … `<!-- FINAL CTA -->` ごとに区切ってあります |
| 料金プラン・費用表 | `service.html` の `<!-- 01 PLANS -->` と `<!-- 02 FEES -->`。費用表は、スマートフォン表示で使う `data-label` 属性も合わせて変更します |
| 料金・体験ページのFAQ | 画面の文言（`<details>`）と、`<head>` 内の構造化データ（`application/ld+json` の FAQPage）の**両方**を変更します |
| 店舗情報 | `reserve.html` の `<!-- 03 SHOP -->`（`<dl class="info-list">`） |
| フォームの項目名・選択肢 | `reserve.html` の `<form id="trial-form">` 内 |
| フォームのエラー文言 | `assets/js/reserve.js` の `MSG` |
| フォームの日付範囲（明日〜30日後） | `assets/js/reserve.js` の「日付の範囲」 |
| 色・文字サイズ・余白 | `assets/css/tokens.css` |

### 文言を変えたあとに必ず行うこと（和文フォントの更新）

表示を速くするため、和文フォント（Zen Kaku Gothic New）は **サイトで使っている文字だけ** を Google Fonts から読み込んでいます。新しい文字を含む文言に差し替えたら、次のコマンドで文字リストを更新してください（Node.js 18以上、追加のインストールは不要）。

```bash
node tools/update-font-subset.mjs
```

実行しなかった場合も表示は崩れませんが、新しく追加した文字だけ端末の標準フォントで表示されます。

### 写真を使う場合

人物写真はトレーナー・会員と誤認されるため、デモでは使っていません。実案件で写真に差し替えるときは、`components.css` に用意してある画像枠クラスを使います。

```html
<div class="frame frame--16x9"><img src="..." alt="..." width="1600" height="900"></div>
<div class="frame frame--4x5"><img src="..." alt="..." width="800" height="1000"></div>
```

## CSSの設計メモ（なぜそう書いたか）

CSSファイルは容量（合計50KB未満）を守るためコメントを入れていません。見ただけでは意図が分かりにくい箇所の理由を、ここにまとめます。

### 共通（base.css）

| 箇所 | 理由 |
| --- | --- |
| ヘッダーのぼかし（`backdrop-filter`）を `.site-header::before` に当てている | ヘッダー本体に `backdrop-filter` を付けると、その中の `position: fixed` が画面ではなくヘッダー基準になり、SPメニューの全画面オーバーレイが崩れるため |
| ヘッダー背景 `rgba(11, 11, 12, 0.8)` と、下部固定CTAの背景 `rgba(11, 11, 12, 0.92)` | どちらも `--color-black` の半透明版（ヘッダーは仕様書§8-3の指定値）。トークン外の色ではありません |
| `p` `li` `dd` などに `text-wrap: pretty` | 行末に1〜2文字だけ残る行（「す。」だけの行など）を避けるため |
| 見出しに `word-break: auto-phrase` と `text-wrap: balance` | 日本語の見出しを文節の切れ目で折り返し、行の長さをそろえるため（対応ブラウザのみ有効で、未対応でも表示は崩れません） |
| `html:not(.js)` のルール | JavaScriptが無効でも、ナビが折り返して全部表示されるようにするため |
| 表示アニメーションの初期状態（非表示）は `.js [data-reveal]` のときだけ | JavaScriptが無効でも内容が見えるようにするため（仕様書§8-6） |
| `body.has-sticky-cta` の下余白 | SPの下部固定CTA（高さ64px＋iPhoneのホームバー領域）が、フッターやフォームのボタンを隠さないようにするため |
| `--font-en`（Archivo）と `--font-mono`（IBM Plex Mono）の2番目に `"Zen Kaku Gothic New"` を入れている（tokens.css） | 欧文フォントには日本語の字形がないため、英字・数字用の要素に含まれる日本語・全角記号（「月4回」「無料」「株式会社すみ卓」「―」など）が OS のフォントで表示されないよう、仕様の和文フォントに落とすため |
| `prefers-reduced-motion: reduce` で全アニメーションを止めている | OSの「視差効果を減らす」設定に従うため（仕様書§4-4・§7-3） |

### 部品（components.css）

| 箇所 | 理由 |
| --- | --- |
| ボタンのホバーで背景を明るくする処理を `::before` の `opacity` で行っている | アニメーションは `transform` と `opacity` だけで行うため（仕様書§8-6） |
| フォームの入力欄と確認画面の値を端末のフォント（`system-ui` など）で表示 | 入力された文字に応じて Google Fonts の追加読み込み（外部通信）が起きないようにするため（仕様書§9-3「操作中に外部通信が1件も発生しない」） |
| `.field-group > legend` を `float` にしている | `fieldset` の上線の上に `legend` が重なって表示されるブラウザ標準の描き方を避けるため |
| ラジオボタン・チェックボックス（`.choice input`）をラベル全体に広げて透明にしている | ラベルのどこを押しても選べるようにし、タップ領域44px以上を確保するため |
| 費用表のSP表示で `td::before { content: attr(data-label) }` | SPで表を「項目名：値」の縦積みにするとき、列見出しを各セルに表示するため。費用表の文言を変えるときは `data-label` も合わせて変更してください |
| FAQの開閉に `::details-content` を使っている | `details` の高さをなめらかに開閉するため。未対応ブラウザでは一瞬で開閉するだけで、操作には影響しません |
| `.frame--16x9` `.frame--4x5` | 実案件で写真に差し替えるための画像枠（デモでは未使用） |

### ページ固有（pages.css）

| 箇所 | 理由 |
| --- | --- |
| 1079px以下：ヒーローの同心円（`.hero__plate` `.page-hero__plate`）の中心を右上の角に置いている | スマホ・タブレット幅では文字の横に空きがないため、文字のない角に4分の1だけ見せて、見出しや本文に重ならないようにするため。大きさは `--plate-sp` で調整します |
| 1079px以下：トップのヒーロー本文の上余白を112pxにしている | 英字ラベルが横幅いっぱいに伸びるため、右上の同心円と重ならない余白をとっている |
| 1080px以上：トップの同心円の左端を「本文エリアの左端＋本文エリア幅の79%」に置いている | 同心円の大きさ（64vw、最大980px）を保ったまま、見出し・本文・CTA・「3つの事実」の文字に重ならない位置まで右へずらすため。79%は、画面の高さが低い場合（640px）でも重ならないように計算した値に余裕を足したもの。見出しの文言や文字サイズを変えた場合は、この値を見直してください |
| 最終CTAの同心円（`.final-cta__plate`）を下端中央に置き、セクションの下余白を広げている | 同心円を見出しの背面に置くと字画の中を線が通って読みにくくなるため、文字の下から半円がのぞく構図にしている。大きさは `--plate-final` で調整し、下余白も連動します |
| 「3つの約束」の番号の列を固定幅（`--promise-num-size` の1.56倍）にしている | 数字によって字幅が違う（「01」は約1.41em、「02」「03」は約1.50em）ため、見出し・本文の開始位置を3件でそろえるため |

## 実装上の約束（変更しないでください）

- 予約フォームは外部に送信しません（`action` 属性なし、`fetch`・`XMLHttpRequest` 不使用、`submit` は `preventDefault()`）。
- 入力内容は localStorage・Cookie などに保存しません。完了画面を表示した時点ですべて破棄します。
- 確認画面への入力値の反映は `textContent` だけで行い、`innerHTML` は使いません。
- 計測タグは入れていません。実案件で Google Analytics 4 を導入する場合に備えて、CTAに `data-cta="hero"` などの位置属性を付けてあります。
