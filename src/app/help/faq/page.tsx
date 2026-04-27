import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function FAQPage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Help</div>
          <h1 className="section-title">FAQ</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Common questions about Strike Sports orders, delivery, size,
            exchange, payment, and product editions.
          </p>
        </div>

        <section
          className="dashboard-card"
          style={{
            maxWidth: 980,
            padding: 22,
            display: "grid",
            gap: 22,
          }}
        >
          <FAQItem
            question="1. How can I place an order?"
            answer="Choose your product, select edition and size, add it to cart, then complete checkout with your name, phone number, delivery address, and payment method."
          />

          <FAQItem
            question="2. What is the difference between Fan Edition and Player Edition?"
            answer="Fan Edition is regular fit and more comfortable for daily wear. Player Edition is slim fit, lightweight, and closer to the professional match-style jersey."
          />

          <FAQItem
            question="3. How long does delivery take?"
            answer="Inside Dhaka usually takes 1–3 working days. Outside Dhaka usually takes 2–5 working days. Remote areas may take extra time."
          />

          <FAQItem
            question="4. What are the delivery charges?"
            answer="Inside Dhaka delivery charge is ৳70. Outside Dhaka delivery charge is ৳130. Charges may vary depending on courier policy, product size, or location."
          />

          <FAQItem
            question="5. Can I open the parcel before accepting delivery?"
            answer="Yes. Customers are encouraged to inspect the package during delivery. For defective or wrong product claims, unboxing video/photo is required."
          />

          <FAQItem
            question="6. Can I exchange size?"
            answer="Yes. Size exchange is available within 3 working days after receiving the product, subject to stock availability and exchange policy conditions."
          />

          <FAQItem
            question="7. Can I return a product?"
            answer="Return is accepted for wrong item, defective product, damaged product, or wrong size delivered. Product must be unused, unwashed, and tags/packaging must remain intact."
          />

          <FAQItem
            question="8. Are discounted products returnable?"
            answer="Discounted sale items are generally non-returnable unless the product is defective or wrong item was delivered."
          />

          <FAQItem
            question="9. What payment methods are available?"
            answer="Cash on Delivery is available. Online payment methods such as bKash, Nagad, card, or bank transfer may be added depending on checkout availability."
          />

          <FAQItem
            question="10. Why may advance delivery charge be required?"
            answer="If a customer has low delivery success rate, repeated cancellations, or suspicious order history, Strike Sports may request advance delivery charge before dispatch."
          />

          <FAQItem
            question="11. How can I track my order?"
            answer="Use the Track Order page from the footer or header. Enter your order number and phone number to check order status."
          />

          <FAQItem
            question="12. How can I contact support?"
            answer="You can contact Strike Sports through the Contact Us page, WhatsApp support, or the listed support email."
          />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div
      style={{
        paddingBottom: 18,
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gap: 8,
      }}
    >
      <h2
        className="heading-font"
        style={{
          fontSize: 20,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {question}
      </h2>

      <p
        className="text-muted"
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          maxWidth: 860,
        }}
      >
        {answer}
      </p>
    </div>
  );
}