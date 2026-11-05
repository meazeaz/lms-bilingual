"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { type ActionState, failure, success } from "@/lib/action-state";
import { type EliteDailyPromptItem } from "@/lib/elite-prompts";
import { deleteDailyPrompt, saveDailyPrompt } from "@/lib/elite-prompts-server";

export async function saveDailyPromptAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();

  const date = String(fd.get("date") || "").trim();
  const theme = String(fd.get("theme") || "").trim();
  const category = (String(fd.get("category") || "GENERAL").trim()) as EliteDailyPromptItem["category"];
  const mirrorPrompt = String(fd.get("mirrorPrompt") || "").trim();
  const mirrorAudioTip = String(fd.get("mirrorAudioTip") || "").trim() || undefined;
  const dailyMission = String(fd.get("dailyMission") || "").trim();
  const targetCefr = String(fd.get("targetCefr") || "A2 - B1").trim();
  const notes = String(fd.get("notes") || "").trim() || undefined;

  if (!date) return failure("Tanggal posting wajib diisi.");
  if (!theme) return failure("Tema posting wajib diisi.");
  if (!mirrorPrompt) return failure("Naskah Mirror Morning wajib diisi.");
  if (!dailyMission) return failure("Misi harian wajib diisi.");

  const item: EliteDailyPromptItem = {
    id: `prompt-${date}`,
    date,
    theme,
    category,
    mirrorPrompt,
    mirrorAudioTip,
    dailyMission,
    targetCefr,
    authorName: admin.name,
    notes,
    updatedAt: new Date().toISOString(),
  };

  await saveDailyPrompt(item);

  revalidatePath("/admin/elite");
  revalidatePath("/guru/harian");
  revalidatePath("/admin");

  return success(`Jadwal Mirror Morning & Misi Harian untuk tanggal ${date} berhasil disimpan.`);
}

export async function deleteDailyPromptAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const date = String(fd.get("date") || "").trim();
  if (!date) return;

  await deleteDailyPrompt(date);

  revalidatePath("/admin/elite");
  revalidatePath("/guru/harian");
  revalidatePath("/admin");
}

export async function quickVerifyDailyLogAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(fd.get("id") || "").trim();
  const status = String(fd.get("status") || "APPROVED").trim() as "APPROVED" | "REJECTED";
  const note = String(fd.get("note") || "").trim() || null;

  if (!id) return;

  await db.dailyLog.update({
    where: { id },
    data: {
      status,
      reviewerId: admin.id,
      reviewNote: note,
    },
  });

  revalidatePath("/admin/elite");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/laporan");
  revalidatePath("/admin");
}
