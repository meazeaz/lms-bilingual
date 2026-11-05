import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DEFAULT_SYSTEM_SETTINGS,
  type SystemSettings,
  type SchoolProfile,
  type MaterialCategory,
} from "./settings";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "system-settings.json");

/**
 * Membaca pengaturan sistem dari data/system-settings.json.
 * Jika file belum ada, otomatis diinisialisasi dari DEFAULT_SYSTEM_SETTINGS.
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    return {
      profile: {
        ...DEFAULT_SYSTEM_SETTINGS.profile,
        ...(parsed.profile || {}),
      },
      subjects:
        Array.isArray(parsed.subjects) && parsed.subjects.length > 0
          ? parsed.subjects
          : DEFAULT_SYSTEM_SETTINGS.subjects,
      materialCategories:
        Array.isArray(parsed.materialCategories) && parsed.materialCategories.length > 0
          ? parsed.materialCategories
          : DEFAULT_SYSTEM_SETTINGS.materialCategories,
    };
  } catch {
    await saveSystemSettings(DEFAULT_SYSTEM_SETTINGS);
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

/**
 * Menyimpan konfigurasi sistem ke data/system-settings.json secara aman.
 */
export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempPath = `${SETTINGS_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tempPath, JSON.stringify(settings, null, 2), "utf-8");
  await fs.rename(tempPath, SETTINGS_FILE);
}

/**
 * Mengambil daftar mata pelajaran sekolah aktif.
 */
export async function getSchoolSubjects(): Promise<string[]> {
  const settings = await getSystemSettings();
  return settings.subjects;
}

/**
 * Mengambil daftar kategori materi pembelajaran.
 */
export async function getMaterialCategories(): Promise<MaterialCategory[]> {
  const settings = await getSystemSettings();
  return settings.materialCategories;
}

/**
 * Mengambil profil & semester sekolah.
 */
export async function getSchoolProfile(): Promise<SchoolProfile> {
  const settings = await getSystemSettings();
  return settings.profile;
}
