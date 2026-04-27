"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export function CartDrawer() {
  const {
    items,
    subtotal,
    totalItems,
    isCartOpen,
    closeCart,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useCart();

  return (
    <>
      {isCartOpen ? (
        <div className="cart-drawer-overlay" onClick={closeCart}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-head">
              <div>
                <div className="lux-eyebrow" style={{ marginBottom: 8 }}>
                  Your Bag
                </div>
                <h2 className="cart-drawer-title">Cart</h2>
              </div>

              <button type="button" className="icon-button" onClick={closeCart}>
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-drawer-empty">
                <div style={{ fontSize: 44 }}>🛒</div>
                <h3>Your cart is empty</h3>
                <p className="text-muted">
                  Add jerseys to your cart and checkout smoothly.
                </p>

                <Link href="/shop" className="btn-primary" onClick={closeCart}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-drawer-items">
                  {items.map((item) => (
                    <div key={item.variantId} className="cart-drawer-item">
                      <Link
                        href={`/product/${item.slug}`}
                        className="cart-drawer-img"
                        onClick={closeCart}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span>👕</span>
                        )}
                      </Link>

                      <div className="cart-drawer-info">
                        <Link
                          href={`/product/${item.slug}`}
                          className="cart-drawer-name"
                          onClick={closeCart}
                        >
                          {item.name}
                        </Link>

                        <div className="cart-drawer-meta">
                          {[item.edition, item.size, item.color, item.sleeveType]
                            .filter(Boolean)
                            .join(" / ") || "Standard"}
                        </div>

                        <div className="cart-drawer-price">
                          {money(item.price)}
                        </div>

                        <div className="cart-drawer-actions">
                          <button
                            type="button"
                            onClick={() => decreaseQty(item.variantId)}
                          >
                            -
                          </button>

                          <span>{item.qty}</span>

                          <button
                            type="button"
                            onClick={() => increaseQty(item.variantId)}
                          >
                            +
                          </button>

                          <button
                            type="button"
                            className="cart-drawer-remove"
                            onClick={() => removeItem(item.variantId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-drawer-line-total">
                        {money(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-drawer-row">
                    <span>Items</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="cart-drawer-row">
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div className="cart-drawer-note">
                    Delivery charge will be calculated at checkout.
                  </div>

                  <Link
                    href="/checkout"
                    className="btn-primary cart-drawer-checkout"
                    onClick={closeCart}
                  >
                    Checkout Now
                  </Link>

                  <Link
                    href="/cart"
                    className="btn-secondary cart-drawer-view-cart"
                    onClick={closeCart}
                  >
                    View Full Cart
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}