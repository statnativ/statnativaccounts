# StatNativ Accounts - Setup Guide

## Project Overview

This is a complete setup for the StatNativ Accounts application - a modern accounting and timesheet management system built with Next.js 15, React 19, and PostgreSQL.

## What's Been Created

### 1. Project Structure

```
StatnativAccounts/
├── SPECIFICATION.md         # Complete technical specification
├── SETUP.md                # This setup guide
├── README.md               # Project documentation
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── components.json         # Shadcn UI configuration
│
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to dashboard)
│   ├── globals.css        # Global styles with Tailwind
│   │
│   └── (dashboard)/       # Dashboard route group
│       ├── layout.tsx     # Dashboard layout with navigation
│       ├── page.tsx       # Dashboard home
│       ├── timesheets/    # Timesheet module
│       ├── invoices/      # Invoice module
│       ├── expenses/      # Expense module
│       └── distribution/  # Distribution module
│
├── components/
│   ├── ui/               # Shadcn UI components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   └── ... (more)
│   │
│   └── layout/           # Layout components
│       └── header.tsx    # Navigation header
│
├── lib/
│   ├── db/
│   │   ├── drizzle.ts    # Database connection
│   │   └── schema.ts     # Complete database schema
│   │
│   └── utils/
│       ├── utils.ts      # General utilities (cn function)
│       ├── calculations.ts   # Business logic calculations
│       ├── validation.ts     # Zod schemas
│       └── date-helpers.ts   # Date formatting utilities
│
├── types/                # TypeScript type definitions
│   ├── timesheet.ts
│   ├── invoice.ts
│   ├── expense.ts
│   └── distribution.ts
│
└── hooks/               # Custom React hooks
    └── use-toast.ts    # Toast notifications
```

### 2. Database Schema

Complete PostgreSQL schema with:
- **users** table (for future authentication)
- **timesheets** table (daily work hours tracking)
- **invoices** table (invoice generation and storage)
- **payments** table (payment tracking)
- **expenses** table (shared expense tracking)

All with proper types, constraints, and relationships.

### 3. Tech Stack Configured

✅ Next.js 15 (App Router)
✅ React 19
✅ TypeScript
✅ Tailwind CSS
✅ Shadcn/ui components
✅ Drizzle ORM
✅ Zod validation
✅ React Hook Form
✅ date-fns

### 4. UI Components Ready

- Navigation header with active states
- Dashboard layout
- Module placeholder pages (Timesheets, Invoices, Expenses, Distribution)
- Base Shadcn UI components installed

## Next Steps

### 1. Set Up Database

You have two options:

#### Option A: Vercel Postgres (Recommended for Production)

1. Go to [vercel.com](https://vercel.com)
2. Create a new project or use existing one
3. Go to Storage → Create Database → Postgres
4. Copy the connection string
5. Create `.env.local` file:

```bash
cp .env.example .env.local
```

6. Update `DATABASE_URL` in `.env.local` with your Vercel Postgres connection string

#### Option B: Local PostgreSQL (For Development)

1. Install PostgreSQL on your machine
2. Create a database:

```bash
createdb statnativ_accounts
```

3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

4. Update `DATABASE_URL` in `.env.local`:

```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/statnativ_accounts"
```

### 2. Push Database Schema

Once your database is configured, push the schema:

```bash
npm run db:push
```

This will create all tables in your database.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Explore the Application

The basic structure is ready with:
- Dashboard home page
- Navigation to all modules
- Placeholder pages for each module

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate database migrations
npm run db:generate

# Push schema to database (without migrations)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Environment Variables

Required variables in `.env.local`:

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# Authentication (Not yet implemented)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# App Config (Optional - has defaults)
DEFAULT_HOURLY_RATE=45
DEFAULT_CONVERSION_RATE=90
RESOURCES="Amit,Abhilash"
```

## Implementation Phases

The project is set up and ready for feature implementation:

### ✅ Phase 1: Project Setup (COMPLETED)
- [x] Next.js project initialized
- [x] Tailwind CSS configured
- [x] Shadcn/ui components installed
- [x] Database schema created
- [x] Basic navigation and layout
- [x] Type definitions created
- [x] Utility functions created

### 🔄 Phase 2: Timesheet Module (Next)
- [ ] Timesheet entry form
- [ ] Timesheet list view
- [ ] Calendar view
- [ ] Edit/Delete functionality
- [ ] API endpoints
- [ ] Monthly summary

### 📋 Phase 3: Invoice Module
- [ ] Invoice creation wizard
- [ ] Invoice preview
- [ ] DOC generation
- [ ] PDF generation
- [ ] Invoice list
- [ ] Download functionality

### 💰 Phase 4: Distribution Module
- [ ] Expense tracking UI
- [ ] Payment recording UI
- [ ] Distribution calculation
- [ ] Summary dashboard
- [ ] Resource breakdown views

### 🔐 Phase 5: Authentication (Optional)
- [ ] NextAuth.js setup
- [ ] Login/Logout
- [ ] Protected routes

## Architecture Decisions

### Why Next.js App Router?
- Built-in API routes (no separate backend needed)
- Server components for better performance
- File-based routing
- Optimal for Vercel deployment

### Why Drizzle ORM?
- Type-safe queries
- Better performance than Prisma
- SQL-like syntax
- Excellent migration support

### Why Shadcn/ui?
- Copy-paste components (not a package dependency)
- Full customization control
- Built on Radix UI (accessible)
- Tailwind CSS integration

## Database Management

### View Database with Drizzle Studio

```bash
npm run db:studio
```

This opens a web-based GUI at `https://local.drizzle.studio` to view and edit your database.

### Generate Migrations (When Schema Changes)

```bash
npm run db:generate
```

This creates migration files in the `drizzle/` directory.

### Apply Migrations

```bash
npm run db:migrate
```

## Deployment to Vercel

### Prerequisites
1. Push your code to GitHub
2. Create Vercel account at [vercel.com](https://vercel.com)

### Steps

1. **Import Project**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Make sure to add `DATABASE_URL` from Vercel Postgres

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect Next.js and configure build settings

4. **Post-Deployment**
   - Push database schema: Connect to your production database and run `npm run db:push`
   - Or use Vercel CLI: `vercel env pull` then `npm run db:push`

### Automatic Deployments

Once connected, every push to `main` branch will automatically deploy to production.

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct in `.env.local`
- Check if PostgreSQL is running (local setup)
- Verify network access (cloud setup)

### Type Errors

```bash
# Regenerate types
npx drizzle-kit generate
```

## Next Implementation Steps

Based on the specification, the recommended next steps are:

1. **Implement Timesheet Module** (Start here)
   - Create timesheet form component
   - Build API endpoints for CRUD operations
   - Add list and calendar views
   - Test with sample data

2. **Invoice Module**
   - Invoice creation flow
   - Document generation (DOC/PDF)
   - Preview functionality

3. **Expense & Distribution**
   - Expense tracking
   - Distribution calculations
   - Summary views

## Support

For questions or issues:
- Review [SPECIFICATION.md](SPECIFICATION.md) for detailed requirements
- Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
- Check Drizzle docs: [orm.drizzle.team](https://orm.drizzle.team)
- Check Shadcn docs: [ui.shadcn.com](https://ui.shadcn.com)

---

**Status**: ✅ Project setup complete and ready for feature implementation

**Build Status**: ✅ Production build successful

**Ready to Deploy**: Yes (after database setup)
