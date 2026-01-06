# StatNativ Accounts - Technical Specification

## Executive Summary
A lightweight accounting system for a 2-person consulting organization to manage timesheets, generate invoices, and calculate revenue distribution based on billable hours and shared expenses.

---

## 1. Business Requirements

### 1.1 Organization Structure
- **Type**: Consulting Organization
- **Resources**: 2 consultants (Amit & Abhilash)
- **Billing Model**: Individual hourly billing to clients
- **Payment**: Client pays in USD, received after bank charges
- **Revenue Sharing**: Based on hours worked, adjusted for shared expenses

### 1.2 Core Use Cases

#### UC-1: Timesheet Management
- Record daily work hours for each resource
- Monthly timesheet tracking
- Associate hours with client/project
- Edit and update timesheet entries

#### UC-2: Invoice Generation
- Generate invoice from timesheet data
- Export invoice as DOC format
- Download invoice as PDF
- Manual sending (no automation required)

#### UC-3: Revenue Distribution
- Calculate individual earnings based on hours worked
- Track shared expenses (out-of-pocket)
- Calculate liability distribution (equal split)
- Compute final withdrawal amount per resource

---

## 2. Functional Requirements

### 2.1 Module 1: Timesheet Management

#### Features
- **Timesheet Entry**
  - Date selector (calendar view)
  - Resource selector (Amit/Abhilash)
  - Hours worked (decimal input, e.g., 7.5)
  - Project/Client dropdown
  - Description/Notes (optional)

- **Timesheet View**
  - Monthly calendar view
  - List view with filters (by resource, month, project)
  - Summary statistics (total hours per resource)
  - Edit/Delete capabilities

#### Business Rules
- Hours must be between 0-24 per day
- Can enter partial hours (e.g., 0.5, 7.5)
- Historical data should be editable
- Monthly rollup calculations

#### Data Model
```
Timesheet Entry {
  id: string (UUID)
  date: date
  resourceName: enum ["Amit", "Abhilash"]
  hoursWorked: decimal
  hourlyRate: decimal (default 45 USD)
  projectName: string
  clientName: string
  description: string (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 2.2 Module 2: Invoice Generation

#### Features
- **Invoice Creation**
  - Select month/period for billing
  - Select resource(s) to include
  - Auto-calculate totals from timesheet
  - Preview invoice before generation

- **Invoice Details**
  - Invoice number (auto-generated: FY{YY}-{MM}-{XXXX})
  - Invoice date
  - Client information (configurable)
  - Line items from timesheet
    - Date/Description
    - Hours worked
    - Rate per hour
    - Amount (USD)
  - Subtotal
  - Currency conversion (USD to INR)
  - Total in both currencies

- **Export Options**
  - Generate DOC format (editable)
  - Download as PDF

#### Business Rules
- Invoice number format: `Invoice_{ResourceName}_FY{YY}-{YY}-{XXXX}`
  - Example: `Invoice_Abhilash_FY25-26-1002`
- Invoice date defaults to last day of billing period
- One invoice can include multiple resources or single resource
- Currency conversion rate should be configurable per invoice
- Generated invoices should be stored for reference

#### Data Model
```
Invoice {
  id: string (UUID)
  invoiceNumber: string (unique)
  invoiceDate: date
  billingPeriodStart: date
  billingPeriodEnd: date
  clientName: string
  clientAddress: string
  resources: array<string>
  lineItems: array<InvoiceLineItem>
  subtotalUSD: decimal
  conversionRate: decimal (default 90 INR/USD)
  totalINR: decimal
  status: enum ["Draft", "Generated", "Paid"]
  paidDate: date (optional)
  createdAt: timestamp
}

InvoiceLineItem {
  date: date
  resourceName: string
  description: string
  hoursWorked: decimal
  ratePerHour: decimal
  amountUSD: decimal
}
```

---

### 2.3 Module 3: Revenue Distribution

#### Features
- **Income Tracking**
  - Record payment received from client
  - USD amount received
  - Bank charges deducted
  - Actual USD received
  - Conversion rate applied
  - Total INR received
  - Payment date
  - Link to invoice(s)

- **Expense Tracking**
  - Record shared expenses
  - Expense description
  - Amount (INR)
  - Date
  - Paid by (Amit/Abhilash)
  - Category (optional)

- **Distribution Calculation**
  - Calculate gross earnings per resource (hours × rate)
  - Calculate equal liability per resource (total expenses / 2)
  - Calculate net withdrawal amount
  - Display breakdown for each resource

#### Business Rules
- Expenses are split equally regardless of who paid
- Each resource has liability = Total Expenses / 2
- Withdrawal calculation:
  ```
  Individual Gross Earnings (INR) = Hours × Rate × Conversion Rate
  Individual Liability (INR) = Total Expenses / 2
  Net Withdrawal (INR) = Gross Earnings - Individual Liability
  ```
- If Resource A paid more expenses than liability, Resource B owes the difference
- Track expense reimbursements between resources

#### Calculation Example
```
Amit: 50 hours @ $45/hr = $2,250 (₹202,500 @ ₹90/$)
Abhi: 40 hours @ $45/hr = $1,800 (₹162,000 @ ₹90/$)
Total Revenue: $4,050 (₹364,500)

