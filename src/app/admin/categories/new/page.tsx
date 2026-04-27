import { getAdminCategories } from "../../../../lib/categories";

export default async function NewCategoryPage() {
  const data = await getAdminCategories({
  page: 1,
  pageSize: 1000,
});

const categories = data.categories;

  return (
    <main>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Add Category</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Create a new product category
        </p>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <form
            action="/api/admin/categories"
            method="POST"
            style={{
              display: "grid",
              gap: 16,
              maxWidth: 760,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label>Name</label>
              <input name="name" placeholder="Jerseys" required />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Slug</label>
              <input name="slug" placeholder="jerseys" required />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Optional description"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Parent Category</label>
                <select name="parentId" defaultValue="">
                  <option value="">No parent</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Sort Order</label>
                <input name="sortOrder" type="number" defaultValue={0} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Meta Title</label>
                <input name="metaTitle" placeholder="Optional SEO title" />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Meta Description</label>
                <input name="metaDesc" placeholder="Optional SEO description" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <label>
                <input type="checkbox" name="isActive" value="true" defaultChecked /> Active
              </label>
              <label>
                <input type="checkbox" name="isFeatured" value="true" /> Featured
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn-primary">
                Save Category
              </button>
              <a href="/admin/categories" className="btn-secondary">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}