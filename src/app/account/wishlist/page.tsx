import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { db } from "../../../lib/db";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { StoreProductCard } from "../../../components/store/store-product-card";

function mapProduct(item: {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: unknown;
    salePrice: unknown;
    totalSold: number;
    collection: string | null;
    isNewArrival: boolean;
    isHotDeal: boolean;
    isWorldCup: boolean;
    category: { name: string };
    images: { url: string; altText: string | null }[];
    variants: { stockQty: number }[];
  };
}) {
  const product = item.product;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    totalSold: product.totalSold,
    collection: product.collection,
    categoryName: product.category.name,
    image: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? product.name,
    totalStock,
    isNewArrival: product.isNewArrival,
    isHotDeal: product.isHotDeal,
    isWorldCup: product.isWorldCup,
    isWishlisted: true,
  };
}

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/wishlist");
  }

  const wishlist = await db.wishlistItem.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          salePrice: true,
          totalSold: true,
          collection: true,
          isNewArrival: true,
          isHotDeal: true,
          isWorldCup: true,
          category: {
            select: {
              name: true,
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
      },
    },
  });

  const products = wishlist.map(mapProduct);

  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/account" className="text-muted">
          ← Back to Account
        </Link>

        <div style={{ marginTop: 28, marginBottom: 28 }}>
          <div className="lux-eyebrow">Saved Products</div>
          <h1 className="section-title">My Wishlist</h1>

          <p
            className="text-muted"
            style={{ marginTop: 14, maxWidth: 720, lineHeight: 1.8 }}
          >
            Products you saved for later. Open any product to choose edition,
            size, and add it to cart.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="dashboard-card">
            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 14 }}
            >
              <div className="dashboard-card-title">No saved products yet.</div>
              <p className="text-muted">
                Browse the store and tap the heart icon on products you like.
              </p>

              <Link href="/shop" className="btn-primary" style={{ width: "fit-content" }}>
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="premium-product-grid">
            {products.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}