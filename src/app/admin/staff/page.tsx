import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { getCurrentSuperAdmin } from "../../../lib/admin-auth";

export default async function StaffPage() {
  const superAdmin = await getCurrentSuperAdmin();

  if (!superAdmin) {
    redirect("/admin/dashboard");
  }

  const staff = await db.user.findMany({
    where: {
      role: {
        in: [
          "SUPER_ADMIN",
          "ADMIN",
          "ORDER_MANAGER",
          "INVENTORY_MANAGER",
          "CONTENT_MANAGER",
          "CUSTOMER_SUPPORT",
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <main>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <div className="dashboard-card-title">Staff Management</div>
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              Manage admin and staff access.
            </p>
          </div>

          <Link href="/admin/staff/new" className="admin-btn admin-btn-primary">
            Add Staff
          </Link>
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "—"}</td>
                <td>{user.email}</td>
                <td>{user.phone || "—"}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? "Active" : "Disabled"}</td>
                <td>{user.createdAt.toLocaleDateString("en-BD")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}