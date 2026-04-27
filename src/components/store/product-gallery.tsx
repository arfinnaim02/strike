"use client";

import { useEffect, useMemo, useState } from "react";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

type ProductGalleryProps = {
  productName: string;
  images: ProductImage[];
};

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const normalizedImages = useMemo(() => {
    if (images.length > 0) return images;

    return [
      {
        id: "fallback",
        url: "",
        altText: productName,
        isPrimary: true,
      },
    ];
  }, [images, productName]);

  const initialIndex = Math.max(
    normalizedImages.findIndex((image) => image.isPrimary),
    0
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function changeImage(nextIndex: number) {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= normalizedImages.length) {
      return;
    }

    setPreviousIndex(activeIndex);
    setActiveIndex(nextIndex);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, 700);
  }

  function goPrev() {
    const nextIndex =
      activeIndex === 0 ? normalizedImages.length - 1 : activeIndex - 1;
    changeImage(nextIndex);
  }

  function goNext() {
    const nextIndex =
      activeIndex === normalizedImages.length - 1 ? 0 : activeIndex + 1;
    changeImage(nextIndex);
  }

  useEffect(() => {
    if (normalizedImages.length <= 1) return;

    const interval = window.setInterval(() => {
      const nextIndex =
        activeIndex === normalizedImages.length - 1 ? 0 : activeIndex + 1;
      changeImage(nextIndex);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeIndex, normalizedImages.length]);

  const activeImage = normalizedImages[activeIndex];
  const previousImage =
    previousIndex !== null ? normalizedImages[previousIndex] : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(14,15,22,0.96), rgba(8,9,14,0.98))",
          minHeight: 540,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {previousImage?.url ? (
          <img
            src={previousImage.url}
            alt={previousImage.altText || productName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isTransitioning ? 1 : 0,
              transition: "opacity 700ms ease",
            }}
          />
        ) : null}

        {activeImage?.url ? (
          <img
            src={activeImage.url}
            alt={activeImage.altText || productName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              maxHeight: 640,
              objectFit: "cover",
              opacity: 1,
              animation: "premiumFadeIn 700ms ease",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 88,
              opacity: 0.85,
            }}
          >
            👕
          </div>
        )}

        {normalizedImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 42,
                height: 42,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(10,12,18,0.78)",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                zIndex: 3,
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 42,
                height: 42,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(10,12,18,0.78)",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                zIndex: 3,
              }}
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {normalizedImages.length > 1 ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {normalizedImages.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => changeImage(index)}
                aria-label={`Show image ${index + 1}`}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 16,
                  overflow: "hidden",
                  padding: 0,
                  cursor: "pointer",
                  border: isActive
                    ? "2px solid var(--accent)"
                    : "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(225,255,59,0.1)"
                    : "none",
                }}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.altText || `${productName} thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    👕
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      <style jsx>{`
        @keyframes premiumFadeIn {
          from {
            opacity: 0;
            transform: scale(1.015);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}