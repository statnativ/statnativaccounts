"use client";

import { useState } from "react";
import { formatDisplayDate } from "@/lib/utils/date-helpers";
import { formatCurrency } from "@/lib/utils/calculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Download, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  clientName: string;
  resources: string[];
  subtotalUsd: string;
  totalInr: string;
  status: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export function InvoiceList({ invoices, onView, onRefresh }: InvoiceListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/invoices/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete invoice");
      }

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      onRefresh();
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadDoc = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingDoc(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/generate-doc`, {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to generate DOC file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "DOC file downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingPdf(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/generate-pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to generate PDF file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "PDF file downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(null);
    }
  };

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

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No invoices found</p>
          <p className="text-sm text-muted-foreground">
            Click "Create Invoice" to generate your first invoice from timesheet data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Amount (INR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{formatDisplayDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(invoice.resources as string[]).map((resource, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.subtotalUsd, "USD")}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.totalInr, "INR")}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(invoice)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadDoc(invoice.id, invoice.invoiceNumber)}
                          disabled={downloadingDoc === invoice.id}
                          title="Download DOC"
                        >
                          {downloadingDoc === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                          disabled={downloadingPdf === invoice.id}
                          title="Download PDF"
                        >
                          {downloadingPdf === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(invoice.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
