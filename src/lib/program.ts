/**
 * Aturan Program Bilingual SMP IT Al Madany.
 * Seluruh angka di file ini dikutip dari Dokumen Master v3.0 (berlaku 1 Mei 2026)
 * agar mudah disesuaikan bila dokumen direvisi.
 */

export type Level = "NONE" | "BRONZE" | "SILVER" | "GOLD";

export const LEVEL_LABEL: Record<Level, string> = {
  NONE: "Belum Level",
  BRONZE: "Bronze Ambassador",
  SILVER: "Silver Ambassador",
  GOLD: "Gold Ambassador",
};

export const LEVEL_SHORT: Record<Level, string> = {
  NONE: "Belum",
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
};

/** Kriteria per level (Bab 6.1, Juknis 5.1, Bab 3.3, Lampiran 3, Lampiran 10). */
export const LEVEL_RULES: Record<Exclude<Level, "NONE">, {
  cefr: string;
  passScore: number; // nilai akhir minimal (Lampiran 10 Bagian 6)
  englishTargetPct: number; // target % Inggris di kelas (Juknis)
  zoneSessionsPerWeek: number; // English Zone 30 menit/sesi (Bab 3.3)
  zoneArea: string;
  phrasesToMemorize: number; // Pocket Book (Lampiran 3, tips penggunaan)
  waParticipationPct: number;
  validityMonths: number;
  menteeCount: number;
  simulationMinutes: number;
  certificateColor: string;
  extra: string[];
}> = {
  BRONZE: {
    cefr: "A2–B1",
    passScore: 66.5,
    englishTargetPct: 30,
    zoneSessionsPerWeek: 3,
    zoneArea: "Ruang guru",
    phrasesToMemorize: 20,
    waParticipationPct: 70,
    validityMonths: 3,
    menteeCount: 0,
    simulationMinutes: 10,
    certificateColor: "Cokelat",
    extra: ["Menggunakan Inggris untuk instruksi kelas", "Partisipasi program WA ELITE minimal 70%"],
  },
  SILVER: {
    cefr: "B1–B2",
    passScore: 76.2,
    englishTargetPct: 50,
    zoneSessionsPerWeek: 4,
    zoneArea: "Ruang guru + koridor",
    phrasesToMemorize: 35,
    waParticipationPct: 70,
    validityMonths: 6,
    menteeCount: 1,
    simulationMinutes: 15,
    certificateColor: "Abu-abu",
    extra: ["Mentor bagi 1 guru Bronze", "Membuat 1 konten sederhana per bulan", "Sudah Bronze minimal 6 bulan"],
  },
  GOLD: {
    cefr: "B2–C1",
    passScore: 84.1,
    englishTargetPct: 70,
    zoneSessionsPerWeek: 5,
    zoneArea: "Seluruh area sekolah",
    phrasesToMemorize: 45,
    waParticipationPct: 70,
    validityMonths: 12,
    menteeCount: 2,
    simulationMinutes: 20,
    certificateColor: "Emas",
    extra: [
      "TOEFL ≥ 550 / IELTS ≥ 6.0",
      "Mentor bagi 2 guru",
      "Mampu mengajar 1 mapel non-Inggris bilingual penuh 1 jam",
      "Memimpin pelatihan mini setiap 2 bulan",
      "Sudah Silver minimal 6 bulan",
    ],
  },
};

export const NEXT_LEVEL: Record<Level, Exclude<Level, "NONE"> | null> = {
  NONE: "BRONZE",
  BRONZE: "SILVER",
  SILVER: "GOLD",
  GOLD: null,
};

export const ASSESSMENT_WEIGHTS = { oral: 0.5, written: 0.3, simulation: 0.2 };

/** Tes lisan: 5 aspek skor 1-4, jumlah × 5 (Lampiran 10 Bagian 3.4). */
export function oralScore(aspects: number[]) {
  return aspects.reduce((a, b) => a + b, 0) * 5;
}

/** Simulasi mengajar: (jumlah 4 aspek ÷ 16) × 100 (Lampiran 10 Bagian 5). */
export function simulationScore(aspects: number[]) {
  return (aspects.reduce((a, b) => a + b, 0) / 16) * 100;
}

