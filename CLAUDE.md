# CLAUDE.md — huibang

## Project Overview
Next.js 14 (App Router) + Drizzle ORM + PostgreSQL (Supabase) + Tailwind CSS
Deployed on Vercel, auto-deploys on push to `main`.
Repo: https://github.com/JasonM568/huibang.git

## Work Context Protocol — 開工 / 收工（工作脈絡系統）

專案根目錄有四個工作脈絡檔，用來跨對話保存與接軌工作脈絡：
- `handoff.md` — 交接文件（待辦、進行中、卡關、當前脈絡）。**每次覆寫**，永遠反映最新狀態。
- `memory.md` — 工作日誌。**Append 累積**，新紀錄加在最上方，不刪舊紀錄。
- `decisions.md` — 重大決策紀錄（ADR），新決策加最上方。
- `backlog.md` — 長期待辦池（不急但別忘記的事）。

### 觸發詞與動作

**當使用者輸入「開工」或「開始做」：**
1. 讀 `handoff.md`，向使用者**複述**：上次脈絡、下次優先事項、進行中、卡關點。
2. 必要時翻 `memory.md` / `decisions.md` 補上下文。
3. 直接從「下次優先事項」接續執行，不用重問之前做到哪。

**當使用者輸入「收工」或「今天先這樣」：**
1. **覆寫** `handoff.md`：更新上次收工時間、下次優先事項、進行中、卡關、當前脈絡。
2. 在 `memory.md` 最上方**新增一筆當日紀錄**（做了什麼 / 重大事件 / 備註）。
3. 若本次有重大決策 → 在 `decisions.md` 補一筆。
4. 若有「之後再說」的點子 → 丟進 `backlog.md`。
5. 完成後向使用者簡短回報「已存檔，下次輸入開工即可接軌」。

日期一律用絕對日期（從環境的 currentDate 取得）。

## Development Methodology — SDD (Spec-Driven Development)

**所有系統優化與調整都必須以 SDD（Spec-Driven Development）方式進行。**

流程：
1. **Spec 先行**：動工前先寫清楚規格——目標、變更範圍、輸入/輸出、邊界條件、驗收標準。
2. **與使用者對齊**：規格寫完先和使用者確認，確認後才開始實作。
3. **依規格實作**：實作過程嚴格依照已確認的規格，不擅自擴張範圍。
4. **依規格驗收**：完成後對照規格逐項檢查，確認所有驗收條件達成。

不得跳過 Spec 直接動手改 code。即使是小調整，也要先用一段話描述「要改什麼、為什麼、改完應該是什麼樣子」再動工。

## Key Commands
- `npm run dev` — local dev server
- `npm run build` — production build (same as Vercel)

## Deployment
- Vercel auto-deploys when `main` is pushed. **Do NOT run `npx vercel` manually.**
- **Before every `git push`, run `npm run build` locally** to catch TypeScript errors. If build fails on local `.next` cache issues (MODULE_NOT_FOUND for unrelated files), check for `Compiled successfully` — Vercel won't have cache issues.
- Load env: `export $(cat .env.local | xargs)`

## Database
- PostgreSQL on Supabase, connection string in `POSTGRES_URL` (in `.env.local`)
- ORM: Drizzle, using `postgres` package (NOT `pg`)
- Schema: `lib/db/schema.ts`
- No `psql` installed — run migrations via inline Node.js:
  ```bash
  export $(cat .env.local | xargs) && node -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.POSTGRES_URL);
  (async () => {
    await sql.unsafe('YOUR SQL HERE');
    console.log('OK');
    await sql.end();
  })();
  "
  ```
- Migration file: `drizzle/0001_add_client_number.sql` (append new statements)
- Run migration immediately after schema changes, before pushing

## Git Workflow — CRITICAL RULES

### Commit and push without asking
User expects changes to be committed and pushed automatically after code changes.

### Bracket path bug (zsh)
**NEVER use `git add 'path/[id]/file'` directly.** Zsh glob expansion causes catastrophic mass file deletions.

**Safe workflow — follow EVERY time:**
1. `git read-tree HEAD` — reset index to match HEAD cleanly
2. `git diff --stat` — verify only expected files are modified
3. `git add 'file1' 'file2'` — stage specific files
4. `git status --short | grep -v "^??"` — **MUST check for `D` entries**. If you see ANY `D` (deleted) entries, STOP and run `git read-tree HEAD` again
5. Only then `git commit` and `git push`

### If a bad commit is pushed (mass deletions)
```bash
git reset --soft HEAD~1
git reset HEAD .
git restore .
# re-apply changes, then force push
git push --force-with-lease origin main
```

## Code Conventions
- API routes: `app/api/admin/[resource]/route.ts`
- All API routes use `requireAuth()` guard
- Schema fields: camelCase in code, snake_case in DB
- `notNull()` fields must have non-null values in ALL insert paths (direct create + convert flows)
- Quote system tabs: `app/admin/quote-system/` (QuotesTab, InvoicesTab, LedgerTab, CustomersTab, ServicesTab)
- Salary system: `app/admin/salary/` (EmployeesTab, SalaryTab, StatsTab)

## Module Notes
- **Salary daily wage**: base = full month earnings / 30 (fixed). Partial month = daily wage × pay days. Logic in both frontend (new + edit pages) and backend (POST + PATCH APIs).
- **Invoice → Ledger sync**: Creating an invoice auto-creates a receivable ledger entry. Updating invoice payment status/dates syncs to ledger. Deleting invoice cascade-deletes ledger entry.
- **Client numbering**: Format `C-MMDDYY-N` (e.g. C-040726-1), auto-generated on creation.
- **Print pages**: Salary print at `salary/[id]/print` and `salary/print` (batch). Quote print at `quote-system/[id]/print`.
