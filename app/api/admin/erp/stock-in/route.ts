import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpInventory,
  erpProductStock,
  erpInventoryBatches,
  erpInventoryTransactions,
} from "@/lib/db/schema";
import { and, eq, isNull, sql, sum } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// 入庫兩段式：
// action=receive  進貨入庫：總庫存 +N，批號進「未分配池」（warehouse_id = null）
// action=allocate 分配入倉：從總庫存分配到倉（不動總庫存），有效期商品必須帶批號（批號從未分配池拆到目標倉）
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const action = body.action as string;
    const quantity = Number(body.quantity);

    if (!body.productId || !Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "請選擇商品並填寫大於 0 的整數數量" }, { status: 400 });
    }
    const [product] = await db.select().from(erpProducts).where(eq(erpProducts.id, body.productId));
    if (!product) {
      return NextResponse.json({ error: "找不到商品" }, { status: 404 });
    }

    if (action === "receive") {
      const batchNo = (body.batchNo || "").trim();
      const expiryDate = body.expiryDate || null;
      if (product.hasExpiry && !batchNo) {
        return NextResponse.json({ error: "此商品有效期，進貨必須填批號" }, { status: 400 });
      }

      const result = await db.transaction(async (tx) => {
        const [stock] = await tx
          .insert(erpProductStock)
          .values({ productId: product.id, totalQuantity: quantity })
          .onConflictDoUpdate({
            target: erpProductStock.productId,
            set: {
              totalQuantity: sql`${erpProductStock.totalQuantity} + ${quantity}`,
              updatedAt: new Date(),
            },
          })
          .returning({ totalQuantity: erpProductStock.totalQuantity });

        if (batchNo) {
          // 同批號已在未分配池 → 累加；否則新建
          const [existing] = await tx
            .select()
            .from(erpInventoryBatches)
            .where(
              and(
                eq(erpInventoryBatches.productId, product.id),
                isNull(erpInventoryBatches.warehouseId),
                eq(erpInventoryBatches.batchNo, batchNo)
              )
            );
          if (existing) {
            await tx
              .update(erpInventoryBatches)
              .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
              .where(eq(erpInventoryBatches.id, existing.id));
          } else {
            await tx.insert(erpInventoryBatches).values({
              productId: product.id,
              warehouseId: null,
              batchNo,
              expiryDate,
              quantity,
            });
          }
        }

        await tx.insert(erpInventoryTransactions).values({
          productId: product.id,
          warehouseId: null,
          transactionType: "IN",
          quantity,
          balanceAfter: stock.totalQuantity,
          referenceType: "stock_in",
          batchNo: batchNo || null,
          note: batchNo ? `進貨入庫（批號 ${batchNo}）` : "進貨入庫",
          createdBy: session.userId,
        });

        return stock;
      });

      return NextResponse.json({ ok: true, totalQuantity: result.totalQuantity }, { status: 201 });
    }

    if (action === "allocate") {
      if (!body.warehouseId) {
        return NextResponse.json({ error: "請選擇目標倉庫" }, { status: 400 });
      }

      const [stockRow] = await db.select().from(erpProductStock).where(eq(erpProductStock.productId, product.id));
      const total = stockRow?.totalQuantity ?? 0;
      const [allocatedRow] = await db
        .select({ allocated: sum(erpInventory.quantity) })
        .from(erpInventory)
        .where(eq(erpInventory.productId, product.id));
      const allocated = Number(allocatedRow?.allocated ?? 0);
      const available = total - allocated;
      if (quantity > available) {
        return NextResponse.json(
          { error: `可分配數量不足！總庫存 ${total}，已分配 ${allocated}，剩餘可分配 ${available}` },
          { status: 400 }
        );
      }

      if (product.hasExpiry && !body.batchId) {
        return NextResponse.json({ error: "此商品有效期，必須選擇批號" }, { status: 400 });
      }

      let sourceBatch = null;
      if (body.batchId) {
        const [batch] = await db
          .select()
          .from(erpInventoryBatches)
          .where(eq(erpInventoryBatches.id, body.batchId));
        if (!batch || batch.productId !== product.id) {
          return NextResponse.json({ error: "找不到批次" }, { status: 404 });
        }
        if (batch.warehouseId !== null) {
          return NextResponse.json({ error: "只能從未分配池的批次分配入倉" }, { status: 400 });
        }
        if (quantity > batch.quantity) {
          return NextResponse.json({ error: `此批次剩餘 ${batch.quantity}，不夠分配 ${quantity}` }, { status: 400 });
        }
        sourceBatch = batch;
      }

      await db.transaction(async (tx) => {
        const [inv] = await tx
          .insert(erpInventory)
          .values({ productId: product.id, warehouseId: body.warehouseId, quantity })
          .onConflictDoUpdate({
            target: [erpInventory.productId, erpInventory.warehouseId],
            set: {
              quantity: sql`${erpInventory.quantity} + ${quantity}`,
              updatedAt: new Date(),
            },
          })
          .returning({ quantity: erpInventory.quantity });

        if (sourceBatch) {
          // 未分配池扣量，目標倉同批號累加或新建
          await tx
            .update(erpInventoryBatches)
            .set({ quantity: sourceBatch.quantity - quantity, updatedAt: new Date() })
            .where(eq(erpInventoryBatches.id, sourceBatch.id));

          const [target] = await tx
            .select()
            .from(erpInventoryBatches)
            .where(
              and(
                eq(erpInventoryBatches.productId, product.id),
                eq(erpInventoryBatches.warehouseId, body.warehouseId),
                eq(erpInventoryBatches.batchNo, sourceBatch.batchNo)
              )
            );
          if (target) {
            await tx
              .update(erpInventoryBatches)
              .set({ quantity: target.quantity + quantity, updatedAt: new Date() })
              .where(eq(erpInventoryBatches.id, target.id));
          } else {
            await tx.insert(erpInventoryBatches).values({
              productId: product.id,
              warehouseId: body.warehouseId,
              batchNo: sourceBatch.batchNo,
              expiryDate: sourceBatch.expiryDate,
              quantity,
            });
          }
        }

        await tx.insert(erpInventoryTransactions).values({
          productId: product.id,
          warehouseId: body.warehouseId,
          transactionType: "IN",
          quantity,
          balanceAfter: inv.quantity,
          referenceType: "allocation",
          batchNo: sourceBatch?.batchNo ?? null,
          note: sourceBatch ? `從總庫存分配入倉（批號 ${sourceBatch.batchNo}）` : "從總庫存分配入倉",
          createdBy: session.userId,
        });
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    }

    return NextResponse.json({ error: "未知的動作" }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP stock-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
