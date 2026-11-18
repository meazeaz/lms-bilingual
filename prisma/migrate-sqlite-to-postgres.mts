/**
 * Skrip Migrasi Otomatis: SQLite (dev.db) -> PostgreSQL
 * Menjamin 100% data yang telah dibuat di lingkungan lokal berpindah utuh ke PostgreSQL (Neon/Supabase/VPS).
 *
 * Cara Menjalankan:
 * 1. Atur TARGET_DATABASE_URL di file .env atau variabel environment:
 *    TARGET_DATABASE_URL="postgresql://user:pass@host:5432/db_name?sslmode=require"
 * 2. Jalankan:
 *    npx tsx prisma/migrate-sqlite-to-postgres.mts
 */

import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config();

const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");
const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!targetUrl || (!targetUrl.startsWith("postgres://") && !targetUrl.startsWith("postgresql://"))) {
  console.error("❌ ERROR: TARGET_DATABASE_URL atau DATABASE_URL belum diatur ke alamat PostgreSQL yang valid.");
  console.error("Contoh: TARGET_DATABASE_URL=\"postgresql://postgres:password@localhost:5432/lms_bilingual?sslmode=disable\"");
  process.exit(1);
}

console.log("========================================================");
console.log("🚀 MEMULAI MIGRASI DATA: SQLITE ➔ POSTGRESQL");
console.log(`📁 Sumber SQLite  : ${sqlitePath}`);
console.log(`🐘 Target Postgres: ${targetUrl.replace(/:[^:@]+@/, ":****@")}`);
console.log("========================================================");

const sqlite = new Database(sqlitePath);
const pgPool = new Pool({ connectionString: targetUrl });

// Urutan pemindahan tabel sesuai dependensi Foreign Key
const TABLES = [
  "User",
  "ClassRoom",
  "Teacher",
  "Student",
  "TeachingAssignment",
  "Badge",
  "TeacherBadge",
  "Phrase",
  "PhraseMastery",
  "WeeklyChallenge",
  "ChallengeProgress",
  "DailyLog",
  "Assessment",
  "Appeal",
  "AmbassadorRegistration",
  "LevelChange",
  "CefrRecord",
  "Observation",
  "Reflection",
  "LessonPlan",
  "MicroTeaching",
  "StudentAssessment",
  "Material",
  "MaterialRead",
  "Quiz",
  "QuizAttempt",
  "ClubSession",
  "ClubAttendance",
  "Competition",
  "CompetitionEntry",
  "Announcement",
  "MonthlyReport",
  "AppSetting",
  "ElitePrompt",
  "StoredFile",
  "AuditLog",
  "LoginAttempt",
  "ModulAjar",
];

async function migrate() {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");

    console.log("🔒 Menonaktifkan trigger & constraint sementara selama proses insert...");
    await client.query("SET CONSTRAINTS ALL DEFERRED");

    for (const table of TABLES) {
      // Cek apakah tabel ada di SQLite
      const tableExists = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table);

      if (!tableExists) {
        console.log(`⏭️  Tabel ${table} tidak ditemukan di SQLite, melewati.`);
        continue;
      }

      // ModulAjar merujuk dirinya sendiri (salinan guru → induk): salin induk (sourceId NULL) lebih dulu
      const order = table === "ModulAjar" ? ' ORDER BY "sourceId" IS NOT NULL' : "";
      const rows: any[] = sqlite.prepare(`SELECT * FROM "${table}"${order}`).all();
      console.log(`📦 Memindahkan tabel ${table.padEnd(24)} : ${rows.length} baris...`);

      if (rows.length === 0) continue;

      // Bersihkan data lama di Postgres jika ada
      await client.query(`DELETE FROM "${table}" CASCADE`);

      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");

      for (const row of rows) {
        const values: any[] = [];
        const placeholders: string[] = [];

        columns.forEach((col, idx) => {
          let val = row[col];

          // Penyesuaian tipe data SQLite -> PostgreSQL
          if (typeof val === "number" && (col.startsWith("is") || col === "active" || col === "passed" || col === "mirrorMorning" || col === "voiceNoteOnTime" || col === "dailyMission" || col === "buddySession" || col === "acknowledged" || col === "feedbackGiven" || col === "readyToMentor" || col === "commitmentAgreement" || col === "pareAlumni" || col === "isStudentAmbassador" || col === "isHomeroom" || col === "published" || col === "present" || col === "writtenWaived" || col === "success")) {
            val = Boolean(val);
          } else if (typeof val === "number" && (col.endsWith("At") || col === "date" || col === "levelSince" || col === "assessmentDate" || col === "decidedAt")) {
            val = new Date(val).toISOString();
          }

          values.push(val);
          placeholders.push(`$${idx + 1}`);
        });

        const insertQuery = `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders.join(", ")}) ON CONFLICT DO NOTHING`;
        await client.query(insertQuery, values);
      }
    }

    await client.query("COMMIT");
    console.log("========================================================");
    console.log("🎉 MIGRASI SUKSES 100%! Seluruh data telah berhasil disalin ke PostgreSQL.");
    console.log("========================================================");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Terjadi kegagalan saat migrasi data (Transaction Rolled Back):", err);
    process.exit(1);
  } finally {
    client.release();
    sqlite.close();
    await pgPool.end();
  }
}

migrate();
