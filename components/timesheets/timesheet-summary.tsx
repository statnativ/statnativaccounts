"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatHours } from "@/lib/utils/calculations";
import { Clock, DollarSign, FileText } from "lucide-react";

interface ResourceSummary {
  resourceName: string;
  totalHours: number;
  totalAmount: number;
  entryCount: number;
}

interface SummaryData {
  byResource: ResourceSummary[];
  grandTotal: {
    totalHours: number;
    totalAmount: number;
    entryCount: number;
  };
}

interface TimesheetSummaryProps {
  summary: SummaryData | null;
}

export function TimesheetSummary({ summary }: TimesheetSummaryProps) {
  if (!summary) {
    return null;
  }

  const { byResource, grandTotal } = summary;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {byResource.map((resource) => (
        <Card key={resource.resourceName}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {resource.resourceName}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(resource.totalHours)} hrs
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(resource.totalAmount, "USD")} total
            </p>
            <p className="text-xs text-muted-foreground">
              {resource.entryCount} {resource.entryCount === 1 ? "entry" : "entries"}
            </p>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatHours(grandTotal.totalHours)}
          </div>
          <p className="text-xs text-muted-foreground">
            Combined across all resources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(grandTotal.totalAmount, "USD")}
          </div>
          <p className="text-xs text-muted-foreground">
            Total billable amount
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
