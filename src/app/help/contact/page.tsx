import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Support</div>
          <h1 className="section-title">Contact Us</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Need help with order confirmation, size selection, delivery, return,
            or exchange? Contact Strike Sports support.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: 20,
            alignItems: "start",
          }}
          className="contact-page-grid"
        >
          <div style={{ display: "grid", gap: 16 }}>
            <ContactCard
              title="Phone Support"
              value="01800-000000"
              text="Call us for order confirmation, delivery update, or urgent support."
              href="tel:01800000000"
              button="Call Now"
            />

            <ContactCard
              title="WhatsApp Support"
              value="Message us directly"
              text="Best for size help, product questions, and exchange support."
              href="https://wa.me/8801800000000"
              button="Open WhatsApp"
            />

            <ContactCard
              title="Email Support"
              value="support@strikesports.com.bd"
              text="Use email for detailed complaints, return claims, or payment issues."
              href="mailto:support@strikesports.com.bd"
              button="Send Email"
            />

            <ContactCard
              title="Location"
              value="Dhaka, Bangladesh"
              text="Online-first sportswear store serving customers across Bangladesh."
              href="/shop"
              button="Start Shopping"
            />
          </div>

          <div
            className="dashboard-card"
            style={{
              padding: 24,
              display: "grid",
              gap: 20,
            }}
          >
            <div>
              <h2
                className="heading-font"
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Send a Message
              </h2>

              <p
                className="text-muted"
                style={{ marginTop: 10, lineHeight: 1.7, fontSize: 14 }}
              >
                Fill out the form below. Our support team will contact you as
                soon as possible.
              </p>
            </div>

            <form
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label>Name</label>
                <input name="name" placeholder="Your full name" required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <label>Phone</label>
                  <input name="phone" placeholder="01XXXXXXXXX" required />
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <label>Email</label>
                  <input name="email" type="email" placeholder="you@email.com" />
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Support Type</label>
                <select name="type" defaultValue="order">
                  <option value="order">Order Support</option>
                  <option value="size">Size Help</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="return">Return / Exchange</option>
                  <option value="payment">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Order Number</label>
                <input name="orderNumber" placeholder="Optional: SS-2026XXXXXX" />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>Message</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Write your message..."
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Message
              </button>

              <p className="text-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Note: This form is frontend-only now. To store messages in admin
                support panel, connect it with an API route later.
              </p>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function ContactCard({
  title,
  value,
  text,
  href,
  button,
}: {
  title: string;
  value: string;
  text: string;
  href: string;
  button: string;
}) {
  return (
    <div
      className="dashboard-card"
      style={{
        padding: 20,
        display: "grid",
        gap: 12,
      }}
    >
      <div className="lux-eyebrow" style={{ marginBottom: 0 }}>
        {title}
      </div>

      <h2
        className="heading-font"
        style={{
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {value}
      </h2>

      <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
        {text}
      </p>

      <Link href={href} className="btn-secondary" style={{ justifySelf: "start" }}>
        {button}
      </Link>
    </div>
  );
}