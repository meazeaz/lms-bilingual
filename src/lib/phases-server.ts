import "server-only";
import { db } from "@/lib/db";
import { PHASES, type Phase } from "@/lib/program";
import { parseJson } from "@/lib/utils";

export type PhaseStatus = "SELESAI" | "BERJALAN" | "TERKUNCI";

export type PhaseState = Phase & {
  index: number;
  status: PhaseStatus;
  materialRead: boolean;
  done: string[];
  completedAt: Date | null;
  completedByName: string | null;
  /** Semua syarat terpenuhi sehingga fase boleh ditandai selesai. */
  ready: boolean;
  /** Fase ini boleh dibuka kembali (hanya fase selesai terakhir). */
  canReopen: boolean;
};

/**
 * Status Peta Jalan untuk seluruh sekolah. Berurutan: sebuah fase hanya terbuka
 * bila semua fase sebelumnya sudah diselesaikan admin.
 */
export async function getPhaseStates() {
  const rows = await db.phaseProgress.findMany({ include: { completedBy: { select: { name: true } } } });
  const byCode = new Map(rows.map((r) => [r.code, r]));

  let unlocked = true;
  const states: PhaseState[] = PHASES.map((p, index) => {
    const row = byCode.get(p.code);
    const validIds = new Set(p.checklist.map((c) => c.id));
    const done = parseJson<string[]>(row?.checklist, []).filter((id) => validIds.has(id));
    const completed = unlocked && Boolean(row?.completedAt);
    const status: PhaseStatus = !unlocked ? "TERKUNCI" : completed ? "SELESAI" : "BERJALAN";
    if (!completed) unlocked = false;
    const materialRead = Boolean(row?.materialRead);
    return {
      ...p,
      index,
      status,
      materialRead,
      done,
      completedAt: completed ? (row?.completedAt ?? null) : null,
      completedByName: completed ? (row?.completedBy?.name ?? null) : null,
      ready: status === "BERJALAN" && materialRead && done.length === p.checklist.length,
      canReopen: false,
    };
  });

  const lastDone = states.findLastIndex((s) => s.status === "SELESAI");
  if (lastDone >= 0) states[lastDone].canReopen = true;

  const current = states.find((s) => s.status === "BERJALAN") ?? null;
  const completedCount = states.filter((s) => s.status === "SELESAI").length;
  return { states, current, completedCount, allDone: completedCount === states.length };
}

/** Fase yang sedang dikerjakan (atau fase terakhir bila semuanya selesai). */
export async function getCurrentPhase() {
  const { current, states } = await getPhaseStates();
  return current ?? states[states.length - 1];
}
