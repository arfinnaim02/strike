import { Prisma } from "@prisma/client";
import { db } from "./db";

type GetAdminCustomersInput = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminCustomers({
  search = "",
  page = 1,
  pageSize = 20,
}: GetAdminCustomersInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const trimmedSearch = search.trim();

  const where: Prisma.OrderWhereInput = {
    ...(trimmedSearch
      ? {
          OR: [
            { shippingName: { contains: trimmedSearch, mode: "insensitive" } },
            { shippingPhone: { contains: trimmedSearch, mode: "insensitive" } },
            { shippingAddress: { contains: trimmedSearch, mode: "insensitive" } },
            { shippingDistrict: { contains: trimmedSearch, mode: "insensitive" } },
            { orderNumber: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingDistrict: true,
      shippingDivision: true,
      guestEmail: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  const customerMap = new Map<string, {
    phone: string;
    name: string;
    email: string | null;
    address: string;
    city: string;
    district: string;
    division: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: Date;
    lastOrderNumber: string;
    lastStatus: string;
  }>();

  for (const order of orders) {
    const phone = order.shippingPhone.trim();
    if (!phone) continue;

    const existing = customerMap.get(phone);

    if (!existing) {
      customerMap.set(phone, {
        phone,
        name: order.shippingName,
        email: order.guestEmail,
        address: order.shippingAddress,
        city: order.shippingCity,
        district: order.shippingDistrict,
        division: order.shippingDivision,
        totalOrders: 1,
        totalSpent: Number(order.total),
        lastOrderAt: order.createdAt,
        lastOrderNumber: order.orderNumber,
        lastStatus: order.status,
      });
    } else {
      existing.totalOrders += 1;
      existing.totalSpent += Number(order.total);

      if (order.createdAt > existing.lastOrderAt) {
        existing.name = order.shippingName;
        existing.email = order.guestEmail;
        existing.address = order.shippingAddress;
        existing.city = order.shippingCity;
        existing.district = order.shippingDistrict;
        existing.division = order.shippingDivision;
        existing.lastOrderAt = order.createdAt;
        existing.lastOrderNumber = order.orderNumber;
        existing.lastStatus = order.status;
      }
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime()
  );

  const totalCustomers = customers.length;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / safePageSize));

  return {
    customers: customers.slice(skip, skip + safePageSize),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalCustomers,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    filters: {
      search: trimmedSearch,
    },
  };
}

export async function getAdminCustomerByPhone(phone: string) {
  const decodedPhone = decodeURIComponent(phone).trim();

  const orders = await db.order.findMany({
    where: {
      shippingPhone: decodedPhone,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingDistrict: true,
      shippingDivision: true,
      guestEmail: true,
      total: true,
      subtotal: true,
      discountAmount: true,
      deliveryCharge: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          variantInfo: true,
          qty: true,
          totalPrice: true,
          image: true,
        },
      },
    },
  });

  if (orders.length === 0) return null;

  const latestOrder = orders[0];

  return {
    phone: decodedPhone,
    name: latestOrder.shippingName,
    email: latestOrder.guestEmail,
    address: latestOrder.shippingAddress,
    city: latestOrder.shippingCity,
    district: latestOrder.shippingDistrict,
    division: latestOrder.shippingDivision,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + Number(order.total), 0),
    orders: orders.map((order) => ({
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      deliveryCharge: Number(order.deliveryCharge),
      items: order.items.map((item) => ({
        ...item,
        totalPrice: Number(item.totalPrice),
      })),
    })),
  };
}