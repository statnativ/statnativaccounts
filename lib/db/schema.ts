import { pgTable, uuid, varchar, text, decimal, date, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const resourceEnum = pgEnum("resource_name", ["Amit", "Abhilash"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["Draft", "Generated", "Paid"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Timesheets table
export const timesheets = pgTable("timesheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  resourceName: resourceEnum("resource_name").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("45.00").notNull(),
  projectName: varchar("project_name", { length: 255 }),
  clientName: varchar("client_name", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  billingPeriodStart: date("billing_period_start").notNull(),
  billingPeriodEnd: date("billing_period_end").notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientAddress: text("client_address"),
  resources: jsonb("resources").notNull(),
  lineItems: jsonb("line_items").notNull(),
  subtotalUsd: decimal("subtotal_usd", { precision: 12, scale: 2 }).notNull(),
  conversionRate: decimal("conversion_rate", { precision: 10, scale: 4 }).default("90.0000").notNull(),
  totalInr: decimal("total_inr", { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("Draft").notNull(),
  paidDate: date("paid_date"),
  docUrl: text("doc_url"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  paymentDate: date("payment_date").notNull(),
  amountUsdInvoiced: decimal("amount_usd_invoiced", { precision: 12, scale: 2 }).notNull(),
  bankChargesUsd: decimal("bank_charges_usd", { precision: 12, scale: 2 }).default("0").notNull(),
  amountUsdReceived: decimal("amount_usd_received", { precision: 12, scale: 2 }).notNull(),
  conversionRate: decimal("conversion_rate", { precision: 10, scale: 4 }).notNull(),
  amountInrReceived: decimal("amount_inr_received", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amountInr: decimal("amount_inr", { precision: 12, scale: 2 }).notNull(),
  paidBy: resourceEnum("paid_by").notNull(),
  category: varchar("category", { length: 100 }),
  isReimbursed: boolean("is_reimbursed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const invoicesRelations = relations(invoices, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));
