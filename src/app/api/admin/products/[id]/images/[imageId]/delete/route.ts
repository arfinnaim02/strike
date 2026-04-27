import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../../../lib/db";
import { cloudinary } from "../../../../../../../../lib/cloudinary";

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
        isPrimary: true,
        publicId: true,
      },
    });

    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary destroy error:", cloudinaryError);
      }
    }

    await db.productImage.delete({
      where: { id: imageId },
    });

    if (image.isPrimary) {
      const nextImage = await db.productImage.findFirst({
        where: { productId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });

      if (nextImage) {
        await db.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.redirect(new URL(`/admin/products/${productId}`, request.url));
  } catch (error) {
    console.error("Delete product image error:", error);
    return new NextResponse("Failed to delete product image", { status: 500 });
  }
}