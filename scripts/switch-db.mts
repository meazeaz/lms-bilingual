/**
 * CLI Helper: Beralih cepat antara SQLite (Local) dan PostgreSQL (Production/Staging)
 *
 * Penggunaan:
 * npm run db:use-postgres   -> Aktifkan skema & client PostgreSQL
 * npm run db:use-sqlite     -> Aktifkan skema & client SQLite
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const target = (process.argv[2] || "").toLowerCase();

if (target !== "postgres" && target !== "sqlite") {
  console.log("Usage: npx tsx scripts/switch-db.mts [postgres|sqlite]");
  process.exit(1);
}

const rootDir = process.cwd();
const schemaPrisma = path.join(rootDir, "prisma", "schema.prisma");
const schemaSource =
  target === "postgres"
    ? path.join(rootDir, "prisma", "schema.postgresql.prisma")
    : path.join(rootDir, "prisma", "schema.sqlite.prisma");

console.log(`🔄 Mengalihkan skema Prisma ke: ${target.toUpperCase()}...`);
fs.copyFileSync(schemaSource, schemaPrisma);
console.log(`✅ prisma/schema.prisma berhasil diperbarui dari ${path.basename(schemaSource)}.`);

console.log(`⚡ Meregenerasi Prisma Client...`);
execSync("npx prisma generate", { stdio: "inherit" });

console.log("========================================================");
if (target === "postgres") {
  console.log("🐘 Mode PostgreSQL AKTIF!");
  console.log("Pastikan DATABASE_URL di file .env Anda berisi connection string PostgreSQL:");
  console.log('DATABASE_URL="postgresql://user:password@host:5432/lms_bilingual?sslmode=require"');
  console.log("\nLangkah selanjutnya:");
  console.log("1. Sinkronkan tabel baru ke PostgreSQL: npm run db:push");
  console.log("2. Salin seluruh data dari SQLite (opsional): npx tsx prisma/migrate-sqlite-to-postgres.mts");
} else {
  console.log("📁 Mode SQLite Lokal AKTIF!");
  console.log("Pastikan DATABASE_URL di file .env berisi: DATABASE_URL=\"file:./prisma/dev.db\"");
}
console.log("========================================================");
