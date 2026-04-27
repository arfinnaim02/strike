"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarCounts = {
  ordersCount: number;
  inventoryCount: number;
  reviewsCount: number;
  supportCount: number;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

type AdminSidebarProps = {
  counts: SidebarCounts;
};

function isItemActive(pathname: string, href: string) {
  if (pathname === href) return true;

  if (href === "/admin/dashboard") {
    return pathname === "/admin" || pathname === "/admin/dashboard";
  }

  return pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ counts }: AdminSidebarProps) {
  const pathname = usePathname();

  const sections: SidebarSection[] = [
    {
      label: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: "📊",
        },
      ],
    },
    {
      label: "Commerce",
      items: [
        {
          label: "Orders",
          href: "/admin/orders",
          icon: "📦",
          badge: counts.ordersCount > 0 ? String(counts.ordersCount) : undefined,
        },
        {
          label: "Products",
          href: "/admin/products",
          icon: "👕",
        },
        {
          label: "Categories",
          href: "/admin/categories",
          icon: "🗂️",
        },
        {
          label: "Inventory",
          href: "/admin/inventory",
          icon: "📦",
          badge: counts.inventoryCount > 0 ? String(counts.inventoryCount) : undefined,
        },
      ],
    },
    {
      label: "Customers",
      items: [
        {
          label: "Customers",
          href: "/admin/customers",
          icon: "👥",
        },
        {
          label: "Reviews",
          href: "/admin/reviews",
          icon: "⭐",
          badge: counts.reviewsCount > 0 ? String(counts.reviewsCount) : undefined,
        },
        {
          label: "Support",
          href: "/admin/support",
          icon: "🎫",
          badge: counts.supportCount > 0 ? String(counts.supportCount) : undefined,
        },
        {
          label: "Returns",
          href: "/admin/returns",
          icon: "🔄",
        },
      ],
    },
    {
      label: "Marketing",
      items: [
        {
          label: "Coupons",
          href: "/admin/coupons",
          icon: "🏷️",
        },
        {
          label: "Banners",
          href: "/admin/banners",
          icon: "🖼️",
        },
        {
          label: "Homepage",
          href: "/admin/homepage",
          icon: "🏠",
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          label: "Delivery",
          href: "/admin/delivery",
          icon: "🚚",
        },
        {
          label: "Payments",
          href: "/admin/payments",
          icon: "💳",
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: "📈",
        },
        {
          label: "SEO",
          href: "/admin/seo",
          icon: "🔍",
        },
        {
          label: "Staff",
          href: "/admin/staff",
          icon: "🔐",
        },
        {
          label: "Settings",
          href: "/admin/settings",
          icon: "⚙️",
        },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/admin/dashboard" className="site-logo">
          STRIKE<span>⚡</span>
        </Link>

        <div
          style={{
            marginTop: 6,
            display: "inline-block",
            fontSize: 10,
            color: "var(--muted)",
            border: "1px solid var(--border)",
            background: "var(--card-2)",
            padding: "3px 8px",
            borderRadius: 6,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          Admin Panel
        </div>
      </div>

      <div style={{ paddingBottom: 80 }}>
        {sections.map((section) => (
          <div key={section.label} style={{ padding: "14px 10px 6px" }}>
            <div
              style={{
                padding: "0 10px",
                marginBottom: 8,
                fontSize: 11,
                color: "var(--muted-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              {section.label}
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              {section.items.map((item) => {
                const active = isItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      color: active ? "var(--accent)" : "var(--muted)",
                      background: active
                        ? "rgba(216,255,47,0.1)"
                        : "transparent",
                      border: active
                        ? "1px solid rgba(216,255,47,0.16)"
                        : "1px solid transparent",
                      transition: "all 0.2s ease",
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <span style={{ width: 18, textAlign: "center" }}>
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    {item.badge ? (
                      <span
                        style={{
                          marginLeft: "auto",
                          background:
                            item.label === "Inventory" || item.label === "Reviews"
                              ? "var(--warning)"
                              : "var(--danger)",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "2px 7px",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid var(--border)",
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#101017",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--accent)",
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          SA
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Strike Admin</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Super Admin</div>
        </div>
      </div>
    </aside>
  );
}