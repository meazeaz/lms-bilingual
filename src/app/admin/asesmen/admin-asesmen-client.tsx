"use client";

import { useState } from "react";
import { Check, Clock, FileCheck, Scale, Send, ShieldAlert, X } from "lucide-react";
import { createMicroTeaching, decideAppeal, reviewRegistration } from "@/actions/lms";
import { ActionForm, ScorePicker, SubmitButton } from "@/components/forms";
import { Button, Field, Input, LevelBadge, Pill, Select, StatusPill, Textarea } from "@/components/ui";
import { MICRO_FOCUS } from "@/lib/program";
import { toInputDate } from "@/lib/utils";

// ───────────── Form Input Micro-Teaching (Bulan 4) ─────────────
export function MicroTeachingForm({
  teachers,
}: {
  teachers: { id: string; name: string }[];
}) {
  const [week, setWeek] = useState(4);
  const defaultFocus = MICRO_FOCUS.find((f) => f.week === week)?.focus ?? "";

  return (
    <ActionForm action={createMicroTeaching} resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Pilih Guru">
          <Select id="teacherId" name="teacherId" required defaultValue="">
            <option value="" disabled>-- Pilih guru peserta --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Minggu Pelaksanaan">
          <Select
            id="week"
            name="week"
            required
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
          >
            {MICRO_FOCUS.map((f) => (
              <option key={f.week} value={f.week}>
                Minggu {f.week}: {f.focus} ({f.minutes} mnt)
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal">
          <Input id="date" name="date" type="date" required defaultValue={toInputDate(new Date())} />
        </Field>
      </div>

      <Field label="Fokus Pembelajaran">
        <Input id="focus" name="focus" required defaultValue={defaultFocus} />
      </Field>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Rubrik 4 Aspek Penilaian (@25% · Skor 1–4)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ScorePicker name="opening" label="1. Pembukaan & Instruksi" hint="Greeting, penyampaian tujuan, instruksi awal" />
          <ScorePicker name="delivery" label="2. Aktivitas Inti & Monitoring" hint="Penyampaian materi & keterlibatan siswa" />
          <ScorePicker name="cfu" label="3. Checking for Understanding (CFU)" hint="Memeriksa pemahaman secara interaktif" />
          <ScorePicker name="closing" label="4. Penutup & Transisi" hint="Review materi, apresiasi, salam penutup" />
        </div>
      </div>

      <Field label="Catatan Evaluasi & Umpan Balik Observer">
        <Textarea id="notes" name="notes" rows={2} placeholder="Catatan kekuatan dan area yang perlu ditingkatkan..." />
      </Field>

      <div className="flex justify-end pt-2">
        <SubmitButton variant="primary" size="md" pendingText="Menyimpan nilai…">
          <FileCheck className="size-4" /> Simpan Nilai Micro-Teaching
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Form Keputusan Banding (Lampiran 7) ─────────────
export function AppealDecisionForm({
  appealId,
  currentScore,
  onClose,
}: {
  appealId: string;
  currentScore: number;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("DITERIMA_SEBAGIAN");

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-ink flex items-center gap-1.5">
          <Scale className="size-4 text-brand-600" /> Putusan Tim Banding
        </span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="size-4" />
        </button>
      </div>

      <ActionForm action={decideAppeal} resetOnSuccess>
        <input type="hidden" name="appealId" value={appealId} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Keputusan Final">
            <Select
              id="status"
              name="status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DITERIMA_SEBAGIAN">Diterima Sebagian (Revisi Nilai)</option>
              <option value="DITERIMA">Diterima (Jadwalkan Asesmen Ulang)</option>
              <option value="DITOLAK">Ditolak (Nilai Tetap Berlaku)</option>
            </Select>
          </Field>

          {status === "DITERIMA_SEBAGIAN" && (
            <Field label={`Nilai Revisi Baru (Awal: ${currentScore})`}>
              <Input
                id="revisedScore"
                name="revisedScore"
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                defaultValue={currentScore}
              />
            </Field>
          )}
        </div>

        <Field label="Catatan Pertimbangan & Berita Acara">
          <Textarea
            id="decision"
            name="decision"
            rows={2}
            placeholder="Jelaskan dasar pertimbangan Tim Banding (Kepala Sekolah & Tim EDT)..."
            required
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <SubmitButton variant="primary" size="sm" pendingText="Menyimpan putusan…">
            <Check className="size-4" /> Simpan Keputusan Banding
          </SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}

// ───────────── Form Verifikasi Pendaftaran Duta (Lampiran 6) ─────────────
export function RegistrationReviewItem({
  reg,
}: {
  reg: {
    id: string;
    teacherName: string;
    targetLevel: string;
    hoursPerWeek: string;
    readyToMentor: boolean;
    motivation: string;
    status: string;
    adminNote: string | null;
    assessmentDate: Date | null;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-ink">{reg.teacherName}</span>
          <LevelBadge level={reg.targetLevel} />
          <StatusPill status={reg.status} />
        </div>
        {reg.status === "PENDING" && (
          <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
            {open ? "Tutup" : "Verifikasi & Jadwalkan"}
          </Button>
        )}
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p><b>Waktu belajar:</b> {reg.hoursPerWeek} jam/minggu · <b>Mentor:</b> {reg.readyToMentor ? "Bersedia" : "Belum"}</p>
        <p className="italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">"{reg.motivation}"</p>
        {reg.adminNote && (
          <p className="text-slate-700"><b>Catatan EDT:</b> {reg.adminNote}</p>
        )}
        {reg.assessmentDate && (
          <p className="text-brand-700 font-semibold flex items-center gap-1">
            <Clock className="size-3.5" /> Tanggal Asesmen: {new Date(reg.assessmentDate).toLocaleDateString("id-ID")}
          </p>
        )}
      </div>

      {open && (
        <form action={reviewRegistration} className="border-t border-slate-100 pt-3 space-y-3">
          <input type="hidden" name="id" value={reg.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jadwal Asesmen">
              <Input id="assessmentDate" name="assessmentDate" type="date" />
            </Field>
            <Field label="Catatan EDT untuk Guru">
              <Input id="adminNote" name="adminNote" placeholder="Misal: Siapkan materi mini lesson..." />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              name="decision"
              value="reject"
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <X className="size-3.5" /> Tolak Pendaftaran
            </button>
            <button
              type="submit"
              name="decision"
              value="approve"
              className="inline-flex items-center gap-1.5 rounded-xl border border-mint-200 bg-mint-50 px-3.5 py-1.5 text-xs font-bold text-mint-700 hover:bg-mint-100"
            >
              <Check className="size-3.5" /> Setujui & Jadwalkan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ───────────── Item Banding dengan Form Keputusan ─────────────
export function AppealItem({
  appeal,
}: {
  appeal: {
    id: string;
    teacherName: string;
    date: Date;
    reasonType: string;
    explanation: string;
    evidence: string | null;
    request: string;
    status: string;
    decision: string | null;
    revisedScore: number | null;
    currentScore: number;
    createdAt: Date;
  };
}) {
  const [open, setOpen] = useState(false);
  const diffDays = Math.floor((Date.now() - new Date(appeal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = appeal.status === "DIAJUKAN" && diffDays > 14;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink text-base">{appeal.teacherName}</span>
          <StatusPill status={appeal.status} />
          {isOverdue && (
            <Pill tone="danger">
              <ShieldAlert className="size-3" /> Melebihi 14 Hari SOP
            </Pill>
          )}
        </div>
        <div className="text-xs text-slate-500">
          Diajukan: {new Date(appeal.createdAt).toLocaleDateString("id-ID")} ({diffDays} hari lalu)
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div>
          <p className="text-slate-500 font-semibold uppercase text-[10px]">Alasan Banding:</p>
          <p className="font-bold text-ink mt-0.5">{appeal.reasonType}</p>
        </div>
        <div>
          <p className="text-slate-500 font-semibold uppercase text-[10px]">Harapan Guru:</p>
          <p className="font-bold text-ink mt-0.5">{appeal.request}</p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
        <p className="font-semibold text-slate-800">Penjelasan Guru:</p>
        <p className="leading-relaxed">{appeal.explanation}</p>
        {appeal.evidence && (
          <p className="pt-1 text-[11px] text-slate-500"><b>Bukti:</b> {appeal.evidence}</p>
        )}
      </div>

      {appeal.decision && (
        <div className="rounded-xl bg-mint-50/70 p-3 border border-mint-200 text-xs text-mint-900 space-y-0.5">
          <p className="font-bold">Keputusan Tim Banding ({appeal.status}):</p>
          <p>{appeal.decision}</p>
          {appeal.revisedScore != null && (
            <p className="font-semibold text-brand-700">Nilai Akhir Baru: {appeal.revisedScore}</p>
          )}
        </div>
      )}

      {appeal.status === "DIAJUKAN" && (
        <div className="pt-2">
          {!open ? (
            <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
              <Scale className="size-4" /> Proses Keputusan Banding
            </Button>
          ) : (
            <AppealDecisionForm
              appealId={appeal.id}
              currentScore={appeal.currentScore}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
