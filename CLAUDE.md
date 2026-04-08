# CLAUDE.md — huibang

## Project Overview
Next.js 14 (App Router) + Drizzle ORM + PostgreSQL (Supabase) + Tailwind CSS
Deployed on Vercel, auto-deploys on push to `main`.
Repo: https://github.com/JasonM568/huibang.git

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
