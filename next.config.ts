import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Seluruh halaman LMS bergantung pada sesi login & data terbaru,
  // jadi dirender dinamis per permintaan (tanpa Cache Components).
  cacheComponents: false,
  serverExternalPackages: ["better-sqlite3", "pg", "exceljs"],
  experimental: {
    serverActions: {
      // Bawaan 1 MB terlalu kecil: impor Excel (≤ 2 MB) dan logo sekolah (≤ 3 MB) dikirim lewat server action.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
