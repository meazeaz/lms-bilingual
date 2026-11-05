# PROJECT BRIEF: LMS Program Akselerasi Bilingual 2028

Ringkasan percakapan pemilik proyek dengan Claude (Oktober–November 2026): apa yang dibangun, untuk apa, keputusan yang sudah diambil, status saat ini, dan arah selanjutnya. Instruksi teknis ada di [GEMINI.md](GEMINI.md). Versi lengkap dan detail ada di [docs/SPESIFIKASI_LENGKAP.md](docs/SPESIFIKASI_LENGKAP.md).

---

## 1. Latar belakang

SMPIT Al Madany Parung Panjang (Yayasan Islamic Center Al Madany, Alamat: Jln. Kabasiran KM 2, RT.05/RW02, Desa Kabasiran, Kecamatan Parung Panjang, Kab. Bogor) menjalankan **Program Bilingual** dengan target **full bilingual Juli 2028**. Program diatur dalam Dokumen Master v3.0 (berlaku 1 Mei 2026, disusun Tim English Development Team/EDT, Ketua: Bambang Priyanto, S.Kom). File: `../Program Akselerasi Bilingual 2028.pdf`.

Masalah yang diangkat dokumen: kemampuan Inggris guru sangat beragam (mayoritas A2, 1–2 orang C1), siswa rata-rata A2 (banyak alumni kursus Pare), dan **belum ada sistem terstruktur untuk meningkatkan dan memantau kemampuan guru secara berkelanjutan**. LMS ini menjawab poin terakhir.

## 2. Tujuan LMS (permintaan pemilik)

> Website LMS untuk mengimplementasikan program bilingual, dengan akun tiap guru untuk mengevaluasi capaiannya masing-masing; untuk perkembangan guru dan murid; semua progres bisa dimonitor.

Tiga peran dengan hierarki monitoring:

| Peran | Melihat | Mengisi |
|---|---|---|
| **Admin** (Tim EDT / Kepala Sekolah) | Progres **semua guru** + gambaran siswa | Verifikasi laporan guru, nilai asesmen Duta Inggris, observasi kelas, laporan bulanan |
| **Guru** | Progres **dirinya** + **siswa di kelas yang diampu** | Laporan harian ELITE, refleksi, RPP, hafalan Pocket Book, nilai siswa |
| **Siswa** | Progres **dirinya** | Membaca materi, mengerjakan kuis, ikut club & lomba |

Prinsip alur data (dipilih pemilik): **guru mengisi sendiri, admin memverifikasi**. Hanya data terverifikasi yang masuk metrik resmi.

## 3. Keputusan yang sudah disepakati

- **Teknologi**: permintaan pemilik "Next.js TypeScript dan tools lain agar profesional". Hasilnya Next.js 16 + TypeScript + Tailwind + Prisma (SQLite lokal, nanti bisa pindah ke PostgreSQL/MySQL saat online) + Framer Motion + lucide.
- **Berjalan lokal dulu** (localhost). Deploy online belum dibahas.
- **Fitur guru**: semua dipilih, yaitu Tracking Harian ELITE, Duta Inggris & Asesmen, Observasi/Refleksi/RPP, Pocket Book & Gamifikasi.
- **Fitur siswa**: semua dipilih, yaitu Materi & Kuis, Nilai & Level CEFR, English Club & Peer Tutor, Lomba & Prestasi.
- **Desain** (diminta eksplisit): *playful 3D claymorphism × clean modern SaaS* (inspirasi Duolingo & Linear); latar pastel #F8FAFC→#EEF2FF; aksen indigo lembut, coral hangat, mint; tombol 3D dengan border bawah yang bisa ditekan; animasi Framer Motion (kartu melayang di hero, hover pegas/tilt, entrance bertahap); navbar glassmorphism; hero dengan search bar; bento grid "Popular Learning Paths". Prototipe landing versi Artifact: https://claude.ai/artifact/TT72MUjk9swUnahrHTcoWT (privat milik pemilik).
- **Prioritas kecepatan**: pemilik meminta hasil cepat, jadi versi pertama memuat inti yang bisa dibuka di localhost. Fitur lain menyusul.
- UI berbahasa Indonesia; guru melihat siswa berdasarkan kelas yang diampu; data contoh disediakan untuk uji coba.

