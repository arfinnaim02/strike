export default function NewCouponPage() {
  return (
    <main>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Add Coupon</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Create a new discount code for checkout
        </p>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <form
            action="/api/admin/coupons"
            method="POST"
            style={{
              display: "grid",
              gap: 16,
              maxWidth: 760,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label>Coupon Code</label>
              <input name="code" placeholder="EID10" required />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>Description</label>
              <input name="description" placeholder="10% off Eid campaign" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Discount Type</label>
                <select name="discountType" defaultValue="PERCENTAGE">
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                  <option value="FREE_DELIVERY">FREE_DELIVERY</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Discount Value</label>
                <input
                  name="discountValue"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Minimum Order Amount</label>
                <input name="minOrderAmount" type="number" step="0.01" />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Maximum Discount</label>
                <input name="maxDiscount" type="number" step="0.01" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Usage Limit</label>
                <input name="usageLimit" type="number" min="1" />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Per User Limit</label>
                <input name="perUserLimit" type="number" min="1" defaultValue="1" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Starts At</label>
                <input name="startsAt" type="datetime-local" />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Expires At</label>
                <input name="expiresAt" type="datetime-local" />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" name="isActive" value="true" defaultChecked />
              Active
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn-primary">
                Save Coupon
              </button>

              <a href="/admin/coupons" className="btn-secondary">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}