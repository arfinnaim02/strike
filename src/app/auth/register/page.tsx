import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />

      <main className="auth-shell">
        <section className="container auth-grid">
          <div className="auth-copy">
            <div className="lux-eyebrow">Strike Account</div>
            <h1 className="auth-title">Create your customer account</h1>
            <p className="auth-text">
              Save your details, track orders faster, manage wishlist items, and
              get a smoother checkout experience.
            </p>

            <div className="auth-benefits">
              <span>✓ Faster checkout</span>
              <span>✓ Order history</span>
              <span>✓ Wishlist access</span>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-head">
              <h2>Create Account</h2>
              <p>Join Strike Sports in less than a minute.</p>
            </div>

            <form
              action="/api/auth/register"
              method="POST"
              className="auth-form"
            >
              <div className="auth-field">
                <label>Full Name</label>
                <input name="name" placeholder="Your full name" required />
              </div>

              <div className="auth-field">
                <label>Phone</label>
                <input name="phone" placeholder="01XXXXXXXXX" required />
              </div>

              <div className="auth-field">
                <label>Email</label>
                <input name="email" type="email" placeholder="you@email.com" required />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input name="password" type="password" minLength={6} required />
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>
                <input name="confirmPassword" type="password" minLength={6} required />
              </div>

              <button type="submit" className="btn-primary auth-submit">
                Create Account
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link href="/auth/login">Login</Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}