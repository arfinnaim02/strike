import { notFound } from "next/navigation";
import { BannerForm } from "../../../../components/admin/banner-form";
import { getHeroBannerById } from "../../../../lib/banners";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await getHeroBannerById(id);

  if (!banner) {
    notFound();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 className="admin-page-title">Edit Hero Banner</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Update desktop and mobile images, schedule, and sort order.
        </p>
      </div>

      <BannerForm initialData={banner} />
    </div>
  );
}