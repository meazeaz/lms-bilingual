import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Seluruh halaman LMS bergantung pada sesi login & data terbaru,
  // jadi dirender dinamis per permintaan (tanpa Cache Components).
  cacheComponents: false,
  serverExternalPackages: ["better-sqlite3", "pg", "exceljs"],
};

export default nextConfig;