## 4. Isi program yang diterjemahkan ke sistem

Semua angka ada di `src/lib/program.ts`.

- **Peta jalan**: F0 Apr 2026 (asesmen awal) → F1 Mei–Jul 2026 (Foundation & Habit) → F2 Agu–Okt 2026 (Pilot) → F3 Nov 2026–Apr 2027 (Operasionalisasi) → F4 Mei 2027–Apr 2028 (Pemantapan) → F5 Mei–Jun 2028 (Evaluasi & akreditasi) → full bilingual Juli 2028.
- **Tujuan SMART T1–T6**, misalnya 100% guru ≥ B1 (Des 2027), 50% ≥ B2 & 20% ≥ C1, rata-rata TOEFL siswa kelas 9 ≥ 500 (Jun 2028).
- **Duta Inggris** Bronze (A2–B1, berlaku 3 bln) / Silver (B1–B2, 6 bln) / Gold (B2–C1, 1 thn). Asesmen: tes lisan 50% (5 aspek skor 1–4 × 5), tertulis 30%, simulasi mengajar 20% ((jumlah 4 aspek ÷ 16) × 100). Lulus: **66,5 / 76,2 / 84,1**. Gold wajib TOEFL ≥ 550/IELTS 6.0 (tes tertulis otomatis 100). Target % Inggris di kelas (Juknis): 30/50/70%, Mentor 85%. English Zone 3/4/5 × 30 menit per minggu. Banding maks. 7 hari, diproses 14 hari.
- **ELITE English Habit** (WhatsApp, Senin–Jumat): Mirror Morning 05.30 (voice note sebelum 06.15), Misi Harian sebelum 20.00, partisipasi minimal 70%. Tema mingguan: Greetings & Gratitude → Instructions → Student Interaction → Reflection. Ditambah English Buddy (guru A2 dipasangkan dengan B1+, 2×/minggu).
- **Pocket Book 50 kalimat** instruksi kelas (Opening 5, Instructions 20, Classroom Management 10, Feedback 8, Closing 7).
- **Micro-teaching** (lulus ≥ 70, 60–69 pendampingan, < 60 intensif), **observasi kelas** 10 aspek (Lampiran 4), **refleksi diri**, **RPP bilingual** (minimal 3 kalimat Inggris, 5 Cambridge skills).
- **Siswa**: target CEFR kelas 7 = A2, 8 = A2+, 9 = B1 (lulus 2028: B1/B1+/B2). Asesmen oleh guru Bahasa Inggris: kelas 7 observasi, kelas 8 speaking test, kelas 9 TOEFL ITP prediction. English Club Sabtu 08.00–09.30, Peer Tutoring Kamis sore, target lomba per jenjang (kecamatan → nasional).
- **Monitoring** mengikuti "Dashboard Sederhana" Bab 5.3: nama, level, TOEFL, % Inggris di kelas, partisipasi WA, status (On track / Perhatian / Perlu pendampingan).

### Konten yang tidak ada di PDF (dibuat sebagai contoh, perlu dikonfirmasi EDT)
Bagian 3.5–3.6 (Safe Phrases), 6.4 (Lencana Digital), 6.5 (Weekly Challenge Card 12 minggu), dan 8.1 (Glosarium mapel) hanya ada di daftar isi, isinya tidak ada. Isi berikut dibuat sendiri:
- 10 lencana: English Starter/Practitioner/Leader, Early Bird, Most Improved, TOEFL Challenger, Collaboration, Pocket Book Master, Challenge Champion, Full Participation.
- 12 Weekly Challenge.
- 6 materi siswa (Classroom Instructions, Math, Science, Simple Past, Supply & Demand, PJOK).
- Konversi poin.

### Inkonsistensi di dokumen (sudah diputuskan sementara, tanyakan ke pemilik bila relevan)
- Hafalan Pocket Book: Bab 6.1 menyebut 30/60 kalimat (60 > 50 isi buku), Lampiran 3 menyebut **20/35/45**. **Dipakai 20/35/45.**
- Batas lulus: Lampiran 1 menyebut 70/75/80 (khusus tes tertulis), Lampiran 10 menyebut **66,5/76,2/84,1** (nilai akhir). **Dipakai Lampiran 10 untuk nilai akhir.**
- % Inggris: kriteria Bab 6.1 (Bronze 50%, Silver 60%) berbeda dengan Juknis (30/50/70). **Dipakai Juknis.**

