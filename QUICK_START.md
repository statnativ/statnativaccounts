# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Dependencies (if not done)

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL:

**Option A: Use Vercel Postgres (Recommended)**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Create a Postgres database
- Copy connection string to `.env.local`

**Option B: Use Local PostgreSQL**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/statnativ_accounts"
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What You'll See

- ✅ Dashboard with 4 modules
- ✅ Navigation header
- ✅ Placeholder pages for Timesheets, Invoices, Expenses, Distribution

## Next Steps

### Ready to Build Features?

Start with the Timesheet module:

```bash
# The files you'll work on:
app/(dashboard)/timesheets/page.tsx       # Main page
app/api/timesheets/route.ts               # API endpoints (create this)
components/timesheets/timesheet-form.tsx  # Form component (create this)
```

### Need Database GUI?

```bash
npm run db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:studio    # Open database GUI
npm run lint         # Run linter
```

## Project Structure

```
app/
  (dashboard)/       ← Your module pages
    timesheets/
    invoices/
    expenses/
    distribution/
  api/              ← API routes (create endpoints here)

components/
  ui/               ← Shadcn components (ready to use)
  layout/           ← Navigation, etc.

lib/
  db/              ← Database setup
  utils/           ← Helper functions

types/             ← TypeScript types
```

## Key Files

- [SPECIFICATION.md](SPECIFICATION.md) - Complete technical spec
- [SETUP.md](SETUP.md) - Detailed setup guide
- [README.md](README.md) - Project documentation

## Deploy to Vercel

When ready:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Then import in Vercel dashboard
# vercel.com/new
```

---

**Status**: Ready for development! 🚀
