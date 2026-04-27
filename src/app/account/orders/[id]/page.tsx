import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { db } from "../../../../lib/db";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export default async function SingleOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }

  const { id } = await params;

  const order = await db.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/account/orders" className="text-muted">
          ← Back to Orders
        </Link>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="lux-eyebrow">Order Detail</div>
          <h1 className="section-title">{order.orderNumber}</h1>
        </div>

        <div
          className="account-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr .8fr",
            gap: 20,
          }}
        >
          <section className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">Items</div>
            </div>

            <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                    paddingBottom: 14,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 82,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "var(--card-2)",
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <strong>{item.productName}</strong>

                    <div className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>
                      {item.variantInfo || "No variant"}
                    </div>

                    <div className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>
                      Qty: {item.qty} × {money(Number(item.unitPrice))}
                    </div>
                  </div>

                  <strong style={{ color: "var(--accent)" }}>
                    {money(Number(item.totalPrice))}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 20 }}>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-title">Summary</div>
              </div>

              <div className="dashboard-card-body" style={{ display: "grid", gap: 10 }}>
                <div><strong>Status:</strong> {order.status}</div>
                <div><strong>Payment:</strong> {order.paymentMethod}</div>
                <div><strong>Payment Status:</strong> {order.paymentStatus}</div>
                <div><strong>Subtotal:</strong> {money(Number(order.subtotal))}</div>
                <div><strong>Discount:</strong> {money(Number(order.discountAmount))}</div>
                <div><strong>Delivery:</strong> {money(Number(order.deliveryCharge))}</div>
                <div style={{ color: "var(--accent)", fontWeight: 900 }}>
                  Total: {money(Number(order.total))}
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-title">Shipping</div>
              </div>

              <div className="dashboard-card-body" style={{ display: "grid", gap: 8 }}>
                <div>{order.shippingName}</div>
                <div>{order.shippingPhone}</div>
                <div>{order.shippingAddress}</div>
                <div>
                  {order.shippingCity}, {order.shippingDistrict}
                </div>
                <div>{order.shippingDivision}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}