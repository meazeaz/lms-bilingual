// RPP induk (Modul Ajar) Rise Up! Teens 1 buatan admin, dari prisma/data/modul-ajar-rise-up-1/*.json
// (hasil scripts/import-modul-ajar.py atas folder materi2/...-CTM). Idempoten: RPP induk yang sudah ada
// (buku+unit+pertemuan sama) diperbarui; salinan guru tidak disentuh. Jalankan: npm run db:seed-modul
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "../src/generated/prisma/client";

const DATA_DIR = path.join(process.cwd(), "prisma", "data", "modul-ajar-rise-up-1");

type ModulFile = {
  book: string; unit: number; unitTitle: string; meeting: number; title: string; subject: string; phase: string; grade: number;
  semester: string; duration: string; year: string; prerequisites: string; profiles: string[]; resources: string[];
  learningModel: string; approach: string[]; objectives: string[]; steps: unknown[]; assessment: string[];
  reflectionStudent: string[]; reflectionTeacher: string[]; attachments: string[];
};

export async function seedModulAjar(db: PrismaClient) {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
  let created = 0;
  let updated = 0;
  for (const f of files) {
    const m = JSON.parse(readFileSync(path.join(DATA_DIR, f), "utf-8")) as ModulFile;
    const data = {
      title: m.title, subject: m.subject, book: m.book, unit: m.unit, unitTitle: m.unitTitle, meeting: m.meeting,
      phase: m.phase, grade: m.grade, semester: m.semester, duration: m.duration, year: m.year,
      prerequisites: m.prerequisites, profiles: JSON.stringify(m.profiles), resources: m.resources.join("\n"),
      learningModel: m.learningModel, approach: m.approach.join("\n"), objectives: JSON.stringify(m.objectives),
      steps: JSON.stringify(m.steps), assessment: m.assessment.join("\n"), reflectionStudent: m.reflectionStudent.join("\n"),
      reflectionTeacher: m.reflectionTeacher.join("\n"), attachments: m.attachments.join("\n"), published: true,
    };
    const existing = await db.modulAjar.findFirst({ where: { teacherId: null, book: m.book, unit: m.unit, meeting: m.meeting } });
    if (existing) {
      await db.modulAjar.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await db.modulAjar.create({ data });
      created++;
    }
  }
  return { total: files.length, created, updated };
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = await makeClient();
  try {
    const r = await seedModulAjar(db);
    console.log(`Modul Ajar Rise Up! Teens 1: ${r.total} RPP induk (${r.created} baru, ${r.updated} diperbarui).`);
  } finally {
    await db.$disconnect();
  }
}
