import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { payments, invoices } from "@/lib/db/schema";
import { paymentSchema } from "@/lib/utils/validation";
import { eq, and, gte, lte } from "drizzle-orm";

// GET /api/payments - List all payments with optional filters
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
    const { searchParams } = new URL(request.url);

    const invoiceId = searchParams.get("invoiceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let conditions = [];

    if (invoiceId) {
      conditions.push(eq(payments.invoiceId, invoiceId));
    }

    if (startDate) {
      conditions.push(gte(payments.paymentDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(payments.paymentDate, endDate));
    }

    const query = conditions.length > 0
      ? db.select().from(payments).where(and(...conditions))
      : db.select().from(payments);

    const allPayments = await query;

    return NextResponse.json({ data: allPayments });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment
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
    const validatedData = paymentSchema.parse({
      ...body,
      paymentDate: new Date(body.paymentDate),
    });

    // Check if invoice exists
    if (validatedData.invoiceId) {
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, validatedData.invoiceId))
        .limit(1);

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
    }

    // Calculate amounts
    const amountUsdReceived = validatedData.amountUsdInvoiced - validatedData.bankChargesUsd;
    const amountInrReceived = amountUsdReceived * validatedData.conversionRate;

    // Create payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        invoiceId: validatedData.invoiceId || null,
        paymentDate: validatedData.paymentDate.toISOString().split("T")[0],
        amountUsdInvoiced: validatedData.amountUsdInvoiced.toString(),
        bankChargesUsd: validatedData.bankChargesUsd.toString(),
        amountUsdReceived: amountUsdReceived.toString(),
        conversionRate: validatedData.conversionRate.toString(),
        amountInrReceived: amountInrReceived.toString(),
        notes: validatedData.notes || null,
      })
      .returning();

    // Update invoice status to Paid if invoice is linked
    if (validatedData.invoiceId) {
      await db
        .update(invoices)
        .set({
          status: "Paid",
          paidDate: validatedData.paymentDate.toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, validatedData.invoiceId));
    }

    return NextResponse.json(
      {
        data: newPayment,
        message: "Payment recorded successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating payment:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment", message: error.message },
      { status: 500 }
    );
  }
}
