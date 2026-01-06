"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotalUsd: string;
  status: string;
}

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentForm({ open, onClose, onSuccess }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date(),
      amountUsdInvoiced: 0,
      bankChargesUsd: 0,
      conversionRate: 90,
      notes: "",
    },
  });

  const invoiceId = watch("invoiceId");
  const amountUsdInvoiced = watch("amountUsdInvoiced");
  const bankChargesUsd = watch("bankChargesUsd");
  const conversionRate = watch("conversionRate");

  // Load unpaid invoices
  useEffect(() => {
    if (open) {
      fetchInvoices();
    }
  }, [open]);

  // Auto-populate amount when invoice is selected
  useEffect(() => {
    if (invoiceId) {
      const selectedInvoice = invoices.find(inv => inv.id === invoiceId);
      if (selectedInvoice) {
        setValue("amountUsdInvoiced", Number(selectedInvoice.subtotalUsd));
      }
    }
  }, [invoiceId, invoices, setValue]);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const response = await fetch("/api/invoices?status=Generated");
      const result = await response.json();

      if (response.ok) {
        setInvoices(result.data || []);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const onSubmit = async (data: PaymentFormSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          paymentDate: data.paymentDate.toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to record payment");
      }

      toast({
        title: "Success",
        description: result.message || "Payment recorded successfully",
      });

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Calculate derived values
  const amountUsdReceived = amountUsdInvoiced - bankChargesUsd;
  const amountInrReceived = amountUsdReceived * conversionRate;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment received from client with currency conversion details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceId">Link to Invoice (Optional)</Label>
            <Select
              value={invoiceId}
              onValueChange={(value) => setValue("invoiceId", value)}
              disabled={loadingInvoices}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingInvoices ? "Loading invoices..." : "Select invoice (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - ${Number(invoice.subtotalUsd).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input
              id="paymentDate"
              type="date"
              {...register("paymentDate", {
                setValueAs: (value) => new Date(value),
              })}
            />
            {errors.paymentDate && (
              <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountUsdInvoiced">Amount Invoiced (USD) *</Label>
              <Input
                id="amountUsdInvoiced"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amountUsdInvoiced", { valueAsNumber: true })}
              />
              {errors.amountUsdInvoiced && (
                <p className="text-sm text-destructive">{errors.amountUsdInvoiced.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankChargesUsd">Bank Charges (USD) *</Label>
              <Input
                id="bankChargesUsd"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("bankChargesUsd", { valueAsNumber: true })}
              />
              {errors.bankChargesUsd && (
                <p className="text-sm text-destructive">{errors.bankChargesUsd.message}</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Amount Received (USD)</p>
            <p className="text-2xl font-bold">${amountUsdReceived.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversionRate">Conversion Rate (INR per USD) *</Label>
            <Input
              id="conversionRate"
              type="number"
              step="0.0001"
              min="0"
              placeholder="90.0000"
              {...register("conversionRate", { valueAsNumber: true })}
            />
            {errors.conversionRate && (
              <p className="text-sm text-destructive">{errors.conversionRate.message}</p>
            )}
          </div>

          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm font-medium mb-1">Amount Received (INR)</p>
            <p className="text-2xl font-bold">₹{amountInrReceived.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
