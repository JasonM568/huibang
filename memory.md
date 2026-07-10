# 🧠 工作日誌（Memory Log）

> Append-only 時間軸。每次「收工」在最上方新增一筆當日紀錄。
> 不刪舊紀錄——這是專案的長期記憶，記錄做了什麼、發生什麼、為什麼。

---

## 2026-07-10

### 做了什麼（依 SDD 先寫規格、與 Jason 對齊一題才動工）
- **修正薪資「足月」判斷 bug**（commit `c655f68`）：Jason 回報「當月計薪日 30 天會被當成不足月，要填 31 才對」。
- **根因**：日薪固定用「足月應領總額 ÷ 30」計算，但足月判斷卻拿計薪天數比對**該月實際天數**（`payDays >= monthLastDay`，28~31）。所以 31 天月份填計薪 30 天時 `30 < 31` 被誤判為不足月。
- **修正**：改為 `payDays >= Math.min(30, monthLastDay)`——大月門檻降為 30、小月/二月仍取實際天數（二月做滿 28 天算足月，已與 Jason 對齊確認）。
- **變更範圍 5 處同一行邏輯**：`salary/new/page.tsx`、`salary/[id]/page.tsx`（編輯+檢視兩處）、`api/admin/salary/route.ts`（POST）、`api/admin/salary/[id]/route.ts`（PATCH）。
- `npm run build` → `✓ Compiled successfully`、TS 無誤。

### 備註
- build 尾端 `/api/admin/edm/send` 噴 `Missing API key`（Resend）是本地缺 `RESEND_API_KEY` env 的既有問題，與本次無關，Vercel 有設 key 不受影響。

---

## 2026-06-22

### 🔴 重大事件：發現並修復 `228c27a` 全刪除災難（詳見 decisions D-005）
- **開工檢查 git 時發現 HEAD tree = 0 檔案**。上個 session 最後的 commit `228c27a`（"公司資訊改 no-store"）因 zsh 中括號 glob 把整個 repo 184 檔刪光，**還 push 到了 GitHub origin/main**。工作目錄檔案全在（只是未追蹤），no-store 的真實改動也還在。
- **復原**：`reset --soft` 回最後健康 `7d81ac2` → 重做乾淨 commit `361f771`（tree 185 檔）→ `force-with-lease` 推上去取代壞 commit（Jason 自己用 `!` 跑，classifier 會擋 Claude 直接 force-push main）。
- **過程第二坑**：`.git/refs/remotes/origin/main 2`（macOS 重複檔）讓 fetch 報 "bad object"、卡住 force-with-lease → `rm` 掉壞檔重 fetch 才推得動。
- **教訓**：開工先核對 `git ls-tree -r HEAD --name-only | wc -l`；fetch 報 bad object 先查 `.git/refs/remotes/origin/` 帶空白的重複檔。

### 做了什麼（依 SDD 先寫規格、與 Jason 對齊兩題才動工）
- **需求脈絡**：目前請款流程是「報價單→輸出 PDF→傳 LINE/email→客戶確認→會計轉請款單」。痛點：(1) 報價單 PDF 沒有公司匯款資訊；(2) 請款單模組沒有列印輸出按鈕（報價單有）。
- **功能 1：報價單列印頁自動套入兆豐銀行匯款資訊**（`quote-system/[id]/print/page.tsx`）：擴充 `CompanyInfo` interface 加 bank_* 欄、在備註與簽章區之間新增「匯款資訊」區塊（銀行/分行/代碼、戶名、帳號），資料沿用 `/api/admin/company`，僅有填銀行資料才顯示。**對齊決策：只在列印頁顯示，螢幕詳情頁不動。**
- **功能 2：請款單列印輸出**：新建 `quote-system/invoice/[id]/print/page.tsx`，版型完全比照報價單列印頁（A4、抬頭、客戶資訊、項目表、小計/稅額/總計、簽章區），標題「請 款 單」，含請款單號/報價單號/期別徽章 + 匯款資訊區塊；**對齊決策：保留大小章/簽名/發票章三個列印勾選選項（完全比照報價單）**。請款單詳情頁右上角（刪除鈕旁）新增綠色「列印 / 輸出 PDF」按鈕，`window.open` 開列印頁。
- 同 commit 一併保住 `228c27a` 原本的 no-store 修復（CompanySettingsTab + 請款單詳情頁讀 company 帶 no-store）。
- `npm run build` → `Compiled successfully`、無型別錯誤。最終 commit `361f771`。

