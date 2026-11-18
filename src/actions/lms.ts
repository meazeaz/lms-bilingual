"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireStudent, requireTeacher, getCurrentUser } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action-state";
import { syncTeacherBadges } from "@/lib/metrics";
import { logAudit } from "@/lib/audit";
import { invalidatePublicStats } from "@/lib/public-stats";
import {
  awardedLevel,
  cefrFromToefl,
  competitionPoints,
  finalScore,
  microResult,
  oralScore,
  simulationScore,
  ENGLISH_PCT_BUCKETS,
  STUDENT_TARGET,
  type Level,
} from "@/lib/program";
import { answerMatches, dayKey, parseJson } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";
import { readAloudScore, respondScore } from "@/lib/speaking";

// ───────────── Guru: laporan ELITE harian ─────────────
export async function saveDailyLog(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const date = dayKey(String(fd.get("date") || "") || new Date());
  if (date > dayKey()) return failure("Tanggal tidak boleh di masa depan.");
  const data = {
    mirrorMorning: fd.get("mirrorMorning") === "on",
    voiceNoteOnTime: fd.get("voiceNoteOnTime") === "on",
    dailyMission: fd.get("dailyMission") === "on",
    missionAnswer: String(fd.get("missionAnswer") || "").trim() || null,
    englishZoneMinutes: Math.max(0, Math.min(300, Number(fd.get("englishZoneMinutes") || 0))),
    buddySession: fd.get("buddySession") === "on",
    buddyNote: String(fd.get("buddyNote") || "").trim() || null,
    englishInClassPct: fd.get("englishInClassPct") ? Math.max(0, Math.min(100, Number(fd.get("englishInClassPct")))) : null,
  };
  if (!data.mirrorMorning && !data.dailyMission && !data.englishZoneMinutes && !data.buddySession) {
    return failure("Centang minimal satu kegiatan sebelum mengirim laporan.");
  }
  if (data.dailyMission && !data.missionAnswer) return failure("Tulis jawaban Misi Harian dalam bahasa Inggris.");
  await db.dailyLog.upsert({
    where: { teacherId_date: { teacherId: teacher.id, date } },
    create: { teacherId: teacher.id, date, ...data },
    update: { ...data, status: "PENDING", reviewNote: null },
  });
  revalidatePath("/guru", "layout");
  return success("Laporan tersimpan dan menunggu verifikasi EDT.");
}

// ───────────── Admin: verifikasi ─────────────
export async function reviewLog(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("id"));
  const decision = fd.get("decision") === "approve" ? "APPROVED" : "REJECTED";
  const log = await db.dailyLog.update({
    where: { id },
    data: { status: decision, reviewerId: admin.id, reviewNote: String(fd.get("note") || "") || null },
  });
  await syncTeacherBadges(log.teacherId);
  revalidatePath("/admin", "layout");
}

export async function approveAllLogs() {
  const admin = await requireAdmin();
  const pending = await db.dailyLog.findMany({ where: { status: "PENDING" }, select: { teacherId: true } });
  await db.dailyLog.updateMany({ where: { status: "PENDING" }, data: { status: "APPROVED", reviewerId: admin.id } });
  for (const id of new Set(pending.map((p) => p.teacherId))) await syncTeacherBadges(id);
  revalidatePath("/admin", "layout");
}

// ───────────── Admin: asesmen Duta Inggris ─────────────
const score = z.coerce.number().int().min(1).max(4);
const AssessmentSchema = z.object({
  teacherId: z.string().min(1, "Pilih guru yang diasesmen"),
  targetLevel: z.enum(["BRONZE", "SILVER", "GOLD"]),
  date: z.string().min(1, "Isi tanggal asesmen"),
  secondExaminer: z.string().optional(),
  oralFluency: score, oralPronunciation: score, oralGrammar: score, oralVocabulary: score, oralConfidence: score,
  writtenScore: z.coerce.number().min(0, "Nilai tertulis 0–100").max(100, "Nilai tertulis 0–100").optional(),
  simInstruction: score, simAdaptation: score, simConsistency: score, simClarity: score,
  strengths: z.string().optional(),
  improvements: z.string().optional(),
});

export async function createAssessment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(fd);
  if (raw.writtenScore === "") delete raw.writtenScore;
  const parsed = AssessmentSchema.safeParse(raw);
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const d = parsed.data;
  const teacher = await db.teacher.findUnique({ where: { id: d.teacherId } });
  if (!teacher) return failure("Guru tidak ditemukan.");

  const toeflGold = (teacher.toeflScore ?? 0) >= 550;
  const waived = d.targetLevel === "GOLD" && toeflGold && d.writtenScore == null;
  if (!waived && d.writtenScore == null) return failure("Isi nilai tes tertulis (0–100).");
  const written = waived ? 100 : d.writtenScore!;
  const oral = oralScore([d.oralFluency, d.oralPronunciation, d.oralGrammar, d.oralVocabulary, d.oralConfidence]);
  const sim = simulationScore([d.simInstruction, d.simAdaptation, d.simConsistency, d.simClarity]);
  const final = finalScore(oral, written, sim);
  const level = awardedLevel(final, d.targetLevel, toeflGold);

  await db.assessment.create({
    data: {
      teacherId: d.teacherId, assessorId: admin.id, secondExaminer: d.secondExaminer || null, date: dayKey(d.date), targetLevel: d.targetLevel,
      oralFluency: d.oralFluency, oralPronunciation: d.oralPronunciation, oralGrammar: d.oralGrammar, oralVocabulary: d.oralVocabulary, oralConfidence: d.oralConfidence,
      oralScore: oral, writtenScore: written, writtenWaived: waived,
      simInstruction: d.simInstruction, simAdaptation: d.simAdaptation, simConsistency: d.simConsistency, simClarity: d.simClarity, simulationScore: sim,
      finalScore: final, passed: level !== "NONE", awardedLevel: level, strengths: d.strengths || null, improvements: d.improvements || null,
    },
  });
  const order = ["NONE", "BRONZE", "SILVER", "GOLD"];
  if (order.indexOf(level) > order.indexOf(teacher.ambassadorLevel)) {
    await db.teacher.update({ where: { id: teacher.id }, data: { ambassadorLevel: level, levelSince: dayKey(d.date) } });
  }
  await syncTeacherBadges(teacher.id);
  revalidatePath("/admin", "layout");
  const label = level === "NONE" ? "belum memenuhi syarat" : `lulus sebagai ${level[0]}${level.slice(1).toLowerCase()} Ambassador`;
  return success(`Nilai akhir ${final} (lisan ${oral}, tertulis ${written}, simulasi ${Math.round(sim * 10) / 10}). Guru ${label}.`);
}