export function finalScore(oral: number, written: number, simulation: number) {
  const v =
    oral * ASSESSMENT_WEIGHTS.oral +
    written * ASSESSMENT_WEIGHTS.written +
    simulation * ASSESSMENT_WEIGHTS.simulation;
  return Math.round(v * 10) / 10;
}

/** Level tertinggi yang lulus berdasarkan nilai akhir, dibatasi level yang dituju. */
export function awardedLevel(score: number, target: Exclude<Level, "NONE">, hasToeflGold: boolean): Level {
  const order: Exclude<Level, "NONE">[] = ["BRONZE", "SILVER", "GOLD"];
  let result: Level = "NONE";
  for (const lvl of order) {
    if (order.indexOf(lvl) > order.indexOf(target)) break;
    if (lvl === "GOLD" && !hasToeflGold) break;
    if (score >= LEVEL_RULES[lvl].passScore) result = lvl;
  }
  return result;
}

export const ORAL_ASPECTS = [
  { key: "oralFluency", label: "Kelancaran (Fluency)" },
  { key: "oralPronunciation", label: "Pengucapan (Pronunciation)" },
  { key: "oralGrammar", label: "Tata Bahasa (Grammar)" },
  { key: "oralVocabulary", label: "Kosakata (Vocabulary)" },
  { key: "oralConfidence", label: "Keberanian & Sikap" },
] as const;

export const SIM_ASPECTS = [
  { key: "simInstruction", label: "Instruksi kelas" },
  { key: "simAdaptation", label: "Adaptasi" },
  { key: "simConsistency", label: "Konsistensi Inggris" },
  { key: "simClarity", label: "Kejelasan" },
] as const;

export const SCORE_LABEL: Record<number, string> = { 4: "Sangat Baik", 3: "Baik", 2: "Cukup", 1: "Kurang" };

// ─────────────── Micro-teaching (Bab 4.1) ───────────────
export const MICRO_FOCUS = [
  { week: 1, focus: "Opening & Instruction", minutes: 10 },
  { week: 2, focus: "Main Activity & Monitoring", minutes: 15 },
  { week: 3, focus: "Checking for Understanding", minutes: 15 },
  { week: 4, focus: "Full Mini-Lesson (Penilaian)", minutes: 20 },
];

export function microResult(score: number) {
  if (score >= 70) return { code: "LULUS", label: "Lulus → Real-Class Pilot", tone: "success" as const };
  if (score >= 60) return { code: "PENDAMPINGAN", label: "Pendampingan → ulang minggu depan", tone: "warning" as const };
  return { code: "BELUM_SIAP", label: "Belum siap → pendampingan intensif 2 minggu", tone: "danger" as const };
}

// ─────────────── Observasi kelas (Lampiran 4) ───────────────
export const OBSERVATION_ITEMS = [
  "Membuka kelas dengan sapaan dalam bahasa Inggris",
  "Menyampaikan tujuan pembelajaran dalam bahasa Inggris",
  "Memberi instruksi kegiatan dalam bahasa Inggris (minimal 3 kali)",
  "Memberi pujian/motivasi dalam bahasa Inggris",
  "Memberi teguran/pengelolaan kelas dalam bahasa Inggris",
  "Memeriksa pemahaman siswa (CFU) dalam bahasa Inggris",
  "Merespon pertanyaan/jawaban siswa dalam bahasa Inggris",
  "Menggunakan bahasa Inggris secara konsisten (tidak bolak-balik tanpa pola)",
  "Menutup kelas dengan bahasa Inggris",
  "Siswa merespon instruksi guru dengan tepat",
];

export const ENGLISH_PCT_BUCKETS = [
  { code: "<20", label: "< 20%", mid: 10 },
  { code: "20-40", label: "20–40%", mid: 30 },
  { code: "40-60", label: "40–60%", mid: 50 },
  { code: "60-80", label: "60–80%", mid: 70 },
  { code: ">80", label: "> 80%", mid: 90 },
];

export const RECOMMENDATIONS: Record<string, string> = {
  PERTAHANKAN: "Pertahankan level saat ini",
  SIAP_NAIK: "Siap naik ke level berikutnya",
  PENDAMPINGAN: "Perlu pendampingan khusus",
};

