import { db } from "./db";

export async function getAdminSidebarCounts() {
  const [ordersCount, inventoryCount, reviewsCount, supportCount] =
    await Promise.all([
      db.order.count({
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"],
          },
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
      db.review.count({
        where: {
          isApproved: false,
        },
      }),
      db.supportTicket.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      }),
    ]);

  return {
    ordersCount,
    inventoryCount,
    reviewsCount,
    supportCount,
  };
}