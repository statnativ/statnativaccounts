import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { expenses } from "@/lib/db/schema";
import { expenseSchema } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";

// GET /api/expenses/[id] - Get a single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Please set up your database connection. See SETUP.md for instructions."
        },
        { status: 503 }
      );
    }

    const db = getDatabase();
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, params.id))
      .limit(1);

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: expense });
  } catch (error: any) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Please set up your database connection. See SETUP.md for instructions."
        },
        { status: 503 }
      );
    }

    const db = getDatabase();
    const body = await request.json();

    // Check if expense exists
    const [existing] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validatedData = expenseSchema.parse({
      ...body,
      date: new Date(body.date),
    });

    // Update expense
    const [updatedExpense] = await db
      .update(expenses)
      .set({
        date: validatedData.date.toISOString().split("T")[0],
        description: validatedData.description,
        amountInr: validatedData.amountInr.toString(),
        paidBy: validatedData.paidBy,
        category: validatedData.category,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, params.id))
      .returning();

    return NextResponse.json({
      data: updatedExpense,
      message: "Expense updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating expense:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update expense", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Please set up your database connection. See SETUP.md for instructions."
        },
        { status: 503 }
      );
    }

    const db = getDatabase();

    // Check if expense exists
    const [existing] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Delete expense
    await db.delete(expenses).where(eq(expenses.id, params.id));

    return NextResponse.json({
      message: "Expense deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense", message: error.message },
      { status: 500 }
    );
  }
}
