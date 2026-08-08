import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpProductSpecs,
  erpSpecDimensions,
  erpSpecOptions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const [product] = await db.select().from(erpProducts).where(eq(erpProducts.id, params.id));
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const specs = await db
      .select({
        dimensionId: erpProductSpecs.dimensionId,
        dimensionName: erpSpecDimensions.name,
        optionId: erpProductSpecs.optionId,
        optionValue: erpSpecOptions.value,
      })
      .from(erpProductSpecs)
      .innerJoin(erpSpecDimensions, eq(erpProductSpecs.dimensionId, erpSpecDimensions.id))
      .innerJoin(erpSpecOptions, eq(erpProductSpecs.optionId, erpSpecOptions.id))
      .where(eq(erpProductSpecs.productId, params.id));
    return NextResponse.json({ ...product, specs });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP product get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await request.json();

    const [product] = await db
      .update(erpProducts)
      .set({
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.specification !== undefined && { specification: body.specification || null }),
        ...(body.unit !== undefined && { unit: body.unit || "個" }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
        ...(body.barcode !== undefined && { barcode: body.barcode || null }),
        ...(body.costPrice !== undefined && { costPrice: String(body.costPrice ?? 0) }),
        ...(body.sellingPrice !== undefined && { sellingPrice: String(body.sellingPrice ?? 0) }),
        ...(body.wholesalePrice !== undefined && { wholesalePrice: String(body.wholesalePrice ?? 0) }),
        ...(body.groupPrice !== undefined && { groupPrice: String(body.groupPrice ?? 0) }),
        ...(body.safetyStock !== undefined && { safetyStock: body.safetyStock ?? 0 }),
        ...(body.hasExpiry !== undefined && { hasExpiry: body.hasExpiry }),
        ...(body.expiryAlertDays !== undefined && { expiryAlertDays: body.expiryAlertDays ?? 30 }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(erpProducts.id, params.id))
      .returning();
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // specs 有帶就整組重建（一商品一維度一值）
    if (body.specs !== undefined) {
      await db.delete(erpProductSpecs).where(eq(erpProductSpecs.productId, params.id));
      const specs = (body.specs || []).filter(
        (s: { dimensionId?: string; optionId?: string }) => s.dimensionId && s.optionId
      );
      if (specs.length) {
        await db.insert(erpProductSpecs).values(
          specs.map((s: { dimensionId: string; optionId: string }) => ({
            productId: params.id,
            dimensionId: s.dimensionId,
            optionId: s.optionId,
          }))
        );
      }
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "SKU 已存在" }, { status: 400 });
    }
    console.error("ERP product update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await db.delete(erpProducts).where(eq(erpProducts.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 已有庫存異動/訂單引用時擋刪除，改停用
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "此商品已有庫存或單據紀錄，無法刪除，請改為停用" }, { status: 400 });
    }
    console.error("ERP product delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
