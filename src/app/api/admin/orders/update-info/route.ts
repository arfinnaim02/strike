import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@prisma/client";
import { db } from "../../../../../lib/db";

const validPaymentStatuses: PaymentStatus[] = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const orderId = String(formData.get("orderId") || "").trim();
    const shippingName = String(formData.get("shippingName") || "").trim();
    const shippingPhone = String(formData.get("shippingPhone") || "").trim();
    const shippingAddress = String(formData.get("shippingAddress") || "").trim();
    const shippingCity = String(formData.get("shippingCity") || "").trim();
    const shippingDistrict = String(formData.get("shippingDistrict") || "").trim();
    const shippingDivision = String(formData.get("shippingDivision") || "").trim();
    const adminNote = String(formData.get("adminNote") || "").trim();
    const paymentStatus = String(formData.get("paymentStatus") || "").trim() as PaymentStatus;
    const isCodVerified = formData.get("isCodVerified") === "true";

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    if (!shippingName || !shippingPhone || !shippingAddress) {
      return new NextResponse("Name, phone, and address are required", {
        status: 400,
      });
    }

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return new NextResponse("Invalid payment status", { status: 400 });
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingDistrict,
        shippingDivision,
        adminNote: adminNote || null,
        paymentStatus,
        isCodVerified,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url));
  } catch (error) {
    console.error("Update order info error:", error);
    return new NextResponse("Failed to update order information", {
      status: 500,
    });
  }
}