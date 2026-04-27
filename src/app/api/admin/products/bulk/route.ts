import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = String(body.action || "");
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No products selected" },
        { status: 400 }
      );
    }

    if (action === "DELETE") {
      const referencedOrderItems = await db.orderItem.count({
        where: {
          productId: {
            in: productIds,
          },
        },
      });

      if (referencedOrderItems > 0) {
        return NextResponse.json(
          {
            error:
              "Some selected products are already used in orders. Archive them instead of deleting.",
          },
          { status: 400 }
        );
      }

      await db.product.deleteMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        deleted: productIds.length,
      });
    }

    const updateData = getBulkUpdateData(action);

    if (!updateData) {
      return NextResponse.json(
        { error: "Invalid bulk action" },
        { status: 400 }
      );
    }

    await db.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: updateData,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      updated: productIds.length,
    });
  } catch (error) {
    console.error("Bulk product action error:", error);

    return NextResponse.json(
      { error: "Failed to complete bulk product action" },
      { status: 500 }
    );
  }
}

function getBulkUpdateData(action: string) {
  switch (action) {
    case "SET_ACTIVE":
      return { status: "ACTIVE" as const };
    case "SET_DRAFT":
      return { status: "DRAFT" as const };
    case "SET_ARCHIVED":
      return { status: "ARCHIVED" as const };
    case "FEATURE_ON":
      return { isFeatured: true };
    case "FEATURE_OFF":
      return { isFeatured: false };
    case "HOT_DEAL_ON":
      return { isHotDeal: true };
    case "HOT_DEAL_OFF":
      return { isHotDeal: false };
    case "NEW_ARRIVAL_ON":
      return { isNewArrival: true };
    case "NEW_ARRIVAL_OFF":
      return { isNewArrival: false };
    case "WORLD_CUP_ON":
      return { isWorldCup: true };
    case "WORLD_CUP_OFF":
      return { isWorldCup: false };
    default:
      return null;
  }
}