export const STUDENT_RESPONSE: Record<string, string> = {
  SANGAT_POSITIF: "Sangat positif",
  POSITIF: "Positif",
  BIASA: "Biasa saja",
  BINGUNG: "Bingung",
};

export const CAMBRIDGE_SKILLS = ["Reading", "Writing", "Use of English", "Listening", "Speaking"];

// ─────────────── CEFR ───────────────
export const TEACHER_CEFR = ["A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+"];
export const STUDENT_CEFR = ["Pre A1", "A1", "A2", "A2+", "B1", "B1+", "B2"];
const CEFR_ORDER = ["Pre A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"];

export function cefrIndex(level: string) {
  const i = CEFR_ORDER.indexOf(level);
  return i < 0 ? 0 : i;
}
export function cefrAtLeast(level: string, target: string) {
  return cefrIndex(level) >= cefrIndex(target);
}
export const CEFR_FROM_INDEX = (i: number) => CEFR_ORDER[Math.max(0, Math.min(CEFR_ORDER.length - 1, Math.round(i)))];

/** Target kenaikan level guru (Bab 2.1). */
export const TEACHER_CEFR_PATH: Record<string, { m6: string; y1: string; y2: string }> = {
  A2: { m6: "A2+", y1: "B1", y2: "B2" },
  B1: { m6: "B1+", y1: "B2", y2: "B2+" },
  B2: { m6: "B2+", y1: "C1", y2: "C1+" },
};

/** Target kemampuan siswa per kelas (Bab 2.2). */
export const STUDENT_TARGET: Record<number, { endOfYear: string; graduation: string; assessment: string; frequency: string }> = {
  7: { endOfYear: "A2", graduation: "B1", assessment: "Observasi partisipasi di kelas", frequency: "2x/semester" },
  8: { endOfYear: "A2+", graduation: "B1+", assessment: "Simple speaking test (1–2 menit)", frequency: "2x/semester" },
  9: { endOfYear: "B1", graduation: "B2", assessment: "TOEFL ITP prediction (min. 450, target 500)", frequency: "1x/semester" },
};

export const STUDENT_ASSESSMENT_TYPES: Record<string, string> = {
  OBSERVASI: "Observasi partisipasi",
  SPEAKING: "Speaking test",
  TOEFL: "TOEFL ITP Prediction",
  KUIS_KELAS: "Tes/Kuis kelas",
};

/** Estimasi CEFR dari skor TOEFL ITP (Bab 2.1, tabel pemetaan). */
export function cefrFromToefl(score: number) {
  if (score >= 550) return "C1";
  if (score >= 500) return "B2";
  if (score >= 450) return "B1";
  if (score >= 400) return "A2+";
  if (score >= 350) return "A2";
  return "A1";
}

// ─────────────── Peta jalan (Bab 1.3) ───────────────
// Tanggal start/end adalah RENCANA dari dokumen. Status fase (selesai/berjalan/terkunci) tidak dihitung
// dari tanggal, tetapi diselesaikan manual oleh admin secara berurutan (lihat src/lib/phases-server.ts).
export type PhaseChecklistItem = { id: string; label: string };
export type Phase = {
  code: string;
  name: string;
  title: string;
  start: string;
  end: string;
  target: string;
  source: string;
  material: string[];
  checklist: PhaseChecklistItem[];
};

