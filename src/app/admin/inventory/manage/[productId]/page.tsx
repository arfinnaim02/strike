import { notFound } from "next/navigation";
import { getInventoryManagerProductById } from "../../../../../lib/inventory";
import { ProductInventoryManager } from "../../../../../components/admin/product-inventory-manager";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function InventoryManagePage({ params }: PageProps) {
  const { productId } = await params;
  const product = await getInventoryManagerProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="section-title">Manage Inventory</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Add sizes, update stock, and manage product variants.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`/admin/products/${product.id}`}
            className="btn-primary"
          >
            Edit Product
          </a>

          <a
            href={`/product/${product.slug}`}
            className="btn-secondary"
            target="_blank"
          >
            View Product
          </a>

          <a href="/admin/inventory" className="btn-secondary">
            Back to Inventory
          </a>
        </div>
      </div>

      <ProductInventoryManager product={product} />
    </main>
  );
}