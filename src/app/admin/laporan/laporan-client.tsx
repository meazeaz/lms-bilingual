"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  FileText,
  Mail,
  Printer,
  Save,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { saveMonthlyReportNotes } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Pill,
  StatCard,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";

export interface LevelBreakdownItem {
  level: string;
  label: string;
  teacherCount: number;
  onTrackCount: number;
  avgEnglishPct: number;
  activeZonePct: number;
  warningCount: number;
}

export interface ObservationReportStats {
  totalDone: number;
  avgScore: number;
  avgEnglishPct: number;
  recommendations: {
    maintain: number;
    readyToPromote: number;
    mentoring: number;
  };
  recentObservations: Array<{
    id: string;
    teacherName: string;
    subject: string;
    className: string;
    score: number;
    englishPct: number;
    recommendation: string;
    date: string;
  }>;
}

export interface EliteReportStats {
  avgDailyPct: number;
  perfectTeachersCount: number;
  perfectTeachersPct: number;
  lowParticipationCount: number;
  lowParticipationPct: number;
  topTeachers: Array<{
    id: string;
    name: string;
    subject: string;
    level: string;
    logCount: number;
    mirrorMorningCount: number;
    streak: number;
  }>;
}

export interface TeacherOfTheMonth {
  id: string;
  name: string;
  subject: string;
  level: string;
  score: number;
  streak: number;
  quote: string;
}