export const PHASES: Phase[] = [
  {
    code: "F0", name: "Fase 0", title: "Asesmen awal, sosialisasi, pembentukan tim", start: "2026-04-01", end: "2026-04-30",
    target: "Peta kemampuan guru & siswa, SK Tim EDT",
    source: "Bab 1.3, Bab 2.1–2.2",
    material: [
      "Fase 0 berlangsung 1 bulan (April 2026) untuk memetakan titik awal sebelum program berjalan. Kemampuan guru dipetakan dengan TOEFL Prediction Test (membaca, mendengar, struktur), Cambridge Placement Test bila memungkinkan, serta observasi kelas dan wawancara untuk berbicara.",
      "Hasil pemetaan dikelompokkan per level CEFR: C1 (TOEFL 550+), B2 (500–549), B1 (450–499), dan A2 (350–449). Pemetaan ulang dilakukan setiap 6 bulan, yaitu Juni dan Desember.",
      "Kemampuan siswa kelas 7 dan 8 dipetakan dari riwayat kursus (banyak alumni Pare) dan tes awal oleh guru Bahasa Inggris. Perkiraan awal: ±60% A2, ±30% A1, ±10% Pre A1.",
      "Pada fase ini Tim English Development Team (EDT) dibentuk melalui SK Kepala Sekolah dan program disosialisasikan ke guru, staf, siswa, dan orang tua.",
    ],
    checklist: [
      { id: "F0-1", label: "Tim EDT dibentuk dan SK Kepala Sekolah diterbitkan" },
      { id: "F0-2", label: "Pemetaan kemampuan guru (TOEFL Prediction + wawancara) selesai" },
      { id: "F0-3", label: "Pemetaan kemampuan siswa kelas 7 & 8 selesai" },
      { id: "F0-4", label: "Program disosialisasikan ke guru, staf, dan orang tua" },
      { id: "F0-5", label: "Akun LMS seluruh guru dan siswa sudah dibuat" },
    ],
  },
  {
    code: "F1", name: "Fase 1", title: "Foundation & Habit Building", start: "2026-05-01", end: "2026-07-31",
    target: "70% guru aktif di program WA, 60% guru lulus Bronze",
    source: "Bab 3, Lampiran 2–3",
    material: [
      "Fase 1 (3 bulan) membangun kebiasaan berbahasa Inggris lewat program ELITE (English Language Immersion Through Everyday) di grup WhatsApp, Senin–Jumat. Pukul 05.30 admin memposting Mirror Morning; guru berlatih di depan cermin dan mengirim voice note sebelum 06.15. Pukul 06.30 admin memposting Misi Harian dengan batas 20.00.",
      "Tema mingguan: Greetings & Gratitude, Instructions, Student Interaction, lalu Reflection. Prinsipnya communication over perfection: yang penting berani mencoba.",
      "English Zone mewajibkan bahasa Inggris di area tertentu (Bronze: ruang guru 3×30 menit/minggu). English Buddy memasangkan guru A2 dengan guru B1/B2/C1, bertemu 2× seminggu selama 30 menit.",
      "Setiap guru menerima Pocket Book 50 kalimat instruksi kelas. Di akhir fase dilakukan asesmen Bronze Ambassador (lisan 50%, tertulis 30%, simulasi 20%; lulus ≥ 66,5).",
    ],
    checklist: [
      { id: "F1-1", label: "Grup WhatsApp ELITE berjalan Senin–Jumat dengan aturan grup" },
      { id: "F1-2", label: "Mirror Morning & Misi Harian diposting rutin sesuai tema 4 minggu" },
      { id: "F1-3", label: "English Zone dan pasangan English Buddy sudah berjalan" },
      { id: "F1-4", label: "Pocket Book 50 kalimat dibagikan ke setiap guru" },
      { id: "F1-5", label: "Asesmen Bronze Ambassador sudah dilaksanakan" },
      { id: "F1-6", label: "Target tercapai: 70% guru aktif di ELITE dan 60% guru lulus Bronze" },
    ],
  },
  {
    code: "F2", name: "Fase 2", title: "Pilot Implementation", start: "2026-08-01", end: "2026-10-31",
    target: "3–5 pilot teacher mengajar full lesson bilingual, protokol observasi siap",
    source: "Bab 4",
    material: [
      "Bulan 4 diisi micro-teaching: guru mengajar 10–20 menit di depan rekan sejawat. Minggu 1 Opening & Instruction, minggu 2 Main Activity & Monitoring, minggu 3 Checking for Understanding, minggu 4 Full Mini-Lesson yang dinilai EDT.",
      "Rubrik micro-teaching memiliki 4 aspek berbobot sama. Nilai ≥ 70 lulus ke Real-Class Pilot, 60–69 pendampingan dan ulang minggu depan, < 60 pendampingan intensif 2 minggu.",
      "Pilot teacher dipilih dari guru yang menyelesaikan Fase 1 (partisipasi WA ≥ 70%), lulus micro-teaching, direkomendasikan EDT, dan bersedia direkam. Bulan 5 berisi workshop RPP bilingual lalu pilot mengajar di kelas nyata dengan observasi.",
      "Setiap observasi diikuti sesi umpan balik wajib kurang dari 24 jam: apresiasi, refleksi guru, 2–3 saran konkret, dan kesepakatan tindak lanjut. Di akhir fase protokol observasi direvisi.",
    ],
    checklist: [
      { id: "F2-1", label: "Micro-teaching 4 minggu selesai dan dinilai" },
      { id: "F2-2", label: "3–5 pilot teacher terpilih sesuai kriteria" },
      { id: "F2-3", label: "Real-Class Pilot berjalan dengan observasi kelas" },
      { id: "F2-4", label: "Sesi umpan balik < 24 jam dilakukan setelah setiap observasi" },
      { id: "F2-5", label: "Protokol dan lembar observasi sudah direvisi dan siap dipakai" },
    ],
  },
  {
    code: "F3", name: "Fase 3", title: "Operasionalisasi Sistem", start: "2026-11-01", end: "2027-04-30",
    target: "Seluruh guru memiliki level Duta Inggris, sistem monitoring berjalan",
    source: "Bab 5–6",
    material: [
      "Fase 3 (6 bulan) menjadikan program bilingual sistem tetap. SK Kepala Sekolah mengesahkan program, Tim EDT, Sistem Duta Inggris 3 level beserta insentif, dan instrumen operasional. Juknis menetapkan target bahasa Inggris di kelas: Bronze 30%, Silver 50%, Gold 70%, Mentor 85%.",
      "SOP mengatur pendaftaran Duta Inggris tiap awal semester, asesmen level setiap 6 bulan, observasi kelas 2× per semester per guru, pencairan insentif bulanan, pelatihan rutin Jumat minggu ke-2, dan banding maksimal 14 hari.",
      "Guru memakai template RPP bilingual (target level, minimal 3 kalimat Inggris, skenario, refleksi) dan Bank Kalimat 50+ situasi. Monitoring berjalan lewat dashboard guru dan Laporan Bulanan EDT kepada Kepala Sekolah.",
      "Sanksi: 3 bulan tidak memenuhi kewajiban berarti turun level dan insentif dihentikan.",
    ],
    checklist: [
      { id: "F3-1", label: "SK, Juknis, dan SOP program bilingual disahkan" },
      { id: "F3-2", label: "Guru memakai template RPP bilingual dan Bank Kalimat" },
      { id: "F3-3", label: "Sistem Duta Inggris 3 level beserta insentif berjalan" },
      { id: "F3-4", label: "Observasi kelas 2× per semester per guru terjadwal dan berjalan" },
      { id: "F3-5", label: "Laporan Bulanan EDT rutin dikirim ke Kepala Sekolah" },
      { id: "F3-6", label: "Seluruh guru sudah memiliki level Duta Inggris" },
    ],
  },
  {
    code: "F4", name: "Fase 4", title: "Pemantapan & Ekspansi", start: "2027-05-01", end: "2028-04-30",
    target: "100% guru minimal B1, bilingual di 50% mata pelajaran",
    source: "Bab 1.2, Bab 2, Bab 7",
    material: [
      "Fase 4 (12 bulan) memperluas pembelajaran bilingual ke lebih banyak mata pelajaran dan memantapkan kemampuan guru. Target T1: 100% guru minimal B1; T2: 50% guru minimal B2 dan 20% minimal C1 (Desember 2027).",
      "Target kenaikan level per tahun: A2 → B1, B1 → B2, B2 → C1. Pemetaan ulang CEFR dilakukan Juni dan Desember, dan asesmen Duta Inggris diulang setiap 6 bulan.",
      "Pengembangan siswa diperkuat: Madani English Club setiap Sabtu 08.00–09.30, Peer Tutoring setiap Kamis sore oleh Student Ambassador, dan partisipasi lomba bahasa Inggris dari tingkat kecamatan sampai provinsi.",
      "Target T4: 100% mata pelajaran non-bahasa memiliki perangkat pembelajaran bilingual.",
    ],
    checklist: [
      { id: "F4-1", label: "Pemetaan ulang CEFR Juni dan Desember dilaksanakan" },
      { id: "F4-2", label: "100% guru minimal B1 (CEFR)" },
      { id: "F4-3", label: "Pembelajaran bilingual berjalan di minimal 50% mata pelajaran" },
      { id: "F4-4", label: "English Club dan Peer Tutoring berjalan rutin" },
      { id: "F4-5", label: "Partisipasi lomba sesuai target per jenjang" },
      { id: "F4-6", label: "Asesmen ulang Duta Inggris setiap 6 bulan dilaksanakan" },
    ],
  },
  {
    code: "F5", name: "Fase 5", title: "Evaluasi Final & Persiapan Akreditasi", start: "2028-05-01", end: "2028-06-30",
    target: "Siap full bilingual Juli 2028",
    source: "Bab 1.2–1.4",
    material: [
      "Fase 5 (2 bulan) mengevaluasi seluruh capaian program terhadap tujuan SMART T1–T6 sebelum full bilingual Juli 2028.",
      "Indikator utama: guru minimal B1 seluruhnya, sistem Duta Inggris berjalan, perangkat bilingual tersedia untuk semua mapel non-bahasa, dan rata-rata TOEFL Prediction siswa kelas 9 minimal 500.",
      "Sekolah menyiapkan akreditasi sebagai Sekolah Bilingual dengan Integrasi Cambridge Pathway (Cambridge Lower Secondary ESL 0876), serta menyosialisasikan kesiapan full bilingual kepada orang tua.",
    ],
    checklist: [
      { id: "F5-1", label: "Evaluasi akhir seluruh indikator SMART T1–T6 selesai" },
      { id: "F5-2", label: "Rata-rata TOEFL Prediction siswa kelas 9 ≥ 500" },
      { id: "F5-3", label: "Dokumen akreditasi Sekolah Bilingual & Cambridge Pathway siap" },
      { id: "F5-4", label: "Kesiapan full bilingual disosialisasikan ke orang tua" },
      { id: "F5-5", label: "Rencana pelaksanaan full bilingual Juli 2028 disahkan" },
    ],
  },
];

