import { auth } from "../auth";
import { db } from "./db";

type ShopFilters = {
  category?: string;
  q?: string;
};

type StoreProductRaw = {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  salePrice: unknown;
  isFeatured?: boolean;
  isHotDeal?: boolean;
  isNewArrival?: boolean;
  isWorldCup?: boolean;
  totalSold: number;
  collection: string | null;
  category: { name: string; slug: string };
  images: { url: string; altText: string | null }[];
  variants: { stockQty: number }[];
};

async function getWishlistProductIds() {
  const session = await auth();

  if (!session?.user?.id) {
    return new Set<string>();
  }

  const wishlist = await db.wishlistItem.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      productId: true,
    },
  });

  return new Set(wishlist.map((item) => item.productId));
}

function mapStoreProduct(product: StoreProductRaw, wishlistIds: Set<string>) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    isFeatured: product.isFeatured ?? false,
    isHotDeal: product.isHotDeal ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isWorldCup: product.isWorldCup ?? false,
    isWishlisted: wishlistIds.has(product.id),
    totalSold: product.totalSold,
    collection: product.collection,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    image: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.name,
    totalStock,
  };
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  basePrice: true,
  salePrice: true,
  isFeatured: true,
  isHotDeal: true,
  isNewArrival: true,
  isWorldCup: true,
  totalSold: true,
  collection: true,
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
};

export async function getShopProducts(filters: ShopFilters = {}) {
  const categorySlug = filters.category?.trim();
  const q = filters.q?.trim();

  const [products, wishlistIds] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(categorySlug
          ? {
              OR: [
                {
                  category: {
                    slug: categorySlug,
                  },
                },
                {
                  category: {
                    parent: {
                      slug: categorySlug,
                    },
                  },
                },
              ],
            }
          : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
                { collection: { contains: q, mode: "insensitive" } },
                { shortDescription: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
                {
                  category: {
                    name: { contains: q, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        { isFeatured: "desc" },
        { isHotDeal: "desc" },
        { createdAt: "desc" },
      ],
      select: productSelect,
    }),
    getWishlistProductIds(),
  ]);

  return products.map((product) => mapStoreProduct(product, wishlistIds));
}

export async function getShopCategories() {
  const categories = await db.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      products: {
        where: {
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      },
      children: {
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          products: {
            where: {
              status: "ACTIVE",
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return categories.map((category) => {
    const ownProductCount = category.products.length;
    const childProductCount = category.children.reduce(
      (sum, child) => sum + child.products.length,
      0
    );

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: ownProductCount + childProductCount,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        productCount: child.products.length,
      })),
    };
  });
}

export async function getCategoryPageData(slug: string) {
  const [category, wishlistIds] = await Promise.all([
    db.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        metaTitle: true,
        metaDesc: true,
      },
    }),
    getWishlistProductIds(),
  ]);

  if (!category || !category.isActive) return null;

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      category: {
        slug,
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { isHotDeal: "desc" },
      { createdAt: "desc" },
    ],
    select: productSelect,
  });

  return {
    category,
    products: products.map((product) => mapStoreProduct(product, wishlistIds)),
  };
}

function collectionTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getCollectionPageData(slug: string) {
  const normalizedSlug = slug.trim();
  const collectionValue = collectionTitleFromSlug(normalizedSlug);

  const flagMap: Record<string, "isNewArrival" | "isHotDeal" | "isWorldCup"> = {
    "new-arrivals": "isNewArrival",
    "hot-deals": "isHotDeal",
    "world-cup-2026": "isWorldCup",
  };

  const flagKey = flagMap[normalizedSlug];

  const [products, wishlistIds] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(flagKey
          ? {
              [flagKey]: true,
            }
          : {
              collection: {
                equals: collectionValue,
                mode: "insensitive",
              },
            }),
      },
      orderBy: [
        { isFeatured: "desc" },
        { isHotDeal: "desc" },
        { createdAt: "desc" },
      ],
      select: productSelect,
    }),
    getWishlistProductIds(),
  ]);

  const titleMap: Record<string, string> = {
    "world-cup-2026": "World Cup 2026",
    "club-jerseys": "Club Jerseys",
    "new-arrivals": "New Arrivals",
    "hot-deals": "Hot Deals",
    winter: "Winter Collection",
  };

  const descriptionMap: Record<string, string> = {
    "world-cup-2026":
      "Explore premium national team kits and supporter jerseys for the 2026 season.",
    "club-jerseys": "Top club jerseys for fans who want standout matchday style.",
    "new-arrivals": "Freshly added products and the latest drops from Strike Sports.",
    "best-sellers": "Our most popular picks, trusted by customers across Bangladesh.",
    "hot-deals": "Limited-time offers and discounted products worth grabbing fast.",
    winter: "Cold-weather sportswear and layering essentials built for comfort.",
  };

  return {
    collection: {
      slug: normalizedSlug,
      title: titleMap[normalizedSlug] ?? collectionValue,
      description:
        descriptionMap[normalizedSlug] ??
        `Explore products from the ${
          titleMap[normalizedSlug] ?? collectionValue
        } collection.`,
    },
    products: products.map((product) => mapStoreProduct(product, wishlistIds)),
  };
}