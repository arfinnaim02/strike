import { notFound, redirect } from "next/navigation";
import { db } from "../../../../lib/db";
import { getCurrentAdmin } from "../../../../lib/admin-auth";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/auth/login?callbackUrl=/admin/categories");
  }

  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  const categories = await db.category.findMany({
    where: {
      id: { not: id },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });

  return (
    <main>
      <div className="dashboard-card" style={{ maxWidth: 900 }}>
        <div className="dashboard-card-header">
          <div>
            <div className="dashboard-card-title">Edit Category</div>
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              Update category details, parent, status, and SEO fields.
            </p>
          </div>
        </div>

        <form
          action={`/api/admin/categories/${category.id}`}
          method="POST"
          style={{ display: "grid", gap: 16 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label>Name</label>
              <input name="name" defaultValue={category.name} required />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Slug</label>
              <input name="slug" defaultValue={category.slug} required />
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Description</label>
            <textarea
              name="description"
              defaultValue={category.description ?? ""}
              rows={4}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label>Parent Category</label>
              <select name="parentId" defaultValue={category.parentId ?? ""}>
                <option value="">No parent</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={category.sortOrder}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label>Meta Title</label>
              <input name="metaTitle" defaultValue={category.metaTitle ?? ""} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Meta Description</label>
              <input name="metaDesc" defaultValue={category.metaDesc ?? ""} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <label>
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={category.isActive}
              />{" "}
              Active
            </label>

            <label>
              <input
                type="checkbox"
                name="isFeatured"
                value="true"
                defaultChecked={category.isFeatured}
              />{" "}
              Featured
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary">
              Update Category
            </button>

            <a href="/admin/categories" className="btn-secondary">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}