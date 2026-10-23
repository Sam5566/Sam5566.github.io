# Sam Cheng-Tse Huang 個人網站

純靜態網站（HTML + CSS + JS），不用安裝套件、不用 build，放上 GitHub Pages 就能跑。

```
index.html          頁面內容（研究、論文、CV 燈箱的文字都在這裡）
assets/style.css    樣式與配色
assets/main.js      動畫、連結、地圖地點
assets/favicon.svg  分頁小圖示
.nojekyll           讓 GitHub Pages 原樣發佈檔案
```

## 1. 在自己電腦預覽

在這個資料夾裡執行：

```bash
python3 -m http.server 8000
```

然後打開 <http://localhost:8000>。改完存檔後重新整理就能看到變化。

> 直接雙擊 `index.html` 也能看，但 CV 的 PDF 下載按鈕只有透過伺服器開啟時才會出現。

## 2. 發佈到 GitHub Pages

**建議用 `你的帳號.github.io` 當 repo 名稱**，網址會是 `https://你的帳號.github.io`。用其他名稱（例如 `website`）的話，網址會是 `https://你的帳號.github.io/website/`，一樣可以用。

### 方法 A：網頁上傳（不用碰指令）

1. 到 GitHub 右上角 **+ → New repository**，名稱填 `你的帳號.github.io`，設成 **Public**，按 **Create repository**。
2. 在新 repo 頁面點 **uploading an existing file**，把這個資料夾裡的**所有檔案和 `assets` 資料夾**拖進去（`.nojekyll` 是隱藏檔，若沒顯示可略過），按 **Commit changes**。
3. 進 **Settings → Pages**，**Source** 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`，按 **Save**。
4. 等一到兩分鐘，頁面上方會出現網址。

### 方法 B：用 git 指令

```bash
cd 這個資料夾
git init
git add .
git commit -m "Personal website"
git branch -M main
git remote add origin https://github.com/你的帳號/你的帳號.github.io.git
git push -u origin main
```

接著做方法 A 的第 3 步。之後每次修改：

```bash
git add .
git commit -m "Update"
git push
```

推上去約一分鐘後網站會自動更新。

## 3. 常改的地方

### 個人連結（`assets/main.js` 最上方 `LINKS`）

把網址填進去就會出現在首頁和頁尾，留空 `''` 的會自動隱藏：

```js
{label:'INSPIRE', url:'https://inspirehep.net/authors/你的ID'},
{label:'Google Scholar', url:'https://scholar.google.com/citations?user=你的ID'},
{label:'GitHub', url:'https://github.com/你的帳號'},
{label:'LinkedIn', url:''},
```

INSPIRE 和 ORCID 已經是個人頁；Scholar 還是用姓名搜尋的結果頁，請換成個人頁。

### 地圖地點（`assets/main.js` 的 `PLACES`）

每個地點一筆，`items` 裡每一行的第一個字決定顏色：`'work'`（藍）、`'talk'`（橘）、`'collab'`（青綠，合作者）。同一個地點有好幾種時，點會自動分成幾色：

```js
{name:'Geneva, Switzerland', lat:46.23, lon:6.05,
 items:[['talk','Talk, Jun 2026: 演講題目. 會議名稱'], ['collab','合作者姓名, 單位', 2026]]},
```

合作者那一行的第三個值是最後一起合作的年份。從 New Brunswick 連過去的弧線每過五年淡一階（100% → 70% → 40%，最淡停在 20%，不會完全消失）；地圖上的點不會變淡。

經緯度可以在 Google 地圖上按右鍵複製。兩個地點太近（差不到 2 度）的話點會疊在一起，合成一筆比較好。

### 論文（自動從 INSPIRE 同步）

每次有人打開網站，`assets/main.js` 會向 INSPIRE（作者 ID `1735317`）抓最新的論文清單、作者、期刊、引用數。新論文上了 INSPIRE 就會自動出現，preprint 正式發表後期刊資訊也會自動更新，不用改任何檔案。

- **自己寫的白話摘要和 Scales 標籤**：在 `index.html` 的 `<ol id="papers-list">` 裡，找到 `data-arxiv="arXiv編號"` 的那一段改。有這一段的論文會用你寫的標題、摘要和 Scales；沒有的就顯示 INSPIRE 上的 abstract。
- **INSPIRE 上沒有的論文**（例如 ATLAS conference note）：用 `data-manual data-date="YYYY-MM-DD"` 標記，會依日期插進清單。
- CV 燈箱的 Publications（`id="cv-pubs"`）也用同樣規則同步。
- 連不上 INSPIRE 時，就顯示 `index.html` 裡寫好的清單，所以偶爾把新論文也補進 HTML 比較保險。

### 目前研究、研究方向、CV 內容

都在 `index.html`，搜尋對應的英文標題（例如 `Current work`、`Curriculum vitae`）直接改文字。

### CV PDF（從 Overleaf 自動更新）

Overleaf 上的 CV 已經用 Git 接到 `../cv-overleaf`（token 存在 macOS 鑰匙圈）。在 Overleaf 改完 CV 後，執行：

```bash
"/Users/samh/Workspace/personal webpage/update-cv.sh"
```

它會拉最新版、用 pdflatex 編譯，然後放到 `assets/cv.pdf`；CV 燈箱右上角的 **Download PDF** 就會是最新版。如果 PDF 裡出現電話號碼或 Gmail，它會拒絕發佈。

CV 燈箱裡的文字（學歷、經歷、演講）不會自動同步，要另外改 `index.html`。

## 4. 自訂網域（選用）

有自己的網域的話，到 **Settings → Pages → Custom domain** 填入網域，再照 GitHub 的說明到網域商設定 DNS。

## 備註

- 動畫用 [GSAP](https://gsap.com)，從 cdnjs 載入；字型來自 Google Fonts。
- 首頁的銀河、銀河中心分解圖和 E–L<sub>z</sub> 圖都是示意用的玩具模型，不是真實資料。有自己論文裡的圖，可以換成圖片。
- 系統是深色模式時，網站會自動切換成深色。
