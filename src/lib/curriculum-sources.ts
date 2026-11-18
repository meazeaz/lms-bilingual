import "server-only";
import path from "node:path";

/**
 * Berkas asli Rise Up! Teens 1 (Teacher's Guide, soal Progress Test, kunci jawaban).
 * Disimpan di disk (folder `materi2`, tidak ikut git) dan hanya disajikan ke guru/admin.
 * Lokasi bisa diganti lewat env CURRICULUM_SOURCE_DIR saat di-hosting.
 */
export const SOURCE_DIR = process.env.CURRICULUM_SOURCE_DIR || path.join(process.cwd(), "materi2");

export type SourceKind = "tg" | "tes" | "kunci";

export const SOURCE_LABEL: Record<SourceKind, string> = {
  tg: "Teacher's Guide",
  tes: "Soal Progress Test",
  kunci: "Kunci jawaban tes",
};

/** Path berkas untuk jenis & unit tertentu (daftar putih; tidak menerima path bebas). */
export function sourcePath(kind: SourceKind, unit: number) {
  if (!Number.isInteger(unit) || unit < 1 || unit > 10) return null;
  switch (kind) {
    case "tg":
      return path.join(SOURCE_DIR, `RUT Teacher_s Guide LEVEL 1 UNIT ${unit}.pdf`);
    case "tes":
      return path.join(SOURCE_DIR, "tugas", `TEST RUT LEVEL 1 UNIT ${unit}.pdf`);
    case "kunci":
      return path.join(SOURCE_DIR, "tugas", `TEST RUT LEVEL 1 UNIT ${unit} ANSWER.pdf`);
  }
}

/** Slug URL, mis. "tg-3" → { kind: "tg", unit: 3 }. */
export function parseSourceSlug(slug: string): { kind: SourceKind; unit: number } | null {
  const m = /^(tg|tes|kunci)-(\d{1,2})$/.exec(slug);
  return m ? { kind: m[1] as SourceKind, unit: Number(m[2]) } : null;
}
