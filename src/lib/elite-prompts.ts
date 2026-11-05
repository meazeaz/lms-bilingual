export interface EliteDailyPromptItem {
  id: string;
  date: string; // YYYY-MM-DD
  theme: string;
  category: "GREETING" | "INSTRUCTION" | "FOCUS" | "PRAISE" | "CLOSING" | "GENERAL";
  mirrorPrompt: string; // Naskah voice note Mirror Morning
  mirrorAudioTip?: string; // Panduan intonasi / aksen / tempo
  dailyMission: string; // Misi harian guru di kelas/sekolah
  targetCefr: string; // misal "A2 - B1"
  authorName?: string;
  notes?: string;
  updatedAt?: string;
}

export interface CuratedPromptTemplate {
  id: string;
  title: string;
  category: "GREETING" | "INSTRUCTION" | "FOCUS" | "PRAISE" | "CLOSING" | "GENERAL";
  theme: string;
  mirrorPrompt: string;
  mirrorAudioTip: string;
  dailyMission: string;
  targetCefr: string;
  dayOfWeek?: number; // 1 = Senin, ..., 5 = Jumat
}

export const CURATED_TEMPLATES: CuratedPromptTemplate[] = [
  {
    id: "tpl-mon-01",
    title: "Senin: Membuka Pekan & Motivasi Awal KBM",
    category: "GREETING",
    theme: "Setting Positive Vibes & Classroom Start",
    mirrorPrompt:
      "Good morning everyone! How was your weekend? I hope you are all recharged and ready for a wonderful week of learning. Please take out your books, open to chapter 3, and let's start today with a big smile!",
    mirrorAudioTip: "Gunakan intonasi naik dan bersemangat pada kata 'everyone!' serta tekankan kata 'recharged' dan 'ready'.",
    dailyMission: "Gunakan minimal 3 sapaan dan instruksi pembuka kelas dalam bahasa Inggris saat memulai jam pertama KBM hari ini.",
    targetCefr: "A2 - B1",
    dayOfWeek: 1,
  },
  {
    id: "tpl-tue-01",
    title: "Selasa: Mengendalikan Fokus & Suasana Kelas",
    category: "FOCUS",
    theme: "Attention Getters & Focus Transition",
    mirrorPrompt:
      "Eyes on me in 3, 2, 1... Thank you, class! Let's lower our voices and put down our pens for a moment. I need everyone's full attention on the whiteboard before we proceed to our experiment.",
    mirrorAudioTip: "Hitungan mundur '3, 2, 1' diucapkan dengan ritme tegas namun hangat, bukan membentak.",
    dailyMission: "Gunakan metode Attention Getter bilingual (mis. 'Eyes on me / Freeze please') saat kelas mulai ramai tanpa meninggikan nada bicara.",
    targetCefr: "A2",
    dayOfWeek: 2,
  },
  {
    id: "tpl-wed-01",
    title: "Rabu: Instruksi Diskusi Berpasangan (Pair Work)",
    category: "INSTRUCTION",
    theme: "Collaborative Learning & Partner Work",
    mirrorPrompt:
      "Now, please turn to your partner on your right. You have exactly 3 minutes to discuss question number 4. Be ready to share one key takeaway with the whole class. Ready? Start now!",
    mirrorAudioTip: "Beri jeda 1 detik setelah 'You have exactly 3 minutes' agar batas waktu dipahami siswa dengan jelas.",
    dailyMission: "Berikan instruksi pembagian kelompok atau diskusi teman sebangku (peer discussion) sepenuhnya dalam bahasa Inggris.",
    targetCefr: "B1",
    dayOfWeek: 3,
  },
  {
    id: "tpl-thu-01",
    title: "Kamis: Pujian Spesifik & Penguatan Sikap",
    category: "PRAISE",
    theme: "Positive Reinforcement & Encouraging Words",
    mirrorPrompt:
      "That is a brilliant attempt, Ahmad! You are definitely on the right track. Don't worry about making mistakes; mistakes are proof that our brains are learning. Who would like to build on Ahmad's answer?",
    mirrorAudioTip: "Gunakan nada hangat dan ekspresif pada 'brilliant attempt' dan 'proof that our brains are learning'.",
    dailyMission: "Berikan pujian spesifik (specific praise) dalam bahasa Inggris kepada minimal 3 siswa saat mereka menjawab atau mencoba.",
    targetCefr: "A2 - B1",
    dayOfWeek: 4,
  },
  {
    id: "tpl-fri-01",
    title: "Jumat: Refleksi Akhir Pekan & Penutupan",
    category: "CLOSING",
    theme: "Class Wrap-up & Safe Journey Home",
    mirrorPrompt:
      "Before we pack our bags, let's summarize what we have learned today. Can someone remind us of the two main ideas? Excellent! Have a blessed Friday and a restful weekend with your family. See you all on Monday!",
    mirrorAudioTip: "Tempo melambat dan santai pada penutup 'Have a blessed Friday and a restful weekend'.",
    dailyMission: "Tutup pelajaran dengan 2 kalimat rangkuman bahasa Inggris dan salam perpisahan bilingual di akhir jam mengajar.",
    targetCefr: "A2",
    dayOfWeek: 5,
  },
  {
    id: "tpl-cfu-01",
    title: "Pengecekan Pemahaman Cepat (CFU)",
    category: "INSTRUCTION",
    theme: "Formative Checking for Understanding",
    mirrorPrompt:
      "Give me a quick thumbs up if you understand the concept, thumbs to the side if you need one more example, and thumbs down if you want me to explain it from the beginning.",
    mirrorAudioTip: "Peragakan gestur tangan (thumbs up/side/down) bersamaan dengan pengucapan kalimat.",
    dailyMission: "Lakukan CFU non-verbal (thumbs up / show fingers) sebelum berpindah ke latihan soal mandiri siswa.",
    targetCefr: "A2",
  },
  {
    id: "tpl-corridor-01",
    title: "Pembiasaan di Ruang Guru & Koridor (Zone)",
    category: "GENERAL",
    theme: "Teacher-to-Teacher English Zone Habit",
    mirrorPrompt:
      "Good afternoon, Ustadzah! How was your 8th grade science class today? Did they manage to finish the lab observation sheet on time?",
    mirrorAudioTip: "Percakapan natural antara rekan pendidik dengan nada santai dan ramah.",
    dailyMission: "Ajak minimal 1 rekan guru berbincang santai 2-3 kalimat bahasa Inggris di area English Zone (Ruang Guru / Koridor).",
    targetCefr: "A2 - B1",
  },
  {
    id: "tpl-pocket-01",
    title: "Drill Hafalan Pocket Book Harian",
    category: "INSTRUCTION",
    theme: "Classroom Essential Phrases 1-10",
    mirrorPrompt:
      "Phrase of the day: 'Keep your voice down, please.' Let's repeat three times together: Keep your voice down, please... Keep your voice down, please... Keep your voice down, please.",
    mirrorAudioTip: "Artikulasi jelas pada bunyi 'voice' dan 'please'.",
    dailyMission: "Terapkan frasa Pocket Book hari ini secara spontan saat interaksi kelas berlangsung.",
    targetCefr: "A1 - A2",
  },
];

