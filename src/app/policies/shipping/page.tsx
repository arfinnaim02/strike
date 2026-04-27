import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function ShippingPolicyPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Policy</div>

          <h1 className="section-title">Shipping Policy</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            This Shipping Policy explains delivery time, delivery charges, parcel
            checking rules, failed delivery conditions, and advance delivery
            charge requirements for Strike Sports orders.
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
          <PolicyBlock title="1. Delivery Time">
            <p>Inside Dhaka City: <strong>1–3 working days</strong></p>
            <p>Outside Dhaka: <strong>2–5 working days</strong></p>
            <p>
              Delivery to remote or hard-to-reach areas may take extra time
              depending on courier schedules.
            </p>
          </PolicyBlock>

          <PolicyBlock title="2. Delivery Charges">
            <p>Inside Dhaka: <strong>৳70</strong></p>
            <p>Outside Dhaka: <strong>৳130</strong></p>
            <p>
              Delivery charges may vary based on product size, weight, and
              courier company policies.
            </p>
          </PolicyBlock>

          <PolicyBlock title="3. Delivery Process">
            <p>Orders are delivered through our trusted courier partner Steadfast.</p>
            <p>The delivery person will contact the customer before arriving.</p>
            <p>
              If the delivery team cannot reach the customer after multiple
              attempts, the parcel may be returned to the warehouse.
            </p>
          </PolicyBlock>

          <PolicyBlock title="4. Verification & Checking">
            <p>Customers should inspect the package during delivery.</p>
            <p>Customers are encouraged to open the package before accepting delivery.</p>
            <p>
              For defective or wrong products, an unboxing video is required for
              replacement or claim validation.
            </p>
          </PolicyBlock>

          <PolicyBlock title="5. Delivery Failure">
            <p>Delivery may fail if the address is incorrect or incomplete.</p>
            <p>Delivery may fail if the phone is switched off or unreachable.</p>
            <p>Delivery may fail if the customer is unavailable at the location.</p>
          </PolicyBlock>

          <PolicyBlock title="6. Advance Delivery Charge Policy">
            <p>
              Strike Sports reserves the right to request an advance delivery
              charge if a customer&apos;s previous delivery success rate is below
              <strong> 70%</strong>.
            </p>
            <p>
              This helps reduce fake, refused, or returned parcels and improves
              service efficiency.
            </p>
            <p>
              For repeat cancellation cases or suspicious order history, full
              advance payment may be required.
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