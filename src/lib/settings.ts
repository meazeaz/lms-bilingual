/**
 * Konfigurasi Master Data & Pengaturan Sistem LMS Bilingual SMPIT Al Madany.
 * File ini client-safe (hanya tipe & nilai default).
 */

export interface SchoolProfile {
  name: string;
  foundation: string;
  address: string;
  phone: string;
  email: string;
  npsn: string;
  nss: string;
  accreditation: string;
  currentSemester: string;
  semesters: string[];
  logoUrl?: string; // URL atau path logo resmi sekolah
}

export interface MaterialCategory {
  id: string; // Kode/slug unik kategori (misal: "Kosakata Mapel", "Grammar")
  label: string; // Teks tampilan bilingual (misal: "Kosakata Mapel (Subject Vocabulary)")
  description?: string;
  active: boolean;
}

export interface SystemSettings {
  profile: SchoolProfile;
  subjects: string[];
  materialCategories: MaterialCategory[];
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: "SMPIT Al Madany Parung Panjang",
  foundation: "Yayasan Islamic Center Al Madany",
  address: "Jln. Kabasiran KM 2, RT.05/RW02, Desa Kabasiran, Kecamatan Parung Panjang, Kab. Bogor",
  phone: "(021) 5978-0000",
  email: "smpit@almadany.sch.id",
  npsn: "69874125",
  nss: "202600129",
  accreditation: "Terakreditasi A",
  currentSemester: "Ganjil 2026/2027",
  semesters: ["Ganjil 2026/2027", "Genap 2026/2027", "Ganjil 2027/2028", "Genap 2027/2028"],
  logoUrl: "/logo-almadany.png",
};

export const DEFAULT_SUBJECTS: string[] = [
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
];

export const DEFAULT_MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: "Kosakata Mapel",
    label: "Kosakata Mapel (Subject Vocabulary)",
    description: "Kosakata istilah khusus bidang mata pelajaran (Science, Math, Social, etc.)",
    active: true,
  },
  {
    id: "Ungkapan Sehari-hari",
    label: "Ungkapan Sehari-hari (Daily English)",
    description: "Frasa komunikasi percakapan harian di lingkungan sekolah",
    active: true,
  },
  {
    id: "Grammar",
    label: "Tata Bahasa (Grammar)",
    description: "Kaidah struktur dan tata bahasa Inggris komunikatif",
    active: true,
  },
  {
    id: "Reading",
    label: "Membaca & Pemahaman (Reading)",
    description: "Teks bacaan, artikel pendek, dan pemahaman wacana bilingual",
    active: true,
  },
  {
    id: "Listening",
    label: "Menyimak (Listening)",
    description: "Pemahaman audio, listening comprehension, dan percakapan lisan",
    active: true,
  },
  {
    id: "Speaking",
    label: "Berbicara & Pengucapan (Speaking & Pronunciation)",
    description: "Latihan berbicara, presentasi mini, dan artikulasi pengucapan",
    active: true,
  },
  {
    id: "Writing",
    label: "Menulis Bilingual (Writing & Essay)",
    description: "Latihan menyusun kalimat, paragraf, dan esai bilingual pendek",
    active: true,
  },
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  profile: DEFAULT_SCHOOL_PROFILE,
  subjects: DEFAULT_SUBJECTS,
  materialCategories: DEFAULT_MATERIAL_CATEGORIES,
};
