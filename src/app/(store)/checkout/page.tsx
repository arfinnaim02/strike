"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../../components/cart/cart-provider";

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

type Zone = "INSIDE_DHAKA" | "OUTSIDE_DHAKA";

type CouponState =
  | { applied: false; message: string | null }
  | {
      applied: true;
      code: string;
      description: string | null;
      discountAmount: number;
      finalTotal: number;
      freeDelivery: boolean;
    };

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  const [zone, setZone] = useState<Zone>("INSIDE_DHAKA");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponState, setCouponState] = useState<CouponState>({
    applied: false,
    message: null,
  });

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [checkoutProfile, setCheckoutProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    async function loadCheckoutProfile() {
      try {
        const response = await fetch("/api/account/checkout-profile");
        const data = await response.json();

        if (data.loggedIn && data.profile) {
          setCheckoutProfile({
            name: data.profile.name || "",
            phone: data.profile.phone || "",
            email: data.profile.email || "",
            address: data.profile.address || "",
          });
        }
      } catch (error) {
        console.error("Failed to load checkout profile:", error);
      } finally {
        setProfileLoaded(true);
      }
    }

    loadCheckoutProfile();
  }, []);

  const deliveryCharge = zone === "INSIDE_DHAKA" ? 80 : 150;

  const finalSummary = useMemo(() => {
    if (couponState.applied) {
      return {
        discountAmount: couponState.discountAmount,
        total: couponState.finalTotal,
      };
    }

    return {
      discountAmount: 0,
      total: subtotal + deliveryCharge,
    };
  }, [couponState, subtotal, deliveryCharge]);

  async function applyCoupon() {
    const code = couponCode.trim();

    if (!code) {
      setCouponState({ applied: false, message: "Enter coupon code first" });
      return;
    }

    try {
      setCouponLoading(true);

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal, deliveryCharge }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setCouponState({
          applied: false,
          message: result.message || "Invalid coupon",
        });
        return;
      }

      setCouponState({
        applied: true,
        code: result.code,
        description: result.description ?? null,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        freeDelivery: result.freeDelivery,
      });
    } catch (error) {
      console.error(error);
      setCouponState({ applied: false, message: "Failed to validate coupon" });
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setCouponState({ applied: false, message: null });
  }

  if (items.length === 0) {
    return (
      <main className="container" style={{ paddingTop: 50, paddingBottom: 60 }}>
        <h1 className="section-title">Checkout</h1>
        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <div className="dashboard-card-body">Your cart is empty.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 42, paddingBottom: 70 }}>
      <div style={{ maxWidth: 760 }}>
        <div className="lux-eyebrow">Secure Checkout</div>
        <h1 className="section-title">Complete Your Order</h1>

        <p className="text-muted" style={{ marginTop: 12, lineHeight: 1.8 }}>
          Fast confirmation, trusted delivery, premium support.
        </p>

        {profileLoaded && checkoutProfile.phone ? (
          <p style={{ marginTop: 10, color: "var(--accent)", fontWeight: 800 }}>
            Saved account details loaded automatically.
          </p>
        ) : null}
      </div>

      <div
        className="checkout-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 420px",
          gap: 24,
          marginTop: 28,
        }}
      >
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Shipping Information</div>
          </div>

          <div className="dashboard-card-body">
            <form action="/api/checkout" method="POST" style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>Full Name</label>
                <input name="shippingName" defaultValue={checkoutProfile.name} required />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Phone Number</label>
                <input name="shippingPhone" defaultValue={checkoutProfile.phone} required />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Email (optional)</label>
                <input name="guestEmail" type="email" defaultValue={checkoutProfile.email} />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Full Address</label>
                <textarea
                  name="shippingAddress"
                  rows={4}
                  defaultValue={checkoutProfile.address}
                  placeholder="House / Road / Area / Landmark"
                  required
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Delivery Area</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as Zone)}
                  name="shippingZone"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka — ৳80</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka — ৳150</option>
                </select>
              </div>

              <input type="hidden" name="shippingCity" value={zone === "INSIDE_DHAKA" ? "Dhaka" : "Outside Dhaka"} />
              <input type="hidden" name="shippingDistrict" value={zone === "INSIDE_DHAKA" ? "Dhaka" : "Outside Dhaka"} />
              <input type="hidden" name="shippingDivision" value={zone === "INSIDE_DHAKA" ? "Dhaka" : "Outside Dhaka"} />

              <div className="surface-card" style={{ padding: 16, borderRadius: 16, display: "grid", gap: 12 }}>
                <div style={{ fontWeight: 800 }}>Coupon Code</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon"
                    style={{ flex: "1 1 220px" }}
                  />

                  {!couponState.applied ? (
                    <button type="button" className="btn-secondary" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  ) : (
                    <button type="button" className="btn-secondary" onClick={removeCoupon}>
                      Remove
                    </button>
                  )}
                </div>

                {couponState.applied ? (
                  <div style={{ color: "var(--success)", fontWeight: 700, fontSize: 13 }}>
                    Coupon Applied: {couponState.code}
                  </div>
                ) : couponState.message ? (
                  <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13 }}>
                    {couponState.message}
                  </div>
                ) : null}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Order Note (optional)</label>
                <textarea name="customerNote" rows={3} placeholder="Any request..." />
              </div>

              <input type="hidden" name="cart" value={JSON.stringify(items)} />
              <input type="hidden" name="subtotal" value={String(subtotal)} />
              <input type="hidden" name="deliveryCharge" value={String(deliveryCharge)} />
              <input type="hidden" name="total" value={String(finalSummary.total)} />
              <input type="hidden" name="couponCode" value={couponState.applied ? couponState.code : ""} />

              <button type="submit" className="btn-primary">
                Place Order Now
              </button>
            </form>
          </div>
        </section>

        <aside className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Order Summary</div>
          </div>

          <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
            {items.map((item) => (
              <div
                key={item.variantId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>
                    {item.qty} × {money(item.price)}
                  </div>
                </div>

                <strong>{money(item.qty * item.price)}</strong>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery</span>
              <strong>{money(deliveryCharge)}</strong>
            </div>

            {couponState.applied ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Discount</span>
                <strong style={{ color: "var(--success)" }}>
                  -{money(couponState.discountAmount)}
                </strong>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 20,
                fontWeight: 900,
                color: "var(--accent)",
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
              }}
            >
              <span>Total</span>
              <span>{money(finalSummary.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}