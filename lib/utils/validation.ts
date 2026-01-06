import { z } from "zod";

export const timesheetSchema = z.object({
  date: z.date(),
  resourceName: z.enum(["Amit", "Abhilash"]),
  hoursWorked: z
    .number()
    .min(0, "Hours must be positive")
    .max(24, "Hours cannot exceed 24 per day"),
  hourlyRate: z.number().min(0, "Rate must be positive").default(45),
  projectName: z.string().optional(),
  clientName: z.string().optional(),
  description: z.string().optional(),
});

export const invoiceSchema = z.object({
  invoiceDate: z.date(),
  billingPeriodStart: z.date(),
  billingPeriodEnd: z.date(),
  clientName: z.string().min(1, "Client name is required"),
  clientAddress: z.string().optional(),
  resources: z.array(z.enum(["Amit", "Abhilash"])).min(1, "Select at least one resource"),
  conversionRate: z.number().min(0, "Conversion rate must be positive").default(90),
});

export const expenseSchema = z.object({
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  amountInr: z.number().min(0, "Amount must be positive"),
  paidBy: z.enum(["Amit", "Abhilash"]),
  category: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  paymentDate: z.date(),
  amountUsdInvoiced: z.number().min(0, "Amount must be positive"),
  bankChargesUsd: z.number().min(0, "Bank charges must be positive").default(0),
  amountUsdReceived: z.number().min(0, "Amount received must be positive"),
  conversionRate: z.number().min(0, "Conversion rate must be positive"),
  amountInrReceived: z.number().min(0, "Amount must be positive"),
  notes: z.string().optional(),
});

export type TimesheetFormSchema = z.infer<typeof timesheetSchema>;
export type InvoiceFormSchema = z.infer<typeof invoiceSchema>;
export type ExpenseFormSchema = z.infer<typeof expenseSchema>;
export type PaymentFormSchema = z.infer<typeof paymentSchema>;
