"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { deleteLessonPlan, saveLessonPlan } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { GlossaryModal } from "@/components/glossary-drawer";
import { Button, Card, CardBody, Field, Input, LevelBadge, Pill, Select, StatusPill, Textarea } from "@/components/ui";
import { CAMBRIDGE_SKILLS, SCHOOL_SUBJECTS, type Level } from "@/lib/program";
import { formatDate, parseJson, toInputDate } from "@/lib/utils";

export interface LessonPlanItem {
  id: string;
  title: string;
  subject: string;
  className: string;
  date: string;
  targetLevel: string;
  cambridgeSkills: string;
  objectives: string;
  englishSentences: string;
  vocabulary: string | null;
  opening: string;
  mainActivity: string;
  closing: string;
  assessmentPlan: string | null;
  postReflection: string | null;
  status: "DRAF" | "DIAJUKAN" | "DISETUJUI" | "REVISI";
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ───────────── Form Pembuat & Pengubah RPP ─────────────
export function LessonPlanEditor({
  initialPlan,
  defaultSubject,
  currentLevel,
  onCancel,
  availableSubjects,
}: {
  initialPlan?: LessonPlanItem | null;
  defaultSubject: string;
  currentLevel: Level;
  onCancel?: () => void;
  availableSubjects?: string[];
}) {
  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);
  const [sentences, setSentences] = useState(
    initialPlan?.englishSentences ??
      "Good morning, class! How are you doing today?\nPlease work together with your table partner for this task.\nDoes everyone understand the instructions?"
  );

  const initialSkills: string[] = initialPlan
    ? parseJson<string[]>(initialPlan.cambridgeSkills, [])
    : ["Speaking", "Use of English"];

  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [showGlossary, setShowGlossary] = useState(false);

  // Hitung jumlah baris kalimat Inggris non-kosong
  const sentenceList = sentences
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = sentenceList.length;
  const isSentencesValid = sentenceCount >= 3;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <ActionForm action={saveLessonPlan} resetOnSuccess={!initialPlan}>
      {initialPlan && <input type="hidden" name="id" value={initialPlan.id} />}

