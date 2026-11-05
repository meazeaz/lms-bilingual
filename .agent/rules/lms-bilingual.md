---
trigger: always_on
---

# Konteks proyek LMS Bilingual 2028

Sebelum mengerjakan apa pun di workspace ini, baca berurutan:

1. `GEMINI.md`: cara install, menjalankan, akun demo, aturan kode wajib.
2. `PROJECT_BRIEF.md`: ringkasan tujuan, status, roadmap.
3. `docs/SPESIFIKASI_LENGKAP.md`: konteks penuh: visi & tujuan, isi program dari Dokumen Master, aturan bisnis & rumus, alur kerja, spesifikasi setiap halaman + kriteria selesai, peta database, design system, riwayat keputusan, pertanyaan terbuka.

Pegangan utama:
- Isi program mengacu pada `../Program Akselerasi Bilingual 2028.pdf`. Semua angka program hanya di `src/lib/program.ts`.
- Prinsip: guru mengisi, admin memverifikasi. Hanya data APPROVED yang masuk metrik resmi.
- Proyek memakai Next.js 16. Baca dokumen di `node_modules/next/dist/docs/` sebelum memakai API Next.
- Ikuti design system claymorphism (pastel, indigo/coral/mint, `clay`, `press`, Fredoka + Plus Jakarta Sans).
- Komunikasi dengan pemilik dan seluruh UI: Bahasa Indonesia. Tanyakan keputusan besar dulu, kirim hasil yang bisa dicoba cepat, laporkan apa adanya.
- Setelah mengubah kode: `npx tsc --noEmit` harus lolos dan halaman terkait dicek di http://localhost:3000.
- Kerjakan roadmap per sprint sesuai Bagian 8 spesifikasi, mulai dari Sprint 0.
