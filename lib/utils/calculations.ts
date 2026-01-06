import { ResourceDistribution, DistributionCalculation } from "@/types/distribution";
import { TimesheetEntry } from "@/types/timesheet";
import { Expense } from "@/types/expense";

export function calculateResourceEarnings(
  timesheets: TimesheetEntry[],
  conversionRate: number = 90
): Record<string, { hours: number; usd: number; inr: number }> {
  const earnings: Record<string, { hours: number; usd: number; inr: number }> = {};

  timesheets.forEach((entry) => {
    if (!earnings[entry.resourceName]) {
      earnings[entry.resourceName] = { hours: 0, usd: 0, inr: 0 };
    }

    const hours = Number(entry.hoursWorked);
    const rate = Number(entry.hourlyRate);
    const usd = hours * rate;
    const inr = usd * conversionRate;

    earnings[entry.resourceName].hours += hours;
    earnings[entry.resourceName].usd += usd;
    earnings[entry.resourceName].inr += inr;
  });

  return earnings;
}

export function calculateExpenseLiability(expenses: Expense[]): {
  totalExpenses: number;
  expensesByResource: Record<string, number>;
  liabilityPerResource: number;
} {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amountInr),
    0
  );

  const expensesByResource: Record<string, number> = {};
  expenses.forEach((expense) => {
    if (!expensesByResource[expense.paidBy]) {
      expensesByResource[expense.paidBy] = 0;
    }
    expensesByResource[expense.paidBy] += Number(expense.amountInr);
  });

  // Assuming 2 resources, split equally
  const liabilityPerResource = totalExpenses / 2;

  return {
    totalExpenses,
    expensesByResource,
    liabilityPerResource,
  };
}

export function calculateDistribution(
  timesheets: TimesheetEntry[],
  expenses: Expense[],
  conversionRate: number = 90
): DistributionCalculation {
  const earnings = calculateResourceEarnings(timesheets, conversionRate);
  const { totalExpenses, expensesByResource, liabilityPerResource } =
    calculateExpenseLiability(expenses);

  const resources: ResourceDistribution[] = Object.entries(earnings).map(
    ([resourceName, earning]) => {
      const expensesPaid = expensesByResource[resourceName] || 0;
      const netWithdrawal = earning.inr - liabilityPerResource;
      const reimbursementAmount = liabilityPerResource - expensesPaid;

      return {
        resourceName: resourceName as "Amit" | "Abhilash",
        totalHours: earning.hours,
        hourlyRateUsd: earning.usd / earning.hours || 0,
        grossEarningsUsd: earning.usd,
        grossEarningsInr: earning.inr,
        expensesPaid,
        expenseLiability: liabilityPerResource,
        netWithdrawal,
        reimbursementAmount,
      };
    }
  );

  const totalRevenueUsd = Object.values(earnings).reduce(
    (sum, e) => sum + e.usd,
    0
  );
  const totalRevenueInr = Object.values(earnings).reduce(
    (sum, e) => sum + e.inr,
    0
  );

  return {
    periodStart: timesheets[0]?.date || new Date(),
    periodEnd: timesheets[timesheets.length - 1]?.date || new Date(),
    resources,
    totalExpensesInr: totalExpenses,
    totalRevenueUsd,
    totalRevenueInr,
    calculatedAt: new Date(),
  };
}

export function generateInvoiceNumber(
  resourceName: string,
  date: Date,
  sequenceNumber: number
): string {
  const year = date.getFullYear();
  const nextYear = year + 1;
  const fyYear = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;
  const sequence = sequenceNumber.toString().padStart(4, "0");

  return `Invoice_${resourceName}_FY${fyYear}-${sequence}`;
}

export function formatCurrency(amount: number | string, currency: "USD" | "INR" = "USD"): string {
  const symbol = currency === "USD" ? "$" : "₹";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${symbol}${numAmount.toFixed(2)}`;
}

export function formatHours(hours: number | string): string {
  const numHours = typeof hours === "string" ? parseFloat(hours) : hours;
  return numHours.toFixed(2);
}
