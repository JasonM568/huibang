import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { issueInvoice } from "@/lib/ezpay";

// GET: 單筆訂單詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.id));
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: 重新開立發票
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.id));

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "訂單尚未付款" },
        { status: 400 }
      );
    }
    if (order.invoiceStatus === "issued") {
      return NextResponse.json(
        { error: "發票已開立" },
        { status: 400 }
      );
    }

    // 更新為 pending
    await db
      .update(orders)
      .set({ invoiceStatus: "pending", updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    const result = await issueInvoice({
      orderNo: order.orderNo,
      amount: order.amount,
      itemName: order.itemName || "惠邦行銷服務",
      itemCount: 1,
      itemUnit: "組",
      buyerEmail: order.customerEmail,
      carrierType: order.carrierType,
      carrierNum: order.carrierNum,
    });

    if (result.success) {
      await db
        .update(orders)
        .set({
          invoiceStatus: "issued",
          invoiceNo: result.invoiceNo || null,
          invoiceError: null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
      return NextResponse.json({
        success: true,
        invoiceNo: result.invoiceNo,
      });
    } else {
      await db
        .update(orders)
        .set({
          invoiceStatus: "failed",
          invoiceError: result.error || "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Retry invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
