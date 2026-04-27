"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

type BannerFormProps = {
  initialData?: {
    id: string;
    title: string | null;
    subtitle: string | null;
    image: string;
    mobileImage: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  } | null;
};

type UploadResultInfo = {
  secure_url?: string;
  public_id?: string;
};

export function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    subtitle: initialData?.subtitle ?? "",
    image: initialData?.image ?? "",
    mobileImage: initialData?.mobileImage ?? "",
    ctaText: initialData?.ctaText ?? "",
    ctaUrl: initialData?.ctaUrl ?? "",
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
    startsAt: initialData?.startsAt
      ? new Date(initialData.startsAt).toISOString().slice(0, 16)
      : "",
    endsAt: initialData?.endsAt
      ? new Date(initialData.endsAt).toISOString().slice(0, 16)
      : "",
  });

  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.image) {
      alert("Desktop image is required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        isEdit ? `/api/admin/banners/${initialData?.id}` : "/api/admin/banners",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            subtitle: form.subtitle,
            image: form.image,
            mobileImage: form.mobileImage || null,
            ctaText: form.ctaText,
            ctaUrl: form.ctaUrl,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
            startsAt: form.startsAt || null,
            endsAt: form.endsAt || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save banner");
      }

      router.push("/admin/banners");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save banner.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData?.id) return;

    const confirmed = window.confirm("Delete this banner?");
    if (!confirmed) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/banners/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }

      router.push("/admin/banners");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete banner.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderPreview(url: string, label: string) {
    if (!url) {
      return (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 16,
            padding: 16,
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          No {label.toLowerCase()} uploaded yet.
        </div>
      );
    }

    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--card-2)",
        }}
      >
        <img
          src={url}
          alt={label}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dashboard-card"
      style={{ overflow: "hidden" }}
    >
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">
          {isEdit ? "Edit Hero Banner" : "Create Hero Banner"}
        </div>
      </div>

      <div className="dashboard-card-body" style={{ display: "grid", gap: 24 }}>
        <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                Internal Title
            </label>
            <textarea
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`BUILT FOR\nTHE BIG STAGE`}
                rows={3}
                style={{
                width: "100%",
                minHeight: 96,
                padding: "14px",
                resize: "vertical",
                lineHeight: 1.5,
                }}
            />
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                Use a line break for 2-line hero titles. Example:
                <br />
                BUILT FOR
                <br />
                THE BIG STAGE
            </div>
           

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Subtitle
            </label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Optional admin note or campaign subtitle"
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>Desktop Banner</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Recommended: 1920 × 900 WEBP
            </div>

            {renderPreview(form.image, "Desktop Banner")}

            <CldUploadWidget
              signatureEndpoint="/api/cloudinary/sign"
              options={{
                resourceType: "image",
                folder: "STRIKE/banners/desktop",
                sources: ["local", "url", "camera"],
                multiple: false,
                maxFiles: 1,
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
              }}
              onSuccess={(result) => {
                const info = result?.info as UploadResultInfo | undefined;
                if (info?.secure_url) {
                  setForm((prev) => ({
                    ...prev,
                    image: info.secure_url || prev.image,
                  }));
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => open()}
                >
                  Upload Desktop Banner
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>Mobile Banner</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Recommended: 1080 × 1350 WEBP
            </div>

            {renderPreview(form.mobileImage, "Mobile Banner")}

            <CldUploadWidget
              signatureEndpoint="/api/cloudinary/sign"
              options={{
                resourceType: "image",
                folder: "STRIKE/banners/mobile",
                sources: ["local", "url", "camera"],
                multiple: false,
                maxFiles: 1,
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
              }}
              onSuccess={(result) => {
                const info = result?.info as UploadResultInfo | undefined;
                if (info?.secure_url) {
                  setForm((prev) => ({
                    ...prev,
                    mobileImage: info.secure_url || prev.mobileImage,
                  }));
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => open()}
                >
                  Upload Mobile Banner
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              CTA Text
            </label>
            <input
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              placeholder="Shop World Cup"
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              CTA URL
            </label>
            <input
              value={form.ctaUrl}
              onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
              placeholder="/collections/world-cup-2026"
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Sort Order
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Starts At
            </label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
              Ends At
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              style={{ width: "100%", minHeight: 44, padding: "0 14px" }}
            />
          </div>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
          }}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active Banner
        </label>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Update Banner" : "Create Banner"}
          </button>

          {isEdit ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDelete}
              disabled={isSaving}
              style={{
                borderColor: "rgba(255, 77, 79, 0.25)",
                color: "var(--danger)",
              }}
            >
              Delete Banner
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}