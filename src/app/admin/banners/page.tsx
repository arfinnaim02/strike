import Link from "next/link";
import { getAllHeroBanners } from "../../../lib/banners";

export default async function AdminBannersPage() {
  const banners = await getAllHeroBanners();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="admin-page-title">Hero Banners</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Manage homepage slider banners for desktop and mobile.
          </p>
        </div>

        <Link href="/admin/banners/new" className="btn-primary">
          Add Banner
        </Link>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body" style={{ display: "grid", gap: 16 }}>
          {banners.length === 0 ? (
            <div className="text-muted">No hero banners created yet.</div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 16,
                  display: "grid",
                  gridTemplateColumns: "180px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--card-2)",
                    aspectRatio: "2 / 1",
                  }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title || "Hero banner"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    {banner.title || "Untitled Hero Banner"}
                  </div>

                  <div style={{ color: "var(--muted)", fontSize: 14 }}>
                    Sort: {banner.sortOrder} · {banner.isActive ? "Active" : "Inactive"}
                  </div>

                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Desktop: {banner.image}
                  </div>

                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Mobile: {banner.mobileImage || "—"}
                  </div>
                </div>

                <Link href={`/admin/banners/${banner.id}`} className="btn-secondary">
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}