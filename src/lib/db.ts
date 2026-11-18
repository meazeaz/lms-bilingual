import "server-only";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

function getAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");

  if (isPostgres) {
    // Adapter PostgreSQL resmi untuk Prisma 7 (Production / Staging / 1000 Users)
    // Mendukung connection pooling dengan pg.Pool
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const pool = new Pool({
      connectionString: url,
      max: Number(process.env.PG_MAX_CONNECTIONS ?? 20),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    return new PrismaPg(pool);
  }

  // Adapter SQLite lokal (Local Development)
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const file = url.replace(/^file:/, "");
  const resolvedPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  return new PrismaBetterSqlite3({ url: resolvedPath });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaClass?: typeof PrismaClient };

// Mode dev: klien disimpan di globalThis agar tidak membuat koneksi baru di setiap hot reload.
// Bila Prisma Client di-generate ulang (skema berubah), kelasnya ikut berganti, jadi buat klien baru;
// tanpa ini model baru (mis. db.modulAjar) bernilai undefined sampai server di-restart manual.
const cached = globalForPrisma.prismaClass === PrismaClient ? globalForPrisma.prisma : undefined;
if (!cached && globalForPrisma.prisma) void globalForPrisma.prisma.$disconnect().catch(() => {});

export const db = cached ?? new PrismaClient({ adapter: getAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaClass = PrismaClient;
}
