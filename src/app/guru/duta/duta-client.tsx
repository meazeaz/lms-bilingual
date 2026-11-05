"use client";

import Image from "next/image";
import { useState } from "react";
import { Award, Check, CheckCircle2, ChevronDown, ChevronUp, FileText, HelpCircle, Printer, Scale, Send, ShieldAlert, Sparkles } from "lucide-react";
import { acknowledgeAssessment, submitAppeal, submitRegistration } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, CardHeader, Checkbox, Field, Input, LevelBadge, Pill, Select, StatusPill, Textarea } from "@/components/ui";
import { LEVEL_RULES, type Level } from "@/lib/program";
import { cn, formatDate } from "@/lib/utils";

// ───────────── Sertifikat Duta Inggris Digital (Siap Cetak) ─────────────
export function CertificateCard({
  teacherName,
  subject,
  level,
  levelSince,
  expiresAt,
}: {
  teacherName: string;
  subject: string;
  level: Level;
  levelSince: Date | null;
  expiresAt: Date | null;
}) {
  const [showCertificate, setShowCertificate] = useState(false);

  if (level === "NONE" || !levelSince) {
    return (
      <Card className="p-6 text-center">
        <div className="clay-soft mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Award className="size-8" />
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          Sertifikat Belum Tersedia
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Selesaikan asesmen Duta Inggris dan raih minimal level Bronze untuk membuka sertifikat digital resmi.
        </p>
      </Card>
    );
  }

  const rule = LEVEL_RULES[level];
  const borderTone =
    level === "GOLD"
      ? "border-amber-400 bg-amber-50/30"
      : level === "SILVER"
      ? "border-slate-300 bg-slate-50/30"
      : "border-amber-700/50 bg-amber-900/5";

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={Award}
        title="Sertifikat Duta Inggris Resmi"
        description={`Sertifikat digital level ${level} (${rule.certificateColor}) berlaku hingga ${expiresAt ? formatDate(expiresAt) : "-"}`}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCertificate(!showCertificate)}
          >
            {showCertificate ? "Tutup Pratinjau" : "Lihat & Cetak Sertifikat"}
          </Button>
        }
      />
      {showCertificate && (
        <CardBody className="border-t border-slate-100 bg-slate-50/50">
          <div className="flex justify-end mb-4 print:hidden">
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="size-4" /> Cetak / Simpan PDF
            </Button>
          </div>

          {/* Lembar Sertifikat Desain Cetak */}
          <div
            id="certificate-print"
            className={cn(
              "relative mx-auto max-w-2xl rounded-3xl border-4 p-8 text-center shadow-lg transition sm:p-12 print:border-8 print:shadow-none print:m-0 print:max-w-none",
              borderTone
            )}
          >
            <div className="absolute top-6 left-6 text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
              SMP IT AL MADANY · 2028
            </div>
            <div className="absolute top-6 right-6 text-xs font-mono font-bold text-slate-400">
              NO: EDT/{level}/{new Date(levelSince).getFullYear()}
            </div>

            <div className="flex justify-center mt-2 mb-2">
              <Image
                src="/logo-almadany.png"
                alt="Logo SMP IT Al Madany"
                width={70}
                height={70}
                className="size-16 object-contain drop-shadow-sm"
              />
            </div>

            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600">
              PROGRAM AKSELERASI BILINGUAL
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              SERTIFIKAT KOMPETENSI
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Diberikan dengan bangga kepada:
            </p>

            <div className="my-6">
              <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-ink underline decoration-brand-300 underline-offset-8">
                {teacherName}
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Guru Mata Pelajaran: {subject}
              </p>
            </div>

            <p className="mx-auto max-w-md text-xs sm:text-sm leading-relaxed text-slate-600">
              Telah memenuhi standar kompetensi instruksional bilingual dan dinyatakan lulus sebagai:
            </p>

            <div className="my-4 inline-block">
              <span className="clay-soft inline-flex items-center gap-2 rounded-2xl px-5 py-2 font-[family-name:var(--font-display)] text-xl font-black text-ink shadow-sm">
                <Sparkles className="size-5 text-amber-500" />
                {level} AMBASSADOR
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Target implementasi di kelas: <b>{rule.englishTargetPct}%</b> berbahasa Inggris · Berlaku{" "}
              {rule.validityMonths} bulan
            </p>

            <div className="mt-10 flex items-end justify-between border-t border-slate-200/80 pt-6 text-left">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Diterbitkan:</p>
                <p className="text-xs font-bold text-slate-700">{formatDate(levelSince)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Berlaku sampai: {expiresAt ? formatDate(expiresAt) : "-"}</p>
              </div>
              <div className="text-right">
                <div className="mb-1 font-[family-name:var(--font-display)] font-semibold text-slate-800 text-sm">
                  Tim EDT Al Madany
                </div>
                <p className="text-[11px] text-slate-500">Ketua Tim Pengembang Bahasa</p>
              </div>
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  );
}

// ───────────── Tombol Konfirmasi Telah Menerima Hasil ─────────────
export function AcknowledgeButton({ assessmentId }: { assessmentId: string }) {
  return (
    <form action={acknowledgeAssessment}>
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <Button variant="secondary" size="sm" type="submit">
        <Check className="size-4" /> Tandai Telah Menerima Hasil
      </Button>
    </form>
  );
}

// ───────────── Form Banding Asesmen (Lampiran 7) ─────────────
export function AppealForm({
  assessmentId,
  assessmentDate,
}: {
  assessmentId: string;
  assessmentDate: Date;
}) {
  const [open, setOpen] = useState(false);
  const diffDays = Math.floor((Date.now() - new Date(assessmentDate).getTime()) / (1000 * 60 * 60 * 24));
  const canAppeal = diffDays <= 7;

  if (!canAppeal) {
    return (
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <ShieldAlert className="size-3.5" /> Batas banding 7 hari telah lewat ({diffDays} hari lalu).
      </p>
    );
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-coral-600 hover:text-coral-700 p-0 h-auto"
        onClick={() => setOpen(!open)}
      >
        <Scale className="size-3.5" /> {open ? "Batal mengajukan banding" : "Ajukan Banding Nilai (Maks 7 Hari)"}
      </Button>

      {open && (
        <div className="mt-4 rounded-2xl border border-coral-200 bg-coral-50/40 p-4 text-left">
          <div className="flex items-start gap-2 mb-3">
            <Scale className="size-5 text-coral-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-ink">Formulir Banding Asesmen (Lampiran 7)</h4>
              <p className="text-xs text-slate-500">
                Diajukan maks. 7 hari setelah hasil keluar. Tim Banding (Kepsek & EDT) akan memutuskan maks. 14 hari kerja.
              </p>
            </div>
          </div>

          <ActionForm action={submitAppeal} resetOnSuccess>
            <input type="hidden" name="assessmentId" value={assessmentId} />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Alasan Keberatan">
                <Select id="reasonType" name="reasonType" required defaultValue="NILAI">
                  <option value="PROSEDUR">Prosedur asesmen tidak sesuai pedoman</option>
                  <option value="BOBOT">Bobot penilaian tidak proporsional</option>
                  <option value="INFO_BARU">Ada informasi/bukti baru yang belum dinilai</option>
                  <option value="NILAI">Nilai tidak mencerminkan kemampuan riil</option>
                  <option value="LAINNYA">Alasan lainnya</option>
                </Select>
              </Field>

              <Field label="Harapan Tindak Lanjut">
                <Select id="request" name="request" required defaultValue="KOREKSI_NILAI">
                  <option value="KOREKSI_NILAI">Koreksi nilai via peninjauan berkas</option>
                  <option value="ASESMEN_ULANG">Asesmen ulang dengan penguji berbeda</option>
                  <option value="PENJELASAN">Penjelasan tertulis rincian nilai</option>
                </Select>
              </Field>
            </div>

            <Field label="Penjelasan Lengkap">
              <Textarea
                id="explanation"
                name="explanation"
                rows={3}
                placeholder="Jelaskan secara objektif butir penilaian yang dirasa kurang tepat..."
                required
              />
            </Field>

            <Field label="Bukti Pendukung (Opsional)">
              <Input
                id="evidence"
                name="evidence"
                placeholder="Misal: rekaman video mengajar, catatan modul ajar, dll."
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <SubmitButton variant="coral" size="sm" pendingText="Mengirim banding…">
                <Send className="size-3.5" /> Kirim Permohonan Banding
              </SubmitButton>
            </div>
          </ActionForm>
        </div>
      )}
    </div>
  );
}

// ───────────── Form Pendaftaran Duta Inggris (Lampiran 6) ─────────────
export function RegistrationSection({
  currentLevel,
}: {
  currentLevel: Level;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        icon={FileText}
        title="Pendaftaran Duta Inggris (Lampiran 6)"
        description="Daftar untuk asesmen penempatan awal atau pengajuan kenaikan level berikutnya."
        action={
          <Button
            variant={open ? "secondary" : "primary"}
            size="sm"
            onClick={() => setOpen(!open)}
          >
            {open ? "Tutup Formulir" : "Isi Formulir Pendaftaran"}
          </Button>
        }
      />

      {open && (
        <CardBody className="border-t border-slate-100">
          <ActionForm action={submitRegistration} resetOnSuccess>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Level yang Dituju">
                  <Select id="targetLevel" name="targetLevel" required defaultValue={currentLevel === "NONE" ? "BRONZE" : currentLevel === "BRONZE" ? "SILVER" : "GOLD"}>
                    <option value="BRONZE">Bronze Ambassador (A2–B1 · target 30% Inggris)</option>
                    <option value="SILVER">Silver Ambassador (B1–B2 · target 50% Inggris)</option>
                    <option value="GOLD">Gold Ambassador (B2–C1 · target 70% Inggris)</option>
                  </Select>
                </Field>

                <Field label="Alokasi Waktu Belajar Mandiri">
                  <Select id="hoursPerWeek" name="hoursPerWeek" required defaultValue="3-4">
                    <option value="1-2">1–2 jam per minggu</option>
                    <option value="3-4">3–4 jam per minggu (disarankan)</option>
                    <option value="5+">5+ jam per minggu (intensif)</option>
                  </Select>
                </Field>
              </div>

              <Field label="Motivasi & Tantangan Terbesar">
                <Textarea
                  id="motivation"
                  name="motivation"
                  rows={3}
                  placeholder="Mengapa Anda ingin meraih level ini dan apa tantangan utama yang dihadapi di kelas..."
                  required
                />
              </Field>

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Komitmen Guru</p>
                <Checkbox
                  id="readyToMentor"
                  name="readyToMentor"
                  label="Pendampingan Guru (English Buddy)"
                  description="Bersedia mendampingi rekan guru lain sebagai English Buddy / Mentor"
                />
                <Checkbox
                  id="commitmentAgreement"
                  name="commitmentAgreement"
                  required
                  defaultChecked
                  label="Komitmen Peserta Program"
                  description="Saya menyatakan bersedia mengikuti seluruh rangkaian program ELITE harian, English Zone, dan asesmen berkala sesuai Dokumen Master 2028."
                />
              </div>

              <div className="flex justify-end pt-2">
                <SubmitButton variant="primary" size="md" pendingText="Mengirim pendaftaran…">
                  <Send className="size-4" /> Ajukan Pendaftaran ke Tim EDT
                </SubmitButton>
              </div>
            </div>
          </ActionForm>
        </CardBody>
      )}
    </Card>
  );
}
