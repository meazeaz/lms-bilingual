"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action-state";
import { logAudit } from "@/lib/audit";
import { getPhaseStates } from "@/lib/phases-server";
import { PHASES } from "@/lib/program";

const CodeSchema = z.enum(PHASES.map((p) => p.code) as [string, ...string[]]);

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
}

/** Ambil fase yang sedang berjalan; tolak bila terkunci atau sudah selesai. */
async function openPhase(code: string) {
  const { states } = await getPhaseStates();
  const phase = states.find((s) => s.code === code);
  if (!phase) return { error: "Fase tidak ditemukan." };
  if (phase.status === "TERKUNCI") {
    const prev = states[phase.index - 1];
    return { error: `${phase.name} masih terkunci. Selesaikan ${prev.name} terlebih dahulu.` };
  }
  if (phase.status === "SELESAI") return { error: `${phase.name} sudah selesai. Buka kembali fase ini bila ingin mengubahnya.` };
  return { phase };
}

export async function setPhaseMaterialRead(code: string, read: boolean): Promise<ActionState> {
  await requireAdmin();
  const parsed = CodeSchema.safeParse(code);
  if (!parsed.success) return failure("Fase tidak dikenal.");
  const { error } = await openPhase(parsed.data);
  if (error) return failure(error);
  await db.phaseProgress.upsert({
    where: { code: parsed.data },
    create: { code: parsed.data, materialRead: read },
    update: { materialRead: read },
  });
  refresh();
  return success(read ? "Materi ditandai sudah dibaca." : "Tanda sudah dibaca dibatalkan.");
}

export async function togglePhaseChecklist(code: string, itemId: string, checked: boolean): Promise<ActionState> {
  await requireAdmin();
  const parsed = CodeSchema.safeParse(code);
  if (!parsed.success) return failure("Fase tidak dikenal.");
  const { phase, error } = await openPhase(parsed.data);
  if (error || !phase) return failure(error ?? "Fase tidak ditemukan.");
  if (!phase.checklist.some((c) => c.id === itemId)) return failure("Butir checklist tidak dikenal.");

  const next = new Set(phase.done);
  if (checked) next.add(itemId);
  else next.delete(itemId);
  const value = JSON.stringify(phase.checklist.map((c) => c.id).filter((id) => next.has(id)));
  await db.phaseProgress.upsert({
    where: { code: phase.code },
    create: { code: phase.code, checklist: value },
    update: { checklist: value },
  });
  refresh();
  return success("Checklist tersimpan.");
}

export async function completePhase(code: string): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = CodeSchema.safeParse(code);
  if (!parsed.success) return failure("Fase tidak dikenal.");
  const { phase, error } = await openPhase(parsed.data);
  if (error || !phase) return failure(error ?? "Fase tidak ditemukan.");
  if (!phase.materialRead) return failure("Baca materi fase ini lalu tandai \"Sudah dibaca\" sebelum menyelesaikannya.");
  const missing = phase.checklist.length - phase.done.length;
  if (missing > 0) return failure(`Masih ada ${missing} butir checklist yang belum dicentang.`);

  await db.phaseProgress.update({
    where: { code: phase.code },
    data: { completedAt: new Date(), completedById: admin.id },
  });
  await logAudit("phase.complete", { target: phase.code, detail: `${phase.name}: ${phase.title}` });
  refresh();
  const nextPhase = PHASES[phase.index + 1];
  return success(nextPhase ? `${phase.name} selesai. ${nextPhase.name} sekarang terbuka.` : `${phase.name} selesai. Seluruh peta jalan sudah selesai!`);
}

export async function reopenPhase(code: string): Promise<ActionState> {
  await requireAdmin();
  const parsed = CodeSchema.safeParse(code);
  if (!parsed.success) return failure("Fase tidak dikenal.");
  const { states } = await getPhaseStates();
  const phase = states.find((s) => s.code === parsed.data);
  if (!phase || phase.status !== "SELESAI") return failure("Hanya fase yang sudah selesai yang bisa dibuka kembali.");
  if (!phase.canReopen) {
    return failure("Hanya fase selesai yang terakhir yang bisa dibuka kembali. Buka kembali fase sesudahnya terlebih dahulu.");
  }
  await db.phaseProgress.update({ where: { code: phase.code }, data: { completedAt: null, completedById: null } });
  await logAudit("phase.reopen", { target: phase.code, detail: `${phase.name}: ${phase.title}` });
  refresh();
  return success(`${phase.name} dibuka kembali. Fase sesudahnya terkunci lagi sampai fase ini diselesaikan.`);
}
