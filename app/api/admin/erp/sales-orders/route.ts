import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpSalesOrders,
  erpSalesOrderItems,
  erpCustomers,
  erpWarehouses,
  erpProducts,
  erpInventoryBatches,
  erpNumberSequences,
} from "@/lib/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const conditions = [];
    if (status) conditions.push(eq(erpSalesOrders.status, status));
    if (customerId) conditions.push(eq(erpSalesOrders.customerId, customerId));

    let query = db
      .select({
        order: erpSalesOrders,
        customerName: erpCustomers.companyName,
        customerType: erpCustomers.customerType,
        warehouseName: erpWarehouses.name,
      })
      .from(erpSalesOrders)
      .leftJoin(erpCustomers, eq(erpSalesOrders.customerId, erpCustomers.id))
      .leftJoin(erpWarehouses, eq(erpSalesOrders.warehouseId, erpWarehouses.id));

    for (const condition of conditions) {
      query = query.where(condition) as typeof query;
    }

    const rows = await query.orderBy(desc(erpSalesOrders.createdAt));

    // 批次撈品項（expand row 用）
    const orderIds = rows.map((r) => r.order.id);
    const itemRows = orderIds.length
      ? await db
          .select({
            item: erpSalesOrderItems,
            sku: erpProducts.sku,
            productName: erpProducts.name,
            unit: erpProducts.unit,
            batchNo: erpInventoryBatches.batchNo,
            batchExpiry: erpInventoryBatches.expiryDate,
          })
          .from(erpSalesOrderItems)
          .innerJoin(erpProducts, eq(erpSalesOrderItems.productId, erpProducts.id))
          .leftJoin(erpInventoryBatches, eq(erpSalesOrderItems.batchId, erpInventoryBatches.id))
          .where(inArray(erpSalesOrderItems.salesOrderId, orderIds))
      : [];

    const data = rows.map((r) => ({
      ...r.order,
      customerName: r.customerName,
      customerType: r.customerType,
      warehouseName: r.warehouseName,
      items: itemRows
        .filter((it) => it.item.salesOrderId === r.order.id)
        .map((it) => ({
          ...it.item,
          sku: it.sku,
          productName: it.productName,
          unit: it.unit,
          batchNo: it.batchNo,
          batchExpiry: it.batchExpiry,
        })),
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP sales orders list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface ItemInput {
  productId: string;
  batchId?: string | null;
  quantity: number;
  unitPrice: number;
  priceTier?: string | null;
  discountRate?: number;
  note?: string;
}

// 稅額計算（訂單層級 taxMethod；稅率 5%）
function calcTax(amount: number, taxMethod: string) {
  if (taxMethod === "tax_included") {
    const taxAmount = Math.round((amount * 5) / 105);
    return { subtotal: amount - taxAmount, taxAmount, total: amount };
  }
  const taxAmount = Math.round(amount * 0.05);
  return { subtotal: amount, taxAmount, total: amount + taxAmount };
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (!body.customerId) {
      return NextResponse.json({ error: "請選擇客戶" }, { status: 400 });
    }
    if (!body.warehouseId) {
      return NextResponse.json({ error: "請選擇出貨倉庫" }, { status: 400 });
    }
    const items: ItemInput[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "請至少加入一項商品" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productId || !(Number(item.quantity) > 0)) {
        return NextResponse.json({ error: "品項數量需大於 0" }, { status: 400 });
      }
      if (Number(item.unitPrice) < 0) {
        return NextResponse.json({ error: "品項單價不可為負" }, { status: 400 });
      }
    }
    const taxMethod = body.taxMethod === "tax_included" ? "tax_included" : "tax_excluded";

    // 金額一律以後端重算為準
    const computed = items.map((item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      const discount = Number(item.discountRate) || 0;
      const amount = qty * price * (1 - discount / 100);
      const tax = calcTax(amount, taxMethod);
      return { ...item, qty, price, discount, ...tax };
    });
    const totals = computed.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.subtotal,
        tax: acc.tax + i.taxAmount,
        total: acc.total + i.total,
      }),
      { subtotal: 0, tax: 0, total: 0 }
    );

    const result = await db.transaction(async (tx) => {
      // SO-YYYYMM-NNNN：單號序列 upsert 遞增（atomic）
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const [seq] = await tx
        .insert(erpNumberSequences)
        .values({ prefix: "SO", year, month, lastNumber: 1 })
        .onConflictDoUpdate({
          target: [erpNumberSequences.prefix, erpNumberSequences.year, erpNumberSequences.month],
          set: { lastNumber: sql`${erpNumberSequences.lastNumber} + 1` },
        })
        .returning({ lastNumber: erpNumberSequences.lastNumber });
      const orderNumber = `SO-${year}${String(month).padStart(2, "0")}-${String(seq.lastNumber).padStart(4, "0")}`;

      const [order] = await tx
        .insert(erpSalesOrders)
        .values({
          orderNumber,
          customerId: body.customerId,
          warehouseId: body.warehouseId,
          orderDate: body.orderDate || now.toISOString().split("T")[0],
          expectedShipDate: body.expectedShipDate || null,
          status: "confirmed",
          taxMethod,
          subtotal: totals.subtotal.toFixed(2),
          taxAmount: totals.tax.toFixed(2),
          discountAmount: "0",
          totalAmount: totals.total.toFixed(2),
          shippingAddress: body.shippingAddress?.trim() || null,
          note: body.note?.trim() || null,
          createdBy: session.userId,
        })
        .returning();

      await tx.insert(erpSalesOrderItems).values(
        computed.map((item) => ({
          salesOrderId: order.id,
          productId: item.productId,
          batchId: item.batchId || null,
          quantity: item.qty,
          shippedQuantity: 0,
          unitPrice: item.price.toFixed(2),
          priceTier: item.priceTier || null,
          discountRate: item.discount.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
          taxAmount: item.taxAmount.toFixed(2),
          total: item.total.toFixed(2),
          note: item.note?.trim() || null,
        }))
      );

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP sales order create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