export const FULL_BILINGUAL_DATE = new Date("2028-07-01T00:00:00");

export const SMART_GOALS = [
  { code: "T1", text: "100% guru memiliki level bahasa Inggris minimal B1 (CEFR)", due: "Desember 2027" },
  { code: "T2", text: "50% guru minimal B2 dan 20% minimal C1", due: "Desember 2027" },
  { code: "T3", text: "Sistem Duta Inggris 3 level dengan insentif berjalan efektif", due: "Juli 2026 (Fase 1)" },
  { code: "T4", text: "100% mata pelajaran non-bahasa tersedia perangkat pembelajaran bilingual", due: "Desember 2027" },
  { code: "T5", text: "Rata-rata TOEFL Prediction siswa kelas 9 minimal 500", due: "Juni 2028" },
  { code: "T6", text: "Terakreditasi sebagai Sekolah Bilingual dengan Integrasi Cambridge Pathway", due: "2028" },
];

// ─────────────── ELITE (Bab 3.1) ───────────────
export const ELITE_WEEK_THEMES = [
  { week: 1, theme: "Greetings & Gratitude", mirror: "Membuka & menutup hari", mission: "Sapaan & rasa syukur" },
  { week: 2, theme: "Instructions", mirror: "Pelafalan", mission: "Instruksi kelas" },
  { week: 3, theme: "Student Interaction", mirror: "Ekspresi & intonasi", mission: "Interaksi dengan siswa" },
  { week: 4, theme: "Reflection", mirror: "Role play", mission: "Refleksi diri" },
];

