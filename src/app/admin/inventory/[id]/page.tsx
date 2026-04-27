import { notFound } from "next/navigation";
import { getInventoryDetail } from "../../../../lib/inventory";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InventoryEditPage({ params }: PageProps) {
  const { id } = await params;
  const row = await getInventoryDetail(id);

  if (!row) {
    notFound();
  }

  return (
    <main>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Edit Inventory</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          {row.productName} · {row.sku}
        </p>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <form
            action="/api/admin/inventory/update"
            method="POST"
            style={{
              display: "grid",
              gap: 16,
              maxWidth: 760,
            }}
          >
            <input type="hidden" name="id" value={row.id} />

            <div style={{ display: "grid", gap: 8 }}>
              <label>Product</label>
              <input value={`${row.productName} (${row.categoryName})`} disabled />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>SKU</label>
                <input value={row.sku} disabled />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Variant</label>
                <input
                  value={
                    [row.size, row.color, row.sleeveType, row.edition]
                      .filter(Boolean)
                      .join(" / ") || "Default"
                  }
                  disabled
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Stock Quantity</label>
                <input
                  name="stockQty"
                  type="number"
                  min={0}
                  defaultValue={row.stockQty}
                  required
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Low Stock Alert At</label>
                <input
                  name="lowStockAt"
                  type="number"
                  min={0}
                  defaultValue={row.lowStockAt}
                  required
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Price Offset</label>
                <input
                  name="priceOffset"
                  type="number"
                  step="0.01"
                  defaultValue={row.priceOffset}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={row.isActive}
                />{" "}
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn-primary">
                Update Inventory
              </button>

              <a href="/admin/inventory" className="btn-secondary">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}