// ───────────── Siswa: kuis ─────────────
export async function submitQuiz(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { student } = await requireStudent();
  const quiz = await db.quiz.findUnique({ where: { id: String(fd.get("quizId")) } });
  if (!quiz) return failure("Kuis tidak ditemukan.");
  const questions = parseJson<QuizQuestion[]>(quiz.questions, []);
  if (questions.length === 0) return failure("Tidak ada butir soal dalam kuis ini.");

  let totalEarned = 0;
  const recordedAnswers: any[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const type = q.type || "MULTIPLE_CHOICE";
    const rawVal = fd.get(`q${i}`);

    if (type === "MULTIPLE_CHOICE") {
      if (rawVal == null) return failure(`Soal nomor ${i + 1} belum dijawab.`);
      const ansNum = Number(rawVal);
      const isCorrect = ansNum === q.answer;
      if (isCorrect) totalEarned += 1;
      recordedAnswers.push({ questionIndex: i, type, answer: ansNum, isCorrect });
    } else if (type === "READING") {
      if (q.readingFormat === "FILL_IN") {
        const textAns = String(rawVal || "").trim();
        if (!textAns) return failure(`Soal reading nomor ${i + 1} belum diisi.`);
        const isCorrect = answerMatches(textAns, [q.fillInAnswer, ...(q.acceptedAnswers || [])]);
        if (isCorrect) totalEarned += 1;
        recordedAnswers.push({ questionIndex: i, type, format: "FILL_IN", answer: textAns, isCorrect });
      } else {
        if (rawVal == null) return failure(`Soal reading nomor ${i + 1} belum dijawab.`);
        const ansNum = Number(rawVal);
        const isCorrect = ansNum === q.answer;
        if (isCorrect) totalEarned += 1;
        recordedAnswers.push({ questionIndex: i, type, format: "MC", answer: ansNum, isCorrect });
      }
    } else if (type === "SPEAKING") {
      const spoken = String(rawVal || "").trim();
      if (!spoken) return failure(`Soal speaking nomor ${i + 1} belum dijawab. Tekan tombol mikrofon lalu ucapkan jawabanmu.`);
      const method = fd.get(`q${i}_method`) === "typed" ? "typed" : "speech";
      // Jawaban speaking yang diketik (bukan diucapkan) dinilai 0; teksnya tetap disimpan untuk guru.
      const typed = method === "typed";
      if (q.speakingMode === "RESPOND") {
        const r = respondScore(spoken, q.minWords || 10, q.targetKeywords || []);
        const earned = typed ? 0 : r.score;
        totalEarned += earned;
        recordedAnswers.push({ questionIndex: i, type, mode: "RESPOND", answer: spoken, method, wordCount: r.wordCount, score: Math.round(earned * 100) });
      } else {
        const r = readAloudScore(q.targetText || "", spoken);
        const earned = typed ? 0 : r.score;
        totalEarned += earned;
        recordedAnswers.push({ questionIndex: i, type, mode: "READ_ALOUD", answer: spoken, method, accuracy: Math.round(r.accuracy * 100), score: Math.round(earned * 100) });
      }
    } else if (type === "LISTENING") {
      if (q.listeningFormat === "FILL_IN") {
        const textAns = String(rawVal || "").trim();
        if (!textAns) return failure(`Soal listening nomor ${i + 1} belum diisi.`);
        const isCorrect = answerMatches(textAns, [q.fillInAnswer, ...(q.acceptedAnswers || [])]);
        if (isCorrect) totalEarned += 1;
        recordedAnswers.push({ questionIndex: i, type, format: "FILL_IN", answer: textAns, isCorrect });
      } else {
        if (rawVal == null) return failure(`Soal listening nomor ${i + 1} belum dijawab.`);
        const ansNum = Number(rawVal);
        const isCorrect = ansNum === q.answer;
        if (isCorrect) totalEarned += 1;
        recordedAnswers.push({ questionIndex: i, type, format: "MC", answer: ansNum, isCorrect });
      }
    } else if (type === "WRITING") {
      const textAns = String(rawVal || "").trim();
      const minWords = q.minWords || 10;
      const words = textAns.split(/\s+/).filter(Boolean);
      if (words.length === 0) return failure(`Soal writing nomor ${i + 1} belum diisi.`);

      const keywords = (q.targetKeywords || []).map((k) => k.trim().toLowerCase()).filter(Boolean);
      let writingScore = 0;

      if (words.length >= minWords) {
        // Pemenuhan kuota kata dasar
        writingScore += 0.5;
        // Penilaian keberadaan kosakata target
        if (keywords.length > 0) {
          const found = keywords.filter((k) => textAns.toLowerCase().includes(k));
          writingScore += 0.5 * (found.length / keywords.length);
        } else {
          writingScore += 0.5;
        }
      } else {
        // Skor proporsional jika jumlah kata belum mencapai target minimal
        writingScore += 0.4 * (words.length / minWords);
      }

      totalEarned += writingScore;
      recordedAnswers.push({
        questionIndex: i,
        type,
        answer: textAns,
        wordCount: words.length,
        score: Math.round(writingScore * 100),
      });
    } else if (type === "FILL_IN") {
      const textAns = String(rawVal || "").trim();
      if (!textAns) return failure(`Soal isian nomor ${i + 1} belum diisi.`);

      const accepted = [
        q.fillInAnswer,
        ...(q.acceptedAnswers || []),
      ]
        .map((a) => String(a || "").trim())
        .filter(Boolean);

      const isCorrect = answerMatches(textAns, accepted, Boolean(q.caseSensitive));

      if (isCorrect) totalEarned += 1;
      recordedAnswers.push({
        questionIndex: i,
        type: "FILL_IN",
        answer: textAns,
        isCorrect,
        accepted,
      });
    }
  }

  const value = Math.round((totalEarned / questions.length) * 100);
  await db.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: student.id,
      score: value,
      answers: JSON.stringify(recordedAnswers),
    },
  });
  await db.materialRead.upsert({
    where: { studentId_materialId: { studentId: student.id, materialId: quiz.materialId } },
    create: { studentId: student.id, materialId: quiz.materialId },
    update: {},
  });
  revalidatePath("/siswa", "layout");
  return value >= quiz.passScore
    ? success(`Nilai ${value}. Hebat, kamu berhasil lulus kuis ini (Batas lulus ${quiz.passScore})!`)
    : failure(`Nilai ${value}. Batas lulus ${quiz.passScore}, silakan pelajari kembali materi dan coba lagi ya.`);
}

// ───────────── Guru: Terima Hasil Asesmen ─────────────
export async function acknowledgeAssessment(fd: FormData) {
  const { teacher } = await requireTeacher();
  const id = String(fd.get("assessmentId"));
  const assessment = await db.assessment.findUnique({ where: { id } });
  if (!assessment || assessment.teacherId !== teacher.id) return;
  await db.assessment.update({
    where: { id },
    data: { acknowledged: true },
  });
  revalidatePath("/guru", "layout");
}

// ───────────── Guru: Formulir Banding (Lampiran 7) ─────────────
const AppealSchema = z.object({
  assessmentId: z.string().min(1, "ID asesmen wajib ada"),
  reasonType: z.enum(["PROSEDUR", "BOBOT", "INFO_BARU", "NILAI", "LAINNYA"]),
  explanation: z.string().min(10, "Penjelasan banding minimal 10 karakter"),
  evidence: z.string().optional(),
  request: z.enum(["ASESMEN_ULANG", "KOREKSI_NILAI", "PENJELASAN"]),
});

