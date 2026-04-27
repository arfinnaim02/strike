"use client";

import { useEffect, useMemo, useState } from "react";

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
  onSlideChange?: (banner: HeroBanner) => void;
};

const fallbackSlides: HeroBanner[] = [
  {
    id: "fallback-1",
    title: "BUILT FOR\nTHE BIG STAGE",
    subtitle:
      "Strike Sports delivers premium jerseys, elevated matchday style, and elite fanwear for customers who want more than just another kit.",
    image: "/home/hero-main.png",
    mobileImage: "/home/hero-main.png",
    ctaText: "Shop World Cup",
    ctaUrl: "/collections/world-cup-2026",
  },
];

export function HomeHeroShowcase({ banners, onSlideChange }: Props) {
  const slides = useMemo(() => {
    if (banners.length > 0) return banners;
    return fallbackSlides;
  }, [banners]);

  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    onSlideChange?.(slides[index]);
  }, [index, slides, onSlideChange]);

  return (
    <div className="lux-hero-showcase">
      <div className="lux-hero-slider-layer">
        {slides.map((slide, slideIndex) => {
          const imageUrl =
            isMobile && slide.mobileImage ? slide.mobileImage : slide.image;

          return (
            <div
              key={slide.id}
              className={
                slideIndex === index
                  ? "lux-hero-slide lux-hero-slide-active"
                  : "lux-hero-slide"
              }
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          );
        })}
      </div>

      <div className="lux-hero-showcase-overlay" />
      <div className="lux-hero-showcase-vignette" />
      <div className="lux-hero-showcase-glow" />

      {slides.length > 1 ? (
        <div className="lux-hero-dots">
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={
                dotIndex === index
                  ? "lux-hero-dot lux-hero-dot-active"
                  : "lux-hero-dot"
              }
              onClick={() => setIndex(dotIndex)}
              aria-label={`Show hero slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}