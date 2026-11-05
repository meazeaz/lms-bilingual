"use client";

import { useState } from "react";
import { Check, CheckCircle2, ChevronDown, ChevronUp, Clock, Eye, FileText, Heart, Lightbulb, MessageSquareQuote, Send, Sparkles, Trophy, XCircle } from "lucide-react";
import { acknowledgeObservation, saveReflection } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, Field, Input, LevelBadge, Pill, Select, StatusPill, Textarea } from "@/components/ui";
import { OBSERVATION_ITEMS, RECOMMENDATIONS, SCHOOL_SUBJECTS, STUDENT_RESPONSE, type Level } from "@/lib/program";
import { formatDate, parseJson, toInputDate } from "@/lib/utils";

export interface TeacherReflectionItem {
  id: string;
  date: string;
  subject: string;
  className: string;
  targetLevel: string;
  achieved: string;
  fluentSentences: string;
  difficultSentences: string;
  studentResponse: string;
  challenge: string;
  nextChange: string;
  proudOf: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
}

export interface MyObservationItem {
  id: string;
  date: string;
  subject: string;
  className: string;
  score: number;
  englishPctBucket: string;
  englishPct: number;
  strengths: string;
  improvements: string;
  recommendation: string;
  recommendationNote: string | null;
  feedbackGiven: boolean;
  checklist: string;
  observer: {
    name: string;
  };
}

