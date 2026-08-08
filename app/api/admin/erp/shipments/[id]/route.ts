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
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const [row] = await db
      .select({
        shipment: erpShipments,
        orderId: erpSalesOrders.id,
        orderNumber: erpSalesOrders.orderNumber,
        customer: erpCustomers,
        warehouseName: erpWarehouses.name,
        warehouseCode: erpWarehouses.code,
      })
      .from(erpShipments)
      .leftJoin(erpSalesOrders, eq(erpShipments.salesOrderId, erpSalesOrders.id))
      .leftJoin(erpCustomers, eq(erpSalesOrders.customerId, erpCustomers.id))
      .leftJoin(erpWarehouses, eq(erpShipments.warehouseId, erpWarehouses.id))
      .where(eq(erpShipments.id, params.id));
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const items = await db
      .select({
        item: erpShipmentItems,
        sku: erpProducts.sku,
        productName: erpProducts.name,
        unit: erpProducts.unit,
        specification: erpProducts.specification,
        batchExpiry: erpInventoryBatches.expiryDate,
      })
      .from(erpShipmentItems)
      .innerJoin(erpProducts, eq(erpShipmentItems.productId, erpProducts.id))
      .leftJoin(erpInventoryBatches, eq(erpShipmentItems.batchId, erpInventoryBatches.id))
      .where(eq(erpShipmentItems.shipmentId, params.id));

    return NextResponse.json({
      ...row.shipment,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      customer: row.customer,
      warehouseName: row.warehouseName,
      warehouseCode: row.warehouseCode,
      items: items.map((it) => ({
        ...it.item,
        sku: it.sku,
        productName: it.productName,
        unit: it.unit,
        specification: it.specification,
        batchExpiry: it.batchExpiry,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP shipment get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// action=sign  簽收：shipped → signed（記簽收人/時間）
// action=cancel 取消：僅 pending 可取消（本流程建立即出貨，已出貨要走退貨流程——未來模組）
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();

    const [shipment] = await db.select().from(erpShipments).where(eq(erpShipments.id, params.id));
    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.action === "sign") {
      const signedBy = (body.signedBy || "").trim();
      if (!signedBy) {
        return NextResponse.json({ error: "請輸入簽收人姓名" }, { status: 400 });
      }
      if (shipment.status !== "shipped") {
        return NextResponse.json({ error: "只有「已出貨」的出貨單可以簽收" }, { status: 400 });
      }
      const [updated] = await db
        .update(erpShipments)
        .set({ status: "signed", signedAt: new Date(), signedBy, updatedAt: new Date() })
        .where(eq(erpShipments.id, params.id))
        .returning();
      return NextResponse.json(updated);
    }

    if (body.action === "cancel") {
      if (shipment.status !== "pending") {
        return NextResponse.json(
          { error: "已出貨/已簽收的出貨單不可取消，請改走退貨流程" },
          { status: 400 }
        );
      }
      const [updated] = await db
        .update(erpShipments)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(erpShipments.id, params.id))
        .returning();
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "未知的動作" }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP shipment update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
