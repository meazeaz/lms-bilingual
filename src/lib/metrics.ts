import "server-only";
import { db } from "@/lib/db";
import {
  LEVEL_RULES,
  NEXT_LEVEL,
  TEACHER_POINTS,
  teacherStatus,
  competitionPoints,
  type Level,
} from "@/lib/program";
import { avg, dayKey, daysAgo, pct, workdaysBetween } from "@/lib/utils";

export const WINDOW_DAYS = 30;

const teacherInclude = {
  user: true,
  dailyLogs: { orderBy: { date: "desc" as const } },
  observations: { orderBy: { date: "desc" as const } },
  assessments: { orderBy: { date: "desc" as const } },
  phraseMasteries: true,
  challengeProgress: { include: { challenge: true } },
  badges: { include: { badge: true } },
  buddies: { include: { user: true } },
  buddy: { include: { user: true } },
} as const;

export type TeacherFull = NonNullable<Awaited<ReturnType<typeof loadTeacher>>>;

export function loadTeacher(id: string) {
  return db.teacher.findUnique({ where: { id }, include: teacherInclude });
}

export function loadAllTeachers() {
  return db.teacher.findMany({
    where: { user: { active: true } },
    include: teacherInclude,
    orderBy: { user: { name: "asc" } },
  });
}

function startOfWeek(d = new Date()) {
  const x = dayKey(d);
  const wd = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - (wd - 1));
  return x;
}

export function summarizeTeacher(t: TeacherFull, now = new Date()) {
  const from = daysAgo(WINDOW_DAYS - 1, now);
  const to = dayKey(now);
  const workdays = Math.max(1, workdaysBetween(from, to));
  const recent = t.dailyLogs.filter((l) => l.date >= from && l.date <= to);
  const approved = recent.filter((l) => l.status === "APPROVED");

  const mirror = approved.filter((l) => l.mirrorMorning).length;
  const mission = approved.filter((l) => l.dailyMission).length;
  const participationPct = Math.min(100, pct(mirror + mission, workdays * 2));

  const weekStart = startOfWeek(now);
  const zoneSessionsThisWeek = t.dailyLogs
    .filter((l) => l.date >= weekStart && l.status !== "REJECTED")
    .reduce((s, l) => s + Math.floor(l.englishZoneMinutes / 30), 0);
  const buddySessions = approved.filter((l) => l.buddySession).length;
  const onTime = approved.filter((l) => l.voiceNoteOnTime).length;

  const latestObs = t.observations[0];
  const logEnglish = avg(approved.map((l) => l.englishInClassPct).filter((v): v is number => v != null));
  const englishPct = latestObs ? latestObs.englishPct : logEnglish != null ? Math.round(logEnglish) : null;

  const phrasesMastered = t.phraseMasteries.filter((p) => p.status === "APPROVED").length;
  const phrasesPending = t.phraseMasteries.filter((p) => p.status === "PENDING").length;
  const challengesDone = t.challengeProgress.filter((c) => c.status === "APPROVED");

  const allApproved = t.dailyLogs.filter((l) => l.status === "APPROVED");
  const points =
    allApproved.reduce(
      (s, l) =>
        s +
        (l.mirrorMorning ? TEACHER_POINTS.mirrorMorning : 0) +
        (l.voiceNoteOnTime ? TEACHER_POINTS.onTimeBonus : 0) +
        (l.dailyMission ? TEACHER_POINTS.dailyMission : 0) +
        Math.floor(l.englishZoneMinutes / 30) * TEACHER_POINTS.zonePer30 +
        (l.buddySession ? TEACHER_POINTS.buddySession : 0),
      0,
    ) +
    phrasesMastered * TEACHER_POINTS.phrase +
    challengesDone.reduce((s, c) => s + c.challenge.points, 0);

  const level = t.ambassadorLevel as Level;
  const status = teacherStatus({ participationPct, englishPct, level });

  const pendingLogs = t.dailyLogs.filter((l) => l.status === "PENDING").length;
  const latestAssessment = t.assessments[0] ?? null;

  // Masa berlaku level (Bab 6.1)
  let levelExpires: Date | null = null;
  if (level !== "NONE" && t.levelSince) {
    levelExpires = new Date(t.levelSince);
    levelExpires.setMonth(levelExpires.getMonth() + LEVEL_RULES[level].validityMonths);
  }

  return {
    participationPct,
    mirrorPct: pct(mirror, workdays),
    missionPct: pct(mission, workdays),
    workdays,
    zoneSessionsThisWeek,
    buddySessions,
    onTime,
    englishPct,
    phrasesMastered,
    phrasesPending,
    challengesDone: challengesDone.length,
    points,
    status,
    pendingLogs,
    latestAssessment,
    latestObservation: latestObs ?? null,
    levelExpires,
  };
}

export type TeacherSummary = ReturnType<typeof summarizeTeacher>;

