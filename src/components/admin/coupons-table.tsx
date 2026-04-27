"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalCoupons: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Props = {
  coupons: AdminCoupon[];
  pagination: Pagination;
  search: string;
  status: string;
  type: string;
};

function money(value: number | null) {
  if (value === null) return "-";
  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-BD");
}

function couponValue(coupon: AdminCoupon) {
  if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue}%`;
  if (coupon.discountType === "FREE_DELIVERY") return "Free Delivery";
  return money(coupon.discountValue);
}

export function CouponsTable({
  coupons,
  pagination,
  search,
  status,
  type,
}: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("ACTIVATE");
  const [isLoading, setIsLoading] = useState(false);

  const allVisibleSelected = useMemo(() => {
    return (
      coupons.length > 0 &&
      coupons.every((coupon) => selectedIds.includes(coupon.id))
    );
  }, [coupons, selectedIds]);

  function toggleCoupon(couponId: string) {
    setSelectedIds((prev) =>
      prev.includes(couponId)
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(coupons.map((coupon) => coupon.id));
    }
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      alert("Select at least one coupon first.");
      return;
    }

    if (bulkAction === "DELETE") {
      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected coupon(s)? Coupons used in orders will be blocked.`
      );

      if (!confirmed) return;
    }

    if (bulkAction === "RESET_USAGE") {
      const confirmed = window.confirm(
        `Reset usage count for ${selectedIds.length} selected coupon(s)?`
      );

      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/coupons/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: bulkAction,
          couponIds: selectedIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Bulk action failed");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to complete bulk action.");
    } finally {
      setIsLoading(false);
    }
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    params.set("page", String(nextPage));

    return `/admin/coupons?${params.toString()}`;
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          Coupon List ({pagination.totalCoupons})
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
          action="/admin/coupons"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 170px 190px auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by coupon code or description..."
            style={{ minHeight: 44, padding: "0 14px", width: "100%" }}
          />

          <select
            name="status"
            defaultValue={status}
            style={{ minHeight: 44, padding: "0 12px" }}
          >
            <option value="">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select
            name="type"
            defaultValue={type}
            style={{ minHeight: 44, padding: "0 12px" }}
          >
            <option value="">ALL TYPES</option>
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
            <option value="FREE_DELIVERY">FREE_DELIVERY</option>
          </select>

          <button type="submit" className="btn-primary">
            Search
          </button>

          <a href="/admin/coupons" className="btn-secondary">
            Clear
          </a>
        </form>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            style={{ minHeight: 42, padding: "0 12px" }}
          >
            <option value="ACTIVATE">Activate</option>
            <option value="DEACTIVATE">Deactivate</option>
            <option value="RESET_USAGE">Reset Usage Count</option>
            <option value="DELETE">Delete</option>
          </select>

          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading || selectedIds.length === 0}
            onClick={runBulkAction}
          >
            Apply to Selected ({selectedIds.length})
          </button>

          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Showing {coupons.length} of {pagination.totalCoupons}
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
                  aria-label="Select all visible coupons"
                />
              </th>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Dates</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "24px 16px", color: "var(--muted)" }}>
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(coupon.id)}
                      onChange={() => toggleCoupon(coupon.id)}
                      aria-label={`Select ${coupon.code}`}
                    />
                  </td>

                  <td>
                    <div style={{ fontWeight: 800 }}>{coupon.code}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      {coupon.description || "-"}
                    </div>
                  </td>

                  <td>{coupon.discountType}</td>

                  <td>{couponValue(coupon)}</td>

                  <td>{money(coupon.minOrderAmount)}</td>

                  <td>
                    {coupon.usageCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}
                  </td>

                  <td>
                    {coupon.isActive ? (
                      <span className="status-pill status-confirmed">Active</span>
                    ) : (
                      <span className="status-pill status-cancelled">Inactive</span>
                    )}
                  </td>

                  <td style={{ fontSize: 12 }}>
                    <div>Start: {formatDate(coupon.startsAt)}</div>
                    <div style={{ marginTop: 4 }}>
                      End: {formatDate(coupon.expiresAt)}
                    </div>
                  </td>

                  <td>
                    <form action={`/api/admin/coupons/${coupon.id}/toggle`} method="POST">
                      <button type="submit" className="btn-secondary">
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
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