// Data contoh LMS Bilingual. Jalankan: npm run db:seed
import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { awardedLevel, finalScore, oralScore, simulationScore } from "../src/lib/program";
import { seedRiseUp } from "./seed-rise-up.mjs";
import { seedModulAjar } from "./seed-modul-ajar.mjs";

const file = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace(/^file:/, "");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.isAbsolute(file) ? file : path.join(process.cwd(), file) }) });

const day = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const chance = (p: number) => rand() < p;

const PHRASES: [string, string, string][] = [
  ["Opening", "Selamat pagi, anak-anak.", "Good morning, students."], ["Opening", "Apa kabar hari ini?", "How are you today?"],
  ["Opening", "Senang bertemu kalian.", "Nice to see you."], ["Opening", "Mari kita mulai pelajarannya.", "Let's start the lesson."],
  ["Opening", "Siapa yang tidak hadir hari ini?", "Who is absent today?"],
  ["Instructions", "Dengarkan baik-baik.", "Listen carefully."], ["Instructions", "Perhatikan ke depan.", "Pay attention, please."],
  ["Instructions", "Buka buku halaman...", "Open your book to page..."], ["Instructions", "Tutup buku kalian.", "Close your books."],
  ["Instructions", "Kerjakan sendiri.", "Work individually."], ["Instructions", "Kerjakan berpasangan.", "Work in pairs."],
  ["Instructions", "Kerjakan berkelompok.", "Work in groups."], ["Instructions", "Angkat tangan kalau mau bertanya.", "Raise your hand."],
  ["Instructions", "Tulis di buku catatan.", "Write it in your notebook."], ["Instructions", "Bacalah teks ini.", "Read this text."],
  ["Instructions", "Bacalah dengan nyaring.", "Read aloud."], ["Instructions", "Ulangi setelah saya.", "Repeat after me."],
  ["Instructions", "Siapa bisa menjawab?", "Who can answer?"], ["Instructions", "Ada pertanyaan?", "Any questions?"],
  ["Instructions", "Maju ke depan kelas.", "Come forward."], ["Instructions", "Kumpulkan tugasnya.", "Submit your assignment."],
  ["Instructions", "Ambil lembar kerja.", "Take the worksheet."], ["Instructions", "Warnai gambar ini.", "Color this picture."],
  ["Instructions", "Lingkari jawaban yang benar.", "Circle the correct answer."], ["Instructions", "Cocokkan dengan pasangan.", "Match with the pair."],
  ["Classroom Management", "Jangan ramai, tolong.", "Don't make noise, please."], ["Classroom Management", "Tenang.", "Be quiet."],
  ["Classroom Management", "Duduk dengan baik.", "Sit nicely."], ["Classroom Management", "Jangan berlari di dalam kelas.", "Don't run inside."],
  ["Classroom Management", "Simpan ponsel kalian.", "Put away your phones."], ["Classroom Management", "Selesaikan tepat waktu.", "Finish on time."],
  ["Classroom Management", "Waktu hampir habis.", "Time is almost up."], ["Classroom Management", "Berhenti, sekarang.", "Stop now."],
  ["Classroom Management", "Kembali ke tempat duduk.", "Go back to your seat."], ["Classroom Management", "Ambil sampah di lantai.", "Pick up the trash."],
  ["Feedback & Motivation", "Bagus! / Hebat!", "Good! / Great! / Excellent!"], ["Feedback & Motivation", "Usaha yang bagus.", "Good effort."],
  ["Feedback & Motivation", "Hampir benar. Coba lagi.", "Almost correct. Try again."], ["Feedback & Motivation", "Lebih baik dari sebelumnya.", "Better than before."],
  ["Feedback & Motivation", "Kalian bisa melakukannya.", "You can do it."], ["Feedback & Motivation", "Terus berlatih.", "Keep practicing."],
  ["Feedback & Motivation", "Saya bangga dengan kalian.", "I'm proud of you."], ["Feedback & Motivation", "Jangan menyerah.", "Don't give up."],
  ["Closing", "Hari ini kita belajar tentang...", "Today we learned about..."], ["Closing", "Apa yang sudah kita pelajari?", "What have we learned?"],
  ["Closing", "Tugas rumah:...", "Your homework:..."], ["Closing", "Jangan lupa belajar di rumah.", "Don't forget to study."],
  ["Closing", "Sampai jumpa besok.", "See you tomorrow."], ["Closing", "Terima kasih atas perhatiannya.", "Thank you for your attention."],
  ["Closing", "Mari kita akhiri dengan doa.", "Let's close with a prayer."],
];

