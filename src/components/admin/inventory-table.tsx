"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type InventoryRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  categoryName: string;
  variantCount: number;
  inactiveVariantCount: number;
  totalStock: number;
  lowStockVariantCount: number;
  sizes: string[];
};

type Pagination = {
  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Props = {
  rows: InventoryRow[];
  pagination: Pagination;
  search: string;
  stock: string;
};

export function InventoryTable({ rows, pagination, search, stock }: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("ACTIVATE_VARIANTS");
  const [stockQty, setStockQty] = useState("0");
  const [lowStockAt, setLowStockAt] = useState("5");
  const [isLoading, setIsLoading] = useState(false);

  const allVisibleSelected = useMemo(() => {
    return rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  }, [rows, selectedIds]);

  function toggleProduct(productId: string) {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((row) => row.id));
    }
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      alert("Select at least one inventory product first.");
      return;
    }

    if (bulkAction === "SET_STOCK") {
      const confirmed = window.confirm(
        `Set stock quantity to ${stockQty} for all variants under ${selectedIds.length} selected product(s)?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/inventory/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: bulkAction,
          productIds: selectedIds,
          stockQty: Number(stockQty),
          lowStockAt: Number(lowStockAt),
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
    if (stock) params.set("stock", stock);
    params.set("page", String(nextPage));

    return `/admin/inventory?${params.toString()}`;
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          Products with Inventory ({pagination.totalProducts})
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
          action="/admin/inventory"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by product name, slug, category..."
            style={{
              minHeight: 44,
              padding: "0 14px",
              width: "100%",
            }}
          />

          <select
            name="stock"
            defaultValue={stock}
            style={{ minHeight: 44, padding: "0 12px" }}
          >
            <option value="">ALL STOCK</option>
            <option value="LOW">LOW STOCK</option>
            <option value="OUT">OUT OF STOCK</option>
            <option value="IN">IN STOCK</option>
          </select>

          <button type="submit" className="btn-primary">
            Search
          </button>

          <a href="/admin/inventory" className="btn-secondary">
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
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            style={{ minHeight: 42, padding: "0 12px" }}
          >
            <option value="ACTIVATE_VARIANTS">Activate Variants</option>
            <option value="DEACTIVATE_VARIANTS">Deactivate Variants</option>
            <option value="SET_LOW_STOCK">Set Low Stock Alert</option>
            <option value="SET_STOCK">Set Stock Qty</option>
          </select>

          {bulkAction === "SET_STOCK" ? (
            <input
              type="number"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              placeholder="Stock qty"
              style={{ width: 130, minHeight: 42, padding: "0 12px" }}
            />
          ) : null}

          {bulkAction === "SET_LOW_STOCK" ? (
            <input
              type="number"
              min="0"
              value={lowStockAt}
              onChange={(e) => setLowStockAt(e.target.value)}
              placeholder="Low stock at"
              style={{ width: 150, minHeight: 42, padding: "0 12px" }}
            />
          ) : null}

          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading || selectedIds.length === 0}
            onClick={runBulkAction}
          >
            Apply to Selected ({selectedIds.length})
          </button>

          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Showing {rows.length} of {pagination.totalProducts}
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
                  aria-label="Select all visible inventory products"
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Total Stock</th>
              <th>Low Stock</th>
              <th>Active Variants</th>
              <th>Inactive</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: "24px 16px",
                    color: "var(--muted)",
                  }}
                >
                  No inventory products found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleProduct(row.id)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>

                  <td>
                    <div style={{ fontWeight: 700 }}>{row.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      /product/{row.slug}
                    </div>
                  </td>

                  <td>{row.categoryName}</td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        maxWidth: 260,
                      }}
                    >
                      {row.sizes.length > 0 ? (
                        row.sizes.map((size) => (
                          <span key={size} className="status-pill">
                            {size}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "var(--muted)" }}>-</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          row.totalStock <= 5
                            ? "var(--danger)"
                            : "var(--foreground)",
                      }}
                    >
                      {row.totalStock}
                    </span>
                  </td>

                  <td>
                    {row.lowStockVariantCount > 0 ? (
                      <span className="status-pill status-pending">
                        {row.lowStockVariantCount}
                      </span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>

                  <td>{row.variantCount}</td>

                  <td>{row.inactiveVariantCount}</td>

                  <td>
                    <span className="status-pill status-delivered">
                      {row.status}
                    </span>
                  </td>

                  <td>
                    <a
                      href={`/admin/inventory/manage/${row.id}`}
                      className="btn-primary"
                    >
                      Manage
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