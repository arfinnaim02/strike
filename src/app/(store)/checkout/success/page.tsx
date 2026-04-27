import { ClearCartOnLoad } from "../../../../components/cart/clear-cart-on-load";

type SuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <ClearCartOnLoad />

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <h1 className="section-title">Order Placed</h1>

          <p className="text-muted" style={{ marginTop: 12 }}>
            Your order has been created successfully.
          </p>

          <div style={{ marginTop: 18, fontSize: 18, fontWeight: 700 }}>
            Order Number: {params.order ?? "-"}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/shop" className="btn-secondary">
              Continue Shopping
            </a>

            <a
              href={
                params.order
                  ? `/track-order?orderNumber=${encodeURIComponent(params.order)}`
                  : "/track-order"
              }
              className="btn-primary"
            >
              Track Order
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}