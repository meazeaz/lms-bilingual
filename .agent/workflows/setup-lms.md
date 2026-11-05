---
description: Install dependensi, siapkan database, dan jalankan LMS Bilingual di localhost
---

1. Pastikan Node.js ≥ 20.9 terpasang: `node -v`. Jika belum, minta pemilik memasang Node.js LTS dari nodejs.org.
2. Di folder `lms-bilingual`, jalankan `npm install`.
3. Jika file `.env` belum ada, salin `.env.example` menjadi `.env`.
4. Jalankan `npm run setup` (membuat database SQLite, generate Prisma Client, mengisi data contoh).
5. Jalankan `npm run dev` dan tunggu sampai muncul "Ready".
6. Buka http://localhost:3000/login dan masuk dengan `admin@almadany.sch.id` / `admin123` untuk memastikan dashboard admin tampil. Coba juga `fitri@almadany.sch.id` / `guru123` dan `aisyah@siswa.almadany.sch.id` / `siswa123`.
7. Laporkan ke pemilik (Bahasa Indonesia) hasil tiap langkah, termasuk error bila ada.
