"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: string;
  brand: string;
  basePrice: number;
  salePrice: number | null;
  isFeatured: boolean;
  isHotDeal: boolean;
  isNewArrival: boolean;
  isWorldCup: boolean;
  totalSold: number;
  totalStock: number;
  createdAt: string;
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
  products: AdminProduct[];
  pagination: Pagination;
  search: string;
  status: string;
};

const productStatusOptions = ["", "ACTIVE", "DRAFT", "ARCHIVED"];

function formatCurrency(value: number | null) {
  if (value === null) return "-";
  return `৳${value.toLocaleString("en-BD")}`;
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return {
        background: "rgba(34, 197, 94, 0.12)",
        color: "var(--success)",
        border: "1px solid rgba(34, 197, 94, 0.2)",
      };
    case "DRAFT":
      return {
        background: "rgba(245, 158, 11, 0.12)",
        color: "var(--warning)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
      };
    default:
      return {
        background: "rgba(255, 77, 79, 0.12)",
        color: "var(--danger)",
        border: "1px solid rgba(255, 77, 79, 0.2)",
      };
  }
}

export function ProductsTable({ products, pagination, search, status }: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("SET_ACTIVE");
  const [isLoading, setIsLoading] = useState(false);

  const allVisibleSelected = useMemo(() => {
    return (
      products.length > 0 &&
      products.every((product) => selectedIds.includes(product.id))
    );
  }, [products, selectedIds]);

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
      setSelectedIds(products.map((product) => product.id));
    }
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      alert("Select at least one product first.");
      return;
    }

    if (bulkAction === "DELETE") {
      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected product(s)? This can affect orders/history if products are referenced.`
      );

      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: bulkAction,
          productIds: selectedIds,
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
    params.set("page", String(nextPage));

    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          Product Catalog ({pagination.totalProducts})
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
          action="/admin/products"
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
            placeholder="Search by product name, SKU, slug, category, brand, collection..."
            style={{
              minHeight: 44,
              padding: "0 14px",
              width: "100%",
            }}
          />

          <select
            name="status"
            defaultValue={status}
            style={{ minHeight: 44, padding: "0 12px" }}
          >
            {productStatusOptions.map((option) => (
              <option key={option || "ALL"} value={option}>
                {option || "ALL STATUS"}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary">
            Search
          </button>

          <a href="/admin/products" className="btn-secondary">
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
            <option value="SET_ACTIVE">Set Active</option>
            <option value="SET_DRAFT">Set Draft</option>
            <option value="SET_ARCHIVED">Archive</option>
            <option value="FEATURE_ON">Featured ON</option>
            <option value="FEATURE_OFF">Featured OFF</option>
            <option value="HOT_DEAL_ON">Hot Deal ON</option>
            <option value="HOT_DEAL_OFF">Hot Deal OFF</option>
            <option value="NEW_ARRIVAL_ON">New Arrival ON</option>
            <option value="NEW_ARRIVAL_OFF">New Arrival OFF</option>
            <option value="WORLD_CUP_ON">World Cup ON</option>
            <option value="WORLD_CUP_OFF">World Cup OFF</option>
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
            Showing {products.length} of {pagination.totalProducts}
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
                  aria-label="Select all visible products"
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sold</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: "24px 16px",
                    color: "var(--muted)",
                  }}
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>

                  <td>
                    <div style={{ fontWeight: 700 }}>{product.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      /product/{product.slug}
                    </div>
                  </td>

                  <td>{product.category}</td>

                  <td>{product.brand}</td>

                  <td>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--accent)",
                        fontFamily: "var(--font-heading)",
                        fontSize: 18,
                      }}
                    >
                      {formatCurrency(product.basePrice)}
                    </div>

                    {product.salePrice ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        Sale: {formatCurrency(product.salePrice)}
                      </div>
                    ) : null}
                  </td>

                  <td>
                    <span
                      style={{
                        color:
                          product.totalStock <= 5
                            ? "var(--danger)"
                            : "var(--foreground)",
                        fontWeight: 700,
                      }}
                    >
                      {product.totalStock}
                    </span>
                  </td>

                  <td>{product.totalSold}</td>

                  <td>
                    <span
                      style={{
                        ...statusColor(product.status),
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {product.isFeatured ? (
                        <span className="status-pill status-confirmed">
                          Featured
                        </span>
                      ) : null}

                      {product.isHotDeal ? (
                        <span className="status-pill status-pending">
                          Hot Deal
                        </span>
                      ) : null}

                      {product.isNewArrival ? (
                        <span className="status-pill status-shipped">New</span>
                      ) : null}

                      {product.isWorldCup ? (
                        <span className="status-pill status-confirmed">
                          World Cup
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a
                        href={`/admin/products/${product.id}`}
                        className="btn-secondary"
                      >
                        Edit
                      </a>
                    </div>
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