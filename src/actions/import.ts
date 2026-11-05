"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isYes, readSheetRows } from "@/lib/excel";
import { STUDENT_CEFR, TEACHER_CEFR } from "@/lib/program";
import { invalidatePublicStats } from "@/lib/public-stats";

export type ImportResult = {
  ok: boolean;
  dryRun: boolean;
  message: string;
  total: number;
  created: number;
  skipped: { row: number; email: string; reason: string }[];
  errors: { row: number; message: string }[];
  createdClasses: string[];
  ts: number;
} | null;

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 2000;

const email = z.string({ error: "email wajib diisi" }).trim().toLowerCase().email("email tidak valid");
const optionalPassword = z
  .string()
  .trim()
  .refine((v) => v === "" || v.length >= 8, "password awal minimal 8 karakter")
  .optional();

const TeacherRow = z.object({
  nama: z.string({ error: "nama wajib diisi" }).trim().min(2, "nama wajib diisi"),
  email,
  nip: z.string().trim().optional(),
  "mata pelajaran": z.string({ error: "mata pelajaran wajib diisi" }).trim().min(1, "mata pelajaran wajib diisi"),
  whatsapp: z.string().trim().optional(),
  "level cefr": z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "" || TEACHER_CEFR.includes(v), `level CEFR harus salah satu dari ${TEACHER_CEFR.join(", ")}`)
    .optional(),
  "skor toefl": z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 310 && Number(v) <= 677), "skor TOEFL harus angka 310–677")
    .optional(),
  "guru pilot": z.string().optional(),
  "password awal": optionalPassword,
});

const StudentRow = z.object({
  nama: z.string({ error: "nama wajib diisi" }).trim().min(2, "nama wajib diisi"),
  email,
  nis: z.string().trim().optional(),
  kelas: z
    .string({ error: "kelas wajib diisi" })
    .trim()
    .transform((v) => v.toUpperCase().replace(/\s+/g, ""))
    .refine((v) => /^[789][A-Z0-9-]*$/.test(v), "kelas harus diawali jenjang 7, 8, atau 9 (mis. 7A)"),
  "level cefr": z
    .string()
    .trim()
    .refine((v) => v === "" || STUDENT_CEFR.map((c) => c.toLowerCase()).includes(v.toLowerCase()), `level CEFR harus salah satu dari ${STUDENT_CEFR.join(", ")}`)
    .optional(),
  "alumni pare": z.string().optional(),
  "password awal": optionalPassword,
});

function result(partial: Partial<NonNullable<ImportResult>>): ImportResult {
  return { ok: false, dryRun: false, message: "", total: 0, created: 0, skipped: [], errors: [], createdClasses: [], ts: Date.now(), ...partial };
}

/**
 * Impor massal guru atau siswa dari berkas Excel (.xlsx).
 * Mode "Periksa dulu" memvalidasi tanpa menyimpan. Email yang sudah terdaftar dilewati.
 */
