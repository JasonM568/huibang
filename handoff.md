# 🔄 工作交接（Handoff）

> 這是「下一次的入口」。每次「收工」時覆寫更新，永遠只反映**當前最新狀態**。
> 開工時先讀這份，就能無縫接軌。

---

## 📌 上次收工時間
2026-08-08

## 🎯 下次優先事項（開工就做這個）
- **ERP 模組移植 — 階段 A**：Schema（Drizzle + migration 執行）+ 商品/分類/規格/倉庫 CRUD。
  - **唯一規格來源：[`SPEC-erp-module.md`](./SPEC-erp-module.md)**（2026-08-08 已與 Jason 對齊確認），動工前先讀完整份。
  - 階段進度表（收工時更新狀態）：

    | 階段 | 內容 | 狀態 |
    |---|---|---|
    | A | Schema + migration + 商品/分類/規格/倉庫 CRUD | ✅ 完成（commit `c420b2b`，2026-08-08） |
    | B | 入庫/分倉/批號 + 庫存查詢 + 調撥 + 效期 | ✅ 完成（commit `de1ea69`，2026-08-08，API smoke test 通過） |
    | C | ERP 客戶 + 銷售訂單（三階帶價/批號/expand 列表） | ✅ 完成（commit `a464f3c`，2026-08-08） |
    | D | 出貨（分批/扣庫存/簽收/列印）+ sidebar + build 驗證 | ✅ 完成（2026-08-08，E2E 煙霧測試 24 項全過：分批出貨/庫存批次扣帳/超量擋/簽收；測試資料已清） |

  - 階段 A 動工的第一個 commit 記得把 `SPEC-erp-module.md` 一起納入版控。
- （次要，等 Jason 回報）**薪資足月修正驗收**（commit `c655f68`）：31 天月填計薪 30 → 應顯示「足月」領全額；二月填 28 → 足月；真不足月（如 15 天）→ 日薪 × 天數不變；既有紀錄編輯再存 → PATCH 後金額一致。

## 🚧 進行中（未完成）
- ERP 模組移植 A~D 四階段**全部完成**。待 Jason 於後台實際驗收（sidebar 三個入口：ERP 進銷存/銷售訂單/出貨單；權限 = admin 或 acc/chief）。

## ⏸️ 卡關／待釐清
- **本機 build 尾端會噴 `/api/admin/edm/send` `Missing API key`（Resend）**：本地缺 `RESEND_API_KEY` env 的既有問題，Vercel 有設 key 不受影響。（另外資料夾名含中文「官網」會在 build 尾端造成 manifest ENOENT，`✓ Compiled successfully` + 型別檢查通過即可視為 TS 正確。）
- 工作脈絡檔納管進度：`memory.md` 已納入版控（commit `5c07511`）。`handoff.md`、`decisions.md`、`backlog.md` + `CLAUDE.md` 的改動**仍未 commit**，要不要整套納管待 Jason 決定。

## 🧭 當前脈絡（一段話講清楚現在在做什麼）
Jason 決定把獨立的 erp-system 專案（`/Users/jasonmchen/erp-system`，v0.7.0，線上 hbppp01.vercel.app）中官網缺少的模組移植進 huibang 後台，成為 `/admin/erp` 模組：商品管理（三階價格/多維規格/批號效期）、倉庫、進銷存（入庫/分倉/調撥/效期警示）、銷售訂單（依客戶類型自動帶價）、出貨單（分批出貨/扣庫存/簽收/列印）。兩邊技術棧不相容（Next 16+Supabase RLS vs Next 14+Drizzle+自建 auth），所以是**重寫不是複製**。已對齊的三個範圍決策：(1) 只移植官網缺的模組，報價/請款/客戶/薪資沿用官網現有的不動；(2) 新表全加 `erp_` 前綴避免與現有 `customers`/`invoices` 等同名衝突；(3) ERP 客戶獨立一張 `erp_customers`，不與官網 customers 打通。完整規格（表清單/頁面結構/API 路由/商業邏輯/階段驗收）都在 `SPEC-erp-module.md`。ERP 舊站照常運作、既有資料不遷移。多 session 接力：每次開工讀本檔接續當前階段，收工更新階段進度表。

## 📂 相關檔案／位置
- 規格書：`SPEC-erp-module.md`（本次任務唯一規格來源）
- 來源專案：`/Users/jasonmchen/erp-system`（參照其 `supabase/migrations/*.sql` 與 `app/src/app/(dashboard)/inventory|sales-orders` 原始碼；只參照不修改）
- 目標 schema：`lib/db/schema.ts`；migration 附加到 `drizzle/0001_add_client_number.sql` 後立即執行（跑法見 CLAUDE.md「Database」節）
- 新頁面：`app/admin/erp/`（比照 `app/admin/quote-system/` 的 tab + 全頁面寫法）
- 新 API：`app/api/admin/erp/`（全部 `requireAuth()`）
- （上次任務）薪資足月：`app/admin/salary/new/page.tsx`、`app/admin/salary/[id]/page.tsx`、`app/api/admin/salary/route.ts`、`app/api/admin/salary/[id]/route.ts`、decisions.md D-006