export const DAILY_SCHEDULE = [
  { time: "05.30", activity: "Admin posting Mirror Morning (teks)" },
  { time: "05.30–06.00", activity: "Guru latihan di depan cermin & rekam voice note" },
  { time: "06.15", activity: "Deadline pengiriman voice note" },
  { time: "06.30", activity: "Admin posting Misi Harian" },
  { time: "12.00", activity: "Admin tag yang belum menjawab" },
  { time: "18.00", activity: "Admin beri apresiasi jawaban terbaik" },
  { time: "20.00", activity: "Deadline Misi Harian & penutupan" },
];

/** Status monitoring guru, mengikuti kolom "Status" pada Dashboard Sederhana (Bab 5.3). */
export function teacherStatus(opts: { participationPct: number; englishPct: number | null; level: Level }) {
  const target = opts.level === "NONE" ? 30 : LEVEL_RULES[opts.level].englishTargetPct;
  const english = opts.englishPct ?? 0;
  if (opts.participationPct >= 70 && english >= target) return { label: "On track", tone: "success" as const };
  if (opts.participationPct >= 50 && english >= target - 15) return { label: "Perhatian", tone: "warning" as const };
  return { label: "Perlu pendampingan", tone: "danger" as const };
}

// ─────────────── Lomba (Bab 7.4–7.9) ───────────────
export const COMPETITION_LEVELS: Record<string, { label: string; multiplier: number }> = {
  INTERNAL: { label: "Internal Sekolah", multiplier: 0.5 },
  KECAMATAN: { label: "Kecamatan", multiplier: 1 },
  KABUPATEN: { label: "Kabupaten/Kota", multiplier: 2 },
  PROVINSI: { label: "Provinsi", multiplier: 3 },
  NASIONAL: { label: "Nasional/Internasional", multiplier: 4 },
};

