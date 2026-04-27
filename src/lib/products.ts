import { Prisma, ProductStatus } from "@prisma/client";
import { db } from "./db";

type GetAdminProductsInput = {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
};

export async function getAdminProducts({
  search = "",
  page = 1,
  pageSize = 20,
  status = "",
}: GetAdminProductsInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const trimmedSearch = search.trim();

  const where: Prisma.ProductWhereInput = {
    ...(status
      ? {
          status: status as ProductStatus,
        }
      : {}),

    ...(trimmedSearch
      ? {
          OR: [
            {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              collection: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: trimmedSearch,
              },
            },
            {
              category: {
                name: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
            },
            {
              brand: {
                name: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [products, totalProducts] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safePageSize,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
        variants: {
          select: {
            stockQty: true,
          },
        },
      },
    }),

    db.product.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / safePageSize));

  return {
    products: products.map((product) => {
      const totalStock = product.variants.reduce(
        (sum, variant) => sum + variant.stockQty,
        0
      );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        category: product.category?.name ?? "Uncategorized",
        brand: product.brand?.name ?? "-",
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        isFeatured: product.isFeatured,
        isHotDeal: product.isHotDeal,
        isNewArrival: product.isNewArrival,
        isWorldCup: product.isWorldCup,
        totalSold: product.totalSold,
        totalStock,
        createdAt: product.createdAt.toISOString(),
      };
    }),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalProducts,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    filters: {
      search: trimmedSearch,
      status,
    },
  };
}

export async function getAdminProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      categoryId: true,
      collection: true,
      basePrice: true,
      salePrice: true,
      status: true,
      isFeatured: true,
      isHotDeal: true,
      isNewArrival: true,
      isWorldCup: true,
      images: {
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          url: true,
          publicId: true,
          altText: true,
          sortOrder: true,
          isPrimary: true,
          createdAt: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    collection: product.collection ?? "",
    basePrice: product.basePrice.toString(),
    salePrice: product.salePrice ? product.salePrice.toString() : "",
    status: product.status,
    isFeatured: product.isFeatured,
    isHotDeal: product.isHotDeal,
    isNewArrival: product.isNewArrival,
    isWorldCup: product.isWorldCup,
    images: product.images,
  };
}