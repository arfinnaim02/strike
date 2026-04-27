import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Policy</div>
          <h1 className="section-title">Privacy Policy</h1>

          <p className="text-muted" style={{ marginTop: 16, maxWidth: 820, lineHeight: 1.8, fontSize: 16 }}>
            At Strike Sports, your privacy is our top priority. This policy explains
            how we collect, use, store, and protect your personal information.
          </p>
        </div>

        <section className="dashboard-card" style={{ maxWidth: 980, padding: 22, display: "grid", gap: 28 }}>
          <PolicyBlock title="1. Information We Collect">
            <p>• Personal details: name, mobile number, delivery address, email</p>
            <p>• Order information: product details, payment preference, delivery instructions</p>
            <p>• Technical data: device type, browser type, IP address, city/area</p>
            <p>• Behavioral data: pages viewed, products added to cart, wishlist items</p>
          </PolicyBlock>

          <PolicyBlock title="2. How We Use Your Information">
            <p>• Processing and delivering your order</p>
            <p>• Contacting you for order confirmation</p>
            <p>• Keeping you updated about delivery status</p>
            <p>• Improving customer experience</p>
            <p>• Personalizing product recommendations</p>
            <p>• Handling complaints, returns, and customer service</p>
          </PolicyBlock>

          <PolicyBlock title="3. Who We Share Your Information With">
            <p>We share only necessary information with:</p>
            <p>• Delivery/courier companies for order delivery</p>
            <p>• Payment partners for online transactions</p>
            <p>• Customer verification team</p>
            <p><strong>We never sell or rent your information to third parties.</strong></p>
          </PolicyBlock>

          <PolicyBlock title="4. Data Security">
            <p>• Encrypted data transmission</p>
            <p>• Secure servers and firewalls</p>
            <p>• Restricted admin access</p>
            <p>• Immediate removal of unauthorized data requests</p>
          </PolicyBlock>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h2 className="heading-font" style={{ fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>
        {title}
      </h2>

      <div className="text-muted" style={{ display: "grid", gap: 8, fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}