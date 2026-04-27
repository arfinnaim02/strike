import { getInventoryProductsSummary } from "../../../lib/inventory";
import { InventoryTable } from "../../../components/admin/inventory-table";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    stock?: string;
  }>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params?.search ?? "";
  const stock = params?.stock ?? "";
  const page = Number(params?.page ?? 1);

  const data = await getInventoryProductsSummary({
    search,
    stock,
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
          <h1 className="section-title">Inventory</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Search, filter, and bulk manage product-level inventory.
          </p>
        </div>
      </div>

      <InventoryTable
        rows={data.rows}
        pagination={data.pagination}
        search={data.filters.search}
        stock={data.filters.stock}
      />
    </main>
  );
}