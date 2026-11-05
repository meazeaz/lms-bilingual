# Panduan Lengkap Migrasi ke PostgreSQL & Optimasi untuk 1.000 Pengguna
**LMS Program Akselerasi Bilingual 2028 – SMP IT Al Madany**

Dokumen ini adalah panduan teknis resmi bagi pengembang dan administrator sistem untuk memindahkan basis data dari SQLite ke **PostgreSQL**, serta menjawab arsitektur performa untuk kapasitas **1.000 pengguna aktif**.

---

## 1. Analisis Performa: Apakah Perlu Menggunakan Go?

### Pertanyaan Pemilik:
> *"Apakah menggunakan PostgreSQL dan Prisma untuk backend dan database bisa membuat website ini tidak lambat? Perlu menggunakan Go? Karena web ini diperkirakan yang menggunakan 1.000 user."*

### Jawaban Teknis & Rekomendasi Senior Engineer:
**Tidak perlu menulis ulang ke Go (Golang). Arsitektur Next.js 16 (App Router + React Server Components) + Prisma 7 + PostgreSQL sudah lebih dari cukup untuk menangani 1.000 hingga 10.000 pengguna dengan latensi sangat rendah (15–40 ms).**

#### Alasannya:
1. **Bottleneck 1.000 User Bukan di Bahasa Pemrograman, Melainkan I/O Database:**
   - 1.000 siswa dan guru di sekolah tidak melakukan *1.000 request per detik secara bersamaan* (peak concurrent requests di jam masuk sekolah biasanya berkisar antara 50–150 request/detik).
   - Node.js / Next.js dengan arsitektur non-blocking asynchronous event loop mampu melayani 2.000–4.000 request/detik per instance CPU.
2. **Keunggulan React Server Components (RSC):**
   - Di Next.js App Router yang kita bangun, halaman di-render langsung di server dekat dengan database tanpa bolak-balik API JSON ganda (Zero-waterfall fetch).
3. **Mengapa SQLite Lambat di Multi-User (Alasan Pindah ke PostgreSQL):**
   - SQLite menerapkan *Database-Level Locking* saat menulis data (hanya 1 transaksi tulis dalam satu waktu). Jika 50 guru bersamaan mengklik tombol verifikasi atau kuis, SQLite akan antre.
   - **PostgreSQL menerapkan MVCC (Multi-Version Concurrency Control) dan Row-Level Locking:** Ratusan pengguna dapat membaca dan menulis ke tabel berbeda atau baris berbeda secara bersamaan tanpa saling mengunci.

---

## 2. Pilihan Infrastruktur PostgreSQL

Anda dapat memilih salah satu dari 3 opsi berikut sesuai preferensi penyebaran (*deployment*):

### Opsi A: Cloud Managed Postgres (Sangat Direkomendasikan · Bebas Maintenance)
* **Layanan:** [Neon.tech](https://neon.tech) (Serverless Postgres) atau [Supabase](https://supabase.com).
* **Kelebihan:** 
  - Gratis tier awal yang sangat besar (0.5 GB RAM, autoscaling).
  - Dilengkapi fitur bawaan **PgBouncer Connection Pooling** (mampu menangani 10.000 koneksi bersamaan).
  - Backup otomatis setiap hari.
* **Connection String:**
  ```env
  DATABASE_URL="postgresql://user:pass@ep-shiny-sample-pooler.us-east-1.aws.neon.tech/lms_bilingual?sslmode=require&pgbouncer=true"
  ```

### Opsi B: Docker Lokal / Server VPS Mandiri
* Menggunakan file `docker-compose.yml` yang telah disediakan di root proyek.
* Jalankan di terminal:
  ```bash
  docker compose up -d
  ```
* Database akan aktif di port `5432` dengan web dashboard pgAdmin di `http://localhost:5050`.
* **Connection String:**
  ```env
  DATABASE_URL="postgresql://almadany_admin:almadany_secret_password_2028@localhost:5432/lms_bilingual?schema=public"
  ```

---

## 3. Langkah Migrasi Data (3 Langkah Cepat)

Kami telah membangun utilitas otomatis sehingga proses migrasi hanya membutuhkan waktu **kurang dari 2 menit**:

### Langkah 1: Beralih ke Skema PostgreSQL
Jalankan perintah ini di folder `lms-bilingual`:
```bash
npm run db:use-postgres
```
*Skrip ini akan otomatis menyalin `prisma/schema.postgresql.prisma` menjadi `prisma/schema.prisma` dan meregenerasi Prisma Client.*

### Langkah 2: Dorong Skema Struktur Tabel ke PostgreSQL
Pastikan `DATABASE_URL` di file `.env` sudah diisi dengan alamat PostgreSQL target, lalu jalankan:
```bash
npm run db:push
```
*Prisma akan membuat seluruh 32 tabel, foreign keys, relasi, dan enum native di PostgreSQL target.*

### Langkah 3: Salin Seluruh Data dari SQLite ke PostgreSQL
Jalankan skrip migrasi data otomatis kami:
```bash
npm run db:migrate-to-pg
```
*Skrip `prisma/migrate-sqlite-to-postgres.mts` akan membaca seluruh akun pengguna, dewan guru, kelas, siswa, lencana, buku saku, dan riwayat yang ada di SQLite lokal (`prisma/dev.db`), lalu memasukkannya secara aman (dengan transaksi ACID) ke PostgreSQL.*

---

## 4. Cara Kembali ke SQLite Lokal Kapan Saja

Jika Anda ingin kembali mengembangkan fitur secara lokal tanpa perlu terhubung ke internet/server PostgreSQL:
```bash
npm run db:use-sqlite
```
*Aplikasi akan langsung kembali menggunakan SQLite lokal `dev.db`.*

---

## 5. Checklist Kesiapan Produksi untuk 1.000 Pengguna

1. [x] **Connection Pooling:** Pool koneksi diatur melalui `pg.Pool` pada `src/lib/db.ts` dengan batas maksimal koneksi terkonfigurasi (`PG_MAX_CONNECTIONS`).
2. [x] **Optimasi Indeks Database:** Seluruh kolom pencarian utama (`email`, `teacherId`, `studentId`, `date`, `week`, `sessionId`) telah memiliki indeks unik atau foreign key index.
3. [x] **Zero-Bundle Driver:** Dependensi native driver `pg` dan `better-sqlite3` telah diisolasi di `serverExternalPackages` pada `next.config.ts`.
4. [ ] **SESSION_SECRET Produksi:** Ganti string di `.env` dengan string acak panjang minimal 32 karakter (dihasilkan melalui `openssl rand -base64 32`).
5. [ ] **Reverse Proxy Caching:** Saat deploy ke VPS Ubuntu, pasang Nginx di depan Next.js untuk menyajikan file statis (`/_next/static/`) dengan header `Cache-Control: public, max-age=31536000, immutable`.
