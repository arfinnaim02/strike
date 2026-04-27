"use client";

import { useMemo, useState } from "react";

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  sleeveType: string | null;
  edition: string | null;
  priceOffset: number;
  stockQty: number;
  lowStockAt: number;
  isActive: boolean;
};

type ProductData = {
  id: string;
  name: string;
  slug: string;
  status: string;
  categoryName: string;
  totalStock: number;
  variants: Variant[];
};

type Props = {
  product: ProductData;
};

const sizeOptions = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];
const editionOptions = ["Fan Edition", "Player Edition"];

function variantKey(edition: string, size: string) {
  return `${edition}__${size}`.toUpperCase();
}

export function ProductInventoryManager({ product }: Props) {
  const [newEdition, setNewEdition] = useState("Fan Edition");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [newStockBySize, setNewStockBySize] = useState<Record<string, string>>({});

  const existingVariantKeys = new Set(
    product.variants
      .map((variant) =>
        variantKey(variant.edition || "Standard", variant.size || "")
      )
      .filter(Boolean)
  );

  const [existingStock, setExistingStock] = useState<Record<string, string>>(
    Object.fromEntries(
      product.variants.map((variant) => [variant.id, String(variant.stockQty)])
    )
  );

  const [existingLowStock, setExistingLowStock] = useState<Record<string, string>>(
    Object.fromEntries(
      product.variants.map((variant) => [variant.id, String(variant.lowStockAt)])
    )
  );

  const [existingPriceOffset, setExistingPriceOffset] = useState<Record<string, string>>(
    Object.fromEntries(
      product.variants.map((variant) => [variant.id, String(variant.priceOffset)])
    )
  );

  const [existingActive, setExistingActive] = useState<Record<string, boolean>>(
    Object.fromEntries(
      product.variants.map((variant) => [variant.id, variant.isActive])
    )
  );

  function toggleSize(size: string) {
    const key = variantKey(newEdition, size);
    if (existingVariantKeys.has(key)) return;

    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  }

  const addItemsJson = useMemo(() => {
    return JSON.stringify(
      selectedSizes.map((size) => ({
        edition: newEdition,
        size,
        stockQty: Number(newStockBySize[size] || 0),
      }))
    );
  }, [selectedSizes, newStockBySize, newEdition]);

  const updateItemsJson = useMemo(() => {
    return JSON.stringify(
      product.variants.map((variant) => ({
        variantId: variant.id,
        stockQty: Number(existingStock[variant.id] ?? variant.stockQty),
        lowStockAt: Number(existingLowStock[variant.id] ?? variant.lowStockAt),
        priceOffset: Number(existingPriceOffset[variant.id] ?? variant.priceOffset),
        isActive: Boolean(existingActive[variant.id]),
      }))
    );
  }, [
    product.variants,
    existingStock,
    existingLowStock,
    existingPriceOffset,
    existingActive,
  ]);

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div className="surface-card" style={{ padding: 20, borderRadius: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{product.name}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
          {product.categoryName} · {product.status}
        </div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
          Total Stock: {product.totalStock} · Variants: {product.variants.length}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Add Edition Sizes</div>
        </div>

        <div className="dashboard-card-body">
          <form
            action="/api/admin/inventory/manage/add-sizes"
            method="POST"
            style={{ display: "grid", gap: 18 }}
          >
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="itemsJson" value={addItemsJson} />

            <div style={{ display: "grid", gap: 8 }}>
              <label>Edition</label>
              <select
                name="edition"
                value={newEdition}
                onChange={(e) => {
                  setNewEdition(e.target.value);
                  setSelectedSizes([]);
                  setNewStockBySize({});
                }}
              >
                {editionOptions.map((edition) => (
                  <option key={edition} value={edition}>
                    {edition}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label>Select Sizes</label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {sizeOptions.map((size) => {
                  const alreadyExists = existingVariantKeys.has(
                    variantKey(newEdition, size)
                  );
                  const isSelected = selectedSizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      disabled={alreadyExists}
                      className="btn-secondary"
                      style={{
                        minWidth: 70,
                        border: isSelected
                          ? "1px solid rgba(225,255,59,0.35)"
                          : undefined,
                        background: isSelected ? "var(--accent-soft)" : undefined,
                        color: isSelected ? "var(--accent)" : undefined,
                        fontWeight: 800,
                        opacity: alreadyExists ? 0.45 : 1,
                        cursor: alreadyExists ? "not-allowed" : "pointer",
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSizes.length > 0 ? (
              <div className="surface-card" style={{ padding: 18, borderRadius: 18 }}>
                <div style={{ fontWeight: 800, marginBottom: 14 }}>
                  Stock for {newEdition}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 12,
                  }}
                >
                  {selectedSizes.map((size) => (
                    <div key={size} style={{ display: "grid", gap: 8 }}>
                      <label>{size} Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={newStockBySize[size] ?? ""}
                        onChange={(e) =>
                          setNewStockBySize((prev) => ({
                            ...prev,
                            [size]: e.target.value,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label>SKU Prefix</label>
                <input
                  name="skuPrefix"
                  defaultValue={product.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}
                  required
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Price Offset</label>
                <input
                  name="priceOffset"
                  type="number"
                  step="0.01"
                  defaultValue={newEdition === "Player Edition" ? "400" : "0"}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Low Stock Alert</label>
                <input name="lowStockAt" type="number" min="0" defaultValue="5" />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={selectedSizes.length === 0}
            >
              Add Selected Edition Sizes
            </button>
          </form>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Manage Existing Variants</div>
        </div>

        <div className="dashboard-card-body">
          {product.variants.length === 0 ? (
            <div className="text-muted">No variants found for this product.</div>
          ) : (
            <form
              action="/api/admin/inventory/manage/update"
              method="POST"
              style={{ display: "grid", gap: 18 }}
            >
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="itemsJson" value={updateItemsJson} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="surface-card"
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18 }}>
                      {variant.edition || "Standard"} / {variant.size || "No Size"}
                    </div>

                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      SKU: {variant.sku}
                    </div>

                    <label style={{ fontSize: 12 }}>Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={existingStock[variant.id] ?? ""}
                      onChange={(e) =>
                        setExistingStock((prev) => ({
                          ...prev,
                          [variant.id]: e.target.value,
                        }))
                      }
                    />

                    <label style={{ fontSize: 12 }}>Low Stock At</label>
                    <input
                      type="number"
                      min="0"
                      value={existingLowStock[variant.id] ?? ""}
                      onChange={(e) =>
                        setExistingLowStock((prev) => ({
                          ...prev,
                          [variant.id]: e.target.value,
                        }))
                      }
                    />

                    <label style={{ fontSize: 12 }}>Price Offset</label>
                    <input
                      type="number"
                      step="0.01"
                      value={existingPriceOffset[variant.id] ?? ""}
                      onChange={(e) =>
                        setExistingPriceOffset((prev) => ({
                          ...prev,
                          [variant.id]: e.target.value,
                        }))
                      }
                    />

                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(existingActive[variant.id])}
                        onChange={(e) =>
                          setExistingActive((prev) => ({
                            ...prev,
                            [variant.id]: e.target.checked,
                          }))
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="submit" className="btn-primary">
                  Save All Changes
                </button>

                <a href={`/admin/products/${product.id}`} className="btn-secondary">
                  Edit Product
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}