// ───────────── Form Input Refleksi Mandiri ─────────────
export function SelfReflectionForm({
  defaultSubject,
  currentLevel,
  availableSubjects,
}: {
  defaultSubject: string;
  currentLevel: Level;
  availableSubjects?: string[];
}) {
  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);
  const [achieved, setAchieved] = useState("YA");
  const [studentResponse, setStudentResponse] = useState("POSITIF");

  return (
    <ActionForm action={saveReflection} resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Tanggal Mengajar">
          <Input id="date" name="date" type="date" required defaultValue={toInputDate(new Date())} />
        </Field>

        <Field label="Mata Pelajaran">
          <Select id="subject" name="subject" required defaultValue={defaultSubject}>
            {defaultSubject && !subjects.includes(defaultSubject) && (
              <option value={defaultSubject}>{defaultSubject}</option>
            )}
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Kelas / Rombel">
          <Input id="className" name="className" required defaultValue="7A" placeholder="Contoh: 7A, 8B" />
        </Field>

        <Field label="Target Level Mengajar">
          <Select id="targetLevel" name="targetLevel" required defaultValue={currentLevel === "NONE" ? "BRONZE" : currentLevel}>
            <option value="BRONZE">Bronze (Target 30% Inggris)</option>
            <option value="SILVER">Silver (Target 50% Inggris)</option>
            <option value="GOLD">Gold (Target 70% Inggris)</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apakah Target Bahasa Inggris Hari Ini Tercapai?">
          <Select id="achieved" name="achieved" required value={achieved} onChange={(e) => setAchieved(e.target.value)}>
            <option value="YA">Ya, Sepenuhnya Tercapai</option>
            <option value="SEBAGIAN">Sebagian Tercapai</option>
            <option value="TIDAK">Belum Tercapai</option>
          </Select>
        </Field>

        <Field label="Respon & Keterlibatan Siswa">
          <Select
            id="studentResponse"
            name="studentResponse"
            required
            value={studentResponse}
            onChange={(e) => setStudentResponse(e.target.value)}
          >
            {Object.entries(STUDENT_RESPONSE).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Kalimat Bahasa Inggris Yang Lancar Diucapkan"
          hint="Tuliskan frasa atau instruksi yang berhasil Anda gunakan tanpa hambatan"
        >
          <Textarea
            id="fluentSentences"
            name="fluentSentences"
            required
            rows={3}
            placeholder="Contoh: 'Please open your book to page 45', 'Who can answer question number two?', 'Excellent job, team!'"
          />
        </Field>

        <Field
          label="Kalimat Yang Dirasa Sulit / Terbata-bata"
          hint="Frasa yang masih membingungkan atau membuat Anda ragu saat berbicara"
        >
          <Textarea
            id="difficultSentences"
            name="difficultSentences"
            rows={3}
            placeholder="Contoh: 'Let's summarize the concept together' (agak terbata-bata di vocabulary spesifik)..."
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Tantangan Terbesar Hari Ini"
          hint="Hambatan dari siswa, waktu, atau kosakata"
        >
          <Textarea
            id="challenge"
            name="challenge"
            required
            rows={3}
            placeholder="Contoh: Beberapa siswa di baris belakang masih malu merespon dalam bahasa Inggris..."
          />
        </Field>

        <Field
          label="Hal Yang Membanggakan"
          hint="Momen positif / keberhasilan kecil di kelas"
        >
          <Textarea
            id="proudOf"
            name="proudOf"
            required
            rows={3}
            placeholder="Contoh: Semua kelompok antusias saat games kosakata dan berani bertanya dalam bahasa Inggris..."
          />
        </Field>

        <Field
          label="Perubahan Pada Pertemuan Berikutnya"
          hint="Strategi atau langkah perbaikan yang akan Anda coba"
        >
          <Textarea
            id="nextChange"
            name="nextChange"
            required
            rows={3}
            placeholder="Contoh: Menyiapkan flashcard visual pendukung dan memberi pujian lebih sering..."
          />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton>Kirim Refleksi ke Tim EDT</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Kartu Hasil Observasi Kelas Guru ─────────────
export function MyObservationCard({
  obs,
}: {
  obs: MyObservationItem;
}) {
  const [expanded, setExpanded] = useState(false);
  const checklist = parseJson<boolean[]>(obs.checklist, Array(10).fill(false));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-brand-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
              Observasi Kelas: {obs.subject} ({obs.className})
            </span>
            <span
              className={`rounded-lg px-2.5 py-0.5 text-xs font-black ${
                obs.score >= 80
                  ? "bg-emerald-100 text-emerald-800"
                  : obs.score >= 60
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              Skor: {obs.score}/100
            </span>
            <Pill tone="info">
              Proporsi: {obs.englishPctBucket}%
            </Pill>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Pengamat: <span className="font-semibold text-slate-700">{obs.observer.name}</span> · {formatDate(obs.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {obs.feedbackGiven ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-4 text-emerald-600" /> Umpan Balik Diterima
            </span>
          ) : (
            <form action={acknowledgeObservation}>
              <input type="hidden" name="id" value={obs.id} />
              <Button type="submit" variant="mint" size="sm">
                <Check className="size-4" /> Konfirmasi Terima Umpan Balik
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Rangkuman Kekuatan & Perbaikan */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-800">
            <Sparkles className="size-3.5 text-emerald-600" /> Kekuatan Anda
          </p>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{obs.strengths}</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-800">
            <Lightbulb className="size-3.5 text-amber-600" /> Area Saran & Perbaikan
          </p>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{obs.improvements}</p>
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
        <div>
          <span className="font-bold text-slate-500">Rekomendasi Observer: </span>
          <span className="font-bold text-brand-700">
            {RECOMMENDATIONS[obs.recommendation] ?? obs.recommendation}
          </span>
          {obs.recommendationNote && (
            <span className="ml-2 text-slate-600 italic">(&ldquo;{obs.recommendationNote}&rdquo;)</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
        >
          {expanded ? "Tutup Rincian Aspek" : "Lihat 10 Aspek Penilaian"}
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {/* Rincian 10 Aspek Dropdown */}
      {expanded && (
        <div className="mt-4 space-y-1.5 rounded-xl border border-slate-200/60 bg-white p-3.5">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
            Capaian 10 Aspek Supervisi Pedagogik
          </p>
          {OBSERVATION_ITEMS.map((item, idx) => {
            const passed = checklist[idx];
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                  passed ? "bg-emerald-50 text-emerald-900 font-semibold" : "bg-slate-50 text-slate-500"
                }`}
              >
                {passed ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-3.5 shrink-0 text-slate-400" />
                )}
                <span className="font-bold text-slate-400">#{idx + 1}</span>
                <span className="flex-1">{item}</span>
                <span className="text-[11px] font-bold">{passed ? "Ya (+10)" : "Tidak"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
