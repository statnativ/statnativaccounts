import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { timesheets, payments, expenses } from "@/lib/db/schema";
import { and, gte, lte, eq } from "drizzle-orm";

// GET /api/distribution - Calculate revenue distribution
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Please set up your database connection. See SETUP.md for instructions."
        },
        { status: 503 }
      );
    }

    const db = getDatabase();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch timesheets data
    let timesheetConditions = [];
    if (startDate) timesheetConditions.push(gte(timesheets.date, startDate));
    if (endDate) timesheetConditions.push(lte(timesheets.date, endDate));

    const timesheetQuery = timesheetConditions.length > 0
      ? db.select().from(timesheets).where(and(...timesheetConditions))
      : db.select().from(timesheets);

    const allTimesheets = await timesheetQuery;

    // Fetch payments data
    let paymentConditions = [];
    if (startDate) paymentConditions.push(gte(payments.paymentDate, startDate));
    if (endDate) paymentConditions.push(lte(payments.paymentDate, endDate));

    const paymentQuery = paymentConditions.length > 0
      ? db.select().from(payments).where(and(...paymentConditions))
      : db.select().from(payments);

    const allPayments = await paymentQuery;

    // Fetch expenses data
    let expenseConditions = [];
    if (startDate) expenseConditions.push(gte(expenses.date, startDate));
    if (endDate) expenseConditions.push(lte(expenses.date, endDate));

    const expenseQuery = expenseConditions.length > 0
      ? db.select().from(expenses).where(and(...expenseConditions))
      : db.select().from(expenses);

    const allExpenses = await expenseQuery;

    // Calculate earnings per resource from timesheets (in USD)
    const amitTimesheets = allTimesheets.filter(ts => ts.resourceName === "Amit");
    const abhilashTimesheets = allTimesheets.filter(ts => ts.resourceName === "Abhilash");

    const amitHours = amitTimesheets.reduce((sum, ts) => sum + Number(ts.hoursWorked), 0);
    const abhilashHours = abhilashTimesheets.reduce((sum, ts) => sum + Number(ts.hoursWorked), 0);

    const amitEarningsUsd = amitTimesheets.reduce(
      (sum, ts) => sum + (Number(ts.hoursWorked) * Number(ts.hourlyRate)),
      0
    );
    const abhilashEarningsUsd = abhilashTimesheets.reduce(
      (sum, ts) => sum + (Number(ts.hoursWorked) * Number(ts.hourlyRate)),
      0
    );

    // Calculate total payments received (in INR)
    const totalPaymentsInr = allPayments.reduce(
      (sum, payment) => sum + Number(payment.amountInrReceived),
      0
    );

    // Calculate average conversion rate from payments
    const totalUsdInvoiced = allPayments.reduce(
      (sum, payment) => sum + Number(payment.amountUsdInvoiced),
      0
    );
    const avgConversionRate = totalUsdInvoiced > 0
      ? totalPaymentsInr / totalUsdInvoiced
      : 90; // Default to 90 if no payments

    // Convert USD earnings to INR using average conversion rate
    const amitEarningsInr = amitEarningsUsd * avgConversionRate;
    const abhilashEarningsInr = abhilashEarningsUsd * avgConversionRate;

    // Calculate expenses per resource (in INR)
    const amitExpenses = allExpenses.filter(exp => exp.paidBy === "Amit");
    const abhilashExpenses = allExpenses.filter(exp => exp.paidBy === "Abhilash");

    const amitExpensesTotal = amitExpenses.reduce(
      (sum, exp) => sum + Number(exp.amountInr),
      0
    );
    const abhilashExpensesTotal = abhilashExpenses.reduce(
      (sum, exp) => sum + Number(exp.amountInr),
      0
    );

    const totalExpenses = amitExpensesTotal + abhilashExpensesTotal;

    // Calculate equal liability split (each person is responsible for 50% of total expenses)
    const equalLiability = totalExpenses / 2;

    // Calculate reimbursement amounts
    // If Amit paid more than his share, Abhilash owes him the difference
    // If Abhilash paid more than his share, Amit owes him the difference
    const amitReimbursement = amitExpensesTotal - equalLiability;
    const abhilashReimbursement = abhilashExpensesTotal - equalLiability;

    // Calculate net withdrawal amounts
    // Net = Earnings - Equal Liability + Reimbursement
    const amitNetWithdrawal = amitEarningsInr - equalLiability + amitReimbursement;
    const abhilashNetWithdrawal = abhilashEarningsInr - equalLiability + abhilashReimbursement;

    // Prepare detailed breakdown
    const distribution = {
      period: {
        startDate: startDate || "All time",
        endDate: endDate || "All time",
      },
      timesheets: {
        amit: {
          hours: amitHours,
          earningsUsd: amitEarningsUsd,
          earningsInr: amitEarningsInr,
        },
        abhilash: {
          hours: abhilashHours,
          earningsUsd: abhilashEarningsUsd,
          earningsInr: abhilashEarningsInr,
        },
        total: {
          hours: amitHours + abhilashHours,
          earningsUsd: amitEarningsUsd + abhilashEarningsUsd,
          earningsInr: amitEarningsInr + abhilashEarningsInr,
        },
      },
      payments: {
        totalPaymentsInr,
        avgConversionRate,
        paymentCount: allPayments.length,
      },
      expenses: {
        amit: {
          expenseCount: amitExpenses.length,
          totalPaid: amitExpensesTotal,
          liability: equalLiability,
          reimbursement: amitReimbursement,
        },
        abhilash: {
          expenseCount: abhilashExpenses.length,
          totalPaid: abhilashExpensesTotal,
          liability: equalLiability,
          reimbursement: abhilashReimbursement,
        },
        total: {
          expenseCount: allExpenses.length,
          totalExpenses,
          equalLiability,
        },
      },
      netWithdrawal: {
        amit: amitNetWithdrawal,
        abhilash: abhilashNetWithdrawal,
        total: amitNetWithdrawal + abhilashNetWithdrawal,
      },
      summary: {
        amitOwesAbhilash: amitReimbursement < 0 ? Math.abs(amitReimbursement) : 0,
        abhilashOwesAmit: abhilashReimbursement < 0 ? Math.abs(abhilashReimbursement) : 0,
      },
    };

    return NextResponse.json({ data: distribution });
  } catch (error: any) {
    console.error("Error calculating distribution:", error);
    return NextResponse.json(
      { error: "Failed to calculate distribution", message: error.message },
      { status: 500 }
    );
  }
}
