"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { timesheetSchema, type TimesheetFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TimesheetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function TimesheetForm({ open, onClose, onSuccess, initialData }: TimesheetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimesheetFormSchema>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: initialData
      ? {
          date: new Date(initialData.date),
          resourceName: initialData.resourceName,
          hoursWorked: Number(initialData.hoursWorked),
          hourlyRate: Number(initialData.hourlyRate) || 45,
          projectName: initialData.projectName || "",
          clientName: initialData.clientName || "",
          description: initialData.description || "",
        }
      : {
          date: new Date(),
          resourceName: "Amit",
          hoursWorked: 8,
          hourlyRate: 45,
          projectName: "",
          clientName: "",
          description: "",
        },
  });

  const resourceName = watch("resourceName");

  const onSubmit = async (data: TimesheetFormSchema) => {
    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/timesheets/${initialData.id}`
        : "/api/timesheets";
      const method = initialData ? "PUT" : "POST";

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
        throw new Error(result.error || "Failed to save timesheet");
      }

      toast({
        title: "Success",
        description: result.message || "Timesheet saved successfully",
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
          <DialogTitle>
            {initialData ? "Edit Timesheet Entry" : "Add Timesheet Entry"}
          </DialogTitle>
          <DialogDescription>
            Record daily work hours for a resource
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
            <Label htmlFor="resourceName">Resource *</Label>
            <Select
              value={resourceName}
              onValueChange={(value) => setValue("resourceName", value as "Amit" | "Abhilash")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amit">Amit</SelectItem>
                <SelectItem value="Abhilash">Abhilash</SelectItem>
              </SelectContent>
            </Select>
            {errors.resourceName && (
              <p className="text-sm text-destructive">{errors.resourceName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Hours Worked *</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.5"
                min="0"
                max="24"
                {...register("hoursWorked", { valueAsNumber: true })}
              />
              {errors.hoursWorked && (
                <p className="text-sm text-destructive">{errors.hoursWorked.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                {...register("hourlyRate", { valueAsNumber: true })}
              />
              {errors.hourlyRate && (
                <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g., Project Alpha"
              {...register("projectName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="e.g., Acme Corp"
              {...register("clientName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of work done"
              {...register("description")}
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
              {initialData ? "Update" : "Create"} Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
