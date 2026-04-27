import { getAdminOrders } from "../../../lib/orders";
import { OrdersTable } from "../../../components/admin/orders-table";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params?.search ?? "";
  const page = Number(params?.page ?? 1);

  const data = await getAdminOrders({
    search,
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
          <h1 className="section-title">Orders</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Search, manage, and update customer orders.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-secondary" type="button">
            Export
          </button>

          <a href="/admin/orders" className="btn-primary">
            Refresh
          </a>
        </div>
      </div>

      <OrdersTable
        orders={data.orders}
        pagination={data.pagination}
        search={data.filters.search}
      />
    </main>
  );
}