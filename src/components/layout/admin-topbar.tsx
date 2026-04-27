"use client";

import Link from "next/link";

export function AdminTopbar() {
  return (
    <div className="admin-topbar">
      <div
        style={{
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div className="admin-page-title">Dashboard</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link href="/admin/products/new" className="btn-primary">
            + Add Product
          </Link>

          <a
            href="/api/auth/signout"
            className="btn-primary"
            style={{
              background: "#ef4444",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}