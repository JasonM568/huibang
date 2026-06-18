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
    const quoteId = searchParams.get("quoteId");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (invoiceStatus) conditions.push(eq(invoices.invoiceStatus, invoiceStatus));
    if (paymentStatus) conditions.push(eq(invoices.paymentStatus, paymentStatus));
    if (quoteId) conditions.push(eq(invoices.quoteId, quoteId));

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const data = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        quoteNumber: quotes.quoteNumber,
        customerName: customers.companyName,
        installmentNo: invoices.installmentNo,
        installmentLabel: invoices.installmentLabel,
        installmentPercent: invoices.installmentPercent,
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

    const qSub = Number(quote.subtotal);
    const qTax = Number(quote.taxAmount);
    const qTotal = Number(quote.totalAmount);

    // 統計此報價單「已請款」比例與金額（全額單計為 100%，分期單以 installmentPercent 累計）
    const existing = await db
      .select({
        installmentNo: invoices.installmentNo,
        installmentPercent: invoices.installmentPercent,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
      })
      .from(invoices)
      .where(eq(invoices.quoteId, quote.id));

    let billedPercent = 0;
    let billedSub = 0;
    let billedTax = 0;
    let billedTotal = 0;
    let maxNo = 0;
    for (const e of existing) {
      billedPercent += e.installmentNo ? Number(e.installmentPercent || 0) : 100;
      billedSub += Number(e.subtotal);
      billedTax += Number(e.taxAmount);
      billedTotal += Number(e.totalAmount);
      if (e.installmentNo) maxNo = Math.max(maxNo, e.installmentNo);
    }
    billedPercent = round2(billedPercent);

    if (billedPercent >= 99.995) {
      return NextResponse.json(
        { error: "此報價單已全額請款，無法再開立請款單" },
        { status: 400 }
      );
    }

    // ===== 分期請款：installments = [{ label, percent }]，每列產生一張本期請款單 =====
    const installments = Array.isArray(body.installments) ? body.installments : null;
    if (installments && installments.length > 0) {
      for (const i of installments) {
        if (!(Number(i.percent) > 0)) {
          return NextResponse.json({ error: "每期百分比需大於 0" }, { status: 400 });
        }
      }
      const sumNew = round2(
        installments.reduce((s: number, i: { percent: number | string }) => s + Number(i.percent), 0)
      );
      if (round2(billedPercent + sumNew) > 100.005) {
        return NextResponse.json(
          {
            error: `超過報價單可請款比例：已請款 ${billedPercent}%，最多再請 ${round2(100 - billedPercent)}%`,
          },
          { status: 400 }
        );
      }

      const baseNumber = generateInvoiceNumber(customerName);
      const created = [];
      // 從「已請款」基準往上累計，使最後補足 100% 的那一期吸收尾差
      let cumPercent = billedPercent;
      let cumSub = billedSub;
      let cumTax = billedTax;
      let cumTotal = billedTotal;

      for (let idx = 0; idx < installments.length; idx++) {
        const pct = Number(installments[idx].percent);
        cumPercent = round2(cumPercent + pct);
        const reaches100 = cumPercent >= 99.995;
        const sub = reaches100 ? round2(qSub - cumSub) : round2((qSub * pct) / 100);
        const tax = reaches100 ? round2(qTax - cumTax) : round2((qTax * pct) / 100);
        const total = reaches100 ? round2(qTotal - cumTotal) : round2((qTotal * pct) / 100);
        cumSub = round2(cumSub + sub);
        cumTax = round2(cumTax + tax);
        cumTotal = round2(cumTotal + total);

        const no = maxNo + idx + 1;
        const label = (installments[idx].label && String(installments[idx].label).trim()) || `第${no}期款`;

        const [invoice] = await db
          .insert(invoices)
          .values({
            invoiceNumber: `${baseNumber}-P${no}`,
            quoteId: quote.id,
            customerId: quote.customerId,
            userId: session.userId,
            subtotal: String(sub),
            taxAmount: String(tax),
            totalAmount: String(total),
            installmentNo: no,
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

      // 達 100% → 已轉請款；未達 → 分期請款中（仍可繼續開下一期）
      await db
        .update(quotes)
        .set({
          status: cumPercent >= 99.995 ? "invoiced" : "partial",
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      return NextResponse.json(
        { installments: created, count: created.length, first: created[0], billedPercent: cumPercent },
        { status: 201 }
      );
    }

    // ===== 全額請款（僅在尚未請款時）=====
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
