import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { db } from "../../lib/db";
import { SiteHeader } from "../../components/layout/site-header";
import { SiteFooter } from "../../components/layout/site-footer";
import { LogoutButton } from "../../components/auth/logout-button";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              id: true,
            },
          },
        },
      },
      addresses: {
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          label: true,
          city: true,
          district: true,
          division: true,
          isDefault: true,
        },
      },
      wishlist: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const totalOrderValue = user.orders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <div className="lux-eyebrow">Customer Account</div>
            <h1 className="section-title">My Account</h1>
            <p className="text-muted" style={{ marginTop: 12 }}>
              Welcome back, {user.name || "Customer"}.
            </p>
          </div>

          <LogoutButton />
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
          className="account-stats-grid"
        >
          <StatCard label="Total Orders" value={String(user.orders.length)} />
          <StatCard label="Order Value" value={money(totalOrderValue)} />
          <StatCard label="Saved Addresses" value={String(user.addresses.length)} />
          <StatCard label="Wishlist Items" value={String(user.wishlist.length)} />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.35fr",
            gap: 20,
            alignItems: "start",
          }}
          className="account-main-grid"
        >
          <div style={{ display: "grid", gap: 20 }}>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-title">Profile</div>
              </div>

              <div className="dashboard-card-body" style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Name:</strong> {user.name || "-"}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Phone:</strong> {user.phone || "-"}
                </div>

                <Link href="/account/profile" className="btn-secondary" style={{ marginTop: 8 }}>
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-title">Quick Actions</div>
              </div>

              <div className="dashboard-card-body" style={{ display: "grid", gap: 10 }}>
                <Link href="/account/orders" className="btn-secondary">
                  View Orders
                </Link>
                <Link href="/account/addresses" className="btn-secondary">
                  Manage Addresses
                </Link>
                <Link href="/account/wishlist" className="btn-secondary">
                  View Wishlist
                </Link>
                <Link href="/shop" className="btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Recent Orders</div>
              <Link href="/account/orders" className="lux-link-arrow">
                View all →
              </Link>
            </div>

            <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
              {user.orders.length === 0 ? (
                <div className="text-muted">No orders found yet.</div>
              ) : (
                user.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="surface-card"
                    style={{
                      padding: 16,
                      display: "grid",
                      gap: 8,
                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong>{order.orderNumber}</strong>
                      <span className="status-pill status-confirmed">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Items: {order.items.length} · Total:{" "}
                      <span style={{ color: "var(--accent)", fontWeight: 900 }}>
                        {money(Number(order.total))}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-card" style={{ padding: 18 }}>
      <div className="text-muted" style={{ fontSize: 12, textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        className="heading-font"
        style={{
          marginTop: 8,
          fontSize: 30,
          fontWeight: 900,
          color: "var(--accent)",
        }}
      >
        {value}
      </div>
    </div>
  );
}