"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminOrder = {
  id: string;
  orderNumber: string;
  shippingName: string;
  shippingPhone: string;
  shippingDistrict: string;
  shippingCity: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  isCodVerified: boolean;
  createdAt: string;
  email: string | null;
  totalItems: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalOrders: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Props = {
  orders: AdminOrder[];
  pagination: Pagination;
  search: string;
};

const orderStatusOptions = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "EXCHANGE_REQUESTED",
  "EXCHANGED",
];

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "status-pill status-pending";
    case "CONFIRMED":
    case "PROCESSING":
    case "PACKED":
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

function paymentStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "status-pill status-delivered";
    case "PENDING":
      return "status-pill status-pending";
    case "UNPAID":
      return "status-pill status-cancelled";
    default:
      return "status-pill status-shipped";
  }
}

export function OrdersTable({ orders, pagination, search }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("CONFIRMED");
  const [isLoading, setIsLoading] = useState(false);

  const allVisibleSelected = useMemo(() => {
    return orders.length > 0 && orders.every((order) => selectedIds.includes(order.id));
  }, [orders, selectedIds]);

  function toggleOrder(orderId: string) {
    setSelectedIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((order) => order.id));
    }
  }

  async function runBulkAction(action: "CHANGE_STATUS" | "DELETE") {
    if (selectedIds.length === 0) {
      alert("Select at least one order first.");
      return;
    }

    if (action === "DELETE") {
      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected order(s)? This action cannot be undone.`
      );

      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          orderIds: selectedIds,
          status: bulkStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Bulk action failed");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to complete bulk action.");
    } finally {
      setIsLoading(false);
    }
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    params.set("page", String(nextPage));

    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          Order Management ({pagination.totalOrders})
        </div>
      </div>

      <div
        className="dashboard-card-body"
        style={{
          display: "grid",
          gap: 14,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <form
          method="GET"
          action="/admin/orders"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by order ID, phone number, customer name..."
            style={{
              minHeight: 44,
              padding: "0 14px",
              width: "100%",
            }}
          />

          <button type="submit" className="btn-primary">
            Search
          </button>

          <a href="/admin/orders" className="btn-secondary">
            Clear
          </a>
        </form>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{ minHeight: 42, padding: "0 12px" }}
          >
            {orderStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading || selectedIds.length === 0}
            onClick={() => runBulkAction("CHANGE_STATUS")}
          >
            Change Status ({selectedIds.length})
          </button>

          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading || selectedIds.length === 0}
            onClick={() => runBulkAction("DELETE")}
            style={{
              borderColor: "rgba(255, 77, 79, 0.28)",
              color: "var(--danger)",
            }}
          >
            Bulk Delete
          </button>

          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Showing {orders.length} of {pagination.totalOrders}
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="order-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  aria-label="Select all visible orders"
                />
              </th>
              <th>Order</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: "24px 16px",
                    color: "var(--muted)",
                  }}
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={`Select ${order.orderNumber}`}
                    />
                  </td>

                  <td>
                    <a
                      href={`/admin/orders/${order.id}`}
                      style={{ display: "block", textDecoration: "none" }}
                    >
                      <div style={{ fontWeight: 800 }}>{order.orderNumber}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {order.paymentMethod}
                        {order.paymentMethod === "COD" && order.isCodVerified
                          ? " · Verified"
                          : ""}
                      </div>
                    </a>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700 }}>{order.shippingName}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {order.shippingPhone}
                    </div>

                    {order.email ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {order.email}
                      </div>
                    ) : null}
                  </td>

                  <td>
                    <div>{order.shippingDistrict}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {order.shippingCity}
                    </div>
                  </td>

                  <td>{order.totalItems}</td>

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
                    <span className={paymentStatusClass(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td>
                    <span className={statusClass(order.status)}>
                      {order.status}
                    </span>
                  </td>

                  <td>{formatDate(order.createdAt)}</td>
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
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Page {pagination.page} of {pagination.totalPages}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {pagination.hasPreviousPage ? (
            <a href={pageHref(pagination.page - 1)} className="btn-secondary">
              Previous
            </a>
          ) : (
            <button type="button" className="btn-secondary" disabled>
              Previous
            </button>
          )}

          {pagination.hasNextPage ? (
            <a href={pageHref(pagination.page + 1)} className="btn-primary">
              Next
            </a>
          ) : (
            <button type="button" className="btn-primary" disabled>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}