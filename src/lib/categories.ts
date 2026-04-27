import { Prisma } from "@prisma/client";
import { db } from "./db";

type GetAdminCategoriesInput = {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
};

export async function getAdminCategories({
  search = "",
  page = 1,
  pageSize = 20,
  status = "",
}: GetAdminCategoriesInput = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const trimmedSearch = search.trim();

  const where: Prisma.CategoryWhereInput = {
    ...(status === "ACTIVE"
      ? { isActive: true }
      : status === "INACTIVE"
        ? { isActive: false }
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
              parent: {
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

  const [categories, totalCategories] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: safePageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        parent: {
          select: {
            name: true,
          },
        },
        isActive: true,
        isFeatured: true,
        sortOrder: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    }),

    db.category.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCategories / safePageSize));

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentName: category.parent?.name ?? null,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt.toISOString(),
      productCount: category._count.products,
      childCount: category._count.children,
    })),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalCategories,
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

export async function getCategories() {
  return db.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}