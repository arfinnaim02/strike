import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../../lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();

    const url = String(body?.url || "").trim();
    const publicId = String(body?.publicId || "").trim();
    const altText = String(body?.altText || "").trim();

    if (!url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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

    const image = await db.productImage.create({
      data: {
        productId,
        url,
        publicId: publicId || null,
        altText: altText || null,
        sortOrder: imageCount,
        isPrimary: !hasPrimary,
      },
      select: {
        id: true,
        url: true,
        publicId: true,
        altText: true,
        isPrimary: true,
      },
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Register product image error:", error);
    return NextResponse.json(
      { error: "Failed to register product image" },
      { status: 500 }
    );
  }
}