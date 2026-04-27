import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = String(body.action || "");
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];

    const stockQty = Math.max(0, Number(body.stockQty || 0));
    const lowStockAt = Math.max(0, Number(body.lowStockAt || 0));

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No inventory products selected" },
        { status: 400 }
      );
    }

    if (Number.isNaN(stockQty) || Number.isNaN(lowStockAt)) {
      return NextResponse.json(
        { error: "Invalid stock value" },
        { status: 400 }
      );
    }

    const updateData = getBulkUpdateData(action, stockQty, lowStockAt);

    if (!updateData) {
      return NextResponse.json(
        { error: "Invalid bulk action" },
        { status: 400 }
      );
    }

    await db.productVariant.updateMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      data: updateData,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      updatedProducts: productIds.length,
    });
  } catch (error) {
    console.error("Bulk inventory action error:", error);

    return NextResponse.json(
      { error: "Failed to complete bulk inventory action" },
      { status: 500 }
    );
  }
}

function getBulkUpdateData(action: string, stockQty: number, lowStockAt: number) {
  switch (action) {
    case "ACTIVATE_VARIANTS":
      return { isActive: true };
    case "DEACTIVATE_VARIANTS":
      return { isActive: false };
    case "SET_LOW_STOCK":
      return { lowStockAt };
    case "SET_STOCK":
      return { stockQty };
    default:
      return null;
  }
}