import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../lib/db";

type UpdateItem = {
  variantId: string;
  stockQty: number;
  lowStockAt: number;
  priceOffset: number;
  isActive: boolean;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "").trim();
    const itemsJsonRaw = String(formData.get("itemsJson") || "[]").trim();

    if (!productId) {
      return new NextResponse("Missing product ID", { status: 400 });
    }

    let items: UpdateItem[] = [];

    try {
      items = JSON.parse(itemsJsonRaw);
    } catch {
      return new NextResponse("Invalid update payload", { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse("No updates provided", { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const cleanedItems = items
      .filter((item) => item?.variantId)
      .map((item) => ({
        variantId: String(item.variantId).trim(),
        stockQty: Math.max(0, Number(item.stockQty || 0)),
        lowStockAt: Math.max(0, Number(item.lowStockAt || 0)),
        priceOffset: Number(item.priceOffset || 0),
        isActive: Boolean(item.isActive),
      }));

    if (cleanedItems.some((item) => Number.isNaN(item.priceOffset))) {
      return new NextResponse("Invalid price offset found", { status: 400 });
    }

    const productVariantIds = await db.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });

    const allowedVariantIds = new Set(productVariantIds.map((item) => item.id));

    for (const item of cleanedItems) {
      if (!allowedVariantIds.has(item.variantId)) {
        return new NextResponse("Invalid variant update detected", { status: 400 });
      }
    }

    await db.$transaction(
      cleanedItems.map((item) =>
        db.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQty: item.stockQty,
            lowStockAt: item.lowStockAt,
            priceOffset: item.priceOffset.toString(),
            isActive: item.isActive,
          },
        })
      )
    );

    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/manage/${productId}`);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.redirect(
      new URL(`/admin/inventory/manage/${productId}`, request.url)
    );
  } catch (error) {
    console.error("Manage inventory update error:", error);
    return new NextResponse("Failed to update inventory", { status: 500 });
  }
}