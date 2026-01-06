# StatNativ Accounts

A modern accounting and timesheet management system for consulting organizations.

## Features

- **Timesheet Management**: Track daily work hours for each resource
- **Invoice Generation**: Generate invoices in DOC and PDF formats
- **Revenue Distribution**: Calculate revenue distribution based on hours worked and shared expenses
- **Expense Tracking**: Track shared expenses and calculate reimbursements

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19
- **UI**: Shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Document Generation**: docx, @react-pdf/renderer
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL and other configuration.

3. Generate and run database migrations:

```bash
npm run db:generate
npm run db:push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Setup

### Using Vercel Postgres

1. Create a Vercel Postgres database in your Vercel dashboard
2. Copy the connection string to your `.env.local` file
3. Run migrations: `npm run db:push`

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb statnativ_accounts`
3. Update `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:push`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── timesheets/       # Timesheet components
│   ├── invoices/         # Invoice components
│   └── layout/           # Layout components
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   └── utils/            # Utility functions
├── types/                # TypeScript types
└── drizzle/              # Database migrations
```

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

The app will automatically deploy on every push to the main branch.

## Environment Variables

See `.env.example` for required environment variables.

## License

Private - for internal use only.
