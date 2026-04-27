import { getAdminProducts } from "../../../lib/products";
import { ProductsTable } from "../../../components/admin/products-table";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    status?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params?.search ?? "";
  const status = params?.status ?? "";
  const page = Number(params?.page ?? 1);

  const data = await getAdminProducts({
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
          <h1 className="section-title">Products</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Search, filter, and manage your product catalog.
          </p>
        </div>

        <a href="/admin/products/new" className="btn-primary">
          + Add Product
        </a>
      </div>

      <ProductsTable
        products={data.products}
        pagination={data.pagination}
        search={data.filters.search}
        status={data.filters.status}
      />
    </main>
  );
}