import { redirect } from "next/navigation";
import { getCurrentSuperAdmin } from "../../../../lib/admin-auth";

export default async function NewStaffPage() {
  const superAdmin = await getCurrentSuperAdmin();

  if (!superAdmin) {
    redirect("/admin/dashboard");
  }

  return (
    <main>
      <div className="dashboard-card" style={{ maxWidth: 720 }}>
        <div className="dashboard-card-header">
          <div>
            <div className="dashboard-card-title">Add New Staff</div>
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              Only Super Admin can create staff accounts.
            </p>
          </div>
        </div>

        <form
          action="/api/admin/staff"
          method="POST"
          style={{ display: "grid", gap: 16 }}
        >
          <div>
            <label>Name</label>
            <input name="name" required className="admin-input" />
          </div>

          <div>
            <label>Email</label>
            <input name="email" type="email" required className="admin-input" />
          </div>

          <div>
            <label>Phone</label>
            <input name="phone" className="admin-input" />
          </div>

          <div>
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="admin-input"
            />
          </div>

          <div>
            <label>Role</label>
            <select name="role" required className="admin-input">
              <option value="ADMIN">ADMIN</option>
              <option value="ORDER_MANAGER">ORDER_MANAGER</option>
              <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
              <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
              <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</option>
            </select>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary">
            Create Staff
          </button>
        </form>
      </div>
    </main>
  );
}