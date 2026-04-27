import { auth } from "../auth";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ORDER_MANAGER",
  "INVENTORY_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER_SUPPORT",
];

export async function getCurrentAdmin() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    return null;
  }

  return session.user;
}

export async function getCurrentSuperAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }

  return session.user;
}