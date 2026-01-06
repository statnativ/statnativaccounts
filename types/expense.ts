import { ResourceName } from "./timesheet";

export interface Expense {
  id: string;
  date: Date;
  description: string;
  amountInr: number;
  paidBy: ResourceName;
  category?: string;
  isReimbursed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  date: Date;
  description: string;
  amountInr: number;
  paidBy: ResourceName;
  category?: string;
}