      {initialPlan?.status === "REVISI" && initialPlan.reviewNote && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900">
          <p className="flex items-center gap-1.5 font-bold text-rose-800">
            <AlertCircle className="size-4" /> Catatan Revisi dari Tim EDT:
          </p>
          <p className="mt-1 text-sm font-semibold">{initialPlan.reviewNote}</p>
          <p className="mt-1 text-xs text-rose-600">
            Perbaiki bagian yang diminta di bawah, lalu klik tombol &ldquo;Ajukan Ulang ke EDT&rdquo;.
          </p>
        </div>
      )}

      {/* Identitas Pembelajaran */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Mata Pelajaran">
          <Select
            id="subject"
            name="subject"
            required
            defaultValue={initialPlan?.subject ?? defaultSubject}
          >
            {initialPlan?.subject && !subjects.includes(initialPlan.subject) && (
              <option value={initialPlan.subject}>{initialPlan.subject}</option>
            )}
            {defaultSubject && !initialPlan?.subject && !subjects.includes(defaultSubject) && (
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
          <Input
            id="className"
            name="className"
            required
            defaultValue={initialPlan?.className ?? "7A"}
            placeholder="Contoh: 7A, 8B"
          />
        </Field>

        <Field label="Tanggal Pelaksanaan">
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={initialPlan ? toInputDate(initialPlan.date) : toInputDate(new Date())}
          />
        </Field>

        <Field label="Target Level Duta">
          <Select
            id="targetLevel"
            name="targetLevel"
            required
            defaultValue={initialPlan?.targetLevel ?? (currentLevel === "NONE" ? "BRONZE" : currentLevel)}
          >
            <option value="BRONZE">Bronze (Target 30% Inggris)</option>
            <option value="SILVER">Silver (Target 50% Inggris)</option>
            <option value="GOLD">Gold (Target 70% Inggris)</option>
          </Select>
        </Field>
      </div>

      <Field label="Judul / Topik Pembelajaran">
        <Input
          id="title"
          name="title"
          required
          defaultValue={initialPlan?.title ?? ""}
          placeholder="Contoh: Klasifikasi Makhluk Hidup & Ciri-Ciri Utama (Living Things)"
        />
      </Field>

      {/* Integrasi Cambridge Skills */}
      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Integrasi Cambridge Skills (Lampiran 11)
          </p>
          <span className="text-xs text-slate-400">Pilih keterampilan yang dilatihkan</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CAMBRIDGE_SKILLS.map((skill) => {
            const active = selectedSkills.includes(skill);
            return (
              <label
                key={skill}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  active
                    ? "border-brand-500 bg-brand-500 text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="cambridgeSkills"
                  value={skill}
                  checked={active}
                  onChange={() => toggleSkill(skill)}
                  className="sr-only"
                />
                <span
                  className={`size-3.5 rounded-full border flex items-center justify-center ${
                    active ? "border-white bg-white" : "border-slate-300"
                  }`}
                >
                  {active && <span className="size-1.5 rounded-full bg-brand-600" />}
                </span>
                <span>{skill}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Kalimat Bahasa Inggris (Minimal 3 Kalimat) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Target Kalimat Bahasa Inggris Guru di Kelas (Minimal 3 Kalimat)
          </label>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
              isSentencesValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {isSentencesValid ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            {sentenceCount} Kalimat {isSentencesValid ? "✓ Terpenuhi" : "(Kurang " + (3 - sentenceCount) + " lagi)"}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Tuliskan instruksi atau kalimat bahasa Inggris yang wajib diucapkan selama jam pelajaran. Tuliskan 1 kalimat per baris.
        </p>
        <Textarea
          id="englishSentences"
          name="englishSentences"
          required
          rows={4}
          value={sentences}
          onChange={(e) => setSentences(e.target.value)}
          placeholder={`Contoh:\n1. Good morning, class! Let's start with a short game.\n2. Please write your observations in your notebook.\n3. Can anyone explain the conclusion in English?`}
        />
      </div>

      {/* Tujuan Pembelajaran & Kosakata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tujuan Pembelajaran (Learning Objectives)"
          hint="Kompetensi yang diharapkan dicapai siswa"
        >
          <Textarea
            id="objectives"
            name="objectives"
            required
            rows={3}
            defaultValue={initialPlan?.objectives ?? ""}
            placeholder="Siswa dapat mengidentifikasi ciri-ciri makhluk hidup dan menyebutkan 5 istilah biologi dalam bahasa Inggris..."
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Kosakata Baru / Istilah Kunci (Key Vocabulary)
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowGlossary(true)}
              className="text-[11px] h-7 px-2.5"
            >
              <BookOpen className="size-3 text-brand-600" /> Glosarium 4 Mapel
            </Button>
          </div>
          <Textarea
            id="vocabulary"
            name="vocabulary"
            rows={3}
            defaultValue={initialPlan?.vocabulary ?? ""}
            placeholder="Organism (Organisme), Characteristics (Ciri-ciri), Growth (Pertumbuhan), Reproduction (Perkembangbiakan)..."
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Daftar kata EN - ID yang dipelajari siswa selama pertemuan ini
          </p>
        </div>
      </div>

      {/* Skenario Pembelajaran: Pembuka, Inti, Penutup */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Skenario Langkah Pembelajaran (Opening, Main Activity, Closing)
        </p>

        <Field
          label="1. Kegiatan Pembuka (Opening - ±10 Menit)"
          hint="Greeting, motivasi, apersepsi, target bahasa Inggris"
        >
          <Textarea
            id="opening"
            name="opening"
            required
            rows={3}
            defaultValue={initialPlan?.opening ?? ""}
            placeholder="Guru menyapa dengan English greeting, mengabsen siswa, dan mengulas materi pekan lalu..."
          />
        </Field>

        <Field
          label="2. Kegiatan Inti (Main Activity - ±60 Menit)"
          hint="Eksplorasi, diskusi kelompok, presentasi siswa, integrasi Cambridge skills"
        >
          <Textarea
            id="mainActivity"
            name="mainActivity"
            required
            rows={4}
            defaultValue={initialPlan?.mainActivity ?? ""}
            placeholder="Siswa berkelompok mengamati spesimen, mencatat lembar kerja bilingual, dan menjawab pertanyaan CFU guru..."
          />
        </Field>

        <Field
          label="3. Kegiatan Penutup (Closing - ±10 Menit)"
          hint="Refleksi singkat, feedback motivasi, doa penutup dalam bahasa Inggris"
        >
          <Textarea
            id="closing"
            name="closing"
            required
            rows={3}
            defaultValue={initialPlan?.closing ?? ""}
            placeholder="Guru meminta 2 siswa menyimpulkan materi, memberikan apresiasi 'Great job everyone!', dan menutup kelas..."
          />
        </Field>
      </div>

      {/* Rencana Asesmen / CFU */}
      <Field
        label="Rencana Penilaian & CFU (Checking for Understanding)"
        hint="Cara guru mengukur pemahaman siswa selama pembelajaran bilingual"
      >
        <Input
          id="assessmentPlan"
          name="assessmentPlan"
          defaultValue={initialPlan?.assessmentPlan ?? ""}
          placeholder="Contoh: Kuis lisan 3 menit, observasi keaktifan kelompok, dan lembar kerja exit ticket"
        />
      </Field>

      {/* Tombol Simpan / Ajukan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Batal
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            name="status"
            value="DRAF"
            variant="secondary"
          >
            Simpan Sebagai Draf
          </Button>

          <SubmitButton
            name="status"
            value="DIAJUKAN"
          >
            {initialPlan?.status === "REVISI" ? "Ajukan Ulang ke EDT" : "Ajukan RPP ke EDT"}
          </SubmitButton>
        </div>
      </div>
      <GlossaryModal isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
    </ActionForm>
  );
}

// ───────────── Daftar Tabel RPP Guru ─────────────
export function LessonPlanList({
  plans,
  onEdit,
}: {
  plans: LessonPlanItem[];
  onEdit: (plan: LessonPlanItem) => void;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [showGlossary, setShowGlossary] = useState(false);

  const filtered = plans.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "ALL", label: "Semua RPP", count: plans.length },
            { key: "DISETUJUI", label: "Disetujui", count: plans.filter((p) => p.status === "DISETUJUI").length },
            { key: "DIAJUKAN", label: "Menunggu Review", count: plans.filter((p) => p.status === "DIAJUKAN").length },
            { key: "REVISI", label: "Perlu Revisi", count: plans.filter((p) => p.status === "REVISI").length },
            { key: "DRAF", label: "Draf", count: plans.filter((p) => p.status === "DRAF").length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === tab.key
                  ? "bg-brand-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowGlossary(true)}
        >
          <BookOpen className="size-4 text-brand-600" /> Glosarium 4 Mapel (Bab 8.1)
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Tidak ada RPP yang sesuai dengan filter ini.
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((plan) => {
            const skills = parseJson<string[]>(plan.cambridgeSkills, []);
            const sentenceCount = plan.englishSentences
              .split("\n")
              .filter((s) => s.trim().length > 0).length;

            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-brand-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-500 text-xs">{plan.subject} · Kelas {plan.className}</span>
                      <LevelBadge level={plan.targetLevel as Level} />
                      <StatusPill status={plan.status} />
                      <Pill tone="info">
                        {sentenceCount} Kalimat Inggris
                      </Pill>
                    </div>
                    <h3 className="mt-1 text-base font-black text-ink">{plan.title}</h3>
                    <p className="text-xs text-slate-400">
                      Tanggal Pelaksanaan: {formatDate(plan.date)} · Terakhir Diperbarui: {formatDate(plan.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/guru/rpp/${plan.id}`}>
                      <Button variant="ghost" size="sm">
                        <Printer className="size-4" /> Cetak / Detail
                      </Button>
                    </Link>

                    {(plan.status === "DRAF" || plan.status === "REVISI") && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(plan)}
                        >
                          <Pencil className="size-4" /> Edit
                        </Button>

                        <form action={deleteLessonPlan}>
                          <input type="hidden" name="id" value={plan.id} />
                          <button
                            type="submit"
                            title="Hapus RPP"
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>

                {/* Cambridge Skills Tags */}
                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Catatan Review dari EDT jika ada */}
                {plan.reviewNote && (
                  <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-xs text-brand-900">
                    <span className="font-bold">Catatan Review EDT: </span>
                    <span>{plan.reviewNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GlossaryModal isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
    </div>
  );
}

// ───────────── Container Wrapper Client ─────────────
export function RppViewContainer({
  plans,
  defaultSubject,
  currentLevel,
  availableSubjects,
}: {
  plans: LessonPlanItem[];
  defaultSubject: string;
  currentLevel: Level;
  availableSubjects?: string[];
}) {
  const [editingPlan, setEditingPlan] = useState<LessonPlanItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const startEdit = (plan: LessonPlanItem) => {
    setEditingPlan(plan);
    setIsCreatingNew(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Tombol Buat RPP / Mode Form */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-black text-ink">
            {isCreatingNew
              ? editingPlan
                ? `Edit RPP: ${editingPlan.title}`
                : "Buat Rencana Pembelajaran Baru (RPP)"
              : "Daftar RPP Bilingual Anda"}
          </h2>
          <p className="text-xs text-slate-500">
            {isCreatingNew
              ? "Lengkapi komponen RPP bilingual sesuai format resmi Lampiran 11."
              : "Kelola dan pantau status persetujuan RPP bilingual oleh Tim EDT."}
          </p>
        </div>

        {!isCreatingNew && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingPlan(null);
              setIsCreatingNew(true);
            }}
          >
            <Plus className="size-4" /> Buat RPP Baru
          </Button>
        )}
      </div>

      {isCreatingNew ? (
        <Card>
          <CardBody>
            <LessonPlanEditor
              initialPlan={editingPlan}
              defaultSubject={defaultSubject}
              currentLevel={currentLevel}
              availableSubjects={availableSubjects}
              onCancel={handleCancel}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <LessonPlanList plans={plans} onEdit={startEdit} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
