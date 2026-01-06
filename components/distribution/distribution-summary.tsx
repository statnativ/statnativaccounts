"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/calculations";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DistributionData {
  period: {
    startDate: string;
    endDate: string;
  };
  timesheets: {
    amit: {
      hours: number;
      earningsUsd: number;
      earningsInr: number;
    };
    abhilash: {
      hours: number;
      earningsUsd: number;
      earningsInr: number;
    };
    total: {
      hours: number;
      earningsUsd: number;
      earningsInr: number;
    };
  };
  payments: {
    totalPaymentsInr: number;
    avgConversionRate: number;
    paymentCount: number;
  };
  expenses: {
    amit: {
      expenseCount: number;
      totalPaid: number;
      liability: number;
      reimbursement: number;
    };
    abhilash: {
      expenseCount: number;
      totalPaid: number;
      liability: number;
      reimbursement: number;
    };
    total: {
      expenseCount: number;
      totalExpenses: number;
      equalLiability: number;
    };
  };
  netWithdrawal: {
    amit: number;
    abhilash: number;
    total: number;
  };
  summary: {
    amitOwesAbhilash: number;
    abhilashOwesAmit: number;
  };
}

interface DistributionSummaryProps {
  distribution: DistributionData;
}

export function DistributionSummary({ distribution }: DistributionSummaryProps) {
  const { timesheets, expenses, netWithdrawal, summary, payments } = distribution;

  return (
    <div className="space-y-6">
      {/* Net Withdrawal - Most Important */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6" />
            Net Withdrawal Amounts
          </CardTitle>
          <CardDescription>
            Amount each resource can withdraw after expenses and reimbursements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Amit</span>
                <Badge variant="default" className="text-base px-3 py-1">
                  {formatCurrency(netWithdrawal.amit, "INR")}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Earnings:</span>
                  <span>{formatCurrency(timesheets.amit.earningsInr, "INR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liability (50%):</span>
                  <span className="text-destructive">
                    -{formatCurrency(expenses.amit.liability, "INR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reimbursement:</span>
                  <span className={expenses.amit.reimbursement >= 0 ? "text-green-600" : "text-destructive"}>
                    {expenses.amit.reimbursement >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(expenses.amit.reimbursement), "INR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Abhilash</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {formatCurrency(netWithdrawal.abhilash, "INR")}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Earnings:</span>
                  <span>{formatCurrency(timesheets.abhilash.earningsInr, "INR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liability (50%):</span>
                  <span className="text-destructive">
                    -{formatCurrency(expenses.abhilash.liability, "INR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reimbursement:</span>
                  <span className={expenses.abhilash.reimbursement >= 0 ? "text-green-600" : "text-destructive"}>
                    {expenses.abhilash.reimbursement >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(expenses.abhilash.reimbursement), "INR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reimbursement Alert */}
      {(summary.amitOwesAbhilash > 0 || summary.abhilashOwesAmit > 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Reimbursement Required</AlertTitle>
          <AlertDescription>
            {summary.amitOwesAbhilash > 0 && (
              <p>
                Amit owes Abhilash <strong>{formatCurrency(summary.amitOwesAbhilash, "INR")}</strong> for expense reimbursement.
              </p>
            )}
            {summary.abhilashOwesAmit > 0 && (
              <p>
                Abhilash owes Amit <strong>{formatCurrency(summary.abhilashOwesAmit, "INR")}</strong> for expense reimbursement.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Earnings Breakdown
          </CardTitle>
          <CardDescription>
            Revenue generated from timesheet hours (Average rate: ₹{payments.avgConversionRate.toFixed(2)}/$1)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Earnings (USD)</TableHead>
                <TableHead className="text-right">Earnings (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Amit</TableCell>
                <TableCell className="text-right">{timesheets.amit.hours.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(timesheets.amit.earningsUsd, "USD")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(timesheets.amit.earningsInr, "INR")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Abhilash</TableCell>
                <TableCell className="text-right">{timesheets.abhilash.hours.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(timesheets.abhilash.earningsUsd, "USD")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(timesheets.abhilash.earningsInr, "INR")}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{timesheets.total.hours.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(timesheets.total.earningsUsd, "USD")}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(timesheets.total.earningsInr, "INR")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Breakdown
          </CardTitle>
          <CardDescription>
            Shared business expenses with equal liability split
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Liability (50%)</TableHead>
                <TableHead className="text-right">Reimbursement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Amit</TableCell>
                <TableCell className="text-right">{expenses.amit.expenseCount}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(expenses.amit.totalPaid, "INR")}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(expenses.amit.liability, "INR")}
                </TableCell>
                <TableCell className="text-right">
                  <span className={expenses.amit.reimbursement >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                    {expenses.amit.reimbursement >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(expenses.amit.reimbursement), "INR")}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Abhilash</TableCell>
                <TableCell className="text-right">{expenses.abhilash.expenseCount}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(expenses.abhilash.totalPaid, "INR")}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(expenses.abhilash.liability, "INR")}
                </TableCell>
                <TableCell className="text-right">
                  <span className={expenses.abhilash.reimbursement >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                    {expenses.abhilash.reimbursement >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(expenses.abhilash.reimbursement), "INR")}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{expenses.total.expenseCount}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(expenses.total.totalExpenses, "INR")}
                </TableCell>
                <TableCell className="text-right" colSpan={2}>
                  Each liable for: {formatCurrency(expenses.total.equalLiability, "INR")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Payment Summary
          </CardTitle>
          <CardDescription>
            Total payments received from clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Received (INR)</p>
              <p className="text-2xl font-bold">{formatCurrency(payments.totalPaymentsInr, "INR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Count</p>
              <p className="text-2xl font-bold">{payments.paymentCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
              <p className="text-2xl font-bold">₹{payments.avgConversionRate.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
