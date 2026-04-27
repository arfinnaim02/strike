import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function ReturnPolicyPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Policy</div>

          <h1 className="section-title">Return Policy</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Strike Sports ensures quality products. If you face any issue with
            your order, we provide a fair and transparent return policy.
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
          <PolicyBlock title="1. Return Eligibility">
            <p>You can request a return if:</p>
            <p>• Wrong item was delivered</p>
            <p>• Defective or damaged product received</p>
            <p>• Wrong size delivered</p>
          </PolicyBlock>

          <PolicyBlock title="2. Conditions For Return">
            <p>• Must inform within <strong>3 days</strong> of receiving the product</p>
            <p>• Product must be unused and unwashed</p>
            <p>• All tags and packaging must remain intact</p>
            <p>• Unboxing video/photo is mandatory for claims</p>
          </PolicyBlock>

          <PolicyBlock title="3. Non-Returnable Items">
            <p>• Discounted sale items</p>
            <p>• Personalized or customized jerseys</p>
            <p>• Worn or washed products</p>
            <p>• Products damaged by customer misuse</p>
          </PolicyBlock>

          <PolicyBlock title="4. Exchange Policy">
            <p>• Size exchange allowed if stock is available</p>
            <p>• If unavailable, customer may choose another product</p>
            <p>• Any price difference must be adjusted</p>
          </PolicyBlock>

          <PolicyBlock title="5. Refund Policy">
            <p>Refunds are issued only when:</p>
            <p>• Replacement is not possible</p>
            <p>• Product is unavailable</p>
            <p>• Refund processing time: <strong>3–7 working days</strong></p>
          </PolicyBlock>

          <PolicyBlock title="6. Return Courier Charge">
            <p>
              • If product is defective or wrong item delivered →
              <strong> Free Return</strong>
            </p>
            <p>
              • If return is due to size issue or change of mind →
              <strong> Customer pays courier charge</strong>
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