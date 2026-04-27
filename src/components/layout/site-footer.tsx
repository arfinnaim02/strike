import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/" className="site-logo">
              STRIKE<span>⚡</span>
            </Link>

            <p className="site-footer-text">
              Bangladesh&apos;s premium destination for authentic sportswear,
              jerseys, and football accessories.
            </p>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              ["World Cup 2026", "/collections/world-cup-2026"],
              ["Club Jerseys", "/collections/club-jerseys"],
              ["New Arrivals", "/collections/new-arrivals"],
              ["Hot Deals", "/collections/hot-deals"],
            ]}
          />

          <FooterColumn
            title="Help"
            links={[
              ["Track Order", "/track-order"],
              ["Size Guide", "/help/size-guide"],
              ["FAQ", "/help/faq"],
              ["Contact Us", "/help/contact"],
            ]}
          />

          <FooterColumn
            title="Policies"
            links={[
              ["Shipping Policy", "/policies/shipping"],
              ["Return Policy", "/policies/returns"],
              ["Exchange Policy", "/policies/exchange"],
              ["Privacy Policy", "/policies/privacy"],
              ["Terms & Conditions", "/policies/terms"],
            ]}
          />

          <FooterColumn
            title="Contact"
            links={[
              ["📞 01800-000000", "/help/contact"],
              ["💬 WhatsApp Support", "/help/contact"],
              ["📧 support@strikesports.com.bd", "/help/contact"],
              ["Dhaka, Bangladesh", "/help/contact"],
            ]}
          />
        </div>

        <div className="site-footer-bottom">
          <p>© 2026 Strike Sports. All rights reserved.</p>

          <div className="site-footer-payments">
            {["bKash", "Nagad", "VISA", "MasterCard", "COD"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="site-footer-column">
      <h4>{title}</h4>

      <div className="site-footer-links">
        {links.map(([label, href]) => (
          <Link key={label} href={href}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}