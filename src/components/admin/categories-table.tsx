"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  productCount: number;
  childCount: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalCategories: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Props = {
  categories: AdminCategory[];
  pagination: Pagination;
  search: string;
  status: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function CategoriesTable({
  categories,
  pagination,
  search,
  status,
}: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("ACTIVATE");
  const [isLoading, setIsLoading] = useState(false);

  const allVisibleSelected = useMemo(() => {
    return (
      categories.length > 0 &&
      categories.every((category) => selectedIds.includes(category.id))
    );
  }, [categories, selectedIds]);

  function toggleCategory(categoryId: string) {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((category) => category.id));
    }
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      alert("Select at least one category first.");
      return;
    }

    if (bulkAction === "DELETE") {
      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected category/categories? Categories with products or child categories will be blocked.`
      );

      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/categories/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: bulkAction,
          categoryIds: selectedIds,
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

    return `/admin/categories?${params.toString()}`;
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          Category Management ({pagination.totalCategories})
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
          action="/admin/categories"
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
            placeholder="Search by category name, slug, parent..."
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
            <option value="">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <button type="submit" className="btn-primary">
            Search
          </button>

          <a href="/admin/categories" className="btn-secondary">
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
            <option value="ACTIVATE">Activate</option>
            <option value="DEACTIVATE">Deactivate</option>
            <option value="FEATURE_ON">Featured ON</option>
            <option value="FEATURE_OFF">Featured OFF</option>
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
            Showing {categories.length} of {pagination.totalCategories}
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
                  aria-label="Select all visible categories"
                />
              </th>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent</th>
              <th>Products</th>
              <th>Children</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Sort</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: 24,
                    color: "var(--muted)",
                  }}
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      aria-label={`Select ${category.name}`}
                    />
                  </td>

                  <td>
                    <div style={{ fontWeight: 800 }}>{category.name}</div>
                  </td>

                  <td>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>
                      {category.slug}
                    </span>
                  </td>

                  <td>{category.parentName ?? "-"}</td>

                  <td>{category.productCount}</td>

                  <td>{category.childCount}</td>

                  <td>
                    {category.isFeatured ? (
                      <span className="status-pill status-confirmed">Yes</span>
                    ) : (
                      <span className="status-pill">No</span>
                    )}
                  </td>

                  <td>
                    {category.isActive ? (
                      <span className="status-pill status-delivered">Active</span>
                    ) : (
                      <span className="status-pill status-cancelled">Inactive</span>
                    )}
                  </td>

                  <td>{category.sortOrder}</td>

                  <td>{formatDate(category.createdAt)}</td>
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