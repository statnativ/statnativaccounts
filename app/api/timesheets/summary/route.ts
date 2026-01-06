import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { timesheets } from "@/lib/db/schema";
import { and, gte, lte, sql } from "drizzle-orm";

// GET /api/timesheets/summary - Get summary statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions = [];
    if (startDate) {
      conditions.push(gte(timesheets.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(timesheets.date, endDate));
    }

    // Get summary by resource
    const summary = await db
      .select({
        resourceName: timesheets.resourceName,
        totalHours: sql<number>`SUM(CAST(${timesheets.hoursWorked} AS DECIMAL))`,
        totalAmount: sql<number>`SUM(CAST(${timesheets.hoursWorked} AS DECIMAL) * CAST(${timesheets.hourlyRate} AS DECIMAL))`,
        entryCount: sql<number>`COUNT(*)`,
      })
      .from(timesheets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(timesheets.resourceName);

    // Calculate grand totals
    const grandTotal = summary.reduce(
      (acc, curr) => ({
        totalHours: acc.totalHours + Number(curr.totalHours),
        totalAmount: acc.totalAmount + Number(curr.totalAmount),
        entryCount: acc.entryCount + Number(curr.entryCount),
      }),
      { totalHours: 0, totalAmount: 0, entryCount: 0 }
    );

    return NextResponse.json({
      data: {
        byResource: summary,
        grandTotal,
      },
    });
  } catch (error) {
    console.error("Error fetching timesheet summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
