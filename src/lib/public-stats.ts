import "server-only";
import { db } from "@/lib/db";
import { loadAllTeachers, summarizeTeacher } from "@/lib/metrics";
import { cefrAtLeast, STUDENT_TARGET } from "@/lib/program";
import { avg, pct } from "@/lib/utils";

/**
 * Statistik agregat untuk halaman depan publik.
 * Hanya angka ringkasan (tanpa nama/data pribadi) + pengumuman yang ditandai publik.
 */
export type PublicStats = {
  teachers: number;
  students: number;
  classes: number;
  levels: { BRONZE: number; SILVER: number; GOLD: number };
  dutaPct: number; // % guru yang sudah bersertifikat Duta (Bronze+)
  silverPlusPct: number;
  eliteParticipationPct: number; // rata-rata partisipasi ELITE 30 hari terakhir (terverifikasi)
  eliteWorkdays: number;
  phraseTotal: number;
  phraseAvgMastered: number; // rata-rata kalimat Pocket Book terverifikasi per guru
  studentsOnTrackPct: number; // siswa yang sudah mencapai target CEFR akhir tahun jenjangnya
  studentsOnTrack: number;
  materials: number;
  quizAttempts: number;
  clubSessions: number;
  studentAmbassadors: number;
  competitionWins: number;
  phrases: { en: string; id: string; category: string }[];
  announcements: { id: string; title: string; body: string; createdAt: string }[];
  generatedAt: string;
};

const TTL_MS = 2 * 60 * 1000;
let memo: { at: number; data: PublicStats } | null = null;

async function compute(): Promise<PublicStats> {
  const [teachers, students, classes, phrases, materials, quizAttempts, clubSessions, competitionWins, announcements] =
    await Promise.all([
      loadAllTeachers(),
      db.student.findMany({
        where: { user: { active: true } },
        select: { cefrLevel: true, isStudentAmbassador: true, classRoom: { select: { grade: true } } },
      }),
      db.classRoom.count(),
      db.phrase.findMany({ orderBy: { number: "asc" }, select: { english: true, indonesian: true, category: true } }),
      db.material.count(),
      db.quizAttempt.count(),
      db.clubSession.count(),
      db.competitionEntry.count({ where: { result: { startsWith: "JUARA" } } }),
      db.announcement.findMany({
        where: { isPublic: true, audience: "ALL" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true, body: true, createdAt: true },
      }),
    ]);

  const summaries = teachers.map((t) => summarizeTeacher(t));
  const levels = { BRONZE: 0, SILVER: 0, GOLD: 0 };
  for (const t of teachers) if (t.ambassadorLevel in levels) levels[t.ambassadorLevel as keyof typeof levels]++;
  const certified = levels.BRONZE + levels.SILVER + levels.GOLD;

  const onTrack = students.filter((s) => {
    const target = STUDENT_TARGET[s.classRoom.grade]?.endOfYear;
    return target ? cefrAtLeast(s.cefrLevel, target) : false;
  }).length;

  return {
    teachers: teachers.length,
    students: students.length,
    classes,
    levels,
    dutaPct: pct(certified, teachers.length),
    silverPlusPct: pct(levels.SILVER + levels.GOLD, teachers.length),
    eliteParticipationPct: Math.round(avg(summaries.map((s) => s.participationPct)) ?? 0),
    eliteWorkdays: summaries[0]?.workdays ?? 0,
    phraseTotal: phrases.length,
    phraseAvgMastered: Math.round(avg(summaries.map((s) => s.phrasesMastered)) ?? 0),
    studentsOnTrackPct: pct(onTrack, students.length),
    studentsOnTrack: onTrack,
    materials,
    quizAttempts,
    clubSessions,
    studentAmbassadors: students.filter((s) => s.isStudentAmbassador).length,
    competitionWins,
    phrases: phrases.map((p) => ({ en: p.english, id: p.indonesian, category: p.category })),
    announcements: announcements.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    generatedAt: new Date().toISOString(),
  };
}

/** Di-cache di memori selama 2 menit agar halaman depan tetap cepat walau ramai pengunjung. */
export async function getPublicStats(): Promise<PublicStats> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.data;
  const data = await compute();
  memo = { at: Date.now(), data };
  return data;
}

/** Dipanggil setelah pengumuman berubah agar halaman depan langsung menampilkan versi terbaru. */
export function invalidatePublicStats() {
  memo = null;
}
