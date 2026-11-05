export type QuestionType = "MULTIPLE_CHOICE" | "LISTENING" | "WRITING" | "FILL_IN";

export type QuizQuestion = {
  id?: string;
  type: QuestionType;
  q: string; // Teks pertanyaan / prompt menulis / pertanyaan listening / kalimat rumpang

  // Pilihan Ganda & Listening Format MC
  options?: string[];
  answer?: number; // Indeks opsi benar (0..3)

  // Spesifik Soal Listening (Menyimak)
  audioSourceType?: "TTS" | "URL"; // TTS (Web Speech API) atau URL (File MP3)
  audioScript?: string; // Naskah dialog/monolog bahasa Inggris untuk dibacakan
  audioUrl?: string; // Link URL ke file audio MP3
  audioVoice?: "en-US" | "en-GB"; // Aksen bahasa Inggris
  listeningFormat?: "MC" | "FILL_IN"; // Format jawaban: Pilihan ganda atau Dikte / Isian
  fillInAnswer?: string; // Kunci kata/frasa yang harus diketik

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