export async function submitAppeal(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const parsed = AppealSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const d = parsed.data;

  const assessment = await db.assessment.findUnique({
    where: { id: d.assessmentId },
    include: { appeals: true },
  });
  if (!assessment || assessment.teacherId !== teacher.id) {
    return failure("Data asesmen tidak ditemukan.");
  }

  // Cek batas 7 hari
  const diffDays = (Date.now() - assessment.date.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 7) {
    return failure("Batas waktu pengajuan banding adalah maksimal 7 hari sejak tanggal asesmen.");
  }

  // Cek apakah sudah pernah mengajukan banding yang masih berjalan
  const activeAppeal = assessment.appeals.find((a) => a.status === "DIAJUKAN");
  if (activeAppeal) {
    return failure("Permohonan banding untuk asesmen ini sudah diajukan dan sedang diproses.");
  }

  await db.appeal.create({
    data: {
      assessmentId: d.assessmentId,
      reasonType: d.reasonType,
      explanation: d.explanation,
      evidence: d.evidence || null,
      request: d.request,
      status: "DIAJUKAN",
    },
  });

  revalidatePath("/guru", "layout");
  revalidatePath("/admin", "layout");
  return success("Permohonan banding berhasil diajukan. Tim Banding akan memproses maksimal 14 hari kerja.");
}

// ───────────── Guru: Pendaftaran Duta Inggris (Lampiran 6) ─────────────
const RegSchema = z.object({
  targetLevel: z.enum(["BRONZE", "SILVER", "GOLD"]),
  motivation: z.string().min(10, "Tuliskan motivasi & tantangan minimal 10 karakter"),
  hoursPerWeek: z.string().min(1, "Pilih alokasi waktu per minggu"),
  readyToMentor: z.string().optional(),
  commitmentAgreement: z.string().min(1, "Anda wajib menyetujui pernyataan komitmen"),
});

export async function submitRegistration(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const raw = Object.fromEntries(fd);
  const parsed = RegSchema.safeParse(raw);
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const d = parsed.data;

  // Cek apakah ada pendaftaran yang masih PENDING
  const pendingReg = await db.ambassadorRegistration.findFirst({
    where: { teacherId: teacher.id, status: "PENDING" },
  });
  if (pendingReg) {
    return failure("Anda sudah memiliki pendaftaran yang sedang menunggu verifikasi EDT.");
  }

  await db.ambassadorRegistration.create({
    data: {
      teacherId: teacher.id,
      targetLevel: d.targetLevel,
      motivation: d.motivation,
      hoursPerWeek: d.hoursPerWeek,
      readyToMentor: d.readyToMentor === "on",
      commitmentAgreement: true,
      status: "PENDING",
    },
  });

  revalidatePath("/guru", "layout");
  revalidatePath("/admin", "layout");
  return success("Pendaftaran Duta Inggris berhasil diajukan. Tim EDT akan memeriksa kelengkapan.");
}

