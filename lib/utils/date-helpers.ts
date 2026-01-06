import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

export function formatDate(date: Date | string, formatString: string = "yyyy-MM-dd"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

export function formatDisplayDate(date: Date | string): string {
  return formatDate(date, "MMM dd, yyyy");
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getCurrentFiscalYear(): { year: string; start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = year + 1;

  return {
    year: `FY${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`,
    start: new Date(year, 3, 1), // April 1st
    end: new Date(nextYear, 2, 31), // March 31st
  };
}

export function parseDateString(dateString: string): Date {
  return parseISO(dateString);
}
