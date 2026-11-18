# SPESIFIKASI LENGKAP: LMS Program Akselerasi Bilingual 2028

**SMP IT Al Madany · Yayasan Islamic Center Al Madany**

Dokumen ini adalah konteks penuh untuk agent AI (Gemini di Antigravity) dan developer yang melanjutkan proyek. Isinya tujuan dan fokus, isi program yang harus diwujudkan, aturan bisnis, spesifikasi tiap halaman beserta kriteria selesai, peta ke database, standar desain, status, dan riwayat keputusan.

Urutan membaca yang disarankan:
1. Bagian 1–3 untuk memahami *mengapa* aplikasi ini ada.
2. Bagian 4–5 untuk *aturan program*.
3. Bagian 6–8 untuk *apa yang harus dibangun*.
4. Bagian 9–12 untuk *cara membangunnya*.

Dokumen terkait:
- [`../GEMINI.md`](../GEMINI.md): instalasi, perintah, aturan kode.
- [`../PROJECT_BRIEF.md`](../PROJECT_BRIEF.md): ringkasan satu halaman.
- `../../Program Akselerasi Bilingual 2028.pdf`: Dokumen Master v3.0, **sumber kebenaran isi program**.
- `src/lib/program.ts`: semua angka program dalam bentuk kode.

---

## Daftar isi

