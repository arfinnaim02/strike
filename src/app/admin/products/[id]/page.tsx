import { notFound } from "next/navigation";
import * as CategoryLib from "../../../../lib/categories";
import { getAdminProductById } from "../../../../lib/products";
import { ProductForm } from "../../../../components/admin/product-form";
import { ProductImageManager } from "../../../../components/admin/product-image-manager";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [categories, product] = await Promise.all([
    CategoryLib.getCategories(),
    getAdminProductById(id),
  ]);

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
          <h1 className="section-title">Edit Product</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Update product information, images, and commerce settings.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`/admin/inventory/manage/${product.id}`}
            className="btn-primary"
          >
            Manage Inventory
          </a>

          <a
            href={`/product/${product.slug}`}
            className="btn-secondary"
            target="_blank"
          >
            View Product
          </a>

          <a href="/admin/products" className="btn-secondary">
            Back to Products
          </a>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="dashboard-card-body">
          <ProductForm
            action={`/api/admin/products/${product.id}`}
            categories={categories}
            submitLabel="Update Product"
              initialValues={{
                name: product.name,
                slug: product.slug,
                description: product.description,
                categoryId: product.categoryId,
                collection: product.collection,
                basePrice: product.basePrice,
                salePrice: product.salePrice,
                status: product.status,
                isFeatured: product.isFeatured,
                isHotDeal: product.isHotDeal,
                isNewArrival: product.isNewArrival,
                isWorldCup: product.isWorldCup,
              }}
          />
        </div>
      </div>

      <ProductImageManager
        productId={product.id}
        productName={product.name}
        folder={process.env.CLOUDINARY_FOLDER || "strike-sports/products"}
        images={product.images}
      />
    </main>
  );
}