## 5. Status saat ini (5 November 2026)

**Sudah jalan dan teruji (semua halaman 200, `tsc` lolos):**
- Setup lokal berjalan lancar di `http://localhost:3000` (menggunakan `@tailwindcss/postcss` standar resmi Tailwind v4).
- Login dan logout lewat FORM telah diuji langsung di browser untuk 3 akun demo (Admin, Guru Gold, Siswa 7A) dengan redirect peran yang tepat.
- **Sprint 0 (Stabilisasi):** Selesai. Halaman 404 ramah (`/not-found`), error boundary (`/error`), serta loading skeleton (`loading.tsx`) untuk masing-masing peran (`/admin`, `/guru`, `/siswa`) sudah terpasang rapi dengan gaya claymorphism.
- **Sprint 1 (Alur Duta Inggris Lengkap):** Selesai.
  - Halaman `/guru/duta`: Status level aktif, masa berlaku sertifikasi dengan countdown, sertifikat digital interaktif siap cetak (`@media print`), rincian nilai 3 komponen asesmen, tombol konfirmasi "Hasil Diterima", formulir pendaftaran Duta Inggris (Lampiran 6), dan formulir banding asesmen (Lampiran 7, batas 7 hari).
  - Halaman `/admin/asesmen`: Dilengkapi LinkTabs 4 tab interaktif:
    1. Tab **Asesmen Duta**: Input nilai 3 komponen + riwayat asesmen + status konfirmasi guru.
    2. Tab **Pendaftaran (Lampiran 6)**: Tinjau motivasi & jam mandiri guru, setujui/tolak, jadwalkan tanggal asesmen.
    3. Tab **Micro-Teaching (Bulan 4)**: Input rubrik 4 aspek simulasi (@25%, skor 1–4) + riwayat nilai & status kelulusan.
    4. Tab **Banding Nilai (Lampiran 7)**: Pantau pengajuan banding guru, deteksi keterlambatan SOP 14 hari kerja, dan sidang putusan (Diterima / Revisi Nilai / Ditolak).
  - Halaman `/admin/guru`: Pemantauan 18 guru, ringkasan statistik, filter level/kelompok pilot/pencarian nama/mapel/NIP, dan fitur ekspor data ke file CSV.
  - Halaman `/admin/guru/[id]`: Profil detail guru, checklist kesiapan naik level berikutnya (CEFR, micro-teaching, asesmen, target kelas), riwayat penyesuaian level (`LevelChange`), riwayat CEFR/TOEFL (`CefrRecord`), formulir edit profil guru & penugasan buddy, serta formulir sanksi penurunan level manual beralasan.
  - Model database `AmbassadorRegistration` & `LevelChange` ditambahkan dan disinkronkan ke SQLite lewat `prisma db push`.
- **Sprint 2 (Latihan & Verifikasi Gamifikasi Guru):** Selesai.
  - Halaman `/guru/pocket-book`: Menampilkan 50 frasa saku kelas per kategori (Opening, Instructions, Classroom Management, Feedback, Closing), pencarian multi-bahasa, progres capaian target level (Bronze: 20, Silver: 35, Gold: 45/50 frasa), mode Flashcard Interaktif (acak, bolak-balik EN/ID, petunjuk pelafalan), dan tombol "Ajukan Hafal" (status PENDING).
  - Halaman `/guru/challenge`: Menampilkan 12 kartu tantangan mingguan (fase F1–F3), formulir pelaporan bukti penerapan di kelas, penambahan +10 poin otomatis per tantangan disetujui, dan pelacak lencana `Challenge Champion`.
  - Halaman `/admin/verifikasi`: Dilengkapi `LinkTabs` 3 tab interaktif:
    1. Tab **ELITE Harian**: Verifikasi laporan praktik WhatsApp ELITE, Voice Note Mirror Morning (<06.15), Misi Harian, English Zone, dan Buddy Session.
    2. Tab **Pocket Book (50 Frasa)**: Tinjau klaim hafalan kalimat guru, tombol setujui/tolak per baris, dan tombol "Setujui Semua Frasa".
    3. Tab **Weekly Challenge (12 Minggu)**: Tinjau bukti penerapan tantangan kelas guru, tombol setujui/tolak per baris, dan tombol "Setujui Semua Tantangan".
    4. Setiap persetujuan memicu sinkronisasi lencana otomatis (`syncTeacherBadges`), membuka lencana `POCKET_MASTER` dan `CHALLENGE_CHAMPION`.
