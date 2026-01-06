"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckSquare, Square } from "lucide-react";

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function InvoiceForm({ open, onClose, onSuccess, initialStartDate, initialEndDate }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResources, setSelectedResources] = useState<("Amit" | "Abhilash")[]>(["Amit", "Abhilash"]);
  const { toast } = useToast();

  const getDefaultStartDate = () => {
    if (initialStartDate) return new Date(initialStartDate);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  };

  const getDefaultEndDate = () => {
    if (initialEndDate) return new Date(initialEndDate);
    return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date(),
      billingPeriodStart: getDefaultStartDate(),
      billingPeriodEnd: getDefaultEndDate(),
      clientName: "",
      clientAddress: "",
      resources: ["Amit", "Abhilash"],
      conversionRate: 90,
    },
  });

  const toggleResource = (resource: "Amit" | "Abhilash") => {
    setSelectedResources(prev => {
      if (prev.includes(resource)) {
        return prev.filter(r => r !== resource);
      } else {
        return [...prev, resource];
      }
    });
  };

  const onSubmit = async (data: InvoiceFormSchema) => {
    if (selectedResources.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one resource",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          resources: selectedResources,
          invoiceDate: data.invoiceDate.toISOString().split("T")[0],
          billingPeriodStart: data.billingPeriodStart.toISOString().split("T")[0],
          billingPeriodEnd: data.billingPeriodEnd.toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create invoice");
      }

      toast({
        title: "Success",
        description: result.message || "Invoice created successfully",
      });

      reset();
      setSelectedResources(["Amit", "Abhilash"]);
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
    setSelectedResources(["Amit", "Abhilash"]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate an invoice from timesheet entries for the selected period
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingPeriodStart">Billing Period Start *</Label>
              <Input
                id="billingPeriodStart"
                type="date"
                {...register("billingPeriodStart", {
                  setValueAs: (value) => new Date(value),
                })}
              />
              {errors.billingPeriodStart && (
                <p className="text-sm text-destructive">{errors.billingPeriodStart.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPeriodEnd">Billing Period End *</Label>
              <Input
                id="billingPeriodEnd"
                type="date"
                {...register("billingPeriodEnd", {
                  setValueAs: (value) => new Date(value),
                })}
              />
              {errors.billingPeriodEnd && (
                <p className="text-sm text-destructive">{errors.billingPeriodEnd.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input
              id="invoiceDate"
              type="date"
              {...register("invoiceDate", {
                setValueAs: (value) => new Date(value),
              })}
            />
            {errors.invoiceDate && (
              <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Select Resources *</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => toggleResource("Amit")}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
              >
                {selectedResources.includes("Amit") ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Amit
              </button>
              <button
                type="button"
                onClick={() => toggleResource("Abhilash")}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
              >
                {selectedResources.includes("Abhilash") ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Abhilash
              </button>
            </div>
            {selectedResources.length === 0 && (
              <p className="text-sm text-destructive">Select at least one resource</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              placeholder="e.g., Acme Corp"
              {...register("clientName")}
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address</Label>
            <Input
              id="clientAddress"
              placeholder="123 Main St, City, State, ZIP"
              {...register("clientAddress")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversionRate">Conversion Rate (INR per USD) *</Label>
            <Input
              id="conversionRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="90"
              {...register("conversionRate", { valueAsNumber: true })}
            />
            {errors.conversionRate && (
              <p className="text-sm text-destructive">{errors.conversionRate.message}</p>
            )}
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
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
