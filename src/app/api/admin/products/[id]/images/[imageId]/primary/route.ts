import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../../../lib/db";

type RouteContext = {
  params: Promise<{ id: string; imageId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: productId, imageId } = await context.params;

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const image = await db.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
      select: {
        id: true,
      },
    });

    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    await db.$transaction([
      db.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      db.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.redirect(new URL(`/admin/products/${productId}`, request.url));
  } catch (error) {
    console.error("Set primary image error:", error);
    return new NextResponse("Failed to set primary image", { status: 500 });
  }
}