Expenses:
- Amit paid: ₹3,000 (website)
- Abhi paid: ₹4,000 (stamps)
Total Expenses: ₹7,000

Individual Liability: ₹7,000 / 2 = ₹3,500 each

Amit:
  Gross: ₹202,500
  Liability: ₹3,500
  Paid Out: ₹3,000
  Net Withdrawal: ₹202,500 - ₹3,500 = ₹199,000
  Reimbursement needed: ₹3,500 - ₹3,000 = ₹500 from Abhi

Abhi:
  Gross: ₹162,000
  Liability: ₹3,500
  Paid Out: ₹4,000
  Net Withdrawal: ₹162,000 - ₹3,500 = ₹158,500
  Reimbursement owed: ₹500 to Amit
```

#### Data Model
```
Payment {
  id: string (UUID)
  invoiceId: string (FK)
  paymentDate: date
  amountUSDInvoiced: decimal
  bankChargesUSD: decimal
  amountUSDReceived: decimal
  conversionRate: decimal
  amountINRReceived: decimal
  notes: string (optional)
  createdAt: timestamp
}

Expense {
  id: string (UUID)
  date: date
  description: string
  amountINR: decimal
  paidBy: enum ["Amit", "Abhilash"]
  category: string (optional)
  isReimbursed: boolean (default false)
  createdAt: timestamp
}

DistributionCalculation {
  periodStart: date
  periodEnd: date
  resources: array<ResourceDistribution>
  totalExpensesINR: decimal
  calculatedAt: timestamp
}

ResourceDistribution {
  resourceName: string
  totalHours: decimal
  hourlyRateUSD: decimal
  grossEarningsUSD: decimal
  grossEarningsINR: decimal
  expensesPaid: decimal
  expenseLiability: decimal
  netWithdrawal: decimal
  reimbursementAmount: decimal (+ to receive, - to pay)
}
```

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Page load time < 2 seconds
- Invoice generation < 5 seconds
- Support up to 10,000 timesheet entries
- PDF generation < 10 seconds

### 3.2 Security
- Authentication required (simple email/password)
- Session management
- Data encrypted at rest (managed by Vercel/DB)
- HTTPS only
- Environment variables for sensitive config

### 3.3 Usability
- Mobile responsive design
- Intuitive navigation
- Minimal clicks to complete tasks
- Clear error messages
- Data validation on client and server

### 3.4 Deployment
- Deploy on Vercel (serverless)
- Zero-downtime deployments
- Environment-based configuration
- Automated builds from Git

---

## 4. Technical Architecture

### 4.1 Recommended Tech Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
  - Rationale: Built-in API routes, SSR/SSG, optimal Vercel deployment, React-based
- **UI Library**: Shadcn/ui + Tailwind CSS
  - Rationale: Modern, customizable components, excellent DX
- **State Management**: React Context + Server Components
  - Rationale: Simple state needs, leverage server components
- **Form Handling**: React Hook Form + Zod
  - Rationale: Type-safe validation, great performance
- **Date Handling**: date-fns
  - Rationale: Lightweight, tree-shakeable

#### Backend
- **API**: Next.js API Routes (App Router)
  - Rationale: Integrated with frontend, serverless-ready
- **Database**: PostgreSQL (Vercel Postgres or Supabase)
  - Rationale: ACID compliance, relational data, JSON support
- **ORM**: Drizzle ORM or Prisma
  - Rationale: Type-safe, excellent DX, migration support
- **Authentication**: NextAuth.js v5
  - Rationale: Integrated, secure, customizable

#### Document Generation
- **DOC Export**: docx (npm package)
  - Rationale: Programmatic DOCX generation, template support
- **PDF Export**: @react-pdf/renderer or Puppeteer
  - Rationale: React components to PDF, styling support

#### Infrastructure
- **Hosting**: Vercel
  - Rationale: Native Next.js support, edge functions, auto-scaling
- **Database**: Vercel Postgres or Supabase (PostgreSQL)
  - Rationale: Managed, scalable, backup/restore
- **File Storage**: Vercel Blob or AWS S3
  - Rationale: Store generated invoices

### 4.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │         Next.js App (React Components)        │  │
│  │  - Timesheet UI                               │  │
│  │  - Invoice UI                                 │  │
│  │  - Distribution UI                            │  │
│  │  - Shadcn/ui + Tailwind                       │  │
│  └───────────────────┬───────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL (Edge Network)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │         Next.js API Routes                    │  │
│  │  /api/timesheets                              │  │
│  │  /api/invoices                                │  │
│  │  /api/expenses                                │  │
│  │  /api/payments                                │  │
│  │  /api/distribution                            │  │
│  └───────────────────┬───────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              DATABASE LAYER                          │
│  ┌───────────────────────────────────────────────┐  │
│  │    PostgreSQL (Vercel Postgres/Supabase)      │  │
│  │  - timesheets                                 │  │
│  │  - invoices                                   │  │
│  │  - expenses                                   │  │
│  │  - payments                                   │  │
│  │  - users                                      │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           EXTERNAL SERVICES                          │
│  - NextAuth.js (Authentication)                      │
│  - Vercel Blob (Invoice Storage)                     │
│  - docx (DOC generation)                             │
│  - @react-pdf/renderer (PDF generation)              │
└─────────────────────────────────────────────────────┘
```

