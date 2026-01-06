"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Loader2, Calendar, Download } from "lucide-react";
import { DistributionSummary } from "@/components/distribution/distribution-summary";
import { useToast } from "@/hooks/use-toast";

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

export default function DistributionPage() {
  const [distribution, setDistribution] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await fetch(`/api/distribution?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setDistribution(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch distribution");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateRange = () => {
    fetchDistribution();
  };

  const handleClearDateRange = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
    setTimeout(() => {
      fetchDistribution();
    }, 0);
  };

  const handleExport = () => {
    if (!distribution) return;

    // Create a simple text summary for export
    const exportData = `Revenue Distribution Report
Period: ${distribution.period.startDate} to ${distribution.period.endDate}

EARNINGS BREAKDOWN
==================
Amit:
  Hours: ${distribution.timesheets.amit.hours.toFixed(2)}
  Earnings (USD): $${distribution.timesheets.amit.earningsUsd.toFixed(2)}
  Earnings (INR): ₹${distribution.timesheets.amit.earningsInr.toFixed(2)}

Abhilash:
  Hours: ${distribution.timesheets.abhilash.hours.toFixed(2)}
  Earnings (USD): $${distribution.timesheets.abhilash.earningsUsd.toFixed(2)}
  Earnings (INR): ₹${distribution.timesheets.abhilash.earningsInr.toFixed(2)}

Total:
  Hours: ${distribution.timesheets.total.hours.toFixed(2)}
  Earnings (USD): $${distribution.timesheets.total.earningsUsd.toFixed(2)}
  Earnings (INR): ₹${distribution.timesheets.total.earningsInr.toFixed(2)}

EXPENSE BREAKDOWN
=================
Amit:
  Expenses Paid: ${distribution.expenses.amit.expenseCount}
  Total Paid: ₹${distribution.expenses.amit.totalPaid.toFixed(2)}
  Liability (50%): ₹${distribution.expenses.amit.liability.toFixed(2)}
  Reimbursement: ${distribution.expenses.amit.reimbursement >= 0 ? '+' : ''}₹${distribution.expenses.amit.reimbursement.toFixed(2)}

Abhilash:
  Expenses Paid: ${distribution.expenses.abhilash.expenseCount}
  Total Paid: ₹${distribution.expenses.abhilash.totalPaid.toFixed(2)}
  Liability (50%): ₹${distribution.expenses.abhilash.liability.toFixed(2)}
  Reimbursement: ${distribution.expenses.abhilash.reimbursement >= 0 ? '+' : ''}₹${distribution.expenses.abhilash.reimbursement.toFixed(2)}

Total Expenses: ₹${distribution.expenses.total.totalExpenses.toFixed(2)}

NET WITHDRAWAL AMOUNTS
======================
Amit: ₹${distribution.netWithdrawal.amit.toFixed(2)}
Abhilash: ₹${distribution.netWithdrawal.abhilash.toFixed(2)}
Total: ₹${distribution.netWithdrawal.total.toFixed(2)}

REIMBURSEMENT SUMMARY
=====================
${distribution.summary.amitOwesAbhilash > 0 ? `Amit owes Abhilash: ₹${distribution.summary.amitOwesAbhilash.toFixed(2)}` : ''}
${distribution.summary.abhilashOwesAmit > 0 ? `Abhilash owes Amit: ₹${distribution.summary.abhilashOwesAmit.toFixed(2)}` : ''}

PAYMENT SUMMARY
===============
Total Payments Received: ₹${distribution.payments.totalPaymentsInr.toFixed(2)}
Payment Count: ${distribution.payments.paymentCount}
Average Conversion Rate: ₹${distribution.payments.avgConversionRate.toFixed(2)} per USD
`;

    const blob = new Blob([exportData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Success",
      description: "Distribution report exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Distribution</h1>
          <p className="text-muted-foreground">
            Calculate revenue distribution and net withdrawal amounts
          </p>
        </div>
        {distribution && (
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>Filter distribution by date range (leave empty for all time)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyDateRange} size="sm">
              Apply Filter
            </Button>
            <Button onClick={handleClearDateRange} variant="outline" size="sm">
              Clear Filter
            </Button>
            <Button onClick={fetchDistribution} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Summary */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : distribution ? (
        <DistributionSummary distribution={distribution} />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No distribution data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
