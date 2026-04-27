import { redirect } from "next/navigation";
import { AdminSidebar } from "../../components/layout/admin-sidebar";
import { AdminTopbar } from "../../components/layout/admin-topbar";
import { getAdminSidebarCounts } from "../../lib/admin-sidebar";
import { getCurrentAdmin } from "../../lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/auth/login?callbackUrl=/admin/dashboard");
  }

  const counts = await getAdminSidebarCounts();

  return (
    <div className="admin-shell">
      <AdminSidebar counts={counts} />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}