/**
 * Membuat teks siaran WhatsApp format rapi siap kirim.
 */
export function generateWhatsAppBroadcast(prompt: EliteDailyPromptItem, dateFormatted: string): string {
  return `🌅 *MIRROR MORNING & DAILY MISSION - PROGRAM ELITE 2028*
*SMPIT AL MADANY PARUNG PANJANG*
📅 ${dateFormatted}

🎯 *TEMA:* ${prompt.theme}
🎯 *TARGET CEFR:* ${prompt.targetCefr}

🗣️ *1. MIRROR MORNING (06.30 - 07.30 WIB):*
Silakan rekam Voice Note (30-60 detik) berlatih di depan cermin membacakan naskah berikut:
"${prompt.mirrorPrompt}"

${prompt.mirrorAudioTip ? `💡 *Tips Pelafalan & Intonasi:*\n${prompt.mirrorAudioTip}\n` : ""}
⚡ *2. MISI HARIAN DI KELAS / KANTOR (10.00 - 15.00 WIB):*
${prompt.dailyMission}

⏰ *PENGINGAT POIN GAMIFIKASI:*
• Kirim sebelum pukul 07.30 WIB untuk klaim *On-Time Bonus Point (+1 Poin)*.
• Selesaikan misi & laporkan di web LMS sebelum pukul 20.00 WIB.

Mari bersama rawat pembiasaan menuju *Full Bilingual SMPIT Al Madany 2028*! 🚀 Bismillah!`;
}
