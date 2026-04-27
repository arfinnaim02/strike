"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

type ProductImage = {
  id: string;
  url: string;
  publicId: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
};

type ProductImageManagerProps = {
  productId: string;
  productName: string;
  folder: string;
  images: ProductImage[];
};

type UploadResultInfo = {
  secure_url?: string;
  public_id?: string;
};

export function ProductImageManager({
  productId,
  productName,
  folder,
  images,
}: ProductImageManagerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const defaultAltText = useMemo(() => `${productName} image`, [productName]);

  async function registerImage(info: UploadResultInfo) {
    if (!info?.secure_url) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}/images/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: info.secure_url,
          publicId: info.public_id || null,
          altText: defaultAltText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register uploaded image");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Image uploaded to Cloudinary, but failed to save in database.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title">Product Images</div>
      </div>

      <div className="dashboard-card-body" style={{ display: "grid", gap: 24 }}>
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 18,
            padding: 20,
            background: "var(--surface-2)",
            display: "grid",
            gap: 12,
            justifyItems: "start",
          }}
        >
          <div style={{ fontWeight: 700 }}>Upload product images</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            Drag & drop or open file picker. Images upload directly to Cloudinary.
          </div>

          <CldUploadWidget
            signatureEndpoint="/api/cloudinary/sign"
            options={{
              resourceType: "image",
              folder,
              sources: ["local", "url", "camera"],
              multiple: true,
              maxFiles: 8,
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
            }}
            onSuccess={(result) => {
              const info = result?.info as UploadResultInfo | undefined;
              if (info?.secure_url) {
                void registerImage(info);
              }
            }}
          >
            {({ open }) => {
              return (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => open()}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Upload Images"}
                </button>
              );
            }}
          </CldUploadWidget>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {images.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>
              No images added yet for this product.
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 16,
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: 16,
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.altText || productName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {image.isPrimary ? (
                      <span className="status-pill status-confirmed">Primary</span>
                    ) : (
                      <span className="status-pill">Gallery</span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      wordBreak: "break-all",
                    }}
                  >
                    {image.url}
                  </div>

                  <div style={{ fontSize: 13 }}>
                    <strong>Alt:</strong> {image.altText || "-"}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {!image.isPrimary ? (
                      <form
                        action={`/api/admin/products/${productId}/images/${image.id}/primary`}
                        method="POST"
                      >
                        <button type="submit" className="btn-secondary">
                          Set Primary
                        </button>
                      </form>
                    ) : null}

                    <form
                      action={`/api/admin/products/${productId}/images/${image.id}/delete`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className="btn-secondary"
                        style={{
                          borderColor: "rgba(255, 77, 79, 0.25)",
                          color: "var(--danger)",
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}