"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Filter, FileText } from "lucide-react";
import { TimesheetForm } from "@/components/timesheets/timesheet-form";
import { TimesheetList } from "@/components/timesheets/timesheet-list";
import { TimesheetSummary } from "@/components/timesheets/timesheet-summary";
import { useToast } from "@/hooks/use-toast";
import { getMonthRange } from "@/lib/utils/date-helpers";

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [filterResource, setFilterResource] = useState<string>("all");
  const { toast } = useToast();
  const router = useRouter();

  // Get current month range
  const currentMonth = getMonthRange();
  const [dateRange, setDateRange] = useState({
    startDate: currentMonth.start.toISOString().split("T")[0],
    endDate: currentMonth.end.toISOString().split("T")[0],
  });

  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      if (filterResource !== "all") {
        params.append("resourceName", filterResource);
      }

      const response = await fetch(`/api/timesheets?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch timesheets");
      }

      setTimesheets(result.data);
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

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/timesheets/summary?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch summary");
      }

      setSummary(result.data);
    } catch (error: any) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchTimesheets();
    fetchSummary();
  }, [dateRange, filterResource]);

  const handleSuccess = () => {
    fetchTimesheets();
    fetchSummary();
  };

  const handleEdit = (timesheet: any) => {
    setEditingTimesheet(timesheet);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTimesheet(null);
  };

  const handleCreateInvoice = () => {
    // Check if there are timesheets in the current range
    if (timesheets.length === 0) {
      toast({
        title: "No Timesheets",
        description: "There are no timesheet entries in the selected date range to create an invoice.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to invoices page - the user can create invoice there with the date range
    router.push(`/invoices?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground">Track daily work hours for each resource</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchTimesheets}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleCreateInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterResource} onValueChange={setFilterResource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="Amit">Amit</SelectItem>
              <SelectItem value="Abhilash">Abhilash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <TimesheetSummary summary={summary} />

      {/* Timesheet List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TimesheetList
          timesheets={timesheets}
          onEdit={handleEdit}
          onRefresh={handleSuccess}
        />
      )}

      {/* Timesheet Form Dialog */}
      <TimesheetForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        initialData={editingTimesheet}
      />
    </div>
  );
}