// ───────────── Admin: Keputusan Banding ─────────────
export async function decideAppeal(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const appealId = String(fd.get("appealId"));
  const status = String(fd.get("status")); // DITERIMA, DITERIMA_SEBAGIAN, DITOLAK
  const decision = String(fd.get("decision") || "").trim();
  const revisedScoreRaw = fd.get("revisedScore");

  if (!appealId || !status || !decision) {
    return failure("Lengkapi status keputusan dan catatan pertimbangan.");
  }

  const appeal = await db.appeal.findUnique({
    where: { id: appealId },
    include: { assessment: { include: { teacher: true } } },
  });
  if (!appeal) return failure("Data banding tidak ditemukan.");

  let revisedScore: number | null = null;
  if (status === "DITERIMA_SEBAGIAN") {
    if (!revisedScoreRaw || isNaN(Number(revisedScoreRaw))) {
      return failure("Isi nilai revisi untuk keputusan Diterima Sebagian.");
    }
    revisedScore = Math.round(Number(revisedScoreRaw) * 10) / 10;
  }

  await db.appeal.update({
    where: { id: appealId },
    data: {
      status,
      decision,
      revisedScore,
      decidedAt: new Date(),
    },
  });

  // Jika nilai direvisi, update assessment dan hitung ulang level
  if (revisedScore != null) {
    const toeflGold = (appeal.assessment.teacher.toeflScore ?? 0) >= 550;
    const target = appeal.assessment.targetLevel === "NONE" ? "BRONZE" : (appeal.assessment.targetLevel as Exclude<Level, "NONE">);
    const newLevel = awardedLevel(revisedScore, target, toeflGold);
    await db.assessment.update({
      where: { id: appeal.assessment.id },
      data: {
        finalScore: revisedScore,
        passed: newLevel !== "NONE",
        awardedLevel: newLevel,
      },
    });

    const order = ["NONE", "BRONZE", "SILVER", "GOLD"];
    if (order.indexOf(newLevel) > order.indexOf(appeal.assessment.teacher.ambassadorLevel)) {
      await db.teacher.update({
        where: { id: appeal.assessment.teacherId },
        data: { ambassadorLevel: newLevel, levelSince: new Date() },
      });
    }
    await syncTeacherBadges(appeal.assessment.teacherId);
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
  return success("Keputusan banding berhasil disimpan.");
}

// ───────────── Admin: Verifikasi Pendaftaran Duta ─────────────
export async function reviewRegistration(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const decision = fd.get("decision") === "approve" ? "APPROVED" : "REJECTED";
  const adminNote = String(fd.get("adminNote") || "").trim() || null;
  const assessmentDateRaw = fd.get("assessmentDate");
  const assessmentDate = assessmentDateRaw ? dayKey(String(assessmentDateRaw)) : null;

  await db.ambassadorRegistration.update({
    where: { id },
    data: {
      status: decision,
      adminNote,
      assessmentDate,
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
}

// ───────────── Admin: Penilaian Micro-teaching (Bab 4.1) ─────────────
const MicroSchema = z.object({
  teacherId: z.string().min(1, "Pilih guru"),
  week: z.coerce.number().int().min(1).max(4),
  date: z.string().min(1, "Isi tanggal"),
  focus: z.string().min(1, "Isi fokus materi"),
  opening: score,
  delivery: score,
  cfu: score,
  closing: score,
  notes: z.string().optional(),
});

export async function createMicroTeaching(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = MicroSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const d = parsed.data;

  const total = d.opening + d.delivery + d.cfu + d.closing;
  const scoreVal = Math.round((total / 16) * 100 * 10) / 10;
  const resultInfo = microResult(scoreVal);

  await db.microTeaching.create({
    data: {
      teacherId: d.teacherId,
      date: dayKey(d.date),
      week: d.week,
      focus: d.focus,
      opening: d.opening,
      delivery: d.delivery,
      cfu: d.cfu,
      closing: d.closing,
      score: scoreVal,
      result: resultInfo.code,
      notes: d.notes || null,
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
  return success(`Micro-teaching tersimpan. Nilai ${scoreVal} (${resultInfo.label}).`);
}

// ───────────── Admin: Edit Profil Guru & Riwayat CEFR ─────────────
export async function updateTeacherProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const teacherId = String(fd.get("teacherId"));
  const subject = String(fd.get("subject") || "").trim();
  const nip = String(fd.get("nip") || "").trim() || null;
  const whatsapp = String(fd.get("whatsapp") || "").trim() || null;
  const cefrLevel = String(fd.get("cefrLevel") || "A2");
  const toeflScoreRaw = fd.get("toeflScore");
  const toeflScore = toeflScoreRaw && !isNaN(Number(toeflScoreRaw)) ? Number(toeflScoreRaw) : null;
  const buddyId = String(fd.get("buddyId") || "").trim() || null;
  const isPilot = fd.get("isPilot") === "on";

  if (!teacherId || !subject) return failure("ID guru dan mata pelajaran wajib diisi.");

  const oldTeacher = await db.teacher.findUnique({ where: { id: teacherId } });
  if (!oldTeacher) return failure("Guru tidak ditemukan.");

  // Bila CEFR atau TOEFL berubah, buat riwayat CefrRecord
  if (oldTeacher.cefrLevel !== cefrLevel || oldTeacher.toeflScore !== toeflScore) {
    await db.cefrRecord.create({
      data: {
        teacherId,
        date: new Date(),
        cefrLevel,
        toefl: toeflScore,
        source: "Pembaruan Profil oleh Admin EDT",
      },
    });
  }

  await db.teacher.update({
    where: { id: teacherId },
    data: {
      subject,
      nip,
      whatsapp,
      cefrLevel,
      toeflScore,
      buddyId: buddyId === "none" ? null : buddyId,
      isPilot,
    },
  });

  await syncTeacherBadges(teacherId);
  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
  return success("Profil guru berhasil diperbarui.");
}

// ───────────── Admin: Sanksi Turun Level Duta Inggris ─────────────
export async function demoteTeacherLevel(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const teacherId = String(fd.get("teacherId"));
  const toLevel = String(fd.get("toLevel")) as Level;
  const reason = String(fd.get("reason") || "").trim();

  if (!teacherId || !toLevel || !reason) {
    return failure("Pilih level baru dan cantumkan alasan penurunan level.");
  }

  const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return failure("Guru tidak ditemukan.");

  const order = ["NONE", "BRONZE", "SILVER", "GOLD"];
  if (order.indexOf(toLevel) >= order.indexOf(teacher.ambassadorLevel)) {
    return failure("Level baru harus lebih rendah dari level saat ini untuk sanksi penurunan level.");
  }

  await db.levelChange.create({
    data: {
      teacherId,
      fromLevel: teacher.ambassadorLevel,
      toLevel,
      reason,
      changedById: admin.id,
    },
  });

  await db.teacher.update({
    where: { id: teacherId },
    data: {
      ambassadorLevel: toLevel,
      levelSince: new Date(),
    },
  });

  await syncTeacherBadges(teacherId);
  revalidatePath("/admin", "layout");
  revalidatePath("/guru", "layout");
  return success(`Level guru berhasil disesuaikan menjadi ${toLevel}. Alasan telah dicatat.`);
}

// ───────────── Guru & Admin: Pocket Book (50 Frasa Saku) ─────────────
export async function claimPhraseMastery(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const phraseId = String(fd.get("phraseId"));
  if (!phraseId) return failure("ID frasa tidak valid.");

  const existing = await db.phraseMastery.findUnique({
    where: { teacherId_phraseId: { teacherId: teacher.id, phraseId } },
  });

  if (existing && existing.status === "APPROVED") {
    return failure("Kalimat ini sudah terverifikasi hafal oleh Admin EDT.");
  }

  await db.phraseMastery.upsert({
    where: { teacherId_phraseId: { teacherId: teacher.id, phraseId } },
    create: { teacherId: teacher.id, phraseId, status: "PENDING" },
    update: { status: "PENDING" },
  });

  revalidatePath("/guru/pocket-book");
  revalidatePath("/admin/verifikasi");
  return success("Pengajuan hafalan terkirim ke Tim EDT untuk diverifikasi.");
}

export async function reviewPhraseMastery(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const decision = fd.get("decision") === "approve" ? "APPROVED" : "REJECTED";

  const mastery = await db.phraseMastery.update({
    where: { id },
    data: { status: decision },
  });

  if (decision === "APPROVED") {
    await syncTeacherBadges(mastery.teacherId);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/pocket-book");
  revalidatePath("/guru", "layout");
}

export async function approveAllPhrases() {
  await requireAdmin();
  const pending = await db.phraseMastery.findMany({ where: { status: "PENDING" } });
  if (pending.length === 0) return;

  await db.phraseMastery.updateMany({
    where: { status: "PENDING" },
    data: { status: "APPROVED" },
  });

  for (const tid of new Set(pending.map((p) => p.teacherId))) {
    await syncTeacherBadges(tid);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/pocket-book");
  revalidatePath("/guru", "layout");
}

// ───────────── Guru & Admin: Weekly Challenge (12 Minggu) ─────────────
export async function submitChallengeProgress(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const challengeId = String(fd.get("challengeId"));
  const evidence = String(fd.get("evidence") || "").trim();

  if (!challengeId) return failure("ID tantangan tidak valid.");
  if (!evidence || evidence.length < 10) {
    return failure("Tuliskan deskripsi ringkas bukti pelaksanaan minimal 10 karakter.");
  }

  const existing = await db.challengeProgress.findUnique({
    where: { teacherId_challengeId: { teacherId: teacher.id, challengeId } },
  });

  if (existing && existing.status === "APPROVED") {
    return failure("Tantangan ini sudah berhasil diverifikasi dan diselesaikan.");
  }

  await db.challengeProgress.upsert({
    where: { teacherId_challengeId: { teacherId: teacher.id, challengeId } },
    create: { teacherId: teacher.id, challengeId, evidence, status: "PENDING" },
    update: { evidence, status: "PENDING" },
  });

  revalidatePath("/guru/challenge");
  revalidatePath("/admin/verifikasi");
  return success("Laporan tantangan mingguan berhasil dikirim dan menunggu verifikasi.");
}

export async function reviewChallengeProgress(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const decision = fd.get("decision") === "approve" ? "APPROVED" : "REJECTED";

  const progress = await db.challengeProgress.update({
    where: { id },
    data: { status: decision },
  });

  if (decision === "APPROVED") {
    await syncTeacherBadges(progress.teacherId);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/challenge");
  revalidatePath("/guru", "layout");
}

export async function approveAllChallenges() {
  await requireAdmin();
  const pending = await db.challengeProgress.findMany({ where: { status: "PENDING" } });
  if (pending.length === 0) return;

  await db.challengeProgress.updateMany({
    where: { status: "PENDING" },
    data: { status: "APPROVED" },
  });

  for (const tid of new Set(pending.map((p) => p.teacherId))) {
    await syncTeacherBadges(tid);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/challenge");
  revalidatePath("/guru", "layout");
}

// ───────────── Sprint 3: Observasi Kelas (Lampiran 4A) ─────────────
export async function createObservation(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const teacherId = String(fd.get("teacherId") || "").trim();
  const dateStr = String(fd.get("date") || "");
  const subject = String(fd.get("subject") || "").trim();
  const className = String(fd.get("className") || "").trim();
  const rawChecklist = fd.get("checklist");
  const englishPctBucket = String(fd.get("englishPctBucket") || "20-40");
  const strengths = String(fd.get("strengths") || "").trim();
  const improvements = String(fd.get("improvements") || "").trim();
  const recommendation = String(fd.get("recommendation") || "PERTAHANKAN");
  const recommendationNote = String(fd.get("recommendationNote") || "").trim() || null;

  if (!teacherId) return failure("Pilih guru yang diobservasi.");
  if (!dateStr || !subject || !className) return failure("Tanggal, mata pelajaran, dan kelas wajib diisi.");
  if (strengths.length < 10) return failure("Tuliskan kekuatan guru secara deskriptif (minimal 10 karakter).");
  if (improvements.length < 10) return failure("Tuliskan area perbaikan guru secara spesifik (minimal 10 karakter).");

  let checklistArr: boolean[] = [];
  if (typeof rawChecklist === "string" && rawChecklist.startsWith("[")) {
    checklistArr = parseJson<boolean[]>(rawChecklist, []);
  } else {
    for (let i = 0; i < 10; i++) {
      checklistArr.push(fd.get(`item_${i}`) === "on" || fd.get(`item_${i}`) === "true");
    }
  }
  while (checklistArr.length < 10) checklistArr.push(false);
  const yesCount = checklistArr.slice(0, 10).filter(Boolean).length;
  const score = yesCount * 10;

  const bucketDef = ENGLISH_PCT_BUCKETS.find((b) => b.code === englishPctBucket);
  const englishPct = bucketDef ? bucketDef.mid : 30;

  await db.observation.create({
    data: {
      teacherId,
      observerId: admin.id,
      date: new Date(dateStr),
      subject,
      className,
      checklist: JSON.stringify(checklistArr.slice(0, 10)),
      englishPctBucket,
      englishPct,
      score,
      strengths,
      improvements,
      recommendation,
      recommendationNote,
      feedbackGiven: false,
    },
  });

  await syncTeacherBadges(teacherId);
  revalidatePath("/admin/observasi");
  revalidatePath("/admin/guru");
  revalidatePath(`/admin/guru/${teacherId}`);
  revalidatePath("/admin");
  revalidatePath("/guru/refleksi");

  return success("Lembar observasi kelas berhasil disimpan.");
}

export async function acknowledgeObservation(fd: FormData) {
  const { teacher } = await requireTeacher();
  const id = String(fd.get("id"));
  await db.observation.updateMany({
    where: { id, teacherId: teacher.id },
    data: { feedbackGiven: true },
  });
  revalidatePath("/guru/refleksi");
  revalidatePath("/admin/observasi");
}

// ───────────── Sprint 3: Refleksi Mengajar Mandiri (Lampiran 4B) ─────────────
export async function saveReflection(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { teacher } = await requireTeacher();
  const dateStr = String(fd.get("date") || "");
  const subject = String(fd.get("subject") || "").trim();
  const className = String(fd.get("className") || "").trim();
  const targetLevel = (String(fd.get("targetLevel") || teacher.ambassadorLevel || "BRONZE") as Level);
  const achieved = String(fd.get("achieved") || "YA");
  const fluentSentences = String(fd.get("fluentSentences") || "").trim();
  const difficultSentences = String(fd.get("difficultSentences") || "").trim();
  const studentResponse = String(fd.get("studentResponse") || "POSITIF");
  const challenge = String(fd.get("challenge") || "").trim();
  const nextChange = String(fd.get("nextChange") || "").trim();
  const proudOf = String(fd.get("proudOf") || "").trim();

  if (!dateStr || !subject || !className) {
    return failure("Tanggal, mata pelajaran, dan kelas wajib diisi.");
  }
  if (!fluentSentences || !challenge || !nextChange || !proudOf) {
    return failure("Harap lengkapi isian refleksi: kalimat lancar, tantangan, hal yang membanggakan, dan perubahan berikutnya.");
  }

  await db.reflection.create({
    data: {
      teacherId: teacher.id,
      date: new Date(dateStr),
      subject,
      className,
      targetLevel: targetLevel === "NONE" ? "BRONZE" : targetLevel,
      achieved,
      fluentSentences,
      difficultSentences,
      studentResponse,
      challenge,
      nextChange,
      proudOf,
      status: "PENDING",
    },
  });

  revalidatePath("/guru/refleksi");
  revalidatePath("/admin/verifikasi");
  return success("Refleksi mengajar berhasil dikirim dan menunggu verifikasi EDT.");
}

export async function reviewReflection(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const decision = fd.get("decision") === "approve" ? "APPROVED" : "REJECTED";
  const note = String(fd.get("reviewNote") || "").trim() || null;

  const item = await db.reflection.update({
    where: { id },
    data: { status: decision, reviewNote: note },
  });

  if (decision === "APPROVED") {
    await syncTeacherBadges(item.teacherId);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/refleksi");
  revalidatePath(`/admin/guru/${item.teacherId}`);
}

export async function approveAllReflections() {
  await requireAdmin();
  const pending = await db.reflection.findMany({ where: { status: "PENDING" } });
  if (pending.length === 0) return;

  await db.reflection.updateMany({
    where: { status: "PENDING" },
    data: { status: "APPROVED" },
  });

  for (const tid of new Set(pending.map((p) => p.teacherId))) {
    await syncTeacherBadges(tid);
  }

  revalidatePath("/admin/verifikasi");
  revalidatePath("/guru/refleksi");
}

// RPP Bilingual (Lampiran 11) lama dihapus: RPP kini berupa Modul Ajar yang disusun Tim EDT (src/actions/modul-ajar.ts).

// ───────────── Sprint 4: Input Nilai & Pemetaan CEFR Siswa ─────────────
export async function saveBatchStudentAssessments(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const teacherId = user.role === "TEACHER" && user.teacher ? user.teacher.id : String(fd.get("teacherId") || "");
  if (!teacherId) {
    const firstTeacher = await db.teacher.findFirst();
    if (!firstTeacher) return failure("Data guru penilai tidak ditemukan.");
  }

  const classId = String(fd.get("classId") || "").trim();
  const dateStr = String(fd.get("date") || "");
  const type = String(fd.get("type") || "OBSERVASI");
  const semester = String(fd.get("semester") || "Ganjil 2026/2027");
  const rawData = String(fd.get("studentAssessments") || "");

  if (!classId || !dateStr) {
    return failure("Pilih kelas dan tanggal asesmen.");
  }

  type RowItem = {
    studentId: string;
    score: number;
    cefrLevel?: string;
    listening?: number;
    speaking?: number;
    reading?: number;
    writing?: number;
    useOfEnglish?: number;
    notes?: string;
  };

  const rows = parseJson<RowItem[]>(rawData, []);
  if (rows.length === 0) {
    return failure("Tidak ada data siswa yang dinilai.");
  }

  const classRoom = await db.classRoom.findUnique({ where: { id: classId } });
  const gradeTarget = classRoom ? STUDENT_TARGET[classRoom.grade]?.endOfYear ?? "A2" : "A2";
  const finalTeacherId = teacherId || (await db.teacher.findFirst())!.id;

  for (const item of rows) {
    if (item.score == null || isNaN(item.score)) continue;

    let finalCefr = item.cefrLevel || "A1";
    if (type === "TOEFL") {
      finalCefr = cefrFromToefl(item.score);
    } else if (!item.cefrLevel) {
      if (item.score >= 80) finalCefr = gradeTarget;
      else if (item.score >= 60) finalCefr = "A2";
      else finalCefr = "A1";
    }

    await db.studentAssessment.create({
      data: {
        studentId: item.studentId,
        teacherId: finalTeacherId,
        date: new Date(dateStr),
        type,
        semester,
        score: item.score,
        cefrLevel: finalCefr,
        listening: item.listening ?? null,
        speaking: item.speaking ?? null,
        reading: item.reading ?? null,
        writing: item.writing ?? null,
        useOfEnglish: item.useOfEnglish ?? null,
        notes: item.notes?.trim() || null,
      },
    });

    await db.student.update({
      where: { id: item.studentId },
      data: { cefrLevel: finalCefr },
    });
  }

  revalidatePath("/guru/nilai");
  revalidatePath("/guru/siswa");
  revalidatePath("/admin/siswa");
  revalidatePath("/siswa/nilai");
  revalidatePath("/admin");

  return success(`Berhasil menyimpan asesmen untuk ${rows.length} siswa.`);
}

// ───────────── Sprint 4: English Club & Peer Tutoring ─────────────
export async function createClubSession(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const type = String(fd.get("type") || "ENGLISH_CLUB");
  const dateStr = String(fd.get("date") || "");
  const topic = String(fd.get("topic") || "").trim();
  const activity = String(fd.get("activity") || "").trim() || null;
  const notes = String(fd.get("notes") || "").trim() || null;
  const leaderId = user.teacher ? user.teacher.id : null;

  if (!dateStr || !topic) {
    return failure("Tanggal dan topik kegiatan club wajib diisi.");
  }

  await db.clubSession.create({
    data: {
      type,
      date: new Date(dateStr),
      topic,
      activity,
      leaderId,
      notes,
    },
  });

  revalidatePath("/guru/club");
  revalidatePath("/admin/club");
  revalidatePath("/siswa/club");

  return success("Sesi club berhasil dijadwalkan.");
}

export async function saveClubAttendance(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const sessionId = String(fd.get("sessionId") || "").trim();
  const rawAttendances = String(fd.get("attendances") || "");

  if (!sessionId) return failure("ID sesi tidak valid.");

  type AttendanceRow = {
    studentId: string;
    present: boolean;
    role: "PESERTA" | "TUTOR";
  };

  const rows = parseJson<AttendanceRow[]>(rawAttendances, []);
  if (rows.length === 0) return failure("Tidak ada data presensi yang dikirim.");

  for (const item of rows) {
    await db.clubAttendance.upsert({
      where: { sessionId_studentId: { sessionId, studentId: item.studentId } },
      create: {
        sessionId,
        studentId: item.studentId,
        present: item.present,
        role: item.role,
      },
      update: {
        present: item.present,
        role: item.role,
      },
    });

    if (item.role === "TUTOR" && item.present) {
      await db.student.update({
        where: { id: item.studentId },
        data: { isStudentAmbassador: true },
      });
    }
  }

  revalidatePath("/guru/club");
  revalidatePath("/admin/club");
  revalidatePath("/siswa/club");
  revalidatePath("/guru/siswa");
  revalidatePath("/admin/siswa");

  return success(`Presensi tersimpan untuk ${rows.length} siswa.`);
}

export async function toggleStudentAmbassador(fd: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) return;

  const studentId = String(fd.get("studentId"));
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (student) {
    await db.student.update({
      where: { id: studentId },
      data: { isStudentAmbassador: !student.isStudentAmbassador },
    });
  }

  revalidatePath("/guru/club");
  revalidatePath("/admin/club");
  revalidatePath("/guru/siswa");
  revalidatePath("/admin/siswa");
  revalidatePath(`/guru/siswa/${studentId}`);
  revalidatePath(`/admin/siswa/${studentId}`);
}

// ───────────── Sprint 4: Lomba & Prestasi ─────────────
export async function createCompetition(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const name = String(fd.get("name") || "").trim();
  const level = String(fd.get("level") || "KECAMATAN");
  const category = String(fd.get("category") || "Story Telling").trim();
  const organizer = String(fd.get("organizer") || "").trim() || null;
  const dateStr = String(fd.get("date") || "");

  if (!name || !dateStr) {
    return failure("Nama lomba dan tanggal pelaksanaan wajib diisi.");
  }

  await db.competition.create({
    data: {
      name,
      level,
      category,
      organizer,
      date: new Date(dateStr),
    },
  });

  revalidatePath("/guru/lomba");
  revalidatePath("/admin/lomba");
  revalidatePath("/siswa/prestasi");

  return success("Data kompetisi / ajang lomba berhasil ditambahkan.");
}

export async function saveCompetitionEntry(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const competitionId = String(fd.get("competitionId") || "").trim();
  const studentId = String(fd.get("studentId") || "").trim();
  const result = String(fd.get("result") || "PESERTA");
  const notes = String(fd.get("notes") || "").trim() || null;

  if (!competitionId || !studentId) {
    return failure("Pilih event lomba dan nama siswa peserta.");
  }

  const comp = await db.competition.findUnique({ where: { id: competitionId } });
  if (!comp) return failure("Lomba tidak ditemukan.");

  const points = competitionPoints(comp.level, result);

  await db.competitionEntry.upsert({
    where: { competitionId_studentId: { competitionId, studentId } },
    create: {
      competitionId,
      studentId,
      result,
      points,
      notes,
    },
    update: {
      result,
      points,
      notes,
    },
  });

  revalidatePath("/guru/lomba");
  revalidatePath("/admin/lomba");
  revalidatePath("/siswa/prestasi");
  revalidatePath("/guru/siswa");
  revalidatePath("/admin/siswa");
  revalidatePath(`/guru/siswa/${studentId}`);
  revalidatePath(`/admin/siswa/${studentId}`);

  return success(`Partisipasi dan prestasi siswa berhasil dicatat (+${points} poin).`);
}

export async function deleteCompetitionEntry(fd: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) return;

  const id = String(fd.get("id"));
  await db.competitionEntry.delete({ where: { id } });

  revalidatePath("/guru/lomba");
  revalidatePath("/admin/lomba");
  revalidatePath("/siswa/prestasi");
}

// ───────────── Sprint 4: Kelola Materi & Kuis ─────────────
export async function saveMaterial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const id = String(fd.get("id") || "").trim() || null;
  const title = String(fd.get("title") || "").trim();
  const category = String(fd.get("category") || "Kosakata Mapel").trim();
  const subject = String(fd.get("subject") || "").trim() || null;
  const gradeStr = fd.get("grade");
  const grade = gradeStr && Number(gradeStr) > 0 ? Number(gradeStr) : null;
  const cefrLevel = String(fd.get("cefrLevel") || "A2").trim();
  const summary = String(fd.get("summary") || "").trim();
  const content = String(fd.get("content") || "").trim();
  const vocabulary = String(fd.get("vocabulary") || "[]").trim();
  const published = fd.get("published") === "true" || fd.get("published") === "on";

  if (!title || !summary || !content) {
    return failure("Judul, ringkasan, dan isi materi wajib diisi.");
  }

  const authorId = user.teacher ? user.teacher.id : null;

  if (id) {
    await db.material.update({
      where: { id },
      data: {
        title,
        category,
        subject,
        grade,
        cefrLevel,
        summary,
        content,
        vocabulary,
        published,
      },
    });
  } else {
    await db.material.create({
      data: {
        title,
        category,
        subject,
        grade,
        cefrLevel,
        summary,
        content,
        vocabulary,
        authorId,
        published,
      },
    });
  }

  revalidatePath("/guru/materi");
  revalidatePath("/admin/materi");
  revalidatePath("/siswa/materi");

  return success(id ? "Materi berhasil diperbarui." : "Materi baru berhasil diterbitkan.");
}

export async function deleteMaterial(fd: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) return;

  const id = String(fd.get("id"));
  await db.material.delete({ where: { id } });

  revalidatePath("/guru/materi");
  revalidatePath("/admin/materi");
  revalidatePath("/siswa/materi");
}

export async function saveQuiz(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return failure("Akses ditolak.");
  }

  const id = String(fd.get("id") || "").trim() || null;
  const materialId = String(fd.get("materialId") || "").trim();
  const title = String(fd.get("title") || "").trim();
  const passScore = Math.max(50, Math.min(100, Number(fd.get("passScore") || 70)));
  const questionsRaw = String(fd.get("questions") || "");

  if (!materialId || !title) {
    return failure("Pilih materi terkait dan judul kuis.");
  }

  const questions = parseJson<QuizQuestion[]>(questionsRaw, []);
  if (questions.length === 0) {
    return failure("Tambahkan minimal 1 butir pertanyaan kuis.");
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.q || !q.q.trim()) {
      return failure(`Pertanyaan pada butir soal #${i + 1} masih kosong.`);
    }
    if (q.type === "LISTENING") {
      if (q.audioSourceType === "TTS" && (!q.audioScript || !q.audioScript.trim())) {
        return failure(`Naskah audio untuk soal listening #${i + 1} belum diisi.`);
      }
      if (q.audioSourceType === "URL" && (!q.audioUrl || !q.audioUrl.trim())) {
        return failure(`Link URL audio untuk soal listening #${i + 1} belum diisi.`);
      }
      if (q.listeningFormat === "FILL_IN" && (!q.fillInAnswer || !q.fillInAnswer.trim())) {
        return failure(`Kunci kata isian untuk listening #${i + 1} belum diisi.`);
      }
    }
    if (q.type === "SPEAKING" && q.speakingMode !== "RESPOND" && (!q.targetText || !q.targetText.trim())) {
      return failure(`Kalimat yang harus dibaca siswa untuk soal speaking #${i + 1} belum diisi.`);
    }
    if (q.type === "READING") {
      if (!q.passage || !q.passage.trim()) {
        return failure(`Teks bacaan untuk soal reading #${i + 1} belum diisi.`);
      }
      if (q.readingFormat === "FILL_IN") {
        if (!q.fillInAnswer || !q.fillInAnswer.trim()) {
          return failure(`Kunci jawaban isian untuk soal reading #${i + 1} belum diisi.`);
        }
      } else if (!q.options || q.options.length < 2 || q.options.some((o) => !String(o || "").trim())) {
        return failure(`Lengkapi semua pilihan jawaban (A–D) untuk soal reading #${i + 1}.`);
      }
    }
    if (q.type === "FILL_IN") {
      const hasMainAnswer = Boolean(q.fillInAnswer && q.fillInAnswer.trim());
      const hasAccepted = Boolean(q.acceptedAnswers && q.acceptedAnswers.length > 0);
      if (!hasMainAnswer && !hasAccepted) {
        return failure(`Kunci jawaban isian untuk butir soal #${i + 1} belum diisi.`);
      }
    }
  }

  if (id) {
    await db.quiz.update({
      where: { id },
      data: {
        title,
        passScore,
        questions: JSON.stringify(questions),
      },
    });
  } else {
    await db.quiz.create({
      data: {
        materialId,
        title,
        passScore,
        questions: JSON.stringify(questions),
      },
    });
  }

  revalidatePath("/guru/materi");
  revalidatePath("/admin/materi");
  revalidatePath("/siswa/materi");
  revalidatePath(`/siswa/materi/${materialId}`);

  return success("Kuis interaktif berhasil disimpan.");
}


// ───────────── Sprint 5: Kelola Pengumuman ─────────────
export async function saveAnnouncement(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(fd.get("id") || "").trim() || null;
  const title = String(fd.get("title") || "").trim();
  const body = String(fd.get("body") || "").trim();
  const audience = String(fd.get("audience") || "ALL").trim();
  // Hanya pengumuman untuk semua warga sekolah yang boleh tampil di halaman depan publik
  const isPublic = audience === "ALL" && fd.get("isPublic") === "on";

  if (title.length < 3) return failure("Judul pengumuman minimal 3 karakter.");
  if (body.length < 5) return failure("Isi pengumuman minimal 5 karakter.");

  if (id) {
    await db.announcement.update({
      where: { id },
      data: { title, body, audience, isPublic },
    });
  } else {
    await db.announcement.create({
      data: {
        title,
        body,
        audience,
        isPublic,
        authorId: admin.id,
      },
    });
  }

  revalidatePath("/admin/pengumuman");
  revalidatePath("/admin");
  revalidatePath("/guru");
  revalidatePath("/siswa");

  invalidatePublicStats();
  await logAudit("announcement.save", { actorId: admin.id, target: title, detail: `Audiens: ${audience}${isPublic ? " · tampil di halaman depan" : ""}` });
  return success("Pengumuman berhasil dipublikasikan.");
}

export async function deleteAnnouncement(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(fd.get("id") || "").trim();
  if (!id) return;

  const removed = await db.announcement.delete({ where: { id } });
  invalidatePublicStats();
  await logAudit("announcement.delete", { actorId: admin.id, target: removed.title });

  revalidatePath("/admin/pengumuman");
  revalidatePath("/admin");
  revalidatePath("/guru");
  revalidatePath("/siswa");
}

// ───────────── Sprint 5: Manajemen Pengguna & Kelas ─────────────
export async function createUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "").trim();
  const role = String(fd.get("role") || "TEACHER").toUpperCase();
  const title = String(fd.get("title") || "").trim() || null;

  if (name.length < 2) return failure("Nama lengkap minimal 2 karakter.");
  if (!email.includes("@")) return failure("Email tidak valid.");
  if (password.length < 6) return failure("Password minimal 6 karakter.");
  if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) return failure("Peran tidak valid.");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return failure("Email sudah terdaftar.");

  const passwordHash = await bcrypt.hash(password, 10);

  if (role === "ADMIN") {
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        title: title || "Tim EDT",
        active: true,
      },
    });
  } else if (role === "TEACHER") {
    const nip = String(fd.get("nip") || "").trim() || null;
    const subject = String(fd.get("subject") || "Umum").trim();
    const whatsapp = String(fd.get("whatsapp") || "").trim() || null;
    const cefrLevel = String(fd.get("cefrLevel") || "A2").trim();
    const isPilot = fd.get("isPilot") === "on" || fd.get("isPilot") === "true";

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "TEACHER",
        title: title || `Guru ${subject}`,
        active: true,
        teacher: {
          create: {
            nip,
            subject,
            whatsapp,
            cefrLevel,
            isPilot,
          },
        },
      },
    });
  } else if (role === "STUDENT") {
    const nis = String(fd.get("nis") || "").trim() || null;
    const classId = String(fd.get("classId") || "").trim();
    if (!classId) return failure("Pilih kelas untuk siswa.");

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        title: "Siswa",
        active: true,
        student: {
          create: {
            nis,
            classId,
            cefrLevel: "A1",
          },
        },
      },
    });
  }

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/siswa");

  await logAudit("user.create", { actorId: admin.id, target: email, detail: `${name} · ${role}` });
  return success(`Akun ${name} (${role}) berhasil dibuat.`);
}

