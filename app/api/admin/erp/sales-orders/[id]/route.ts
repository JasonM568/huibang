import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpSalesOrders,
  erpSalesOrderItems,
  erpCustomers,
  erpWarehouses,
  erpProducts,
  erpInventoryBatches,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const [row] = await db
      .select({
        order: erpSalesOrders,
        customer: erpCustomers,
        warehouseName: erpWarehouses.name,
        warehouseCode: erpWarehouses.code,
      })
      .from(erpSalesOrders)
      .leftJoin(erpCustomers, eq(erpSalesOrders.customerId, erpCustomers.id))
      .leftJoin(erpWarehouses, eq(erpSalesOrders.warehouseId, erpWarehouses.id))
      .where(eq(erpSalesOrders.id, params.id));
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const items = await db
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
      .where(eq(erpSalesOrderItems.salesOrderId, params.id));

    return NextResponse.json({
      ...row.order,
      customer: row.customer,
      warehouseName: row.warehouseName,
      warehouseCode: row.warehouseCode,
      items: items.map((it) => ({
        ...it.item,
        sku: it.sku,
        productName: it.productName,
        unit: it.unit,
        batchNo: it.batchNo,
        batchExpiry: it.batchExpiry,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP sales order get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const VALID_STATUSES = ["draft", "confirmed", "processing", "shipped", "completed", "cancelled"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();

    const [existing] = await db.select().from(erpSalesOrders).where(eq(erpSalesOrders.id, params.id));
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "無效的狀態" }, { status: 400 });
      }
      if (existing.status === "cancelled") {
        return NextResponse.json({ error: "已取消的訂單不可變更狀態" }, { status: 400 });
      }
      if (body.status === "cancelled" && ["shipped", "completed"].includes(existing.status)) {
        return NextResponse.json({ error: "已出貨/已完成的訂單不可取消" }, { status: 400 });
      }
    }

    const [order] = await db
      .update(erpSalesOrders)
      .set({
        ...(body.status !== undefined && { status: body.status }),
        ...(body.expectedShipDate !== undefined && { expectedShipDate: body.expectedShipDate || null }),
        ...(body.shippingAddress !== undefined && { shippingAddress: body.shippingAddress?.trim() || null }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
        updatedAt: new Date(),
      })
      .where(eq(erpSalesOrders.id, params.id))
      .returning();

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP sales order update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const [existing] = await db.select().from(erpSalesOrders).where(eq(erpSalesOrders.id, params.id));
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!["draft", "confirmed", "cancelled"].includes(existing.status)) {
      return NextResponse.json({ error: "已進入出貨流程的訂單不可刪除" }, { status: 400 });
    }
    // items on delete cascade；若已有出貨單引用會被 FK 擋下（23503）
    await db.delete(erpSalesOrders).where(eq(erpSalesOrders.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "此訂單已有出貨單紀錄，無法刪除" }, { status: 400 });
    }
    console.error("ERP sales order delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
