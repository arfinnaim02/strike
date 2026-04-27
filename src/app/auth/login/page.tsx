import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { LoginForm } from "../../../components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />

      <main className="auth-shell">
        <section className="container auth-grid">
          <div className="auth-copy">
            <div className="lux-eyebrow">Customer Login</div>
            <h1 className="auth-title">Access your Strike account</h1>
            <p className="auth-text">
              Login to view your order history, saved details, wishlist, and
              checkout faster next time.
            </p>

            <div className="auth-benefits">
              <span>✓ Track orders</span>
              <span>✓ Save profile</span>
              <span>✓ Manage wishlist</span>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-head">
              <h2>Login</h2>
              <p>Enter your email and password to continue.</p>
            </div>

            {params.registered === "1" ? (
              <div className="auth-success">Account created. Login now.</div>
            ) : null}

            <LoginForm callbackUrl={params.callbackUrl || "/account"} />

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register">Create account</Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}