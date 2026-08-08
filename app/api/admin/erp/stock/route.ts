import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpWarehouses,
  erpInventory,
  erpProductStock,
  erpInventoryBatches,
  erpInventoryTransactions,
} from "@/lib/db/schema";
import { asc, eq, gt, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// 庫存查詢：一次回傳 StockTab 所需全部資料，前端以 id 對照
export async function GET() {
  try {
    await requireAuth();
    const [products, warehouses, inventory, productStock, batches] = await Promise.all([
      db
        .select({
          id: erpProducts.id,
          sku: erpProducts.sku,
          name: erpProducts.name,
          unit: erpProducts.unit,
          hasExpiry: erpProducts.hasExpiry,
          safetyStock: erpProducts.safetyStock,
          isActive: erpProducts.isActive,
        })
        .from(erpProducts)
        .orderBy(asc(erpProducts.name)),
      db
        .select()
        .from(erpWarehouses)
        .where(eq(erpWarehouses.isActive, true))
        .orderBy(asc(erpWarehouses.code)),
      db.select().from(erpInventory),
      db.select().from(erpProductStock),
      db
        .select()
        .from(erpInventoryBatches)
        .where(gt(erpInventoryBatches.quantity, 0))
        .orderBy(sql`${erpInventoryBatches.expiryDate} ASC NULLS LAST`),
    ]);
    return NextResponse.json({ products, warehouses, inventory, productStock, batches });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP stock list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 盤點調整：改倉庫數量＋同步總庫存差值＋寫 ADJUST 異動（原因必填）
export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { inventoryId, newQuantity, reason } = body as {
      inventoryId?: string;
      newQuantity?: number;
      reason?: string;
    };
    if (!inventoryId) {
      return NextResponse.json({ error: "缺少庫存紀錄 ID" }, { status: 400 });
    }
    if (typeof newQuantity !== "number" || !Number.isInteger(newQuantity) || newQuantity < 0) {
      return NextResponse.json({ error: "新數量必須是 0 以上的整數" }, { status: 400 });
    }
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "請填寫調整原因" }, { status: 400 });
    }

    const [row] = await db.select().from(erpInventory).where(eq(erpInventory.id, inventoryId));
    if (!row) {
      return NextResponse.json({ error: "找不到庫存紀錄" }, { status: 404 });
    }
    const diff = newQuantity - row.quantity;
    if (diff === 0) {
      return NextResponse.json({ error: "新數量跟原本一樣，沒變化可調整" }, { status: 400 });
    }
    if (newQuantity < row.reservedQuantity) {
      return NextResponse.json(
        { error: `新數量 ${newQuantity} 小於已保留量 ${row.reservedQuantity}，會破壞已下訂單的承諾` },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(erpInventory)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(erpInventory.id, inventoryId));
      await tx
        .insert(erpProductStock)
        .values({ productId: row.productId, totalQuantity: diff > 0 ? diff : 0 })
        .onConflictDoUpdate({
          target: erpProductStock.productId,
          set: {
            totalQuantity: sql`GREATEST(${erpProductStock.totalQuantity} + ${diff}, 0)`,
            updatedAt: new Date(),
          },
        });
      await tx.insert(erpInventoryTransactions).values({
        productId: row.productId,
        warehouseId: row.warehouseId,
        transactionType: "ADJUST",
        quantity: diff,
        balanceAfter: newQuantity,
        referenceType: "adjustment",
        note: `盤點調整：${reason.trim()}（${row.quantity} → ${newQuantity}）`,
        createdBy: session.userId,
      });
    });

    return NextResponse.json({ ok: true, delta: diff });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP stock adjust error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 刪除空庫存紀錄（quantity = 0 且 reserved = 0 才允許；不影響歷史異動）
export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少庫存紀錄 ID" }, { status: 400 });
    }
    const [row] = await db.select().from(erpInventory).where(eq(erpInventory.id, id));
    if (!row) {
      return NextResponse.json({ error: "找不到庫存紀錄" }, { status: 404 });
    }
    if (row.quantity !== 0) {
      return NextResponse.json({ error: `此筆庫存還有 ${row.quantity}，請先用「調整」改成 0 再刪` }, { status: 400 });
    }
    if (row.reservedQuantity !== 0) {
      return NextResponse.json({ error: `此筆庫存被訂單保留 ${row.reservedQuantity}，不可刪除` }, { status: 400 });
    }
    await db.delete(erpInventory).where(eq(erpInventory.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP stock delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
