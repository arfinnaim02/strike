import * as CategoryLib from "../../../../lib/categories";
import { ProductForm } from "../../../../components/admin/product-form";

export default async function NewProductPage() {
  const categories = await CategoryLib.getCategories();

  return (
    <main>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Add Product</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Create a new product for Strike Sports
        </p>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <ProductForm
            action="/api/admin/products"
            categories={categories}
            submitLabel="Save Product"
            initialValues={{
              name: "",
              slug: "",
              description: "",
              categoryId: "",
              collection: "",
              basePrice: "",
              salePrice: "",
              status: "DRAFT",
              isFeatured: false,
              isHotDeal: false,
              isNewArrival: false,
              isWorldCup: false,
            }}
          />
        </div>
      </div>
    </main>
  );
}