- **Sprint 3 (Observasi, Refleksi, dan RPP Bilingual):** Selesai.
  - Halaman `/admin/observasi`:
    1. Tab **Monitoring Semester**: Memantau pemenuhan target wajib minimal 2× supervisi kelas per semester untuk seluruh 18 guru, rata-rata skor observasi, rata-rata % bahasa Inggris kelas, dan tombol cepat supervisi guru.
    2. Tab **Input Observasi Baru (Lampiran 4A)**: Rubrik 10 aspek pedagogik bilingual dengan scoring otomatis real-time (skor = Ya × 10), estimasi proporsi bahasa Inggris (`ENGLISH_PCT_BUCKETS`), pencatatan kekuatan guru (strengths), area perbaikan (improvements), dan rekomendasi observer (`PERTAHANKAN`, `SIAP_NAIK`, `PENDAMPINGAN`).
    3. Tab **Riwayat Observasi**: Daftar seluruh lembar supervisi tersimpan lengkap dengan modal rincian 10 aspek dan status penerimaan guru.
  - Halaman `/guru/refleksi`:
    1. Tab **Refleksi Mengajar Mandiri (Lampiran 4B)**: Formulir evaluasi diri guru setelah mengajar (evaluasi ketercapaian target, kalimat lancar, kalimat sulit, respon siswa, tantangan terbesar, hal membanggakan, perubahan pertemuan berikutnya) + riwayat pengajuan & status verifikasi EDT.
    2. Tab **Hasil Observasi Kelas**: Kartu umpan balik supervisi kelas yang diterima dari Kepala Sekolah / Tim EDT, rincian kekuatan & perbaikan teramati, serta tombol interaktif "Konfirmasi Terima Umpan Balik" (`acknowledgeObservation`).
  - Halaman `/guru/rpp` & `/guru/rpp/[id]`:
    1. Formulir RPP bilingual interaktif dengan **live counter validasi minimal 3 kalimat bahasa Inggris** di kelas, pemilihan Cambridge skills multi-select (Reading, Writing, Use of English, Listening, Speaking), tujuan pembelajaran, kosakata kunci, dan skenario lengkap (Opening, Main Activity, Closing).
    2. Dukungan status bertahap: "Simpan Sebagai Draf" atau "Ajukan RPP ke EDT", serta alur edit ulang dengan menampilkan catatan perbaikan dari verifikator.
    3. Halaman detail `/guru/rpp/[id]`: Desain dokumen resmi RPP Bilingual SMP IT Al Madany format formal yang siap cetak / unduh PDF (`@media print` clean layout dengan ruang tanda tangan Kepala Sekolah & Guru).
  - Halaman `/admin/verifikasi` diperluas:
    1. Menambahkan Tab 4: **Refleksi Guru (Lampiran 4B)** dengan tombol review per item & tombol massal "Setujui Semua Refleksi".
    2. Menambahkan Tab 5: **RPP Bilingual (Lampiran 11)** dengan review persetujuan, permintaan revisi dengan catatan instruksi, serta tombol massal "Setujui Semua RPP".
  - Dashboard Admin `/admin`:
    1. Mengintegrasikan pencapaian **SMART Goal T4** (100% guru menyusun RPP bilingual & minimal 2× observasi kelas) dengan indikator persentase real-time.
    2. Banner "Perhatian EDT" mendeteksi guru dengan status off track/peringatan dan masa berlaku sertifikasi Duta yang akan kedaluwarsa ≤ 14 hari.
    3. Setiap baris guru pada tabel monitoring menaut langsung ke profil guru di `/admin/guru/[id]`.
