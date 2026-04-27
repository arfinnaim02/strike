import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { db } from "../../../lib/db";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default async function AccountProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/profile");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          label: true,
          fullName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          district: true,
          division: true,
          postalCode: true,
          isDefault: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const defaultAddress = user.addresses[0] ?? null;

  return (
    <>
      <SiteHeader />

      <main className="auth-shell">
        <section className="container" style={{ position: "relative", zIndex: 1 }}>
          <Link href="/account" className="text-muted">
            ← Back to Account
          </Link>

          <div style={{ marginTop: 28, marginBottom: 28 }}>
            <div className="lux-eyebrow">Account Settings</div>
            <h1 className="section-title">Profile & Address</h1>
            <p
              className="text-muted"
              style={{ marginTop: 14, maxWidth: 760, lineHeight: 1.8 }}
            >
              Update your contact information and default delivery address from
              one place.
            </p>
          </div>

          <form
            action="/api/account/profile"
            method="POST"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: 22,
              alignItems: "start",
            }}
            className="account-main-grid"
          >
            <div style={{ display: "grid", gap: 22 }}>
              <div className="auth-card">
                <div className="auth-card-head">
                  <h2>Profile Info</h2>
                  <p>Your email is used for login and cannot be changed here.</p>
                </div>

                <div className="auth-form">
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input
                      name="name"
                      defaultValue={user.name ?? ""}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      defaultValue={user.phone ?? ""}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Email</label>
                    <input
                      value={user.email}
                      disabled
                      style={{ opacity: 0.7, cursor: "not-allowed" }}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-head">
                  <h2>Delivery Address</h2>
                  <p>This address will be used as your default checkout address.</p>
                </div>

                <input
                  type="hidden"
                  name="addressId"
                  value={defaultAddress?.id ?? ""}
                />

                <div className="auth-form">
                  <div className="auth-field">
                    <label>Address Label</label>
                    <input
                      name="label"
                      defaultValue={defaultAddress?.label ?? "Home"}
                      placeholder="Home / Office"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                    className="account-main-grid"
                  >
                    <div className="auth-field">
                      <label>Receiver Name</label>
                      <input
                        name="addressFullName"
                        defaultValue={defaultAddress?.fullName ?? user.name ?? ""}
                        placeholder="Receiver name"
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label>Receiver Phone</label>
                      <input
                        name="addressPhone"
                        defaultValue={defaultAddress?.phone ?? user.phone ?? ""}
                        placeholder="01XXXXXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Address Line 1</label>
                    <textarea
                      name="addressLine1"
                      rows={3}
                      defaultValue={defaultAddress?.addressLine1 ?? ""}
                      placeholder="House, road, area"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Address Line 2</label>
                    <input
                      name="addressLine2"
                      defaultValue={defaultAddress?.addressLine2 ?? ""}
                      placeholder="Apartment, landmark, optional"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                    className="account-main-grid"
                  >
                    <div className="auth-field">
                      <label>City</label>
                      <input
                        name="city"
                        defaultValue={defaultAddress?.city ?? "Dhaka"}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label>District</label>
                      <input
                        name="district"
                        defaultValue={defaultAddress?.district ?? "Dhaka"}
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                    className="account-main-grid"
                  >
                    <div className="auth-field">
                      <label>Division</label>
                      <input
                        name="division"
                        defaultValue={defaultAddress?.division ?? "Dhaka"}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label>Postal Code</label>
                      <input
                        name="postalCode"
                        defaultValue={defaultAddress?.postalCode ?? ""}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary auth-submit">
                    Save Profile & Address
                  </button>
                </div>
              </div>
            </div>

            <aside style={{ display: "grid", gap: 20 }}>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">Account Summary</div>
                </div>

                <div className="dashboard-card-body" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <strong>Name:</strong> {user.name || "-"}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {user.phone || "-"}
                  </div>
                  <div>
                    <strong>Member Since:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-BD")}
                  </div>

                  <Link
                    href="/account/orders"
                    className="btn-secondary"
                    style={{ marginTop: 10 }}
                  >
                    View My Orders
                  </Link>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">Saved Address</div>
                </div>

                <div className="dashboard-card-body" style={{ display: "grid", gap: 14 }}>
                  {user.addresses.length === 0 ? (
                    <div className="text-muted">No address saved yet.</div>
                  ) : (
                    user.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="surface-card"
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          display: "grid",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <strong>{address.label || "Address"}</strong>
                          {address.isDefault ? (
                            <span className="status-pill status-confirmed">
                              Default
                            </span>
                          ) : null}
                        </div>

                        <div className="text-muted" style={{ fontSize: 13 }}>
                          {address.fullName} · {address.phone}
                        </div>

                        <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                          <br />
                          {address.city}, {address.district}, {address.division}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </form>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}