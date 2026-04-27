import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { db } from "../../../lib/db";
import { validateCouponForCheckout } from "../../../lib/coupons";

type CartItem = {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
  size?: string | null;
  color?: string | null;
  sleeveType?: string | null;
  edition?: string | null;
};

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const t = Date.now().toString().slice(-6);
  return `SS-${y}${t}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const formData = await request.formData();

    const shippingName = String(formData.get("shippingName") || "").trim();
    const shippingPhone = String(formData.get("shippingPhone") || "").trim();
    const guestEmail = String(formData.get("guestEmail") || "").trim();
    const shippingAddress = String(formData.get("shippingAddress") || "").trim();
    const shippingCity = String(formData.get("shippingCity") || "").trim();
    const shippingDistrict = String(formData.get("shippingDistrict") || "").trim();
    const shippingDivision = String(formData.get("shippingDivision") || "").trim();
    const paymentMethod = String(formData.get("paymentMethod") || "COD").trim();
    const customerNote = String(formData.get("customerNote") || "").trim();
    const couponCode = String(formData.get("couponCode") || "").trim();

    const cartRaw = String(formData.get("cart") || "[]");
    const cart = JSON.parse(cartRaw) as CartItem[];

    if (
      !shippingName ||
      !shippingPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingDistrict ||
      !shippingDivision ||
      cart.length === 0
    ) {
      return new NextResponse("Missing required checkout fields", { status: 400 });
    }

    const variantIds = [...new Set(cart.map((item) => item.variantId))];

    const variants = await db.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
        isActive: true,
      },
      include: {
        product: true,
      },
    });

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

    for (const item of cart) {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        return new NextResponse(`Variant not found for ${item.name}`, { status: 400 });
      }

      if (variant.stockQty < item.qty) {
        return new NextResponse(
          `Insufficient stock for ${item.name}. Available: ${variant.stockQty}, requested: ${item.qty}`,
          { status: 400 }
        );
      }
    }

    const subtotal = Number(
      cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
    );

    const deliveryCharge = subtotal > 999 ? 0 : 80;

    let discountAmount = 0;
    let finalTotal = subtotal + deliveryCharge;
    let couponId: string | null = null;
    let normalizedCouponCode: string | null = null;

    if (couponCode) {
      const couponResult = await validateCouponForCheckout({
        code: couponCode,
        subtotal,
        deliveryCharge,
        guestPhone: shippingPhone,
        userId,
      });

      if (!couponResult.ok) {
        return new NextResponse(couponResult.message, { status: 400 });
      }

      discountAmount = couponResult.discountAmount;
      finalTotal = couponResult.finalTotal;
      couponId = couponResult.couponId;
      normalizedCouponCode = couponResult.code;
    }

    const result = await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          guestEmail: guestEmail || session?.user?.email || null,
          guestPhone: shippingPhone,

          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingDistrict,
          shippingDivision,

          subtotal: subtotal.toString(),
          discountAmount: discountAmount.toString(),
          deliveryCharge: deliveryCharge.toString(),
          total: finalTotal.toString(),

          status: "PENDING",
          paymentMethod: paymentMethod as
            | "COD"
            | "BKASH"
            | "NAGAD"
            | "SSLCOMMERZ"
            | "BANK_TRANSFER",
          paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PENDING",
          customerNote: customerNote || null,

          couponId,
          couponCode: normalizedCouponCode,

          items: {
            create: cart.map((item) => ({
              productId: item.id,
              variantId: item.variantId,
              productName: item.name,
              variantInfo: [item.size, item.color, item.sleeveType, item.edition]
                .filter(Boolean)
                .join(" / "),
              qty: item.qty,
              unitPrice: item.price.toString(),
              totalPrice: (item.price * item.qty).toString(),
              image: item.image || null,
            })),
          },

          statusHistory: {
            create: [
              {
                status: "PENDING",
                note: userId
                  ? "Order placed by logged-in customer"
                  : "Order placed from guest checkout",
                changedBy: "system",
              },
            ],
          },

          payments:
            paymentMethod !== "COD"
              ? {
                  create: [
                    {
                      method: paymentMethod as
                        | "BKASH"
                        | "NAGAD"
                        | "SSLCOMMERZ"
                        | "BANK_TRANSFER",
                      amount: finalTotal.toString(),
                      status: "PENDING",
                    },
                  ],
                }
              : undefined,
        },
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      for (const item of cart) {
        const variant = variantMap.get(item.variantId);

        if (!variant) {
          throw new Error(`Variant missing for ${item.name}`);
        }

        await tx.productVariant.update({
          where: {
            id: variant.id,
          },
          data: {
            stockQty: {
              decrement: item.qty,
            },
          },
        });

        await tx.product.update({
          where: {
            id: item.id,
          },
          data: {
            totalSold: {
              increment: item.qty,
            },
          },
        });
      }

      return order;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");
    revalidatePath("/admin/coupons");
    revalidatePath("/shop");
    revalidatePath("/account");
    revalidatePath("/account/orders");

    return NextResponse.redirect(
      new URL(`/checkout/success?order=${result.orderNumber}`, request.url)
    );
  } catch (error) {
    console.error("Checkout create order error:", error);
    return NextResponse.redirect(new URL("/checkout/failed", request.url));
  }
}