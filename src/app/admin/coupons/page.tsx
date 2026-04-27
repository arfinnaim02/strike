import { getAdminCoupons } from "../../../lib/coupons";
import { CouponsTable } from "../../../components/admin/coupons-table";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    status?: string;
    type?: string;
  }>;
};

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params?.search ?? "";
  const status = params?.status ?? "";
  const type = params?.type ?? "";
  const page = Number(params?.page ?? 1);

  const data = await getAdminCoupons({
    search,
    status,
    type,
    page,
    pageSize: 20,
  });

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="section-title">Coupons</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Search, filter, and manage discount codes.
          </p>
        </div>

        <a href="/admin/coupons/new" className="btn-primary">
          + Add Coupon
        </a>
      </div>

      <CouponsTable
        coupons={data.coupons}
        pagination={data.pagination}
        search={data.filters.search}
        status={data.filters.status}
        type={data.filters.type}
      />
    </main>
  );
}