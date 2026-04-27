import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { db } from "../../../../../lib/db";

const validStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "EXCHANGE_REQUESTED",
  "EXCHANGED",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = String(body.action || "");
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];
    const status = String(body.status || "") as OrderStatus;

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "No orders selected" },
        { status: 400 }
      );
    }

    if (action === "CHANGE_STATUS") {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid order status" },
          { status: 400 }
        );
      }

      await db.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: {
            id: {
              in: orderIds,
            },
          },
          data: {
            status,
          },
        });

        await tx.orderStatusHistory.createMany({
          data: orderIds.map((orderId: string) => ({
            orderId,
            status,
            note: `Bulk status update to ${status}`,
            changedBy: "admin",
          })),
        });
      });

      revalidatePath("/admin/orders");

      return NextResponse.json({
        success: true,
        updated: orderIds.length,
      });
    }

    if (action === "DELETE") {
      await db.$transaction(async (tx) => {
        await tx.payment.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });

        await tx.shipment.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });

        await tx.returnRequest.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });

        await tx.orderStatusHistory.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });

        await tx.orderItem.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });

        await tx.order.deleteMany({
          where: {
            id: {
              in: orderIds,
            },
          },
        });
      });

      revalidatePath("/admin/orders");

      return NextResponse.json({
        success: true,
        deleted: orderIds.length,
      });
    }

    return NextResponse.json(
      { error: "Invalid bulk action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Bulk order action error:", error);

    return NextResponse.json(
      { error: "Failed to complete bulk order action" },
      { status: 500 }
    );
  }
}