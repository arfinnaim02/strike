import { notFound } from "next/navigation";
import {
  getAdminOrderDetail,
  getOrderEditableProducts,
} from "../../../../lib/order-details";
import { OrderItemsManager } from "../../../../components/admin/order-items-manager";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [order, editableProducts] = await Promise.all([
    getAdminOrderDetail(id),
    getOrderEditableProducts(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="section-title">Order Detail</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            {order.orderNumber}
          </p>
        </div>

        <form action="/api/admin/orders/update-status" method="POST">
          <input type="hidden" name="orderId" value={order.id} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select name="status" defaultValue={order.status}>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
              <option value="RETURNED">RETURNED</option>
              <option value="EXCHANGE_REQUESTED">EXCHANGE_REQUESTED</option>
              <option value="EXCHANGED">EXCHANGED</option>
            </select>

            <input
              type="text"
              name="note"
              placeholder="Optional status note"
              style={{ minWidth: 220 }}
            />

            <button type="submit" className="btn-primary">
              Update Status
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 20,
        }}
      >
        {/* LEFT */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* ITEMS */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Items</div>
            </div>

            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 14 }}
            >
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "96px 1fr",
                    gap: 16,
                    padding: 14,
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.018))",
                  }}
                >
                  <a
                    href={`/product/${item.productSlug}`}
                    target="_blank"
                    style={{
                      width: 96,
                      height: 116,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "var(--card-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                    ) : (
                      <span style={{ fontSize: 34 }}>👕</span>
                    )}
                  </a>

                  <div style={{ display: "grid", gap: 8 }}>
                    <div>
                      <a
                        href={`/product/${item.productSlug}`}
                        target="_blank"
                        style={{
                          fontWeight: 900,
                          fontSize: 18,
                          lineHeight: 1.15,
                        }}
                      >
                        {item.productName}
                      </a>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 12,
                          color: "var(--muted)",
                        }}
                      >
                        {item.variantInfo ?? "No variant"} · SKU:{" "}
                        {item.sku ?? "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(90px, 1fr))",
                        gap: 10,
                      }}
                    >
                      <div
                        className="surface-card-2"
                        style={{ padding: 10, borderRadius: 12 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                          }}
                        >
                          Qty
                        </div>
                        <div style={{ fontWeight: 900 }}>
                          {item.qty}
                        </div>
                      </div>

                      <div
                        className="surface-card-2"
                        style={{ padding: 10, borderRadius: 12 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                          }}
                        >
                          Unit
                        </div>
                        <div style={{ fontWeight: 900 }}>
                          {formatCurrency(item.unitPrice)}
                        </div>
                      </div>

                      <div
                        className="surface-card-2"
                        style={{ padding: 10, borderRadius: 12 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                          }}
                        >
                          Total
                        </div>
                        <div
                          style={{
                            fontWeight: 900,
                            color: "var(--accent)",
                          }}
                        >
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDIT ITEMS */}
          <OrderItemsManager
            orderId={order.id}
            items={order.items}
            products={editableProducts}
          />

          {/* STATUS HISTORY */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                Status History
              </div>
            </div>

            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 12 }}
            >
              {order.statusHistory.length === 0 ? (
                <div className="text-muted">
                  No status history yet.
                </div>
              ) : (
                order.statusHistory.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      paddingBottom: 12,
                      borderBottom:
                        "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {entry.status}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      {formatDate(entry.createdAt)}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      Changed by:{" "}
                      {entry.changedBy ?? "system"}
                    </div>

                    {entry.note ? (
                      <div
                        style={{
                          fontSize: 13,
                          marginTop: 6,
                        }}
                      >
                        {entry.note}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* CUSTOMER */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                Customer
              </div>
            </div>

            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 10 }}
            >
              <div>
                <strong>Name:</strong>{" "}
                {order.shippingName}
              </div>
              <div>
                <strong>Phone:</strong>{" "}
                {order.shippingPhone}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {order.user?.email ??
                  order.guestEmail ??
                  "-"}
              </div>
              <div>
                <strong>District:</strong>{" "}
                {order.shippingDistrict}
              </div>
              <div>
                <strong>City:</strong>{" "}
                {order.shippingCity}
              </div>
              <div>
                <strong>Division:</strong>{" "}
                {order.shippingDivision}
              </div>
              <div>
                <strong>Address:</strong>{" "}
                {order.shippingAddress}
              </div>
            </div>
          </div>

          {/* EDIT ORDER INFO */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                Edit Order Info
              </div>
            </div>

            <div className="dashboard-card-body">
              <form
                action="/api/admin/orders/update-info"
                method="POST"
                style={{ display: "grid", gap: 12 }}
              >
                <input
                  type="hidden"
                  name="orderId"
                  value={order.id}
                />

                <input
                  name="shippingName"
                  defaultValue={order.shippingName}
                  placeholder="Name"
                />

                <input
                  name="shippingPhone"
                  defaultValue={order.shippingPhone}
                  placeholder="Phone"
                />

                <textarea
                  name="shippingAddress"
                  rows={3}
                  defaultValue={order.shippingAddress}
                  placeholder="Address"
                />

                <input
                  name="shippingCity"
                  defaultValue={order.shippingCity}
                  placeholder="City"
                />

                <input
                  name="shippingDistrict"
                  defaultValue={order.shippingDistrict}
                  placeholder="District"
                />

                <input
                  name="shippingDivision"
                  defaultValue={order.shippingDivision}
                  placeholder="Division"
                />

                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                  <option value="PARTIALLY_REFUNDED">
                    PARTIALLY_REFUNDED
                  </option>
                </select>

                <label
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="isCodVerified"
                    value="true"
                    defaultChecked={order.isCodVerified}
                  />
                  COD Verified
                </label>

                <textarea
                  name="adminNote"
                  rows={3}
                  defaultValue={order.adminNote ?? ""}
                  placeholder="Internal admin note"
                />

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Order Info
                </button>
              </form>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                Summary
              </div>
            </div>

            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 10 }}
            >
              <div>
                <strong>Status:</strong>{" "}
                {order.status}
              </div>
              <div>
                <strong>Payment Method:</strong>{" "}
                {order.paymentMethod}
              </div>
              <div>
                <strong>Payment Status:</strong>{" "}
                {order.paymentStatus}
              </div>
              <div>
                <strong>COD Verified:</strong>{" "}
                {order.isCodVerified ? "Yes" : "No"}
              </div>
              <div>
                <strong>Admin Note:</strong>{" "}
                {order.adminNote ?? "-"}
              </div>
              <div>
                <strong>Subtotal:</strong>{" "}
                {formatCurrency(order.subtotal)}
              </div>
              <div>
                <strong>Discount:</strong>{" "}
                {formatCurrency(order.discountAmount)}
              </div>
              <div>
                <strong>Delivery:</strong>{" "}
                {formatCurrency(order.deliveryCharge)}
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: "var(--accent)",
                }}
              >
                Total: {formatCurrency(order.total)}
              </div>
            </div>
          </div>

          {/* PAYMENTS */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                Payments
              </div>
            </div>

            <div
              className="dashboard-card-body"
              style={{ display: "grid", gap: 12 }}
            >
              {order.payments.length === 0 ? (
                <div className="text-muted">
                  No payment record yet.
                </div>
              ) : (
                order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      paddingBottom: 12,
                      borderBottom:
                        "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {payment.method}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      {payment.status} ·{" "}
                      {formatCurrency(payment.amount)}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      TXN:{" "}
                      {payment.transactionId ?? "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}