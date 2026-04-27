type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  collection: string;
  basePrice: string;
  salePrice: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  isHotDeal: boolean;
  isNewArrival: boolean;
  isWorldCup: boolean;
};

type ProductFormProps = {
  action: string;
  categories: { id: string; name: string }[];
  initialValues: ProductFormValues;
  submitLabel: string;
};

export function ProductForm({
  action,
  categories,
  initialValues,
  submitLabel,
}: ProductFormProps) {
  return (
    <form
      action={action}
      method="POST"
      style={{
        display: "grid",
        gap: 16,
        maxWidth: 760,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <label>Name</label>
        <input
          name="name"
          defaultValue={initialValues.name}
          placeholder="Argentina Home Jersey 2026"
          required
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Slug</label>
        <input
          name="slug"
          defaultValue={initialValues.slug}
          placeholder="argentina-home-jersey-2026"
          required
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={initialValues.description}
          placeholder="Full product description"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Category</label>
          <select name="categoryId" required defaultValue={initialValues.categoryId}>
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label>Collection</label>
          <input
            name="collection"
            defaultValue={initialValues.collection}
            placeholder="World Cup 2026"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Base Price</label>
          <input
            name="basePrice"
            type="number"
            step="0.01"
            defaultValue={initialValues.basePrice}
            placeholder="1350"
            required
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label>Sale Price</label>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            defaultValue={initialValues.salePrice}
            placeholder="1199"
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Status</label>
        <select name="status" defaultValue={initialValues.status}>
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <label>
          <input
            type="checkbox"
            name="isFeatured"
            value="true"
            defaultChecked={initialValues.isFeatured}
          />{" "}
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            name="isHotDeal"
            value="true"
            defaultChecked={initialValues.isHotDeal}
          />{" "}
          Hot Deal
        </label>

        <label>
          <input
            type="checkbox"
            name="isNewArrival"
            value="true"
            defaultChecked={initialValues.isNewArrival}
          />{" "}
          New Arrival
        </label>
        
        <label>
          <input
            type="checkbox"
            name="isWorldCup"
            value="true"
            defaultChecked={initialValues.isWorldCup}
          />{" "}
          World Cup
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>

        <a href="/admin/products" className="btn-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
}