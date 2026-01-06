"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign, Filter, RefreshCw, Loader2 } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { PaymentForm } from "@/components/expenses/payment-form";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  date: string;
  description: string;
  amountInr: string;
  paidBy: string;
  category?: string | null;
  isReimbursed: boolean;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    paidBy: "",
    startDate: "",
    endDate: "",
    isReimbursed: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.paidBy) params.append("paidBy", filters.paidBy);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.isReimbursed) params.append("isReimbursed", filters.isReimbursed);

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setExpenses(result.data || []);
      } else {
        throw new Error(result.error || "Failed to fetch expenses");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setFilters({
      paidBy: "",
      startDate: "",
      endDate: "",
      isReimbursed: "",
    });
    setTimeout(() => {
      fetchExpenses();
    }, 0);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track shared business expenses and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPaymentForm(true)} variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter expenses by resource, date range, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select
                value={filters.paidBy || "all"}
                onValueChange={(value) => setFilters({ ...filters, paidBy: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="Amit">Amit</SelectItem>
                  <SelectItem value="Abhilash">Abhilash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.isReimbursed || "all"}
                onValueChange={(value) => setFilters({ ...filters, isReimbursed: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                  <SelectItem value="true">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} size="sm">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
            <Button onClick={fetchExpenses} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <ExpenseList
          expenses={expenses}
          onEdit={handleEdit}
          onRefresh={fetchExpenses}
        />
      )}

      {/* Expense Form Dialog */}
      <ExpenseForm
        open={showExpenseForm}
        onClose={handleCloseExpenseForm}
        onSuccess={fetchExpenses}
        expense={editingExpense}
      />

      {/* Payment Form Dialog */}
      <PaymentForm
        open={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
