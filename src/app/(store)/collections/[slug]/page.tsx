import { notFound } from "next/navigation";
import { getCollectionPageData } from "../../../../lib/store-products";
import { StoreProductCard } from "../../../../components/store/store-product-card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCollectionPageData(slug);

  if (!data) {
    notFound();
  }

  const { collection, products } = data;

  return (
    <main className="container" style={{ paddingTop: 36, paddingBottom: 44 }}>
      <section
        className="surface-card"
        style={{
          padding: 28,
          borderRadius: 28,
          marginBottom: 28,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 38%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Collection
          </div>

          <h1
            className="section-title"
            style={{
              fontSize: "clamp(30px, 5vw, 50px)",
              marginBottom: 10,
            }}
          >
            {collection.title}
          </h1>

          <p
            className="text-muted"
            style={{
              maxWidth: 760,
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {collection.description}
          </p>

          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {products.length} Products
          </div>
        </div>
      </section>

      {products.length === 0 ? (
        <div
          className="surface-card"
          style={{
            padding: 28,
            borderRadius: 22,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          No active products found in this collection yet.
        </div>
      ) : (
        <div className="premium-product-grid">
          {products.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}