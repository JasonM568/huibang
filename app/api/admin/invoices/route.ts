import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, quotes, customers, adminUsers, ledgerEntries } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireRestrictedAccess } from "@/lib/auth";

function generateInvoiceNumber(customerName: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INV-${customerName}-${y}${m}${d}-${rand}`;
}

export async function GET(request: Request) {
  try {
    await requireRestrictedAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const invoiceStatus = searchParams.get("invoiceStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (invoiceStatus) conditions.push(eq(invoices.invoiceStatus, invoiceStatus));
    if (paymentStatus) conditions.push(eq(invoices.paymentStatus, paymentStatus));

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const data = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        quoteNumber: quotes.quoteNumber,
        customerName: customers.companyName,
        installmentLabel: invoices.installmentLabel,
        totalAmount: invoices.totalAmount,
        invoiceStatus: invoices.invoiceStatus,
        issuedDate: invoices.issuedDate,
        sentDate: invoices.sentDate,
        paymentStatus: invoices.paymentStatus,
        paidDate: invoices.paidDate,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(quotes, eq(invoices.quoteId, quotes.id))
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(where);

    const count = countResult[0].count;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Invoices list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 從報價單建立請款單
export async function POST(request: Request) {
  try {
    const session = await requireRestrictedAccess();
    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quoteId" }, { status: 400 });
    }

    // 取得報價單資料
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId));

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Fetch customer name for invoice number
    const [customer] = await db
      .select({ companyName: customers.companyName })
      .from(customers)
      .where(eq(customers.id, quote.customerId));
    const customerName = customer?.companyName || "未知客戶";

    const round2 = (n: number) => Math.round(n * 100) / 100;

    // ===== 分期請款：installments = [{ label, percent }] =====
    const installments = Array.isArray(body.installments) ? body.installments : null;
    if (installments && installments.length > 0) {
      const totalPercent = installments.reduce(
        (s: number, i: { percent: number | string }) => s + Number(i.percent),
        0
      );
      if (Math.abs(totalPercent - 100) > 0.01) {
        return NextResponse.json(
          { error: "分期百分比總和必須為 100%" },
          { status: 400 }
        );
      }

      const qSub = Number(quote.subtotal);
      const qTax = Number(quote.taxAmount);
      const qTotal = Number(quote.totalAmount);
      const baseNumber = generateInvoiceNumber(customerName);

      const created = [];
      let accSub = 0;
      let accTax = 0;
      let accTotal = 0;

      for (let idx = 0; idx < installments.length; idx++) {
        const inst = installments[idx];
        const pct = Number(inst.percent);
        const isLast = idx === installments.length - 1;
        // 最後一期吸收四捨五入尾差，確保各期總和精確等於報價單總額
        const sub = isLast ? round2(qSub - accSub) : round2((qSub * pct) / 100);
        const tax = isLast ? round2(qTax - accTax) : round2((qTax * pct) / 100);
        const total = isLast ? round2(qTotal - accTotal) : round2((qTotal * pct) / 100);
        if (!isLast) {
          accSub += sub;
          accTax += tax;
          accTotal += total;
        }
        const label = (inst.label && String(inst.label).trim()) || `第${idx + 1}期款`;

        const [invoice] = await db
          .insert(invoices)
          .values({
            invoiceNumber: `${baseNumber}-P${idx + 1}`,
            quoteId: quote.id,
            customerId: quote.customerId,
            userId: session.userId,
            subtotal: String(sub),
            taxAmount: String(tax),
            totalAmount: String(total),
            installmentNo: idx + 1,
            installmentLabel: label,
            installmentPercent: String(pct),
            notes: body.notes || null,
          })
          .returning();

        await db.insert(ledgerEntries).values({
          type: "receivable",
          invoiceRefId: invoice.id,
          description: `請款單 ${invoice.invoiceNumber}（${customerName}）${label}`,
          amount: String(total),
          counterparty: customerName,
          invoiceNo: null,
          invoiceDate: null,
          paymentStatus: "pending_receive",
          transactionDate: null,
        });

        created.push(invoice);
      }

      await db
        .update(quotes)
        .set({ status: "invoiced", updatedAt: new Date() })
        .where(eq(quotes.id, quote.id));

      return NextResponse.json(
        { installments: created, count: created.length, first: created[0] },
        { status: 201 }
      );
    }

    // ===== 全額請款（維持原行為）=====
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber: generateInvoiceNumber(customerName),
        quoteId: quote.id,
        customerId: quote.customerId,
        userId: session.userId,
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        totalAmount: quote.totalAmount,
        notes: body.notes || null,
      })
      .returning();

    // 自動建立收支表 — 應收帳款
    await db.insert(ledgerEntries).values({
      type: "receivable",
      invoiceRefId: invoice.id,
      description: `請款單 ${invoice.invoiceNumber}（${customerName}）`,
      amount: quote.totalAmount,
      counterparty: customerName,
      invoiceNo: null,
      invoiceDate: null,
      paymentStatus: "pending_receive",
      transactionDate: null,
    });

    // 來源報價單狀態自動更新為「轉請款單」
    await db
      .update(quotes)
      .set({ status: "invoiced", updatedAt: new Date() })
      .where(eq(quotes.id, quote.id));

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
