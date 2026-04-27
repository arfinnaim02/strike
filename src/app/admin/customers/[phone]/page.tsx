import { notFound } from "next/navigation";
import { getAdminCustomerByPhone } from "../../../../lib/customers";

type PageProps = {
  params: Promise<{
    phone: string;
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

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { phone } = await params;
  const customer = await getAdminCustomerByPhone(phone);

  if (!customer) {
    notFound();
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="section-title">Customer Detail</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            {customer.name} · {customer.phone}
          </p>
        </div>

        <a href="/admin/customers" className="btn-secondary">
          Back to Customers
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="dashboard-card">
          <div className="dashboard-card-body">
            <div className="text-muted">Total Orders</div>
            <div className="section-title" style={{ fontSize: 38, marginTop: 8 }}>
              {customer.totalOrders}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-body">
            <div className="text-muted">Total Order Value</div>
            <div
              className="section-title"
              style={{ fontSize: 38, marginTop: 8, color: "var(--accent)" }}
            >
              {money(customer.totalSpent)}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-body">
            <div className="text-muted">Average Order Value</div>
            <div className="section-title" style={{ fontSize: 38, marginTop: 8 }}>
              {money(customer.totalSpent / customer.totalOrders)}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.8fr 1.2fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Customer Info</div>
          </div>

          <div className="dashboard-card-body" style={{ display: "grid", gap: 10 }}>
            <div><strong>Name:</strong> {customer.name}</div>
            <div><strong>Phone:</strong> {customer.phone}</div>
            <div><strong>Email:</strong> {customer.email ?? "-"}</div>
            <div><strong>District:</strong> {customer.district}</div>
            <div><strong>City:</strong> {customer.city}</div>
            <div><strong>Division:</strong> {customer.division}</div>
            <div><strong>Address:</strong> {customer.address}</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Order History</div>
          </div>

          <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
            {customer.orders.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders/${order.id}`}
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                      {formatDate(order.createdAt)} · {order.paymentMethod} ·{" "}
                      {order.paymentStatus}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 900,
                      color: "var(--accent)",
                      fontSize: 18,
                    }}
                  >
                    {money(order.total)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="status-pill status-confirmed">{order.status}</span>
                  <span className="status-pill">Items: {order.items.length}</span>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: "var(--muted)",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 44,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "var(--card-2)",
                          flexShrink: 0,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : null}
                      </div>

                      <div>
                        {item.productName} · Qty {item.qty}
                      </div>
                    </div>
                  ))}

                  {order.items.length > 3 ? (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      +{order.items.length - 3} more item(s)
                    </div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}