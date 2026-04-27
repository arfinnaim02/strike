import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const categoryId = String(formData.get("categoryId") || "").trim();
    const collection = String(formData.get("collection") || "").trim();
    const basePriceRaw = String(formData.get("basePrice") || "").trim();
    const salePriceRaw = String(formData.get("salePrice") || "").trim();
    const status = String(formData.get("status") || "DRAFT").trim();

    const isFeatured = formData.get("isFeatured") === "true";
    const isHotDeal = formData.get("isHotDeal") === "true";
    const isNewArrival = formData.get("isNewArrival") === "true";
    const isWorldCup = formData.get("isWorldCup") === "true";

    if (!name || !slug || !description || !categoryId || !basePriceRaw) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const basePrice = Number(basePriceRaw);
    const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

    if (Number.isNaN(basePrice) || basePrice < 0) {
      return new NextResponse("Invalid base price", { status: 400 });
    }

    if (
      salePriceRaw &&
      (salePrice === null || Number.isNaN(salePrice) || salePrice < 0)
    ) {
      return new NextResponse("Invalid sale price", { status: 400 });
    }

    if (salePrice !== null && salePrice > basePrice) {
      return new NextResponse("Sale price cannot be greater than base price", {
        status: 400,
      });
    }

    const existingSlug = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSlug) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    await db.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        collection: collection || null,
        basePrice: basePrice.toString(),
        salePrice: salePrice !== null ? salePrice.toString() : null,
        status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
        isFeatured,
        isHotDeal,
        isNewArrival,
        isWorldCup,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.redirect(new URL("/admin/products", request.url));
  } catch (error) {
    console.error("Create product error:", error);
    return new NextResponse("Failed to create product", { status: 500 });
  }
}