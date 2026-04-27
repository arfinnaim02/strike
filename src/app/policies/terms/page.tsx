import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Policy</div>

          <h1 className="section-title">Terms & Conditions</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Welcome to Strike Sports. By using our website and placing an
            order, you agree to the following terms and conditions.
          </p>
        </div>

        <section
          className="dashboard-card"
          style={{
            maxWidth: 980,
            padding: 22,
            display: "grid",
            gap: 28,
          }}
        >
          <PolicyBlock title="1. Use Of Website">
            <p>• You must provide accurate order information.</p>
            <p>• Misuse, fraud, or fake orders may result in restriction.</p>
            <p>• Website content may not be copied without permission.</p>
          </PolicyBlock>

          <PolicyBlock title="2. Orders & Confirmation">
            <p>• All orders are subject to confirmation.</p>
            <p>• Strike Sports may cancel suspicious or unavailable orders.</p>
            <p>• We may contact you for verification before dispatch.</p>
          </PolicyBlock>

          <PolicyBlock title="3. Pricing & Availability">
            <p>• Product prices may change without prior notice.</p>
            <p>• Offers and discounts are time-limited unless stated.</p>
            <p>• Stock availability may vary in real time.</p>
          </PolicyBlock>

          <PolicyBlock title="4. Delivery Terms">
            <p>• Delivery timelines are estimated, not guaranteed.</p>
            <p>• Delays may happen due to courier or remote area issues.</p>
            <p>• Customers must provide correct address and phone number.</p>
          </PolicyBlock>

          <PolicyBlock title="5. Returns & Exchanges">
            <p>• Returns and exchanges follow our published store policies.</p>
            <p>• Claims may require unboxing video or proof.</p>
          </PolicyBlock>

          <PolicyBlock title="6. Privacy & Data Use">
            <p>We collect limited customer data such as:</p>
            <p>• Name, mobile number, address, email</p>
            <p>• Order details and delivery instructions</p>
            <p>• Technical and browsing information</p>
            <p>Data is used only for operations, support, and service improvement.</p>
          </PolicyBlock>

          <PolicyBlock title="7. Third Party Sharing">
            <p>Necessary data may be shared with:</p>
            <p>• Courier partners</p>
            <p>• Payment gateways</p>
            <p>• Verification or support teams</p>
            <p><strong>We do not sell customer data.</strong></p>
          </PolicyBlock>

          <PolicyBlock title="8. Security">
            <p>• Encrypted transmission where applicable</p>
            <p>• Restricted internal access</p>
            <p>• Reasonable protection measures for customer data</p>
          </PolicyBlock>

          <PolicyBlock title="9. Changes To Terms">
            <p>
              Strike Sports may update these terms anytime without prior notice.
              Updated terms become effective once published.
            </p>
          </PolicyBlock>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function PolicyBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h2
        className="heading-font"
        style={{
          fontSize: 20,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>

      <div
        className="text-muted"
        style={{
          display: "grid",
          gap: 8,
          fontSize: 15,
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </div>
  );
}