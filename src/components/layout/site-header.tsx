"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CartCountBadge } from "../cart/cart-count-badge";
import { WishlistCountBadge } from "../account/wishlist-count-badge";
import { HeaderSearch } from "./header-search";
import { useCart } from "../cart/cart-provider";

const navItems = [
  { label: "Hot Deals", href: "/collections/hot-deals", hot: true },
  { label: "Jerseys", href: "/shop" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
];

export function SiteHeader() {
  const { data: session, status } = useSession();
  const { openCart } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isLoggedIn = Boolean(session?.user);
  const displayName =
    session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "Account";

  return (
    <>
      <header className="site-header site-header-home">
        <div className="container site-header-inner">
          <Link href="/" className="site-logo">
            STRIKE<span>⚡</span>
          </Link>

          <div className="desktop-header-search">
            <HeaderSearch />
          </div>

          <nav className="site-nav">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={item.hot ? { color: "#ff6b57" } : undefined}
              >
                {item.hot ? "🔥 " : ""}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header-actions">
            <Link href="/track-order" className="icon-button" title="Track Order">
              📦
            </Link>

            <Link
              href="/account/wishlist"
              className="icon-button"
              title="Wishlist"
              style={{ position: "relative" }}
            >
              ❤️
              <WishlistCountBadge />
            </Link>

            {status === "loading" ? (
              <div className="icon-button">👤</div>
            ) : isLoggedIn ? (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className="account-menu-button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                >
                  👤 {displayName}
                </button>

                {accountOpen ? (
                  <div className="account-dropdown">
                    <Link href="/account" onClick={() => setAccountOpen(false)}>
                      My Account
                    </Link>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/account/profile" onClick={() => setAccountOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/account/wishlist" onClick={() => setAccountOpen(false)}>
                      Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/auth/login" className="account-menu-button">
                👤 Login
              </Link>
            )}

            <button
              type="button"
              className="btn-primary home-cart-btn"
              style={{ position: "relative" }}
              onClick={openCart}
            >
              🛒 Cart
              <CartCountBadge />
            </button>
          </div>

          <div className="mobile-header-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              🔍
            </button>

            <Link
              href="/account/wishlist"
              className="icon-button"
              aria-label="Wishlist"
              style={{ position: "relative" }}
            >
              ❤️
              <WishlistCountBadge />
            </Link>

            <button
              type="button"
              className="mobile-cart-button"
              aria-label="Cart"
              onClick={openCart}
            >
              🛒
              <CartCountBadge />
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="mobile-search-overlay">
          <div className="mobile-search-panel">
            <div className="mobile-panel-head">
              <div>
                <div className="mobile-panel-label">Search Store</div>
                <div className="mobile-panel-title">Find your jersey</div>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setSearchOpen(false)}
              >
                ✕
              </button>
            </div>

            <HeaderSearch variant="mobile" onSelect={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-panel-head">
              <Link href="/" className="site-logo" onClick={() => setMenuOpen(false)}>
                STRIKE<span>⚡</span>
              </Link>

              <button
                type="button"
                className="icon-button"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-links">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.hot ? "🔥 " : ""}
                  {item.label}
                </Link>
              ))}

              <Link href="/track-order" onClick={() => setMenuOpen(false)}>
                📦 Track Order
              </Link>

              <Link href="/account/wishlist" onClick={() => setMenuOpen(false)}>
                ❤️ Wishlist
              </Link>

              {isLoggedIn ? (
                <>
                  <Link href="/account" onClick={() => setMenuOpen(false)}>
                    👤 My Account
                  </Link>
                  <Link href="/account/orders" onClick={() => setMenuOpen(false)}>
                    🧾 My Orders
                  </Link>
                  <Link href="/account/profile" onClick={() => setMenuOpen(false)}>
                    ⚙️ Profile
                  </Link>

                  <button
                    type="button"
                    className="mobile-menu-logout"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  👤 Login
                </Link>
              )}
            </div>

            <button
              type="button"
              className="btn-primary mobile-menu-cart"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
            >
              🛒 View Cart <CartCountBadge />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}