- **Sprint 4 (Modul Pengembangan Siswa & Ekosistem Pendukung):** Selesai.
  - Halaman `/guru/nilai`: Input nilai massal siswa per kelas berdasarkan jenjang (Kelas 7 Observasi Pedagogik, Kelas 8 Speaking Assessment, Kelas 9 TOEFL Prediction), estimasi CEFR otomatis dari skor TOEFL via `cefrFromToefl`, input 5 komponen Cambridge (Grammar, Vocab, Discourse, Pronunciation, Interactive), dan pembaruan `Student.cefrLevel` atomik.
  - Komponen bersama `/guru/siswa/[id]` & `/admin/siswa/[id]`: Profil detail siswa, grafik CEFR journey vs target kelas, Cambridge radar breakdown, riwayat asesmen, riwayat kuis, kehadiran club & poin, serta prestasi lomba. Diproteksi dengan otorisasi `canViewStudent`.
  - Halaman `/admin/siswa`: Direktori siswa seluruh jenjang dengan filter kelas, indikator pencapaian target CEFR (91.4% on track), prediksi SMART Goal T5 (rata-rata TOEFL ITP siswa kelas 9), jumlah alumni Pare, dan jumlah Student Ambassador.
  - Halaman `/siswa/nilai`: Tampilan nilai personal siswa dengan perbandingan target kelas, kartu panduan level CEFR A1–C1, dan rincian kemampuan 5 komponen Cambridge.
  - Modul English Club & Peer Tutoring (`/guru/club`, `/admin/club`, `/siswa/club`): Penjadwalan sesi (English Club Sabtu 08.00–09.30 & Peer Tutoring Kamis 15.30–17.00), absensi dengan peran peserta (+3 poin) atau tutor (+5 poin), serta toggle penobatan `Student Ambassador`.
  - Modul Lomba & Prestasi (`/guru/lomba`, `/admin/lomba`, `/siswa/prestasi`): Pencatatan partisipasi lomba tingkat Kecamatan s.d. Nasional, kalkulator poin otomatis (`competitionPoints`), monitoring target tahunan Bab 7.9, dan galeri medali prestasi siswa.
  - Modul Kelola Materi & Kuis (`/guru/materi` & `/admin/materi`): Editor materi bacaan bilingual dengan dynamic vocabulary box (Inggris - Indonesia), pembuat kuis interaktif MCQ dengan kunci jawaban dan batas kelulusan, katalog materi, dan pratinjau langsung ke tampilan siswa.
- **Sprint 5 (Laporan & Administrasi):** Selesai.
  - Halaman `/admin/laporan`: Dokumen formal Laporan Bulanan EDT format Dokumen Master Lampiran 5 (Bagian A Ringkasan Eksekutif, B Data Duta per Level, C Hasil Observasi Kelas, D Partisipasi ELITE, E Kendala, F Rekomendasi, G Rencana Aksi, H Lembar Pengesahan Kepsek & EDT). Terintegrasi dengan fitur sunting catatan narasi (`saveMonthlyReportNotes`), cetak resmi dokumen PDF (`@media print`), generator siaran **Weekly Report WhatsApp** dengan tombol salin format satu-klik, serta **Poster Apresiasi Duta Bulan Ini** (*Teacher of the Month*).
  - Halaman `/admin/pengumuman`: Pusat broadcast pengumuman sekolah dengan sasaran audiens `ALL` (semua warga sekolah), `TEACHER` (dewan guru), atau `STUDENT` (seluruh siswa), terbit dan hapus pengumuman real-time.
  - Halaman `/admin/pengguna`: Manajemen pengguna 4 tab (Dewan Guru, Siswa, Admin/EDT, Kelas & Penugasan). Mendukung pembuatan akun baru dengan password terenkripsi bcrypt, reset password mandiri oleh admin, penonaktifan akun dengan proteksi diri admin, pembuatan kelas baru, serta penugasan guru mata pelajaran dan penetapan wali kelas (`isHomeroom`).
  - Navigasi `NAV.ADMIN` di `app-shell.tsx` dilengkapi grup "Laporan & Administrasi".