export async function toggleUserStatus(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(fd.get("userId") || "").trim();
  if (!userId) return;
  if (userId === admin.id) return;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await db.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });
  await logAudit("user.toggle", { actorId: admin.id, target: user.email, detail: user.active ? "Dinonaktifkan" : "Diaktifkan" });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/siswa");
}

export async function resetUserPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const userId = String(fd.get("userId") || "").trim();
  const newPassword = String(fd.get("newPassword") || "").trim();

  if (!userId) return failure("Pengguna tidak ditemukan.");
  if (newPassword.length < 6) return failure("Password baru minimal 6 karakter.");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  // passwordChangedAt membuat sesi lama pengguna tersebut otomatis tidak berlaku
  const target = await db.user.update({
    where: { id: userId },
    data: { passwordHash, passwordChangedAt: new Date() },
    select: { email: true },
  });
  await logAudit("user.reset_password", { actorId: admin.id, target: target.email });

  revalidatePath("/admin/pengguna");
  return success("Password pengguna berhasil diperbarui.");
}

export async function deleteUser(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(fd.get("userId") || "").trim();
  if (!userId) return;
  if (userId === admin.id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    include: { teacher: true, student: true },
  });
  if (!target) return;

  await db.$transaction(async (tx) => {
    // 1. Jika pengguna adalah Guru, bersihkan relasi non-cascade
    if (target.teacher) {
      const teacherId = target.teacher.id;

      // Lepaskan buddyId pada guru lain yang berpasangan dengan guru ini
      await tx.teacher.updateMany({
        where: { buddyId: teacherId },
        data: { buddyId: null },
      });

      // Lepaskan authorId pada materi bahan ajar
      await tx.material.updateMany({
        where: { authorId: teacherId },
        data: { authorId: null },
      });

      // Lepaskan leaderId pada sesi English Club
      await tx.clubSession.updateMany({
        where: { leaderId: teacherId },
        data: { leaderId: null },
      });

      // Hapus penilaian siswa yang diinput oleh guru ini
      await tx.studentAssessment.deleteMany({
        where: { teacherId },
      });
    }

    // 2. Bersihkan catatan yang dibuat pengguna sebagai reviewer/observer/assessor/author
    await tx.dailyLog.updateMany({
      where: { reviewerId: userId },
      data: { reviewerId: null },
    });
    await tx.observation.deleteMany({
      where: { observerId: userId },
    });
    await tx.assessment.deleteMany({
      where: { assessorId: userId },
    });
    await tx.levelChange.deleteMany({
      where: { changedById: userId },
    });
    await tx.announcement.deleteMany({
      where: { authorId: userId },
    });

    // 3. Hapus User secara permanen (otomatis cascade ke Teacher, Student, dan relasi langsungnya)
    await tx.user.delete({
      where: { id: userId },
    });
    // 4. Hapus foto profil (data pribadi) bila ada
    if (target.avatarFileId) await tx.storedFile.deleteMany({ where: { id: target.avatarFileId } });
  });
  await logAudit("user.delete", { actorId: admin.id, target: target.email, detail: `${target.name} · ${target.role}` });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/siswa");
  revalidatePath("/admin");
}

