import { db } from "./db";

function mapRelatedProduct(product: {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  salePrice: unknown;
  totalSold: number;
  collection: string | null;
  isFeatured: boolean;
  isHotDeal: boolean;
  isNewArrival: boolean;
  isWorldCup: boolean;
  category: { name: string; slug: string };
  images: { url: string; altText: string | null }[];
  variants: { stockQty: number }[];
}) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    totalSold: product.totalSold,
    collection: product.collection,
    isFeatured: product.isFeatured,
    isHotDeal: product.isHotDeal,
    isNewArrival: product.isNewArrival,
    isWorldCup: product.isWorldCup,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    image: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.name,
    totalStock,
  };
}

export async function getProductDetailBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: {
          id: true,
          url: true,
          altText: true,
          isPrimary: true,
        },
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          sleeveType: true,
          edition: true,
          priceOffset: true,
          stockQty: true,
          lowStockAt: true,
        },
      },
      attributes: {
        select: {
          id: true,
          key: true,
          value: true,
        },
      },
      reviews: {
        where: {
          isApproved: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          isVerified: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const relatedProductsRaw = await db.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      status: "ACTIVE",
      OR: [
        {
          categoryId: product.categoryId,
        },
        ...(product.collection
          ? [
              {
                collection: {
                  equals: product.collection,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
        {
          isFeatured: true,
        },
        {
          isHotDeal: true,
        },
      ],
    },
    orderBy: [
      { isFeatured: "desc" },
      { isHotDeal: "desc" },
      { totalSold: "desc" },
      { createdAt: "desc" },
    ],
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      totalSold: true,
      collection: true,
      isFeatured: true,
      isHotDeal: true,
      isNewArrival: true,
      isWorldCup: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        where: {
          isPrimary: true,
        },
        select: {
          url: true,
          altText: true,
        },
        take: 1,
      },
      variants: {
        where: {
          isActive: true,
        },
        select: {
          stockQty: true,
        },
      },
    },
  });

  const variants = product.variants.map((variant) => ({
    ...variant,
    priceOffset: Number(variant.priceOffset),
  }));

  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQty, 0);

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    avgRating: Number(product.avgRating),
    variants,
    totalStock,
    relatedProducts: relatedProductsRaw.map(mapRelatedProduct),
  };
}