### 4.3 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timesheets table
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  resource_name VARCHAR(100) NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  hourly_rate DECIMAL(10,2) DEFAULT 45.00,
  project_name VARCHAR(255),
  client_name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, resource_name)
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_address TEXT,
  resources JSONB NOT NULL,
  line_items JSONB NOT NULL,
  subtotal_usd DECIMAL(12,2) NOT NULL,
  conversion_rate DECIMAL(10,4) DEFAULT 90.0000,
  total_inr DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  paid_date DATE,
  doc_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_usd_invoiced DECIMAL(12,2) NOT NULL,
  bank_charges_usd DECIMAL(12,2) DEFAULT 0,
  amount_usd_received DECIMAL(12,2) NOT NULL,
  conversion_rate DECIMAL(10,4) NOT NULL,
  amount_inr_received DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_inr DECIMAL(12,2) NOT NULL,
  paid_by VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  is_reimbursed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_resource ON timesheets(resource_name);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
```

---

## 5. Application Structure

### 5.1 Directory Structure

```
statnativ-accounts/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── timesheets/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── distribution/
│   │   │   └── page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── timesheets/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── invoices/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── generate-doc/
│   │   │   │   └── route.ts
│   │   │   └── generate-pdf/
│   │   │       └── route.ts
│   │   ├── expenses/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── payments/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── distribution/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (Shadcn components)
│   ├── timesheets/
│   │   ├── timesheet-form.tsx
│   │   ├── timesheet-list.tsx
│   │   └── timesheet-calendar.tsx
│   ├── invoices/
│   │   ├── invoice-form.tsx
│   │   ├── invoice-preview.tsx
│   │   └── invoice-list.tsx
│   ├── distribution/
│   │   ├── distribution-summary.tsx
│   │   └── resource-breakdown.tsx
│   ├── expenses/
│   │   └── expense-form.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── navigation.tsx
├── lib/
│   ├── db/
│   │   ├── drizzle.ts
│   │   └── schema.ts
│   ├── auth/
│   │   └── auth.config.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── date-helpers.ts
│   │   └── validation.ts
│   └── invoice-generator/
│       ├── doc-generator.ts
│       └── pdf-generator.ts
├── types/
│   ├── timesheet.ts
│   ├── invoice.ts
│   ├── expense.ts
│   └── distribution.ts
├── drizzle/
│   └── migrations/
├── public/
├── .env.local
├── .env.example
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 6. Feature Implementation Phases

### Phase 1: Project Setup & Authentication (Week 1)
- [ ] Initialize Next.js project
- [ ] Set up Tailwind CSS + Shadcn/ui
- [ ] Configure database (Drizzle + PostgreSQL)
- [ ] Implement authentication (NextAuth.js)
- [ ] Create basic layout and navigation
- [ ] Deploy initial version to Vercel

