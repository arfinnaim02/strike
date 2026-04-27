import { getHomepageData } from "../../lib/homepage";
import { StoreProductCard } from "../../components/store/store-product-card";
import { HomeReviewSlider } from "../../components/store/home-review-slider";
import { HomeHeroSection } from "../../components/store/home-hero-section";
import { ScrollReveal } from "../../components/store/scroll-reveal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COLLECTION_CARD_CONFIG = [
  {
    key: "world-cup",
    label: "World Cup",
    title: "Global Stage 2026",
    href: "/collections/world-cup-2026",
    image: "/home/collection-world-cup.png",
    isActive: true,
  },
  {
    key: "all-jerseys",
    label: "Storefront",
    title: "All Jerseys",
    href: "/shop",
    image: "/home/collection-all-jerseys.png",
    isActive: true,
  },
  {
    key: "hot-deals",
    label: "Campaign",
    title: "Hot Deals",
    href: "/collections/hot-deals",
    image: "/home/collection-hot-deals.png",
    isActive: true,
  },
  {
    key: "new-arrivals",
    label: "Latest Drop",
    title: "New Arrivals",
    href: "/collections/new-arrivals",
    image: "/home/collection-new-arrivals.png",
    isActive: true,
  },

  // future-ready examples
  {
    key: "club-jerseys",
    label: "Club Collection",
    title: "Club Jerseys",
    href: "/collections/club-jerseys",
    image: "/home/collection-club-jerseys.png",
    isActive: false,
  },
  {
    key: "retro",
    label: "Archive Drop",
    title: "Retro Classics",
    href: "/collections/retro-classics",
    image: "/home/collection-retro-classics.png",
    isActive: false,
  },
  {
    key: "player-edition",
    label: "Elite Fit",
    title: "Player Edition",
    href: "/collections/player-edition",
    image: "/home/collection-player-edition.png",
    isActive: false,
  },
];

function buildCollectionCards() {
  return COLLECTION_CARD_CONFIG.filter((card) => card.isActive);
}

export default async function HomePage() {
  const homepage = await getHomepageData();

const heroBanners = homepage.heroBanners.map((banner) => ({
  id: banner.id,
  title: banner.title,
  subtitle: banner.subtitle,
  image: banner.image,
  mobileImage: banner.mobileImage,
  ctaText: banner.ctaText,
  ctaUrl: banner.ctaUrl,
}));

  const collectionCards = buildCollectionCards();

  return (
    <main className="lux-home">
      <HomeHeroSection banners={heroBanners} />
      <section className="lux-marquee-strip">
        <div className="lux-marquee-track">
          <span>Premium Matchday Jerseys</span>
          <span>Official Style Aesthetic</span>
          <span>Cash on Delivery Across Bangladesh</span>
          <span>World Cup 2026 Collection</span>
          <span>Fast Dispatch & Exchange Support</span>
          <span>Premium Matchday Jerseys</span>
          <span>Official Style Aesthetic</span>
          <span>Cash on Delivery Across Bangladesh</span>
        </div>
      </section>

      <ScrollReveal>
        <section className="lux-section">
          <div className="container">
            <div className="lux-section-head lux-section-head-tight">
              <div>
                <div className="lux-eyebrow">Collections</div>
                <h2 className="lux-section-title">
                  Elite drops, curated to win.
                </h2>
              </div>
            </div>

            <div className="lux-collection-grid lux-collection-grid-visual">
              {collectionCards.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  className="lux-collection-card lux-collection-card-photo"
                >
                  <div className="lux-collection-card-bg">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="lux-collection-fallback">STRIKE</div>
                    )}
                  </div>

                  <div className="lux-collection-photo-overlay" />

                  <div className="lux-collection-content lux-collection-content-photo">
                    <div className="lux-collection-kicker">{card.label}</div>
                    <div className="lux-collection-title">{card.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {homepage.newArrivals.length > 0 ? (
        <ScrollReveal>
          <section className="lux-section">
            <div className="container">
              <div className="lux-section-head">
                <div>
                  <div className="lux-eyebrow">New Season</div>
                  <h2 className="lux-section-title">
                    Fresh arrivals with premium presentation
                  </h2>
                  <p className="lux-section-text">
                    Recently added products, highlighted in a cleaner editorial-style storefront.
                  </p>
                </div>

                <a href="/collections/new-arrivals" className="lux-link-arrow">
                  See all arrivals →
                </a>
              </div>

              <div className="premium-product-grid">
                {homepage.newArrivals.slice(0, 4).map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      ) : null}

      <ScrollReveal>
        <section className="lux-section">
          <div className="container">
            <div className="lux-section-head lux-section-head-tight">
              <div>
                <div className="lux-eyebrow">What Customers Say</div>
                <h2 className="lux-section-title">
                  Why customers choose Strike Sports
                </h2>
              </div>
            </div>

            <HomeReviewSlider />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="lux-section lux-section-last">
          <div className="container">
            <div className="lux-newsletter-block">
              <div className="lux-newsletter-copy">
                <div className="lux-eyebrow">Stay Connected</div>
                <h2 className="lux-newsletter-title">
                  Get first access to premium drops and collection updates
                </h2>
                <p className="lux-newsletter-text">
                  Be first for World Cup releases, new jerseys, special offers, and
                  upcoming campaign launches.
                </p>
              </div>

              <form className="lux-newsletter-form">
                <input type="email" placeholder="Enter your email address" />
                <button type="button" className="btn-primary">
                  Join Now
                </button>
              </form>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}