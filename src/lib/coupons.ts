import { DiscountType, Prisma } from "@prisma/client";
import { db } from "./db";

type GetAdminCouponsInput = {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
};

export async function getAdminCoupons({
  search = "",
  page = 1,
  pageSize = 20,
  status = "",
  type = "",
}: GetAdminCouponsInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const trimmedSearch = search.trim();

  const where: Prisma.CouponWhereInput = {
    ...(status === "ACTIVE"
      ? { isActive: true }
      : status === "INACTIVE"
      ? { isActive: false }
      : {}),

    ...(type
      ? {
          discountType: type as DiscountType,
        }
      : {}),

    ...(trimmedSearch
      ? {
          OR: [
            {
              code: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [coupons, totalCoupons] = await Promise.all([
    db.coupon.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: safePageSize,
    }),
    db.coupon.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCoupons / safePageSize));

  return {
    coupons: coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount:
        coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null,
      maxDiscount:
        coupon.maxDiscount !== null ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      perUserLimit: coupon.perUserLimit,
      isActive: coupon.isActive,
      startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      createdAt: coupon.createdAt.toISOString(),
    })),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalCoupons,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    filters: {
      search: trimmedSearch,
      status,
      type,
    },
  };
}

type ValidateCouponInput = {
  code: string;
  subtotal: number;
  deliveryCharge: number;
  guestPhone?: string | null;
  userId?: string | null;
};

type ValidatedCouponResult =
  | {
      ok: true;
      couponId: string;
      code: string;
      description: string | null;
      discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY";
      discountAmount: number;
      finalTotal: number;
      freeDelivery: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export async function validateCouponForCheckout({
  code,
  subtotal,
  deliveryCharge,
  guestPhone,
  userId,
}: ValidateCouponInput): Promise<ValidatedCouponResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { ok: false, message: "Coupon code is required" };
  }

  const coupon = await db.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon) {
    return { ok: false, message: "Coupon not found" };
  }

  if (!coupon.isActive) {
    return { ok: false, message: "Coupon is inactive" };
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, message: "Coupon is not active yet" };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, message: "Coupon has expired" };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, message: "Coupon usage limit reached" };
  }

  const minOrderAmount =
    coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null;

  if (minOrderAmount !== null && subtotal < minOrderAmount) {
    return {
      ok: false,
      message: `Minimum order amount is ৳${minOrderAmount.toLocaleString("en-BD")}`,
    };
  }

  if (coupon.perUserLimit > 0) {
    const existingUseCount = await db.order.count({
      where: {
        couponId: coupon.id,
        ...(userId ? { userId } : guestPhone ? { guestPhone } : {}),
      },
    });

    if (existingUseCount >= coupon.perUserLimit) {
      return { ok: false, message: "Coupon usage limit reached for this customer" };
    }
  }

  const discountValue = Number(coupon.discountValue);
  const maxDiscount =
    coupon.maxDiscount !== null ? Number(coupon.maxDiscount) : null;

  let discountAmount = 0;
  let freeDelivery = false;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (subtotal * discountValue) / 100;

    if (maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }
  } else if (coupon.discountType === "FIXED_AMOUNT") {
    discountAmount = Math.min(discountValue, subtotal);

    if (maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }
  } else if (coupon.discountType === "FREE_DELIVERY") {
    discountAmount = deliveryCharge;
    freeDelivery = true;
  }

  discountAmount = Math.max(0, Number(discountAmount.toFixed(2)));
  const finalTotal = Math.max(
    0,
    Number((subtotal + deliveryCharge - discountAmount).toFixed(2))
  );

  return {
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountAmount,
    finalTotal,
    freeDelivery,
  };
}