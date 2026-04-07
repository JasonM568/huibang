# CLAUDE.md — huibang

## Project Overview
Next.js 14 (App Router) + Drizzle ORM + PostgreSQL (Supabase) + Tailwind CSS
Deployed on Vercel, auto-deploys on push to `main`.

## Key Commands
- `npm run dev` — local dev server
- `npm run build` — production build (same as Vercel)

## Deployment Rules
- Vercel auto-deploys when `main` is pushed. **Do NOT run `npx vercel` manually.**
- **Before every `git push`, run `npm run build` locally** to catch TypeScript/build errors. If the build fails, fix the errors before pushing.
- Environment variables are in `.env.local` — load with `source .env.local` or `export $(cat .env.local | xargs)` when running build locally.

## Database
- PostgreSQL on Supabase, connection string in `POSTGRES_URL`
- ORM: Drizzle (`postgres` package, not `pg`)
- Schema: `lib/db/schema.ts`
- Migrations: `drizzle/` directory, run via Node.js script (`scripts/run-migration.mjs`)
- No `psql` installed locally — use `node scripts/run-migration.mjs` to execute SQL migrations

## Git Workflow
- Commit and push without asking for confirmation
- Commit messages in English, concise
- Always build-check before push

## Code Conventions
- API routes: `app/api/admin/[resource]/route.ts`
- All API routes use `requireAuth()` guard
- Schema fields use camelCase in code, snake_case in DB
- `notNull()` fields in schema must have non-null values in all insert paths (direct create + convert flows)
