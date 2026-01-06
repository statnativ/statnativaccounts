"use client";

import { formatDisplayDate } from "@/lib/utils/date-helpers";
import { formatCurrency, formatHours } from "@/lib/utils/calculations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface InvoiceLineItem {
  date: string;
  resourceName: string;
  description: string;
  hoursWorked: number;
  ratePerHour: number;
  amountUsd: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  clientName: string;
  clientAddress?: string;
  resources: string[];
  lineItems: InvoiceLineItem[];
  subtotalUsd: string;
  conversionRate: string;
  totalInr: string;
  status: string;
  createdAt: string;
}

interface InvoicePreviewProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

export function InvoicePreview({ invoice, open, onClose }: InvoicePreviewProps) {
  if (!invoice) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Draft: "secondary",
      Generated: "default",
      Paid: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Preview</DialogTitle>
            {getStatusBadge(invoice.status)}
          </div>
          <DialogDescription>
            Invoice details and line items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold">INVOICE</h2>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium">{formatDisplayDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Period</p>
              <p className="font-medium">
                {formatDisplayDate(invoice.billingPeriodStart)} - {formatDisplayDate(invoice.billingPeriodEnd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resources</p>
              <div className="flex gap-1 mt-1">
                {(invoice.resources as string[]).map((resource, idx) => (
                  <Badge key={idx} variant="outline">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Information */}
          <div>
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.clientName}</p>
            {invoice.clientAddress && (
              <p className="text-sm text-muted-foreground">{invoice.clientAddress}</p>
            )}
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-3">Services Rendered:</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDisplayDate(item.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.resourceName}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatHours(item.hoursWorked)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.ratePerHour, "USD")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amountUsd, "USD")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Invoice Total (USD):</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(invoice.subtotalUsd, "USD")}
              </span>
            </div>
            <Separator />
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Reference Conversion (for information only):</p>
              <div className="flex justify-between items-center text-sm">
                <span>Conversion Rate: ₹{Number(invoice.conversionRate).toFixed(2)} = $1.00</span>
                <span className="font-medium">≈ {formatCurrency(invoice.totalInr, "INR")}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Thank you for your business!</p>
            <p className="text-xs mt-2">
              Created on {formatDisplayDate(invoice.createdAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