export function LaporanClient({
  month,
  monthLabel,
  reportNotes,
  levelBreakdown,
  observationStats,
  eliteStats,
  topTeacher,
}: {
  month: string;
  monthLabel: string;
  reportNotes?: {
    executiveSummary: string | null;
    challenges: string | null;
    recommendations: string | null;
    nextMonthPlan: string | null;
  } | null;
  levelBreakdown: LevelBreakdownItem[];
  observationStats: ObservationReportStats;
  eliteStats: EliteReportStats;
  topTeacher: TeacherOfTheMonth | null;
}) {
  const [activeView, setActiveView] = useState<"REPORT" | "WA" | "POSTER" | "EDARAN">("REPORT");
  const [copiedWA, setCopiedWA] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Generate pesan format WhatsApp
  const waReportText = `*WEEKLY REPORT - PROGRAM AKSELERASI BILINGUAL 2028*
*SMPIT AL MADANY PARUNG PANJANG*
Pekan ${selectedWeek} · ${monthLabel}

Bismillah, berikut rekap kemajuan pembiasaan bahasa Inggris civitas akademika:

📊 *1. STATISTIK KEAKTIFAN ELITE:*
• Rata-rata Partisipasi Harian: ${eliteStats.avgDailyPct}% (Target: ≥ 80%)
• Guru Konsisten 100%: ${eliteStats.perfectTeachersPct}% (${eliteStats.perfectTeachersCount} Guru)
• Guru Perlu Pendampingan (<50%): ${eliteStats.lowParticipationCount} Guru

🏆 *2. TEACHER OF THE WEEK:*
• ${topTeacher?.name ?? "Ustadzah Siti Fatimah, S.Pd."} (${topTeacher?.subject ?? "Science"})
• Dedikasi: Level ${topTeacher?.level ?? "Gold"} · Streak ${topTeacher?.streak ?? 14} Hari Berturut-turut!

💡 *3. HIGHLIGHT MIRROR MORNING & PRAKTIK BAIK:*
"${topTeacher?.quote ?? "Good morning, students! Today we will explore the wonderful solar system together."}"

🎯 *4. FOKUS & TEMA PEKAN DEPAN:*
• Target: Praktik 3+ Kalimat Safe Phrases dalam RPP Bilingual
• English Zone: Penguatan percakapan di area Ruang Guru & Koridor Kelas

_“Berani Bicara, Menginspirasi Sesama Menuju SMP IT Al Madany Go Bilingual 2028!”_

English Development Team (EDT)
SMP IT Al Madany`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(waReportText);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Fitur Laporan (Disembunyikan saat cetak) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveView("REPORT")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "REPORT"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <FileSpreadsheet className="size-4" /> Laporan Bulanan EDT (Lampiran 5)
          </button>
          <button
            type="button"
            onClick={() => setActiveView("WA")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "WA"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Share2 className="size-4" /> Weekly Report WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setActiveView("POSTER")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "POSTER"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Trophy className="size-4" /> Poster Duta Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setActiveView("EDARAN")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "EDARAN"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Mail className="size-4" /> Surat Edaran Orang Tua & RSVP (Lampiran 8)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeView === "REPORT" && (
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="size-4" /> Cetak / Unduh Dokumen (PDF)
            </Button>
          )}
          {activeView === "POSTER" && (
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="size-4" /> Cetak Poster Apresiasi
            </Button>
          )}
          {activeView === "EDARAN" && (
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="size-4" /> Cetak Surat Edaran & RSVP
            </Button>
          )}
        </div>
      </div>

      {/* ───────────── TAMPILAN 1: LAPORAN BULANAN EDT (LAMPIRAN 5) ───────────── */}
      {activeView === "REPORT" && (
        <div className="space-y-6">
          {/* Dokumen Formal Kertas A4 */}
          <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200 sm:p-10 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Kop Surat Resmi */}
            <div className="border-b-2 border-slate-800 pb-5 flex items-center justify-between gap-4">
              <Image
                src="/logo-almadany.png"
                alt="Logo SMP IT Al Madany"
                width={64}
                height={64}
                className="size-16 object-contain shrink-0"
              />
              <div className="flex-1 text-center">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Yayasan Islamic Center Al Madany · Kab. Bogor
                </div>
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black text-ink sm:text-3xl">
                  SMPIT AL MADANY PARUNG PANJANG
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  ENGLISH DEVELOPMENT TEAM (EDT) · PROGRAM AKSELERASI BILINGUAL 2028
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Jln. Kabasiran KM 2, RT.05/RW02, Desa Kabasiran, Kecamatan Parung Panjang, Kab. Bogor · smpit@almadany.sch.id
                </p>
              </div>
              <div className="size-16 shrink-0 hidden sm:block" />
            </div>

            {/* Judul Laporan */}
            <div className="my-6 text-center">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-black uppercase text-ink underline underline-offset-4 sm:text-xl">
                LAPORAN BULANAN KEMAJUAN PROGRAM BILINGUAL
              </h2>
              <p className="mt-1 text-xs font-bold text-slate-600">
                Periode Pelaksanaan: <span className="text-brand-700">{monthLabel}</span> (Bulan: {month})
              </p>
            </div>

            {/* BAGIAN A: Ringkasan Eksekutif */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                A. Ringkasan Eksekutif
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {reportNotes?.executiveSummary ??
                  `Pada periode ${monthLabel}, pelaksanaan Program Akselerasi Bilingual 2028 di SMP IT Al Madany berjalan secara konsisten melalui tiga pilar utama: pembiasaan harian guru (ELITE & Mirror Morning), supervisi kelas berkala oleh pengawas EDT, serta integrasi kurikulum bilingual pada RPP. Rata-rata keterlibatan harian guru mencapai ${eliteStats.avgDailyPct}%, dengan ${eliteStats.perfectTeachersCount} guru mempertahankan konsistensi 100%. Tim EDT terus mengawal pencapaian SMART Goals T1–T5 guna memastikan kesiapan transisi sekolah dwibahasa penuh pada Juli 2028.`}
              </p>
            </div>

            {/* BAGIAN B: Data Duta Inggris per Level */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                B. Data Perkembangan Duta Inggris per Level
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Level Kualifikasi</th>
                      <th className="py-2.5 px-3 text-center">Jumlah Guru</th>
                      <th className="py-2.5 px-3 text-center">Target Tercapai</th>
                      <th className="py-2.5 px-3 text-center">Rata-rata % Inggris</th>
                      <th className="py-2.5 px-3 text-center">% Aktif English Zone</th>
                      <th className="py-2.5 px-3 text-center">Perlu Perhatian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {levelBreakdown.map((row) => (
                      <tr key={row.level} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold">{row.label}</td>
                        <td className="py-2 px-3 text-center font-semibold">{row.teacherCount} Guru</td>
                        <td className="py-2 px-3 text-center">{row.onTrackCount} ({Math.round((row.onTrackCount / (row.teacherCount || 1)) * 100)}%)</td>
                        <td className="py-2 px-3 text-center font-bold text-brand-700">{row.avgEnglishPct}%</td>
                        <td className="py-2 px-3 text-center">{row.activeZonePct}%</td>
                        <td className="py-2 px-3 text-center font-bold text-rose-600">
                          {row.warningCount > 0 ? `${row.warningCount} Guru` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN C: Hasil Observasi Supervisi Kelas */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                C. Hasil Observasi Supervisi Kelas Bulan Ini
              </h3>
              <div className="grid gap-3 sm:grid-cols-3 text-xs mb-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Total Supervisi Dilakukan:</span>
                  <span className="text-base font-bold text-ink">{observationStats.totalDone} Sesi Kelas</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Rata-rata Skor 10 Aspek:</span>
                  <span className="text-base font-bold text-emerald-700">{observationStats.avgScore} / 100</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Rata-rata % Bahasa Inggris:</span>
                  <span className="text-base font-bold text-brand-700">{observationStats.avgEnglishPct}% di Kelas</span>
                </div>
              </div>

              {observationStats.recentObservations.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Guru & Mapel</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3 text-center">Skor</th>
                        <th className="py-2 px-3 text-center">% Inggris</th>
                        <th className="py-2 px-3">Rekomendasi Observer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {observationStats.recentObservations.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2 px-3 text-slate-500">{o.date}</td>
                          <td className="py-2 px-3 font-bold">{o.teacherName} ({o.subject})</td>
                          <td className="py-2 px-3">{o.className}</td>
                          <td className="py-2 px-3 text-center font-bold">{o.score}</td>
                          <td className="py-2 px-3 text-center">{o.englishPct}%</td>
                          <td className="py-2 px-3 font-medium">{o.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* BAGIAN D: Partisipasi WA ELITE & Mirror Morning */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                D. Partisipasi WA ELITE & Mirror Morning Harian
              </h3>
              <div className="grid gap-3 sm:grid-cols-3 text-xs mb-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Rata-rata Partisipasi Harian:</span>
                  <span className="text-base font-bold text-ink">{eliteStats.avgDailyPct}%</span>
                  <span className="text-[10px] text-slate-400 block">Target: ≥ 80%</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Guru Konsisten 100%:</span>
                  <span className="text-base font-bold text-emerald-700">{eliteStats.perfectTeachersPct}%</span>
                  <span className="text-[10px] text-slate-400 block">{eliteStats.perfectTeachersCount} dari 18 Guru</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-slate-500 block">Guru Partisipasi Rendah (&lt;50%):</span>
                  <span className="text-base font-bold text-rose-600">{eliteStats.lowParticipationPct}%</span>
                  <span className="text-[10px] text-slate-400 block">{eliteStats.lowParticipationCount} Guru Perlu Evaluasi</span>
                </div>
              </div>
            </div>

            {/* BAGIAN E: Kendala & Hambatan Lapangan */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                E. Kendala & Hambatan Lapangan
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                {reportNotes?.challenges ??
                  `1. Beberapa guru mata pelajaran eksakta masih membutuhkan pendampingan dalam penyusunan Safe Phrases khusus terminologi materi.
2. Pelaksanaan sesi English Buddy perlu dijadwalkan lebih fleksibel agar tidak berbenturan dengan agenda rapat dewan guru.
3. Keterbatasan waktu bicara bahasa Inggris di luar jam pelajaran bagi siswa kelas reguler.`}
              </p>
            </div>

            {/* BAGIAN F: Rekomendasi & Tindak Lanjut */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                F. Rekomendasi & Tindak Lanjut
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                {reportNotes?.recommendations ??
                  `1. Mengintensifkan simulasi Micro-Teaching bagi calon Duta Silver dan Gold pada pekan kedua setiap bulan.
2. Memaksimalkan peran Student Ambassador dalam memimpin *Peer Tutoring* setiap Kamis sore.
3. Memberikan penghargaan apresiasi bulanan kepada guru dan siswa teraktif.`}
              </p>
            </div>

            {/* BAGIAN G: Rencana Aksi Bulan Depan */}
            <div className="mb-8 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-brand-600 pl-2">
                G. Rencana Aksi Bulan Depan
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                {reportNotes?.nextMonthPlan ??
                  `1. Pelaksanaan observasi supervisi kelas gelombang kedua untuk seluruh guru Duta Bronze dan Silver.
2. Uji coba kuis bilingual terintegrasi pada mata pelajaran Science dan Social Studies.
3. Pengiriman delegasi siswa ke kompetisi *English Speech Contest* tingkat Kabupaten.`}
              </p>
            </div>

            {/* BAGIAN H: Lembar Pengesahan */}
            <div className="pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-bold text-ink">Kepala SMP IT Al Madany</p>
                  <div className="h-16" />
                  <p className="font-bold text-ink underline">Ustadz Ahmad Fauzi, M.Pd.</p>
                  <p className="text-slate-500 text-[11px]">NIP. 197808122005011003</p>
                </div>

                <div>
                  <p className="text-slate-500">Parung Panjang, {monthLabel}</p>
                  <p className="font-bold text-ink">Ketua English Development Team</p>
                  <div className="h-16" />
                  <p className="font-bold text-ink underline">Ustadzah Nurul Hidayah, M.Ed.</p>
                  <p className="text-slate-500 text-[11px]">Koordinator Program Bilingual 2028</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Sunting Catatan Laporan (Bagian A, E, F, G) - Disembunyikan saat cetak */}
          <Card className="print:hidden border-slate-200">
            <CardHeader
              icon={Save}
              title="Perbarui Catatan Narasi Laporan Bulanan"
              description="Sesuaikan narasi ringkasan eksekutif, kendala, rekomendasi, dan rencana aksi untuk bulan ini."
            />
            <CardBody className="p-5">
              <ActionForm action={saveMonthlyReportNotes} className="space-y-4">
                <input type="hidden" name="month" value={month} />

                <Field label="A. Ringkasan Eksekutif (Executive Summary)" hint="Deskripsi umum kemajuan program bulan ini">
                  <Textarea
                    name="executiveSummary"
                    rows={3}
                    defaultValue={reportNotes?.executiveSummary ?? ""}
                    placeholder="Tulis ringkasan eksekutif..."
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E. Kendala & Hambatan" hint="Poin-poin kendala lapangan">
                    <Textarea
                      name="challenges"
                      rows={3}
                      defaultValue={reportNotes?.challenges ?? ""}
                      placeholder="1. Kendala A..."
                    />
                  </Field>

                  <Field label="F. Rekomendasi & Tindak Lanjut" hint="Aksi perbaikan yang direkomendasikan">
                    <Textarea
                      name="recommendations"
                      rows={3}
                      defaultValue={reportNotes?.recommendations ?? ""}
                      placeholder="1. Rekomendasi A..."
                    />
                  </Field>
                </div>

                <Field label="G. Rencana Aksi Bulan Depan" hint="Agenda prioritas bulan mendatang">
                  <Textarea
                    name="nextMonthPlan"
                    rows={2}
                    defaultValue={reportNotes?.nextMonthPlan ?? ""}
                    placeholder="1. Rencana A..."
                  />
                </Field>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <SubmitButton>Simpan Narasi Laporan</SubmitButton>
                </div>
              </ActionForm>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ───────────── TAMPILAN 2: GENERATOR WEEKLY REPORT WHATSAPP ───────────── */}
      {activeView === "WA" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader
              icon={Share2}
              title="Generator Siaran WhatsApp (Weekly Report)"
              description="Format pesan WhatsApp siap salin untuk dibagikan ke grup guru, yayasan, atau wali murid pada setiap Jumat sore."
            />
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Pilih Pekan ke:</span>
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeek(w)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedWeek === w
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Pekan {w}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-emerald-950 p-4 font-mono text-xs text-emerald-200 shadow-inner overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[480px]">
                {waReportText}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Siap dikirim langsung via WhatsApp Web atau aplikasi mobile.
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={copyToClipboard}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {copiedWA ? (
                    <>
                      <Check className="size-4" /> Tersalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Salin Format WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Tips Komunikasi EDT */}
          <div className="space-y-4">
            <Card className="border-brand-200 bg-brand-50/20">
              <CardBody className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-brand-700 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="size-4" /> Pedoman Siaran Mingguan
                </div>
                <h4 className="text-sm font-bold text-ink">Jadwal Pengiriman Rutin:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Berdasarkan Dokumen Master Lampiran 2, laporan mingguan dibagikan setiap <strong>Jumat pukul 16.00 WIB</strong> untuk mengapresiasi guru teraktif serta menetapkan fokus latihan pekan berikutnya.
                </p>
                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> Mengangkat guru teladan (*Teacher of the Week*)
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> Membagikan kutipan *Mirror Morning* terbaik
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> Mengingatkan tema & frasa saku baru
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Top Guru Bulan Ini */}
            <Card>
              <CardHeader
                icon={Trophy}
                title="Peringkat Keaktifan Guru Bulan Ini"
              />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {eliteStats.topTeachers.slice(0, 5).map((t, idx) => (
                    <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-5 rounded-full grid place-items-center font-bold text-[10px] ${
                          idx === 0 ? "bg-gold-400 text-white" : idx === 1 ? "bg-slate-300 text-slate-800" : "bg-amber-700 text-white"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-ink">{t.name}</span>
                          <span className="text-slate-400 block text-[11px]">{t.subject} · Level {t.level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-700">{t.logCount} Laporan</span>
                        <span className="text-[10px] text-slate-400 block">{t.streak} Hari Streak</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ───────────── TAMPILAN 3: POSTER DUTA BULAN INI ───────────── */}
      {activeView === "POSTER" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="rounded-[40px] bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 p-8 text-white shadow-2xl border-4 border-gold-400 text-center relative overflow-hidden print:m-0 print:border-4">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 size-40 rounded-full bg-gold-400/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-40 rounded-full bg-brand-500/20 blur-2xl" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/20 px-4 py-1.5 text-xs font-black tracking-widest text-gold-300 uppercase border border-gold-400/40">
                <Trophy className="size-4" /> English Ambassador of the Month
              </div>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                SMP IT AL MADANY
              </h2>
              <p className="text-xs text-gold-200 font-bold uppercase tracking-widest">
                Periode: {monthLabel}
              </p>

              <div className="py-4">
                <div className="mx-auto size-28 rounded-full border-4 border-gold-400 bg-white/10 p-1 shadow-xl">
                  <div className="size-full rounded-full bg-gradient-to-tr from-brand-600 to-gold-500 grid place-items-center text-white text-3xl font-black">
                    {topTeacher ? topTeacher.name.split(" ").map(w => w[0]).slice(0, 2).join("") : "SF"}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-black text-white sm:text-2xl">
                  {topTeacher?.name ?? "Ustadzah Siti Fatimah, S.Pd."}
                </h3>
                <p className="text-sm font-semibold text-gold-300">
                  Guru {topTeacher?.subject ?? "Science"} · Duta Inggris Level {topTeacher?.level ?? "Gold"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-300 block">Keaktifan ELITE</span>
                  <span className="font-black text-gold-300 text-sm">100%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block">Streak Berturut</span>
                  <span className="font-black text-gold-300 text-sm">{topTeacher?.streak ?? 14} Hari</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 block">Observasi Kelas</span>
                  <span className="font-black text-gold-300 text-sm">{topTeacher?.score ?? 90}/100</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-xs italic text-slate-200">
                &ldquo;{topTeacher?.quote ?? "Practice makes progress. Never be afraid of making mistakes when speaking English in front of our beloved students."}&rdquo;
              </div>

              <div className="pt-2 text-[10px] text-slate-400">
                Ditetapkan oleh English Development Team (EDT) · SMP IT Al Madany 2028
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── TAMPILAN 4: SURAT EDARAN ORANG TUA & RSVP (LAMPIRAN 8) ───────────── */}
      {activeView === "EDARAN" && (
        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200 sm:p-12 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Kop Surat Resmi */}
            <div className="border-b-4 border-double border-slate-900 pb-5 flex items-center justify-between gap-4">
              <Image
                src="/logo-almadany.png"
                alt="Logo SMP IT Al Madany"
                width={76}
                height={76}
                className="size-20 object-contain shrink-0"
              />
              <div className="flex-1 text-center">
                <p className="font-serif text-sm font-semibold tracking-wider text-slate-700 uppercase">
                  Yayasan Islamic Center Al Madany
                </p>
                <h2 className="font-serif text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                  SMPIT AL MADANY PARUNG PANJANG
                </h2>
                <p className="font-serif text-xs text-slate-600 mt-1">
                  Terakreditasi A · NPSN: 69874125 · NSS: 202600129
                </p>
                <p className="font-serif text-[11px] text-slate-500 mt-0.5">
                  Jln. Kabasiran KM 2, RT.05/RW02, Desa Kabasiran, Kecamatan Parung Panjang, Kab. Bogor · Email: smpit@almadany.sch.id
                </p>
              </div>
              <div className="size-20 shrink-0 hidden sm:block" />
            </div>

            {/* Nomor & Perihal Surat */}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 text-xs font-serif text-slate-800">
              <div className="space-y-1">
                <p><strong>Nomor</strong> : 012/SMP-IT.AM/ED/XI/2026</p>
                <p><strong>Lampiran</strong> : 1 (satu) Berkas Lembar RSVP</p>
                <p><strong>Perihal</strong> : <u>Laporan Perkembangan Program Bilingual & Undangan Sosialisasi English Day</u></p>
              </div>
              <div>
                <p>Parung Panjang, 5 November 2026</p>
              </div>
            </div>

            {/* Penerima Surat */}
            <div className="mt-6 text-xs font-serif leading-relaxed text-slate-800">
              <p>Kepada Yth.</p>
              <p className="font-bold text-sm">Bapak / Ibu Orang Tua / Wali Siswa</p>
              <p>SMPIT Al Madany Parung Panjang</p>
              <p>di Tempat</p>
            </div>

            {/* Pembuka */}
            <div className="mt-5 text-xs font-serif leading-relaxed text-slate-800 space-y-3 text-justify">
              <p className="italic font-bold">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
              <p>
                Segala puji bagi Allah Subhanahu wa Ta&apos;ala yang senantiasa melimpahkan rahmat, taufik, serta hidayah-Nya kepada kita semua. Shalawat dan salam semoga senantiasa tercurahkan kepada junjungan kita Nabi Muhammad Shallallahu &apos;Alaihi Wasallam, keluarga, sahabat, dan umat beliau hingga akhir zaman.
              </p>
              <p>
                Sehubungan dengan telah berjalannya semester pertama pelaksanaan <strong>Program Akselerasi Bilingual 2026–2028</strong> di SMP IT Al Madany, kami atas nama pihak sekolah menyampaikan ucapan terima kasih dan apresiasi yang setinggi-tingginya kepada seluruh Bapak/Ibu wali murid atas doa, dukungan moral, dan kerja sama harmonis yang telah terjalin dengan sangat baik.
              </p>

              {/* Bagian A: Laporan Perkembangan 6 Bulan */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  A. Laporan Perkembangan Program (6 Bulan Pertama)
                </h4>
                <p className="mt-1">
                  Alhamdulillah, program pembiasaan bahasa Inggris harian (ELITE Habit) dan penguatan bahasa guru serta siswa menunjukkan kemajuan yang sangat membanggakan:
                </p>
                <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2.5">Indikator Program</th>
                        <th className="p-2.5">Target Awal</th>
                        <th className="p-2.5">Capaian Saat Ini</th>
                        <th className="p-2.5">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-medium">Keaktifan Guru (ELITE Habit WA)</td>
                        <td className="p-2.5">70%</td>
                        <td className="p-2.5 font-bold text-emerald-800">&gt; 85%</td>
                        <td className="p-2.5">Konsisten latihan pagi & misi harian</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Sertifikasi Duta Guru (Ambassador)</td>
                        <td className="p-2.5">50% Bronze</td>
                        <td className="p-2.5 font-bold text-emerald-800">25% Silver, 60% Bronze</td>
                        <td className="p-2.5">Guru siap mengajar mapel dwibahasa</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Paparan Bahasa Inggris di Kelas (Active Zone)</td>
                        <td className="p-2.5">30%</td>
                        <td className="p-2.5 font-bold text-emerald-800">35% – 40%</td>
                        <td className="p-2.5">Instruksi pembuka, inti, & kuis bilingual</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Ekosistem Siswa (English Club & Peer Tutor)</td>
                        <td className="p-2.5">25 Siswa</td>
                        <td className="p-2.5 font-bold text-emerald-800">45 Siswa & 15 Tutor</td>
                        <td className="p-2.5">Siswa saling mendampingi teman sebaya</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bagian B: Dampak Positif Terlihat */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  B. Dampak Positif yang Mulai Terlihat pada Siswa
                </h4>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="font-bold text-slate-900 block">1. Percaya Diri & Keberanian Berbicara</span>
                    <p className="mt-1 text-slate-600">Siswa tidak lagi canggung merespons sapaan dan instruksi guru menggunakan bahasa Inggris di kelas maupun saat berpapasan di lingkungan sekolah.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="font-bold text-slate-900 block">2. Penguasaan Kosakata Fungsional</span>
                    <p className="mt-1 text-slate-600">Siswa memahami lebih dari 50 frasa saku instruksional harian tanpa perlu menunggu terjemahan bahasa Indonesia.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="font-bold text-slate-900 block">3. Antusiasme Belajar Mapel Bilingual</span>
                    <p className="mt-1 text-slate-600">Pelajaran Matematika dan IPA terasa lebih menarik melalui kuis interaktif, permainan istilah ilmiah, dan metode visual terpadu.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="font-bold text-slate-900 block">4. Budaya Saling Mendukung (Peer Support)</span>
                    <p className="mt-1 text-slate-600">Terbangunnya empati di mana siswa yang lebih mahir dengan senang hati membantu rekan satu kelompoknya tanpa meremehkan.</p>
                  </div>
                </div>
              </div>

              {/* Bagian C: Rencana ke Depan Menuju 2028 */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  C. Rencana Strategis Menuju Kemandirian Penuh 2028
                </h4>
                <p className="mt-1">
                  Sekolah telah menyusun peta jalan 3 fase yang bertahap dan terukur:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
                  <li><strong>Tahun 2026 (Fase 1 - Pembiasaan & Fondasi):</strong> Target paparan kelas 30%, penguatan 100% guru bersertifikat Bronze/Silver, pembentukan klub bahasa Inggris.</li>
                  <li><strong>Tahun 2027 (Fase 2 - Integrasi & Cambridge Standard):</strong> Target paparan kelas 70%, simulasi kurikulum Cambridge Lower Secondary (0876), pengiriman delegasi lomba tingkat provinsi/nasional.</li>
                  <li><strong>Tahun 2028 (Fase 3 - Kemandirian Penuh 100%):</strong> Terwujudnya sekolah model bilingual berkarakter Islam yang mandiri dan berdaya saing global.</li>
                </ul>
              </div>

              {/* Bagian D: Undangan English Day */}
              <div className="mt-4 pt-3 border-t border-slate-200 rounded-xl bg-brand-50/50 p-4 border border-brand-200">
                <h4 className="font-bold text-sm text-brand-900 uppercase tracking-wide">
                  D. Undangan Pertemuan Sosialisasi & Showcase Siswa (English Day)
                </h4>
                <p className="mt-1 text-slate-800">
                  Sebagai wujud transparansi serta untuk mempererat sinergi antara sekolah dan rumah, kami mengundang Bapak/Ibu untuk hadir pada:
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-slate-800">
                  <div><strong>Hari / Tanggal</strong> : Sabtu, 15 November 2026</div>
                  <div><strong>Waktu</strong> : Pukul 08.00 – 11.00 WIB</div>
                  <div><strong>Tempat</strong> : Aula Utama SMP IT Al Madany</div>
                  <div><strong>Pakaian</strong> : Busana Muslim / Muslimah Rapi</div>
                </div>
                <div className="mt-2 text-slate-700">
                  <strong>Agenda Acara:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-0.5">
                    <li>Showcase Penampilan Siswa (Pidato Bahasa Inggris, Storytelling Islami & English Drama)</li>
                    <li>Pemaparan Capaian & Roadmap 2028 oleh Koordinator EDT dan Kepala Sekolah</li>
                    <li>Workshop Singkat: <em>5 Tips Praktis Menumbuhkan Kebiasaan Bahasa Inggris di Rumah</em></li>
                    <li>Sesi Dialog dan Tanya Jawab Terbuka dengan Tim Asesor</li>
                    <li>Pemberian Apresiasi Bintang Duta Bahasa Siswa & Guru Terbaik Bulan Ini</li>
                  </ol>
                </div>
              </div>

              {/* Bagian E: Tips Praktis Pendampingan di Rumah */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  E. 5 Tips Praktis Mendampingi Bahasa Inggris Anak di Rumah
                </h4>
                <ol className="list-decimal pl-5 mt-2 space-y-1.5 text-slate-700">
                  <li><strong>Fokus pada Keberanian, Bukan Kesalahan (Fluency over Accuracy):</strong> Puji setiap kali anak berani mencoba berbicara bahasa Inggris. Hindari langsung mengoreksi tata bahasa agar anak tidak kehilangan rasa percaya diri.</li>
                  <li><strong>Gunakan Frasa Sederhana Setiap Hari:</strong> Sisipkan sapaan akrab di rumah seperti <em>&ldquo;Good morning, son!&rdquo;</em>, <em>&ldquo;Have a great day at school&rdquo;</em>, atau <em>&ldquo;Thank you for helping Ummi&rdquo;</em>.</li>
                  <li><strong>Sediakan Media Ramah Anak:</strong> Ajak anak menonton tayangan edukasi atau membaca buku cerita berbahasa Inggris selama 15–20 menit di akhir pekan.</li>
                  <li><strong>Dengarkan Saat Anak Bercerita:</strong> Mintalah anak menceritakan satu kosakata atau lagu bahasa Inggris baru yang dipelajarinya di sekolah hari itu.</li>
                  <li><strong>Dukung Kegiatan Ekstrakurikuler:</strong> Berikan dorongan moril agar anak aktif mengikuti Madani English Club dan berani tampil dalam perlombaan.</li>
                </ol>
              </div>

              {/* Bagian F: Penutup */}
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                <p>
                  Demikian surat edaran dan undangan ini kami sampaikan. Kehadiran dan dukungan aktif Bapak/Ibu merupakan motivasi terbesar bagi putra-putri kita untuk terus bertumbuh menjadi generasi muslim yang unggul, berakhlak mulia, dan berwawasan global.
                </p>
                <p className="italic font-bold">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</p>
              </div>

              {/* Tanda Tangan */}
              <div className="mt-8 grid grid-cols-2 gap-8 text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala SMP IT Al Madany</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Drs. H. Muhammad Ilyas, M.Pd.</p>
                  <p className="text-[10px] text-slate-500">NIP. 19740815 199903 1 002</p>
                </div>
                <div>
                  <p>Hormat kami,</p>
                  <p className="font-bold">Koordinator English Development Team (EDT)</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Sarah Amalia, S.Pd. (C1)</p>
                  <p className="text-[10px] text-slate-500">NIP. 19890422 201402 2 001</p>
                </div>
              </div>
            </div>

            {/* Bagian G: Lembar RSVP Konfirmasi Kehadiran */}
            <div className="mt-12 pt-6 border-t-2 border-dashed border-slate-400 font-serif text-xs">
              <div className="flex items-center justify-between text-slate-500 italic text-[11px] mb-3">
                <span>✂ Potong lembar konfirmasi ini dan kembalikan kepada Wali Kelas paling lambat Kamis, 13 November 2026</span>
                <span className="font-sans font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded">Lampiran 8 RSVP</span>
              </div>

              <div className="rounded-2xl border-2 border-slate-800 p-5 bg-slate-50 space-y-4">
                <div className="text-center border-b border-slate-300 pb-2">
                  <h5 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                    LEMBAR KONFIRMASI KEHADIRAN ORANG TUA / WALI SISWA (RSVP)
                  </h5>
                  <p className="text-[11px] text-slate-600">
                    Sosialisasi Program Akselerasi Bilingual & Showcase Siswa SMP IT Al Madany
                  </p>
                </div>

                <div className="grid gap-2 text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-36 font-semibold">Nama Siswa:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 h-4"></span>
                    <span className="w-16 font-semibold text-right">Kelas:</span>
                    <span className="w-24 border-b border-dotted border-slate-600 h-4"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-36 font-semibold">Nama Orang Tua / Wali:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 h-4"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-36 font-semibold">No. Handphone / WhatsApp:</span>
                    <span className="flex-1 border-b border-dotted border-slate-600 h-4"></span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="font-bold text-slate-800 mb-1.5">Menyatakan bahwa saya:</p>
                  <div className="space-y-1.5 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-slate-700 rounded-sm"></div>
                      <span><strong>HADIR</strong> pada pertemuan sosialisasi hari Sabtu, 15 November 2026 di Aula SMPIT Al Madany Parung Panjang.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-slate-700 rounded-sm"></div>
                      <span><strong>TIDAK DAPAT HADIR</strong> karena alasan: ........................................................................................</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end text-center">
                  <div className="w-56">
                    <p>Parung Panjang, ...... November 2026</p>
                    <p className="text-[11px]">Orang Tua / Wali Siswa,</p>
                    <div className="h-12"></div>
                    <p className="border-b border-slate-700 font-bold">( ........................................................ )</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
