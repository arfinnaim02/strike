import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const parentIdRaw = String(formData.get("parentId") || "").trim();
    const sortOrderRaw = String(formData.get("sortOrder") || "0").trim();
    const metaTitle = String(formData.get("metaTitle") || "").trim();
    const metaDesc = String(formData.get("metaDesc") || "").trim();

    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";

    const parentId = parentIdRaw || null;
    const sortOrder = Number(sortOrderRaw || 0);

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        isActive,
        isFeatured,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
      },
    });

    revalidatePath("/admin/categories");
    return NextResponse.redirect(new URL("/admin/categories", request.url));
  } catch (error) {
    console.error("Create category error:", error);
    return new NextResponse("Failed to create category", { status: 500 });
  }
}