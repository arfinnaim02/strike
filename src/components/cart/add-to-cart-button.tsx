"use client";

import { useCart } from "./cart-provider";

type Props = {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
  sleeveType?: string | null;
  edition?: string | null;
};

export function AddToCartButton(props: Props) {
  const {
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    getItemQty,
  } = useCart();

  const qty = getItemQty(props.variantId);

  if (qty === 0) {
    return (
      <button
        className="btn-primary"
        onClick={() => addItem(props)}
        type="button"
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        className="surface-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          borderRadius: 14,
        }}
      >
        <button
          type="button"
          className="btn-secondary"
          onClick={() => decreaseQty(props.variantId)}
          style={{ minHeight: 38, padding: "0 14px" }}
        >
          -
        </button>

        <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>
          {qty}
        </span>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => increaseQty(props.variantId)}
          style={{ minHeight: 38, padding: "0 14px" }}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => removeItem(props.variantId)}
        className="btn-secondary"
        style={{
          borderColor: "rgba(255,77,79,0.25)",
          color: "var(--danger)",
        }}
      >
        Remove
      </button>
    </div>
  );
}