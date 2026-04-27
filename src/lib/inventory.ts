import { Prisma } from "@prisma/client";
import { db } from "./db";

function sizeSortValue(size: string | null) {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
  if (!size) return 999;
  const index = order.indexOf(size.toUpperCase());
  return index === -1 ? 998 : index;
}

type GetInventoryProductsSummaryInput = {
  search?: string;
  page?: number;
  pageSize?: number;
  stock?: string;
};

export async function getInventoryProductsSummary({
  search = "",
  page = 1,
  pageSize = 20,
  stock = "",
}: GetInventoryProductsSummaryInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const trimmedSearch = search.trim();

  const where: Prisma.ProductWhereInput = {
    status: {
      in: ["ACTIVE", "DRAFT"],
    },
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
              category: {
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

  const [productsRaw, totalProducts] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        category: {
          select: {
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            size: true,
            stockQty: true,
            lowStockAt: true,
            isActive: true,
          },
        },
      },
    }),

    db.product.count({
      where,
    }),
  ]);

  let mappedRows = productsRaw.map((product) => {
    const activeVariants = product.variants.filter((variant) => variant.isActive);
    const totalStock = activeVariants.reduce(
      (sum, variant) => sum + variant.stockQty,
      0
    );

    const lowStockVariantCount = activeVariants.filter(
      (variant) => variant.stockQty <= variant.lowStockAt
    ).length;

    const sizes = activeVariants
      .map((variant) => variant.size)
      .filter(Boolean) as string[];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      categoryName: product.category.name,
      variantCount: activeVariants.length,
      inactiveVariantCount: product.variants.length - activeVariants.length,
      totalStock,
      lowStockVariantCount,
      sizes,
    };
  });

  if (stock === "LOW") {
    mappedRows = mappedRows.filter((row) => row.lowStockVariantCount > 0);
  }

  if (stock === "OUT") {
    mappedRows = mappedRows.filter((row) => row.totalStock <= 0);
  }

  if (stock === "IN") {
    mappedRows = mappedRows.filter((row) => row.totalStock > 0);
  }

  const filteredTotal = mappedRows.length;
  const paginatedRows = mappedRows.slice(skip, skip + safePageSize);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / safePageSize));

  return {
    rows: paginatedRows,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalProducts: filteredTotal,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    filters: {
      search: trimmedSearch,
      stock,
    },
  };
}

export async function getProductsForInventoryForm() {
  return db.product.findMany({
    where: {
      status: {
        in: ["ACTIVE", "DRAFT"],
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getInventoryManagerProductById(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
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
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  if (!product) return null;

  const variants = [...product.variants]
    .sort((a, b) => {
      const sizeCompare = sizeSortValue(a.size) - sizeSortValue(b.size);
      if (sizeCompare !== 0) return sizeCompare;
      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      sleeveType: variant.sleeveType,
      edition: variant.edition,
      priceOffset: Number(variant.priceOffset),
      stockQty: variant.stockQty,
      lowStockAt: variant.lowStockAt,
      isActive: variant.isActive,
    }));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    categoryName: product.category.name,
    variants,
    totalStock: variants
      .filter((variant) => variant.isActive)
      .reduce((sum, variant) => sum + variant.stockQty, 0),
  };
}

export async function getInventoryRows() {
  const variants = await db.productVariant.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return variants.map((variant) => ({
    id: variant.id,
    productId: variant.product.id,
    productName: variant.product.name,
    productSlug: variant.product.slug,
    productStatus: variant.product.status,
    categoryName: variant.product.category.name,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    sleeveType: variant.sleeveType,
    edition: variant.edition,
    priceOffset: Number(variant.priceOffset),
    stockQty: variant.stockQty,
    lowStockAt: variant.lowStockAt,
    isActive: variant.isActive,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  }));
}

export async function getInventoryDetail(id: string) {
  const variant = await db.productVariant.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!variant) return null;

  return {
    id: variant.id,
    productId: variant.productId,
    productName: variant.product.name,
    productSlug: variant.product.slug,
    productStatus: variant.product.status,
    categoryName: variant.product.category.name,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    sleeveType: variant.sleeveType,
    edition: variant.edition,
    priceOffset: Number(variant.priceOffset),
    stockQty: variant.stockQty,
    lowStockAt: variant.lowStockAt,
    isActive: variant.isActive,
  };
}