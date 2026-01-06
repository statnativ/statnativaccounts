import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { expenses } from "@/lib/db/schema";
import { expenseSchema } from "@/lib/utils/validation";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

// GET /api/expenses - List expenses with optional filters
export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const paidBy = searchParams.get("paidBy");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isReimbursed = searchParams.get("isReimbursed");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = db.select().from(expenses);

    // Apply filters
    const conditions = [];
    if (paidBy) {
      conditions.push(eq(expenses.paidBy, paidBy as "Amit" | "Abhilash"));
    }
    if (startDate) {
      conditions.push(gte(expenses.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, endDate));
    }
    if (isReimbursed !== null && isReimbursed !== undefined) {
      conditions.push(eq(expenses.isReimbursed, isReimbursed === "true"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(expenses.date))
      .limit(limit);

    return NextResponse.json({ data: results, count: results.length });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
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

    // Validate input
    const validatedData = expenseSchema.parse({
      ...body,
      date: new Date(body.date),
    });

    // Create expense entry
    const [newExpense] = await db
      .insert(expenses)
      .values({
        date: validatedData.date.toISOString().split("T")[0],
        description: validatedData.description,
        amountInr: validatedData.amountInr.toString(),
        paidBy: validatedData.paidBy,
        category: validatedData.category,
        isReimbursed: false,
      })
      .returning();

    return NextResponse.json(
      { data: newExpense, message: "Expense created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating expense:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create expense", message: error.message },
      { status: 500 }
    );
  }
}
