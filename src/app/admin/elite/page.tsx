import type { Metadata } from "next";
import { Sunrise } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CURATED_TEMPLATES } from "@/lib/elite-prompts";
import { getAllScheduledPrompts, getDailyPrompt } from "@/lib/elite-prompts-server";
import { dayKey, daysAgo, formatLongDate, toInputDate, workdaysBetween } from "@/lib/utils";
import { EliteProgramClient, type TeacherDailyStatus, type TeacherStreakRanking } from "./elite-client";

export const metadata: Metadata = {
  title: "ELITE Program · Papan Kendali & Monitoring Harian",
};

export default async function AdminElitePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAdmin();
  const { date } = await searchParams;

  const today = dayKey();
  const dateStr = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toInputDate(today);
  const targetDateObj = new Date(dateStr + "T00:00:00Z");

  const [teachers, scheduledPrompts] = await Promise.all([
    db.teacher.findMany({
      where: { user: { active: true } },
      include: {
        user: { select: { name: true, email: true } },
        buddy: { include: { user: { select: { name: true } } } },
        dailyLogs: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { user: { name: "asc" } },
    }),
    getAllScheduledPrompts(),
  ]);

  const activePrompt = getDailyPrompt(targetDateObj);

  // Status live harian per guru untuk tanggal yang dipilih
  const teachersStatus: TeacherDailyStatus[] = teachers.map((t) => {
    const log = t.dailyLogs.find((l) => toInputDate(l.date) === dateStr);

    return {
      teacherId: t.id,
      name: t.user.name,
      email: t.user.email,
      subject: t.subject,
      level: t.ambassadorLevel,
      whatsapp: t.whatsapp,
      isPilot: t.isPilot,
      buddyName: t.buddy?.user.name ?? null,
      logId: log?.id,
      submitted: Boolean(log),
      mirrorMorning: log?.mirrorMorning ?? false,
      voiceNoteOnTime: log?.voiceNoteOnTime ?? false,
      dailyMission: log?.dailyMission ?? false,
      missionAnswer: log?.missionAnswer ?? null,
      englishZoneMinutes: log?.englishZoneMinutes ?? 0,
      buddySession: log?.buddySession ?? false,
      buddyNote: log?.buddyNote ?? null,
      status: log?.status,
      submittedAt: log ? toInputDate(log.createdAt) : undefined,
    };
  });

  // Hitung leaderboard streak & keaktifan 30 hari terakhir
  const thirtyDaysAgo = daysAgo(30, today);
  const workdays30 = Math.max(1, workdaysBetween(thirtyDaysAgo, today));

  const leaderboard: TeacherStreakRanking[] = teachers.map((t) => {
    // 1. Hitung Streak berturut-turut (hari aktif)
    const sortedLogs = [...t.dailyLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let checkDate = new Date(today);

    // Jika hari ini belum setor, cek dari kemarin
    const hasToday = sortedLogs.some((l) => toInputDate(l.date) === toInputDate(today));
    if (!hasToday) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    for (let i = 0; i < 45; i++) {
      // Lewati akhir pekan (Sabtu/Ahad)
      const dow = checkDate.getUTCDay();
      if (dow === 0 || dow === 6) {
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        continue;
      }

      const dateKey = toInputDate(checkDate);
      const log = sortedLogs.find((l) => toInputDate(l.date) === dateKey);

      if (log && (log.mirrorMorning || log.dailyMission)) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    // 2. Partisipasi 30 hari terakhir
    const recentLogs = t.dailyLogs.filter((l) => l.date >= thirtyDaysAgo && l.date <= today);
    const approvedLogs = recentLogs.filter((l) => l.status === "APPROVED");
    const mirrorCount = approvedLogs.filter((l) => l.mirrorMorning).length;
    const missionCount = approvedLogs.filter((l) => l.dailyMission).length;
    const monthlyPct = Math.min(100, Math.round(((mirrorCount + missionCount) / (workdays30 * 2)) * 100));
    const totalOnTime = approvedLogs.filter((l) => l.voiceNoteOnTime).length;

    return {
      teacherId: t.id,
      name: t.user.name,
      subject: t.subject,
      level: t.ambassadorLevel,
      streakDays: Math.max(streak, t.dailyLogs.length > 0 ? 1 : 0),
      monthlyParticipationPct: monthlyPct,
      totalLogs: recentLogs.length,
      totalOnTime,
      buddyName: t.buddy?.user.name ?? null,
      whatsapp: t.whatsapp,
    };
  });

  // Urutkan leaderboard: streak tertinggi, lalu persentase bulanan
  leaderboard.sort((a, b) => {
    if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
    return b.monthlyParticipationPct - a.monthlyParticipationPct;
  });

  return (
    <>
      <PageHeader
        eyebrow="Fase 1 & Fase 2 · Pembiasaan Bahasa Inggris Harian (ELITE WhatsApp Habit)"
        title="ELITE Program · Papan Kendali & Monitoring Harian"
        description={`Pantau setoran Mirror Morning & Misi Harian guru, kelola jadwal posting, dan salin siaran WhatsApp otomatis untuk tanggal ${formatLongDate(
          targetDateObj
        )}.`}
      />

      <EliteProgramClient
        dateStr={dateStr}
        teachersStatus={teachersStatus}
        activePrompt={activePrompt}
        curatedTemplates={CURATED_TEMPLATES}
        scheduledPrompts={scheduledPrompts}
        leaderboard={leaderboard}
      />
    </>
  );
}
