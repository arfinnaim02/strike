import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const orderId = String(formData.get("orderId") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!orderId || !status) {
      return new NextResponse("Order ID and status are required", { status: 400 });
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "PROCESSING"
          | "PACKED"
          | "SHIPPED"
          | "OUT_FOR_DELIVERY"
          | "DELIVERED"
          | "CANCELLED"
          | "RETURN_REQUESTED"
          | "RETURNED"
          | "EXCHANGE_REQUESTED"
          | "EXCHANGED",
      },
    });

    await db.orderStatusHistory.create({
      data: {
        orderId,
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "PROCESSING"
          | "PACKED"
          | "SHIPPED"
          | "OUT_FOR_DELIVERY"
          | "DELIVERED"
          | "CANCELLED"
          | "RETURN_REQUESTED"
          | "RETURNED"
          | "EXCHANGE_REQUESTED"
          | "EXCHANGED",
        note: note || null,
        changedBy: "admin",
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url));
  } catch (error) {
    console.error("Update order status error:", error);
    return new NextResponse("Failed to update order status", { status: 500 });
  }
}