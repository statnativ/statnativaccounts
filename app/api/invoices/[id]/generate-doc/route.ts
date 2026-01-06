import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } from "docx";
import { formatDisplayDate } from "@/lib/utils/date-helpers";
import { formatCurrency } from "@/lib/utils/calculations";

// POST /api/invoices/[id]/generate-doc - Generate DOC file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Please set up your database connection."
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

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Invoice Header
          new Paragraph({
            text: "INVOICE",
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Invoice Number
          new Paragraph({
            children: [
              new TextRun({ text: "Invoice Number: ", bold: true }),
              new TextRun({ text: invoice.invoiceNumber }),
            ],
            spacing: { after: 100 },
          }),

          // Invoice Date
          new Paragraph({
            children: [
              new TextRun({ text: "Invoice Date: ", bold: true }),
              new TextRun({ text: formatDisplayDate(invoice.invoiceDate) }),
            ],
            spacing: { after: 100 },
          }),

          // Billing Period
          new Paragraph({
            children: [
              new TextRun({ text: "Billing Period: ", bold: true }),
              new TextRun({
                text: `${formatDisplayDate(invoice.billingPeriodStart)} - ${formatDisplayDate(invoice.billingPeriodEnd)}`
              }),
            ],
            spacing: { after: 200 },
          }),

          // Client Information
          new Paragraph({
            children: [
              new TextRun({ text: "Bill To:", bold: true, size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: invoice.clientName,
            spacing: { after: 50 },
          }),
          ...(invoice.clientAddress ? [new Paragraph({
            text: invoice.clientAddress,
            spacing: { after: 200 },
          })] : []),

          // Line Items Table
          new Paragraph({
            text: "Services Rendered:",
            heading: "Heading2",
            spacing: { before: 200, after: 100 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Date", bold: true })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Resource", bold: true })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Description", bold: true })],
                    width: { size: 35, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Hours", bold: true })],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Rate", bold: true })],
                    width: { size: 12, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Amount", bold: true })],
                    width: { size: 13, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Line Items
              ...(invoice.lineItems as any[]).map(item =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(formatDisplayDate(item.date))] }),
                    new TableCell({ children: [new Paragraph(item.resourceName)] }),
                    new TableCell({ children: [new Paragraph(item.description || '-')] }),
                    new TableCell({ children: [new Paragraph(item.hoursWorked.toFixed(2))] }),
                    new TableCell({ children: [new Paragraph(formatCurrency(item.ratePerHour, "USD"))] }),
                    new TableCell({ children: [new Paragraph(formatCurrency(item.amountUsd, "USD"))] }),
                  ],
                })
              ),
            ],
          }),

          // Totals
          new Paragraph({
            children: [
              new TextRun({ text: "\n" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "INVOICE TOTAL (USD): ", bold: true }),
              new TextRun({ text: formatCurrency(invoice.subtotalUsd, "USD"), bold: true }),
            ],
            spacing: { before: 200 },
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Reference Conversion (for information only):", italics: true }),
            ],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Conversion Rate: ₹${Number(invoice.conversionRate).toFixed(2)} = $1.00` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Approximate INR: ≈ ${formatCurrency(invoice.totalInr, "INR")}` }),
            ],
          }),

          // Footer
          new Paragraph({
            text: "\n\nThank you for your business!",
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating DOC:", error);
    return NextResponse.json(
      { error: "Failed to generate DOC file", message: error.message },
      { status: 500 }
    );
  }
}
