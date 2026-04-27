import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";
import { getCurrentAdmin } from "../../../../../lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    if (parentIdRaw === id) {
      return new NextResponse("Category cannot be its own parent", {
        status: 400,
      });
    }

    const sortOrder = Number(sortOrderRaw || 0);

    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentIdRaw || null,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        isActive,
        isFeatured,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.redirect(new URL("/admin/categories", request.url));
  } catch (error) {
    console.error("Update category error:", error);
    return new NextResponse("Failed to update category", { status: 500 });
  }
}