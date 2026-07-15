# TrackMyJob

Track your job applications without the spreadsheet — an Excel-like grid, a
dashboard with pipeline stats, and AI auto-extraction from a pasted job link.

## Stack

Next.js (App Router) + TypeScript, Prisma + PostgreSQL, Auth.js (Credentials),
TanStack Table, Recharts, and the Claude API for auto-extraction.

## Setup

1. **Install dependencies** (already done if you're reading this after the initial build):

   ```bash
   npm install
   ```

2. **Database** — create a free Postgres project at [neon.com](https://neon.com)
   (or any Postgres host) and copy the connection string into `.env` as
   `DATABASE_URL`.

3. **Auth secret** — already generated in `.env`. To regenerate:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Anthropic API key** (optional, for auto-extract) — get one at
   [console.anthropic.com](https://console.anthropic.com) and add it to `.env`
   as `ANTHROPIC_API_KEY`. Without it, everything works except pasting a job
   link to auto-fill — you'll see a clear error and can still add jobs manually.

5. **Run the first migration** against your database:

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the dev server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll land on the
   login page. Click "Sign up" to create an account.

## Project structure

- `prisma/schema.prisma` — data model (`User`, `Application`)
- `src/app/(auth)` — login/signup pages
- `src/app/(app)` — the authenticated app shell, `/applications` grid and `/dashboard`
- `src/actions/` — server actions (CRUD, auth, extraction)
- `src/lib/extract-job.ts` — fetches a job posting URL and asks Claude to extract structured fields
- `src/components/` — UI, including `applications-table.tsx` (the spreadsheet grid) and `dashboard/` (charts)

## Useful commands

```bash
npm run dev            # start dev server
npm run build           # production build + type check
npx prisma studio        # browse your database in a GUI
npx prisma migrate dev   # apply schema changes after editing schema.prisma
```
