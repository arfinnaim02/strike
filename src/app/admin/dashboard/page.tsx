import { getDashboardData } from "../../../lib/dashboard";

function formatCurrency(value: number | string | bigint | null | undefined) {
  const num = Number(value ?? 0);
  return `৳${num.toLocaleString("en-BD")}`;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "status-pill status-pending";
    case "CONFIRMED":
      return "status-pill status-confirmed";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "status-pill status-shipped";
    case "DELIVERED":
      return "status-pill status-delivered";
    default:
      return "status-pill status-cancelled";
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <main>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today&apos;s Revenue</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {formatCurrency(data.kpis.todayRevenue)}
          </div>
          <div className="stat-meta">Paid payments received today</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">New Orders Today</div>
          <div className="stat-value" style={{ color: "var(--info)" }}>
            {data.kpis.newOrdersToday}
          </div>
          <div className="stat-meta">Orders created today</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>
            {data.kpis.pendingOrders}
          </div>
          <div className="stat-meta">Waiting for confirmation</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>
            {data.kpis.lowStockItems}
          </div>
          <div className="stat-meta">Variants at or below threshold</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Recent Orders</div>
          </div>

          <table className="order-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{order.shippingName}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {order.shippingDistrict}
                    </div>
                  </td>
                  <td>{order.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                  <td
                    style={{
                      fontWeight: 800,
                      color: "var(--accent)",
                      fontFamily: "var(--font-heading)",
                      fontSize: 18,
                    }}
                  >
                    {formatCurrency(order.total)}
                  </td>
                  <td>
                    <span className={statusClass(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Alerts</div>
            </div>

            <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
              {data.alerts.lowStockPreview.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--danger)",
                      display: "inline-block",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13 }}>
                      {item.product.name} {item.size ? `(${item.size})` : ""} — only{" "}
                      <strong>{item.stockQty}</strong> left
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Low stock warning
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--info)",
                    display: "inline-block",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13 }}>
                    <strong>{data.alerts.pendingReviews}</strong> reviews pending approval
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Review moderation queue
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--warning)",
                    display: "inline-block",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13 }}>
                    <strong>{data.alerts.openTickets}</strong> support tickets open
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    Customer support queue
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Top Products</div>
            </div>

            <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
              {data.topProducts.map((product) => (
                <div
                  key={product.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="heading-font"
                    style={{ fontSize: 22, fontWeight: 900, color: "var(--muted)", width: 20 }}
                  >
                    {product.rank}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{product.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {product.meta}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {product.sold} sold
                    </div>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}