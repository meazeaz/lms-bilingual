import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { toInputDate } from "@/lib/utils";
import type { ElitePrompt } from "@/generated/prisma/client";
import { CURATED_TEMPLATES, type EliteDailyPromptItem } from "./elite-prompts";

/** Lokasi penyimpanan lama (sebelum pindah ke database), diimpor sekali bila tabel masih kosong. */
const LEGACY_FILE = path.join(process.cwd(), "data", "elite-prompts.json");
let legacyChecked = false;

async function importLegacyOnce() {
  if (legacyChecked) return;
  legacyChecked = true;
  if ((await db.elitePrompt.count()) > 0) return;
  let stored: Record<string, EliteDailyPromptItem>;
  try {
    stored = JSON.parse(await fs.readFile(LEGACY_FILE, "utf-8"));
  } catch {
    return;
  }
  for (const p of Object.values(stored)) {
    if (!p?.date) continue;
    await db.elitePrompt.upsert({ where: { date: p.date }, create: toRow(p), update: {} });
  }
}

function toRow(p: EliteDailyPromptItem) {
  return {
    date: p.date,
    theme: p.theme,
    category: p.category,
    mirrorPrompt: p.mirrorPrompt,
    mirrorAudioTip: p.mirrorAudioTip ?? null,
    dailyMission: p.dailyMission,
    targetCefr: p.targetCefr,
    authorName: p.authorName ?? null,
    notes: p.notes ?? null,
  };
}

function toItem(r: ElitePrompt): EliteDailyPromptItem {
  return {
    id: `prompt-${r.date}`,
    date: r.date,
    theme: r.theme,
    category: r.category as EliteDailyPromptItem["category"],
    mirrorPrompt: r.mirrorPrompt,
    mirrorAudioTip: r.mirrorAudioTip ?? undefined,
    dailyMission: r.dailyMission,
    targetCefr: r.targetCefr,
    authorName: r.authorName ?? undefined,
    notes: r.notes ?? undefined,
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Mendapatkan prompt aktif untuk tanggal tertentu.
 * Jika Admin belum membuat prompt khusus, otomatis mengambil dari template kurasi hari tersebut (Senin-Jumat).
 */
export async function getDailyPrompt(dateInput?: string | Date): Promise<EliteDailyPromptItem> {
  await importLegacyOnce();
  const d = dateInput instanceof Date ? dateInput : dateInput ? new Date(dateInput) : new Date();
  const dateStr = toInputDate(d);

  const stored = await db.elitePrompt.findUnique({ where: { date: dateStr } });
  if (stored) return toItem(stored);

  // Pilih template bawaan berdasarkan hari dalam pekan (1: Senin s.d. 5: Jumat)
  const dayOfWeek = d.getDay();
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

/** Menyimpan atau memperbarui prompt khusus dari Admin untuk tanggal tertentu. */
export async function saveDailyPrompt(prompt: EliteDailyPromptItem): Promise<void> {
  await importLegacyOnce();
  const row = toRow(prompt);
  await db.elitePrompt.upsert({ where: { date: prompt.date }, create: row, update: row });
}

/** Menghapus prompt khusus untuk tanggal tertentu (kembali ke template bawaan). */
export async function deleteDailyPrompt(dateStr: string): Promise<void> {
  await db.elitePrompt.deleteMany({ where: { date: dateStr } });
}

/** Mengambil daftar seluruh prompt khusus yang pernah dibuat Admin. */
export async function getAllScheduledPrompts(): Promise<EliteDailyPromptItem[]> {
  await importLegacyOnce();
  const rows = await db.elitePrompt.findMany({ orderBy: { date: "desc" } });
  return rows.map(toItem);
}
