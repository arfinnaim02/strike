import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function ExchangePolicyPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Policy</div>

          <h1 className="section-title">Exchange Policy</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Strike Sports aims to ensure customer satisfaction. If you face any
            size issue, defect, or product concern, we offer a simple exchange
            policy under the conditions below.
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
          <PolicyBlock title="1. Exchange Time Limit">
            <p>
              Products can be exchanged within{" "}
              <strong>3 working days</strong> after receiving the order.
            </p>
          </PolicyBlock>

          <PolicyBlock title="2. Eligible Exchange Reasons">
            <p>• Size issue</p>
            <p>• Defective product</p>
            <p>• Damaged item received</p>
            <p>• Wrong product delivered</p>
          </PolicyBlock>

          <PolicyBlock title="3. Color / Design / Other Changes">
            <p>
              Requests for color, design, or other product changes may be
              accepted through mutual communication with our support team.
            </p>
            <p>
              Approval depends on stock availability and product condition.
            </p>
          </PolicyBlock>

          <PolicyBlock title="4. Conditions For Exchange">
            <p>• Product must be unused and unwashed</p>
            <p>• Original tags and packaging must remain intact</p>
            <p>• Unboxing video/photo may be required for claims</p>
          </PolicyBlock>

          <PolicyBlock title="5. Courier Charge">
            <p>
              • If exchange is due to our mistake or defect →
              <strong> Free Exchange Support</strong>
            </p>
            <p>
              • If exchange is requested for size/color preference →
              <strong> Customer may bear courier charge</strong>
            </p>
          </PolicyBlock>

          <PolicyBlock title="6. Final Approval">
            <p>
              Strike Sports reserves the right to approve or decline exchange
              requests after reviewing the claim and product condition.
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