import { OrderStatus, PaymentStatus, TicketStatus } from "@prisma/client";
import { db } from "./db";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

function toNumber(value: unknown) {
  if (value == null) return 0;
  return Number(value);
}

export async function getDashboardData() {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [
    todayPayments,
    newOrdersToday,
    pendingOrders,
    lowStockItems,
    recentOrders,
    pendingReviews,
    openTickets,
    topProductsRaw,
  ] = await Promise.all([
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
        paidAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),

    db.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),

    db.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),

    db.productVariant.count({
      where: {
        isActive: true,
        stockQty: {
          lte: 5,
        },
      },
    }),

    db.order.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        shippingName: true,
        shippingDistrict: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            qty: true,
          },
        },
      },
    }),

    db.review.count({
      where: {
        isApproved: false,
      },
    }),

    db.supportTicket.count({
      where: {
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    }),

    db.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        qty: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
      take: 4,
    }),
  ]);

  const topProductIds = topProductsRaw.map((item) => item.productId);

  const topProductsMap = await db.product.findMany({
    where: {
      id: {
        in: topProductIds,
      },
    },
    select: {
      id: true,
      name: true,
      collection: true,
      basePrice: true,
    },
  });

  const productMap = new Map(topProductsMap.map((p) => [p.id, p]));

  const topProducts = topProductsRaw.map((item, index) => {
    const product = productMap.get(item.productId);

    return {
      rank: index + 1,
      name: product?.name ?? "Unknown Product",
      meta: `${product?.collection ?? "General"} · ৳${toNumber(product?.basePrice).toLocaleString("en-BD")}`,
      sold: toNumber(item._sum.qty),
      revenue: toNumber(item._sum.totalPrice),
    };
  });

  const lowStockPreview = await db.productVariant.findMany({
    where: {
      isActive: true,
      stockQty: {
        lte: 5,
      },
    },
    take: 4,
    orderBy: {
      stockQty: "asc",
    },
    select: {
      stockQty: true,
      size: true,
      product: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    kpis: {
      todayRevenue: toNumber(todayPayments._sum.amount),
      newOrdersToday,
      pendingOrders,
      lowStockItems,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: toNumber(order.total),
    })),
    alerts: {
      lowStockPreview,
      pendingReviews,
      openTickets,
    },
    topProducts,
  };
}