export async function saveClassRoom(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(fd.get("id") || "").trim() || null;
  const name = String(fd.get("name") || "").trim().toUpperCase();
  const grade = Number(fd.get("grade") || 7);

  if (!name) return failure("Nama kelas wajib diisi (mis. 7A, 8B).");
  if (![7, 8, 9].includes(grade)) return failure("Jenjang kelas harus 7, 8, atau 9.");

  if (id) {
    await db.classRoom.update({
      where: { id },
      data: { name, grade },
    });
  } else {
    const existing = await db.classRoom.findUnique({ where: { name } });
    if (existing) return failure(`Kelas ${name} sudah ada.`);

    await db.classRoom.create({
      data: { name, grade },
    });
  }

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/siswa");
  await logAudit("class.save", { actorId: admin.id, target: name, detail: `Jenjang ${grade}` });
  return success(`Kelas ${name} berhasil disimpan.`);
}

export async function assignTeacherClass(fd: FormData): Promise<void> {
  await requireAdmin();
  const teacherId = String(fd.get("teacherId") || "").trim();
  const classId = String(fd.get("classId") || "").trim();
  const isHomeroom = fd.get("isHomeroom") === "on" || fd.get("isHomeroom") === "true";

  if (!teacherId || !classId) return;

  await db.teachingAssignment.upsert({
    where: {
      teacherId_classId: { teacherId, classId },
    },
    update: { isHomeroom },
    create: { teacherId, classId, isHomeroom },
  });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/guru");
}

