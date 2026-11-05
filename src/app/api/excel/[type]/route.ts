import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { addStyledSheet, fileDate, newWorkbook, xlsxResponse } from "@/lib/excel";
import { IMPORT_GUIDE, STUDENT_COLUMNS, STUDENT_EXAMPLE, TEACHER_COLUMNS, TEACHER_EXAMPLE } from "@/lib/import-spec";
import { loadAllTeachers, summarizeTeacher } from "@/lib/metrics";
import { LEVEL_LABEL, STUDENT_ASSESSMENT_TYPES, STUDENT_TARGET, cefrAtLeast, type Level } from "@/lib/program";
import { getSchoolSubjects } from "@/lib/settings-server";

const yesNo = (b: boolean) => (b ? "Ya" : "Tidak");
const dateOnly = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

const LABELS: Record<string, string> = {
  "template-guru": "Templat impor guru",
  "template-siswa": "Templat impor siswa",
  guru: "Direktori guru",
  siswa: "Direktori siswa",
  nilai: "Nilai siswa",
  elite: "Laporan ELITE harian",
};

/** Unduhan Excel untuk admin: templat impor dan ekspor data. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/excel/[type]">) {
  const user = await getCurrentUser();
  if (!user) return new Response("Silakan login terlebih dahulu.", { status: 401 });
  if (user.role !== "ADMIN") return new Response("Hanya admin yang dapat mengunduh data ini.", { status: 403 });

  const { type } = await ctx.params;
  if (!(type in LABELS)) return new Response("Jenis unduhan tidak dikenal.", { status: 404 });
  const sp = req.nextUrl.searchParams;
  const wb = newWorkbook();

  if (type === "template-guru" || type === "template-siswa") {
    const isTeacher = type === "template-guru";
    addStyledSheet(wb, "Data", isTeacher ? TEACHER_COLUMNS : STUDENT_COLUMNS, [isTeacher ? TEACHER_EXAMPLE : STUDENT_EXAMPLE]);
    const guide = wb.addWorksheet("Petunjuk");
    guide.getColumn(1).width = 100;
    guide.addRow([`Petunjuk impor ${isTeacher ? "guru" : "siswa"} · LMS Bilingual 2028`]).font = { bold: true, size: 14 };
    guide.addRow([]);
    IMPORT_GUIDE.forEach((l) => guide.addRow([l]));
    if (isTeacher) {
      guide.addRow([]);
      guide.addRow(["Daftar mata pelajaran yang terdaftar di LMS:"]).font = { bold: true };
      (await getSchoolSubjects()).forEach((s) => guide.addRow([`• ${s}`]));
    } else {
      guide.addRow([]);
      guide.addRow(["Kelas yang sudah ada di LMS:"]).font = { bold: true };
      (await db.classRoom.findMany({ orderBy: { name: "asc" } })).forEach((c) => guide.addRow([`• ${c.name}`]));
    }
    return xlsxResponse(wb, `templat-impor-${isTeacher ? "guru" : "siswa"}.xlsx`);
  }

  if (type === "guru") {
    const teachers = await loadAllTeachers();
    const rows = teachers.map((t) => {
      const s = summarizeTeacher(t);
      return {
        nama: t.user.name, email: t.user.email, nip: t.nip ?? "", mapel: t.subject, wa: t.whatsapp ?? "",
        cefr: t.cefrLevel, toefl: t.toeflScore ?? "", level: LEVEL_LABEL[t.ambassadorLevel as Level], since: dateOnly(t.levelSince),
        pilot: yesNo(t.isPilot), buddy: t.buddy?.user.name ?? "", elite: s.participationPct, english: s.englishPct ?? "",
        phrases: s.phrasesMastered, points: s.points, status: s.status.label, login: dateOnly(t.user.lastLoginAt),
      };
    });
    addStyledSheet(wb, "Guru", [
      { header: "Nama", key: "nama", width: 30 }, { header: "Email", key: "email", width: 30 }, { header: "NIP", key: "nip", width: 20 },
      { header: "Mata Pelajaran", key: "mapel", width: 18 }, { header: "WhatsApp", key: "wa", width: 16 }, { header: "CEFR", key: "cefr", width: 8 },
      { header: "TOEFL", key: "toefl", width: 8 }, { header: "Level Duta", key: "level", width: 20 }, { header: "Level Sejak", key: "since", width: 12 },
      { header: "Pilot", key: "pilot", width: 8 }, { header: "English Buddy", key: "buddy", width: 24 },
      { header: "Partisipasi ELITE 30 hari (%)", key: "elite", width: 14 }, { header: "% Inggris di Kelas", key: "english", width: 12 },
      { header: "Pocket Book Dihafal", key: "phrases", width: 12 }, { header: "Poin", key: "points", width: 8 },
      { header: "Status", key: "status", width: 20 }, { header: "Login Terakhir", key: "login", width: 14 },
    ], rows);
  }

  if (type === "siswa") {
    const students = await db.student.findMany({
      include: { user: true, classRoom: true },
      orderBy: [{ classRoom: { name: "asc" } }, { user: { name: "asc" } }],
    });
    addStyledSheet(wb, "Siswa", [
      { header: "Nama", key: "nama", width: 30 }, { header: "Email", key: "email", width: 34 }, { header: "NIS", key: "nis", width: 14 },
      { header: "Kelas", key: "kelas", width: 8 }, { header: "Jenjang", key: "grade", width: 8 }, { header: "CEFR", key: "cefr", width: 8 },
      { header: "Target Akhir Tahun", key: "target", width: 12 }, { header: "Capai Target", key: "ontrack", width: 12 },
      { header: "Alumni Pare", key: "pare", width: 10 }, { header: "Student Ambassador", key: "amb", width: 12 },
      { header: "Akun Aktif", key: "active", width: 10 }, { header: "Login Terakhir", key: "login", width: 14 },
    ], students.map((s) => {
      const target = STUDENT_TARGET[s.classRoom.grade]?.endOfYear ?? "";
      return {
        nama: s.user.name, email: s.user.email, nis: s.nis ?? "", kelas: s.classRoom.name, grade: s.classRoom.grade, cefr: s.cefrLevel,
        target, ontrack: yesNo(target ? cefrAtLeast(s.cefrLevel, target) : false), pare: yesNo(s.pareAlumni),
        amb: yesNo(s.isStudentAmbassador), active: yesNo(s.user.active), login: dateOnly(s.user.lastLoginAt),
      };
    }));
  }

  if (type === "nilai") {
    const semester = sp.get("semester") || undefined;
    const records = await db.studentAssessment.findMany({
      where: semester ? { semester } : {},
      include: { student: { include: { user: true, classRoom: true } }, teacher: { include: { user: true } } },
      orderBy: [{ date: "desc" }],
    });
    addStyledSheet(wb, "Nilai", [
      { header: "Tanggal", key: "date", width: 12 }, { header: "Semester", key: "semester", width: 18 }, { header: "Kelas", key: "kelas", width: 8 },
      { header: "NIS", key: "nis", width: 14 }, { header: "Nama Siswa", key: "nama", width: 28 }, { header: "Jenis Asesmen", key: "type", width: 22 },
      { header: "Skor", key: "score", width: 8 }, { header: "CEFR", key: "cefr", width: 8 }, { header: "Listening", key: "l", width: 10 },
      { header: "Speaking", key: "s", width: 10 }, { header: "Reading", key: "r", width: 10 }, { header: "Writing", key: "w", width: 10 },
      { header: "Use of English", key: "u", width: 12 }, { header: "Guru Penilai", key: "guru", width: 26 }, { header: "Catatan", key: "notes", width: 40 },
    ], records.map((r) => ({
      date: dateOnly(r.date), semester: r.semester, kelas: r.student.classRoom.name, nis: r.student.nis ?? "", nama: r.student.user.name,
      type: STUDENT_ASSESSMENT_TYPES[r.type] ?? r.type, score: r.score, cefr: r.cefrLevel, l: r.listening ?? "", s: r.speaking ?? "",
      r: r.reading ?? "", w: r.writing ?? "", u: r.useOfEnglish ?? "", guru: r.teacher.user.name, notes: r.notes ?? "",
    })));
  }

  if (type === "elite") {
    // ?month=YYYY-MM (default bulan berjalan)
    const month = /^\d{4}-\d{2}$/.test(sp.get("month") ?? "") ? sp.get("month")! : fileDate().slice(0, 7);
    const from = new Date(`${month}-01T00:00:00Z`);
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + 1);
    const logs = await db.dailyLog.findMany({
      where: { date: { gte: from, lt: to } },
      include: { teacher: { include: { user: true } } },
      orderBy: [{ date: "asc" }, { teacher: { user: { name: "asc" } } }],
    });
    const STATUS: Record<string, string> = { PENDING: "Menunggu", APPROVED: "Terverifikasi", REJECTED: "Ditolak" };
    addStyledSheet(wb, `ELITE ${month}`, [
      { header: "Tanggal", key: "date", width: 12 }, { header: "Guru", key: "guru", width: 28 }, { header: "Mapel", key: "mapel", width: 16 },
      { header: "Mirror Morning", key: "mm", width: 10 }, { header: "Tepat Waktu", key: "ontime", width: 10 }, { header: "Misi Harian", key: "mission", width: 10 },
      { header: "English Zone (menit)", key: "zone", width: 12 }, { header: "Sesi Buddy", key: "buddy", width: 10 },
      { header: "% Inggris di Kelas", key: "pct", width: 12 }, { header: "Status", key: "status", width: 14 }, { header: "Catatan Reviewer", key: "note", width: 36 },
    ], logs.map((l) => ({
      date: dateOnly(l.date), guru: l.teacher.user.name, mapel: l.teacher.subject, mm: yesNo(l.mirrorMorning), ontime: yesNo(l.voiceNoteOnTime),
      mission: yesNo(l.dailyMission), zone: l.englishZoneMinutes, buddy: yesNo(l.buddySession), pct: l.englishInClassPct ?? "",
      status: STATUS[l.status] ?? l.status, note: l.reviewNote ?? "",
    })));
  }

  await logAudit("export.download", { actorId: user.id, target: LABELS[type], detail: sp.toString() || null });
  return xlsxResponse(wb, `${type}-${fileDate()}.xlsx`);
}
