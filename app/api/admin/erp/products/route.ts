import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  erpProducts,
  erpCategories,
  erpProductSpecs,
  erpSpecDimensions,
  erpSpecOptions,
  erpProductStock,
} from "@/lib/db/schema";
import { desc, eq, ilike, or, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(erpProducts.name, `%${search}%`),
          ilike(erpProducts.sku, `%${search}%`),
          ilike(erpProducts.barcode, `%${search}%`)
        )
      );
    }
    if (categoryId) {
      conditions.push(eq(erpProducts.categoryId, categoryId));
    }

    let query = db
      .select({
        product: erpProducts,
        categoryName: erpCategories.name,
        totalQuantity: erpProductStock.totalQuantity,
      })
      .from(erpProducts)
      .leftJoin(erpCategories, eq(erpProducts.categoryId, erpCategories.id))
      .leftJoin(erpProductStock, eq(erpProducts.id, erpProductStock.productId));

    for (const condition of conditions) {
      query = query.where(condition) as typeof query;
    }

    const rows = await query.orderBy(desc(erpProducts.createdAt));

    // 批次撈規格，組回每個商品
    const productIds = rows.map((r) => r.product.id);
    const specRows = productIds.length
      ? await db
          .select({
            productId: erpProductSpecs.productId,
            dimensionId: erpProductSpecs.dimensionId,
            dimensionName: erpSpecDimensions.name,
            optionId: erpProductSpecs.optionId,
            optionValue: erpSpecOptions.value,
          })
          .from(erpProductSpecs)
          .innerJoin(erpSpecDimensions, eq(erpProductSpecs.dimensionId, erpSpecDimensions.id))
          .innerJoin(erpSpecOptions, eq(erpProductSpecs.optionId, erpSpecOptions.id))
          .where(inArray(erpProductSpecs.productId, productIds))
      : [];

    const data = rows.map((r) => ({
      ...r.product,
      categoryName: r.categoryName,
      totalQuantity: r.totalQuantity ?? 0,
      specs: specRows.filter((s) => s.productId === r.product.id),
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ERP products list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    if (!body.sku || !body.name) {
      return NextResponse.json({ error: "SKU 與品名必填" }, { status: 400 });
    }

    const [product] = await db
      .insert(erpProducts)
      .values({
        sku: body.sku,
        name: body.name,
        specification: body.specification || null,
        unit: body.unit || "個",
        categoryId: body.categoryId || null,
        barcode: body.barcode || null,
        costPrice: String(body.costPrice ?? 0),
        sellingPrice: String(body.sellingPrice ?? 0),
        wholesalePrice: String(body.wholesalePrice ?? 0),
        groupPrice: String(body.groupPrice ?? 0),
        safetyStock: body.safetyStock ?? 0,
        hasExpiry: body.hasExpiry ?? true,
        expiryAlertDays: body.expiryAlertDays ?? 30,
      })
      .returning();

    // 結構化規格（[{dimensionId, optionId}]）
    const specs = (body.specs || []).filter((s: { dimensionId?: string; optionId?: string }) => s.dimensionId && s.optionId);
    if (specs.length) {
      await db.insert(erpProductSpecs).values(
        specs.map((s: { dimensionId: string; optionId: string }) => ({
          productId: product.id,
          dimensionId: s.dimensionId,
          optionId: s.optionId,
        }))
      );
    }

    // 初始化總庫存為 0
    await db
      .insert(erpProductStock)
      .values({ productId: product.id, totalQuantity: 0 })
      .onConflictDoNothing();

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "SKU 已存在" }, { status: 400 });
    }
    console.error("ERP product create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
