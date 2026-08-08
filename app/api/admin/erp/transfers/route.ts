import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpWarehouses,
  erpInventory,
  erpInventoryTransfers,
  erpInventoryTransferItems,
  erpInventoryTransactions,
  erpNumberSequences,
} from "@/lib/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { requireAuth } from "@/lib/auth";

// 調撥紀錄列表（含倉庫名與品項明細）
export async function GET() {
  try {
    await requireAuth();
    const fromWh = alias(erpWarehouses, "from_wh");
    const toWh = alias(erpWarehouses, "to_wh");
    const transfers = await db
      .select({
        id: erpInventoryTransfers.id,
        transferNumber: erpInventoryTransfers.transferNumber,
        status: erpInventoryTransfers.status,
        note: erpInventoryTransfers.note,
        createdAt: erpInventoryTransfers.createdAt,
        completedAt: erpInventoryTransfers.completedAt,
        fromWarehouseName: sql<string>`${fromWh.code} || ' ' || ${fromWh.name}`,
        toWarehouseName: sql<string>`${toWh.code} || ' ' || ${toWh.name}`,
      })
      .from(erpInventoryTransfers)
      .leftJoin(fromWh, eq(erpInventoryTransfers.fromWarehouseId, fromWh.id))
      .leftJoin(toWh, eq(erpInventoryTransfers.toWarehouseId, toWh.id))
      .orderBy(desc(erpInventoryTransfers.createdAt));

    const ids = transfers.map((t) => t.id);
    const items = ids.length
      ? await db
          .select({
            id: erpInventoryTransferItems.id,
            transferId: erpInventoryTransferItems.transferId,
            quantity: erpInventoryTransferItems.quantity,
            receivedQuantity: erpInventoryTransferItems.receivedQuantity,
            sku: erpProducts.sku,
            productName: erpProducts.name,
            unit: erpProducts.unit,
          })
          .from(erpInventoryTransferItems)
          .leftJoin(erpProducts, eq(erpInventoryTransferItems.productId, erpProducts.id))
          .where(inArray(erpInventoryTransferItems.transferId, ids))
      : [];

    const data = transfers.map((t) => ({
      ...t,
      items: items.filter((i) => i.transferId === t.id),
    }));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP transfers list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 建立調撥：TR 單號＋單頭單身＋兩倉庫存加減＋兩筆 TRANSFER 異動，全包在一個 transaction
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const quantity = Number(body.quantity);

    if (!body.productId || !body.fromWarehouseId || !body.toWarehouseId || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "請填寫完整並確認數量為大於 0 的整數" }, { status: 400 });
    }
    if (body.fromWarehouseId === body.toWarehouseId) {
      return NextResponse.json({ error: "來源與目標倉庫不可相同" }, { status: 400 });
    }

    const [fromInv] = await db
      .select()
      .from(erpInventory)
      .where(and(eq(erpInventory.productId, body.productId), eq(erpInventory.warehouseId, body.fromWarehouseId)));
    const fromQty = fromInv?.quantity ?? 0;
    if (quantity > fromQty) {
      return NextResponse.json({ error: `來源倉庫庫存不足（目前 ${fromQty}）` }, { status: 400 });
    }

    const [fromWh] = await db.select().from(erpWarehouses).where(eq(erpWarehouses.id, body.fromWarehouseId));
    const [toWh] = await db.select().from(erpWarehouses).where(eq(erpWarehouses.id, body.toWarehouseId));
    if (!fromWh || !toWh) {
      return NextResponse.json({ error: "找不到倉庫" }, { status: 404 });
    }

    const transferNumber = await db.transaction(async (tx) => {
      // TR-YYYYMM-NNNN：以 upsert 遞增序列，原子取號
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const [seq] = await tx
        .insert(erpNumberSequences)
        .values({ prefix: "TR", year, month, lastNumber: 1 })
        .onConflictDoUpdate({
          target: [erpNumberSequences.prefix, erpNumberSequences.year, erpNumberSequences.month],
          set: { lastNumber: sql`${erpNumberSequences.lastNumber} + 1` },
        })
        .returning({ lastNumber: erpNumberSequences.lastNumber });
      const number = `TR-${year}${String(month).padStart(2, "0")}-${String(seq.lastNumber).padStart(4, "0")}`;

      const [transfer] = await tx
        .insert(erpInventoryTransfers)
        .values({
          transferNumber: number,
          fromWarehouseId: body.fromWarehouseId,
          toWarehouseId: body.toWarehouseId,
          status: "completed",
          note: body.note?.trim() || null,
          createdBy: session.userId,
          completedAt: now,
        })
        .returning({ id: erpInventoryTransfers.id });

      await tx.insert(erpInventoryTransferItems).values({
        transferId: transfer.id,
        productId: body.productId,
        quantity,
        receivedQuantity: quantity,
      });

      const [fromAfter] = await tx
        .update(erpInventory)
        .set({ quantity: sql`${erpInventory.quantity} - ${quantity}`, updatedAt: now })
        .where(and(eq(erpInventory.productId, body.productId), eq(erpInventory.warehouseId, body.fromWarehouseId)))
        .returning({ quantity: erpInventory.quantity });

      const [toAfter] = await tx
        .insert(erpInventory)
        .values({ productId: body.productId, warehouseId: body.toWarehouseId, quantity })
        .onConflictDoUpdate({
          target: [erpInventory.productId, erpInventory.warehouseId],
          set: { quantity: sql`${erpInventory.quantity} + ${quantity}`, updatedAt: now },
        })
        .returning({ quantity: erpInventory.quantity });

      await tx.insert(erpInventoryTransactions).values([
        {
          productId: body.productId,
          warehouseId: body.fromWarehouseId,
          transactionType: "TRANSFER",
          quantity: -quantity,
          balanceAfter: fromAfter.quantity,
          referenceType: "inventory_transfer",
          referenceId: transfer.id,
          note: `調撥單 ${number}｜調出至 ${toWh.name}`,
          createdBy: session.userId,
        },
        {
          productId: body.productId,
          warehouseId: body.toWarehouseId,
          transactionType: "TRANSFER",
          quantity: quantity,
          balanceAfter: toAfter.quantity,
          referenceType: "inventory_transfer",
          referenceId: transfer.id,
          note: `調撥單 ${number}｜從 ${fromWh.name} 調入`,
          createdBy: session.userId,
        },
      ]);

      return number;
    });

    return NextResponse.json({ ok: true, transferNumber }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP transfer create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
