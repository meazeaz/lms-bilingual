"use client";

import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Eye, Sparkles, X, XCircle } from "lucide-react";
import { createObservation } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, Field, Input, LevelBadge, Pill, Select, Textarea } from "@/components/ui";
import { ENGLISH_PCT_BUCKETS, OBSERVATION_ITEMS, RECOMMENDATIONS, SCHOOL_SUBJECTS, type Level } from "@/lib/program";
import { formatDate, parseJson, toInputDate } from "@/lib/utils";

export interface TeacherOption {
  id: string;
  name: string;
  subject: string;
  level: string;
}

export interface ObservationRecordItem {
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
  teacher: {
    id: string;
    user: { name: string; email: string };
    ambassadorLevel: string;
    subject: string;
  };
  observer: {
    name: string;
  };
}

// ───────────── Form Observasi Baru ─────────────
export function ObservationForm({
  teachers,
  initialTeacherId,
  availableSubjects,
}: {
  teachers: TeacherOption[];
  initialTeacherId?: string;
  availableSubjects?: string[];
}) {
  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);

  const [selectedTeacherId, setSelectedTeacherId] = useState(initialTeacherId ?? teachers[0]?.id ?? "");
  const [checklist, setChecklist] = useState<boolean[]>(Array(10).fill(false));
  const [englishBucket, setEnglishBucket] = useState("20-40");
  const [recommendation, setRecommendation] = useState("PERTAHANKAN");

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const yesCount = checklist.filter(Boolean).length;
  const score = yesCount * 10;

  const toggleAspect = (index: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const setAll = (val: boolean) => {
    setChecklist(Array(10).fill(val));
  };

  return (
    <ActionForm action={createObservation} resetOnSuccess>
      <input type="hidden" name="checklist" value={JSON.stringify(checklist)} />

      {/* Grid Informasi Umum */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Guru Yang Diobservasi">
          <Select
            id="teacherId"
            name="teacherId"
            required
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="" disabled>-- Pilih Guru --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subject} · {t.level})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal Observasi">
          <Input id="date" name="date" type="date" required defaultValue={toInputDate(new Date())} />
        </Field>

        <Field label="Mata Pelajaran">
          <Select
            id="subject"
            name="subject"
            required
            key={selectedTeacher?.subject}
            defaultValue={selectedTeacher?.subject ?? subjects[0]}
          >
            {selectedTeacher?.subject && !subjects.includes(selectedTeacher.subject) && (
              <option value={selectedTeacher.subject}>{selectedTeacher.subject}</option>
            )}
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Kelas & Rombel">
          <Input id="className" name="className" required defaultValue="7A" placeholder="Contoh: 7A, 8B, 9C" />
        </Field>
      </div>

      {/* 10 Aspek Observasi Kelas */}
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-sm font-black text-ink">
              10 Aspek Observasi Pedagogik Bilingual (Lampiran 4A)
            </h3>
            <p className="text-xs text-slate-500">
              Centang aspek yang terlaksana dengan baik selama proses pembelajaran di kelas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAll(true)}>
              Centang Semua
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAll(false)}>
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-2.5">
          {OBSERVATION_ITEMS.map((item, idx) => {
            const isChecked = checklist[idx];
            return (
              <button
                type="button"
                key={idx}
                onClick={() => toggleAspect(idx)}
                className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  isChecked
                    ? "border-emerald-200 bg-emerald-50/80 text-emerald-950 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition ${
                    isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}
                >
                  {isChecked && <Check className="size-3.5 stroke-[3]" />}
                </span>
                <span className="flex-1 text-sm font-semibold">
                  <span className="mr-1.5 font-bold text-slate-400">#{idx + 1}</span>
                  {item}
                </span>
                <span className={`text-xs font-extrabold ${isChecked ? "text-emerald-700" : "text-slate-400"}`}>
                  {isChecked ? "+10 Poin (Ya)" : "Tidak"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skor Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200/60 bg-gradient-to-r from-brand-50 to-white p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Skor Observasi Kelas</p>
            <p className="text-xs text-slate-500">
              {yesCount} dari 10 aspek terpenuhi · Rumus: (Ya ÷ 10) × 100
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-xl px-3 py-1 font-[family-name:var(--font-display)] text-2xl font-black ${
                score >= 80
                  ? "bg-emerald-100 text-emerald-800"
                  : score >= 60
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {score} / 100
            </span>
            <Pill
              tone={score >= 80 ? "success" : score >= 60 ? "warning" : "danger"}
            >
              {score >= 80 ? "Sangat Baik" : score >= 60 ? "Baik / Cukup" : "Perlu Pendampingan"}
            </Pill>
          </div>
        </div>
      </div>

      {/* Estimasi Proporsi Bahasa Inggris & Rekomendasi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Estimasi Proporsi Bahasa Inggris di Kelas"
          hint="Berdasarkan pengamatan durasi & konsistensi bicara guru"
        >
          <Select
            id="englishPctBucket"
            name="englishPctBucket"
            required
            value={englishBucket}
            onChange={(e) => setEnglishBucket(e.target.value)}
          >
            {ENGLISH_PCT_BUCKETS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.label} (estimasi tengah {b.mid}%)
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Rekomendasi Observer">
          <Select
            id="recommendation"
            name="recommendation"
            required
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          >
            {Object.entries(RECOMMENDATIONS).map(([k, label]) => (
              <option key={k} value={k}>
                {label} ({k})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Kekuatan & Area Perbaikan */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Kekuatan Guru (Strengths)"
          hint="Minimal 2 kekuatan / praktik baik guru yang teramati (min. 10 karakter)"
        >
          <Textarea
            id="strengths"
            name="strengths"
            required
            rows={3}
            placeholder="Contoh: Guru sangat percaya diri saat opening dan instruksi games jelas dipahami siswa..."
          />
        </Field>

        <Field
          label="Area Perbaikan (Areas for Improvement)"
          hint="Maksimal 3 catatan evaluasi atau saran pengembangan (min. 10 karakter)"
        >
          <Textarea
            id="improvements"
            name="improvements"
            required
            rows={3}
            placeholder="Contoh: Perlu memperbanyak variasi kalimat CFU (Checking for Understanding) dan mengurangi pengulangan terjemahan..."
          />
        </Field>
      </div>

      <Field label="Catatan Tambahan Rekomendasi (Opsional)">
        <Input
          id="recommendationNote"
          name="recommendationNote"
          placeholder="Contoh: Direkomendasikan mengikuti micro-teaching lanjutan pekan depan..."
        />
      </Field>

      <div className="flex justify-end pt-2">
        <SubmitButton>Simpan Hasil Observasi</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Modal Detail Hasil Observasi ─────────────
export function ObservationDetailModal({
  observation,
  onClose,
}: {
  observation: ObservationRecordItem;
  onClose: () => void;
}) {
  const checklist = parseJson<boolean[]>(observation.checklist, Array(10).fill(false));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="clay max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Pill tone="info">{observation.className}</Pill>
              <LevelBadge level={observation.teacher.ambassadorLevel as Level} />
              {observation.feedbackGiven ? (
                <Pill tone="success"><CheckCircle2 className="size-3.5" /> Diterima Guru</Pill>
              ) : (
                <Pill tone="warning">Menunggu Respon Guru</Pill>
              )}
            </div>
            <h3 className="mt-2 text-lg font-black text-ink">{observation.teacher.user.name}</h3>
            <p className="text-xs text-slate-500">
              {observation.subject} · Observer: {observation.observer.name} · {formatDate(observation.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Nilai & Proporsi */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Skor Observasi</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-brand-700">
                {observation.score} / 100
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Proporsi Bahasa Inggris</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-brand-700">
                {observation.englishPctBucket}%
              </p>
            </div>
          </div>

          {/* Checklist 10 Aspek */}
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Evaluasi 10 Aspek Pedagogik
            </h4>
            <div className="grid gap-1.5">
              {OBSERVATION_ITEMS.map((item, idx) => {
                const passed = checklist[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                      passed ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-slate-400" />
                    )}
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <span className="flex-1">{item}</span>
                    <span className="font-bold">{passed ? "Ya (10 pt)" : "Tidak"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-black uppercase text-emerald-800">Kekuatan Teramati (Strengths)</p>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{observation.strengths}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="text-xs font-black uppercase text-amber-800">Area Perbaikan (Improvements)</p>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{observation.improvements}</p>
            </div>
          </div>

          {/* Rekomendasi */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Rekomendasi Observer</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {RECOMMENDATIONS[observation.recommendation] ?? observation.recommendation}
            </p>
            {observation.recommendationNote && (
              <p className="mt-1 text-xs text-slate-600 italic">Catatan: &ldquo;{observation.recommendationNote}&rdquo;</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Riwayat Observasi List Component ─────────────
export function ObservationHistoryTable({
  records,
}: {
  records: ObservationRecordItem[];
}) {
  const [selectedObs, setSelectedObs] = useState<ObservationRecordItem | null>(null);

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Belum ada riwayat observasi kelas yang tersimpan.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Guru & Mapel</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4 text-center">Skor</th>
              <th className="py-3 px-4 text-center">% Inggris</th>
              <th className="py-3 px-4">Rekomendasi</th>
              <th className="py-3 px-4 text-center">Status Guru</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">
                  {formatDate(r.date)}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-ink">{r.teacher.user.name}</div>
                  <div className="text-xs text-slate-400">{r.subject}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-700">{r.className}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block rounded-lg px-2.5 py-0.5 text-xs font-black ${
                      r.score >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : r.score >= 60
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {r.score}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">
                  {r.englishPctBucket}%
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold text-slate-700">
                    {RECOMMENDATIONS[r.recommendation] ?? r.recommendation}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {r.feedbackGiven ? (
                    <Pill tone="success">Diterima</Pill>
                  ) : (
                    <Pill tone="warning">Menunggu</Pill>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedObs(r)}
                  >
                    <Eye className="size-3.5" /> Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedObs && (
        <ObservationDetailModal
          observation={selectedObs}
          onClose={() => setSelectedObs(null)}
        />
      )}
    </>
  );
}
