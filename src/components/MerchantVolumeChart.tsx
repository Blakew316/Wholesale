"use client";

import { useState, useRef, useCallback, CSSProperties } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MerchantData {
  merchantName: string;
  volume: number;
}

const SAMPLE_DATA: MerchantData[] = [
  { merchantName: "Acme Corp", volume: 1_250_000 },
  { merchantName: "BlueSky Retail", volume: 980_000 },
  { merchantName: "CityMart", volume: 875_000 },
  { merchantName: "DataFlow Inc", volume: 760_000 },
  { merchantName: "EcoGoods", volume: 650_000 },
  { merchantName: "FreshMart", volume: 540_000 },
  { merchantName: "GlobalTech", volume: 430_000 },
  { merchantName: "HomeBase", volume: 320_000 },
  { merchantName: "InnoShop", volume: 210_000 },
  { merchantName: "JetCommerce", volume: 150_000 },
];

const BAR_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#2563eb",
  "#3b82f6",
];

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  dropzoneBase: {
    borderRadius: 12,
    border: "2px dashed #d1d5db",
    padding: 24,
    textAlign: "center" as const,
    backgroundColor: "#fff",
    transition: "border-color 0.2s, background-color 0.2s",
    cursor: "pointer",
  },
  dropzoneActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  dropzoneContent: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 8,
  },
  uploadBtn: {
    background: "none",
    border: "none",
    fontWeight: 600,
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 14,
  },
  uploadHint: {
    fontSize: 12,
    color: "#9ca3af",
  },
  msgSuccess: {
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
    backgroundColor: "#f0fdf4",
    color: "#15803d",
  },
  msgError: {
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
  },
  card: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    padding: 24,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 16,
  },
  chartContainer: {
    height: 500,
    width: "100%",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #f3f4f6",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  th: {
    padding: "12px 24px",
    textAlign: "left" as const,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #f3f4f6",
  },
  thRight: {
    padding: "12px 24px",
    textAlign: "right" as const,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px 24px",
    borderBottom: "1px solid #f9fafb",
  },
  rankBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    width: 28,
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    fontSize: 12,
    fontWeight: 700,
    color: "#1d4ed8",
  },
  merchantName: {
    fontWeight: 500,
    color: "#111827",
  },
  volumeCell: {
    textAlign: "right" as const,
    fontFamily: "monospace",
    color: "#374151",
  },
  tooltipBox: {
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    padding: "12px 16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  tooltipName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  tooltipValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#2563eb",
  },
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MerchantData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={styles.tooltipBox}>
      <p style={styles.tooltipName}>{data.merchantName}</p>
      <p style={styles.tooltipValue}>${data.volume.toLocaleString()}</p>
    </div>
  );
}

export default function MerchantVolumeChart() {
  const [data, setData] = useState<MerchantData[]>(SAMPLE_DATA);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSV = useCallback((file: File) => {
    setUploadMessage("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        if (!rows.length) {
          setUploadMessage("CSV file is empty or has no valid rows.");
          return;
        }

        const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
        const nameKey = Object.keys(rows[0]).find((k) => {
          const lower = k.trim().toLowerCase();
          return (
            lower.includes("merchant") ||
            lower.includes("business") ||
            lower.includes("name") ||
            lower.includes("company")
          );
        });
        const volumeKey = Object.keys(rows[0]).find((k) => {
          const lower = k.trim().toLowerCase();
          return (
            lower.includes("volume") ||
            lower.includes("amount") ||
            lower.includes("processing") ||
            lower.includes("revenue") ||
            lower.includes("sales") ||
            lower.includes("total")
          );
        });

        if (!nameKey || !volumeKey) {
          setUploadMessage(
            `Could not detect columns. Expected a name column (merchant/business/name/company) and a volume column (volume/amount/processing/revenue/sales/total). Found columns: ${headers.join(", ")}`
          );
          return;
        }

        const parsed: MerchantData[] = rows
          .map((row) => ({
            merchantName: (row[nameKey] || "").trim(),
            volume: parseFloat(
              (row[volumeKey] || "0").replace(/[$,]/g, "")
            ),
          }))
          .filter((d) => d.merchantName && !isNaN(d.volume) && d.volume > 0);

        if (!parsed.length) {
          setUploadMessage("No valid merchant data found in the CSV.");
          return;
        }

        const sorted = parsed
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 10);

        setData(sorted);
        setUploadMessage(
          `Loaded ${parsed.length} merchants from CSV. Showing top ${sorted.length}.`
        );
      },
      error(err) {
        setUploadMessage(`Error parsing CSV: ${err.message}`);
      },
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSV(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      processCSV(file);
    } else {
      setUploadMessage("Please upload a .csv file.");
    }
  };

  const isError =
    uploadMessage.toLowerCase().includes("error") ||
    uploadMessage.toLowerCase().includes("could not") ||
    uploadMessage.toLowerCase().includes("no valid");

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div>
        <h1 style={styles.title}>Merchant Processing Volume</h1>
        <p style={styles.subtitle}>
          Top 10 merchants ranked by current processing volume
        </p>
      </div>

      {/* CSV Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          ...styles.dropzoneBase,
          ...(dragOver ? styles.dropzoneActive : {}),
        }}
      >
        <div style={styles.dropzoneContent}>
          <svg
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#9ca3af"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p style={{ fontSize: 14, color: "#4b5563" }}>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>
              Upload a CSV file
            </span>{" "}
            or drag and drop
          </p>
          <p style={styles.uploadHint}>
            CSV should have columns for merchant name and processing volume
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {uploadMessage && (
        <div style={isError ? styles.msgError : styles.msgSuccess}>
          {uploadMessage}
        </div>
      )}

      {/* Chart */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Top 10 Merchants by Processing Volume</h2>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatVolume}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="merchantName"
                width={140}
                tick={{ fontSize: 13, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" radius={[0, 6, 6, 0]} barSize={36}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
            Merchant Details
          </h2>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Business Name</th>
              <th style={styles.thRight}>Processing Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((merchant, idx) => (
              <tr key={merchant.merchantName}>
                <td style={styles.td}>
                  <span style={styles.rankBadge}>{idx + 1}</span>
                </td>
                <td style={{ ...styles.td, ...styles.merchantName }}>
                  {merchant.merchantName}
                </td>
                <td style={{ ...styles.td, ...styles.volumeCell }}>
                  ${merchant.volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