const BADGES = [
  ["ENGLISH_STARTER", "English Starter", "Lulus asesmen Bronze Ambassador", "Sprout", "bronze"],
  ["ENGLISH_PRACTITIONER", "English Practitioner", "Lulus asesmen Silver Ambassador", "Rocket", "silver"],
  ["ENGLISH_LEADER", "English Leader", "Lulus asesmen Gold Ambassador", "Crown", "gold"],
  ["EARLY_BIRD", "Early Bird", "10 voice note Mirror Morning sebelum 06.15", "Sunrise", "coral"],
  ["MOST_IMPROVED", "Most Improved", "Nilai asesmen naik ≥ 10 poin", "TrendingUp", "mint"],
  ["TOEFL_CHALLENGER", "TOEFL Challenger", "TOEFL naik > 50 poin atau ≥ 550", "GraduationCap", "brand"],
  ["COLLABORATION", "Collaboration", "8 sesi English Buddy terverifikasi", "Handshake", "mint"],
  ["POCKET_MASTER", "Pocket Book Master", "Hafal 50 kalimat instruksi", "BookMarked", "brand"],
  ["CHALLENGE_CHAMPION", "Challenge Champion", "Menyelesaikan 12 Weekly Challenge", "Target", "coral"],
  ["FULL_PARTICIPATION", "Full Participation", "Partisipasi ELITE 100% dalam 30 hari", "Flame", "gold"],
];

const CHALLENGES = [
  ["Greeting Champion", "Sapa minimal 5 rekan guru dalam bahasa Inggris setiap pagi selama seminggu.", "5 sapaan/hari"],
  ["Instruction Starter", "Gunakan 5 instruksi Pocket Book di kelas dan catat kalimat yang dipakai.", "5 instruksi"],
  ["Praise Power", "Berikan 10 pujian dalam bahasa Inggris kepada siswa.", "10 pujian"],
  ["English Zone Explorer", "Hadir di English Zone 3×30 menit dalam seminggu.", "3 sesi"],
  ["Buddy Talk", "Lakukan 2 sesi English Buddy dan rekam simulasi mengajar 10 menit.", "2 sesi + 1 rekaman"],
  ["CFU Master", "Ajukan 3 pertanyaan pemeriksaan pemahaman (CFU) di setiap kelas.", "3 CFU/kelas"],
  ["Vocabulary Builder", "Kenalkan 10 istilah mapel dalam bahasa Inggris kepada siswa.", "10 istilah"],
  ["Transition Pro", "Pakai pola \"First we do A, then B, finally C\" di 3 pertemuan.", "3 pertemuan"],
  ["Story Moment", "Kirim voice note 1 menit tentang pengalaman mengajar ke grup ELITE.", "1 voice note"],
  ["Peer Observer", "Observasi kelas rekan dan beri 2 umpan balik positif dalam bahasa Inggris.", "2 umpan balik"],
  ["Content Creator", "Buat 1 konten sederhana bertema bilingual (poster/video).", "1 konten"],
  ["Full English Closing", "Tutup semua kelas dalam satu minggu sepenuhnya dalam bahasa Inggris.", "Semua kelas"],
];

