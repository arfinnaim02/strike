import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;

  const banner = await db.banner.findFirst({
    where: {
      id,
      type: "HERO",
    },
  });

  if (!banner) {
    return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  }

  return NextResponse.json(banner);
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: "Desktop image is required" },
        { status: 400 }
      );
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        title: body.title || null,
        subtitle: body.subtitle || null,
        image: body.image,
        mobileImage: body.mobileImage || null,
        ctaText: body.ctaText || null,
        ctaUrl: body.ctaUrl || null,
        sortOrder: Number(body.sortOrder || 0),
        isActive: Boolean(body.isActive ?? true),
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await db.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}