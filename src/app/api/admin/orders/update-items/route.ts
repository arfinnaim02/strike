import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

type IncomingItem = {
  orderItemId: string;
  productId: string;
  variantId: string;
  qty: string;
  unitPrice: string;
  remove: boolean;
};

function variantLabel(variant: {
  size: string | null;
  color: string | null;
  sleeveType: string | null;
  edition: string | null;
}) {
  return [variant.size, variant.color, variant.sleeveType, variant.edition]
    .filter(Boolean)
    .join(" / ");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const orderId = String(formData.get("orderId") || "").trim();
    const itemsJson = String(formData.get("itemsJson") || "[]");

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const incoming = JSON.parse(itemsJson) as IncomingItem[];

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    await db.$transaction(async (tx) => {
      for (const item of incoming) {
        const oldItem = order.items.find((old) => old.id === item.orderItemId);
        if (!oldItem) continue;

        const newQty = Math.max(1, Number(item.qty || 1));
        const newUnitPrice = Math.max(0, Number(item.unitPrice || 0));

        if (Number.isNaN(newQty) || Number.isNaN(newUnitPrice)) {
          throw new Error("Invalid item quantity or price");
        }

        if (item.remove) {
          if (oldItem.variantId) {
            await tx.productVariant.update({
              where: { id: oldItem.variantId },
              data: {
                stockQty: {
                  increment: oldItem.qty,
                },
              },
            });
          }

          await tx.product.update({
            where: { id: oldItem.productId },
            data: {
              totalSold: {
                decrement: oldItem.qty,
              },
            },
          });

          await tx.orderItem.delete({
            where: { id: oldItem.id },
          });

          continue;
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const variant = item.variantId
          ? await tx.productVariant.findUnique({
              where: { id: item.variantId },
            })
          : null;

        if (item.variantId && !variant) {
          throw new Error("Variant not found");
        }

        const oldVariantId = oldItem.variantId;
        const newVariantId = item.variantId || null;

        if (oldVariantId) {
          await tx.productVariant.update({
            where: { id: oldVariantId },
            data: {
              stockQty: {
                increment: oldItem.qty,
              },
            },
          });
        }

        if (newVariantId) {
          const freshVariant = await tx.productVariant.findUnique({
            where: { id: newVariantId },
          });

          if (!freshVariant || freshVariant.stockQty < newQty) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          await tx.productVariant.update({
            where: { id: newVariantId },
            data: {
              stockQty: {
                decrement: newQty,
              },
            },
          });
        }

        if (oldItem.productId !== item.productId) {
          await tx.product.update({
            where: { id: oldItem.productId },
            data: {
              totalSold: {
                decrement: oldItem.qty,
              },
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              totalSold: {
                increment: newQty,
              },
            },
          });
        } else {
          const qtyDiff = newQty - oldItem.qty;

          if (qtyDiff !== 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                totalSold: {
                  increment: qtyDiff,
                },
              },
            });
          }
        }

        await tx.orderItem.update({
          where: { id: oldItem.id },
          data: {
            productId: item.productId,
            variantId: newVariantId,
            productName: product.name,
            variantInfo: variant ? variantLabel(variant) : null,
            sku: variant?.sku ?? null,
            image: product.images[0]?.url ?? oldItem.image,
            qty: newQty,
            unitPrice: newUnitPrice.toString(),
            totalPrice: (newQty * newUnitPrice).toString(),
          },
        });
      }

      const updatedItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      if (updatedItems.length === 0) {
        throw new Error("Order must contain at least one item");
      }

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0
      );

      const deliveryCharge = subtotal > 999 ? 0 : 80;
      const discountAmount = Number(order.discountAmount);
      const total = Math.max(0, subtotal + deliveryCharge - discountAmount);

      await tx.order.update({
        where: { id: orderId },
        data: {
          subtotal: subtotal.toString(),
          deliveryCharge: deliveryCharge.toString(),
          total: total.toString(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          note: "Order items updated by admin",
          changedBy: "admin",
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, request.url));
  } catch (error) {
    console.error("Update order items error:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update order items",
      { status: 500 }
    );
  }
}