### 備註
- 本機 build/dev 仍因資料夾名含中文「官網」會在尾端噴 manifest ENOENT，但 `Compiled successfully` + 型別檢查通過即可視為 TS 正確（Vercel 乾淨環境正常）。
- 尚待 Jason 驗收：Vercel 部署完後，後台開請款單點「列印/輸出 PDF」確認版型/匯款/分期期別正確；報價單列印頁確認底部出現匯款資訊。

---

## 2026-06-19

### 做了什麼（報價→請款模組大改，依 SDD 先寫規格與 Jason 對齊四題才動工）
- **公司匯款資訊**（commit `05c3a73` 起）：`company_info` 新增 5 欄（bank_name/branch/code/account_name/account_number）；報價系統新增「**公司設定**」tab 可編輯公司基本資料＋匯款資訊（補上原本只能靠 script 改的缺口）；請款單詳情頁右側欄顯示「匯款資訊」卡（有銀行或帳號才顯示）。Jason 已填入兆豐國際商業銀行/鳳山分行/017/帳號。
- **分期請款 →「分階段請款」模型**（commit `495e002`、`7d81ac2`）：一張報價單可分多次、每次依百分比開「第N期」請款單；每張各自建立應收帳款、可獨立追蹤、以單行「第N期款項」呈現。**不強制一次湊滿 100%**：後端依「已請款比例」累計，補足 100% 那期吸收四捨五入尾差，期別序號跨次累加（`-P1/-P2…`）。轉請款 Modal 改「全額／分期」切換。`invoices` 加 `installment_no/label/percent`；`invoice_number` 放寬 `varchar(40)`。
- **報價單狀態 `partial`（分期請款中）**（commit `7d81ac2`）：轉換累計 <100%→partial、=100%→invoiced；刪請款單依剩餘比例回推 invoiced/partial/sent。詳情頁新增「分期請款明細」卡（已送請款 %/$、待請款 %/$、各期清單可點）；QuotesTab 狀態表與篩選加「分期請款中」；編輯頁擋 partial（有請款單不可改報價內容）。
- **刪請款單解鎖報價單**（commit `95111a4`）：刪到累計 <100% 自動把報價單從鎖定狀態解開回可編輯（連動 ledger 仍由 FK cascade 刪）。
- **公司資訊讀取改 `no-store`**（commit `228c27a`）：請款單詳情頁/公司設定頁讀 `/api/admin/company` 帶 no-store，存好匯款資訊後立即顯示、不被瀏覽器快取空值擋住。
- **資料回填**：BML→partial(40%)；一張全額轉換但狀態漏更新的→invoiced。

### 重大事件 / 根因
- Jason 回報「分期根本做假的」根因：原本以「**列數 > 1**」判定分期，單列「第一期 40%」被當成全額轉換、忽略期別與百分比 → 改成分階段模型（見 decisions **D-004**）。
- 「轉分期後報價單仍草稿」根因：部分轉換沒更新狀態 → 新增 `partial` 狀態並回填既有資料。
- 「無法複製」「匯款沒顯示」最終都查清是**本機環境問題 + 快取**，線上正常：複製路由用真實 Drizzle 路徑測會成功；匯款是讀到快取空值（已加 no-store）。Vercel 最新部署狀態 READY 已確認。
- 一度發現 git index 出現中括號路徑「假刪除」（CLAUDE.md 警告的風險），立即 `git read-tree HEAD` 重設、確認檔案完整、無誤提交。

### 備註
- **本機 build/dev 因資料夾名含中文「官網」會壞**（pages-manifest/_document/middleware-manifest 的 ENOENT），無法本機跑 dev 測 API；改用「tsx 跑真實 Drizzle 路徑腳本 + 直接查 DB + 查 Vercel 部署」驗證。型別檢查（`Linting and checking validity of types`）仍會先通過，可當作 TS 正確的訊號。
- 測試殘留資料（報價單 WKJ/4EY + 對應請款單）Jason 說自己在後台清。

---

## 2026-06-15

