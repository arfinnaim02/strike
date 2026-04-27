import { trackOrder } from "../../lib/track-order";
import { SiteHeader } from "../../components/layout/site-header";
import { SiteFooter } from "../../components/layout/site-footer";

type TrackOrderPageProps = {
  searchParams: Promise<{
    orderNumber?: string;
    phone?: string;
  }>;
};

function money(value: number) {
  return `৳${Number(value).toLocaleString("en-BD")}`;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

const timeline = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function label(status: string) {
  return status.replaceAll("_", " ");
}

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const params = await searchParams;

  const orderNumber = params.orderNumber?.trim() ?? "";
  const phone = params.phone?.trim() ?? "";

  let order = null;

  // search by order number OR phone
  if (orderNumber || phone) {
    order = await trackOrder(orderNumber, phone);
  }

  const currentStep = order
    ? Math.max(timeline.indexOf(order.status), 0)
    : -1;

  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 46, paddingBottom: 80 }}>
        <div style={{ maxWidth: 760 }}>
          <div className="lux-eyebrow">Live Tracking</div>
          <h1 className="section-title">Track Your Order</h1>

          <p
            className="text-muted"
            style={{ marginTop: 12, lineHeight: 1.8 }}
          >
            Enter your order number or mobile number to check status instantly.
          </p>
        </div>

        {/* Search */}
        <div className="dashboard-card" style={{ marginTop: 28 }}>
          <div className="dashboard-card-body">
            <form
              method="GET"
              action="/track-order"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 14,
              }}
              className="track-search-grid"
            >
              <input
                name="orderNumber"
                defaultValue={orderNumber}
                placeholder="Order Number (optional)"
              />

              <input
                name="phone"
                defaultValue={phone}
                placeholder="Mobile Number"
              />

              <button type="submit" className="btn-primary">
                Track
              </button>
            </form>
          </div>
        </div>

        {(orderNumber || phone) && !order ? (
          <div className="dashboard-card" style={{ marginTop: 20 }}>
            <div className="dashboard-card-body">
              No order found with provided details.
            </div>
          </div>
        ) : null}

        {order ? (
          <>
            {/* Top Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr",
                gap: 20,
                marginTop: 22,
              }}
              className="track-order-layout"
            >
              <section className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    {order.orderNumber}
                  </div>
                </div>

                <div
                  className="dashboard-card-body"
                  style={{ display: "grid", gap: 10 }}
                >
                  <div><strong>Status:</strong> {label(order.status)}</div>
                  <div><strong>Placed:</strong> {formatDate(order.createdAt)}</div>
                  <div><strong>Payment:</strong> {order.paymentMethod}</div>
                  <div><strong>Payment Status:</strong> {order.paymentStatus}</div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: "var(--accent)",
                    }}
                  >
                    {money(order.total)}
                  </div>
                </div>
              </section>

              <aside className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    Delivery Info
                  </div>
                </div>

                <div
                  className="dashboard-card-body"
                  style={{ display: "grid", gap: 10 }}
                >
                  <div>{order.shippingName}</div>
                  <div>{order.shippingPhone}</div>
                  <div>{order.shippingAddress}</div>
                  <div>{order.shippingDistrict}</div>
                </div>
              </aside>
            </div>

            {/* Timeline */}
            <div className="dashboard-card" style={{ marginTop: 22 }}>
              <div className="dashboard-card-header">
                <div className="dashboard-card-title">
                  Tracking Timeline
                </div>
              </div>

              <div
                className="dashboard-card-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 12,
                }}
              >
                {timeline.map((step, index) => {
                  const active = index <= currentStep;

                  return (
                    <div
                      key={step}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        textAlign: "center",
                        border: active
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                        background: active
                          ? "rgba(216,255,47,.08)"
                          : "transparent",
                      }}
                    >
                      <div style={{ fontSize: 22 }}>
                        {active ? "✓" : "•"}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {label(step)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr",
                gap: 20,
                marginTop: 22,
              }}
              className="track-order-layout"
            >
              {/* Items */}
              <section className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    Items Ordered
                  </div>
                </div>

                <div
                  className="dashboard-card-body"
                  style={{ display: "grid", gap: 14 }}
                >
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {item.productName}
                        </div>

                        <div className="text-muted" style={{ marginTop: 4 }}>
                          {item.variantInfo || "-"}
                        </div>

                        <div className="text-muted" style={{ marginTop: 4 }}>
                          Qty: {item.qty}
                        </div>
                      </div>

                      <strong>{money(item.totalPrice)}</strong>
                    </div>
                  ))}
                </div>
              </section>

              {/* Shipment + Updates */}
              <aside style={{ display: "grid", gap: 20 }}>
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <div className="dashboard-card-title">Shipment</div>
                  </div>

                  <div className="dashboard-card-body">
                    {order.shipments.length === 0 ? (
                      <div className="text-muted">
                        Shipment details not available yet.
                      </div>
                    ) : (
                      order.shipments.map((ship) => (
                        <div
                          key={ship.id}
                          style={{ display: "grid", gap: 8 }}
                        >
                          <div><strong>Courier:</strong> {ship.courier}</div>
                          <div>
                            <strong>Tracking:</strong>{" "}
                            {ship.trackingNumber || "-"}
                          </div>
                          <div>
                            <strong>Shipped:</strong>{" "}
                            {formatDate(ship.shippedAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <div className="dashboard-card-title">
                      Recent Updates
                    </div>
                  </div>

                  <div
                    className="dashboard-card-body"
                    style={{ display: "grid", gap: 12 }}
                  >
                    {order.statusHistory.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          paddingBottom: 12,
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <strong>{label(entry.status)}</strong>

                        <div
                          className="text-muted"
                          style={{ marginTop: 4 }}
                        >
                          {formatDate(entry.createdAt)}
                        </div>

                        {entry.note ? (
                          <div style={{ marginTop: 6 }}>
                            {entry.note}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}