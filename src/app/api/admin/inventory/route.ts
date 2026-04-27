import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "").trim();
    const sku = String(formData.get("sku") || "").trim();
    const size = String(formData.get("size") || "").trim();
    const color = String(formData.get("color") || "").trim();
    const sleeveType = String(formData.get("sleeveType") || "").trim();
    const edition = String(formData.get("edition") || "").trim();
    const priceOffsetRaw = String(formData.get("priceOffset") || "0").trim();
    const stockQtyRaw = String(formData.get("stockQty") || "0").trim();
    const lowStockAtRaw = String(formData.get("lowStockAt") || "5").trim();
    const isActive = formData.get("isActive") === "true";

    if (!productId || !sku) {
      return new NextResponse("Product and SKU are required", { status: 400 });
    }

    const stockQty = Number(stockQtyRaw);
    const lowStockAt = Number(lowStockAtRaw);
    const priceOffset = Number(priceOffsetRaw);

    if (Number.isNaN(stockQty) || Number.isNaN(lowStockAt) || Number.isNaN(priceOffset)) {
      return new NextResponse("Invalid numeric input", { status: 400 });
    }

    await db.productVariant.create({
      data: {
        productId,
        sku,
        size: size || null,
        color: color || null,
        sleeveType: sleeveType || null,
        edition: edition || null,
        priceOffset: priceOffset.toString(),
        stockQty,
        lowStockAt,
        isActive,
      },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return NextResponse.redirect(new URL("/admin/inventory", request.url));
  } catch (error) {
    console.error("Create inventory variant error:", error);
    return new NextResponse("Failed to create inventory variant", { status: 500 });
  }
}