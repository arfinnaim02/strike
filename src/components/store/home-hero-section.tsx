"use client";

import { useMemo, useState } from "react";
import { HomeHeroShowcase } from "./home-hero-showcase";

type HeroBanner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  mobileImage: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
};

type Props = {
  banners: HeroBanner[];
};

function splitHeroTitle(title: string | null) {
  const fallback = {
    top: "BUILT FOR",
    bottom: "THE BIG STAGE",
  };

  if (!title || !title.trim()) return fallback;

  const normalized = title.replace(/\r/g, "").trim();

  if (normalized.includes("\n")) {
    const parts = normalized.split("\n").map((part) => part.trim()).filter(Boolean);
    return {
      top: parts[0] || fallback.top,
      bottom: parts[1] || fallback.bottom,
    };
  }

  const words = normalized.split(" ");
  if (words.length <= 2) {
    return {
      top: normalized,
      bottom: "",
    };
  }

  const mid = Math.ceil(words.length / 2);
  return {
    top: words.slice(0, mid).join(" "),
    bottom: words.slice(mid).join(" "),
  };
}

export function HomeHeroSection({ banners }: Props) {
  const fallbackBanner: HeroBanner = {
    id: "fallback",
    title: "BUILT FOR\nTHE BIG STAGE",
    subtitle:
      "Strike Sports delivers premium jerseys, elevated matchday style, and elite fanwear for customers who want more than just another kit.",
    image: "/home/hero-main.png",
    mobileImage: "/home/hero-main.png",
    ctaText: "Shop World Cup",
    ctaUrl: "/collections/world-cup-2026",
  };

  const safeBanners = banners.length > 0 ? banners : [fallbackBanner];
  const [activeBanner, setActiveBanner] = useState<HeroBanner>(safeBanners[0]);

  const titleParts = useMemo(() => {
    return splitHeroTitle(activeBanner.title);
  }, [activeBanner.title]);

  return (
    <section className="lux-hero">
            <HomeHeroShowcase
        banners={safeBanners}
        onSlideChange={(banner) => {
          setActiveBanner((current) => {
            if (current.id === banner.id) return current;
            return banner;
          });
        }}
      />

      <div className="container">
        <div className="lux-hero-grid">
          <div className="lux-hero-copy">

            <h1 className="lux-hero-title">
              {titleParts.top}
              {titleParts.bottom ? (
                <>
                  <br />
                  <span>{titleParts.bottom}</span>
                </>
              ) : null}
            </h1>

            <p className="lux-hero-text">
              {activeBanner.subtitle ||
                "Strike Sports delivers premium jerseys, elevated matchday style, and elite fanwear for customers who want more than just another kit."}
            </p>

            <div className="lux-hero-actions">
              <a
                href={activeBanner.ctaUrl || "/collections/world-cup-2026"}
                className="btn-primary"
              >
                {activeBanner.ctaText || "Shop World Cup"}
              </a>

              <a href="/shop" className="btn-secondary">
                Explore All Jerseys
              </a>

              <a href="https://wa.me/8800000000000" className="lux-hero-support-btn">
                WhatsApp Support
              </a>
            </div>

            <div className="lux-hero-metrics">
              <div className="lux-metric">
                <div className="lux-metric-value">15K+</div>
                <div className="lux-metric-label">Customers Served</div>
              </div>
              <div className="lux-metric">
                <div className="lux-metric-value">500+</div>
                <div className="lux-metric-label">Products Curated</div>
              </div>
              <div className="lux-metric">
                <div className="lux-metric-value">4.9★</div>
                <div className="lux-metric-label">Rated Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}