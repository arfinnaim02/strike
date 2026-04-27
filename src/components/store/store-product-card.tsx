"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    totalSold: number;
    collection: string | null;
    categoryName: string;
    image: string | null;
    imageAlt: string;
    totalStock: number;
    isNewArrival?: boolean;
    isHotDeal?: boolean;
    isWorldCup?: boolean;
    isWishlisted?: boolean;
  };
};

function formatCurrency(value: number | null) {
  if (value === null) return "-";
  return `৳${value.toLocaleString("en-BD")}`;
}

export function StoreProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [wished, setWished] = useState(Boolean(product.isWishlisted));
  const [loading, setLoading] = useState(false);

  async function toggleWishlist(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        wished
          ? `/api/account/wishlist?productId=${product.id}`
          : "/api/account/wishlist",
        {
          method: wished ? "DELETE" : "POST",
          headers: wished ? undefined : { "Content-Type": "application/json" },
          body: wished ? undefined : JSON.stringify({ productId: product.id }),
        }
      );

      if (response.status === 401) {
        router.push("/auth/login?callbackUrl=/account/wishlist");
        return;
      }

      const result = await response.json();

      if (result.ok) {
        setWished(Boolean(result.wished));
        window.dispatchEvent(new Event("wishlist-updated"));
        router.refresh();
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <a href={`/product/${product.slug}`} className="premium-product-card">
      <div className="premium-product-image-wrap">
        <div className="premium-product-badges">
          {product.isWorldCup ? (
            <span className="premium-badge premium-badge-new">WORLD CUP</span>
          ) : null}

          {product.isNewArrival ? (
            <span className="premium-badge premium-badge-new">NEW</span>
          ) : null}

          {product.isHotDeal ? (
            <span className="premium-badge premium-badge-sale">HOT</span>
          ) : null}

          {product.salePrice ? (
            <span className="premium-badge premium-badge-sale">SALE</span>
          ) : null}
        </div>

        <button
          type="button"
          className="premium-wishlist-btn"
          onClick={toggleWishlist}
          disabled={loading}
          title={wished ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            color: wished ? "var(--danger)" : "#fff",
            background: wished ? "rgba(255,77,79,0.16)" : undefined,
          }}
        >
          {wished ? "♥" : "♡"}
        </button>

        <div className="premium-product-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.imageAlt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ fontSize: 54 }}>👕</div>
          )}
        </div>
      </div>

      <div className="premium-product-body">
        <div className="premium-product-meta">
          {product.categoryName}
          {product.collection ? ` · ${product.collection}` : ""}
        </div>

        <div className="premium-product-name">{product.name}</div>

        <div className="premium-product-price-row">
          <span className="premium-product-price">
            {formatCurrency(product.salePrice ?? product.basePrice)}
          </span>

          {product.salePrice ? (
            <span className="premium-product-old-price">
              {formatCurrency(product.basePrice)}
            </span>
          ) : null}
        </div>

        <div className="premium-product-bottom">
          <span>Stock {product.totalStock}</span>
          <span>Sold {product.totalSold}</span>
        </div>
      </div>
    </a>
  );
}