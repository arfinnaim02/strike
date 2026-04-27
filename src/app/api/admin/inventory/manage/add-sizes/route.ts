import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../lib/db";

type BulkItem = {
  edition: string;
  size: string;
  stockQty: number;
};

function normalizeSkuPart(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "").trim();
    const skuPrefixRaw = String(formData.get("skuPrefix") || "").trim();
    const priceOffsetRaw = String(formData.get("priceOffset") || "0").trim();
    const lowStockAtRaw = String(formData.get("lowStockAt") || "5").trim();
    const itemsJsonRaw = String(formData.get("itemsJson") || "[]").trim();

    if (!productId || !skuPrefixRaw) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const priceOffset = Number(priceOffsetRaw);
    const lowStockAt = Number(lowStockAtRaw);

    if (Number.isNaN(priceOffset)) {
      return new NextResponse("Invalid price offset", { status: 400 });
    }

    if (Number.isNaN(lowStockAt) || lowStockAt < 0) {
      return new NextResponse("Invalid low stock threshold", { status: 400 });
    }

    let items: BulkItem[] = [];

    try {
      items = JSON.parse(itemsJsonRaw);
    } catch {
      return new NextResponse("Invalid size payload", { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse("No sizes selected", { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        slug: true,
        variants: {
          select: {
            size: true,
            edition: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const skuPrefix = normalizeSkuPart(skuPrefixRaw);

    if (!skuPrefix) {
      return new NextResponse("Invalid SKU prefix", { status: 400 });
    }

    const cleanedItems = items
      .filter((item) => item?.size)
      .map((item) => ({
        edition: String(item.edition || "Standard").trim() || "Standard",
        size: String(item.size).trim().toUpperCase(),
        stockQty: Math.max(0, Number(item.stockQty || 0)),
      }))
      .filter((item) => item.size.length > 0);

    if (cleanedItems.length === 0) {
      return new NextResponse("No valid sizes provided", { status: 400 });
    }

    if (cleanedItems.some((item) => Number.isNaN(item.stockQty))) {
      return new NextResponse("Invalid stock quantity found", { status: 400 });
    }

    const duplicateSizesInRequest = cleanedItems.filter(
      (item, index, arr) =>
        arr.findIndex(
          (x) =>
            x.size === item.size &&
            x.edition.toUpperCase() === item.edition.toUpperCase()
        ) !== index
    );

    if (duplicateSizesInRequest.length > 0) {
      return new NextResponse("Duplicate edition-size detected in request", {
        status: 400,
      });
    }

    const existingVariantKeys = new Set(
      product.variants
        .map((variant) =>
          `${variant.edition || "Standard"}__${variant.size || ""}`.toUpperCase()
        )
        .filter(Boolean)
    );

    for (const item of cleanedItems) {
      const existingKey = `${item.edition}__${item.size}`.toUpperCase();

      if (existingVariantKeys.has(existingKey)) {
        return new NextResponse(
          `${item.edition} ${item.size} already exists for this product`,
          { status: 400 }
        );
      }
    }

    const createData = cleanedItems.map((item) => {
      const editionSkuPart = normalizeSkuPart(item.edition);
      const sku = `${skuPrefix}-${editionSkuPart}-${item.size}`;

      return {
        productId,
        sku,
        size: item.size,
        edition: item.edition,
        priceOffset: priceOffset.toString(),
        stockQty: item.stockQty,
        lowStockAt,
        isActive: true,
      };
    });

    const skuList = createData.map((item) => item.sku);

    const existingSkus = await db.productVariant.findMany({
      where: {
        sku: {
          in: skuList,
        },
      },
      select: {
        sku: true,
      },
    });

    if (existingSkus.length > 0) {
      return new NextResponse(`SKU already exists: ${existingSkus[0].sku}`, {
        status: 400,
      });
    }

    await db.$transaction(
      createData.map((item) =>
        db.productVariant.create({
          data: item,
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
    console.error("Manage add sizes error:", error);
    return new NextResponse("Failed to add sizes", { status: 500 });
  }
}