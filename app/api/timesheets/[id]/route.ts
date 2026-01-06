import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { timesheets } from "@/lib/db/schema";
import { timesheetSchema } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";

// GET /api/timesheets/[id] - Get a single timesheet entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [timesheet] = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, params.id))
      .limit(1);

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: timesheet });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch timesheet entry" },
      { status: 500 }
    );
  }
}

// PUT /api/timesheets/[id] - Update a timesheet entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = timesheetSchema.parse({
      ...body,
      date: new Date(body.date),
    });

    // Check if timesheet exists
    const [existing] = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Timesheet entry not found" },
        { status: 404 }
      );
    }

    // Update timesheet entry
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set({
        date: validatedData.date.toISOString().split("T")[0],
        resourceName: validatedData.resourceName,
        hoursWorked: validatedData.hoursWorked.toString(),
        hourlyRate: validatedData.hourlyRate.toString(),
        projectName: validatedData.projectName,
        clientName: validatedData.clientName,
        description: validatedData.description,
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, params.id))
      .returning();

    return NextResponse.json({
      data: updatedTimesheet,
      message: "Timesheet entry updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating timesheet:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update timesheet entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/timesheets/[id] - Delete a timesheet entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if timesheet exists
    const [existing] = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Timesheet entry not found" },
        { status: 404 }
      );
    }

    // Delete timesheet entry
    await db.delete(timesheets).where(eq(timesheets.id, params.id));

    return NextResponse.json({
      message: "Timesheet entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    return NextResponse.json(
      { error: "Failed to delete timesheet entry" },
      { status: 500 }
    );
  }
}
