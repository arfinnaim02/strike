"use client";

import { useCart } from "./cart-provider";

export function CartCountBadge() {
  const { totalItems } = useCart();

  return (
    <span
      style={{
        background: "#0a0a0a",
        color: "var(--accent)",
        borderRadius: 8,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 800,
        minWidth: 24,
        textAlign: "center",
      }}
    >
      {totalItems}
    </span>
  );
}