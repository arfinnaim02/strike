import Link from "next/link";
import { getShopCategories, getShopProducts } from "../../../lib/store-products";
import { StoreProductCard } from "../../../components/store/store-product-card";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category ?? "";
  const searchQuery = params.q ?? "";

  const [products, categories] = await Promise.all([
    getShopProducts({
      category: selectedCategory || undefined,
      q: searchQuery || undefined,
    }),
    getShopCategories(),
  ]);

  return (
    <main className="container shop-page">
      <section className="shop-hero">
        <div>
          <div className="lux-eyebrow">Storefront</div>
          <h1 className="section-title">Shop</h1>
          <p className="text-muted shop-subtitle">
            Browse premium jerseys, football collections, and latest drops from Strike Sports.
          </p>
        </div>

        <form method="GET" action="/shop" className="shop-filter-form">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search products..."
          />

          <select name="category" defaultValue={selectedCategory}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <optgroup key={category.id} label={category.name}>
                <option value={category.slug}>{category.name}</option>
                {category.children.map((child) => (
                  <option key={child.id} value={child.slug}>
                    — {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button type="submit" className="btn-primary">
            Filter
          </button>

          <Link href="/shop" className="btn-secondary">
            Reset
          </Link>
        </form>
      </section>

      <div className="shop-layout">
        <aside className="dashboard-card shop-sidebar">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Categories</div>
          </div>

          <div className="dashboard-card-body shop-category-list">
            <Link
              href="/shop"
              className={!selectedCategory ? "shop-category-active" : ""}
            >
              <span>All Products</span>
            </Link>

            {categories.map((category) => (
              <div key={category.id} className="shop-category-group">
                <Link
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className={
                    selectedCategory === category.slug
                      ? "shop-category-main shop-category-active"
                      : "shop-category-main"
                  }
                >
                  <span>{category.name}</span>
                  <span>({category.productCount})</span>
                </Link>

                {category.children.length > 0 ? (
                  <div className="shop-category-children">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/shop?category=${encodeURIComponent(child.slug)}`}
                        className={
                          selectedCategory === child.slug
                            ? "shop-category-child shop-category-active"
                            : "shop-category-child"
                        }
                      >
                        <span>{child.name}</span>
                        <span>({child.productCount})</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <section className="shop-products">
          <div className="shop-result-bar">
            <div className="text-muted">{products.length} products found</div>

            {(searchQuery || selectedCategory) && (
              <div className="text-muted shop-active-filter">
                {searchQuery ? `Search: "${searchQuery}"` : ""}
                {searchQuery && selectedCategory ? " · " : ""}
                {selectedCategory ? `Category: ${selectedCategory}` : ""}
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="dashboard-card">
              <div className="dashboard-card-body">
                <div className="text-muted">No active products found.</div>
              </div>
            </div>
          ) : (
            <div className="premium-product-grid">
              {products.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}