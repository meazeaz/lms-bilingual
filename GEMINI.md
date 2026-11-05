# GEMINI.md: Instruksi Agent untuk LMS Bilingual 2028

Kamu (agent Gemini di Antigravity) melanjutkan pengembangan **LMS Program Akselerasi Bilingual 2028 SMP IT Al Madany**. Baca file ini dulu, lalu [PROJECT_BRIEF.md](PROJECT_BRIEF.md) (ringkasan) dan **[docs/SPESIFIKASI_LENGKAP.md](docs/SPESIFIKASI_LENGKAP.md)** (konteks penuh: tujuan, aturan program, spesifikasi tiap halaman + kriteria selesai, roadmap per sprint). Sumber kebenaran isi program adalah PDF `../Program Akselerasi Bilingual 2028.pdf` (folder induk proyek).

Bahasa komunikasi dengan pemilik proyek: **Bahasa Indonesia**. Semua teks di UI juga Bahasa Indonesia (istilah program seperti *Mirror Morning*, *Duta Inggris*, *Pocket Book* tetap seperti di dokumen).

---

## 1. Persiapan & menjalankan (Windows)

Prasyarat: **Node.js ≥ 20.9** (sudah diuji di Node 24) dan npm. Tidak perlu MySQL/XAMPP karena database memakai SQLite (satu file).

Jalankan dari folder `lms-bilingual/`:

```bash
# 1. Pasang dependensi
npm install

# 2. Buat file environment (sekali saja)
copy .env.example .env        # PowerShell/cmd
# cp .env.example .env        # Git Bash

# 3. Buat database, generate Prisma Client, isi data contoh
npm run setup

# 4. Jalankan server pengembangan
npm run dev
```

Buka **http://localhost:3000**. Port 3000 terpakai? Jalankan `npx next dev -p 3001`.

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server dev (Turbopack) |
| `npm run setup` | `prisma db push` + `prisma generate` + seed |
| `npm run db:push` | Sinkronkan skema setelah mengubah `prisma/schema.prisma` (lalu `npx prisma generate`) |
| `npm run db:seed` | **Menghapus semua data** lalu mengisi ulang data contoh |
| `npx tsc --noEmit` | Cek tipe, wajib lolos sebelum menyatakan selesai |
| `npm run build` | Build produksi |

Folder `src/generated/prisma` di-gitignore. Kalau ada error `Cannot find module '@/generated/prisma/client'`, jalankan `npx prisma generate`.

### Akun demo (dari seed)

| Peran | Email | Password |
|---|---|---|
| Admin / Ketua EDT | admin@almadany.sch.id | admin123 |
| Admin / Kepala Sekolah | kepsek@almadany.sch.id | admin123 |
| Guru Gold (IPA) | fitri@almadany.sch.id | guru123 |
| Guru Bronze (IPS) | ela@almadany.sch.id | guru123 |
| Guru belum level | farid@almadany.sch.id | guru123 |
| Siswa 7A | aisyah@siswa.almadany.sch.id | siswa123 |

Email guru lain: `sarah`, `yazid`, `ani`, `budi`, `dedi`, `gina`, `haris`, `indah` + `@almadany.sch.id`. Email siswa: nama depan + `@siswa.almadany.sch.id`.

---

## 2. Stack & struktur

- **Next.js 16.4 (App Router) + React 19 + TypeScript**, Tailwind CSS v4, `motion` (Framer Motion, import dari `motion/react`), `lucide-react`, Recharts.
- **Prisma 7 + SQLite** lewat driver adapter `@prisma/adapter-better-sqlite3`. Client di-generate ke `src/generated/prisma`; import dari `@/generated/prisma/client`.
- Auth buatan sendiri: bcryptjs + JWT (jose) di cookie httpOnly `lms_session` (8 jam).

```
prisma/schema.prisma      Model data lengkap (semua fitur, termasuk yang belum ada UI-nya)
prisma/seed.mts           Data contoh: 11 guru, 36 siswa (7A–9B), log Agu–Okt 2026
src/proxy.ts              (pengganti middleware di Next 16) redirect berdasar peran
src/lib/program.ts        SEMUA angka & rumus dari Dokumen Master (level, bobot, batas lulus, fase, target CEFR)
src/lib/metrics.ts        Partisipasi, poin, status guru, checklist naik level, auto-lencana
src/lib/auth.ts           Data Access Layer: getCurrentUser, requireAdmin/Teacher/Student, canViewStudent
src/lib/session.ts        Buat/baca/hapus cookie sesi
src/actions/*.ts          Server Actions ("use server"): auth.ts, lms.ts
src/components/ui.tsx     Komponen dasar (Card, Button, Pill, LevelBadge, StatCard, Table, Progress, Ring…)
src/components/forms.tsx  ActionForm (useActionState), SubmitButton, ScorePicker 1–4
src/components/charts.tsx TrendChart, BarsChart, DonutChart (client)
src/components/app-shell.tsx  Sidebar per peran (array NAV), drawer mobile
src/components/landing.tsx    Landing page claymorphism (halaman /)
src/app/admin|guru|siswa/     Halaman per peran; layout.tsx tiap peran memanggil require*()
```

