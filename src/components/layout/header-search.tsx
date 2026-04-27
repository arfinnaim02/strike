"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryName: string;
  image: string | null;
};

type Props = {
  variant?: "desktop" | "mobile";
  onSelect?: () => void;
};

export function HeaderSearch({ variant = "desktop", onSelect }: Props) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setOpen(true);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={variant === "mobile" ? "header-search-wrap-mobile" : "header-search-wrap"}
    >
      <form action="/shop" method="GET" className="home-header-search">
        <span aria-hidden="true">🔍</span>

        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search jerseys, teams, editions..."
          autoComplete="off"
          autoFocus={variant === "mobile"}
        />
      </form>

      {open && q.trim().length >= 2 ? (
        <div className="header-search-dropdown">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                onClick={() => {
                  setOpen(false);
                  onSelect?.();
                }}
                className="header-search-item"
              >
                <div className="header-search-thumb">
                  {item.image ? <img src={item.image} alt={item.name} /> : <span>👕</span>}
                </div>

                <div>
                  <div className="header-search-name">{item.name}</div>
                  <div className="header-search-meta">{item.categoryName}</div>
                  <div className="header-search-price">
                    ৳{item.price.toLocaleString("en-BD")}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="header-search-empty">
              No matching products found.
              <Link
                href={`/shop?q=${encodeURIComponent(q)}`}
                onClick={onSelect}
              >
                Search all products →
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}