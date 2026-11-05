"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Flame,
  HelpCircle,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Mic,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Sunrise,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/forms";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  LevelBadge,
  Pill,
  Select,
  StatCard,
  StatusPill,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { quickVerifyDailyLogAction, saveDailyPromptAction, deleteDailyPromptAction } from "@/actions/elite";
import { generateWhatsAppBroadcast, type CuratedPromptTemplate, type EliteDailyPromptItem } from "@/lib/elite-prompts";
import { formatDate, formatLongDate, parseJson, toInputDate } from "@/lib/utils";

export interface TeacherDailyStatus {
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  level: string;
  whatsapp: string | null;
  isPilot: boolean;
  buddyName: string | null;
  logId?: string;
  submitted: boolean;
  mirrorMorning: boolean;
  voiceNoteOnTime: boolean;
  dailyMission: boolean;
  missionAnswer: string | null;
  englishZoneMinutes: number;
  buddySession: boolean;
  buddyNote: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt?: string;
}

export interface TeacherStreakRanking {
  teacherId: string;
  name: string;
  subject: string;
  level: string;
  streakDays: number;
  monthlyParticipationPct: number;
  totalLogs: number;
  totalOnTime: number;
  buddyName: string | null;
  whatsapp: string | null;
}

export function EliteProgramClient({
  dateStr,
  teachersStatus,
  activePrompt,
  curatedTemplates,
  scheduledPrompts,
  leaderboard,
}: {
  dateStr: string;
  teachersStatus: TeacherDailyStatus[];
  activePrompt: EliteDailyPromptItem;
  curatedTemplates: CuratedPromptTemplate[];
  scheduledPrompts: EliteDailyPromptItem[];
  leaderboard: TeacherStreakRanking[];
}) {
  const [tab, setTab] = useState<"LIVE_MONITOR" | "POSTING_MISI" | "BANK_PROMPT" | "LEADERBOARD">("LIVE_MONITOR");
  const [filterSubmitted, setFilterSubmitted] = useState<"ALL" | "SUBMITTED" | "NOT_YET">("ALL");
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [copiedRekap, setCopiedRekap] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  // State untuk form custom prompt
  const [formDate, setFormDate] = useState(dateStr);
  const [formTheme, setFormTheme] = useState(activePrompt.theme);
  const [formCategory, setFormCategory] = useState<string>(activePrompt.category);
  const [formMirror, setFormMirror] = useState(activePrompt.mirrorPrompt);
  const [formAudioTip, setFormAudioTip] = useState(activePrompt.mirrorAudioTip ?? "");
  const [formMission, setFormMission] = useState(activePrompt.dailyMission);
  const [formCefr, setFormCefr] = useState(activePrompt.targetCefr);
  const [formNotes, setFormNotes] = useState(activePrompt.notes ?? "");

  // Statistik live hari ini
  const totalTeachers = teachersStatus.length;
  const submittedCount = teachersStatus.filter((t) => t.submitted).length;
  const notSubmittedCount = totalTeachers - submittedCount;
  const participationPct = totalTeachers > 0 ? Math.round((submittedCount / totalTeachers) * 100) : 0;
  const onTimeCount = teachersStatus.filter((t) => t.voiceNoteOnTime).length;
  const avgZone = Math.round(
    teachersStatus.reduce((acc, t) => acc + t.englishZoneMinutes, 0) / (submittedCount || 1)
  );

  // Filter daftar guru di tabel
  const filteredTeachers = teachersStatus.filter((t) => {
    if (filterSubmitted === "SUBMITTED") return t.submitted;
    if (filterSubmitted === "NOT_YET") return !t.submitted;
    return true;
  });

  // Teks Siaran WhatsApp untuk Posting Pagi
  const dateFormatted = formatLongDate(dateStr);
  const waBroadcastText = generateWhatsAppBroadcast(activePrompt, dateFormatted);

  // Teks Rekap Setoran Hari Ini untuk WhatsApp
  const submittedList = teachersStatus
    .filter((t) => t.submitted)
    .map((t, i) => `${i + 1}. ${t.name} (${t.subject}) ${t.voiceNoteOnTime ? "⭐ On-Time" : "✅"}`)
    .join("\n");

  const unsubmittedList = teachersStatus
    .filter((t) => !t.submitted)
    .map((t, i) => `${i + 1}. ${t.name} (${t.subject})`)
    .join("\n");

  const waRekapText = `📊 *REKAP HARIAN SETORAN ELITE PROGRAM*
*SMPIT AL MADANY PARUNG PANJANG*
📅 ${dateFormatted}

🎯 *Statistik Partisipasi:*
• Sudah Setor: ${submittedCount} dari ${totalTeachers} Guru (${participationPct}%)
• Tepat Waktu (On-Time): ${onTimeCount} Guru
• Target Harian Sekolah: ≥ 70%

✅ *GURU YANG SUDAH MENYETOR:*
${submittedList || "(Belum ada guru yang menyetor)"}

⏳ *GURU YANG DITUNGGU SETORANNYA (Hingga 20.00 WIB):*
${unsubmittedList || "(Alhamdulillah seluruh guru sudah menyetor! 🎉)"}

Mari rawat konsistensi pembiasaan bahasa Inggris setiap hari! Semangat Bapak/Ibu Guru! 🌟`;

  // Teks Pengingat (Reminder) untuk yang belum setor
  const waReminderText = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Guru Hebat SMPIT Al Madany,

Mengingatkan kembali bagi yang belum menyetor Voice Note *Mirror Morning* dan *Misi Harian ELITE* hari ini (${dateFormatted}), batas waktu pengisian laporan di web LMS adalah pukul 20.00 WIB malam ini.

Link pengisian: http://localhost:3000/guru/harian

Tetap semangat merawat habit bahasa Inggris menuju Full Bilingual 2028! Terima kasih 🙏✨`;

  function copyToClipboard(text: string, setter: (val: boolean) => void) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  }

  function applyCuratedTemplate(tpl: CuratedPromptTemplate) {
    setFormTheme(tpl.theme);
    setFormCategory(tpl.category);
    setFormMirror(tpl.mirrorPrompt);
    setFormAudioTip(tpl.mirrorAudioTip);
    setFormMission(tpl.dailyMission);
    setFormCefr(tpl.targetCefr);
    setFormNotes(`Diterapkan dari Template Kurasi Dokumen Master: ${tpl.title}`);
    setTab("POSTING_MISI");
  }

  return (
    <div className="space-y-6">
      {/* 4 Kartu Statistik Cepat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Sunrise}
          tone="brand"
          label="Partisipasi Hari Ini"
          value={`${participationPct}%`}
          hint={`${submittedCount} dari ${totalTeachers} guru sudah setor`}
        />
        <StatCard
          icon={Clock}
          tone="mint"
          label="Tepat Waktu (On-Time)"
          value={`${onTimeCount} Guru`}
          hint="Kirim VN sebelum 07.30 (+1 Poin)"
        />
        <StatCard
          icon={Flame}
          tone="coral"
          label="Guru Belum Setor"
          value={`${notSubmittedCount} Guru`}
          hint="Batas waktu pelaporan 20.00 WIB"
        />
        <StatCard
          icon={TrendingUp}
          tone="gold"
          label="Rata-rata Zone"
          value={`${avgZone} Menit`}
          hint="Latihan English Zone harian"
        />
      </div>

      {/* Navigasi Tab */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setTab("LIVE_MONITOR")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "LIVE_MONITOR"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Sunrise className="size-4" /> Papan Kendali Hari Ini ({submittedCount}/{totalTeachers})
          </button>
          <button
            type="button"
            onClick={() => setTab("POSTING_MISI")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "POSTING_MISI"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Megaphone className="size-4" /> Posting & Jadwal Misi
          </button>
          <button
            type="button"
            onClick={() => setTab("BANK_PROMPT")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "BANK_PROMPT"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Sparkles className="size-4" /> Bank Inspirasi ({curatedTemplates.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("LEADERBOARD")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "LEADERBOARD"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Flame className="size-4 text-coral-500" /> Peringkat Streak & Analisis
          </button>
        </div>

        {/* Pemilih Tanggal Pantau */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Calendar className="size-4 text-brand-600" />
          <span>Tanggal Pantau:</span>
          <input
            type="date"
            defaultValue={dateStr}
            onChange={(e) => {
              if (e.target.value) {
                window.location.href = `/admin/elite?date=${e.target.value}`;
              }
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ──────────────── TAB 1: PAPAN KENDALI LIVE HARI INI ──────────────── */}
      {tab === "LIVE_MONITOR" && (
        <div className="space-y-6">
          {/* Header Aksi WhatsApp & Broadcast */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
            <div>
              <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                <Megaphone className="size-4 text-brand-600" />
                Prompt Aktif Hari Ini: <span className="text-brand-700">{activePrompt.theme}</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                &ldquo;{activePrompt.mirrorPrompt}&rdquo;
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(waRekapText, setCopiedRekap)}
              >
                {copiedRekap ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                {copiedRekap ? "Tersalin ke Clipboard!" : "Salin Rekap Setoran WA"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(waReminderText, setCopiedReminder)}
              >
                {copiedReminder ? <Check className="size-4 text-emerald-600" /> : <Bell className="size-4 text-amber-600" />}
                {copiedReminder ? "Pengingat Tersalin!" : "Salin Pengingat WA Guru"}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setTab("POSTING_MISI")}
              >
                <Edit className="size-3.5" /> Ubah Prompt Hari Ini
              </Button>
            </div>
          </div>

          {/* Tabel Status Live Guru */}
          <Card>
            <CardHeader
              icon={Users}
              title={`Status Setoran Guru (${dateFormatted})`}
              description="Pantau langsung keaktifan guru menyetor Mirror Morning dan Misi Harian secara real-time."
              action={
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setFilterSubmitted("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      filterSubmitted === "ALL" ? "bg-white text-ink shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Semua ({totalTeachers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSubmitted("SUBMITTED")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      filterSubmitted === "SUBMITTED" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Sudah Setor ({submittedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSubmitted("NOT_YET")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      filterSubmitted === "NOT_YET" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Belum ({notSubmittedCount})
                  </button>
                </div>
              }
            />
            <CardBody className="p-0 overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Tenaga Pendidik</Th>
                    <Th>Level Duta</Th>
                    <Th className="text-center">Mirror Morning (VN)</Th>
                    <Th>Misi Harian</Th>
                    <Th className="text-center">English Zone</Th>
                    <Th className="text-center">Status Verifikasi</Th>
                    <Th className="text-right">Aksi Cepat</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => (
                    <tr key={t.teacherId} className="hover:bg-slate-50/70 transition">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <div>
                            <p className="font-bold text-xs text-ink">{t.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {t.subject} {t.isPilot && "· Pilot"}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <LevelBadge level={t.level as any} />
                      </Td>
                      <Td className="text-center">
                        {t.submitted ? (
                          t.mirrorMorning ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="size-3" /> Sudah
                              </span>
                              {t.voiceNoteOnTime && (
                                <span className="text-[10px] text-brand-600 font-bold mt-0.5">
                                  ⭐ On-Time
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Tidak</span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300 italic">Belum</span>
                        )}
                      </Td>
                      <Td className="max-w-xs">
                        {t.submitted ? (
                          t.dailyMission ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg mb-1">
                                <CheckCircle2 className="size-3" /> Terlaksana
                              </span>
                              {t.missionAnswer && (
                                <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                                  &ldquo;{t.missionAnswer}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Tidak</span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300 italic">Belum</span>
                        )}
                      </Td>
                      <Td className="text-center">
                        {t.englishZoneMinutes > 0 ? (
                          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg">
                            {t.englishZoneMinutes} mnt
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </Td>
                      <Td className="text-center">
                        {t.submitted ? (
                          <StatusPill status={t.status ?? "PENDING"} />
                        ) : (
                          <Pill tone="danger">Belum Setor</Pill>
                        )}
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.submitted && t.logId && t.status === "PENDING" && (
                            <form action={quickVerifyDailyLogAction} className="inline-flex items-center gap-1">
                              <input type="hidden" name="id" value={t.logId} />
                              <input type="hidden" name="status" value="APPROVED" />
                              <button
                                type="submit"
                                title="Terima & Setujui Setoran"
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                              >
                                <CheckCircle2 className="size-4" />
                              </button>
                            </form>
                          )}

                          {t.whatsapp && !t.submitted && (
                            <a
                              href={`https://wa.me/${t.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Assalamu'alaikum ${t.name}, sekadar mengingatkan untuk menyetor Voice Note Mirror Morning & Misi ELITE hari ini ya. Semangat selalu! ✨`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Kirim Pesan WhatsApp Langsung"
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              <MessageCircle className="size-4" />
                            </a>
                          )}

                          <Link
                            href={`/admin/guru/${t.teacherId}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition"
                            title="Buka Profil Guru"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ──────────────── TAB 2: POSTING & JADWAL MISI ──────────────── */}
      {tab === "POSTING_MISI" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Kolom Kiri: Form Posting Mirror Morning & Misi Harian */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                icon={Megaphone}
                title="Atur & Jadwalkan Posting Harian ELITE"
                description="Tentukan prompt naskah Mirror Morning dan Misi Harian untuk dipelajari oleh guru."
              />
              <CardBody className="p-5">
                <ActionForm action={saveDailyPromptAction} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tanggal Penugasan *" hint="Pilih tanggal aktif posting">
                      <Input
                        type="date"
                        name="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Kategori Pembiasaan *">
                      <Select
                        name="category"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                      >
                        <option value="GREETING">Sapaan & Pembuka Kelas (Greetings)</option>
                        <option value="INSTRUCTION">Instruksi KBM & Transisi (Instructions)</option>
                        <option value="FOCUS">Pengendalian Fokus & Suasana (Focus)</option>
                        <option value="PRAISE">Pujian & Penguatan Positif (Praise)</option>
                        <option value="CLOSING">Rangkuman & Penutup (Closing)</option>
                        <option value="GENERAL">Pembiasaan Umum / Ruang Guru</option>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Tema Hari Ini *" hint="Misal: Attention Getters & Focus Transition">
                    <Input
                      name="theme"
                      value={formTheme}
                      onChange={(e) => setFormTheme(e.target.value)}
                      placeholder="Masukkan tema hari ini..."
                      required
                    />
                  </Field>

                  <Field
                    label="1. Naskah Mirror Morning (06.30 - 07.30 WIB) *"
                    hint="Teks yang wajib dilatih guru di depan cermin dan direkam via Voice Note WA (30-60 detik)"
                  >
                    <Textarea
                      name="mirrorPrompt"
                      rows={4}
                      value={formMirror}
                      onChange={(e) => setFormMirror(e.target.value)}
                      placeholder="Contoh: Eyes on me in 3, 2, 1... Thank you, class! Let's lower our voices..."
                      required
                    />
                  </Field>

                  <Field
                    label="Panduan Pelafalan & Intonasi (Audio Tips)"
                    hint="Catatan pelafalan atau tips penekanan kata"
                  >
                    <Input
                      name="mirrorAudioTip"
                      value={formAudioTip}
                      onChange={(e) => setFormAudioTip(e.target.value)}
                      placeholder="Contoh: Beri jeda 1 detik setelah 'Eyes on me'..."
                    />
                  </Field>

                  <Field
                    label="2. Misi Harian di Kelas / Kantor (10.00 - 15.00 WIB) *"
                    hint="Instruksi tantangan praktis yang harus dieksekusi guru hari ini"
                  >
                    <Textarea
                      name="dailyMission"
                      rows={3}
                      value={formMission}
                      onChange={(e) => setFormMission(e.target.value)}
                      placeholder="Contoh: Gunakan minimal 3 variasi Attention Getter bahasa Inggris saat mengajar..."
                      required
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Target CEFR Level">
                      <Select
                        name="targetCefr"
                        value={formCefr}
                        onChange={(e) => setFormCefr(e.target.value)}
                      >
                        <option value="A1">A1 (Pemula)</option>
                        <option value="A2">A2 (Elementary)</option>
                        <option value="A2 - B1">A2 - B1 (Menengah Bawah)</option>
                        <option value="B1">B1 (Intermediate)</option>
                        <option value="B2">B2 (Upper Intermediate)</option>
                      </Select>
                    </Field>

                    <Field label="Catatan Tambahan Tim EDT" hint="Opsional">
                      <Input
                        name="notes"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Contoh: Fokus pada guru pengampu kelas 7 & 8..."
                      />
                    </Field>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <SubmitButton>
                      <Send className="size-4" /> Simpan & Terbitkan Jadwal
                    </SubmitButton>
                  </div>
                </ActionForm>
              </CardBody>
            </Card>
          </div>

          {/* Kolom Kanan: Pratinjau Siaran WhatsApp */}
          <div className="space-y-6">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader
                icon={MessageSquare}
                title="Siaran Format WhatsApp"
                description="Salin teks otomatis ini dan tempelkan langsung ke grup WhatsApp ELITE Civitas Guru."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(waBroadcastText, setCopiedBroadcast)}
                  >
                    {copiedBroadcast ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    {copiedBroadcast ? "Tersalin!" : "Salin Siaran WA"}
                  </Button>
                }
              />
              <CardBody className="p-4">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all shadow-2xs max-h-[460px] overflow-y-auto">
                  {waBroadcastText}
                </div>
              </CardBody>
            </Card>

            {/* Riwayat Prompt Terjadwal */}
            <Card>
              <CardHeader
                icon={Calendar}
                title="Daftar Jadwal Khusus"
                description={`${scheduledPrompts.length} jadwal custom pernah disimpan.`}
              />
              <CardBody className="p-0">
                {scheduledPrompts.length === 0 ? (
                  <p className="p-5 text-xs text-slate-500 text-center italic">
                    Belum ada jadwal khusus tersimpan. Sistem saat ini menggunakan template rotasi otomatis Senin–Jumat.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 text-xs">
                    {scheduledPrompts.map((p) => (
                      <li key={p.date} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{p.date}</span>
                            <Pill tone="info">{p.targetCefr}</Pill>
                          </div>
                          <p className="font-semibold text-slate-700 mt-0.5">{p.theme}</p>
                          <p className="text-slate-500 line-clamp-1 italic mt-0.5">&ldquo;{p.mirrorPrompt}&rdquo;</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setFormDate(p.date);
                              setFormTheme(p.theme);
                              setFormCategory(p.category);
                              setFormMirror(p.mirrorPrompt);
                              setFormAudioTip(p.mirrorAudioTip ?? "");
                              setFormMission(p.dailyMission);
                              setFormCefr(p.targetCefr);
                              setFormNotes(p.notes ?? "");
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition"
                            title="Edit Prompt Ini"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <form action={deleteDailyPromptAction}>
                            <input type="hidden" name="date" value={p.date} />
                            <button
                              type="submit"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Hapus Jadwal (Kembali ke Auto)"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: BANK INSPIRASI PROMPT & MISI ──────────────── */}
      {tab === "BANK_PROMPT" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                <Sparkles className="size-4 text-brand-600" />
                Pustaka Template Kurasi ELITE (Dokumen Master Bab 3 & 4)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Pilih template siap pakai di bawah untuk langsung dijadwalkan ke guru tanpa perlu menyusun naskah dari awal.
              </p>
            </div>
            <Pill tone="success">{curatedTemplates.length} Template Siap Pakai</Pill>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {curatedTemplates.map((tpl) => (
              <Card key={tpl.id} className="flex flex-col justify-between hover:border-brand-300 transition">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone="info">{tpl.category}</Pill>
                    <span className="text-xs font-bold text-slate-400">{tpl.targetCefr}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-ink">{tpl.title}</h4>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{tpl.theme}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                      <Mic className="size-3.5 text-brand-600" /> Naskah Mirror Morning:
                    </p>
                    <p className="text-slate-600 italic leading-relaxed line-clamp-3">
                      &ldquo;{tpl.mirrorPrompt}&rdquo;
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-1 text-xs">
                    <p className="font-bold text-amber-900 flex items-center gap-1">
                      ⚡ Misi Harian:
                    </p>
                    <p className="text-amber-800 line-clamp-2 leading-relaxed">
                      {tpl.dailyMission}
                    </p>
                  </div>
                </CardBody>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => applyCuratedTemplate(tpl)}
                  >
                    <Send className="size-3.5" /> Gunakan Template Ini
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: PERINGKAT STREAK & ANALISIS ──────────────── */}
      {tab === "LEADERBOARD" && (
        <div className="space-y-6">
          {/* Peringatan Guru Perlu Pendampingan (< 50% Partisipasi) */}
          {leaderboard.some((t) => t.monthlyParticipationPct < 50) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <UserX className="size-5" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-rose-900">
                    Peringatan Dini: Guru Memerlukan Pendampingan Khusus (Partisipasi &lt; 50%)
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Dokumen Master (Bab 6.2) menetapkan syarat minimal 70% untuk kelulusan level Duta. Hubungkan guru-guru berikut dengan pasangan <strong>English Buddy</strong> mereka:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {leaderboard
                      .filter((t) => t.monthlyParticipationPct < 50)
                      .map((t) => (
                        <div
                          key={t.teacherId}
                          className="flex items-center gap-2 rounded-xl bg-white border border-rose-200 px-3 py-1.5 text-xs shadow-2xs"
                        >
                          <span className="font-bold text-rose-800">{t.name}</span>
                          <span className="text-slate-500">({t.monthlyParticipationPct}%)</span>
                          {t.buddyName && (
                            <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
                              Buddy: {t.buddyName}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Leaderboard Streak */}
          <Card>
            <CardHeader
              icon={Flame}
              title="Peringkat Konsistensi & Streak ELITE Guru"
              description="Evaluasi keaktifan 30 hari terakhir untuk memantau pemenuhan syarat Duta Inggris (Bab 5.1)."
            />
            <CardBody className="p-0 overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Peringkat</Th>
                    <Th>Nama Guru</Th>
                    <Th>Level Duta</Th>
                    <Th className="text-center">Aktif Berturut-turut (Streak)</Th>
                    <Th className="text-center">Partisipasi 30 Hari</Th>
                    <Th className="text-center">Tepat Waktu (On-Time)</Th>
                    <Th>English Buddy</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((t, idx) => (
                    <tr key={t.teacherId} className="hover:bg-slate-50/70 transition">
                      <Td className="font-black text-sm">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </Td>
                      <Td>
                        <div>
                          <p className="font-bold text-xs text-ink">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.subject}</p>
                        </div>
                      </Td>
                      <Td>
                        <LevelBadge level={t.level as any} />
                      </Td>
                      <Td className="text-center">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-coral-50 border border-coral-200 px-2.5 py-1 text-xs font-black text-coral-700">
                          <Flame className="size-3.5 fill-coral-500 text-coral-500" />
                          {t.streakDays} Hari
                        </span>
                      </Td>
                      <Td className="text-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            t.monthlyParticipationPct >= 70
                              ? "bg-emerald-50 text-emerald-700"
                              : t.monthlyParticipationPct >= 50
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {t.monthlyParticipationPct}%
                        </span>
                      </Td>
                      <Td className="text-center text-xs font-bold text-brand-700">
                        {t.totalOnTime}x
                      </Td>
                      <Td className="text-xs text-slate-600 font-medium">
                        {t.buddyName ?? <span className="text-slate-400 italic">Belum dipasangkan</span>}
                      </Td>
                      <Td className="text-right">
                        <Link
                          href={`/admin/guru/${t.teacherId}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition inline-flex"
                          title="Buka Profil Guru"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
