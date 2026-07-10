# 🔄 工作交接（Handoff）

> 這是「下一次的入口」。每次「收工」時覆寫更新，永遠只反映**當前最新狀態**。
> 開工時先讀這份，就能無縫接軌。

---

## 📌 上次收工時間
2026-07-10

## 🎯 下次優先事項（開工就做這個）
- **驗收今天的薪資足月修正**（commit `c655f68`，Vercel 應已部署完）：
  1. 新增薪資：選 **31 天的月份**（如 7 月）、計薪日填 **30** → 應領區塊應顯示「**足月**」、金額 = 足月應領總額（不再顯示「不足月，日薪 × 30」）。
  2. 選 **二月**、計薪日填 **28**（做滿整月）→ 應顯示足月、領全額。
  3. 隨便一張真正不足月（如做 15 天）→ 仍為「日薪 × 天數」，行為不變。
  4. 進既有薪資紀錄「編輯」再存檔 → 確認 PATCH 後金額一致（後端同步改過）。
- 等 Jason 驗收回饋後再決定有無微調。

## 🚧 進行中（未完成）
- （無）今天需求已完成、commit、push。origin/main = `5c07511`。

## ⏸️ 卡關／待釐清
- **本機 build 尾端會噴 `/api/admin/edm/send` `Missing API key`（Resend）**：本地缺 `RESEND_API_KEY` env 的既有問題，與薪資改動無關，Vercel 有設 key 不受影響。（另外資料夾名含中文「官網」也會在 build 尾端造成 manifest ENOENT，`✓ Compiled successfully` + 型別檢查通過即可視為 TS 正確。）
- 工作脈絡檔納管進度：`memory.md` 今天**已納入版控**（commit `5c07511`）。`handoff.md`、`decisions.md`、`backlog.md` + `CLAUDE.md` 的改動**仍未 commit**。要不要整套一起納管，待 Jason 決定。

## 🧭 當前脈絡（一段話講清楚現在在做什麼）
今天處理一個薪資模組 bug：Jason 回報「當月計薪日 30 天會被當成不足月，得填 31 才對」。根因是日薪固定用「足月應領總額 ÷ 30」計算，但足月判斷卻拿計薪天數比對**該月實際天數**（`payDays >= monthLastDay`，28~31），所以 31 天月份填計薪 30 天時 `30 < 31` 被誤判不足月。依 SDD 先寫規格、與 Jason 對齊「二月做滿 28 天算足月」後，把 5 處同一行邏輯改為 `payDays >= Math.min(30, monthLastDay)`（大月門檻降 30、小月/二月取實際天數）。build 通過、commit `c655f68` 已 push。之後把當日紀錄寫進 `memory.md` 並一併納入版控（commit `5c07511`）。

## 📂 相關檔案／位置
- 新增薪資：`app/admin/salary/new/page.tsx`（`isFullMonth`）
- 薪資詳情/編輯：`app/admin/salary/[id]/page.tsx`（編輯 `editIsFullMonth` + 檢視 `viewIsFullMonth` 兩處）
- 建立 API：`app/api/admin/salary/route.ts`（POST）
- 更新 API：`app/api/admin/salary/[id]/route.ts`（PATCH）
- 決策：`decisions.md` D-006（足月門檻以 30 天為準）
