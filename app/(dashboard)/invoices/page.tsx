"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Filter } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { useToast } from "@/hooks/use-toast";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/invoices?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoices");
      }

      setInvoices(result.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const handleSuccess = () => {
    fetchInvoices();
  };

  const handleView = (invoice: any) => {
    setPreviewInvoice(invoice);
  };

  const handleClosePreview = () => {
    setPreviewInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Generate and manage invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchInvoices}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Generated">Generated</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <InvoiceList
          invoices={invoices}
          onView={handleView}
          onRefresh={handleSuccess}
        />
      )}

      {/* Invoice Form Dialog */}
      <InvoiceForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Invoice Preview Dialog */}
      <InvoicePreview
        invoice={previewInvoice}
        open={!!previewInvoice}
        onClose={handleClosePreview}
      />
    </div>
  );
}
