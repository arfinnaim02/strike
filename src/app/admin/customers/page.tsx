import { getAdminCustomers } from "../../../lib/customers";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
  }>;
};

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params?.search ?? "";
  const page = Number(params?.page ?? 1);

  const data = await getAdminCustomers({
    search,
    page,
    pageSize: 20,
  });

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    query.set("page", String(nextPage));
    return `/admin/customers?${query.toString()}`;
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="section-title">Customers</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Customers are grouped by unique mobile number from order records.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            Customer List ({data.pagination.totalCustomers})
          </div>
        </div>

        <div
          className="dashboard-card-body"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <form
            action="/admin/customers"
            method="GET"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 10,
            }}
          >
            <input
              name="search"
              defaultValue={search}
              placeholder="Search name, phone, address, district, order ID..."
            />

            <button type="submit" className="btn-primary">
              Search
            </button>

            <a href="/admin/customers" className="btn-secondary">
              Reset
            </a>
          </form>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="order-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Total Orders</th>
                <th>Total Value</th>
                <th>Last Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, color: "var(--muted)" }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                data.customers.map((customer) => (
                  <tr key={customer.phone}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{customer.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {customer.email ?? "-"}
                      </div>
                    </td>

                    <td>{customer.phone}</td>

                    <td>
                      <div>{customer.district}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {customer.city}
                      </div>
                    </td>

                    <td>{customer.totalOrders}</td>

                    <td
                      style={{
                        fontWeight: 900,
                        color: "var(--accent)",
                        fontFamily: "var(--font-heading)",
                        fontSize: 18,
                      }}
                    >
                      {money(customer.totalSpent)}
                    </td>

                    <td>
                      <div>{customer.lastOrderNumber}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {formatDate(customer.lastOrderAt)}
                      </div>
                    </td>

                    <td>
                      <span className="status-pill status-confirmed">
                        {customer.lastStatus}
                      </span>
                    </td>

                    <td>
                      <a
                        href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                        className="btn-secondary"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className="dashboard-card-body"
          style={{
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="text-muted">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {data.pagination.hasPreviousPage ? (
              <a href={pageHref(data.pagination.page - 1)} className="btn-secondary">
                Previous
              </a>
            ) : (
              <button className="btn-secondary" disabled>
                Previous
              </button>
            )}

            {data.pagination.hasNextPage ? (
              <a href={pageHref(data.pagination.page + 1)} className="btn-primary">
                Next
              </a>
            ) : (
              <button className="btn-primary" disabled>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}