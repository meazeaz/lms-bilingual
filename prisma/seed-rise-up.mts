// Kurikulum inti Rise Up! Teens 1: 10 unit materi + Progress Test (kuis).
// Sumber data: prisma/data/rise-up-teens-1/unit-NN.json (disusun dari folder materi2 & materi2/tugas).
// Aman dijalankan berulang (idempoten): unit yang sudah ada diperbarui, tidak digandakan,
// sehingga riwayat nilai siswa tetap tersimpan. Jalankan: npm run db:seed-riseup
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "../src/generated/prisma/client";

export const CORE_CATEGORY = "Rise Up! Teens 1";
const DATA_DIR = path.join(process.cwd(), "prisma", "data", "rise-up-teens-1");

type UnitFile = {
  unit: number;
  title: string;
  summary: string;
  content: string;
  vocabulary: { en: string; id: string }[];
  quiz: { title: string; questions: unknown[] };
};

export function loadUnits(): UnitFile[] {
  return readdirSync(DATA_DIR)
    .filter((f) => /^unit-\d{2}\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(path.join(DATA_DIR, f), "utf-8")) as UnitFile);
}

export async function seedRiseUp(db: PrismaClient) {
  const units = loadUnits();
  let created = 0;
  let updated = 0;
  for (const u of units) {
    const title = `Unit ${u.unit} · ${u.title}`;
    const data = {
      title,
      category: CORE_CATEGORY,
      subject: "Bahasa Inggris",
      grade: 7,
      cefrLevel: "A2",
      summary: u.summary,
      content: u.content,
      vocabulary: JSON.stringify(u.vocabulary),
      published: true,
    };
    const existing = await db.material.findFirst({
      where: { category: CORE_CATEGORY, title: { startsWith: `Unit ${u.unit} ·` } },
      include: { quizzes: { orderBy: { createdAt: "asc" }, take: 1 } },
    });
    const quizData = { title: u.quiz.title, questions: JSON.stringify(u.quiz.questions), passScore: 70 };
    if (existing) {
      await db.material.update({ where: { id: existing.id }, data });
      const quiz = existing.quizzes[0];
      if (quiz) await db.quiz.update({ where: { id: quiz.id }, data: quizData });
      else await db.quiz.create({ data: { ...quizData, materialId: existing.id } });
      updated++;
    } else {
      const mat = await db.material.create({ data });
      await db.quiz.create({ data: { ...quizData, materialId: mat.id } });
      created++;
    }
  }
  return { total: units.length, created, updated };
}

async function makeClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  }
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const file = url.replace(/^file:/, "");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.isAbsolute(file) ? file : path.join(process.cwd(), file) }) });
}

// Dijalankan langsung (bukan diimpor dari seed.mts)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = await makeClient();
  try {
    const r = await seedRiseUp(db);
    console.log(`Rise Up! Teens 1: ${r.total} unit (${r.created} baru, ${r.updated} diperbarui).`);
  } finally {
    await db.$disconnect();
  }
}
