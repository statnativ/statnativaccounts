"use client";

import { useState } from "react";
import { formatDisplayDate } from "@/lib/utils/date-helpers";
import { formatCurrency, formatHours } from "@/lib/utils/calculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimesheetEntry {
  id: string;
  date: string;
  resourceName: string;
  hoursWorked: string;
  hourlyRate: string;
  projectName?: string;
  clientName?: string;
  description?: string;
}

interface TimesheetListProps {
  timesheets: TimesheetEntry[];
  onEdit: (timesheet: TimesheetEntry) => void;
  onRefresh: () => void;
}

export function TimesheetList({ timesheets, onEdit, onRefresh }: TimesheetListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/timesheets/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete timesheet");
      }

      toast({
        title: "Success",
        description: "Timesheet entry deleted successfully",
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

  if (timesheets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No timesheet entries found</p>
          <p className="text-sm text-muted-foreground">
            Click "Add Entry" to create your first timesheet entry
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Entries</CardTitle>
          <CardDescription>
            {timesheets.length} {timesheets.length === 1 ? "entry" : "entries"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((entry) => {
                  const hours = Number(entry.hoursWorked);
                  const rate = Number(entry.hourlyRate);
                  const amount = hours * rate;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {formatDisplayDate(entry.date)}
                      </TableCell>
                      <TableCell>{entry.resourceName}</TableCell>
                      <TableCell>{formatHours(hours)}</TableCell>
                      <TableCell>{formatCurrency(rate, "USD")}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(amount, "USD")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.projectName || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.clientName || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timesheet Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timesheet entry? This action cannot be undone.
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
