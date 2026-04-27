import { db } from "./db";
import { getActiveHeroBanners } from "./banners";

function mapProduct(product: {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  salePrice: unknown;
  totalSold: number;
  collection: string | null;
  isHotDeal?: boolean;
  isNewArrival?: boolean;
  isWorldCup?: boolean;
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
    isHotDeal: product.isHotDeal ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isWorldCup: product.isWorldCup ?? false,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    image: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.name,
    totalStock,
  };
}

async function getProductsByFlag(
  flag: "isFeatured" | "isHotDeal" | "isNewArrival" | "isWorldCup"
) {
  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      [flag]: true,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      totalSold: true,
      collection: true,
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

  return products.map(mapProduct);
}

export async function getHomepageData() {
  const [featuredProducts, hotDeals, newArrivals, worldCupProducts, heroBanners] =
    await Promise.all([
      getProductsByFlag("isFeatured"),
      getProductsByFlag("isHotDeal"),
      getProductsByFlag("isNewArrival"),
      getProductsByFlag("isWorldCup"),
      getActiveHeroBanners(),
    ]);

  return {
    featuredProducts,
    hotDeals,
    newArrivals,
    worldCupProducts,
    heroBanners,
  };
}