type T = { name: string; email: string; subject: string; level: "NONE" | "BRONZE" | "SILVER" | "GOLD"; cefr: string; toefl: number; since?: string; english: number; engage: number; phrases: number; classes: string[] };
const TEACHERS: T[] = [
  { name: "Fitri Handayani, S.Pd.", email: "fitri", subject: "IPA", level: "GOLD", cefr: "C1", toefl: 560, since: "2026-07-25", english: 85, engage: 0.98, phrases: 50, classes: ["8A", "8B", "9A"] },
  { name: "Sarah Amalia, S.Pd.", email: "sarah", subject: "Bahasa Inggris", level: "GOLD", cefr: "C1", toefl: 590, since: "2026-07-25", english: 90, engage: 0.97, phrases: 50, classes: ["7A", "7B", "8A", "8B", "9A", "9B"] },
  { name: "Yazid Ramadhan, S.Pd.", email: "yazid", subject: "Matematika", level: "SILVER", cefr: "B2", toefl: 520, since: "2026-07-25", english: 60, engage: 0.92, phrases: 38, classes: ["7A", "8A", "9B"] },
  { name: "Ani Rahmawati, S.Pd.", email: "ani", subject: "IPS", level: "SILVER", cefr: "B1+", toefl: 505, since: "2026-07-25", english: 55, engage: 0.9, phrases: 36, classes: ["7B", "8B", "9A"] },
  { name: "Budi Santoso, S.Pd.", email: "budi", subject: "PJOK", level: "BRONZE", cefr: "B1", toefl: 480, since: "2026-07-25", english: 40, engage: 0.85, phrases: 28, classes: ["7A", "7B", "8A"] },
  { name: "Ela Nurlaela, S.Pd.", email: "ela", subject: "IPS", level: "BRONZE", cefr: "A2+", toefl: 470, since: "2026-07-25", english: 35, engage: 0.75, phrases: 22, classes: ["7A", "9B"] },
  { name: "Dedi Kurniawan, S.Pd.", email: "dedi", subject: "Matematika", level: "BRONZE", cefr: "B1", toefl: 476, since: "2026-07-25", english: 38, engage: 0.82, phrases: 25, classes: ["7B", "8B"] },
  { name: "Gina Lestari, S.Pd.", email: "gina", subject: "Seni Budaya", level: "BRONZE", cefr: "A2+", toefl: 455, since: "2026-09-26", english: 30, engage: 0.78, phrases: 21, classes: ["8A", "9A"] },
  { name: "Haris Maulana, S.Pd.I.", email: "haris", subject: "PAI", level: "NONE", cefr: "A2", toefl: 430, english: 20, engage: 0.62, phrases: 12, classes: ["7A", "8A"] },
  { name: "Indah Permatasari, S.Pd.", email: "indah", subject: "IPA", level: "NONE", cefr: "A2", toefl: 420, english: 18, engage: 0.55, phrases: 9, classes: ["7A", "7B"] },
  { name: "Farid Hidayat, S.Pd.", email: "farid", subject: "PKN", level: "NONE", cefr: "A2", toefl: 410, english: 12, engage: 0.4, phrases: 5, classes: ["9A", "9B"] },
];

const STUDENT_NAMES = [
  "Aisyah Putri", "Muhammad Rizki", "Nabila Zahra", "Fauzan Akbar", "Salsabila Nur", "Rafi Pratama",
  "Khansa Aulia", "Daffa Alfarizi", "Zahra Kamila", "Arkan Maulana", "Hana Safitri", "Bilal Ramadhan",
  "Alya Rahma", "Naufal Hakim", "Kayla Azzahra", "Rayyan Firdaus", "Syifa Humaira", "Fathir Ananda",
  "Nayla Khairunnisa", "Ilham Saputra", "Aqila Nadhifa", "Hafidz Ibrahim", "Keisha Amira", "Zidan Alwi",
  "Raisa Andini", "Farhan Hidayat", "Dinda Maharani", "Azka Pradipta", "Lubna Sakinah", "Rasyid Umar",
  "Tsabita Aini", "Yusuf Haikal", "Mutiara Syahla", "Gibran Athallah", "Shafa Kirana", "Rendra Wijaya",
];

