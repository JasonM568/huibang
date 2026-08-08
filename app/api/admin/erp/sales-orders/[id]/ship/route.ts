import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpSalesOrders,
  erpSalesOrderItems,
  erpShipments,
  erpShipmentItems,
  erpProducts,
  erpInventory,
  erpProductStock,
  erpInventoryBatches,
  erpInventoryTransactions,
  erpNumberSequences,
} from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

interface ShipItemInput {
  soItemId: string;
  quantity: number;
  batchId?: string | null;
  note?: string;
}

// 建立出貨單（一張 SO 可多張 = 分批出貨）：
// 1. 驗證每個 so_item 剩餘量 >= 本次出貨量
// 2. 驗證出貨倉庫存 >= 本次出貨量（同商品多筆累加）；有效期商品必須指定批號且批量足夠
// 3. SH-YYYYMM-NNNN 單號 → 建 shipment + items（batch_no 存 snapshot）
// 4. 扣 erp_inventory（倉）+ erp_product_stock（總量）+ 批次量，寫 OUT 異動
// 5. 累加 shipped_quantity；SO 全出完 → shipped，否則 → processing
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const items: ShipItemInput[] = Array.isArray(body.items)
      ? body.items.filter((i: ShipItemInput) => Number(i.quantity) > 0)
      : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "請至少填一項出貨數量" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.soItemId || !Number.isInteger(Number(item.quantity))) {
        return NextResponse.json({ error: "出貨數量需為整數" }, { status: 400 });
      }
    }

    const [order] = await db.select().from(erpSalesOrders).where(eq(erpSalesOrders.id, params.id));
    if (!order) {
      return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
    }
    if (order.status === "cancelled") {
      return NextResponse.json({ error: "訂單已取消，不可出貨" }, { status: 400 });
    }
    if (["shipped", "completed"].includes(order.status)) {
      return NextResponse.json({ error: "訂單已全部出貨" }, { status: 400 });
    }
    if (order.status === "draft") {
      return NextResponse.json({ error: "草稿訂單請先確認後再出貨" }, { status: 400 });
    }

    const soItems = await db
      .select({ item: erpSalesOrderItems, hasExpiry: erpProducts.hasExpiry, productName: erpProducts.name })
      .from(erpSalesOrderItems)
      .innerJoin(erpProducts, eq(erpSalesOrderItems.productId, erpProducts.id))
      .where(eq(erpSalesOrderItems.salesOrderId, params.id));
    const soItemMap = new Map(soItems.map((r) => [r.item.id, r]));

    // 驗證：每筆 <= 剩餘量
    const validated: { soItem: (typeof soItems)[number]; qty: number; batchId: string | null; note: string | null }[] = [];
    for (const input of items) {
      const row = soItemMap.get(input.soItemId);
      if (!row) {
        return NextResponse.json({ error: "出貨品項不屬於本訂單" }, { status: 400 });
      }
      const remaining = row.item.quantity - row.item.shippedQuantity;
      const qty = Number(input.quantity);
      if (qty > remaining) {
        return NextResponse.json(
          { error: `${row.productName} 本次出貨 ${qty} 超過剩餘 ${remaining}` },
          { status: 400 }
        );
      }
      if (row.hasExpiry && !input.batchId) {
        return NextResponse.json({ error: `${row.productName} 有效期，出貨必須指定批號` }, { status: 400 });
      }
      validated.push({ soItem: row, qty, batchId: input.batchId || null, note: input.note?.trim() || null });
    }

    // 批次驗證：屬於本商品 + 本出貨倉，且批量足夠（同批多筆累加）
    const batchIds = Array.from(new Set(validated.flatMap((v) => (v.batchId ? [v.batchId] : []))));
    const batchRows = batchIds.length
      ? await db.select().from(erpInventoryBatches).where(inArray(erpInventoryBatches.id, batchIds))
      : [];
    const batchMap = new Map(batchRows.map((b) => [b.id, b]));
    const needByBatch = new Map<string, number>();
    for (const v of validated) {
      if (!v.batchId) continue;
      const batch = batchMap.get(v.batchId);
      if (!batch) {
        return NextResponse.json({ error: "指定的批次不存在" }, { status: 400 });
      }
      if (batch.productId !== v.soItem.item.productId) {
        return NextResponse.json({ error: "批號與商品不符" }, { status: 400 });
      }
      if (batch.warehouseId !== order.warehouseId) {
        return NextResponse.json({ error: `批號 ${batch.batchNo} 不在本次出貨倉` }, { status: 400 });
      }
      needByBatch.set(v.batchId, (needByBatch.get(v.batchId) ?? 0) + v.qty);
    }
    for (const [batchId, need] of Array.from(needByBatch)) {
      const batch = batchMap.get(batchId)!;
      if (need > batch.quantity) {
        return NextResponse.json(
          { error: `批號 ${batch.batchNo} 剩餘 ${batch.quantity}，不夠出 ${need}` },
          { status: 400 }
        );
      }
    }

    // 倉庫存驗證（同商品多筆累加）
    const needByProduct = new Map<string, number>();
    for (const v of validated) {
      const pid = v.soItem.item.productId;
      needByProduct.set(pid, (needByProduct.get(pid) ?? 0) + v.qty);
    }
    const productIds = Array.from(needByProduct.keys());
    const invRows = await db
      .select()
      .from(erpInventory)
      .where(and(eq(erpInventory.warehouseId, order.warehouseId), inArray(erpInventory.productId, productIds)));
    const invMap = new Map(invRows.map((r) => [r.productId, r]));
    for (const [pid, need] of Array.from(needByProduct)) {
      const stock = invMap.get(pid)?.quantity ?? 0;
      if (stock < need) {
        const name = soItems.find((r) => r.item.productId === pid)?.productName ?? pid;
        return NextResponse.json({ error: `${name} 庫存不足：本次需 ${need}，出貨倉只有 ${stock}` }, { status: 400 });
      }
    }

    const result = await db.transaction(async (tx) => {
      // SH-YYYYMM-NNNN
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const [seq] = await tx
        .insert(erpNumberSequences)
        .values({ prefix: "SH", year, month, lastNumber: 1 })
        .onConflictDoUpdate({
          target: [erpNumberSequences.prefix, erpNumberSequences.year, erpNumberSequences.month],
          set: { lastNumber: sql`${erpNumberSequences.lastNumber} + 1` },
        })
        .returning({ lastNumber: erpNumberSequences.lastNumber });
      const shipmentNumber = `SH-${year}${String(month).padStart(2, "0")}-${String(seq.lastNumber).padStart(4, "0")}`;

      const [shipment] = await tx
        .insert(erpShipments)
        .values({
          shipmentNumber,
          salesOrderId: order.id,
          warehouseId: order.warehouseId,
          shipDate: body.shipDate || now.toISOString().split("T")[0],
          status: "shipped",
          shippingAddress: body.shippingAddress?.trim() || order.shippingAddress || null,
          note: body.note?.trim() || null,
          createdBy: session.userId,
        })
        .returning();

      await tx.insert(erpShipmentItems).values(
        validated.map((v) => ({
          shipmentId: shipment.id,
          soItemId: v.soItem.item.id,
          productId: v.soItem.item.productId,
          batchId: v.batchId,
          batchNo: v.batchId ? batchMap.get(v.batchId)!.batchNo : null,
          shippedQuantity: v.qty,
          note: v.note,
        }))
      );

      // 扣倉庫存 + 總庫存 + 寫 OUT 異動（同商品多筆用 running balance）
      const runningBalance = new Map<string, number>(
        Array.from(needByProduct.keys()).map((pid) => [pid, invMap.get(pid)?.quantity ?? 0])
      );
      for (const v of validated) {
        const pid = v.soItem.item.productId;
        const newBalance = runningBalance.get(pid)! - v.qty;
        runningBalance.set(pid, newBalance);

        await tx.insert(erpInventoryTransactions).values({
          productId: pid,
          warehouseId: order.warehouseId,
          transactionType: "OUT",
          quantity: -v.qty,
          balanceAfter: newBalance,
          referenceType: "shipment",
          referenceId: shipment.id,
          batchNo: v.batchId ? batchMap.get(v.batchId)!.batchNo : null,
          note: `出貨 ${shipmentNumber}（${order.orderNumber}）`,
          createdBy: session.userId,
        });

        await tx
          .update(erpSalesOrderItems)
          .set({ shippedQuantity: sql`${erpSalesOrderItems.shippedQuantity} + ${v.qty}` })
          .where(eq(erpSalesOrderItems.id, v.soItem.item.id));
      }
      for (const [pid, need] of Array.from(needByProduct)) {
        await tx
          .update(erpInventory)
          .set({ quantity: sql`${erpInventory.quantity} - ${need}`, updatedAt: new Date() })
          .where(and(eq(erpInventory.productId, pid), eq(erpInventory.warehouseId, order.warehouseId)));
        // 出貨離開公司 → 總庫存同步扣（維持 總量 = 未分倉 + 各倉 的模型）
        await tx
          .update(erpProductStock)
          .set({ totalQuantity: sql`${erpProductStock.totalQuantity} - ${need}`, updatedAt: new Date() })
          .where(eq(erpProductStock.productId, pid));
      }
      for (const [batchId, need] of Array.from(needByBatch)) {
        await tx
          .update(erpInventoryBatches)
          .set({ quantity: sql`${erpInventoryBatches.quantity} - ${need}`, updatedAt: new Date() })
          .where(eq(erpInventoryBatches.id, batchId));
      }

      // SO 全出完 → shipped，否則 processing
      const refreshed = await tx
        .select({ quantity: erpSalesOrderItems.quantity, shipped: erpSalesOrderItems.shippedQuantity })
        .from(erpSalesOrderItems)
        .where(eq(erpSalesOrderItems.salesOrderId, order.id));
      const allShipped = refreshed.every((r) => r.shipped >= r.quantity);
      await tx
        .update(erpSalesOrders)
        .set({ status: allShipped ? "shipped" : "processing", updatedAt: new Date() })
        .where(eq(erpSalesOrders.id, order.id));

      return shipment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP ship error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
