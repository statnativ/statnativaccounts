import { ResourceName } from "./timesheet";

export interface Payment {
  id: string;
  invoiceId?: string;
  paymentDate: Date;
  amountUsdInvoiced: number;
  bankChargesUsd: number;
  amountUsdReceived: number;
  conversionRate: number;
  amountInrReceived: number;
  notes?: string;
  createdAt: Date;
}

export interface ResourceDistribution {
  resourceName: ResourceName;
  totalHours: number;
  hourlyRateUsd: number;
  grossEarningsUsd: number;
  grossEarningsInr: number;
  expensesPaid: number;
  expenseLiability: number;
  netWithdrawal: number;
  reimbursementAmount: number; // positive = to receive, negative = to pay
}

export interface DistributionCalculation {
  periodStart: Date;
  periodEnd: Date;
  resources: ResourceDistribution[];
  totalExpensesInr: number;
  totalRevenueUsd: number;
  totalRevenueInr: number;
  calculatedAt: Date;
}

export interface DistributionSummary {
  amit: ResourceDistribution;
  abhilash: ResourceDistribution;
  totalExpenses: number;
  totalRevenue: number;
  period: {
    start: Date;
    end: Date;
  };
}