const MATERIALS = [
  {
    title: "Classroom Instructions", category: "Ungkapan Sehari-hari", subject: "Umum", grade: 7, cefr: "A1",
    summary: "Pahami instruksi yang paling sering diucapkan guru di kelas bilingual.",
    content: "Di kelas bilingual, guru akan memberi instruksi dalam bahasa Inggris. Kamu tidak perlu menerjemahkan kata per kata. Perhatikan kata kerjanya: open, close, raise, work, listen.\n\nContoh: \"Open your book to page ten\" berarti buka buku halaman sepuluh. \"Work in pairs\" berarti kerjakan berpasangan.\n\nTips: kalau belum paham, angkat tangan dan katakan \"Excuse me, can you repeat, please?\"",
    vocab: [["open your book", "buka bukumu"], ["raise your hand", "angkat tangan"], ["work in pairs", "kerjakan berpasangan"], ["listen carefully", "dengarkan baik-baik"], ["submit", "kumpulkan"]],
    quiz: [
      ["\"Raise your hand\" artinya…", ["Angkat tanganmu", "Buka bukumu", "Duduk dengan tenang"], 0],
      ["Guru berkata \"Work in pairs\". Kamu harus…", ["Bekerja sendiri", "Bekerja berpasangan", "Bekerja berkelompok besar"], 1],
      ["Kalimat untuk meminta guru mengulang:", ["See you tomorrow", "Can you repeat, please?", "Good morning"], 1],
      ["\"Submit your assignment\" artinya…", ["Kerjakan tugas", "Kumpulkan tugas", "Baca tugas"], 1],
      ["\"Close your books\" artinya…", ["Tutup buku kalian", "Buka buku kalian", "Ambil buku kalian"], 0],
    ],
  },
  {
    title: "Math Glossary: Fractions & Geometry", category: "Kosakata Mapel", subject: "Matematika", grade: 7, cefr: "A2",
    summary: "Istilah matematika dasar dalam dua bahasa untuk kelas Matematika bilingual.",
    content: "Fraction artinya pecahan. Pada pecahan 3/4, angka 3 disebut numerator (pembilang) dan 4 disebut denominator (penyebut).\n\nUntuk geometri: the area of a triangle is half of base times height. Artinya luas segitiga adalah setengah alas kali tinggi.",
    vocab: [["fraction", "pecahan"], ["numerator", "pembilang"], ["denominator", "penyebut"], ["area", "luas"], ["base", "alas"], ["height", "tinggi"]],
    quiz: [
      ["\"Denominator\" artinya…", ["Pembilang", "Penyebut", "Pecahan"], 1],
      ["\"The area of a triangle\" artinya…", ["Keliling segitiga", "Luas segitiga", "Sudut segitiga"], 1],
      ["Pada 2/5, numerator-nya adalah…", ["2", "5", "7"], 0],
      ["\"Height\" artinya…", ["Alas", "Lebar", "Tinggi"], 2],
      ["\"Fraction\" artinya…", ["Pecahan", "Persamaan", "Perkalian"], 0],
    ],
  },
  {
    title: "Science Glossary: Photosynthesis", category: "Kosakata Mapel", subject: "IPA", grade: 8, cefr: "A2+",
    summary: "Jelaskan proses fotosintesis dengan istilah sains berbahasa Inggris.",
    content: "Photosynthesis is the process plants use to make food. Plants need sunlight, water, and carbon dioxide. They produce glucose and oxygen.\n\nKata kunci: leaves (daun) menyerap sunlight (cahaya matahari) dengan chlorophyll (klorofil).",
    vocab: [["photosynthesis", "fotosintesis"], ["sunlight", "cahaya matahari"], ["carbon dioxide", "karbon dioksida"], ["oxygen", "oksigen"], ["chlorophyll", "klorofil"], ["leaves", "daun"]],
    quiz: [
      ["Plants need … to do photosynthesis.", ["Sunlight", "Sand", "Salt"], 0],
      ["Photosynthesis produces glucose and…", ["Nitrogen", "Oxygen", "Hydrogen"], 1],
      ["\"Chlorophyll\" artinya…", ["Klorofil", "Kloroplas", "Karbohidrat"], 0],
      ["\"Leaves\" artinya…", ["Akar", "Batang", "Daun"], 2],
      ["Gas yang diserap tumbuhan:", ["Oxygen", "Carbon dioxide", "Helium"], 1],
    ],
  },
  {
    title: "Simple Past Tense in Daily Stories", category: "Grammar", subject: "Bahasa Inggris", grade: 8, cefr: "A2+",
    summary: "Ceritakan kegiatan kemarin dengan simple past tense.",
    content: "Simple past tense dipakai untuk kejadian yang sudah selesai. Regular verbs ditambah -ed: play → played, study → studied. Irregular verbs berubah bentuk: go → went, eat → ate.\n\nContoh: \"Yesterday I went to the library and studied for two hours.\"",
    vocab: [["yesterday", "kemarin"], ["went", "pergi (lampau)"], ["studied", "belajar (lampau)"], ["ate", "makan (lampau)"], ["last week", "minggu lalu"]],
    quiz: [
      ["Bentuk lampau dari \"go\":", ["Goed", "Went", "Gone"], 1],
      ["\"I ___ football yesterday.\"", ["play", "played", "playing"], 1],
      ["Bentuk lampau dari \"eat\":", ["Ate", "Eated", "Eaten"], 0],
      ["Kalimat simple past yang benar:", ["She study last night", "She studied last night", "She studying last night"], 1],
      ["\"Last week\" artinya…", ["Minggu depan", "Minggu lalu", "Akhir pekan"], 1],
    ],
  },
  {
    title: "Social Studies: Supply and Demand", category: "Kosakata Mapel", subject: "IPS", grade: 9, cefr: "B1",
    summary: "Pahami hukum penawaran dan permintaan dalam bahasa Inggris.",
    content: "The law of demand: when the price goes up, people buy less. The law of supply: when the price goes up, sellers offer more.\n\nThe market reaches equilibrium when supply equals demand (keseimbangan pasar).",
    vocab: [["supply", "penawaran"], ["demand", "permintaan"], ["price", "harga"], ["equilibrium", "keseimbangan"], ["seller", "penjual"], ["buyer", "pembeli"]],
    quiz: [
      ["\"Demand\" artinya…", ["Penawaran", "Permintaan", "Produksi"], 1],
      ["When price goes up, demand usually…", ["Goes down", "Goes up", "Stays the same"], 0],
      ["\"Equilibrium\" artinya…", ["Keseimbangan", "Kelangkaan", "Kenaikan"], 0],
      ["\"Seller\" artinya…", ["Pembeli", "Penjual", "Pemasok"], 1],
      ["When price goes up, sellers offer…", ["Less", "More", "Nothing"], 1],
    ],
  },
  {
    title: "PJOK: Warm-up Commands", category: "Kosakata Mapel", subject: "PJOK", grade: null, cefr: "A1",
    summary: "Instruksi pemanasan dan olahraga yang dipakai di lapangan.",
    content: "Sebelum olahraga, guru memimpin warm-up (pemanasan). Ikuti instruksinya: \"Stand in a line\", \"Stretch your arms\", \"Jump ten times\", \"Take a deep breath\".",
    vocab: [["warm-up", "pemanasan"], ["stretch", "meregangkan"], ["stand in a line", "berbaris"], ["jump", "melompat"], ["take a deep breath", "tarik napas dalam"]],
    quiz: [
      ["\"Warm-up\" artinya…", ["Pendinginan", "Pemanasan", "Istirahat"], 1],
      ["\"Stand in a line\" artinya…", ["Berbaris", "Duduk", "Berlari"], 0],
      ["\"Stretch your arms\" artinya…", ["Angkat kakimu", "Regangkan lenganmu", "Tepuk tangan"], 1],
      ["\"Take a deep breath\" artinya…", ["Tarik napas dalam", "Minum air", "Tutup mata"], 0],
      ["\"Jump ten times\" artinya…", ["Lari sepuluh kali", "Lompat sepuluh kali", "Duduk sepuluh kali"], 1],
    ],
  },
];

