import { db } from "./db";

export async function getAdminOrderDetail(orderId: string) {
  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      items: {
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          productId: true,
          variantId: true,

          productName: true,
          variantInfo: true,
          image: true,
          sku: true,

          qty: true,
          unitPrice: true,
          totalPrice: true,

          product: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },

          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              sleeveType: true,
              edition: true,
              sku: true,
              stockQty: true,
              isActive: true,
            },
          },
        },
      },

      payments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          method: true,
          amount: true,
          status: true,
          transactionId: true,
          paidAt: true,
          createdAt: true,
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
          changedBy: true,
          createdAt: true,
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
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,

    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,

    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,

    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingDistrict: order.shippingDistrict,
    shippingDivision: order.shippingDivision,

    customerNote: order.customerNote,
    adminNote: order.adminNote,

    isCodVerified: order.isCodVerified,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,

    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    deliveryCharge: Number(order.deliveryCharge),
    total: Number(order.total),

    user: order.user,

    items: order.items.map((item) => ({
      id: item.id,

      productId: item.productId,
      variantId: item.variantId,

      productName: item.productName,
      productSlug: item.product?.slug ?? "",
      image: item.image,
      sku: item.sku,

      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),

      variantInfo:
        item.variantInfo ||
        [
          item.variant?.size,
          item.variant?.color,
          item.variant?.sleeveType,
          item.variant?.edition,
        ]
          .filter(Boolean)
          .join(" / ") ||
        null,

      variant: item.variant
        ? {
            id: item.variant.id,
            size: item.variant.size,
            color: item.variant.color,
            sleeveType: item.variant.sleeveType,
            edition: item.variant.edition,
            sku: item.variant.sku,
            stockQty: item.variant.stockQty,
            isActive: item.variant.isActive,
          }
        : null,
    })),

    payments: order.payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    })),

    statusHistory: order.statusHistory,

    shipments: order.shipments,
  };
}

export async function getOrderEditableProducts() {
  const products = await db.product.findMany({
    where: {
      status: {
        in: ["ACTIVE", "DRAFT"],
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      images: {
        where: {
          isPrimary: true,
        },
        select: {
          url: true,
        },
        take: 1,
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          sleeveType: true,
          edition: true,
          stockQty: true,
          priceOffset: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.url ?? null,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      sleeveType: variant.sleeveType,
      edition: variant.edition,
      stockQty: variant.stockQty,
      priceOffset: Number(variant.priceOffset),
    })),
  }));
}