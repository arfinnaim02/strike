import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "../../../../../../lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const coupon = await db.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!coupon) {
      return new NextResponse("Coupon not found", { status: 404 });
    }

    await db.coupon.update({
      where: { id },
      data: {
        isActive: !coupon.isActive,
      },
    });

    revalidatePath("/admin/coupons");

    return NextResponse.redirect(new URL("/admin/coupons", request.url));
  } catch (error) {
    console.error("Toggle coupon error:", error);
    return new NextResponse("Failed to toggle coupon", { status: 500 });
  }
}