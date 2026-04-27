import { db } from "./db";

export async function getActiveHeroBanners() {
  const now = new Date();

  return db.banner.findMany({
    where: {
      type: "HERO",
      isActive: true,
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      image: true,
      mobileImage: true,
      ctaText: true,
      ctaUrl: true,
      sortOrder: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
    },
  });
}

export async function getAllHeroBanners() {
  return db.banner.findMany({
    where: {
      type: "HERO",
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getHeroBannerById(id: string) {
  return db.banner.findFirst({
    where: {
      id,
      type: "HERO",
    },
  });
}