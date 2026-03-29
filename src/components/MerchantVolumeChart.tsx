"use client";

import { useState, useRef, useCallback } from "react";
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
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">
        {data.merchantName}
      </p>
      <p className="text-lg font-bold text-blue-600">
        ${data.volume.toLocaleString()}
      </p>
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Merchant Processing Volume
        </h1>
        <p className="mt-1 text-gray-500">
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
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-gray-600">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Upload a CSV file
            </button>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-400">
            CSV should have columns for merchant name and processing volume
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {uploadMessage && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            uploadMessage.toLowerCase().includes("error") ||
            uploadMessage.toLowerCase().includes("could not") ||
            uploadMessage.toLowerCase().includes("no valid")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Top 10 Merchants by Processing Volume
        </h2>
        <div className="h-[500px] w-full">
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
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Merchant Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Business Name</th>
                <th className="px-6 py-3 text-right">Processing Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map((merchant, idx) => (
                <tr
                  key={merchant.merchantName}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {merchant.merchantName}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-gray-700">
                    ${merchant.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
