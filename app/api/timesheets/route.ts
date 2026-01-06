import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { timesheets } from "@/lib/db/schema";
import { timesheetSchema } from "@/lib/utils/validation";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

// GET /api/timesheets - List timesheets with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resourceName = searchParams.get("resourceName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = db.select().from(timesheets);

    // Apply filters
    const conditions = [];
    if (resourceName) {
      conditions.push(eq(timesheets.resourceName, resourceName as "Amit" | "Abhilash"));
    }
    if (startDate) {
      conditions.push(gte(timesheets.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(timesheets.date, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(timesheets.date))
      .limit(limit);

    return NextResponse.json({ data: results, count: results.length });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch timesheets" },
      { status: 500 }
    );
  }
}

// POST /api/timesheets - Create a new timesheet entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = timesheetSchema.parse({
      ...body,
      date: new Date(body.date),
    });

    // Check for duplicate entry (same date and resource)
    const existing = await db
      .select()
      .from(timesheets)
      .where(
        and(
          eq(timesheets.date, validatedData.date.toISOString().split("T")[0]),
          eq(timesheets.resourceName, validatedData.resourceName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A timesheet entry already exists for this date and resource" },
        { status: 400 }
      );
    }

    // Create timesheet entry
    const [newTimesheet] = await db
      .insert(timesheets)
      .values({
        date: validatedData.date.toISOString().split("T")[0],
        resourceName: validatedData.resourceName,
        hoursWorked: validatedData.hoursWorked.toString(),
        hourlyRate: validatedData.hourlyRate.toString(),
        projectName: validatedData.projectName,
        clientName: validatedData.clientName,
        description: validatedData.description,
      })
      .returning();

    return NextResponse.json(
      { data: newTimesheet, message: "Timesheet entry created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating timesheet:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create timesheet entry" },
      { status: 500 }
    );
  }
}
