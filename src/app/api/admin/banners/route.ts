import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
  const banners = await db.banner.findMany({
    where: {
      type: "HERO",
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: "Desktop image is required" },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        type: "HERO",
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
    console.error("Create banner error:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}