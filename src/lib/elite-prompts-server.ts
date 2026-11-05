import "server-only";
import fs from "node:fs";
import path from "node:path";
import { toInputDate } from "@/lib/utils";
import {
  CURATED_TEMPLATES,
  type EliteDailyPromptItem,
} from "./elite-prompts";

const DATA_FILE = path.join(process.cwd(), "data", "elite-prompts.json");

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readStoredPrompts(): Record<string, EliteDailyPromptItem> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading elite prompts:", err);
    return {};
  }
}

function writeStoredPrompts(data: Record<string, EliteDailyPromptItem>) {
  try {
    ensureDirectoryExists(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing elite prompts:", err);
  }
}

/**
 * Mendapatkan prompt aktif untuk tanggal tertentu.
 * Jika Admin belum membuat prompt khusus, otomatis mengambil dari template kurasi hari tersebut (Senin-Jumat).
 */
export function getDailyPrompt(dateInput?: string | Date): EliteDailyPromptItem {
  const d = dateInput instanceof Date ? dateInput : dateInput ? new Date(dateInput) : new Date();
  const dateStr = toInputDate(d);
  const stored = readStoredPrompts();

  if (stored[dateStr]) {
    return stored[dateStr];
  }

  // Pilih template bawaan berdasarkan hari dalam pekan (1: Senin s.d. 5: Jumat)
  const dayOfWeek = d.getDay(); // 0: Ahad, 1: Senin, ..., 6: Sabtu
  const matched =
    CURATED_TEMPLATES.find((t) => t.dayOfWeek === dayOfWeek) ??
    CURATED_TEMPLATES[dayOfWeek % CURATED_TEMPLATES.length];

  return {
    id: `auto-${dateStr}`,
    date: dateStr,
    theme: matched.theme,
    category: matched.category,
    mirrorPrompt: matched.mirrorPrompt,
    mirrorAudioTip: matched.mirrorAudioTip,
    dailyMission: matched.dailyMission,
    targetCefr: matched.targetCefr,
    authorName: "Tim English Development Team (EDT)",
    notes: "Prompt terjadwal otomatis dari Bank Kurikulum ELITE Dokumen Master.",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Menyimpan atau memperbarui prompt khusus dari Admin untuk tanggal tertentu.
 */
export async function saveDailyPrompt(prompt: EliteDailyPromptItem): Promise<void> {
  const stored = readStoredPrompts();
  stored[prompt.date] = {
    ...prompt,
    updatedAt: new Date().toISOString(),
  };
  writeStoredPrompts(stored);
}

/**
 * Menghapus prompt khusus untuk tanggal tertentu (kembali ke template bawaan).
 */
export async function deleteDailyPrompt(dateStr: string): Promise<void> {
  const stored = readStoredPrompts();
  if (stored[dateStr]) {
    delete stored[dateStr];
    writeStoredPrompts(stored);
  }
}

/**
 * Mengambil daftar seluruh prompt khusus yang pernah dibuat Admin.
 */
export async function getAllScheduledPrompts(): Promise<EliteDailyPromptItem[]> {
  const stored = readStoredPrompts();
  return Object.values(stored).sort((a, b) => b.date.localeCompare(a.date));
}
