"use client";

import { useMemo, useState } from "react";

type SizeChartModalProps = {
  productName: string;
};

type EditionType = "FAN" | "PLAYER";

const fanEditionRows = [
  { size: "M", width: '40"', length: '28"' },
  { size: "L", width: '42"', length: '29"' },
  { size: "XL", width: '44"', length: '30"' },
  { size: "XXL", width: '46"', length: '31"' },
  { size: "3XL", width: '48"', length: '32"' },
  { size: "4XL", width: '50"', length: '33"' },
];

const playerEditionRows = [
  { size: "M", width: '38"', length: '28"' },
  { size: "L", width: '40"', length: '29"' },
  { size: "XL", width: '42"', length: '30"' },
  { size: "XXL", width: '44"', length: '31"' },
];

export function SizeChartModal({ productName }: SizeChartModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<EditionType>("FAN");

  const rows = useMemo(() => {
    return selectedEdition === "FAN" ? fanEditionRows : playerEditionRows;
  }, [selectedEdition]);

  return (
    <>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
        style={{
          minWidth: 170,
        }}
      >
        View Size Chart
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} size chart`}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 820,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(18,20,30,0.98), rgba(11,12,18,0.98))",
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Size Chart
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    marginTop: 4,
                    fontSize: 14,
                  }}
                >
                  Choose the edition type for {productName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 22, display: "grid", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedEdition("FAN")}
                  className={selectedEdition === "FAN" ? "btn-primary" : "btn-secondary"}
                >
                  Fan Edition
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEdition("PLAYER")}
                  className={selectedEdition === "PLAYER" ? "btn-primary" : "btn-secondary"}
                >
                  Player Edition
                </button>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    padding: "8px 14px",
                    marginBottom: 16,
                    background:
                      selectedEdition === "FAN"
                        ? "rgba(225,255,59,0.12)"
                        : "rgba(59,130,246,0.12)",
                    border:
                      selectedEdition === "FAN"
                        ? "1px solid rgba(225,255,59,0.2)"
                        : "1px solid rgba(59,130,246,0.2)",
                    fontWeight: 700,
                  }}
                >
                  {selectedEdition === "FAN" ? "Fan Edition" : "Player Edition"}
                </div>

                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 520,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: 14 }}>Size</th>
                        <th style={{ padding: 14 }}>Width</th>
                        <th style={{ padding: 14 }}>Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.size}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <td style={{ padding: 14, fontWeight: 700 }}>{row.size}</td>
                          <td style={{ padding: 14 }}>{row.width}</td>
                          <td style={{ padding: 14 }}>{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    color: "var(--muted)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Measurements may vary slightly by 0.5–1 inch due to manual
                  measurement.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}