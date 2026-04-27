export default function CheckoutFailedPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <h1 className="section-title">Checkout Failed</h1>
          <p className="text-muted" style={{ marginTop: 12 }}>
            Something went wrong while placing your order.
          </p>

          <div style={{ marginTop: 20 }}>
            <a href="/checkout" className="btn-primary">
              Try Again
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}