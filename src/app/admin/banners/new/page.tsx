import { BannerForm } from "../../../../components/admin/banner-form";

export default function NewBannerPage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 className="admin-page-title">Create Hero Banner</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Upload desktop and mobile banner images for the homepage slider.
        </p>
      </div>

      <BannerForm />
    </div>
  );
}