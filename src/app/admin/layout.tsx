import { AdminSidebar } from "../../components/layout/admin-sidebar";
import { AdminTopbar } from "../../components/layout/admin-topbar";
import { getAdminSidebarCounts } from "../../lib/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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