export const COMPETITION_RESULTS: Record<string, { label: string; base: number }> = {
  PESERTA: { label: "Peserta", base: 5 },
  FINALIS: { label: "Finalis", base: 10 },
  HARAPAN: { label: "Juara Harapan", base: 15 },
  JUARA_3: { label: "Juara 3", base: 20 },
  JUARA_2: { label: "Juara 2", base: 30 },
  JUARA_1: { label: "Juara 1", base: 40 },
};

export function competitionPoints(level: string, result: string) {
  return Math.round((COMPETITION_RESULTS[result]?.base ?? 0) * (COMPETITION_LEVELS[level]?.multiplier ?? 1));
}

export const COMPETITION_CATEGORIES = [
  { name: "Spelling Bee", difficulty: "Mudah – Sedang", level: "A2" },
  { name: "Reading Aloud", difficulty: "Mudah", level: "A2" },
  { name: "Story Telling", difficulty: "Sedang", level: "A2 – B1" },
  { name: "Picture Guessing", difficulty: "Sedang", level: "A2 – B1" },
  { name: "Speech / Pidato", difficulty: "Sulit", level: "B1 – B2" },
  { name: "English Debate", difficulty: "Sangat Sulit", level: "B2+" },
  { name: "Literasi Bahasa Inggris", difficulty: "Sedang – Sulit", level: "B1 – B2" },
  { name: "English Olympiad", difficulty: "Sulit", level: "B1 – B2" },
];

export const COMPETITION_TARGETS = [
  { level: "KECAMATAN", participation: "Minimal 5 cabang lomba", winners: "Minimal 2 juara" },
  { level: "KABUPATEN", participation: "Minimal 3 cabang lomba", winners: "Minimal 1 juara" },
  { level: "PROVINSI", participation: "Minimal 2 cabang lomba", winners: "Minimal 1 finalis" },
  { level: "NASIONAL", participation: "1 cabang lomba (jika memungkinkan)", winners: "Target partisipasi" },
];

// ─────────────── Poin gamifikasi guru ───────────────
export const TEACHER_POINTS = {
  mirrorMorning: 2,
  onTimeBonus: 1,
  dailyMission: 2,
  zonePer30: 1,
  buddySession: 2,
  phrase: 1,
};

export const SEMESTERS = ["Ganjil 2026/2027", "Genap 2026/2027", "Ganjil 2027/2028", "Genap 2027/2028"];
export const CURRENT_SEMESTER = "Ganjil 2026/2027";

// ─────────────── Master Mata Pelajaran SMP IT Al Madany ───────────────
export const SCHOOL_SUBJECTS = [
  "IPA",
  "Matematika",
  "Bahasa Inggris",
  "Bahasa Indonesia",
  "IPS",
  "PAI",
  "PJOK",
  "PKN",
  "Seni Budaya",
  "Informatika",
  "Prakarya",
  "Bahasa Arab",
  "Tahfidz",
  "Bimbingan Konseling (BK)",
  "Umum",
] as const;

export type SchoolSubject = (typeof SCHOOL_SUBJECTS)[number];