async function main() {
  console.log("Menghapus data lama…");
  for (const m of ["quizAttempt", "quiz", "materialRead", "material", "clubAttendance", "clubSession", "competitionEntry", "competition", "studentAssessment",
    "teacherBadge", "badge", "challengeProgress", "weeklyChallenge", "phraseMastery", "phrase", "microTeaching", "lessonPlan", "reflection", "observation",
    "appeal", "assessment", "cefrRecord", "dailyLog", "teachingAssignment", "student", "teacher", "classRoom", "announcement", "user"] as const) {
    // @ts-expect-error akses delegasi dinamis
    await db[m].deleteMany();
  }

  const pw = (p: string) => bcrypt.hashSync(p, 10);
  const adminPw = pw("admin123"), guruPw = pw("guru123"), siswaPw = pw("siswa123");

  const admin = await db.user.create({ data: { name: "Bambang Priyanto, S.Kom", email: "admin@almadany.sch.id", passwordHash: adminPw, role: "ADMIN", title: "Ketua EDT" } });
  await db.user.create({ data: { name: "Kepala Sekolah", email: "kepsek@almadany.sch.id", passwordHash: adminPw, role: "ADMIN", title: "Kepala Sekolah" } });

  const phrases = [];
  for (const [i, [category, indonesian, english]] of PHRASES.entries()) phrases.push(await db.phrase.create({ data: { number: i + 1, category, indonesian, english } }));
  const badges = new Map<string, string>();
  for (const [code, name, description, icon, color] of BADGES) badges.set(code, (await db.badge.create({ data: { code, name, description, icon, color } })).id);
  const challenges = [];
  for (const [i, [title, description, target]] of CHALLENGES.entries()) challenges.push(await db.weeklyChallenge.create({ data: { week: i + 1, title, description, target, points: 10 } }));

  const classes = new Map<string, string>();
  for (const name of ["7A", "7B", "8A", "8B", "9A", "9B"]) classes.set(name, (await db.classRoom.create({ data: { name, grade: Number(name[0]) } })).id);

  console.log("Membuat guru & aktivitas…");
  const teacherIds: string[] = [];
  const workdays: Date[] = [];
  for (let d = day("2026-08-03"); d <= day("2026-10-23"); d = new Date(d.getTime() + 86400000)) if (d.getUTCDay() % 6 !== 0) workdays.push(d);

  for (const [ti, t] of TEACHERS.entries()) {
    const user = await db.user.create({ data: { name: t.name, email: `${t.email}@almadany.sch.id`, passwordHash: guruPw, role: "TEACHER" } });
    const teacher = await db.teacher.create({
      data: {
        userId: user.id, subject: t.subject, nip: `19${80 + ti}0${ti + 1}12 2015${ti % 2 ? "02" : "01"} 1 00${ti + 1}`, whatsapp: `0812-3456-70${String(ti).padStart(2, "0")}`,
        cefrLevel: t.cefr, toeflScore: t.toefl, ambassadorLevel: t.level, levelSince: t.since ? day(t.since) : null, isPilot: ["fitri", "yazid", "ani", "sarah"].includes(t.email),
      },
    });
    teacherIds.push(teacher.id);
    for (const [ci, c] of t.classes.entries()) await db.teachingAssignment.create({ data: { teacherId: teacher.id, classId: classes.get(c)!, isHomeroom: ci === 0 && ti < 6 } });

    await db.cefrRecord.createMany({ data: [
      { teacherId: teacher.id, date: day("2026-04-15"), cefrLevel: t.cefr === "C1" ? "B2+" : t.cefr === "B2" ? "B1+" : t.cefr === "B1+" ? "B1" : t.cefr === "B1" ? "A2+" : "A2", toefl: t.toefl - 25 - Math.round(rand() * 20), source: "Pemetaan awal EDT (TOEFL Prediction)" },
      { teacherId: teacher.id, date: day("2026-06-20"), cefrLevel: t.cefr, toefl: t.toefl, source: "Pemetaan ulang Juni" },
    ] });

    // Log ELITE harian
    const logs = workdays.map((date, i) => {
      const recent = i >= workdays.length - 3;
      const mirror = chance(t.engage), mission = chance(t.engage - 0.03);
      return {
        teacherId: teacher.id, date, mirrorMorning: mirror, voiceNoteOnTime: mirror && chance(0.7), dailyMission: mission,
        missionAnswer: mission ? "Good morning, everyone! Let's make this day productive." : null,
        englishZoneMinutes: chance(t.engage * 0.75) ? 30 : 0, buddySession: t.level !== "GOLD" && chance(0.3), englishInClassPct: Math.max(5, Math.min(95, t.english + Math.round((rand() - 0.5) * 16))),
        status: (recent ? "PENDING" : "APPROVED") as "PENDING" | "APPROVED", reviewerId: recent ? null : admin.id,
      };
    }).filter((l) => l.mirrorMorning || l.dailyMission || l.englishZoneMinutes);
    await db.dailyLog.createMany({ data: logs });

    // Asesmen Duta Inggris (Juli 2026, akhir Fase 1)
    const mk = async (date: string, target: "BRONZE" | "SILVER" | "GOLD", base: number) => {
      const clamp = (v: number) => Math.max(1, Math.min(4, Math.round(v)));
      const oralA = [0, 1, 2, 3, 4].map(() => clamp(base + (rand() - 0.5) * 1.2));
      const simA = [0, 1, 2, 3].map(() => clamp(base + (rand() - 0.5) * 1.2));
      const waived = target === "GOLD" && t.toefl >= 550;
      const written = waived ? 100 : Math.round(Math.min(100, base * 23 + rand() * 8));
      const o = oralScore(oralA), s = simulationScore(simA), f = finalScore(o, written, s);
      const lvl = awardedLevel(f, target, t.toefl >= 550);
      await db.assessment.create({ data: {
        teacherId: teacher.id, assessorId: admin.id, secondExaminer: "Sarah Amalia, S.Pd. (C1)", date: day(date), targetLevel: target,
        oralFluency: oralA[0], oralPronunciation: oralA[1], oralGrammar: oralA[2], oralVocabulary: oralA[3], oralConfidence: oralA[4], oralScore: o,
        writtenScore: written, writtenWaived: waived, simInstruction: simA[0], simAdaptation: simA[1], simConsistency: simA[2], simClarity: simA[3], simulationScore: s,
        finalScore: f, passed: lvl !== "NONE", awardedLevel: lvl, acknowledged: true,
        strengths: "Pengucapan jelas dan berani berbicara di depan kelas.", improvements: "Tambah variasi kalimat transisi antar kegiatan.",
      } });
    };
    if (t.level === "GOLD") await mk("2026-07-22", "GOLD", 3.6);
    if (t.level === "SILVER") { await mk("2026-07-22", "SILVER", 3.25); }
    if (t.level === "BRONZE") await mk(t.since === "2026-09-26" ? "2026-09-24" : "2026-07-22", "BRONZE", 2.85);
    if (t.level === "NONE") await mk("2026-07-22", "BRONZE", 2.1);

    // Pocket Book
    await db.phraseMastery.createMany({ data: phrases.slice(0, t.phrases + 2).map((p, i) => ({ teacherId: teacher.id, phraseId: p.id, status: (i < t.phrases ? "APPROVED" : "PENDING") as "APPROVED" | "PENDING" })) });

    // Weekly challenge
    const done = Math.round(t.engage * 11);
    await db.challengeProgress.createMany({ data: challenges.slice(0, done).map((c) => ({ teacherId: teacher.id, challengeId: c.id, evidence: "Sudah dilakukan dan dicatat di jurnal mengajar.", status: "APPROVED" as const })) });

    // Observasi kelas
    const yes = Math.round((t.english / 100) * 10 + 1);
    const checklist = Array.from({ length: 10 }, (_, i) => i < Math.min(10, yes));
    const bucket = t.english < 20 ? ["<20", 10] : t.english < 40 ? ["20-40", 30] : t.english < 60 ? ["40-60", 50] : t.english < 80 ? ["60-80", 70] : [">80", 90];
    await db.observation.create({ data: {
      teacherId: teacher.id, observerId: admin.id, date: day("2026-10-08"), subject: t.subject, className: t.classes[0], checklist: JSON.stringify(checklist),
      englishPctBucket: String(bucket[0]), englishPct: Number(bucket[1]), score: checklist.filter(Boolean).length * 10,
      strengths: "Membuka kelas dengan sapaan Inggris yang percaya diri.\nPujian kepada siswa bervariasi.", improvements: "Konsistensi bahasa Inggris saat menjawab pertanyaan siswa.",
      recommendation: t.english >= 60 ? "SIAP_NAIK" : t.english >= 30 ? "PERTAHANKAN" : "PENDAMPINGAN", feedbackGiven: true,
    } });

    // Badge sederhana
    const award = (code: string) => db.teacherBadge.create({ data: { teacherId: teacher.id, badgeId: badges.get(code)! } });
    if (t.level !== "NONE") await award("ENGLISH_STARTER");
    if (t.level === "SILVER" || t.level === "GOLD") await award("ENGLISH_PRACTITIONER");
    if (t.level === "GOLD") await award("ENGLISH_LEADER");
    if (t.engage >= 0.8) await award("EARLY_BIRD");
    if (t.toefl >= 550) await award("TOEFL_CHALLENGER");
    if (t.phrases >= 50) await award("POCKET_MASTER");
  }
  // Pasangan buddy: guru A2 dengan guru B1+
  const buddyPairs: [number, number][] = [[8, 2], [9, 3], [10, 0], [5, 1]];
  for (const [a, b] of buddyPairs) await db.teacher.update({ where: { id: teacherIds[a] }, data: { buddyId: teacherIds[b] } });

  console.log("Membuat siswa…");
  const sarahId = teacherIds[1];
  const studentIds: string[] = [];
  const classNames = ["7A", "7B", "8A", "8B", "9A", "9B"];
  for (const [i, name] of STUDENT_NAMES.entries()) {
    const cls = classNames[Math.floor(i / 6)];
    const grade = Number(cls[0]);
    const pare = chance(0.65);
    const levels = grade === 7 ? ["Pre A1", "A1", "A2"] : grade === 8 ? ["A1", "A2", "A2+"] : ["A2", "A2+", "B1"];
    const start = pare ? 1 : 0;
    const now = Math.min(2, start + (chance(0.6) ? 1 : 0));
    const first = name.split(" ")[0].toLowerCase();
    const user = await db.user.create({ data: { name, email: `${first}@siswa.almadany.sch.id`, passwordHash: siswaPw, role: "STUDENT" } });
    const st = await db.student.create({ data: { userId: user.id, nis: `2026${String(i + 1).padStart(3, "0")}`, classId: classes.get(cls)!, cefrLevel: levels[now], pareAlumni: pare, isStudentAmbassador: pare && grade >= 8 && chance(0.4) } });
    studentIds.push(st.id);
    const type = grade === 7 ? "OBSERVASI" : grade === 8 ? "SPEAKING" : "TOEFL";
    const s1 = grade === 9 ? 400 + Math.round(rand() * 60) + start * 25 : 55 + Math.round(rand() * 15) + start * 8;
    const s2 = grade === 9 ? s1 + 15 + Math.round(rand() * 25) : Math.min(98, s1 + 6 + Math.round(rand() * 10));
    await db.studentAssessment.createMany({ data: [
      { studentId: st.id, teacherId: sarahId, date: day("2026-08-14"), type, semester: "Ganjil 2026/2027", score: s1, cefrLevel: levels[start], speaking: 2 + start, listening: 2 + start, reading: 2, writing: 2, useOfEnglish: 2, notes: "Asesmen awal semester." },
      { studentId: st.id, teacherId: sarahId, date: day("2026-10-16"), type, semester: "Ganjil 2026/2027", score: s2, cefrLevel: levels[now], speaking: 2 + now, listening: 3, reading: 2 + (now > 0 ? 1 : 0), writing: 2, useOfEnglish: 2 + (now > 1 ? 1 : 0), notes: "Semakin berani merespon instruksi guru." },
    ] });
  }

  console.log("Membuat materi & kuis…");
  for (const m of MATERIALS) {
    const mat = await db.material.create({ data: {
      title: m.title, category: m.category, subject: m.subject, grade: m.grade, cefrLevel: m.cefr, summary: m.summary, content: m.content,
      vocabulary: JSON.stringify(m.vocab.map(([en, id]) => ({ en, id }))), authorId: sarahId,
    } });
    const quiz = await db.quiz.create({ data: { materialId: mat.id, title: `Kuis: ${m.title}`, questions: JSON.stringify(m.quiz.map(([q, options, answer]) => ({ q, options, answer }))), passScore: 70 } });
    for (const sid of studentIds) {
      if (chance(0.45)) {
        const score = [60, 80, 80, 100, 100][Math.floor(rand() * 5)];
        await db.quizAttempt.create({ data: { quizId: quiz.id, studentId: sid, score, answers: "[]" } });
        await db.materialRead.create({ data: { studentId: sid, materialId: mat.id } });
      }
    }
  }

  await db.announcement.createMany({ data: [
    { title: "Asesmen Duta Inggris periode November", body: "Pendaftaran asesmen level Bronze/Silver/Gold dibuka sampai 5 November 2026. Jadwal asesmen 12–14 November di Ruang Guru.", audience: "TEACHER", authorId: admin.id },
    { title: "English Club Sabtu ini: Storytelling", body: "English Club Sabtu, 08.00–09.30 di Aula. Tema: storytelling dengan properti. Bawa satu benda favoritmu!", audience: "ALL", authorId: admin.id },
  ] });

  // Kurikulum inti: Rise Up! Teens 1 (10 unit + Progress Test)
  const riseUp = await seedRiseUp(db);
  console.log(`Rise Up! Teens 1: ${riseUp.total} unit materi inti.`);
  const modul = await seedModulAjar(db);
  console.log(`Modul Ajar: ${modul.total} RPP induk dari admin.`);

  console.log("Selesai. Akun: admin@almadany.sch.id / admin123 · fitri@almadany.sch.id / guru123 · aisyah@siswa.almadany.sch.id / siswa123");
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