/** Checklist kesiapan naik ke level berikutnya (Bab 6.1). */
export function nextLevelReadiness(t: TeacherFull, s: TeacherSummary) {
  const next = NEXT_LEVEL[t.ambassadorLevel as Level];
  if (!next) return null;
  const r = LEVEL_RULES[next];
  const monthsAtLevel = t.levelSince ? (Date.now() - t.levelSince.getTime()) / (30 * 86400000) : 0;
  const items = [
    { label: `Partisipasi program WA ELITE ≥ ${r.waParticipationPct}%`, done: s.participationPct >= r.waParticipationPct, value: `${s.participationPct}%` },
    { label: `English Zone ${r.zoneSessionsPerWeek}×30 menit/minggu (${r.zoneArea})`, done: s.zoneSessionsThisWeek >= r.zoneSessionsPerWeek, value: `${s.zoneSessionsThisWeek} sesi minggu ini` },
    { label: `Hafal ${r.phrasesToMemorize} kalimat Pocket Book`, done: s.phrasesMastered >= r.phrasesToMemorize, value: `${s.phrasesMastered}/50` },
    { label: `Penggunaan Inggris di kelas ≥ ${r.englishTargetPct}%`, done: (s.englishPct ?? 0) >= r.englishTargetPct, value: s.englishPct != null ? `${s.englishPct}%` : "belum ada data" },
  ];
  if (next === "SILVER" || next === "GOLD") {
    items.push({ label: `Sudah ${next === "SILVER" ? "Bronze" : "Silver"} minimal 6 bulan`, done: monthsAtLevel >= 6, value: `${Math.floor(monthsAtLevel)} bulan` });
  }
  if (next === "GOLD") {
    items.push({ label: "TOEFL ≥ 550 / IELTS ≥ 6.0", done: (t.toeflScore ?? 0) >= 550, value: t.toeflScore ? `TOEFL ${t.toeflScore}` : "belum ada" });
    items.push({ label: "Mentor bagi 2 guru", done: t.buddies.length >= 2, value: `${t.buddies.length} guru` });
  }
  if (next === "SILVER") {
    items.push({ label: "Mentor bagi 1 guru Bronze", done: t.buddies.length >= 1, value: `${t.buddies.length} guru` });
  }
  return { next, items, ready: items.filter((i) => i.done).length, total: items.length };
}

/** Lencana digital otomatis (Bab 6.4). Dipanggil setelah admin memverifikasi data. */
export async function syncTeacherBadges(teacherId: string) {
  const t = await loadTeacher(teacherId);
  if (!t) return;
  const s = summarizeTeacher(t);
  const badges = await db.badge.findMany({ where: { audience: "TEACHER" } });
  const byCode = new Map(badges.map((b) => [b.code, b]));
  const passed = t.assessments.filter((a) => a.passed);
  const scores = [...t.assessments].reverse().map((a) => a.finalScore);
  const cefrHist = await db.cefrRecord.findMany({ where: { teacherId }, orderBy: { date: "asc" } });
  const toefls = cefrHist.map((c) => c.toefl).filter((v): v is number => v != null);

  const earned: Record<string, boolean> = {
    ENGLISH_STARTER: passed.some((a) => a.awardedLevel !== "NONE"),
    ENGLISH_PRACTITIONER: passed.some((a) => a.awardedLevel === "SILVER" || a.awardedLevel === "GOLD"),
    ENGLISH_LEADER: passed.some((a) => a.awardedLevel === "GOLD"),
    EARLY_BIRD: t.dailyLogs.filter((l) => l.status === "APPROVED" && l.voiceNoteOnTime).length >= 10,
    MOST_IMPROVED: scores.length >= 2 && scores[scores.length - 1] - scores[0] >= 10,
    TOEFL_CHALLENGER: (toefls.length >= 2 && toefls[toefls.length - 1] - toefls[0] > 50) || (t.toeflScore ?? 0) >= 550,
    COLLABORATION: t.dailyLogs.filter((l) => l.status === "APPROVED" && l.buddySession).length >= 8,
    POCKET_MASTER: s.phrasesMastered >= 50,
    CHALLENGE_CHAMPION: s.challengesDone >= 12,
    FULL_PARTICIPATION: s.participationPct >= 100,
  };

  const have = new Set(t.badges.map((b) => b.badge.code));
  for (const [code, ok] of Object.entries(earned)) {
    const badge = byCode.get(code);
    if (ok && badge && !have.has(code)) {
      await db.teacherBadge.create({ data: { teacherId, badgeId: badge.id } });
    }
  }
}

/** Poin & ringkasan siswa. */
export async function studentPoints(studentId: string) {
  const [attempts, attendances, entries] = await Promise.all([
    db.quizAttempt.findMany({ where: { studentId }, include: { quiz: true } }),
    db.clubAttendance.findMany({ where: { studentId, present: true } }),
    db.competitionEntry.findMany({ where: { studentId }, include: { competition: true } }),
  ]);
  const bestPerQuiz = new Map<string, number>();
  for (const a of attempts) bestPerQuiz.set(a.quizId, Math.max(bestPerQuiz.get(a.quizId) ?? 0, a.score));
  const quizPoints = [...bestPerQuiz.entries()].reduce((s, [quizId, score]) => {
    const pass = attempts.find((a) => a.quizId === quizId)?.quiz.passScore ?? 70;
    return s + (score >= pass ? 10 : 3);
  }, 0);
  const clubPoints = attendances.reduce((s, a) => s + (a.role === "TUTOR" ? 5 : 3), 0);
  const compPoints = entries.reduce((s, e) => s + e.points, 0);
  return {
    total: quizPoints + clubPoints + compPoints,
    quizPoints,
    clubPoints,
    compPoints,
    quizzesPassed: [...bestPerQuiz.entries()].filter(([qid, sc]) => sc >= (attempts.find((a) => a.quizId === qid)?.quiz.passScore ?? 70)).length,
    attendance: attendances.length,
    competitions: entries.length,
  };
}

export { competitionPoints };
