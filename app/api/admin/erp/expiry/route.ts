import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpWarehouses,
  erpInventory,
  erpInventoryBatches,
} from "@/lib/db/schema";
import { asc, eq, gt, and, isNotNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// 效期警示：有效期且尚有數量的批次（依效期近至遠）＋各倉庫存分佈
export async function GET() {
  try {
    await requireAuth();
    const [batches, inventory] = await Promise.all([
      db
        .select({
          id: erpInventoryBatches.id,
          productId: erpInventoryBatches.productId,
          warehouseId: erpInventoryBatches.warehouseId,
          batchNo: erpInventoryBatches.batchNo,
          expiryDate: erpInventoryBatches.expiryDate,
          quantity: erpInventoryBatches.quantity,
          sku: erpProducts.sku,
          productName: erpProducts.name,
          unit: erpProducts.unit,
          expiryAlertDays: erpProducts.expiryAlertDays,
          warehouseCode: erpWarehouses.code,
          warehouseName: erpWarehouses.name,
        })
        .from(erpInventoryBatches)
        .leftJoin(erpProducts, eq(erpInventoryBatches.productId, erpProducts.id))
        .leftJoin(erpWarehouses, eq(erpInventoryBatches.warehouseId, erpWarehouses.id))
        .where(and(isNotNull(erpInventoryBatches.expiryDate), gt(erpInventoryBatches.quantity, 0)))
        .orderBy(asc(erpInventoryBatches.expiryDate)),
      db
        .select({
          productId: erpInventory.productId,
          warehouseId: erpInventory.warehouseId,
          quantity: erpInventory.quantity,
          warehouseCode: erpWarehouses.code,
          warehouseName: erpWarehouses.name,
        })
        .from(erpInventory)
        .leftJoin(erpWarehouses, eq(erpInventory.warehouseId, erpWarehouses.id))
        .where(gt(erpInventory.quantity, 0)),
    ]);
    return NextResponse.json({ batches, inventory });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP expiry list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
