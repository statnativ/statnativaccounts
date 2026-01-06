import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { invoices, timesheets } from "@/lib/db/schema";
import { invoiceSchema } from "@/lib/utils/validation";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { generateInvoiceNumber } from "@/lib/utils/calculations";

// GET /api/invoices - List invoices with optional filters
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
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = db.select().from(invoices);

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(invoices.status, status as any));
    }
    if (startDate) {
      conditions.push(gte(invoices.invoiceDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(invoices.invoiceDate, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(invoices.invoiceDate))
      .limit(limit);

    return NextResponse.json({ data: results, count: results.length });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice from timesheet data
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
    const validatedData = invoiceSchema.parse({
      ...body,
      invoiceDate: new Date(body.invoiceDate),
      billingPeriodStart: new Date(body.billingPeriodStart),
      billingPeriodEnd: new Date(body.billingPeriodEnd),
    });

    // Fetch timesheet data for the billing period and selected resources
    const timesheetData = await db
      .select()
      .from(timesheets)
      .where(
        and(
          gte(timesheets.date, validatedData.billingPeriodStart.toISOString().split("T")[0]),
          lte(timesheets.date, validatedData.billingPeriodEnd.toISOString().split("T")[0])
        )
      )
      .orderBy(timesheets.date);

    // Filter by selected resources
    const filteredTimesheets = timesheetData.filter(ts =>
      validatedData.resources.includes(ts.resourceName as any)
    );

    if (filteredTimesheets.length === 0) {
      return NextResponse.json(
        { error: "No timesheet entries found for the selected period and resources" },
        { status: 400 }
      );
    }

    // Build line items from timesheet data
    const lineItems = filteredTimesheets.map(ts => ({
      date: ts.date,
      resourceName: ts.resourceName,
      description: ts.description || `${ts.projectName || 'Work'} - ${ts.clientName || 'Client'}`,
      hoursWorked: Number(ts.hoursWorked),
      ratePerHour: Number(ts.hourlyRate),
      amountUsd: Number(ts.hoursWorked) * Number(ts.hourlyRate),
    }));

    // Calculate totals
    const subtotalUsd = lineItems.reduce((sum, item) => sum + item.amountUsd, 0);
    const totalInr = subtotalUsd * validatedData.conversionRate;

    // Generate invoice number
    // Get the latest invoice to determine sequence number
    const latestInvoice = await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    const sequenceNumber = latestInvoice.length > 0
      ? parseInt(latestInvoice[0].invoiceNumber.split("-").pop() || "1000") + 1
      : 1001;

    const invoiceNumber = generateInvoiceNumber(
      validatedData.resources.join("_"),
      validatedData.invoiceDate,
      sequenceNumber
    );

    // Create invoice
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        invoiceDate: validatedData.invoiceDate.toISOString().split("T")[0],
        billingPeriodStart: validatedData.billingPeriodStart.toISOString().split("T")[0],
        billingPeriodEnd: validatedData.billingPeriodEnd.toISOString().split("T")[0],
        clientName: validatedData.clientName,
        clientAddress: validatedData.clientAddress,
        resources: validatedData.resources,
        lineItems,
        subtotalUsd: subtotalUsd.toString(),
        conversionRate: validatedData.conversionRate.toString(),
        totalInr: totalInr.toString(),
        status: "Draft",
      })
      .returning();

    return NextResponse.json(
      { data: newInvoice, message: "Invoice created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating invoice:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice", message: error.message },
      { status: 500 }
    );
  }
}
