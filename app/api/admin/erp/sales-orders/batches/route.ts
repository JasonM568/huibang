import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { erpInventoryBatches, erpWarehouses } from "@/lib/db/schema";
import { asc, eq, gt } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// 建單「選批號」用：所有還有量的批（依效期近→遠排）
export async function GET() {
  try {
    await requireAuth();
    const data = await db
      .select({
        id: erpInventoryBatches.id,
        productId: erpInventoryBatches.productId,
        warehouseId: erpInventoryBatches.warehouseId,
        batchNo: erpInventoryBatches.batchNo,
        expiryDate: erpInventoryBatches.expiryDate,
        quantity: erpInventoryBatches.quantity,
        warehouseName: erpWarehouses.name,
      })
      .from(erpInventoryBatches)
      .leftJoin(erpWarehouses, eq(erpInventoryBatches.warehouseId, erpWarehouses.id))
      .where(gt(erpInventoryBatches.quantity, 0))
      .orderBy(asc(erpInventoryBatches.expiryDate));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP so batches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
