import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function SizeGuidePage() {
  return (
    <>
      <SiteHeader />

      <main className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Link href="/" className="text-muted">
          ← Back to Home
        </Link>

        <div style={{ marginTop: 32, marginBottom: 34 }}>
          <div className="lux-eyebrow">Help</div>

          <h1 className="section-title">Size Guide</h1>

          <p
            className="text-muted"
            style={{
              marginTop: 16,
              maxWidth: 820,
              lineHeight: 1.8,
              fontSize: 16,
            }}
          >
            Fan Edition and Player Edition jerseys have different fittings. Fan
            Edition is more relaxed, while Player Edition is slimmer and more
            athletic. Check both charts before ordering.
          </p>
        </div>

        <section
          className="dashboard-card"
          style={{
            maxWidth: 1040,
            padding: 22,
            display: "grid",
            gap: 32,
          }}
        >
          <PolicyBlock title="1. Fan Edition Size Chart">
            <p>
              Fan Edition jerseys are regular fit and suitable for daily wear.
            </p>

            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                    <th>Weight Guide</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>S</td>
                    <td>36-38&quot;</td>
                    <td>26-27&quot;</td>
                    <td>45-55 kg</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>38-40&quot;</td>
                    <td>27-28&quot;</td>
                    <td>55-65 kg</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>40-42&quot;</td>
                    <td>28-29&quot;</td>
                    <td>65-75 kg</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>42-44&quot;</td>
                    <td>29-30&quot;</td>
                    <td>75-85 kg</td>
                  </tr>
                  <tr>
                    <td>XXL</td>
                    <td>44-46&quot;</td>
                    <td>30-31&quot;</td>
                    <td>85-95 kg</td>
                  </tr>
                  <tr>
                    <td>3XL</td>
                    <td>46-48&quot;</td>
                    <td>31-32&quot;</td>
                    <td>95-105 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PolicyBlock>

          <PolicyBlock title="2. Player Edition Size Chart">
            <p>
              Player Edition jerseys are slim fit. For a comfortable fit, many
              customers prefer one size larger.
            </p>

            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                    <th>Weight Guide</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>S</td>
                    <td>34-36&quot;</td>
                    <td>25-26&quot;</td>
                    <td>45-52 kg</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>36-38&quot;</td>
                    <td>26-27&quot;</td>
                    <td>52-60 kg</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>38-40&quot;</td>
                    <td>27-28&quot;</td>
                    <td>60-68 kg</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>40-42&quot;</td>
                    <td>28-29&quot;</td>
                    <td>68-78 kg</td>
                  </tr>
                  <tr>
                    <td>XXL</td>
                    <td>42-44&quot;</td>
                    <td>29-30&quot;</td>
                    <td>78-88 kg</td>
                  </tr>
                  <tr>
                    <td>3XL</td>
                    <td>44-46&quot;</td>
                    <td>30-31&quot;</td>
                    <td>88-98 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PolicyBlock>

          <PolicyBlock title="3. Fit Recommendation">
            <p>• Fan Edition: Regular fit, comfortable for everyday use.</p>
            <p>• Player Edition: Slim athletic fit, closer to body shape.</p>
            <p>• Want loose fit in Player Edition? Choose one size bigger.</p>
          </PolicyBlock>

          <PolicyBlock title="4. How To Measure">
            <p>• Chest: Measure around the widest chest area.</p>
            <p>• Length: Measure from shoulder top to bottom hem.</p>
            <p>• Compare with your current best-fitting jersey.</p>
          </PolicyBlock>

          <PolicyBlock title="5. Size Exchange Support">
            <p>
              If the ordered size does not fit, exchange is available subject to
              stock availability and exchange policy terms.
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