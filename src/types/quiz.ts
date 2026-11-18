export type QuestionType = "MULTIPLE_CHOICE" | "READING" | "LISTENING" | "SPEAKING" | "WRITING" | "FILL_IN";

export type QuizQuestion = {
  id?: string;
  type: QuestionType;
  q: string; // Teks pertanyaan / prompt menulis / pertanyaan listening / kalimat rumpang
  section?: string; // Judul bagian (mis. "Part 1 · Vocabulary"); tampil sebagai pemisah saat berganti bagian

  // Pilihan Ganda & Listening Format MC
  options?: string[];
  answer?: number; // Indeks opsi benar (0..3)

  // Spesifik Soal Reading (Membaca): teks bacaan + pertanyaan pemahaman
  passageTitle?: string; // Judul teks bacaan (opsional)
  passage?: string; // Teks bacaan bahasa Inggris yang dibaca siswa sebelum menjawab
  readingFormat?: "MC" | "FILL_IN"; // Format jawaban: Pilihan ganda atau Isian singkat
  allowAudio?: boolean; // Siswa boleh mendengarkan teks bacaan (default: true bila tidak diisi)
  // Format FILL_IN memakai fillInAnswer + acceptedAnswers (lihat di bawah)

  // Spesifik Soal Listening (Menyimak)
  audioSourceType?: "TTS" | "URL"; // TTS (Web Speech API) atau URL (File MP3)
  audioScript?: string; // Naskah dialog/monolog bahasa Inggris untuk dibacakan
  audioUrl?: string; // Link URL ke file audio MP3
  audioVoice?: "en-US" | "en-GB"; // Aksen bahasa Inggris
  listeningFormat?: "MC" | "FILL_IN"; // Format jawaban: Pilihan ganda atau Dikte / Isian
  allowSpeedChange?: boolean; // Siswa boleh memilih Lambat/Lebih lambat (default: true); false = terkunci Normal
  maxPlays?: number; // Batas berapa kali audio boleh diputar; 0/kosong = tidak terbatas
  fillInAnswer?: string; // Kunci kata/frasa yang harus diketik

  // Spesifik Soal Speaking (Berbicara): ucapan siswa diubah jadi teks oleh pengenalan suara browser
  speakingMode?: "READ_ALOUD" | "RESPOND"; // Baca nyaring kalimat target, atau jawab pertanyaan secara lisan
  targetText?: string; // READ_ALOUD: kalimat yang harus diucapkan siswa
  speakingAccent?: "en-US" | "en-GB"; // Aksen pengenalan suara & contoh pelafalan
  // RESPOND memakai minWords + targetKeywords + modelAnswer (lihat Writing)

  // Spesifik Soal Writing (Menulis)
  minWords?: number; // Target jumlah kata minimal
  targetKeywords?: string[]; // Kosakata kunci yang wajib/dianjurkan muncul
  modelAnswer?: string; // Contoh respon ideal / rubrik acuan penilaian guru
  explanation?: string; // Catatan panduan tambahan

  // Spesifik Soal Isian Singkat / Kalimat Rumpang (FILL_IN)
  acceptedAnswers?: string[]; // Variasi jawaban yang diterima (misal: ["photosynthesis", "photo-synthesis"])
  caseSensitive?: boolean; // Apakah pencocokan sensitif huruf besar/kecil (default: false)
  fillInHint?: string; // Petunjuk pengisian untuk siswa (misal: "Pilih: in / on / at" atau "1 kata benda")
};
