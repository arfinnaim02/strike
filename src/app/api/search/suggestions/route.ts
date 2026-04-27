import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { collection: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        {
          category: {
            name: { contains: q, mode: "insensitive" },
          },
        },
      ],
    },
    take: 8,
    orderBy: [{ isFeatured: "desc" }, { totalSold: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      salePrice: true,
      basePrice: true,
      category: {
        select: {
          name: true,
        },
      },
      images: {
        where: {
          isPrimary: true,
        },
        take: 1,
        select: {
          url: true,
        },
      },
    },
  });

  return NextResponse.json({
    suggestions: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.salePrice ?? product.basePrice),
      categoryName: product.category.name,
      image: product.images[0]?.url ?? null,
    })),
  });
}