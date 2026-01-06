"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormSchema } from "@/lib/utils/validation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  description: string;
  amountInr: string;
  paidBy: string;
  category?: string | null;
  isReimbursed: boolean;
}

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null;
}

export function ExpenseForm({ open, onClose, onSuccess, expense }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          date: new Date(expense.date),
          description: expense.description,
          amountInr: Number(expense.amountInr),
          paidBy: expense.paidBy as "Amit" | "Abhilash",
          category: expense.category || "",
        }
      : {
          date: new Date(),
          description: "",
          amountInr: 0,
          paidBy: "Amit",
          category: "",
        },
  });

  const paidBy = watch("paidBy");

  const onSubmit = async (data: ExpenseFormSchema) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? "update" : "create"} expense`);
      }

      toast({
        title: "Success",
        description: result.message || `Expense ${isEditing ? "updated" : "created"} successfully`,
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update expense details" : "Record a business expense"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register("date", {
                setValueAs: (value) => new Date(value),
              })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Office supplies, Software subscription"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountInr">Amount (INR) *</Label>
            <Input
              id="amountInr"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amountInr", { valueAsNumber: true })}
            />
            {errors.amountInr && (
              <p className="text-sm text-destructive">{errors.amountInr.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By *</Label>
            <Select
              value={paidBy}
              onValueChange={(value) => setValue("paidBy", value as "Amit" | "Abhilash")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amit">Amit</SelectItem>
                <SelectItem value="Abhilash">Abhilash</SelectItem>
              </SelectContent>
            </Select>
            {errors.paidBy && (
              <p className="text-sm text-destructive">{errors.paidBy.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Office, Software, Travel"
              {...register("category")}
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
              {isEditing ? "Update Expense" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