1. [Visi, masalah, dan tujuan](#1-visi-masalah-dan-tujuan)
2. [Pengguna & hak akses](#2-pengguna--hak-akses)
3. [Prinsip produk (fokus kita)](#3-prinsip-produk-fokus-kita)
4. [Isi program yang harus diwujudkan](#4-isi-program-yang-harus-diwujudkan)
5. [Aturan bisnis & rumus](#5-aturan-bisnis--rumus)
6. [Alur kerja utama end-to-end](#6-alur-kerja-utama-end-to-end)
7. [Spesifikasi halaman (sudah ada & belum)](#7-spesifikasi-halaman)
8. [Roadmap bertahap + kriteria selesai](#8-roadmap-bertahap--kriteria-selesai)
9. [Arsitektur & peta database](#9-arsitektur--peta-database)
10. [Design system](#10-design-system)
11. [Data contoh (seed)](#11-data-contoh-seed)
12. [Standar kualitas & definisi selesai](#12-standar-kualitas--definisi-selesai)
13. [Riwayat percakapan & keputusan](#13-riwayat-percakapan--keputusan)
14. [Pertanyaan terbuka untuk pemilik / EDT](#14-pertanyaan-terbuka-untuk-pemilik--edt)
15. [Glosarium istilah program](#15-glosarium-istilah-program)

---

## 1. Visi, masalah, dan tujuan

### 1.1 Visi sekolah (Bab 1.2 Dokumen Master)
> Terwujudnya SMP IT Al Madany sebagai lembaga pendidikan unggulan berbasis Islam yang menghasilkan lulusan berdaya saing global melalui pembelajaran bilingual pada tahun 2028.

Target besar: **pembelajaran bilingual penuh (full bilingual) pada Juli 2028**, dengan model *partial immersion terintegrasi* yang memadukan Kurikulum Merdeka dan **Cambridge Lower Secondary English as a Second Language (0876)**.

Misi program:
1. Membangun budaya (daily habit berbahasa Inggris).
2. Meningkatkan kompetensi guru dan staf.
3. Mengintegrasikan kurikulum (Nasional + Cambridge).
4. Melibatkan orang tua dan masyarakat.
5. Menjamin keberlanjutan (anggaran, insentif, monitoring).

### 1.2 Masalah yang dijawab LMS
Hasil pemetaan awal (April 2026):
- Kemampuan Inggris guru sangat beragam: 1–2 orang C1, beberapa B1/B2, **sebagian besar A2**.
- Siswa relatif lebih baik (rata-rata A2) karena banyak alumni kursus di Pare, Kediri: ±60% A2, ±30% A1, ±10% Pre A1.
- **Belum ada sistem terstruktur untuk meningkatkan DAN memantau kemampuan guru secara berkelanjutan.** Selama ini monitoring hanya rencana di Excel/Sheets dan grup WhatsApp.

LMS ini adalah **sistem itu**: tempat guru melapor dan berlatih, tempat EDT memverifikasi dan menilai, dan tempat semua pihak melihat progres menuju 2028.

### 1.3 Tujuan LMS (kata-kata pemilik)
> "Buatkan website LMS untuk mengimplementasikan program bilingual tersebut, di mana ada akun tiap-tiap guru untuk mengevaluasi capaiannya masing-masing. Website ini untuk perkembangan antara guru dan murid untuk bilingual, dan semua progress yang telah dilakukan bisa dimonitoring. Ada 3 user: admin, guru, siswa. Admin bisa lihat progress guru, guru bisa lihat progress siswa."

Diterjemahkan menjadi tujuan terukur:

| # | Tujuan | Indikator keberhasilan LMS |
|---|---|---|
| G1 | Setiap guru punya akun untuk **mengevaluasi capaiannya sendiri** | Guru melihat level Duta Inggris, CEFR/TOEFL, checklist syarat naik level, partisipasi, hafalan, poin, dan lencana di dashboard-nya |
| G2 | **Admin memantau semua guru** | Dashboard admin = versi digital "Dashboard Sederhana" Bab 5.3, plus Laporan Bulanan EDT (Lampiran 5) otomatis |
| G3 | **Guru memantau siswa** di kelas yang diampu | Level CEFR siswa vs target kelas, riwayat asesmen, kuis, kehadiran club, lomba |
| G4 | **Siswa memantau dirinya** dan belajar | Level & target, grafik perkembangan, materi + kuis, poin, club, prestasi |
| G5 | **Program berjalan sesuai Dokumen Master** | Semua angka, rumus, tahapan, dan formulir di LMS sama dengan dokumen (lihat Bagian 4–5) |
| G6 | Mendukung target SMART T1–T6 | Indikator T1–T6 bisa dibaca dari data LMS (lihat 4.2) |

### 1.4 Di luar lingkup (saat ini)
- Pengganti grup WhatsApp ELITE. WA tetap dipakai untuk voice note; LMS adalah **pencatatan + verifikasi + monitoring**.
- Pencairan insentif/keuangan (hanya dicatat sebagai info level; nominal "Rp ..." di dokumen belum diisi sekolah).
- Akun orang tua (Bab 7.6 panduan orang tua). Kandidat fase berikutnya.
- Deploy online (dibahas setelah versi lokal matang).

---

## 2. Pengguna & hak akses

### 2.1 Peran

| Peran | Siapa di dunia nyata | Kebutuhan utama |
|---|---|---|
| **ADMIN** | Tim English Development Team (EDT), Ketua EDT, Kepala Sekolah, Wakil Kurikulum | Melihat progres seluruh guru dan gambaran siswa; memverifikasi laporan guru; menginput asesmen, observasi, micro-teaching; memutuskan banding; membuat laporan bulanan; mengelola akun/kelas |
| **TEACHER** (Guru) | Seluruh guru mapel (termasuk guru Bahasa Inggris) | Melapor kegiatan ELITE harian; berlatih Pocket Book; mengerjakan Weekly Challenge; menulis refleksi & RPP bilingual; melihat hasil asesmen/observasi; menilai & memantau siswa di kelasnya; membina club/lomba |
| **STUDENT** (Siswa) | Siswa kelas 7, 8, 9 | Belajar materi & kosakata, mengerjakan kuis, melihat level & target, melihat kehadiran club dan prestasi |

### 2.2 Matriks akses (wajib ditegakkan di server)

| Data | Admin | Guru | Siswa |
|---|---|---|---|
| Profil & metrik semua guru | Baca & ubah | Hanya miliknya (baca) | – |
| Log ELITE harian | Verifikasi semua | Buat/ubah miliknya (status kembali PENDING) | – |
| Asesmen Duta Inggris | Buat | Baca miliknya, ajukan banding | – |
| Observasi kelas | Buat | Baca miliknya | – |
| Refleksi, RPP | Verifikasi/beri catatan | Buat/ubah miliknya | – |
| Pocket Book, Weekly Challenge | Verifikasi | Ajukan miliknya | – |
| Data siswa | Semua kelas | **Hanya kelas yang diampu** (`TeachingAssignment`) | Hanya dirinya |
| Nilai siswa | Baca semua | Input untuk siswa di kelasnya | Baca miliknya |
| Materi & kuis | Kelola semua | Kelola miliknya | Baca yang terbit + kerjakan kuis |
| Club, lomba | Kelola semua | Kelola (sebagai pembina) | Baca miliknya |
| Pengguna, kelas, penugasan | Kelola | – | – |
| Pengumuman | Buat | Baca (ALL/TEACHER) | Baca (ALL/STUDENT) |

Helper yang sudah ada: `requireAdmin()`, `requireTeacher()`, `requireStudent()`, `canViewStudent(studentId)` di `src/lib/auth.ts`.

---

## 3. Prinsip produk (fokus kita)

1. **Mengikuti Dokumen Master, bukan mengarang program baru.** Setiap fitur harus bisa ditunjuk asalnya (Bab/Lampiran). Bila dokumen kosong atau tidak konsisten, catat asumsinya (Bagian 14) dan tanyakan pemilik.
2. **Guru mengisi, admin memverifikasi.** Data laporan diri berstatus `PENDING`; **hanya `APPROVED` yang masuk metrik resmi** (partisipasi, poin, lencana, status). Ini keputusan eksplisit pemilik.
3. **Communication over perfection.** Semangat dokumen (Bab 3.5, Lampiran 10): mendukung, bukan menghakimi. Bahasa UI positif: "belum memenuhi syarat", bukan "gagal". Hasil tidak dibandingkan antar-guru di halaman guru. Peringkat/leaderboard antar guru **tidak** ditampilkan ke guru tanpa persetujuan pemilik.
4. **Monitoring yang langsung terbaca.** Ringkasan dulu, detail kemudian. Status tampil sebagai pill berwarna dengan teks (On track / Perhatian / Perlu pendampingan), tidak hanya angka.
5. **Habit-forming.** Gamifikasi ringan seperti streak, poin, lencana, dan Weekly Challenge, supaya kebiasaan harian terbentuk (inspirasi Duolingo).
6. **Cepat terlihat, lalu diiterasi.** Pemilik mengutamakan versi yang bisa dibuka di localhost secepatnya, lalu dilengkapi bertahap.
7. **Bahasa Indonesia** untuk seluruh UI dan komunikasi. Istilah program tetap sesuai dokumen (Mirror Morning, Misi Harian, English Zone, Duta Inggris/Ambassador, Pocket Book, Weekly Challenge).
8. **Satu sumber angka.** Semua ambang, bobot, target, dan jadwal hanya didefinisikan di `src/lib/program.ts`.

---

## 4. Isi program yang harus diwujudkan

Ringkasan Dokumen Master. Nomor bab/lampiran disertakan untuk ditelusuri di PDF.

### 4.1 Peta jalan (Bab 1.3) → `PHASES`, `getPhaseStates()` / `getCurrentPhase()`

| Fase | Periode | Fokus | Target akhir fase |
|---|---|---|---|
| F0 | Apr 2026 (1 bln) | Asesmen awal, sosialisasi, pembentukan tim | Peta kemampuan guru & siswa, SK Tim EDT |
| F1 | Mei–Jul 2026 (3 bln) | Foundation & Habit Building | 70% guru aktif di program WA, 60% guru lulus Bronze |
| F2 | Agu–Okt 2026 (3 bln) | Pilot Implementation | 3–5 pilot teacher mengajar full lesson bilingual, protokol observasi siap |
| F3 | Nov 2026–Apr 2027 (6 bln) | Operasionalisasi Sistem | Seluruh guru memiliki level Duta Inggris, sistem monitoring berjalan |
| F4 | Mei 2027–Apr 2028 (12 bln) | Pemantapan & Ekspansi | 100% guru minimal B1, bilingual di 50% mapel |
| F5 | Mei–Jun 2028 (2 bln) | Evaluasi Final & Persiapan Akreditasi | Siap full bilingual Juli 2028 |

Per November 2026 program memasuki **Fase 3** (Operasionalisasi). LMS ini adalah bagian dari "sistem monitoring berjalan".

**Status fase diselesaikan manual oleh admin, berurutan (keputusan pemilik, 18 Nov 2026).** Tanggal di tabel hanya rencana; status tidak dihitung dari tanggal.
- Satu peta jalan untuk seluruh sekolah (model `PhaseProgress`, logika di `src/lib/phases-server.ts`, aksi di `src/actions/phases.ts`).
- Setiap fase punya `material` (ringkasan Dokumen Master) dan `checklist` di `PHASES` (`src/lib/program.ts`). Halaman: `/admin/fase/[code]`.
- Fase bisa ditandai selesai hanya bila materi ditandai "sudah dibaca" **dan** semua butir checklist dicentang. Hanya admin yang bisa.
- Fase berikutnya **terkunci (gembok)** sampai fase sebelumnya selesai. Semua aksi pada fase terkunci ditolak di server.
- Fase yang sudah selesai tidak bisa diubah. Hanya fase selesai **terakhir** yang bisa dibuka kembali, dan fase sesudahnya otomatis terkunci lagi.
- "Fase saat ini" (header dashboard admin & guru) = fase pertama yang belum selesai.

### 4.2 Tujuan SMART (Bab 1.2) → `SMART_GOALS`

| Kode | Indikator | Target | Data LMS untuk mengukur |
|---|---|---|---|
| T1 | 100% guru minimal B1 (CEFR) | Des 2027 | `Teacher.cefrLevel` |
| T2 | 50% guru minimal B2 dan 20% minimal C1 | Des 2027 | `Teacher.cefrLevel` |
| T3 | Sistem Duta Inggris 3 level + insentif berjalan efektif | Jul 2026 | `Teacher.ambassadorLevel`, `Assessment` |
| T4 | 100% mapel non-bahasa punya perangkat pembelajaran bilingual | Des 2027 | `LessonPlan` per mapel (status DISETUJUI) |
| T5 | Rata-rata TOEFL Prediction siswa kelas 9 ≥ 500 | Jun 2028 | `StudentAssessment` type TOEFL, kelas 9 |
| T6 | Terakreditasi Sekolah Bilingual dengan Integrasi Cambridge Pathway | 2028 | Di luar sistem (bisa checklist manual) |

**Fitur yang diharapkan:** kartu "Progres SMART" di dashboard admin yang menghitung T1, T2, T4, dan T5 secara otomatis (saat ini baru daftar teks).

### 4.3 Model integrasi kurikulum (Bab 1.4)
- Core Cambridge (Mathematics, Science, ESL): Inggris minimal 70%.
- Nasional (IPA, IPS, Matematika kelas bilingual, PKN): bilingual, istilah teknis Inggris diperkenalkan.
- Keislaman (Al-Qur'an, Fiqih, Akidah Akhlak, Bahasa Arab): Indonesia/Arab.
- Lokal & Karakter (Seni Budaya, PJOK, Mulok): bilingual.
- 5 Cambridge skills: **Reading, Writing, Use of English, Listening, Speaking** → `CAMBRIDGE_SKILLS` (dipakai di RPP dan komponen nilai siswa).

Target persentase mapel bilingual (Lampiran 8): 2026–27 **30%**, 2027–28 **70%**, 2028–29 **100%** mapel non-bahasa.

### 4.4 Pemetaan kemampuan guru (Bab 2.1)
- Instrumen: TOEFL Prediction, Cambridge Placement Test (opsional), observasi & wawancara.
- Konversi TOEFL → CEFR: 550+ C1, 500–549 B2, 450–499 B1, 350–449 A2 → `cefrFromToefl()`.
- **Pemetaan ulang setiap 6 bulan (Juni & Desember)** → model `CefrRecord` (riwayat).
- Target kenaikan: A2 → A2+ (6 bln) → B1 (1 thn) → B2 (2 thn); B1 → B1+ → B2 → B2+; B2 → B2+ → C1 → C1+ → `TEACHER_CEFR_PATH`.
- Target jumlah guru: C1 5 orang (2027) / 10+ (2028); B2 10 / 15+; B1 12 / semua; A2 3 / 0.

### 4.5 Pemetaan & target siswa (Bab 2.2, 7.3) → `STUDENT_TARGET`

| Kelas | Target akhir tahun | Target saat lulus 2028 | Asesmen (oleh guru Bahasa Inggris) | Frekuensi |
|---|---|---|---|---|
| 7 | A2 (minimal) | B1 | Observasi partisipasi di kelas (siswa merespon instruksi Inggris) | 2×/semester |
| 8 | A2+ | B1+ | Simple speaking test 1–2 menit (bertanya & menjawab sederhana) | 2×/semester |
| 9 | B1 | B2 | TOEFL ITP prediction (min. 450, target 500 di 2028) | 1×/semester |

Catatan dokumen: *"Tidak ada target memaksa semua siswa lancar; fokus pada keberanian dan pemahaman instruksi."* Nada UI siswa harus menyemangati.

### 4.6 Fase 1: ELITE English Habit (Bab 3.1–3.2, Lampiran 2)
ELITE = *English Language Immersion Through Everyday*. Grup WhatsApp, Senin–Jumat 06.00–20.00, bahasa utama Inggris, admin EDT. Sanksi: peringatan personal + tugas tambahan 5 kalimat.

Struktur harian → `DAILY_SCHEDULE`:

| Waktu | Aktivitas |
|---|---|
| 05.30 | Admin posting Mirror Morning (teks) |
| 05.30–06.00 | Guru latihan di depan cermin & rekam voice note (maks. 30 detik) |
| 06.15 | **Deadline voice note** |
| 06.30 | Admin posting Misi Harian |
| 12.00 | Admin tag yang belum menjawab |
| 18.00 | Admin beri apresiasi jawaban terbaik |
| 20.00 | **Deadline Misi Harian** & penutupan |

Tema mingguan → `ELITE_WEEK_THEMES`: (1) Greetings & Gratitude, (2) Instructions, (3) Student Interaction, (4) Reflection. Lampiran 2 berisi contoh teks Mirror Morning & Misi Harian hari 1–5 serta format **Weekly Report** Jumat sore (rata-rata partisipasi, guru paling aktif, jawaban terbaik, fokus minggu depan).

**Fitur yang diharapkan:**
- Pustaka teks Mirror Morning/Misi Harian per hari (admin bisa menulis/menjadwalkan), ditampilkan di halaman ELITE guru.
- Generator "Weekly Report" otomatis yang bisa disalin ke WA.

### 4.7 English Zone & English Buddy (Bab 3.3)
English Zone (area wajib Inggris): Bronze di ruang guru min. 3×30 menit/minggu; Silver di ruang guru + koridor 4×30; Gold di seluruh area sekolah 5×30.

English Buddy: setiap guru A2 dipasangkan dengan guru B1/B2/C1 (`Teacher.buddyId`). Bertemu 2×/minggu @30 menit untuk latihan pengucapan, simulasi mengajar 10 menit, dan umpan balik. Jadwal 4 minggu: (1) getting to know & 5 kalimat pembuka, (2) 6 instruksi inti, (3) 5 kalimat pengelolaan kelas, (4) closing & mini-teaching.

### 4.8 Pocket Book 50 kalimat (Bab 3.4, Lampiran 3) → model `Phrase` (sudah di-seed lengkap)
Kategori: Opening (no. 1–5), Instructions (6–25), Classroom Management (26–35), Feedback & Motivation (36–43), Closing (44–50). Target hafalan (Lampiran 3): **Bronze 20, Silver 35, Gold 45**.

### 4.9 Fase 2: Pilot (Bab 4)
**Micro-teaching** (Bulan 4) → `MICRO_FOCUS`, `microResult()`, model `MicroTeaching`:

| Minggu | Fokus | Durasi | Format |
|---|---|---|---|
| 1 | Opening & Instruction | 10 mnt | Berpasangan (A2 + B1+) |
| 2 | Main Activity & Monitoring | 15 mnt | Kelompok 3–4 guru |
| 3 | Checking for Understanding | 15 mnt | Seluruh guru |
| 4 | Full Mini-Lesson (dinilai EDT) | 20 mnt | Seluruh guru |

Rubrik 4 aspek @25%: pembukaan & instruksi, aktivitas inti, CFU, penutup & transisi (skor 1–4 → /100). Hasil: **≥ 70 lulus** → Real-Class Pilot; **60–69 pendampingan** (ulang minggu depan); **< 60 belum siap** (pendampingan intensif 2 minggu).

**Pilot teacher** (`Teacher.isPilot`): syaratnya partisipasi WA ≥ 70%, lulus micro-teaching ≥ 70, rekomendasi EDT, bersedia direkam. Umpan balik observasi wajib < 24 jam, total 30 menit: apresiasi 5', refleksi guru 10', 2–3 saran 10', kesepakatan 5'.

### 4.10 Fase 3: Instrumen operasional (Bab 5)
- **Juknis**: tahapan % Inggris per level **Bronze 30%, Silver 50%, Gold 70%, Mentor 85%**. Sanksi: 3 bulan tak memenuhi kewajiban → turun level.
- **SOP**:

| SOP | Penanggung jawab | Frekuensi |
|---|---|---|
| Pendaftaran Duta Inggris | EDT | Awal semester |
| Asesmen level | EDT + Kepsek | Setiap 6 bulan |
| Observasi kelas | Kepsek/Wakil | 2×/semester/guru |
| Pencairan insentif | Bendahara | Bulanan |
| Pelatihan rutin | Ketua EDT | Jumat minggu ke-2 |
| Banding | Kepsek | Maks. 14 hari |

- **RPP Bilingual** wajib berisi: target level (Bronze/Silver/Gold), minimal 3 kalimat Inggris, skenario (tahap, waktu, aktivitas, bahasa), dan refleksi setelah mengajar. Ada juga RPP Hybrid dengan integrasi Cambridge skills (Lampiran 11).
- **Bank Kalimat 50+ situasi**: membuka kelas, menyampaikan tujuan, instruksi, memeriksa pemahaman, pujian & teguran, menutup kelas.
- **Jadwal observasi per semester**: Bulan 1 semua Bronze (Wakil Kurikulum, 15'); Bulan 2 semua Silver (Kepsek, 20'); Bulan 3 sampel acak 30% (EDT, 15'); Bulan 4 semua Gold (Kepsek + EDT, 30'); Bulan 6 semua guru (tim gabungan).
- **Laporan Bulanan EDT** (Lampiran 5):
  - A. Ringkasan eksekutif.
  - B. Data Duta Inggris per level: jumlah, target tercapai, rata-rata % Inggris, % aktif English Zone, jumlah bermasalah.
  - C. Hasil observasi bulan ini.
  - D. Partisipasi WA & Mirror Morning: rata-rata harian (target 80%), guru 100% (target 50%), guru < 50% (target < 10%).
  - E. Kendala & tindak lanjut.
  - F. Rekomendasi (penanggung jawab, batas waktu).
  - G. Rencana bulan depan.
  - H. Persetujuan.
- **Reward & sanksi**:
  - Reward: prestasi → bonus + piagam; naik level → voucher buku; TOEFL naik > 50 poin dalam 6 bulan → dispensasi 1 hari; mentor terbaik.
  - Sanksi: 3 bulan tak penuhi kewajiban → turun level & insentif dihentikan; terus memakai bahasa Indonesia tanpa usaha → 5 sesi Mirror Morning tambahan; tidak hadir pelatihan tanpa alasan → potong insentif 10%.

### 4.11 Sistem Duta Inggris (Bab 6, Lampiran 1, 6, 7, 10) → `LEVEL_RULES`

| | Bronze | Silver | Gold |
|---|---|---|---|
| CEFR | A2–B1 | B1–B2 | B2–C1 |
| Nilai akhir minimal | **66,5** | **76,2** | **84,1** + TOEFL ≥ 550 / IELTS ≥ 6.0 |
| % Inggris di kelas (Juknis) | 30% | 50% | 70% |
| English Zone | 3×30 mnt/mgg, ruang guru | 4×30, + koridor | 5×30, seluruh sekolah |
| Hafalan Pocket Book | 20 | 35 | 45 |
| Partisipasi WA | ≥ 70% | ≥ 70% | ≥ 70% |
| Mentor | – | 1 guru Bronze | 2 guru |
| Syarat lain | – | Sudah Bronze ≥ 6 bulan, 1 konten sederhana/bulan | Sudah Silver ≥ 6 bulan, mengajar 1 mapel non-Inggris bilingual penuh 1 jam, memimpin pelatihan mini tiap 2 bulan |
| Masa berlaku | 3 bulan | 6 bulan | 1 tahun |
| Simulasi mengajar | 10 menit (instruksi) | 15 menit (aktivitas utama) | 20 menit (full mini-lesson) |
| Sertifikat | Cokelat | Abu-abu | Emas |

**Alur asesmen** (Bab 6.2): Pendaftaran (formulir) → tes awal penempatan → masa persiapan 1 bulan → verifikasi kriteria oleh EDT → pengumuman & tanda tangan kontrak → insentif mulai diberikan.

**Komponen asesmen**:
- Tes lisan 50%, oleh 2 penguji (1 C1 + 1 EDT). Bentuknya interview + role play; pertanyaan per level ada di Lampiran 10 Bagian 3.3.
- Tes tertulis 30%, oleh EDT. Bank soal Lampiran 1:
  - Bronze: 10 PG + 5 menjodohkan + 5 isian.
  - Silver: 10 PG + 5 error identification + 5 membuat kalimat.
  - Gold: 15 cloze + paragraf 150–250 kata.
  - Waktu 30 menit, tanpa kamus/HP.
- Simulasi mengajar 20%, oleh EDT + Kepsek.

**Panduan penguji** (Lampiran 10): prinsip mendukung, konsisten, transparan, fokus komunikasi, umpan balik membangun. Hasil disampaikan tertutup dan tidak dibandingkan dengan guru lain. Gold hanya diuji guru C1 atau Kepala Sekolah. Latih kalibrasi antar penguji (selisih > 5 poin didiskusikan).

**Formulir Pendaftaran** (Lampiran 6):
- Identitas: nama, NIP/NUPTK, mapel, tahun masuk, jabatan tambahan, WA.
- Level yang dituju dan level saat ini.
- Motivasi: alasan, tantangan, jam/minggu (1–2 / 3–4 / 5+), bersedia jadi mentor.
- Persyaratan: TOEFL/IELTS untuk Gold, surat rekomendasi atasan, laporan asesmen sebelumnya, pas foto.
- 6 pernyataan komitmen.
- Bagian admin: tanggal terima, kelengkapan, tanggal asesmen, verifikator, hasil.

**Formulir Banding** (Lampiran 7) → model `Appeal`:
- Batas waktu: diajukan maks. **7 hari** setelah hasil keluar, diproses maks. **14 hari kerja**, keputusan final.
- Alasan: prosedur tidak sesuai / bobot tidak proporsional / ada informasi baru / nilai tidak mencerminkan kemampuan / lainnya, masing-masing dengan penjelasan dan bukti pendukung.
- Harapan: asesmen ulang dengan penguji berbeda / koreksi nilai via peninjauan berkas / penjelasan tertulis saja.
- Tim banding: Kepsek (ketua) + 1 EDT (bukan penguji yang bersangkutan) + 1 perwakilan guru.
- Hasil: DITERIMA (jadwal ulang), DITERIMA SEBAGIAN (nilai direvisi), DITOLAK. Jika ditolak, asesmen ulang di periode berikutnya (6 bulan).

**Gamifikasi** (Bab 6.4–6.5): lencana digital dan Weekly Challenge Card 12 minggu. Isi detailnya **tidak ada di PDF**; versi buatan kita ada di Bagian 11.

### 4.12 Observasi kelas & refleksi (Lampiran 4) → `OBSERVATION_ITEMS`
**Lembar observer** berisi identitas (guru, mapel, kelas/semester, tanggal, waktu, observer, level guru) dan 10 aspek Ya/Tidak + catatan contoh kalimat:
1. Membuka kelas dengan sapaan Inggris.
2. Menyampaikan tujuan pembelajaran dalam Inggris.
3. Instruksi kegiatan dalam Inggris (minimal 3 kali).
4. Pujian/motivasi dalam Inggris.
5. Teguran/pengelolaan kelas dalam Inggris.
6. CFU dalam Inggris.
7. Merespon pertanyaan/jawaban siswa dalam Inggris (atau campuran terstruktur).
8. Konsisten (tidak bolak-balik tanpa pola).
9. Menutup kelas dalam Inggris.
10. Siswa merespon instruksi dengan tepat.

Selain itu lembar berisi estimasi % Inggris (< 20 / 20–40 / 40–60 / 60–80 / > 80), kekuatan guru (min. 2), area perbaikan (maks. 3), rekomendasi (pertahankan / siap naik / pendampingan di area …), dan tanda tangan observer & guru.

**Lembar refleksi diri guru** setelah mengajar: target hari ini (Bronze 30% / Silver 50% / Gold 70%), tercapai? (Ya/Sebagian/Tidak), kalimat yang lancar, kalimat yang sulit/lupa, respon siswa (sangat positif/positif/biasa/bingung), tantangan terbesar, yang akan diubah, hal yang membanggakan → model `Reflection`.

### 4.13 Pengembangan siswa (Bab 7)
- **Madani English Club**: Sabtu 08.00–09.30, pembina guru Gold & Silver, peserta sukarela kelas 7 & 8. Struktur: ice breaking & greeting 15', aktivitas utama 30' (bergantian debat/storytelling/drama/games), practice corner 30', refleksi 15'.
- **Peer Tutoring**: siswa A2/B1 (alumni Pare) dilatih Guru Gold 2 sesi (4 jam) menjadi tutor, mendapat sertifikat **Student Ambassador** + poin ekstrakurikuler. Jadwal Kamis sore 30 menit.
- **Lomba**:
  - Target per tahun: kecamatan ≥ 5 cabang & ≥ 2 juara; kabupaten ≥ 3 cabang & ≥ 1 juara; provinsi ≥ 2 cabang & ≥ 1 finalis; nasional 1 cabang.
  - Indikator bertahap 2026–27 → 2028–29 ada di Bab 7.9.
  - Jenis lomba dan level siswa yang cocok → `COMPETITION_CATEGORIES`.
  - Kalender estimasi (Bab 7.7): Jan–Feb seleksi internal, Mar MGMP, Apr JSO, Apr–Mei I-O2MEC, Mei SOBBI, Jul–Agu GEC, Sep–Okt Pidato Balai Bahasa, Nov Literasi MGMP, Des NEO.
  - Strategi persiapan: sosialisasi 2 bulan sebelum, seleksi kelas 1,5 bulan, seleksi sekolah 1 bulan, pembinaan intensif 2–4 minggu.
  - Reward per tingkat juara: sertifikat, buku, uang pembinaan, beasiswa, publikasi.
- **Orang tua**: Parent's Guide, surat edaran bulanan (6 template), undangan English Day. Saat ini di luar lingkup (kandidat fitur).
- **Poster/Mading Digital Bulanan** (Lampiran 9): Duta Inggris bulan ini per level dengan alasan (mis. "3 bulan berturut-turut Gold", "TOEFL naik 40 poin", "Most Improved", "Best Voice Note", "Partisipasi 100%"), fokus bulan ini, tips, jadwal English Zone & mentoring, quote of the month. **Fitur yang diharapkan:** generator teks poster/WA otomatis dari data bulan itu.

---

## 5. Aturan bisnis & rumus

Semua sudah diimplementasikan di `src/lib/program.ts` dan `src/lib/metrics.ts`. Jangan menduplikasi.

### 5.1 Asesmen Duta Inggris
```
Tes lisan      = (Fluency + Pronunciation + Grammar + Vocabulary + Keberanian) × 5      // tiap aspek 1–4, maks 100
Tes tertulis   = 0–100   (Gold + TOEFL ≥ 550 dan kolom dikosongkan → otomatis 100, writtenWaived = true)
Simulasi       = (Instruksi + Adaptasi + Konsistensi + Kejelasan) ÷ 16 × 100             // tiap aspek 1–4
Nilai akhir    = Lisan × 0,5 + Tertulis × 0,3 + Simulasi × 0,2                           // dibulatkan 1 desimal
Level diberikan = level tertinggi ≤ level dituju dengan Nilai akhir ≥ batas;
                  Gold hanya jika TOEFL ≥ 550.
```
Contoh dokumen: lisan 75, tertulis 70, simulasi 75 → **73,5** → lulus Bronze, belum Silver.

Setelah asesmen disimpan: bila level baru lebih tinggi, `Teacher.ambassadorLevel` naik dan `levelSince` = tanggal asesmen, lalu `syncTeacherBadges()` dipanggil. **Turun level** (sanksi 3 bulan) belum otomatis; rencananya admin melakukannya manual dengan alasan tercatat.

Rubrik konsistensi bahasa Inggris pada simulasi (Lampiran 10):

| Skor | Bronze | Silver | Gold |
|---|---|---|---|
| 4 | 70%+ | 85%+ | 95%+ |
| 3 | 50–69% | 70–84% | 85–94% |
| 2 | 30–49% | 50–69% | 70–84% |
| 1 | < 30% | < 50% | < 70% |

### 5.2 Partisipasi ELITE (`summarizeTeacher`)
- Jendela **30 hari** terakhir; penyebut = hari kerja (Sen–Jum) × 2 kegiatan.
- `partisipasi% = (jumlah Mirror Morning APPROVED + jumlah Misi Harian APPROVED) ÷ (hariKerja × 2) × 100`, maksimal 100.
- English Zone minggu ini = Σ floor(menit ÷ 30) dari log minggu berjalan (non-REJECTED).
- % Inggris di kelas = observasi terbaru; jika belum ada, rata-rata `englishInClassPct` dari log terverifikasi.

### 5.3 Status guru (`teacherStatus`, kolom "Status" Bab 5.3)
```
target = target % Inggris level guru (Bronze 30 / Silver 50 / Gold 70; belum level = 30)
On track            : partisipasi ≥ 70  DAN  %Inggris ≥ target
Perhatian           : partisipasi ≥ 50  DAN  %Inggris ≥ target − 15
Perlu pendampingan  : selain itu
```

### 5.4 Checklist naik level (`nextLevelReadiness`)
Untuk level berikutnya: partisipasi ≥ 70%, English Zone sesuai level/minggu, hafalan Pocket Book sesuai level, % Inggris ≥ target. Silver/Gold menambah syarat lama di level sebelumnya ≥ 6 bulan dan jumlah mentee (dari `Teacher.buddies`). Gold menambah TOEFL ≥ 550.

### 5.5 Poin guru (`TEACHER_POINTS`, hanya data APPROVED)
Mirror Morning +2, voice note sebelum 06.15 +1, Misi Harian +2, setiap 30 menit English Zone +1, sesi Buddy +2, setiap kalimat Pocket Book terverifikasi +1, Weekly Challenge terverifikasi +10 (`WeeklyChallenge.points`).

### 5.6 Lencana guru (`syncTeacherBadges`, otomatis)

| Kode | Nama | Syarat |
|---|---|---|
| ENGLISH_STARTER | English Starter | Pernah lulus asesmen (level apa pun) |
| ENGLISH_PRACTITIONER | English Practitioner | Lulus Silver/Gold |
| ENGLISH_LEADER | English Leader | Lulus Gold |
| EARLY_BIRD | Early Bird | ≥ 10 voice note tepat waktu terverifikasi |
| MOST_IMPROVED | Most Improved | Nilai akhir asesmen terakhir − pertama ≥ 10 |
| TOEFL_CHALLENGER | TOEFL Challenger | TOEFL naik > 50 (riwayat CefrRecord) atau ≥ 550 |
| COLLABORATION | Collaboration | ≥ 8 sesi Buddy terverifikasi |
| POCKET_MASTER | Pocket Book Master | 50 kalimat terverifikasi |
| CHALLENGE_CHAMPION | Challenge Champion | 12 Weekly Challenge terverifikasi |
| FULL_PARTICIPATION | Full Participation | Partisipasi 30 hari = 100% |

### 5.7 Siswa
- Level CEFR siswa (`Student.cefrLevel`) diperbarui dari asesmen terbaru oleh guru Bahasa Inggris.
- "Capai target" = `cefrAtLeast(level, STUDENT_TARGET[grade].endOfYear)`.
- Poin siswa (`studentPoints`): per kuis ambil nilai terbaik; lulus (≥ `passScore`, default 70) +10, belum lulus +3. Kehadiran club: tutor +5, peserta +3. Lomba: `competitionPoints(level, hasil)` = basis hasil × pengali tingkat.

| Hasil | Basis | | Tingkat | Pengali |
|---|---|---|---|---|
| Peserta | 5 | | Internal | 0,5 |
| Finalis | 10 | | Kecamatan | 1 |
| Harapan | 15 | | Kabupaten/Kota | 2 |
| Juara 3 | 20 | | Provinsi | 3 |
| Juara 2 | 30 | | Nasional/Internasional | 4 |
| Juara 1 | 40 | | | |

### 5.8 Tanggal & waktu
- Zona waktu sekolah WIB. Tanggal tanpa jam disimpan sebagai UTC 00:00 lewat `dayKey()`. Input tanggal memakai `toInputDate()`.
- Satu log ELITE per guru per tanggal (`@@unique([teacherId, date])`); mengirim ulang memperbarui log dan mengembalikan status ke PENDING.
- Tanggal di masa depan ditolak.

---

## 6. Alur kerja utama end-to-end

### A. Kebiasaan harian guru (sudah jalan)
1. 05.30 guru menerima teks Mirror Morning di WA, merekam voice note, lalu mengerjakan Misi Harian.
2. Guru membuka **/guru/harian** dan mencentang kegiatan: Mirror (+tepat waktu), Misi (+jawaban Inggris), menit English Zone, sesi Buddy, estimasi % Inggris di kelas. Data tersimpan sebagai **PENDING**.
3. Admin membuka **/admin/verifikasi** (badge merah di sidebar), mencocokkan dengan grup WA, lalu memilih Setujui/Tolak (atau Setujui semua).
4. Metrik resmi, poin, lencana, dan status guru terbarui di **/admin** dan **/guru**.

### B. Naik level Duta Inggris (sebagian jalan)
1. *(Belum)* Guru mengisi Formulir Pendaftaran (Lampiran 6) di **/guru/duta**.
2. *(Belum)* Admin memeriksa kelengkapan dan menjadwalkan asesmen.
3. **(Sudah)** Admin menginput hasil di **/admin/asesmen**: pratinjau nilai real-time, simpan, level naik otomatis.
4. *(Belum)* Guru melihat rincian skor + kekuatan/area perbaikan, lalu menandai "telah menerima hasil" (`Assessment.acknowledged`).
5. *(Belum)* Bila keberatan, guru mengajukan banding dalam 7 hari. Admin/tim banding memutuskan dalam 14 hari.

### C. Observasi → umpan balik → refleksi (belum)
1. Admin mengisi lembar observasi di **/admin/observasi/baru**.
2. Guru menerima hasil di **/guru/refleksi** (tab Observasi) dan menandai umpan balik sudah diterima (< 24 jam).
3. Guru mengisi refleksi diri setelah mengajar. Admin membaca dan memberi catatan.

### D. Perangkat ajar (belum)
Guru membuat RPP bilingual di **/guru/rpp**. Status DIAJUKAN, lalu admin memberi DISETUJUI / REVISI + catatan. Rekap per mapel menjadi indikator T4.

### E. Perkembangan siswa (sebagian jalan)
1. *(Belum)* Guru Bahasa Inggris menginput nilai per kelas di **/guru/nilai** (jenis sesuai kelas, semester, skor, CEFR, komponen Cambridge). `Student.cefrLevel` terbarui.
2. **(Sudah)** Guru melihat progres di **/guru/siswa**.
3. **(Sudah)** Siswa melihat level/target/grafik di **/siswa**, membaca materi, dan mengerjakan kuis.
4. *(Belum)* Pembina mencatat sesi English Club / Peer Tutoring + absensi; mencatat lomba & hasil. Poin siswa bertambah.

### F. Pelaporan bulanan (belum)
Admin membuka **/admin/laporan?bulan=YYYY-MM**. Bagian B–D Lampiran 5 terisi otomatis dari data; bagian A, E, F, G diisi manual. Hasilnya dicetak/simpan PDF dari browser. Ada juga generator teks Weekly Report WA dan Poster Duta Inggris bulan ini.

---

## 7. Spesifikasi halaman

Legenda: ✅ sudah ada & teruji · 🟡 sebagian · ⬜ belum.

### 7.1 Publik
| Rute | Status | Isi |
|---|---|---|
| `/` | ✅ | Landing claymorphism: navbar kaca, hero (hitung mundur ke Juli 2028, pencarian kalimat/istilah, kartu melayang Mirror Morning/streak/progres/XP), bento "Popular Learning Paths" dengan filter Semua/Guru/Siswa dan efek tilt, CTA ke /login |
| `/login` | ✅ | Form email + password, panel akun demo. Login & redirect teruji di browser. |
| `/not-found` | ✅ | Halaman 404 ramah bertema claymorphism dengan tombol navigasi kembali ke Beranda & Login. |
| `error.tsx` | ✅ | Error boundary ramah bertema claymorphism dengan pesan penanganan Bahasa Indonesia & tombol coba lagi. |

### 7.2 Admin
| Rute | Status | Spesifikasi | Kriteria selesai |
|---|---|---|---|
| `/admin` | ✅ | KPI (guru ber-level, partisipasi ELITE, guru ≥ B1, siswa capai target, SMART T4 terhitung), peta jalan F0–F5, donut sebaran level, monitoring 18 guru dengan tautan ke detail `/admin/guru/[id]`, daftar "perlu perhatian", daftar SMART terhitung real-time |
| `/admin/guru` | ✅ | Tabel monitoring lengkap + filter (level, status, mapel) + pencarian + urutkan | Filter berfungsi lewat `searchParams`; ekspor CSV |
| `/admin/guru/[id]` | ✅ | Profil (NIP, mapel, WA, CEFR, TOEFL, level & masa berlaku, buddy, pilot), ringkasan metrik + checklist naik level, grafik partisipasi mingguan, riwayat CEFR/TOEFL, asesmen, observasi, refleksi, RPP, Pocket Book, challenge, lencana | Admin bisa mengubah CEFR/TOEFL (membuat `CefrRecord`), buddy, status pilot, dan menurunkan level dengan alasan |
| `/admin/verifikasi` | ✅ | Tab: ELITE harian (✅), Pocket Book (✅), Weekly Challenge (✅), Refleksi Guru (✅), RPP Bilingual (✅) | Tiap tab bisa setujui/tolak + catatan; tombol setujui semua; `syncTeacherBadges` dipanggil otomatis |
| `/admin/asesmen` | ✅ | Form asesmen (✅), kriteria (✅), riwayat (✅). Tab Pendaftaran, Micro-teaching, Banding | Micro-teaching: form 4 aspek → skor & hasil `microResult`. Banding: daftar + keputusan (DITERIMA / SEBAGIAN + nilai revisi / DITOLAK) + alasan, menandai yang > 14 hari |
| `/admin/observasi` | ✅ | Monitoring ketercapaian semester (target minimal 2×/guru), form observasi baru 10 aspek pedagogik Ya/Tidak (skor = Ya × 10), estimasi % Inggris, kekuatan guru, area perbaikan, rekomendasi observer, riwayat observasi lengkap + status penerimaan guru | Form & monitoring tuntas teruji |
| `/admin/siswa` | ✅ | Ringkasan per kelas: jumlah capai target, distribusi CEFR, rata-rata TOEFL kelas 9 (T5); alumni Pare & Student Ambassador, pencarian siswa + navigasi ke detail |
| `/admin/siswa/[id]` | ✅ | Komponen detail siswa bersama: CEFR journey vs target kelas, Cambridge radar/breakdown, riwayat asesmen, kuis mandiri, absensi club, prestasi lomba |
| `/admin/club` | ✅ | Rekap semua sesi English Club (Sabtu) & Peer Tutoring (Kamis), kehadiran siswa, penandaan status Student Ambassador |
| `/admin/lomba` | ✅ | Monitoring partisipasi lomba (Kecamatan s.d. Nasional), pencatatan juara/finalis, kalkulasi poin otomatis & target tahunan Bab 7.9 |
| `/admin/materi` | ✅ | Pusat kontrol kurikulum materi bilingual: status draf/terbit, vocabulary box, dan kuis interaktif |
| `/admin/laporan` | ✅ | Laporan Bulanan EDT format Lampiran 5 (lihat 6F) + generator Weekly Report WA + Poster Duta Inggris bulan ini | Pilih bulan; bagian B–D akurat dari data real-time; bagian A, E, F, G tersimpan di database; tampilan cetak rapi (`@media print`) |
| `/admin/pengumuman` | ✅ | Buat, terbitkan, dan hapus pengumuman; target audiens ALL/TEACHER/STUDENT | Tampil langsung di dashboard guru dan siswa sesuai target audiens |
| `/admin/pengguna` | ✅ | Manajemen akun guru (18 guru), siswa, admin/EDT; reset password; nonaktifkan akun; kelola kelas & penugasan mengajar (+wali kelas) | Email unik; password di-hash bcrypt; proteksi admin tidak bisa menonaktifkan diri sendiri |

### 7.3 Guru
| Rute | Status | Spesifikasi | Kriteria selesai |
|---|---|---|---|
| `/guru` | ✅ | Kartu level + checklist syarat naik level, streak, partisipasi, Pocket Book, poin, grafik mingguan, lencana, pengumuman | Tambah: teks Mirror Morning & Misi Harian hari ini; pengingat (log hari ini belum diisi, level akan kedaluwarsa) |
| `/guru/harian` | ✅ | Form log hari ini, struktur harian, tema mingguan, kalender 8 minggu, riwayat | Tambah: isi log tanggal lain (maks. 7 hari ke belakang), tampilkan catatan admin bila ditolak |
| `/guru/duta` | ✅ | Level & masa berlaku, kriteria per level, sertifikat (warna sesuai level, siap cetak), riwayat asesmen dengan rincian 5+4 aspek, tombol "telah menerima hasil", formulir pendaftaran (Lampiran 6), formulir banding (Lampiran 7, hanya ≤ 7 hari sejak hasil), hasil micro-teaching | Banding tersimpan sebagai `Appeal` DIAJUKAN; tidak bisa mengajukan banding ganda untuk asesmen yang sama |
| `/guru/pocket-book` | ✅ | 50 kalimat per kategori (ID ↔ EN), status per kalimat (belum / menunggu / hafal), tombol "Ajukan hafal", mode latihan flashcard (sembunyikan EN, ketuk untuk membuka), progres vs target level | Membuat `PhraseMastery` PENDING; tidak bisa mengajukan ulang kalimat yang sudah APPROVED |
| `/guru/challenge` | ✅ | 12 kartu Weekly Challenge (judul, deskripsi, target, poin), kirim bukti teks, status | `ChallengeProgress` PENDING; satu per minggu |
| `/guru/refleksi` | ✅ | Tab Refleksi (form Lampiran 4B + riwayat) dan Observasi (hasil observasi yang diterima + tombol "umpan balik diterima") | Teruji dan terhubung ke verifikasi EDT |
| `/guru/rpp` | ✅ | Daftar RPP + status; form: judul, mapel, kelas, tanggal, target level, Cambridge skills, tujuan, ≥ 3 kalimat Inggris, kosakata, pembuka/inti/penutup, rencana asesmen; detail `/guru/rpp/[id]` | Validasi minimal 3 kalimat Inggris; cetak PDF formal Lampiran 11 |
| `/guru/siswa` | ✅ | Tabel siswa per kelas yang diampu vs target CEFR | Tambah tautan ke `/guru/siswa/[id]` |
| `/guru/siswa/[id]` | ✅ | Detail siswa: level & target, grafik asesmen, komponen Cambridge, kuis, kehadiran club, lomba | Dilindungi `canViewStudent` (hanya guru pengampu kelas atau admin) |
| `/guru/nilai` | ✅ | Pilih kelas, lalu tabel isian seluruh siswa: jenis (default sesuai kelas: 7 OBSERVASI, 8 SPEAKING, 9 TOEFL), semester, tanggal, skor, CEFR (otomatis dari TOEFL untuk kelas 9 via `cefrFromToefl`), 5 komponen 1–4 opsional, catatan | Simpan massal; `Student.cefrLevel` diperbarui |
| `/guru/club` | ✅ | Buat sesi (ENGLISH_CLUB Sabtu / PEER_TUTORING Kamis), topik, aktivitas, absensi siswa (peserta +3 pt / tutor +5 pt), tandai Student Ambassador |
| `/guru/lomba` | ✅ | Catat lomba (nama, tingkat, cabang, penyelenggara, tanggal) dan peserta + hasil (Juara 1–3, Harapan, Finalis); kalkulator poin otomatis |
| `/guru/materi` | ✅ | Buat/ubah materi (judul, kategori, mapel, kelas, CEFR, ringkasan, isi paragraf, vocabulary box dinamis EN–ID) + pembuat kuis (soal, opsi, kunci, batas lulus) |

### 7.4 Siswa
| Rute | Status | Spesifikasi |
|---|---|---|
| `/siswa` | ✅ | Ring level CEFR vs target, target lulus, poin, kuis lulus, kehadiran club, lomba, grafik perkembangan, materi yang belum lulus, pengumuman |
| `/siswa/materi` | ✅ | Kartu materi (kelas sendiri, kelas di bawahnya, umum) + status nilai terbaik |
| `/siswa/materi/[id]` | ✅ | Isi materi, kosakata, kuis pilihan ganda, riwayat percobaan |
| `/siswa/nilai` | ✅ | Riwayat asesmen lengkap + rincian 5 komponen Cambridge + kartu edukasi target CEFR per jenjang kelas |
| `/siswa/club` | ✅ | Jadwal English Club & Peer Tutoring, log riwayat hadir (peran peserta/tutor), poin club, status Student Ambassador & syarat menjadi duta |
| `/siswa/prestasi` | ✅ | Lomba yang diikuti, hasil kejuaraan, rincian poin prestasi, galeri sertifikat/medali siswa |

Setiap halaman baru wajib didaftarkan di array `NAV` pada `src/components/app-shell.tsx`.

---

## 8. Roadmap bertahap + kriteria selesai

Kerjakan per sprint. Setiap sprint selesai jika `npx tsc --noEmit` lolos, setiap halaman baru dicek di browser dengan akun yang sesuai, dan tidak ada error di log `npm run dev`.

**Sprint 0: stabilisasi (✅ Selesai & teruji)**
- Uji login, logout, dan redirect per peran di browser. Akses `/admin` sebagai guru harus dialihkan.
- Tambah halaman `not-found` dan `error` yang ramah (bergaya clay).
- Tambah `loading.tsx` skeleton per peran.

**Sprint 1: alur Duta Inggris lengkap (✅ Selesai & teruji)**
- `/guru/duta` (detail asesmen, terima hasil, pendaftaran Lampiran 6, banding Lampiran 7, sertifikat digital siap cetak).
- `/admin/asesmen` tab Pendaftaran (verifikasi & jadwalkan), Micro-teaching (Bulan 4, 4 aspek), Banding (sidang & putusan 14 hari SOP).
- `/admin/guru` + `/admin/guru/[id]` (monitoring 18 guru, ekspor CSV, filter level/pilot/nama, edit profil & kualifikasi CEFR/TOEFL, penugasan buddy, sanksi turun level beralasan, checklist syarat naik level).

**Sprint 2: latihan & verifikasi (✅ Selesai & teruji)**
- `/guru/pocket-book` (50 frasa saku, filter kategori & pencarian, mode flashcard interaktif acak/balik, ajukan hafal).
- `/guru/challenge` (12 kartu tantangan mingguan, kirim bukti penerapan kelas, +10 poin, progress lencana).
- `/admin/verifikasi` tab ELITE Harian, Pocket Book, dan Weekly Challenge (setujui/tolak per item & tombol setujui semua, pemicu lencana `syncTeacherBadges`).

**Sprint 3: observasi, refleksi, RPP (✅ Selesai & teruji)**
- `/admin/observasi` (monitoring ketercapaian semester target 2×/guru, form observasi baru 10 aspek pedagogik Ya/Tidak skor = Ya × 10, riwayat & modal detail).
- `/guru/refleksi` (form refleksi mandiri Lampiran 4B, riwayat status verifikasi, hasil supervisi pengawas, tombol konfirmasi terima umpan balik).
- `/guru/rpp` & `/guru/rpp/[id]` (pembuat RPP bilingual dengan live sentence counter validasi ≥ 3 kalimat Inggris, Cambridge skills, status Draf/Diajukan/Disetujui/Revisi, dan lembar cetak resmi PDF Lampiran 11).
- `/admin/verifikasi` tab Refleksi Mengajar & RPP Bilingual (review approve/revisi/reject & tombol setujui semua).
- `/admin` dashboard KPI indikator SMART Goal T4 terhitung real-time.

**Sprint 4: pengembangan siswa & ekosistem pendukung (✅ Selesai & teruji)**
- Input nilai massal siswa `/guru/nilai` (pilih kelas, jenis asesmen sesuai jenjang, auto-estimasi CEFR dari TOEFL untuk kelas 9, rincian 5 komponen Cambridge, penyimpanan batch atomik).
- Komponen detail siswa bersama `/guru/siswa/[id]` & `/admin/siswa/[id]` (CEFR journey, Cambridge radar breakdown, riwayat asesmen, kuis mandiri, absensi club, prestasi lomba, proteksi `canViewStudent`).
- Direktori siswa admin `/admin/siswa` (monitoring ketercapaian target per kelas, prediksi TOEFL ITP SMART T5, filter kelas, statistik duta siswa & alumni Pare).
- Halaman nilai pribadi siswa `/siswa/nilai` (target kelas vs capaian, kartu panduan CEFR A1–C1, rincian 5 komponen kemampuan).
- English Club & Peer Tutoring: `/guru/club`, `/admin/club`, `/siswa/club` (jadwal Sabtu & Kamis, form presensi peran peserta +3 pt / tutor +5 pt, toggle Student Ambassador).
- Lomba & Prestasi: `/guru/lomba`, `/admin/lomba`, `/siswa/prestasi` (kategori lomba Kecamatan–Nasional, kalkulator poin otomatis, monitoring target tahunan Bab 7.9, galeri penghargaan).
- Kelola Materi & Kuis: `/guru/materi` & `/admin/materi` (editor materi bacaan bilingual dengan dynamic vocabulary box, builder kuis interaktif MCQ, katalog materi & status publikasi).

**Sprint 5: laporan & administrasi (✅ Selesai & teruji)**
- `/admin/laporan`: Dokumen formal Laporan Bulanan EDT Lampiran 5 (Bagian A Ringkasan Eksekutif, B Data Duta per Level, C Hasil Observasi Kelas, D Partisipasi ELITE, E Kendala, F Rekomendasi, G Rencana Aksi, H Lembar Pengesahan Kepsek & EDT, cetak PDF `@media print`), Generator Siaran Weekly Report WhatsApp dengan tombol salin format satu-klik, serta Poster Apresiasi Duta Inggris Bulan Ini (*Teacher of the Month*).
- `/admin/pengumuman`: Pusat broadcast pengumuman bilingual dengan pemilahan audiens ALL/TEACHER/STUDENT, terbit & hapus pengumuman real-time.
- `/admin/pengguna`: Manajemen pengguna 4 tab (Guru, Siswa, Admin/EDT, Kelas & Penugasan), pembuatan akun baru lengkap dengan hash bcrypt, reset password, toggle aktif/nonaktif dengan proteksi diri admin, pembuatan kelas baru, serta penugasan guru mata pelajaran & wali kelas.
- Navigasi `NAV.ADMIN` di `app-shell.tsx` diperluas dengan grup "Laporan & Administrasi".

**Penyempurnaan Dokumen Master Lampiran PDF (✅ Selesai & teruji):**
- **Lampiran 8 (Surat Edaran Orang Tua & Lembar RSVP):** Tab baru di `/admin/laporan`. Memuat kop surat resmi SMP IT Al Madany Pare, laporan kemajuan 6 bulan, 4 dampak positif pada siswa & guru, target roadmap 2028, undangan sosialisasi English Day di aula, 5 tips praktis pendampingan di rumah, tanda tangan Kepsek & EDT, serta lembar konfirmasi RSVP (desain potong di sini) siap cetak.
- **Lampiran 1 (Bank Soal Ujian Tertulis Guru):** Tab baru di `/admin/asesmen?tab=banksoal`. Naskah soal ujian tertulis resmi dan rubrik untuk Level Bronze (10 PG + 5 Menjodohkan + 5 Rumpang), Level Silver (10 PG + 5 Error ID + 5 Kalimat Kontekstual), dan Level Gold (15 Cloze Test CLIL + Esai 150–250 kata), lengkap dengan toggle kunci jawaban/pembahasan dan cetak PDF.
- **Bab 8.1 (Glosarium 4 Mapel Bilingual):** Basis data kosakata teknis di `src/lib/glossary.ts` dan antarmuka interaktif `GlossaryModal` di `/guru/rpp` dan `/guru/materi`. Memuat kosakata resmi Matematika, IPA, IPS, dan PJOK lengkap dengan fonetik, arti, contoh kalimat kelas, pencarian cepat, dan salin satu-klik.
- **Lampiran 10 (Panduan Pelatihan Penguji / Asesor):** Kartu panduan etika asesor terintegrasi di `/admin/asesmen`. Memuat script pembukaan wawancara 1 menit yang menenangkan, 5 prinsip etika asesor, tabel Do's & Don'ts, serta panduan alur simulasi mengajar.

**Sprint 6: kesiapan produksi & migrasi PostgreSQL (✅ Selesai & teruji)**
- Arsitektur Dual-Database aktif: Prisma 7 mendukung SQLite (lokal dev) dan PostgreSQL (produksi kapasitas 1.000 pengguna) secara dinamis lewat `@prisma/adapter-pg` dan `pg.Pool`.
- Skema PostgreSQL terpadu di `prisma/schema.postgresql.prisma` dan skema SQLite cadangan di `prisma/schema.sqlite.prisma`.
- Skrip migrasi data otomatis `prisma/migrate-sqlite-to-postgres.mts` (`npm run db:migrate-to-pg`) untuk menyalin seluruh baris dari SQLite ke PostgreSQL dengan transaksi ACID utuh.
- CLI toggle instan: `npm run db:use-postgres` dan `npm run db:use-sqlite`.
- Konfigurasi kontainer siap pakai `docker-compose.yml` (PostgreSQL 16 + pgAdmin 4).
- Dokumentasi panduan teknis & analisis performa 1.000 pengguna di `docs/PANDUAN_MIGRASI_POSTGRESQL.md`.

---

## 9. Arsitektur & peta database

### 9.1 Stack
- Next.js 16.4 App Router + React 19 + TypeScript (strict), Turbopack.
- Tailwind CSS v4 (token di `globals.css` lewat `@theme inline`, utility kustom via `@utility`).
- Prisma 7 + Dual Database (SQLite via `@prisma/adapter-better-sqlite3` dan PostgreSQL via `@prisma/adapter-pg`); client di `src/generated/prisma`.
- Auth: bcryptjs + jose (JWT HS256), cookie `lms_session` httpOnly, 8 jam.
- UI: `motion` (Framer Motion), `lucide-react`, Recharts, clsx + tailwind-merge, zod.
- `next.config.ts`: `cacheComponents: false` (sengaja), `serverExternalPackages: ["better-sqlite3", "pg"]`.

### 9.2 Pola kode
- **Halaman** = Server Component async: panggil `require*()`, query `db`, render komponen UI. Interaksi dipisah ke file `*-form.tsx` bertanda `"use client"`.
- **Mutasi** = Server Action di `src/actions/*.ts`: validasi zod → cek peran/kepemilikan → tulis `db` → `syncTeacherBadges` bila relevan → `revalidatePath("/<peran>", "layout")` → kembalikan `success()`/`failure()`.
- **Form** = `<ActionForm action={...}>` + `<SubmitButton>` + `FormMessage` otomatis. Untuk tombol aksi tanpa pesan (setujui/tolak), gunakan `<form action={serverFn}>` biasa.
- **Data JSON di kolom string**: `Observation.checklist`, `LessonPlan.cambridgeSkills`, `Material.vocabulary`, `Quiz.questions`, `QuizAttempt.answers`. Baca dengan `parseJson()`.

### 9.3 Peta model (prisma/schema.prisma)

| Model | Untuk | Kolom penting | Dipakai di |
|---|---|---|---|
| `User` | Akun semua peran | email unik, passwordHash, role, title, active | auth |
| `Teacher` | Profil guru | subject, nip, whatsapp, cefrLevel, toeflScore, ambassadorLevel, levelSince, buddyId, isPilot | semua fitur guru |
| `ClassRoom` | Kelas 7A–9B | name, grade | siswa |
| `TeachingAssignment` | Guru ↔ kelas | isHomeroom, unik (teacher, class) | hak akses guru → siswa |
| `Student` | Profil siswa | nis, classId, cefrLevel, pareAlumni, isStudentAmbassador | siswa |
| `DailyLog` | Log ELITE harian | date, mirrorMorning, voiceNoteOnTime, dailyMission, missionAnswer, englishZoneMinutes, buddySession, englishInClassPct, status, reviewer | ✅ harian & verifikasi |
| `Assessment` | Asesmen Duta | 5 aspek lisan, writtenScore/Waived, 4 aspek simulasi, skor komponen, finalScore, passed, awardedLevel, strengths, improvements, acknowledged | ✅ asesmen |
| `Appeal` | Banding | reasonType, explanation, evidence, request, status, decision, revisedScore | ⬜ |
| `CefrRecord` | Riwayat pemetaan CEFR/TOEFL | date, cefrLevel, toefl, source | lencana TOEFL, ⬜ detail guru |
| `Observation` | Observasi kelas | checklist JSON[10], englishPctBucket/Pct, score, strengths, improvements, recommendation, feedbackGiven | metrik % Inggris, ⬜ UI |
| `Reflection` | Refleksi diri | targetLevel, achieved, sentences, studentResponse, challenge, nextChange, proudOf, status | ⬜ |
| `LessonPlan` | RPP bilingual | cambridgeSkills JSON, objectives, englishSentences, opening/main/closing, status DRAF/DIAJUKAN/DISETUJUI/REVISI | ⬜ |
| `MicroTeaching` | Micro-teaching | week, 4 aspek, score, result | ⬜ |
| `Phrase` / `PhraseMastery` | Pocket Book | number, category, indonesian, english / status | metrik ✅, ⬜ UI |
| `WeeklyChallenge` / `ChallengeProgress` | Weekly Challenge | week, title, target, points / evidence, status | metrik ✅, ⬜ UI |
| `Badge` / `TeacherBadge` | Lencana | code, icon (nama ikon lucide), color | ✅ dashboard guru |
| `StudentAssessment` | Nilai siswa | type, semester, score, cefrLevel, 5 komponen Cambridge, notes | ✅ tampil, ⬜ input |
| `Material` / `MaterialRead` | Materi | category, subject, grade (null = semua), cefrLevel, content, vocabulary JSON, published | ✅ siswa, ⬜ kelola |
| `Quiz` / `QuizAttempt` | Kuis | questions JSON, passScore / score, answers | ✅ |
| `ClubSession` / `ClubAttendance` | Club & peer tutoring | type, date, topic, activity, leader / role, present | poin ✅, ⬜ UI |
| `Competition` / `CompetitionEntry` | Lomba | level, category, organizer / result, points | poin ✅, ⬜ UI |
| `Announcement` | Pengumuman | audience ALL/TEACHER/STUDENT | ✅ tampil, ⬜ kelola |

Model yang **mungkin perlu ditambah**:
- `AmbassadorRegistration` (formulir pendaftaran Lampiran 6).
- `LevelChange` (riwayat naik/turun level beserta alasan).
- `MonthlyReport` (menyimpan bagian manual laporan bulanan).
- `DailyPrompt` (teks Mirror Morning/Misi Harian terjadwal).

Setiap perubahan skema: `npm run db:push` → `npx prisma generate` → perbarui seed bila perlu.

---

## 10. Design system

Diminta eksplisit oleh pemilik: **"Playful 3D claymorphism meets clean modern SaaS (inspired by Duolingo and Linear)"**.

- **Latar**: gradien pastel `#F8FAFC → #EEF2FF` (fixed). Teks utama `#0f172a` (kontras tinggi).
- **Warna** (token Tailwind di `globals.css`):
  - `brand-*`: indigo lembut, utama, #6366f1.
  - `coral-*`: hangat, untuk CTA ELITE/aksi harian, #f9714f.
  - `mint-*`: sukses/hafal, #1fbf8c.
  - `gold-*`: streak/Gold.
  - `bronze-*`, `silver-*`, `gold-*`: badge level.
  - Status: `success` mint, `warning` amber, `danger` rose.
- **Kedalaman**: utility `clay` (kartu putih, bayangan berlapis + highlight inset), `clay-soft` (ikon), `press` (tombol 3D: border bawah 4px yang menipis saat `:active`), `glass` (navbar/topbar mobile).
- **Tipografi**: judul **Fredoka** (`font-[family-name:var(--font-display)]`, bobot 500–700); teks **Plus Jakarta Sans**. Angka sejajar memakai `tabular-nums`.
- **Bentuk**: radius kartu 24–28px (`rounded-3xl`), kontrol 16px (`rounded-2xl`).
- **Komponen** (`src/components/ui.tsx`): Card/CardHeader/CardBody, Button/LinkButton (primary, coral, mint, secondary, ghost, danger), Pill (tone), LevelBadge, StatusPill, Input/Textarea/Select/Field/Checkbox, Progress, StatCard, PageHeader, EmptyState, Table/Th/Td, Avatar, LinkTabs, SectionTitle, Ring.
- **Form** (`forms.tsx`): ActionForm, SubmitButton, FormMessage, ScorePicker (rubrik 1–4).
- **Grafik** (`charts.tsx`): urutan warna kategorikal tetap indigo → coral → mint → gold (sudah divalidasi aman buta warna). Selalu dengan legenda/label + tooltip. Satu sumbu Y saja.
- **Gerak** (`motion.tsx`): `Stagger`/`StaggerItem` (entrance bertahap), `FadeIn`, `HoverLift` (hover pegas). Landing memakai kartu melayang dan tilt 3D. Semua menghormati `prefers-reduced-motion`.
- **Responsif**: sidebar 288px di desktop (≥ lg), drawer di mobile. Tabel menggulir horizontal di dalam wadahnya. Halaman tidak boleh menggulir horizontal.
- **Nada copy**: Bahasa Indonesia, ramah, menyemangati, aktif ("Kirim laporan", "Setujui"). Pesan error menjelaskan cara memperbaiki.

Prototipe visual landing (Artifact, privat milik pemilik): https://claude.ai/artifact/TT72MUjk9swUnahrHTcoWT

---

## 11. Data contoh (seed)

`npm run db:seed` **menghapus semua data** lalu membuat:
- 2 admin (Ketua EDT, Kepala Sekolah).
- 11 guru dengan variasi level: 2 Gold (Fitri/IPA, Sarah/B. Inggris), 2 Silver, 4 Bronze, 3 belum level. Masing-masing punya CEFR, TOEFL, penugasan kelas, dan pasangan buddy.
- Log ELITE hari kerja 3 Agu–23 Okt 2026 (3 hari terakhir PENDING untuk demo verifikasi).
- Asesmen Juli/September 2026, riwayat CEFR April & Juni 2026, satu observasi per guru, progres Pocket Book & challenge, lencana awal.
- 6 kelas (7A, 7B, 8A, 8B, 9A, 9B) × 6 siswa = 36 siswa dengan 2 asesmen (Agu & Okt 2026).
- 6 materi + kuis (5 soal) beserta percobaan acak.
- 2 pengumuman.
- Kosong (belum ada UI): Club, Lomba, Refleksi, RPP, Micro-teaching, Banding. **Tambahkan data contoh saat membuat fiturnya.**

Konten buatan kita (tidak ada di PDF, perlu dikonfirmasi EDT):
- 10 lencana (Bagian 5.6).
- 12 Weekly Challenge: Greeting Champion, Instruction Starter, Praise Power, English Zone Explorer, Buddy Talk, CFU Master, Vocabulary Builder, Transition Pro, Story Moment, Peer Observer, Content Creator, Full English Closing.
- 6 materi siswa.
- Nama guru/siswa contoh (diambil dari contoh nama di dokumen + nama fiktif). Ganti dengan data asli sebelum dipakai sungguhan.

---

## 12. Standar kualitas & definisi selesai

Sebuah fitur dianggap **selesai** bila:
1. Sesuai spesifikasi Bagian 7 dan angka Bagian 4–5 (diambil dari `program.ts`).
2. Otorisasi server sesuai matriks 2.2, termasuk upaya akses lintas peran/kelas yang ditolak.
3. Validasi input dengan pesan Bahasa Indonesia yang menjelaskan perbaikannya.
4. Ada empty state yang ramah ketika data kosong.
5. Konsisten dengan design system Bagian 10 dan tampil baik di lebar ponsel (± 400px).
6. `npx tsc --noEmit` lolos; tidak ada error/warning baru di log `npm run dev`; halaman dibuka di browser dengan akun yang sesuai.
7. Menu ditambahkan di `NAV`; seed diperbarui bila fitur butuh data contoh.
8. Dilaporkan ke pemilik apa adanya: yang sudah diuji, yang belum, dan asumsi yang diambil.

Hal yang **tidak boleh**:
- Menulis angka program langsung di komponen.
- Menyalakan `cacheComponents` tanpa refactor.
- Mengirim fungsi/ikon dari Server ke Client Component.
- Menghitung data PENDING sebagai metrik resmi.
- Menampilkan perbandingan/peringkat antar guru di halaman guru.
- Menghapus data (`db:seed`) di lingkungan berisi data asli.

---

## 13. Riwayat percakapan & keputusan

1. **Permintaan awal**: pemilik membagikan PDF Dokumen Master (119 halaman) dan meminta LMS dengan 3 peran, monitoring berjenjang, dibuat sebagai web lokal, dengan **bertanya dulu sebelum membangun** agar satu pemahaman.
2. **Klarifikasi** (pemilik memilih):
   - Teknologi: *"Next.js TypeScript dan tools lainnya yang menjadi web profesional"*.
   - Fitur guru: semua (ELITE, Duta Inggris & Asesmen, Observasi/Refleksi/RPP, Pocket Book & Gamifikasi).
   - Fitur siswa: semua (Materi & Kuis, Nilai & CEFR, Club & Peer Tutor, Lomba & Prestasi).
   - Alur data: *guru isi, admin verifikasi*.
3. **Asumsi default** yang diumumkan dan tidak dibantah: UI Bahasa Indonesia, guru melihat siswa berdasarkan kelas yang diampu, data contoh disediakan.
4. **Arah desain**: pemilik mengirim brief desain claymorphism (Bagian 10). Dibuat dulu sebagai Artifact landing page, lalu diterapkan ke LMS (landing `/` + design system seluruh dashboard).
5. **Kecepatan**: pemilik meminta *"lanjutkan hingga selesai dan bisa dibuka di localhost"*, lalu *"buatkan kurang dari 6 menit"*. Karena itu cakupan dipangkas ke inti (Bagian 7, status ✅), sisanya masuk roadmap.
6. **Konfigurasi teknis yang diputuskan**:
   - `cacheComponents` dimatikan (aplikasi dashboard dinamis per sesi).
   - SQLite untuk lokal.
   - Middleware → `proxy.ts` (konvensi Next 16).
   - Formatter grafik diganti array label karena fungsi tidak boleh melintasi batas server→client.
7. **Serah terima ke Antigravity**: pemilik meminta file MD agar Gemini Antigravity bisa mengakses/menjalankan web, memasang yang diperlukan, dan memahami tujuan & fokus. Hasilnya `GEMINI.md`, `PROJECT_BRIEF.md`, dokumen ini, `.agent/rules/lms-bilingual.md`, `.agent/workflows/setup-lms.md`, dan `.env.example`.

Gaya kerja yang diinginkan pemilik:
- Tanyakan keputusan besar sebelum membangun.
- Berikan hasil yang bisa dicoba secepatnya.
- Jelaskan dalam Bahasa Indonesia yang sederhana.
- Jujur soal yang belum selesai.

---

## 14. Pertanyaan terbuka untuk pemilik / EDT

Tanyakan saat fitur terkait dikerjakan. Jangan memblokir pekerjaan lain.

1. **Konten buatan kita**: setujui atau ganti isi lencana, 12 Weekly Challenge, dan materi siswa (PDF tidak memuat Bab 3.5–3.6, 6.4–6.5, 8.1).
2. **Inkonsistensi dokumen**, keputusan sementara:
   - Hafalan Pocket Book: Bab 6.1 menyebut 30/60, Lampiran 3 menyebut **20/35/45**. Dipakai Lampiran 3.
   - Batas lulus: Lampiran 1 menyebut 70/75/80 (untuk tes tertulis), Lampiran 10 menyebut **66,5/76,2/84,1** (nilai akhir). Dipakai Lampiran 10 untuk nilai akhir.
   - % Inggris di kelas: Bab 6.1 menyebut Bronze 50%/Silver 60%, Juknis menyebut **30/50/70**. Dipakai Juknis.
3. Apakah tes tertulis ingin dikerjakan **online** di LMS (bank soal Lampiran 1 dengan koreksi otomatis)?
4. Nominal insentif per level (dokumen masih "Rp ...") dan apakah LMS perlu rekap insentif bulanan.
5. Apakah guru boleh melihat **papan peringkat** antar guru? Default: tidak.
6. Apakah perlu akun **orang tua**?
7. Data asli: daftar guru (nama, NIP, mapel, WA), siswa per kelas, dan penugasan mengajar, sebaiknya dalam format Excel untuk diimpor.
8. Rencana **online**: hosting (VPS/shared hosting), domain, siapa admin teknis.
9. Apakah voice note Mirror Morning perlu diunggah ke LMS, atau cukup tetap di WhatsApp?

---

## 15. Glosarium istilah program

| Istilah | Arti |
|---|---|
| **EDT** | English Development Team, tim pengelola program (peran Admin) |
| **Duta Inggris / Ambassador** | Sistem level kompetensi guru: Bronze, Silver, Gold (+ Mentor 85%) |
| **ELITE English Habit** | English Language Immersion Through Everyday, program pembiasaan harian via WhatsApp |
| **Mirror Morning** | Latihan pagi di depan cermin + voice note (05.30, deadline 06.15) |
| **Misi Harian** | Tugas menulis/berbicara Inggris harian di grup (deadline 20.00) |
| **English Zone** | Area/waktu wajib berbahasa Inggris (30 menit per sesi) |
| **English Buddy** | Pasangan belajar guru A2 dengan guru B1+ |
| **Pocket Book** | Buku saku 50 kalimat instruksi kelas |
| **Weekly Challenge Card** | 12 tantangan mingguan untuk guru (peer support terstruktur) |
| **Micro-teaching** | Latihan mengajar 10–20 menit di depan rekan sebelum kelas nyata |
| **Pilot teacher** | Guru yang lulus micro-teaching dan menguji coba kelas bilingual |
| **CFU** | Checking for Understanding, memeriksa pemahaman siswa |
| **RPP Bilingual/Hybrid** | Rencana pelaksanaan pembelajaran dengan target bahasa & Cambridge skills |
| **CEFR** | Skala kemampuan bahasa Pre A1, A1, A2, B1, B2, C1, C2 (dengan "+" sebagai tahap antara) |
| **TOEFL ITP/Prediction** | Tes kemampuan; acuan konversi ke CEFR |
| **Cambridge 0876** | Cambridge Lower Secondary English as a Second Language (Reading, Writing, Use of English, Listening, Speaking) |
| **Student Ambassador** | Siswa tutor sebaya (Peer Tutoring) |
| **Madani English Club** | Klub Inggris siswa setiap Sabtu |
| **Alumni Pare** | Siswa yang pernah kursus di Kampung Inggris Pare, Kediri |