### Phase 2: Timesheet Module (Week 2)
- [ ] Create timesheet data model and migrations
- [ ] Build timesheet entry form
- [ ] Implement calendar view
- [ ] Build list view with filters
- [ ] Add edit/delete functionality
- [ ] Implement monthly summary calculations

### Phase 3: Invoice Module (Week 3)
- [ ] Create invoice data model and migrations
- [ ] Build invoice creation wizard
- [ ] Implement invoice preview
- [ ] Integrate DOC generation (docx)
- [ ] Integrate PDF generation (@react-pdf/renderer)
- [ ] Add invoice list and detail views
- [ ] Implement invoice number auto-generation

### Phase 4: Distribution Module (Week 4)
- [ ] Create payment and expense data models
- [ ] Build expense tracking UI
- [ ] Build payment recording UI
- [ ] Implement distribution calculation logic
- [ ] Create distribution summary dashboard
- [ ] Add breakdown views per resource

### Phase 5: Polish & Testing (Week 5)
- [ ] End-to-end testing
- [ ] Mobile responsiveness refinements
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Production deployment

---

## 7. API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Timesheets
- `GET /api/timesheets` - List timesheets (with filters)
- `POST /api/timesheets` - Create timesheet entry
- `GET /api/timesheets/[id]` - Get single timesheet
- `PUT /api/timesheets/[id]` - Update timesheet
- `DELETE /api/timesheets/[id]` - Delete timesheet
- `GET /api/timesheets/summary` - Get monthly summary

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/generate-doc` - Generate DOC
- `POST /api/invoices/generate-pdf` - Generate PDF

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `GET /api/payments/[id]` - Get payment details
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get expense details
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Distribution
- `GET /api/distribution` - Calculate distribution for period
- `POST /api/distribution/calculate` - Run calculation

---

## 8. Configuration Management

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# File Storage
BLOB_READ_WRITE_TOKEN=vercel-blob-token

# Currency (defaults)
DEFAULT_HOURLY_RATE=45
DEFAULT_CONVERSION_RATE=90

# App Config
RESOURCES=Amit,Abhilash
```

---

## 9. Testing Strategy

### Unit Tests
- Calculation utilities (distribution logic)
- Date helpers
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Invoice generation

### E2E Tests (Optional)
- Critical user flows
- Invoice generation end-to-end

---

## 10. Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured in Vercel
- [ ] Database provisioned and migrated
- [ ] Authentication configured
- [ ] Build succeeds locally
- [ ] All tests passing

### Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Configure build settings
- [ ] Set up automatic deployments
- [ ] Configure custom domain (optional)

### Post-deployment
- [ ] Verify app is accessible
- [ ] Test authentication
- [ ] Seed initial data
- [ ] Monitor error logs
- [ ] Set up analytics (optional)

---

## 11. Future Enhancements (Post-MVP)

- Multi-client support
- Recurring invoices
- Email invoice sending
- Expense categories and reporting
- Tax calculations
- Currency exchange rate API integration
- Data export (CSV, Excel)
- Audit logs
- Multi-currency support
- Role-based access control
- Mobile app (React Native)

---

## 12. Success Criteria

### Must Have
- ✓ Record and manage timesheets
- ✓ Generate invoices in DOC and PDF formats
- ✓ Calculate revenue distribution accurately
- ✓ Mobile responsive
- ✓ Deployed on Vercel

### Should Have
- ✓ Intuitive UI/UX
- ✓ Fast performance (<2s page loads)
- ✓ Data validation and error handling
- ✓ Secure authentication

### Nice to Have
- Email notifications
- Dashboard analytics
- Data export features
- Automated backups

---

## Appendix A: Sample Calculations

### Scenario 1: Equal Hours
```
Amit: 50 hours @ $45 = $2,250 (₹202,500)
Abhi: 50 hours @ $45 = $2,250 (₹202,500)
Total: $4,500 (₹405,000)

Expenses: Amit ₹5,000, Abhi ₹3,000
Total Expenses: ₹8,000
Liability: ₹4,000 each

Amit: ₹202,500 - ₹4,000 = ₹198,500 (owes Abhi ₹1,000)
Abhi: ₹202,500 - ₹4,000 = ₹198,500 (receives ₹1,000 from Amit)
```

### Scenario 2: Unequal Hours, No Expenses
```
Amit: 60 hours @ $45 = $2,700 (₹243,000)
Abhi: 30 hours @ $45 = $1,350 (₹121,500)
Total: $4,050 (₹364,500)

No expenses
Amit withdraws: ₹243,000
Abhi withdraws: ₹121,500
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | Claude Code | Initial specification |

