"use client";

import { useCart } from "../../../components/cart/cart-provider";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export default function CartPage() {
  const {
    items,
    subtotal,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart();

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h1 className="section-title">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="dashboard-card" style={{ marginTop: 20 }}>
          <div className="dashboard-card-body">Cart is empty.</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 420px",
            gap: 24,
            marginTop: 24,
          }}
          className="cart-layout"
        >
          <section className="dashboard-card">
            <div className="dashboard-card-body">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr auto",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1/1",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "var(--card-2)",
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>

                    <div className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
                      {[item.size, item.color, item.sleeveType, item.edition]
                        .filter(Boolean)
                        .join(" / ") || "Default variant"}
                    </div>

                    <div className="text-muted" style={{ marginTop: 6 }}>
                      {money(item.price)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => decreaseQty(item.variantId)}
                      >
                        -
                      </button>

                      <span>{item.qty}</span>

                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => increaseQty(item.variantId)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>
                      {money(item.qty * item.price)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      style={{
                        marginTop: 10,
                        color: "var(--danger)",
                        background: "none",
                        border: 0,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 18 }}>
                <button type="button" className="btn-secondary" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
          </section>

          <aside className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Summary</div>
            </div>

            <div className="dashboard-card-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>

              <a
                href="/checkout"
                className="btn-primary"
                style={{ width: "100%", textAlign: "center" }}
              >
                Proceed to Checkout
              </a>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}