"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ORDER_MANAGER",
  "INVENTORY_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER_SUPPORT",
];

export function LoginForm({
  callbackUrl = "/account",
}: {
  callbackUrl?: string;
}) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const role = session?.user?.role;
    const isAdmin = ADMIN_ROLES.includes(role);

    if (callbackUrl && callbackUrl !== "/account") {
      router.push(callbackUrl);
    } else if (isAdmin) {
      router.push("/admin/dashboard");
    } else {
      router.push("/account");
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label>Email</label>
        <input name="email" type="email" placeholder="you@email.com" required />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Password</label>
        <input name="password" type="password" required />
      </div>

      {error ? (
        <div
          style={{
            color: "var(--danger)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}