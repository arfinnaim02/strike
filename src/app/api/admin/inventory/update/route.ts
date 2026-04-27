import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const id = String(formData.get("id") || "").trim();
    const stockQtyRaw = String(formData.get("stockQty") || "").trim();
    const lowStockAtRaw = String(formData.get("lowStockAt") || "").trim();
    const priceOffsetRaw = String(formData.get("priceOffset") || "").trim();
    const isActive = formData.get("isActive") === "true";

    if (!id) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    const stockQty = Number(stockQtyRaw);
    const lowStockAt = Number(lowStockAtRaw);
    const priceOffset = Number(priceOffsetRaw);

    if (
      Number.isNaN(stockQty) ||
      Number.isNaN(lowStockAt) ||
      Number.isNaN(priceOffset)
    ) {
      return new NextResponse("Invalid numeric input", { status: 400 });
    }

    await db.productVariant.update({
      where: {
        id,
      },
      data: {
        stockQty,
        lowStockAt,
        priceOffset: priceOffset.toString(),
        isActive,
      },
    });

    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${id}`);
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return NextResponse.redirect(new URL("/admin/inventory", request.url));
  } catch (error) {
    console.error("Update inventory error:", error);
    return new NextResponse("Failed to update inventory", { status: 500 });
  }
}