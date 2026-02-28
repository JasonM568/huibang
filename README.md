# 惠邦行銷官網 + 品牌問卷系統

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) + Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Vercel Postgres + Drizzle ORM
- **Email**: Resend
- **AI**: Claude API (Anthropic)
- **Deploy**: Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/huibang-website.git
cd huibang-website
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
# Fill in your API keys
```

### 3. Database Setup

In Vercel Dashboard:
1. Go to your project → Storage → Create Database → Postgres
2. Choose Singapore region
3. Environment variables will be auto-populated

Then push the schema:

```bash
npm run db:push
```

### 4. Seed Admin User

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npx tsx scripts/seed.ts
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (website)/          # 官網前台
├── questionnaire/      # 品牌問卷
├── result/[id]/        # 分析結果頁
├── admin/              # 管理後台
└── api/                # API Routes
components/             # UI Components
lib/
├── db/                 # Database (Drizzle)
├── email.ts            # Resend
├── analyze.ts          # Claude API
└── auth.ts             # JWT Auth
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/questionnaire` | Submit questionnaire |
| GET | `/api/questionnaire/[id]` | Get result |
| GET | `/api/admin/submissions` | List submissions (auth) |
| POST | `/api/admin/export` | Export CSV (auth) |
| POST | `/api/auth/login` | Admin login |
