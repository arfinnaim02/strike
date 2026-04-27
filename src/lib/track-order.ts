import { db } from "./db";

export async function trackOrder(orderNumber: string, phone?: string) {
  if (!orderNumber.trim()) return null;

  const order = await db.order.findFirst({
    where: {
      orderNumber: orderNumber.trim(),
      ...(phone?.trim()
        ? {
            shippingPhone: phone.trim(),
          }
        : {}),
    },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          qty: true,
          unitPrice: true,
          totalPrice: true,
          variantInfo: true,
          image: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          transactionId: true,
          paidAt: true,
        },
      },
      shipments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          courier: true,
          trackingNumber: true,
          trackingUrl: true,
          shippedAt: true,
          deliveredAt: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    deliveryCharge: Number(order.deliveryCharge),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    payments: order.payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    })),
  };
}