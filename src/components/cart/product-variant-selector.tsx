"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";

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
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  image?: string | null;
  variants: Variant[];
};

const editionOrder = ["Fan Edition", "Player Edition"];

function normalizeEdition(value: string | null) {
  return value || "Standard";
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(Boolean))] as string[];
}

function sortSizes(sizes: string[]) {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
  return [...sizes].sort((a, b) => {
    const ai = order.indexOf(a.toUpperCase());
    const bi = order.indexOf(b.toUpperCase());

    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });
}

export function ProductVariantSelector({
  productId,
  slug,
  name,
  basePrice,
  salePrice,
  image,
  variants,
}: Props) {
  const editions = useMemo(() => {
    const values = [...new Set(variants.map((v) => normalizeEdition(v.edition)))];

    return values.sort((a, b) => {
      const ai = editionOrder.indexOf(a);
      const bi = editionOrder.indexOf(b);

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;

      return ai - bi;
    });
  }, [variants]);

  const [edition, setEdition] = useState<string | null>(editions[0] ?? null);

  const editionVariants = useMemo(() => {
    if (!edition) return variants;
    return variants.filter((variant) => normalizeEdition(variant.edition) === edition);
  }, [variants, edition]);

  const sizes = useMemo(
    () => sortSizes(uniqueValues(editionVariants.map((v) => v.size))),
    [editionVariants]
  );

  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  useEffect(() => {
    if (editions.length > 0 && !edition) {
      setEdition(editions[0]);
    }
  }, [editions, edition]);

  useEffect(() => {
    setSize(sizes[0] ?? null);
  }, [edition, sizes]);

  const selectedVariant = useMemo(() => {
    if (size) {
      const matched = editionVariants.find((v) => v.size === size);
      if (matched) return matched;
    }

    return editionVariants[0] ?? variants[0] ?? null;
  }, [editionVariants, variants, size]);

  const finalPrice =
    (salePrice ?? basePrice) + (selectedVariant?.priceOffset ?? 0);

  return (
    <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
      {editions.length > 1 ? (
        <div className="surface-card" style={{ padding: 22, borderRadius: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Select Edition</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Choose fabric quality and fit type.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {editions.map((item) => {
              const isSelected = edition === item;
              const editionStock = variants
                .filter((variant) => normalizeEdition(variant.edition) === item)
                .reduce((sum, variant) => sum + variant.stockQty, 0);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEdition(item)}
                  disabled={editionStock <= 0}
                  style={{
                    minHeight: 82,
                    borderRadius: 18,
                    padding: 14,
                    border: isSelected
                      ? "1px solid rgba(225,255,59,0.42)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "linear-gradient(180deg, rgba(225,255,59,0.15), rgba(225,255,59,0.06))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",
                    color: isSelected ? "var(--accent)" : "var(--foreground)",
                    opacity: editionStock <= 0 ? 0.4 : 1,
                    cursor: editionStock <= 0 ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 17 }}>{item}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                    Stock: {editionStock}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className="surface-card" style={{ padding: 22, borderRadius: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Select Size</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Sizes are shown for selected edition only.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
              gap: 12,
            }}
          >
            {sizes.map((item) => {
              const sizeVariant = editionVariants.find((v) => v.size === item);
              const isSelected = size === item;
              const isOutOfStock = (sizeVariant?.stockQty ?? 0) <= 0;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  disabled={isOutOfStock}
                  style={{
                    minHeight: 72,
                    borderRadius: 18,
                    border: isSelected
                      ? "1px solid rgba(225,255,59,0.38)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "linear-gradient(180deg, rgba(225,255,59,0.14), rgba(225,255,59,0.07))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                    color: isSelected ? "var(--accent)" : "var(--foreground)",
                    opacity: isOutOfStock ? 0.38 : 1,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="surface-card" style={{ padding: 20, borderRadius: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Selected
            </div>
            <div style={{ fontWeight: 900, fontSize: 21 }}>
              {edition ?? "-"} / {selectedVariant?.size ?? "-"}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Final Price
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 28,
                color: "var(--accent)",
                fontFamily: "var(--font-heading)",
              }}
            >
              ৳{finalPrice.toLocaleString("en-BD")}
            </div>
          </div>
        </div>
      </div>

      {selectedVariant && selectedVariant.stockQty > 0 ? (
        <AddToCartButton
          id={productId}
          variantId={selectedVariant.id}
          slug={slug}
          name={name}
          price={finalPrice}
          image={image}
          size={selectedVariant.size}
          color={selectedVariant.color}
          sleeveType={selectedVariant.sleeveType}
          edition={normalizeEdition(selectedVariant.edition)}
        />
      ) : (
        <button className="btn-secondary" type="button" disabled>
          Selected Option Out of Stock
        </button>
      )}
    </div>
  );
}