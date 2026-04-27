"use client";

import { useMemo, useState } from "react";

type OrderItem = {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantInfo: string | null;
  image: string | null;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  sku: string | null;
};

type EditableProduct = {
  id: string;
  name: string;
  image: string | null;
  basePrice: number;
  salePrice: number | null;
  variants: {
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    sleeveType: string | null;
    edition: string | null;
    stockQty: number;
    priceOffset: number;
  }[];
};

type Props = {
  orderId: string;
  items: OrderItem[];
  products: EditableProduct[];
};

export function OrderItemsManager({ orderId, items, products }: Props) {
  const [rows, setRows] = useState(
    items.map((item) => ({
      orderItemId: item.id,
      productId: item.productId,
      variantId: item.variantId ?? "",
      qty: String(item.qty),
      unitPrice: String(item.unitPrice),
      remove: false,
    }))
  );

  const itemsJson = useMemo(() => JSON.stringify(rows), [rows]);

  function updateRow(index: number, key: string, value: string | boolean) {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  }

  return (
    <div className="dashboard-card" style={{ marginTop: 20 }}>
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">Edit Order Items</div>
      </div>

      <div className="dashboard-card-body">
        <form action="/api/admin/orders/update-items" method="POST" style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="itemsJson" value={itemsJson} />

          {rows.map((row, index) => {
            const selectedProduct = products.find((product) => product.id === row.productId);

            return (
              <div
                key={row.orderItemId}
                style={{
                  display: "grid",
                  gap: 12,
                  padding: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <select
                  value={row.productId}
                  onChange={(e) => {
                    const product = products.find((p) => p.id === e.target.value);
                    const firstVariant = product?.variants[0];

                    updateRow(index, "productId", e.target.value);
                    updateRow(index, "variantId", firstVariant?.id ?? "");
                    updateRow(
                      index,
                      "unitPrice",
                      String((product?.salePrice ?? product?.basePrice ?? 0) + (firstVariant?.priceOffset ?? 0))
                    );
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <select
                  value={row.variantId}
                  onChange={(e) => {
                    const variant = selectedProduct?.variants.find((v) => v.id === e.target.value);
                    updateRow(index, "variantId", e.target.value);
                    updateRow(
                      index,
                      "unitPrice",
                      String((selectedProduct?.salePrice ?? selectedProduct?.basePrice ?? 0) + (variant?.priceOffset ?? 0))
                    );
                  }}
                >
                  <option value="">No variant</option>
                  {selectedProduct?.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {[variant.size, variant.color, variant.sleeveType, variant.edition]
                        .filter(Boolean)
                        .join(" / ") || variant.sku}{" "}
                      — Stock: {variant.stockQty}
                    </option>
                  ))}
                </select>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={(e) => updateRow(index, "qty", e.target.value)}
                    placeholder="Qty"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(index, "unitPrice", e.target.value)}
                    placeholder="Unit price"
                  />
                </div>

                <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--danger)" }}>
                  <input
                    type="checkbox"
                    checked={row.remove}
                    onChange={(e) => updateRow(index, "remove", e.target.checked)}
                  />
                  Remove this item
                </label>
              </div>
            );
          })}

          <button type="submit" className="btn-primary">
            Save Item Changes
          </button>
        </form>
      </div>
    </div>
  );
}