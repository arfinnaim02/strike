"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}