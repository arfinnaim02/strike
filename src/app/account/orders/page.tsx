import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { db } from "../../../lib/db";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/account" className="text-muted">
          ← Back to Account
        </Link>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="lux-eyebrow">Orders</div>
          <h1 className="section-title">My Orders</h1>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {orders.length === 0 ? (
            <div className="dashboard-card">
              <div className="dashboard-card-body">
                No orders found.
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="dashboard-card"
                style={{
                  padding: 18,
                  display: "grid",
                  gap: 10,
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

                <div className="text-muted">
                  {order.items.length} items
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>

                  <strong style={{ color: "var(--accent)" }}>
                    {money(Number(order.total))}
                  </strong>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}