- **Penyempurnaan Dokumen Master (100% Selaras Lampiran PDF):** Selesai.
  - **Lampiran 8 (Surat Edaran Orang Tua & Lembar RSVP):** Terintegrasi di `/admin/laporan` tab baru. Format surat resmi kop SMP IT Al Madany, laporan capaian 6 bulan, 4 dampak positif terlihat, roadmap 2028, undangan English Day di Aula, 5 tips praktis pendampingan di rumah, serta formulir fisik RSVP (potong di sini) siap cetak A4.
  - **Lampiran 1 (Bank Soal Ujian Tertulis Guru):** Terintegrasi di `/admin/asesmen?tab=banksoal`. Naskah lengkap siap cetak untuk Level Bronze (10 PG + 5 Menjodohkan + 5 Rumpang), Level Silver (10 PG + 5 Error Identification + 5 Kalimat Kontekstual), dan Level Gold (15 Cloze Test CLIL + Esai 150-250 kata + Rubrik 4 Aspek), dilengkapi toggle kunci jawaban dan rubrik penskoran asesor.
  - **Bab 8.1 (Glosarium 4 Mapel Bilingual):** Terintegrasi di `src/lib/glossary.ts` dan komponen interaktif `GlossaryModal` di `/guru/rpp` dan `/guru/materi`. Berisi kumpulan istilah teknis resmi untuk Matematika, IPA, IPS, dan PJOK dilengkapi fonetik, terjemahan, contoh kalimat kelas, pencarian real-time, dan tombol salin 1-klik.
  - **Lampiran 10 (Panduan Pelatihan Penguji / Asesor):** Terintegrasi di `/admin/asesmen` (kartu panduan lipat asesor). Memuat script pembukaan wawancara 1 menit yang menenangkan, 5 prinsip etika penguji, dan tabel Do's & Don'ts pengujian.
- **Sprint 6 (Kesiapan Produksi & Migrasi PostgreSQL 1.000 User):** Selesai & Teruji.
  - Arsitektur Dual-Database aktif: Mendukung SQLite untuk pengembangan lokal tanpa instalasi rumit, dan PostgreSQL resmi (`@prisma/adapter-pg` + `pg.Pool`) untuk staging/produksi kapasitas 1.000 pengguna.
  - Skema PostgreSQL tersinkronisasi di [`prisma/schema.postgresql.prisma`](prisma/schema.postgresql.prisma).
  - Skrip migrasi data otomatis [`prisma/migrate-sqlite-to-postgres.mts`](prisma/migrate-sqlite-to-postgres.mts) (`npm run db:migrate-to-pg`) yang memindahkan seluruh data dari SQLite ke PostgreSQL dengan transaksi ACID aman.
  - CLI switch database satu-klik: `npm run db:use-postgres` dan `npm run db:use-sqlite`.
  - Kontainerisasi PostgreSQL siap pakai melalui [`docker-compose.yml`](docker-compose.yml) (PostgreSQL 16 Alpine + pgAdmin 4).
  - Panduan implementasi & analisis kapasitas 1.000 pengguna tertera di [`docs/PANDUAN_MIGRASI_POSTGRESQL.md`](docs/PANDUAN_MIGRASI_POSTGRESQL.md).
- **Modul ELITE Program Admin (`/admin/elite`):** Selesai & Terintegrasi.
  - Papan Kendali Harian (Live Tracker): Pemantauan real-time status setoran Mirror Morning, Misi Harian, jam pengiriman (On-Time Bonus sebelum 07.30), durasi English Zone, serta tombol cepat salin rekap WA & pengingat santun untuk guru yang belum setor.
  - Hub Posting & Penjadwalan Harian: Form penugasan naskah Mirror Morning, tips pelafalan/intonasi audio, misi harian di sekolah, dan generator siaran WhatsApp 1-klik siap kirim ke grup guru.
  - Pustaka Bank Inspirasi Prompt: Koleksi template terkurasi (Greeting, Noise Control, Pair Work, Specific Praise, Closing, CFU, English Zone) dengan tombol "Gunakan Template Ini".
  - Analisis Streak & Leaderboard Guru: Papan peringkat konsistensi harian guru berturut-turut, keaktifan 30 hari, serta peringatan dini untuk guru dengan partisipasi <50% agar didampingi oleh pasangan *English Buddy*.
  - Sinkronisasi Sisi Guru (`/guru/harian`): Guru langsung melihat kartu banner instruksi naskah Mirror Morning dan Misi Harian resmi dari Tim EDT setiap pagi.
