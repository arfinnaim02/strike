import { OrderStatus, Prisma } from "@prisma/client";
import { db } from "./db";

type GetAdminOrdersInput = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminOrders({
  search = "",
  page = 1,
  pageSize = 20,
}: GetAdminOrdersInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;

  const trimmedSearch = search.trim();

  const where: Prisma.OrderWhereInput = trimmedSearch
    ? {
        OR: [
          {
            orderNumber: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
          {
            shippingName: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
          {
            shippingPhone: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
          {
            guestPhone: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
          {
            guestEmail: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [orders, totalOrders] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safePageSize,
      select: {
        id: true,
        orderNumber: true,
        shippingName: true,
        shippingPhone: true,
        shippingDistrict: true,
        shippingCity: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        isCodVerified: true,
        createdAt: true,
        guestEmail: true,
        items: {
          select: {
            qty: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    }),

    db.order.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / safePageSize));

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingDistrict: order.shippingDistrict,
      shippingCity: order.shippingCity,
      total: Number(order.total),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      isCodVerified: order.isCodVerified,
      createdAt: order.createdAt.toISOString(),
      email: order.user?.email ?? order.guestEmail ?? null,
      totalItems: order.items.reduce((sum, item) => sum + item.qty, 0),
    })),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalOrders,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    filters: {
      search: trimmedSearch,
    },
  };
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
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