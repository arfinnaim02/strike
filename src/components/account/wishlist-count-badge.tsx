"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function WishlistCountBadge() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      setCount(0);
      return;
    }

    async function loadCount() {
      const res = await fetch("/api/account/wishlist/count");
      const data = await res.json();
      setCount(data.count ?? 0);
    }

    loadCount();

    window.addEventListener("wishlist-updated", loadCount);
    return () => window.removeEventListener("wishlist-updated", loadCount);
  }, [session?.user]);

  if (!count) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 999,
        background: "var(--danger)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  );
}