export async function importUsers(_prev: ImportResult, fd: FormData): Promise<ImportResult> {
  const admin = await requireAdmin();
  const kind = fd.get("kind") === "STUDENT" ? "STUDENT" : "TEACHER";
  const dryRun = fd.get("mode") === "check";
  const createClasses = fd.get("createClasses") === "on";
  const defaultPassword = String(fd.get("defaultPassword") || "").trim();
  const file = fd.get("file");

  if (!(file instanceof File) || file.size === 0) return result({ message: "Pilih berkas Excel (.xlsx) terlebih dahulu." });
  if (file.size > MAX_FILE_BYTES) return result({ message: "Ukuran berkas maksimal 2 MB." });
  if (!file.name.toLowerCase().endsWith(".xlsx")) return result({ message: "Format berkas harus .xlsx (Excel). Gunakan templat yang disediakan." });

  let rows: Awaited<ReturnType<typeof readSheetRows>>;
  try {
    rows = await readSheetRows(await file.arrayBuffer());
  } catch {
    return result({ message: "Berkas tidak dapat dibaca. Pastikan berkas Excel tidak rusak dan tidak terkunci password." });
  }
  // Abaikan baris contoh bawaan templat
  rows = rows.filter((r) => !(r.values.nama ?? "").toLowerCase().startsWith("contoh:"));
  if (rows.length === 0) return result({ message: "Tidak ada baris data. Isi data mulai baris ke-2 sesuai templat." });
  if (rows.length > MAX_ROWS) return result({ message: `Maksimal ${MAX_ROWS} baris per impor. Bagi berkas menjadi beberapa bagian.` });

  const errors: { row: number; message: string }[] = [];
  const skipped: { row: number; email: string; reason: string }[] = [];
  const seen = new Set<string>();
  const existing = new Set(
    (await db.user.findMany({ where: { email: { in: rows.map((r) => (r.values.email ?? "").trim().toLowerCase()) } }, select: { email: true } })).map((u) => u.email),
  );
  const classes = new Map((await db.classRoom.findMany()).map((c) => [c.name, c.id]));
  const newClasses = new Set<string>();

  type Valid =
    | { kind: "TEACHER"; row: number; data: z.infer<typeof TeacherRow> }
    | { kind: "STUDENT"; row: number; data: z.infer<typeof StudentRow> };
  const valid: Valid[] = [];

  for (const r of rows) {
    const parsed = kind === "TEACHER" ? TeacherRow.safeParse(r.values) : StudentRow.safeParse(r.values);
    if (!parsed.success) {
      errors.push({ row: r.row, message: parsed.error.issues.map((i) => i.message).join("; ") });
      continue;
    }
    const mail = parsed.data.email;
    if (seen.has(mail)) {
      errors.push({ row: r.row, message: `email ${mail} muncul lebih dari sekali di berkas` });
      continue;
    }
    seen.add(mail);
    if (existing.has(mail)) {
      skipped.push({ row: r.row, email: mail, reason: "Email sudah terdaftar" });
      continue;
    }
    if (!parsed.data["password awal"] && defaultPassword.length < 8) {
      errors.push({ row: r.row, message: "password awal kosong dan password default (min. 8 karakter) belum diisi di form" });
      continue;
    }
    if (kind === "STUDENT") {
      const kelas = (parsed.data as z.infer<typeof StudentRow>).kelas;
      if (!classes.has(kelas)) {
        if (!createClasses) {
          errors.push({ row: r.row, message: `kelas ${kelas} belum ada (centang "Buat kelas baru otomatis" atau buat dulu di Manajemen Pengguna)` });
          continue;
        }
        newClasses.add(kelas);
      }
    }
    valid.push({ kind, row: r.row, data: parsed.data } as Valid);
  }

  const summary = (created: number) =>
    `${dryRun ? "Hasil pemeriksaan" : "Impor selesai"}: ${created} ${dryRun ? "siap diimpor" : "akun dibuat"}, ${skipped.length} dilewati, ${errors.length} bermasalah.`;

  if (dryRun || valid.length === 0) {
    return result({
      ok: errors.length === 0 && valid.length > 0,
      dryRun,
      total: rows.length,
      created: dryRun ? valid.length : 0,
      skipped,
      errors,
      createdClasses: [...newClasses],
      message: valid.length === 0 && !dryRun ? `Tidak ada akun baru yang dibuat. ${skipped.length} dilewati, ${errors.length} bermasalah.` : summary(valid.length),
    });
  }

  // Hash password default sekali saja (bcrypt mahal), password per baris di-hash sendiri
  const defaultHash = defaultPassword.length >= 8 ? await bcrypt.hash(defaultPassword, 10) : null;
  const hashes = await Promise.all(valid.map((v) => (v.data["password awal"] ? bcrypt.hash(v.data["password awal"], 10) : Promise.resolve(defaultHash!))));

  try {
    await db.$transaction(
      async (tx) => {
        for (const name of newClasses) {
          const c = await tx.classRoom.create({ data: { name, grade: Number(name[0]) } });
          classes.set(name, c.id);
        }
        for (const [i, v] of valid.entries()) {
          if (v.kind === "TEACHER") {
            const d = v.data;
            await tx.user.create({
              data: {
                name: d.nama, email: d.email, passwordHash: hashes[i], role: "TEACHER", title: `Guru ${d["mata pelajaran"]}`,
                teacher: {
                  create: {
                    nip: d.nip || null, subject: d["mata pelajaran"], whatsapp: d.whatsapp || null,
                    cefrLevel: d["level cefr"] || "A2", toeflScore: d["skor toefl"] ? Number(d["skor toefl"]) : null, isPilot: isYes(d["guru pilot"]),
                  },
                },
              },
            });
          } else {
            const d = v.data;
            const cefr = STUDENT_CEFR.find((c) => c.toLowerCase() === (d["level cefr"] ?? "").toLowerCase()) ?? "A1";
            await tx.user.create({
              data: {
                name: d.nama, email: d.email, passwordHash: hashes[i], role: "STUDENT", title: "Siswa",
                student: { create: { nis: d.nis || null, classId: classes.get(d.kelas)!, cefrLevel: cefr, pareAlumni: isYes(d["alumni pare"]) } },
              },
            });
          }
        }
      },
      { timeout: 60_000 },
    );
  } catch (err) {
    console.error("Impor gagal:", err);
    return result({ dryRun, total: rows.length, skipped, errors, message: "Impor dibatalkan karena terjadi galat database. Tidak ada data yang disimpan." });
  }

  await logAudit("user.import", {
    actorId: admin.id,
    target: kind === "TEACHER" ? "Guru" : "Siswa",
    detail: `${file.name}: ${valid.length} dibuat, ${skipped.length} dilewati, ${errors.length} bermasalah${newClasses.size ? `, kelas baru ${[...newClasses].join(", ")}` : ""}`,
  });
  invalidatePublicStats();
  revalidatePath("/admin", "layout");

  return result({
    ok: true,
    dryRun: false,
    total: rows.length,
    created: valid.length,
    skipped,
    errors,
    createdClasses: [...newClasses],
    message: summary(valid.length),
  });
}
