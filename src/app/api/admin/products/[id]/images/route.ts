import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: productId } = await context.params;
    const formData = await request.formData();

    const url = String(formData.get("url") || "").trim();
    const altText = String(formData.get("altText") || "").trim();

    if (!url) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const imageCount = await db.productImage.count({
      where: { productId },
    });

    const hasPrimary = await db.productImage.findFirst({
      where: {
        productId,
        isPrimary: true,
      },
      select: { id: true },
    });

    await db.productImage.create({
      data: {
        productId,
        url,
        altText: altText || null,
        sortOrder: imageCount,
        isPrimary: !hasPrimary,
      },
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.redirect(new URL(`/admin/products/${productId}`, request.url));
  } catch (error) {
    console.error("Add product image error:", error);
    return new NextResponse("Failed to add product image", { status: 500 });
  }
}