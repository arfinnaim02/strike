import * as CategoryLib from "../../../lib/categories";
import { CategoriesTable } from "../../../components/admin/categories-table";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    status?: string;
  }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params?.search ?? "";
  const status = params?.status ?? "";
  const page = Number(params?.page ?? 1);

  const data = await CategoryLib.getAdminCategories({
    search,
    status,
    page,
    pageSize: 20,
  });

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="section-title">Categories</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Search, filter, and manage product categories.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-secondary" type="button">
            Export
          </button>

          <a href="/admin/categories/new" className="btn-primary">
            + Add Category
          </a>
        </div>
      </div>

      <CategoriesTable
        categories={data.categories}
        pagination={data.pagination}
        search={data.filters.search}
        status={data.filters.status}
      />
    </main>
  );
}