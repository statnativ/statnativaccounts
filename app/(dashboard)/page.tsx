import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, DollarSign, CreditCard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to StatNativ Accounts - Manage your timesheets, invoices, and revenue distribution
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timesheets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Track daily work hours for each resource</CardDescription>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/timesheets">Manage Timesheets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Generate and download invoices in DOC/PDF</CardDescription>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/invoices">Manage Invoices</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Track shared expenses and reimbursements</CardDescription>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/expenses">Track Expenses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Calculate revenue distribution and withdrawals</CardDescription>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/distribution">View Distribution</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to start managing your accounting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">Enter Timesheets</p>
              <p className="text-sm text-muted-foreground">
                Record daily work hours for Amit and Abhilash
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">Generate Invoices</p>
              <p className="text-sm text-muted-foreground">
                Create invoices from timesheet data and download as DOC/PDF
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">Track Expenses</p>
              <p className="text-sm text-muted-foreground">
                Record shared business expenses paid by each resource
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              4
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">Calculate Distribution</p>
              <p className="text-sm text-muted-foreground">
                View revenue distribution and net withdrawal amounts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
