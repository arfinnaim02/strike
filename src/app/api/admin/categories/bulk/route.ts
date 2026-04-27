import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const action = String(body.action || "");
    const categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { error: "No categories selected" },
        { status: 400 }
      );
    }

    if (action === "DELETE") {
      const categoriesWithProducts = await db.category.count({
        where: {
          id: {
            in: categoryIds,
          },
          products: {
            some: {},
          },
        },
      });

      if (categoriesWithProducts > 0) {
        return NextResponse.json(
          {
            error:
              "Some selected categories have products. Move/archive products first, or deactivate the category instead.",
          },
          { status: 400 }
        );
      }

      const categoriesWithChildren = await db.category.count({
        where: {
          id: {
            in: categoryIds,
          },
          children: {
            some: {},
          },
        },
      });

      if (categoriesWithChildren > 0) {
        return NextResponse.json(
          {
            error:
              "Some selected categories have child categories. Delete/move children first, or deactivate the category instead.",
          },
          { status: 400 }
        );
      }

      await db.category.deleteMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
      });

      revalidatePath("/admin/categories");
      revalidatePath("/shop");
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        deleted: categoryIds.length,
      });
    }

    const updateData = getBulkUpdateData(action);

    if (!updateData) {
      return NextResponse.json(
        { error: "Invalid bulk action" },
        { status: 400 }
      );
    }

    await db.category.updateMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      updated: categoryIds.length,
    });
  } catch (error) {
    console.error("Bulk category action error:", error);

    return NextResponse.json(
      { error: "Failed to complete bulk category action" },
      { status: 500 }
    );
  }
}

function getBulkUpdateData(action: string) {
  switch (action) {
    case "ACTIVATE":
      return { isActive: true };
    case "DEACTIVATE":
      return { isActive: false };
    case "FEATURE_ON":
      return { isFeatured: true };
    case "FEATURE_OFF":
      return { isFeatured: false };
    default:
      return null;
  }
}