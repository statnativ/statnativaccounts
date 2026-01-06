import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/invoices/[id] - Get a single invoice
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
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, params.id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: invoice });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice status
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

    // Check if invoice exists
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Update invoice
    const updateData: any = { updatedAt: new Date() };

    if (body.status) updateData.status = body.status;
    if (body.paidDate) updateData.paidDate = body.paidDate;
    if (body.docUrl) updateData.docUrl = body.docUrl;
    if (body.pdfUrl) updateData.pdfUrl = body.pdfUrl;

    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, params.id))
      .returning();

    return NextResponse.json({
      data: updatedInvoice,
      message: "Invoice updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
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

    // Check if invoice exists
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Delete invoice
    await db.delete(invoices).where(eq(invoices.id, params.id));

    return NextResponse.json({
      message: "Invoice deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice", message: error.message },
      { status: 500 }
    );
  }
}
