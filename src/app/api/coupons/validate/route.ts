import { NextResponse } from "next/server";
import { validateCouponForCheckout } from "../../../../lib/coupons";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body?.code || "").trim();
    const subtotal = Number(body?.subtotal || 0);
    const deliveryCharge = Number(body?.deliveryCharge || 0);
    const guestPhone = body?.guestPhone ? String(body.guestPhone).trim() : null;

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid subtotal" },
        { status: 400 }
      );
    }

    if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid delivery charge" },
        { status: 400 }
      );
    }

    const result = await validateCouponForCheckout({
      code,
      subtotal,
      deliveryCharge,
      guestPhone,
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}