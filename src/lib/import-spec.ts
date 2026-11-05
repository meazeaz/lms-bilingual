import type { Column } from "@/lib/excel";
import { STUDENT_CEFR, TEACHER_CEFR } from "@/lib/program";

/** Kolom templat impor guru. `key` = judul kolom ternormalisasi (lihat normalizeHeader). */
export const TEACHER_COLUMNS: Column[] = [
  { header: "Nama*", key: "nama", width: 30 },
  { header: "Email*", key: "email", width: 30, note: "Dipakai untuk login. Harus unik." },
  { header: "NIP", key: "nip", width: 20 },
  { header: "Mata Pelajaran*", key: "mata pelajaran", width: 20 },
  { header: "WhatsApp", key: "whatsapp", width: 18 },
  { header: "Level CEFR", key: "level cefr", width: 12, note: `Salah satu: ${TEACHER_CEFR.join(", ")}. Kosong = A2.` },
  { header: "Skor TOEFL", key: "skor toefl", width: 12 },
  { header: "Guru Pilot (Ya/Tidak)", key: "guru pilot", width: 20 },
  { header: "Password Awal", key: "password awal", width: 18, note: "Opsional. Kosong = memakai password default dari form impor." },
];

/** Kolom templat impor siswa. */
export const STUDENT_COLUMNS: Column[] = [
  { header: "Nama*", key: "nama", width: 30 },
  { header: "Email*", key: "email", width: 34, note: "Dipakai untuk login. Harus unik." },
  { header: "NIS", key: "nis", width: 16 },
  { header: "Kelas*", key: "kelas", width: 10, note: "Mis. 7A, 8B, 9C. Angka pertama = jenjang." },
  { header: "Level CEFR", key: "level cefr", width: 12, note: `Salah satu: ${STUDENT_CEFR.join(", ")}. Kosong = A1.` },
  { header: "Alumni Pare (Ya/Tidak)", key: "alumni pare", width: 22 },
  { header: "Password Awal", key: "password awal", width: 18, note: "Opsional. Kosong = memakai password default dari form impor." },
];

export const TEACHER_EXAMPLE = {
  nama: "Contoh: Siti Rahmawati, S.Pd",
  email: "siti.rahmawati@almadany.sch.id",
  nip: "198701012010012001",
  "mata pelajaran": "Matematika",
  whatsapp: "081234567890",
  "level cefr": "A2+",
  "skor toefl": 420,
  "guru pilot": "Tidak",
  "password awal": "",
};

export const STUDENT_EXAMPLE = {
  nama: "Contoh: Ahmad Fauzan",
  email: "ahmad.fauzan@siswa.almadany.sch.id",
  nis: "2026070001",
  kelas: "7A",
  "level cefr": "A1",
  "alumni pare": "Tidak",
  "password awal": "",
};

export const IMPORT_GUIDE = [
  "1. Isi data mulai baris ke-2 pada sheet pertama. Jangan ubah judul kolom di baris pertama.",
  "2. Kolom bertanda * wajib diisi. Hapus baris contoh sebelum mengimpor.",
  "3. Email yang sudah terdaftar akan dilewati (tidak menimpa data lama).",
  "4. Gunakan tombol \"Periksa dulu\" di LMS untuk memvalidasi tanpa menyimpan.",
  "5. Setelah impor, minta pengguna mengganti password lewat menu Akun Saya.",
];
