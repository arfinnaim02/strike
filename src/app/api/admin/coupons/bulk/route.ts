import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = String(body.action || "");
    const couponIds = Array.isArray(body.couponIds) ? body.couponIds : [];

    if (couponIds.length === 0) {
      return NextResponse.json(
        { error: "No coupons selected" },
        { status: 400 }
      );
    }

    if (action === "DELETE") {
      const usedCoupons = await db.order.count({
        where: {
          couponId: {
            in: couponIds,
          },
        },
      });

      if (usedCoupons > 0) {
        return NextResponse.json(
          {
            error:
              "Some selected coupons are already used in orders. Deactivate them instead of deleting.",
          },
          { status: 400 }
        );
      }

      await db.coupon.deleteMany({
        where: {
          id: {
            in: couponIds,
          },
        },
      });

      revalidatePath("/admin/coupons");
      revalidatePath("/checkout");

      return NextResponse.json({
        success: true,
        deleted: couponIds.length,
      });
    }

    const updateData = getBulkUpdateData(action);

    if (!updateData) {
      return NextResponse.json(
        { error: "Invalid bulk action" },
        { status: 400 }
      );
    }

    await db.coupon.updateMany({
      where: {
        id: {
          in: couponIds,
        },
      },
      data: updateData,
    });

    revalidatePath("/admin/coupons");
    revalidatePath("/checkout");

    return NextResponse.json({
      success: true,
      updated: couponIds.length,
    });
  } catch (error) {
    console.error("Bulk coupon action error:", error);

    return NextResponse.json(
      { error: "Failed to complete bulk coupon action" },
      { status: 500 }
    );
  }
}

function getBulkUpdateData(action: string) {
  switch (action) {
    case "ACTIVATE":
      return { isActive: true };
    case "DEACTIVATE":
      return { isActive: false };
    case "RESET_USAGE":
      return { usageCount: 0 };
    default:
      return null;
  }
}