- Admin: dashboard (fase berjalan, hitung mundur, KPI, sebaran level, tabel monitoring guru, SMART goals), verifikasi laporan ELITE (satu per satu / semua), input asesmen Duta Inggris dengan pratinjau nilai real-time, kenaikan level otomatis, dan riwayat.
- Guru: dashboard (level, checklist syarat naik level, streak, partisipasi, Pocket Book, poin, grafik mingguan, lencana, pengumuman), form ELITE harian + kalender 8 minggu + riwayat, progres siswa per kelas vs target CEFR.
- Siswa: beranda (level CEFR vs target, grafik perkembangan, poin, materi yang belum lulus, pengumuman), daftar materi, detail materi + kosakata + kuis bernilai otomatis.
- Skema database sudah mencakup **semua** fitur (termasuk yang belum ada UI-nya). Seed berisi data realistis.

## 6. Roadmap (urutan yang disarankan)

Model data dan sebagian logika sudah tersedia. Pekerjaan berikut terutama UI + server action.

**Prioritas 1: melengkapi alur guru ↔ admin**
1. Guru `/guru/pocket-book`: 50 kalimat per kategori, tandai "sudah hafal" (PENDING), mode latihan flashcard. Admin verifikasi.
2. Guru `/guru/duta`: level, masa berlaku, riwayat asesmen + rincian skor, formulir **banding** (Lampiran 7). Admin `/admin/asesmen` tab banding + keputusan tim banding.
3. Admin `/admin/observasi`: form lembar observasi 10 aspek + estimasi % Inggris + rekomendasi. Guru melihat hasilnya.
4. Guru `/guru/refleksi` (Lampiran 4B) dan `/guru/rpp` (template RPP bilingual/hybrid). Admin menyetujui/minta revisi.
5. Admin `/admin/guru` + `/admin/guru/[id]`: detail lengkap per guru, edit CEFR/TOEFL/buddy/pilot.
6. Perluas `/admin/verifikasi` dengan tab refleksi, RPP, Pocket Book, Weekly Challenge.

**Prioritas 2: siswa**
7. Guru `/guru/nilai`: input nilai per kelas (batch), memperbarui `Student.cefrLevel`.
8. English Club & Peer Tutoring (sesi + absensi, Student Ambassador): `/guru/club`, `/admin/club`, `/siswa/club`.
9. Lomba & prestasi (poin = hasil × pengali tingkat, ada di `program.ts`): `/guru/lomba`, `/admin/lomba`, `/siswa/prestasi`.
10. Kelola materi & kuis oleh guru/admin (`/guru/materi`, `/admin/materi`); `/siswa/nilai`.

**Prioritas 3: administrasi & laporan**
11. Weekly Challenge 12 minggu (`/guru/challenge`) + Micro-teaching (input admin, Bab 4.1).
12. `/admin/laporan`: Laporan Bulanan EDT otomatis (format Lampiran 5), siap cetak.
13. `/admin/pengguna`: tambah/nonaktifkan guru, siswa, admin; kelas; penugasan mengajar; reset password.
14. `/admin/pengumuman`; `/admin/siswa` (gambaran semua kelas).

**Nanti**: deploy online (ganti ke PostgreSQL, `SESSION_SECRET` produksi), ekspor Excel/PDF, notifikasi WhatsApp, upload voice note/berkas, ganti password sendiri, impor data guru/siswa asli dari Excel.

## 7. Cara bekerja dengan pemilik

- Pemilik ingin **ditanya dulu sebelum membangun hal besar** supaya satu pemahaman. Tanyakan pilihan yang benar-benar berdampak, lalu kerjakan.
- Pemilik menghargai **kecepatan**: kirim versi yang bisa dibuka di localhost lebih dulu, lalu iterasi.
- Laporkan apa adanya: apa yang sudah teruji, apa yang belum.