Rute yang sudah ada: `/`, `/login`, `/admin`, `/admin/verifikasi`, `/admin/asesmen`, `/guru`, `/guru/harian`, `/guru/siswa`, `/siswa`, `/siswa/materi`, `/siswa/materi/[id]`.

---

## 3. Aturan wajib saat menulis kode

1. **Next.js 16 berbeda dari versi lama.** Sebelum memakai API Next, baca dokumen bawaan di `node_modules/next/dist/docs/` (lihat juga `AGENTS.md`). Poin penting:
   - `params` dan `searchParams` adalah **Promise**: `const { id } = await params`.
   - `cookies()` / `headers()` async.
   - Middleware bernama **`proxy.ts`** dengan export `proxy`.
   - `cacheComponents` sengaja **dimatikan** di `next.config.ts` (semua halaman dinamis per sesi). Jangan dinyalakan tanpa refactor ke pola Suspense.
2. **Angka program hanya di `src/lib/program.ts`.** Jangan menulis 66,5 / 70% / dll. langsung di halaman; impor konstanta atau fungsinya.
3. **Otorisasi di server.** Setiap halaman/aksi memanggil `requireAdmin()` / `requireTeacher()` / `requireStudent()`. `proxy.ts` hanya pemeriksaan cepat. Guru hanya boleh melihat siswa di kelas yang diampunya (`TeachingAssignment`, helper `canViewStudent`).
4. **Alur "guru isi, admin verifikasi".** Data yang dilaporkan guru disimpan dengan status `PENDING`. Hanya data `APPROVED` yang dihitung di metrik resmi. Setelah admin memverifikasi, panggil `syncTeacherBadges(teacherId)`.
5. **Server Actions** mengembalikan `ActionState` (`success()` / `failure()` dari `@/lib/action-state`), validasi dengan zod, lalu `revalidatePath("/<peran>", "layout")`. Form client memakai `<ActionForm action={...}>`.
6. **Jangan kirim fungsi dari Server Component ke Client Component** (contoh: formatter grafik). Kirim data (array label), seperti `yLabels` di `TrendChart`. Ikon lucide juga tidak bisa dikirim sebagai prop ke client; definisikan di file client.
7. **Tanggal**: tanggal tanpa jam disimpan sebagai UTC tengah malam lewat `dayKey()`. Isi `<input type="date">` dengan `toInputDate()`. Format tampilan memakai `formatDate()` (locale id-ID).
8. **Tipe layout**: pakai `{ children: React.ReactNode }`. `LayoutProps<"/rute">` baru valid setelah route types ter-generate oleh `next dev`.
9. **Desain**: ikuti design system di `src/app/globals.css` dan `ui.tsx`: latar pastel (#F8FAFC → #EEF2FF), aksen indigo (`brand-*`), `coral-*`, `mint-*`, warna level `bronze/silver/gold-*`. Utility `clay` (kartu 3D), `press` (tombol dengan border bawah yang "ditekan"), `glass`. Judul memakai font Fredoka (`font-[family-name:var(--font-display)]`), teks memakai Plus Jakarta Sans. Animasi: `Stagger`/`StaggerItem`/`HoverLift` dari `components/motion.tsx`; hormati `prefers-reduced-motion`.
10. **Menu baru**: saat menambah halaman, daftarkan di array `NAV` pada `app-shell.tsx` (ikon sudah diimpor). Jangan menautkan rute yang belum ada.
11. Setelah perubahan: `npx tsc --noEmit` harus lolos, dan buka halaman terkait di browser sebagai peran yang sesuai (cek log `npm run dev` untuk error).

---

## 4. Cara memverifikasi cepat

1. `npm run dev`, buka http://localhost:3000/login, masuk dengan akun demo tiap peran.
2. Guru: kirim laporan di **ELITE Harian**. Admin: laporan muncul di **Verifikasi ELITE** (badge merah di sidebar), setujui. Dashboard guru: partisipasi/poin berubah.
3. Admin **Asesmen Duta**: pilih guru, isi skor, pratinjau nilai akhir harus sama dengan rumus `lisan×0,5 + tertulis×0,3 + simulasi×0,2`. Simpan, lalu level guru naik bila lulus.
4. Siswa: kerjakan kuis di **Materi & Kuis**. Nilai ≥ 70 = lulus, poin bertambah di beranda.
