# Cara pakai folder ini

Folder ini berisi semua file konteks untuk Gemini di Antigravity. Strukturnya sama dengan folder proyek `lms-bilingual`.

## Isi

```
antigravity-context/
├── GEMINI.md                        Cara install & menjalankan, akun demo, aturan kode
├── PROJECT_BRIEF.md                 Ringkasan tujuan, status, roadmap
├── PROMPT_AWAL.md                   Prompt pertama untuk dikirim ke Gemini
├── .env.example                     Contoh konfigurasi (disalin jadi .env)
├── docs/
│   └── SPESIFIKASI_LENGKAP.md       Konteks penuh: tujuan, aturan program, spesifikasi halaman, roadmap sprint
└── .agent/
    ├── rules/lms-bilingual.md       Rule "always on" untuk Antigravity
    └── workflows/setup-lms.md       Workflow setup otomatis
```

## Cara menambahkan

1. Salin **seluruh isi** folder ini (termasuk folder tersembunyi `.agent`) ke dalam folder `lms-bilingual/`. Timpa jika ditanya, karena isinya sama.
2. Buka folder `lms-bilingual` sebagai workspace di Antigravity.
3. Buka `PROMPT_AWAL.md`, salin teks di dalam kotaknya, lalu kirim sebagai pesan pertama ke agent.

Catatan: file PDF `Program Akselerasi Bilingual 2028.pdf` harus tetap berada di folder induk `lms-bilingual` (yaitu `billingual/`), karena dokumen merujuk ke `../Program Akselerasi Bilingual 2028.pdf`.
