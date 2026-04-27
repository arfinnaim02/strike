import { StoreProductCard } from "./store-product-card";

type Product = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  totalSold: number;
  collection: string | null;
  categoryName: string;
  image: string | null;
  imageAlt: string;
  totalStock: number;
};

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
};

export function HomeProductSection({ title, subtitle, products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="container" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="section-title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
            {title}
          </h2>
          {subtitle ? (
            <p className="text-muted" style={{ marginTop: 8 }}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <a href="/shop" className="btn-secondary">
          View All
        </a>
      </div>

      <div className="home-product-grid">
        {products.map((product) => (
          <StoreProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}