### 做了什麼
- **報價項次各自折扣**（commit `b9af67c`）：依 SDD 先寫規格、與 Jason 對齊（兩題選擇：每項次各自折扣 + 小計折後並保留折扣列當資訊），確認後實作。
  - Schema：`quote_items` 新增 `discount numeric(5,2) default 0`（migration 已執行並附加到 `drizzle/0001_add_client_number.sql`）。
  - 計算：項次 `amount` = `round(單價 × 數量 × (1 − 折扣%))`（折後）；`quotes.subtotal` 改存折後小計（未稅），稅額與總計以折後為準；整單 `quotes.discount` 停用但保留欄位。
  - 前端：新增/編輯頁每列加「折扣%」欄、移除整單折扣輸入框、小計即時顯示折後；詳細/列印頁項次表加折扣欄、總計區「小計」顯示折前、「折扣」列保留為資訊（列印頁僅在有折扣時顯示該欄）。
  - 複製路由帶上項次 `discount`。
- **新增/編輯報價單項目列表加欄位標題**（commit `7412fbf`）：報價項目輸入區原本只靠 placeholder、加了折扣欄後欄位變窄難辨識（Jason 回報「編輯報價單看不到表頭」）。在輸入列上方加一排對齊的欄位標題（項目／規格／單價／數量／折扣／小計），手機版單欄堆疊時隱藏；新增頁與編輯頁皆加。

### 重大事件
- 設計關鍵：把 `quotes.subtotal` 定義為「折後小計」，使請款單（沿用報價品項與此 subtotal、顯示「小計＋稅額＝總計」無折扣列）自動保持一致，**完全不需動到請款模組程式碼**（見 decisions D-003）。

### 備註
- 既有資料零影響：只新增欄位（預設 0），不回頭重算；既有報價單只有被「手動編輯」時才依新邏輯重算。已轉請款單未被觸碰，只有未來新轉換走新邏輯。
- 唯一一張「用舊整單折扣建立的測試報價單」折扣顯示會跑掉（未做資料遷移，Jason 確認是測試資料）。要修就編輯頁把折扣填到項次後存檔，或刪掉重建。
- build 結尾仍會出現 `pages-manifest.json` ENOENT（已知本機 .next 快取問題），但 `✓ Compiled successfully` 且型別檢查通過，Vercel 不受影響。

---

## 2026-06-09

### 做了什麼
- **Git 修復**：清掉本機 index 失同步的 201 筆假刪除（`git read-tree HEAD`），確認 main 與 GitHub `origin/main` 同步（起點 commit `9f7ba92`）。
- **工作脈絡系統**：建立 `handoff.md`、`memory.md`、`decisions.md`、`backlog.md`，並在 `CLAUDE.md` 寫入「收工 / 開工」協定（關鍵字觸發）。（此系統本身尚未 commit）
- **薪資複製功能**（commit `7a642d2`）：新增 `POST /api/admin/salary/[id]/duplicate`，複製整筆薪資含子項目到下個月、跨年進位、同員工同月已存在則擋下；SalaryTab 每列加「複製」按鈕。
- **薪資列印頁三項調整**（同 `7a642d2`）：移除寫死的「常年會費」應扣列；「其他扣款」帶入 `otherDeductionNote` 說明；批次列印頁最後一頁右側（公司留抵側）顯示當月薪資總金額。
- **薪資批次複製**（commit `68af191`）：SalaryTab 姓名欄前加勾選格（含全選），工具列「批次複製 (N)」逐筆複製到下個月、彈出成功/跳過摘要。
- **收支表可勾選月份**（commit `d22ba4e`）：LedgerTab 依出入帳日期分月、無日期歸「未分類」，多選 chip 篩選，統計卡片與表格連動，純前端。
- **報價單轉請款自動改狀態**（commit `f498447`）：invoice POST 伺服器端直接把來源報價單 status 設為 `invoiced`；QuotesTab 狀態表與篩選新增「轉請款單」。

### 重大事件
- 發現報價單轉請款後狀態停留草稿的根因：原本靠前端額外 PATCH 且不檢查成敗 → 改為後端唯一入口更新（見 decisions D-002）。
- 修掉一次 zsh 中括號 glob 造成的 index 假刪除狀況。

### 備註
- 今天的修正只對之後的轉換生效，舊的 draft 報價單未回補。
- 未追蹤檔案：`public/` 圖片、`scripts/` migration 腳本，仍未決定是否納入版控。
- build 在本機結尾會出現 `pages-manifest.json` ENOENT（已知本機 .next 快取問題），但 `✓ Compiled successfully` 且型別檢查通過，Vercel 不受影響。

---

<!-- 新紀錄請加在這條線「上方」、最新標題的位置 -->
