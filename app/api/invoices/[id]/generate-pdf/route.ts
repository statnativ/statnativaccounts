import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, getDatabase } from "@/lib/db/drizzle";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDisplayDate } from "@/lib/utils/date-helpers";
import { formatCurrency } from "@/lib/utils/calculations";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: 120,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  col1: { width: "12%", fontSize: 9 },
  col2: { width: "15%", fontSize: 9 },
  col3: { width: "33%", fontSize: 9 },
  col4: { width: "10%", fontSize: 9, textAlign: "right" },
  col5: { width: "13%", fontSize: 9, textAlign: "right" },
  col6: { width: "17%", fontSize: 9, textAlign: "right" },
  totals: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 5,
    width: 250,
  },
  totalLabel: {
    fontWeight: "bold",
    width: 150,
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 8,
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

// POST /api/invoices/[id]/generate-pdf - Generate PDF file
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

    // Create PDF Document
    const InvoicePDF = () => (
      React.createElement(Document, {},
        React.createElement(Page, { size: "A4", style: styles.page },
          // Header
          React.createElement(Text, { style: styles.header }, "INVOICE"),

          // Invoice Details
          React.createElement(View, { style: styles.section },
            React.createElement(View, { style: styles.row },
              React.createElement(Text, { style: styles.label }, "Invoice Number:"),
              React.createElement(Text, { style: styles.value }, invoice.invoiceNumber)
            ),
            React.createElement(View, { style: styles.row },
              React.createElement(Text, { style: styles.label }, "Invoice Date:"),
              React.createElement(Text, { style: styles.value }, formatDisplayDate(invoice.invoiceDate))
            ),
            React.createElement(View, { style: styles.row },
              React.createElement(Text, { style: styles.label }, "Billing Period:"),
              React.createElement(Text, { style: styles.value },
                `${formatDisplayDate(invoice.billingPeriodStart)} - ${formatDisplayDate(invoice.billingPeriodEnd)}`
              )
            )
          ),

          // Client Info
          React.createElement(View, { style: styles.section },
            React.createElement(Text, { style: { fontWeight: "bold", marginBottom: 5 } }, "Bill To:"),
            React.createElement(Text, {}, invoice.clientName),
            invoice.clientAddress && React.createElement(Text, {}, invoice.clientAddress)
          ),

          // Services Table
          React.createElement(Text, { style: { fontWeight: "bold", fontSize: 13, marginTop: 20, marginBottom: 10 } },
            "Services Rendered:"
          ),

          React.createElement(View, { style: styles.table },
            // Table Header
            React.createElement(View, { style: styles.tableHeader },
              React.createElement(Text, { style: styles.col1 }, "Date"),
              React.createElement(Text, { style: styles.col2 }, "Resource"),
              React.createElement(Text, { style: styles.col3 }, "Description"),
              React.createElement(Text, { style: styles.col4 }, "Hours"),
              React.createElement(Text, { style: styles.col5 }, "Rate"),
              React.createElement(Text, { style: styles.col6 }, "Amount")
            ),

            // Table Rows
            ...(invoice.lineItems as any[]).map((item: any, index: number) =>
              React.createElement(View, { key: index, style: styles.tableRow },
                React.createElement(Text, { style: styles.col1 }, formatDisplayDate(item.date)),
                React.createElement(Text, { style: styles.col2 }, item.resourceName),
                React.createElement(Text, { style: styles.col3 }, item.description || '-'),
                React.createElement(Text, { style: styles.col4 }, item.hoursWorked.toFixed(2)),
                React.createElement(Text, { style: styles.col5 }, formatCurrency(item.ratePerHour, "USD")),
                React.createElement(Text, { style: styles.col6 }, formatCurrency(item.amountUsd, "USD"))
              )
            )
          ),

          // Totals
          React.createElement(View, { style: styles.totals },
            React.createElement(View, { style: styles.totalRow },
              React.createElement(Text, { style: styles.totalLabel }, "Subtotal (USD):"),
              React.createElement(Text, { style: styles.totalValue }, formatCurrency(invoice.subtotalUsd, "USD"))
            ),
            React.createElement(View, { style: styles.totalRow },
              React.createElement(Text, { style: styles.totalLabel }, "Conversion Rate:"),
              React.createElement(Text, { style: styles.totalValue }, `₹${Number(invoice.conversionRate).toFixed(2)} = $1`)
            ),
            React.createElement(View, { style: [styles.totalRow, styles.grandTotal] },
              React.createElement(Text, { style: styles.totalLabel }, "Total (INR):"),
              React.createElement(Text, { style: styles.totalValue }, formatCurrency(invoice.totalInr, "INR"))
            )
          ),

          // Footer
          React.createElement(Text, { style: styles.footer }, "Thank you for your business!")
        )
      )
    );

    // Generate PDF stream
    const pdfStream = await renderToStream(React.createElement(InvoicePDF));

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF file", message: error.message },
      { status: 500 }
    );
  }
}
