import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetailBySlug } from "../../../../lib/product-details";
import { ProductVariantSelector } from "../../../../components/cart/product-variant-selector";
import { ProductGallery } from "../../../../components/store/product-gallery";
import { SizeChartModal } from "../../../../components/store/size-chart-modal";
import { StoreProductCard } from "../../../../components/store/store-product-card";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function money(value: number | null) {
  if (value === null) return "-";
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function stockMessage(stock: number) {
  if (stock <= 0) return "Out of stock";
  if (stock <= 3) return `Only ${stock} left`;
  if (stock <= 8) return `${stock} pieces available`;
  return "In stock";
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images.find((image) => image.isPrimary)?.url ??
    product.images[0]?.url ??
    null;

  const activePrice = product.salePrice ?? product.basePrice;
  const hasDiscount = Boolean(product.salePrice);
  const stockLow = product.totalStock > 0 && product.totalStock <= 8;

  return (
    <main className="container product-page" style={{ paddingTop: 34, paddingBottom: 80 }}>
      <div className="product-back-link" style={{ marginBottom: 18 }}>
        <Link href="/shop" className="text-muted" style={{ fontSize: 14 }}>
          ← Back to Shop
        </Link>
      </div>

      <div
        className="product-detail-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(380px, 0.95fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        <section>
          <div
            className="surface-card product-gallery-shell"
            style={{
              padding: 12,
              borderRadius: 28,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ProductGallery
              productName={product.name}
              images={product.images.map((image) => ({
                id: image.id,
                url: image.url,
                altText: image.altText,
                isPrimary: image.isPrimary,
              }))}
            />

            <div
              className="product-badge-row"
              style={{
                position: "absolute",
                top: 22,
                left: 22,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                zIndex: 2,
              }}
            >
              {product.isHotDeal ? (
                <span className="premium-badge premium-badge-sale">HOT DEAL</span>
              ) : null}
              {product.isFeatured ? (
                <span className="premium-badge premium-badge-new">FEATURED</span>
              ) : null}
              {product.isNewArrival ? (
                <span className="premium-badge premium-badge-new">NEW</span>
              ) : null}
              {product.isBestSeller ? (
                <span className="premium-badge premium-badge-new">BEST SELLER</span>
              ) : null}
            </div>
          </div>

          <div
            className="product-trust-grid"
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            <TrustCard title="Fast Delivery" text="Inside Dhaka 1–3 days" />
            <TrustCard title="Easy Exchange" text="Within 3 working days" />
            <TrustCard title="Secure Checkout" text="COD supported" />
          </div>
        </section>

        <section
          className="surface-card product-info-card"
          style={{
            padding: 24,
            borderRadius: 28,
            position: "sticky",
            top: 86,
          }}
        >
          <div className="lux-eyebrow">
            {product.category.name}
            {product.collection ? ` · ${product.collection}` : ""}
          </div>

          <h1
            className="section-title product-title"
            style={{
              fontSize: "clamp(34px, 5vw, 58px)",
              lineHeight: 0.92,
              marginTop: 10,
            }}
          >
            {product.name}
          </h1>

          <div
            className="product-price-row"
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              className="heading-font product-current-price"
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: "var(--accent)",
                lineHeight: 1,
              }}
            >
              {money(activePrice)}
            </span>

            {hasDiscount ? (
              <span
                className="product-old-price"
                style={{
                  fontSize: 16,
                  color: "var(--muted)",
                  textDecoration: "line-through",
                }}
              >
                {money(product.basePrice)}
              </span>
            ) : null}

            <span className="status-pill status-confirmed">
              Sold {product.totalSold}
            </span>
          </div>

          <div
            className="product-action-row"
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <SizeChartModal productName={product.name} />

            <span
              className={
                product.totalStock <= 0
                  ? "status-pill status-cancelled"
                  : stockLow
                    ? "status-pill status-pending"
                    : "status-pill status-confirmed"
              }
            >
              {stockMessage(product.totalStock)}
            </span>
          </div>

          <p
            className="text-muted product-short-desc"
            style={{
              marginTop: 18,
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {product.shortDescription || product.description}
          </p>

          <div className="product-variant-mobile-wrap" style={{ marginTop: 24 }}>
            <ProductVariantSelector
              productId={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={product.basePrice}
              salePrice={product.salePrice}
              image={primaryImage}
              variants={product.variants}
            />
          </div>

          <div
            className="product-mini-info"
            style={{
              marginTop: 22,
              display: "grid",
              gap: 10,
              paddingTop: 18,
              borderTop: "1px solid var(--border)",
            }}
          >
            <MiniInfo text="Open package during delivery before accepting." />
            <MiniInfo text="Unboxing video required for defective/wrong item claims." />
            <MiniInfo text="Delivery charge: Dhaka ৳80, Outside Dhaka ৳150." />
          </div>
        </section>
      </div>

      {product.attributes.length > 0 ? (
        <section className="dashboard-card product-details-card" style={{ marginTop: 34 }}>
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Product Details</div>
          </div>

          <div
            className="dashboard-card-body product-attributes-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 14,
            }}
          >
            {product.attributes.map((attr) => (
              <div key={attr.id} className="surface-card" style={{ padding: 14 }}>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {attr.key.toUpperCase()}
                </div>
                <div style={{ marginTop: 6, fontWeight: 800 }}>
                  {attr.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="dashboard-card product-review-card" style={{ marginTop: 24 }}>
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Customer Reviews</div>
        </div>

        <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
          {product.reviews.length === 0 ? (
            <div className="text-muted">No reviews yet.</div>
          ) : (
            product.reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  {"★".repeat(review.rating)}{" "}
                  <span style={{ color: "var(--muted)" }}>
                    {review.title || "Customer Review"}
                  </span>
                </div>

                <div className="text-muted" style={{ marginTop: 5, fontSize: 12 }}>
                  {review.user.name ?? "Anonymous"} · {formatDate(review.createdAt)}
                  {review.isVerified ? " · Verified Purchase" : ""}
                </div>

                {review.body ? (
                  <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7 }}>
                    {review.body}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      {product.relatedProducts.length > 0 ? (
        <section className="related-products-section" style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <div className="lux-eyebrow">You May Also Like</div>
              <h2 className="lux-section-title">Related Products</h2>
            </div>

            <Link href="/shop" className="lux-link-arrow">
              Explore all →
            </Link>
          </div>

          <div className="premium-product-grid">
            {product.relatedProducts.map((relatedProduct) => (
              <StoreProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="surface-card product-trust-card"
      style={{
        padding: 16,
        borderRadius: 18,
        display: "grid",
        gap: 6,
      }}
    >
      <div className="product-trust-title" style={{ fontWeight: 900 }}>
        {title}
      </div>
      <div className="text-muted product-trust-text" style={{ fontSize: 13 }}>
        {text}
      </div>
    </div>
  );
}

function MiniInfo({ text }: { text: string }) {
  return (
    <div
      className="text-muted"
      style={{
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      ✓ {text}
    </div>
  );
}