export async function removeTeacherClass(fd: FormData): Promise<void> {
  await requireAdmin();
  const teacherId = String(fd.get("teacherId") || "").trim();
  const classId = String(fd.get("classId") || "").trim();
  if (!teacherId || !classId) return;

  await db.teachingAssignment.deleteMany({
    where: { teacherId, classId },
  });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/guru");
}

// ───────────── Sprint 5: Catatan Laporan Bulanan EDT (Lampiran 5) ─────────────
export async function saveMonthlyReportNotes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const month = String(fd.get("month") || "").trim();
  const executiveSummary = String(fd.get("executiveSummary") || "").trim() || null;
  const challenges = String(fd.get("challenges") || "").trim() || null;
  const recommendations = String(fd.get("recommendations") || "").trim() || null;
  const nextMonthPlan = String(fd.get("nextMonthPlan") || "").trim() || null;

  if (!month || !month.includes("-")) {
    return failure("Format bulan tidak valid (gunakan YYYY-MM).");
  }

  await db.monthlyReport.upsert({
    where: { month },
    update: {
      executiveSummary,
      challenges,
      recommendations,
      nextMonthPlan,
    },
    create: {
      month,
      executiveSummary,
      challenges,
      recommendations,
      nextMonthPlan,
    },
  });

  revalidatePath("/admin/laporan");
  return success("Catatan narasi Laporan Bulanan EDT berhasil disimpan.");
}
