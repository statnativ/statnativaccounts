import { ResourceName } from "./timesheet";

export type InvoiceStatus = "Draft" | "Generated" | "Paid";

export interface InvoiceLineItem {
  date: Date;
  resourceName: ResourceName;
  description: string;
  hoursWorked: number;
  ratePerHour: number;
  amountUsd: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  clientName: string;
  clientAddress?: string;
  resources: ResourceName[];
  lineItems: InvoiceLineItem[];
  subtotalUsd: number;
  conversionRate: number;
  totalInr: number;
  status: InvoiceStatus;
  paidDate?: Date;
  docUrl?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceFormData {
  invoiceDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  clientName: string;
  clientAddress?: string;
  resources: ResourceName[];
  conversionRate: number;
}

export interface InvoiceTemplate {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientAddress?: string;
  lineItems: {
    date: string;
    resource: string;
    description: string;
    hours: string;
    rate: string;
    amount: string;
  }[];
  subtotalUsd: string;
  conversionRate: string;
  totalInr: string;
}
