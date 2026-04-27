import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, message: "Login required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = String(body.productId || "").trim();

    if (!productId) {
      return NextResponse.json(
        { ok: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    await db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ ok: true, wished: true });
  } catch (error) {
    console.error("Wishlist add error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to add wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, message: "Login required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = String(searchParams.get("productId") || "").trim();

    if (!productId) {
      return NextResponse.json(
        { ok: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    await db.wishlistItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ ok: true, wished: false });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to remove wishlist" },
      { status: 500 }
    );
  }
}