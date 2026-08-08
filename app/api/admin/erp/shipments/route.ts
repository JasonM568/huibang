import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpShipments,
  erpShipmentItems,
  erpSalesOrders,
  erpCustomers,
  erpWarehouses,
  erpProducts,
  erpInventoryBatches,
} from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const salesOrderId = searchParams.get("salesOrderId");

    const conditions = [];
    if (status) conditions.push(eq(erpShipments.status, status));
    if (salesOrderId) conditions.push(eq(erpShipments.salesOrderId, salesOrderId));

    let query = db
      .select({
        shipment: erpShipments,
        orderNumber: erpSalesOrders.orderNumber,
        customerName: erpCustomers.companyName,
        warehouseName: erpWarehouses.name,
      })
      .from(erpShipments)
      .leftJoin(erpSalesOrders, eq(erpShipments.salesOrderId, erpSalesOrders.id))
      .leftJoin(erpCustomers, eq(erpSalesOrders.customerId, erpCustomers.id))
      .leftJoin(erpWarehouses, eq(erpShipments.warehouseId, erpWarehouses.id));

    for (const condition of conditions) {
      query = query.where(condition) as typeof query;
    }

    const rows = await query.orderBy(desc(erpShipments.createdAt));

    // 批次撈品項（expand row 用）
    const shipmentIds = rows.map((r) => r.shipment.id);
    const itemRows = shipmentIds.length
      ? await db
          .select({
            item: erpShipmentItems,
            sku: erpProducts.sku,
            productName: erpProducts.name,
            unit: erpProducts.unit,
            batchExpiry: erpInventoryBatches.expiryDate,
          })
          .from(erpShipmentItems)
          .innerJoin(erpProducts, eq(erpShipmentItems.productId, erpProducts.id))
          .leftJoin(erpInventoryBatches, eq(erpShipmentItems.batchId, erpInventoryBatches.id))
          .where(inArray(erpShipmentItems.shipmentId, shipmentIds))
      : [];

    const data = rows.map((r) => ({
      ...r.shipment,
      orderNumber: r.orderNumber,
      customerName: r.customerName,
      warehouseName: r.warehouseName,
      items: itemRows
        .filter((it) => it.item.shipmentId === r.shipment.id)
        .map((it) => ({
          ...it.item,
          sku: it.sku,
          productName: it.productName,
          unit: it.unit,
          batchExpiry: it.batchExpiry,
        })),
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP shipments list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
