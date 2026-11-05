import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  DEFAULT_SYSTEM_SETTINGS,
  type SystemSettings,
  type SchoolProfile,
  type MaterialCategory,
} from "./settings";

const SETTINGS_KEY = "system";
/** Lokasi penyimpanan lama (sebelum pindah ke database), hanya dibaca sekali untuk migrasi. */
const LEGACY_FILE = path.join(process.cwd(), "data", "system-settings.json");

function normalize(parsed: Partial<SystemSettings>): SystemSettings {
  return {
    profile: { ...DEFAULT_SYSTEM_SETTINGS.profile, ...(parsed.profile || {}) },
    subjects:
      Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_SYSTEM_SETTINGS.subjects,
    materialCategories:
      Array.isArray(parsed.materialCategories) && parsed.materialCategories.length > 0
        ? parsed.materialCategories
        : DEFAULT_SYSTEM_SETTINGS.materialCategories,
  };
}

async function readLegacyFile(): Promise<Partial<SystemSettings> | null> {
  try {
    return JSON.parse(await fs.readFile(LEGACY_FILE, "utf-8")) as Partial<SystemSettings>;
  } catch {
    return null;
  }
}

/**
 * Membaca pengaturan sistem dari tabel AppSetting.
 * Bila belum ada, data diimpor sekali dari data/system-settings.json (jika ada) atau dari nilai default.
 * Di-cache per request agar layout & halaman tidak membaca berulang.
 */
export const getSystemSettings = cache(async (): Promise<SystemSettings> => {
  const row = await db.appSetting.findUnique({ where: { key: SETTINGS_KEY } });
  if (row) {
    try {
      return normalize(JSON.parse(row.value) as Partial<SystemSettings>);
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  }
  const initial = normalize((await readLegacyFile()) ?? {});
  await saveSystemSettings(initial);
  return initial;
});

/** Menyimpan konfigurasi sistem ke database. */
export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  const value = JSON.stringify(settings);
  await db.appSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value },
    update: { value },
  });
}

/** Mengambil daftar mata pelajaran sekolah aktif. */
export async function getSchoolSubjects(): Promise<string[]> {
  return (await getSystemSettings()).subjects;
}

/** Mengambil daftar kategori materi pembelajaran. */
export async function getMaterialCategories(): Promise<MaterialCategory[]> {
  return (await getSystemSettings()).materialCategories;
}

/** Mengambil profil & semester sekolah. */
export async function getSchoolProfile(): Promise<SchoolProfile> {
  return (await getSystemSettings()).profile;
}
