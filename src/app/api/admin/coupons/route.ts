import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const code = String(formData.get("code") || "").trim().toUpperCase();
    const description = String(formData.get("description") || "").trim();
    const discountType = String(formData.get("discountType") || "").trim();
    const discountValueRaw = String(formData.get("discountValue") || "").trim();
    const minOrderAmountRaw = String(formData.get("minOrderAmount") || "").trim();
    const maxDiscountRaw = String(formData.get("maxDiscount") || "").trim();
    const usageLimitRaw = String(formData.get("usageLimit") || "").trim();
    const perUserLimitRaw = String(formData.get("perUserLimit") || "1").trim();
    const startsAtRaw = String(formData.get("startsAt") || "").trim();
    const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
    const isActive = formData.get("isActive") === "true";

    if (!code || !discountType || !discountValueRaw) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const discountValue = Number(discountValueRaw);
    const minOrderAmount = minOrderAmountRaw ? Number(minOrderAmountRaw) : null;
    const maxDiscount = maxDiscountRaw ? Number(maxDiscountRaw) : null;
    const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : null;
    const perUserLimit = Number(perUserLimitRaw);

    if (Number.isNaN(discountValue) || discountValue < 0) {
      return new NextResponse("Invalid discount value", { status: 400 });
    }

    if (minOrderAmountRaw && (minOrderAmount === null || Number.isNaN(minOrderAmount) || minOrderAmount < 0)) {
      return new NextResponse("Invalid minimum order amount", { status: 400 });
    }

    if (maxDiscountRaw && (maxDiscount === null || Number.isNaN(maxDiscount) || maxDiscount < 0)) {
      return new NextResponse("Invalid maximum discount", { status: 400 });
    }

    if (usageLimitRaw && (usageLimit === null || Number.isNaN(usageLimit) || usageLimit < 1)) {
      return new NextResponse("Invalid usage limit", { status: 400 });
    }

    if (Number.isNaN(perUserLimit) || perUserLimit < 1) {
      return new NextResponse("Invalid per user limit", { status: 400 });
    }

    const existingCoupon = await db.coupon.findUnique({
      where: { code },
      select: { id: true },
    });

    if (existingCoupon) {
      return new NextResponse("Coupon code already exists", { status: 400 });
    }

    await db.coupon.create({
      data: {
        code,
        description: description || null,
        discountType: discountType as "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY",
        discountValue: discountValue.toString(),
        minOrderAmount: minOrderAmount !== null ? minOrderAmount.toString() : null,
        maxDiscount: maxDiscount !== null ? maxDiscount.toString() : null,
        usageLimit,
        perUserLimit,
        isActive,
        startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
        expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      },
    });

    revalidatePath("/admin/coupons");

    return NextResponse.redirect(new URL("/admin/coupons", request.url));
  } catch (error) {
    console.error("Create coupon error:", error);
    return new NextResponse("Failed to create coupon", { status: 500 });
  }
}