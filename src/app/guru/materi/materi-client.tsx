"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookOpenText,
  Check,
  Copy,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Headphones,
  HelpCircle,
  Mic,
  PenTool,
  Pencil,
  Play,
  Plus,
  Radio,
  Save,
  Sparkles,
  Square,
  Trash2,
  Type,
  Volume2,
  X,
} from "lucide-react";
import { deleteMaterial, saveMaterial, saveQuiz } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { GlossaryModal } from "@/components/glossary-drawer";
import { Button, Card, CardBody, CardHeader, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { SCHOOL_SUBJECTS } from "@/lib/program";
import { DEFAULT_MATERIAL_CATEGORIES, type MaterialCategory } from "@/lib/settings";
import { cn, parseJson } from "@/lib/utils";
import { LISTENING_PLAY_LIMITS, speakText, ttsSupported, type TtsSpeed } from "@/lib/tts";
import { SpeedToggle } from "@/components/tts-speed";
import type { QuizQuestion, QuestionType } from "@/types/quiz";

export interface MaterialItem {
  id: string;
  title: string;
  category: string;
  subject: string | null;
  grade: number | null;
  cefrLevel: string;
  summary: string;
  content: string;
  vocabulary: string;
  published: boolean;
  authorName: string | null;
  quizzes: Array<{
    id: string;
    title: string;
    passScore: number;
    questions: string;
  }>;
}

// ───────────── Form Editor Materi ─────────────
export function MaterialEditor({
  initialMaterial,
  onCancel,
  availableSubjects,
  availableCategories,
}: {
  initialMaterial?: MaterialItem | null;
  onCancel?: () => void;
  availableSubjects?: string[];
  availableCategories?: MaterialCategory[];
}) {
  const categories =
    availableCategories && availableCategories.length > 0
      ? availableCategories.filter((c) => c.active)
      : DEFAULT_MATERIAL_CATEGORIES;

  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);

  type VocabPair = { en: string; id: string };
  const initialVocab: VocabPair[] = initialMaterial
    ? parseJson<VocabPair[]>(initialMaterial.vocabulary, [])
    : [
        { en: "Plant cell", id: "Sel tumbuhan" },
        { en: "Photosynthesis", id: "Fotosintesis" },
      ];

  const [vocabList, setVocabList] = useState<VocabPair[]>(initialVocab);
  const [showGlossary, setShowGlossary] = useState(false);

  const addVocabRow = () => {
    setVocabList((prev) => [...prev, { en: "", id: "" }]);
  };

  const removeVocabRow = (index: number) => {
    setVocabList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVocab = (index: number, key: "en" | "id", val: string) => {
    setVocabList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  return (
    <ActionForm action={saveMaterial} resetOnSuccess={!initialMaterial}>
      {initialMaterial && <input type="hidden" name="id" value={initialMaterial.id} />}
      <input type="hidden" name="vocabulary" value={JSON.stringify(vocabList.filter((v) => v.en.trim()))} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Kategori Materi">
          <Select
            name="category"
            defaultValue={initialMaterial?.category ?? categories[0]?.id ?? "Kosakata Mapel"}
          >
            {initialMaterial?.category &&
              !categories.some((c) => c.id === initialMaterial.category) && (
                <option value={initialMaterial.category}>{initialMaterial.category}</option>
              )}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Mata Pelajaran">
          <Select
            name="subject"
            defaultValue={initialMaterial?.subject ?? "Umum"}
          >
            {initialMaterial?.subject && !subjects.includes(initialMaterial.subject) && (
              <option value={initialMaterial.subject}>{initialMaterial.subject}</option>
            )}
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Target Jenjang Kelas">
          <Select name="grade" defaultValue={initialMaterial?.grade?.toString() ?? ""}>
            <option value="">Semua Jenjang Kelas</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </Select>
        </Field>

        <Field label="Level CEFR">
          <Select name="cefrLevel" defaultValue={initialMaterial?.cefrLevel ?? "A2"}>
            <option value="A1">A1 (Pemula)</option>
            <option value="A2">A2 (Dasar)</option>
            <option value="A2+">A2+ (Menengah Bawah)</option>
            <option value="B1">B1 (Menengah)</option>
            <option value="B1+">B1+ (Menengah Lanjutan)</option>
            <option value="B2">B2 (Mahir)</option>
          </Select>
        </Field>
      </div>

      <Field label="Judul Materi Pembelajaran">
        <Input
          name="title"
          required
          defaultValue={initialMaterial?.title ?? ""}
          placeholder="Contoh: Photosynthesis and Plant Cells (Fotosintesis dan Sel Tumbuhan)"
        />
      </Field>

      <Field label="Ringkasan Singkat (Summary)">
        <Input
          name="summary"
          required
          defaultValue={initialMaterial?.summary ?? ""}
          placeholder="Penjelasan singkat 1-2 kalimat tentang apa yang dipelajari siswa..."
        />
      </Field>

      <Field label="Isi Materi Pembelajaran (Teks / Markdown)">
        <Textarea
          name="content"
          required
          rows={6}
          defaultValue={initialMaterial?.content ?? ""}
          placeholder="Tuliskan isi materi pelajaran bilingual di sini..."
        />
      </Field>

      {/* Editor Kosakata Bilingual EN - ID */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            Daftar Kosakata Kunci (Vocabulary Box EN – ID)
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowGlossary(true)}
              className="text-xs"
            >
              <BookOpen className="size-3.5 text-brand-600" /> Glosarium 4 Mapel (Bab 8.1)
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addVocabRow}>
              <Plus className="size-3.5" /> Tambah Baris Kosakata
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {vocabList.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 text-center text-xs font-bold text-slate-400">#{idx + 1}</span>
              <Input
                value={v.en}
                onChange={(e) => updateVocab(idx, "en", e.target.value)}
                placeholder="Kata / Frasa Inggris (e.g. Chloroplast)"
                className="h-9 text-xs"
              />
              <span className="text-xs font-bold text-slate-400">→</span>
              <Input
                value={v.id}
                onChange={(e) => updateVocab(idx, "id", e.target.value)}
                placeholder="Arti Bahasa Indonesia (e.g. Kloroplas)"
                className="h-9 text-xs"
              />
              <button
                type="button"
                onClick={() => removeVocabRow(idx)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={initialMaterial ? initialMaterial.published : true}
            className="size-4 rounded-sm border-slate-300 text-brand-600"
          />
          <span>Publikasikan sekarang (dapat langsung dibaca oleh siswa)</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
        <SubmitButton>{initialMaterial ? "Perbarui Materi" : "Simpan & Terbitkan Materi"}</SubmitButton>
      </div>
      <GlossaryModal isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
    </ActionForm>
  );
}

// ───────────── Form Pembuat Kuis ─────────────
export function QuizEditor({
  materials,
  onCancel,
}: {
  materials: MaterialItem[];
  onCancel?: () => void;
}) {
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [testSpeed, setTestSpeed] = useState<TtsSpeed>("normal");
  const stopTestRef = useRef<(() => void) | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      type: "MULTIPLE_CHOICE",
      q: "What is the primary function of chlorophyll in plant cells?",
      options: [
        "To absorb sunlight for photosynthesis",
        "To protect plants from insects",
        "To store water inside the stem",
        "To produce seeds for reproduction",
      ],
      answer: 0,
    },
  ]);

  const addQuestion = (type: QuestionType = "MULTIPLE_CHOICE") => {
    if (type === "READING") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "READING",
          passageTitle: "How Plants Make Food",
          passage:
            "Plants are living things that can make their own food. This process is called photosynthesis. It happens mostly in the leaves. The leaves contain a green substance called chlorophyll, which absorbs sunlight. Plants also take in water from the soil through their roots and carbon dioxide from the air. With the energy from sunlight, they change water and carbon dioxide into glucose, a type of sugar. During this process, plants release oxygen into the air, which humans and animals need to breathe.",
          readingFormat: "MC",
          allowAudio: true,
          q: "According to the text, where does photosynthesis mostly happen?",
          options: ["In the roots", "In the leaves", "In the flowers", "In the soil"],
          answer: 1,
          fillInAnswer: "",
          acceptedAnswers: [],
        },
      ]);
    } else if (type === "SPEAKING") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "SPEAKING",
          speakingMode: "READ_ALOUD",
          q: "Read the sentence below aloud clearly.",
          targetText: "Plants use sunlight, water, and carbon dioxide to make their own food.",
          speakingAccent: "en-US",
          minWords: 10,
          targetKeywords: [],
          modelAnswer: "",
          options: [],
          answer: 0,
        },
      ]);
    } else if (type === "LISTENING") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "LISTENING",
          q: "Listen to the audio and choose the correct answer:",
          audioSourceType: "TTS",
          audioScript: "Good morning class. Today we are observing the behavior of water molecules when heat is applied.",
          audioVoice: "en-US",
          listeningFormat: "MC",
          allowSpeedChange: true,
          maxPlays: 0,
          options: [
            "The molecules move faster and spread apart",
            "The molecules freeze immediately",
            "The water turns into stone",
            "Nothing happens to the temperature",
          ],
          answer: 0,
          fillInAnswer: "",
        },
      ]);
    } else if (type === "WRITING") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "WRITING",
          q: "Based on the reading passage, explain in 2-3 sentences how plants produce their own food.",
          minWords: 15,
          targetKeywords: ["photosynthesis", "sunlight", "chlorophyll"],
          modelAnswer: "Plants produce food through photosynthesis. They use sunlight, water, and carbon dioxide trapped by chlorophyll to create glucose and oxygen.",
          options: [],
          answer: 0,
        },
      ]);
    } else if (type === "FILL_IN") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "FILL_IN",
          q: "Plants absorb water and nutrients from the soil through their .................... (roots / stem / leaves).",
          fillInAnswer: "roots",
          acceptedAnswers: ["root", "the roots"],
          caseSensitive: false,
          fillInHint: "Pilih salah satu: roots / stem / leaves",
          options: [],
          answer: 0,
        },
      ]);
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          type: "MULTIPLE_CHOICE",
          q: "",
          options: ["", "", "", ""],
          answer: 0,
        },
      ]);
    }
  };

  /** Tambah pertanyaan baru yang memakai teks bacaan yang sama dengan soal reading idx. */
  const addQuestionForSamePassage = (idx: number) => {
    setQuestions((prev) => {
      const src = prev[idx];
      const next = [...prev];
      next.splice(idx + 1, 0, {
        type: "READING",
        passageTitle: src.passageTitle ?? "",
        passage: src.passage ?? "",
        readingFormat: "MC",
        allowAudio: src.allowAudio ?? true,
        q: "",
        options: ["", "", "", ""],
        answer: 0,
        fillInAnswer: "",
        acceptedAnswers: [],
      });
      return next;
    });
  };

  const removeQuestion = (idx: number) => {
    if (playingIdx === idx) {
      stopTestRef.current?.();
      setPlayingIdx(null);
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const changeQuestionType = (idx: number, newType: QuestionType) => {
    setQuestions((prev) => {
      const next = [...prev];
      const cur = next[idx];
      if (newType === "READING") {
        next[idx] = {
          ...cur,
          type: "READING",
          passageTitle: cur.passageTitle ?? "",
          passage: cur.passage ?? "",
          readingFormat: cur.readingFormat ?? "MC",
          allowAudio: cur.allowAudio ?? true,
          options: cur.options && cur.options.length === 4 ? cur.options : ["", "", "", ""],
          answer: cur.answer ?? 0,
          fillInAnswer: cur.fillInAnswer ?? "",
          acceptedAnswers: cur.acceptedAnswers ?? [],
        };
      } else if (newType === "SPEAKING") {
        next[idx] = {
          ...cur,
          type: "SPEAKING",
          speakingMode: cur.speakingMode ?? "READ_ALOUD",
          targetText: cur.targetText ?? "",
          speakingAccent: cur.speakingAccent ?? "en-US",
          minWords: cur.minWords ?? 10,
          targetKeywords: cur.targetKeywords ?? [],
          modelAnswer: cur.modelAnswer ?? "",
          options: [],
          answer: 0,
        };
      } else if (newType === "LISTENING") {
        next[idx] = {
          ...cur,
          type: "LISTENING",
          audioSourceType: cur.audioSourceType ?? "TTS",
          audioScript: cur.audioScript ?? "Hello students, please listen to this explanation carefully.",
          audioVoice: cur.audioVoice ?? "en-US",
          listeningFormat: cur.listeningFormat ?? "MC",
          allowSpeedChange: cur.allowSpeedChange ?? true,
          maxPlays: cur.maxPlays ?? 0,
          options: cur.options && cur.options.length === 4 ? cur.options : ["", "", "", ""],
          answer: cur.answer ?? 0,
          fillInAnswer: cur.fillInAnswer ?? "",
        };
      } else if (newType === "WRITING") {
        next[idx] = {
          ...cur,
          type: "WRITING",
          minWords: cur.minWords ?? 15,
          targetKeywords: cur.targetKeywords ?? [],
          modelAnswer: cur.modelAnswer ?? "",
          options: [],
          answer: 0,
        };
      } else if (newType === "FILL_IN") {
        next[idx] = {
          ...cur,
          type: "FILL_IN",
          fillInAnswer: cur.fillInAnswer ?? "",
          acceptedAnswers: cur.acceptedAnswers ?? [],
          caseSensitive: cur.caseSensitive ?? false,
          fillInHint: cur.fillInHint ?? "",
          options: [],
          answer: 0,
        };
      } else {
        next[idx] = {
          ...cur,
          type: "MULTIPLE_CHOICE",
          options: cur.options && cur.options.length === 4 ? cur.options : ["", "", "", ""],
          answer: cur.answer ?? 0,
        };
      }
      return next;
    });
  };

  const updateQuestionField = <K extends keyof QuizQuestion>(idx: number, field: K, val: QuizQuestion[K]) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...(next[qIdx].options || ["", "", "", ""])];
      opts[optIdx] = text;
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });
  };

  const handleTestAudio = (idx: number, text: string, voice: "en-US" | "en-GB" = "en-US") => {
    if (!ttsSupported()) {
      alert("Browser Anda tidak mendukung fitur Text-to-Speech.");
      return;
    }
    if (playingIdx === idx) {
      stopTestRef.current?.();
      return;
    }
    if (!text.trim()) {
      alert("Tuliskan naskah audio terlebih dahulu sebelum menguji dengar.");
      return;
    }
    stopTestRef.current?.();
    setPlayingIdx(idx);
    stopTestRef.current = speakText(text, {
      lang: voice,
      speed: testSpeed,
      onEnd: () => setPlayingIdx((cur) => (cur === idx ? null : cur)),
    });
  };

  const changeTestSpeed = (next: TtsSpeed) => {
    setTestSpeed(next);
    stopTestRef.current?.();
  };

  const mcCount = questions.filter((q) => !q.type || q.type === "MULTIPLE_CHOICE").length;
  const readingCount = questions.filter((q) => q.type === "READING").length;
  const listeningCount = questions.filter((q) => q.type === "LISTENING").length;
  const speakingCount = questions.filter((q) => q.type === "SPEAKING").length;
  const writingCount = questions.filter((q) => q.type === "WRITING").length;
  const fillInCount = questions.filter((q) => q.type === "FILL_IN").length;

  return (
    <ActionForm action={saveQuiz} resetOnSuccess>
      <input type="hidden" name="materialId" value={materialId} />
      <input type="hidden" name="questions" value={JSON.stringify(questions)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Pilih Materi Target">
          <Select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.subject ?? "Umum"} · {m.cefrLevel})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Judul Kuis">
          <Input
            name="title"
            required
            defaultValue="Kuis Interaktif Pemahaman Materi"
            placeholder="Contoh: Kuis Cek Pemahaman Bab 1"
          />
        </Field>

        <Field label="Batas Nilai Kelulusan (Pass Score)">
          <Input name="passScore" type="number" min={50} max={100} defaultValue={70} />
        </Field>
      </div>

      {/* Daftar Pertanyaan Kuis */}
      <div className="space-y-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-800">
              Butir Soal Latihan ({questions.length} Pertanyaan)
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 text-brand-700 font-bold">
                <Radio className="size-3" /> {mcCount} Pilihan Ganda
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-sky-700 font-bold">
                <BookOpenText className="size-3" /> {readingCount} Reading
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-purple-700 font-bold">
                <Headphones className="size-3" /> {listeningCount} Listening
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-pink-700 font-bold">
                <Mic className="size-3" /> {speakingCount} Speaking
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <PenTool className="size-3" /> {writingCount} Writing
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                <Type className="size-3" /> {fillInCount} Isian Singkat
              </span>
            </div>
          </div>

          {/* Tombol Tambah Soal per Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addQuestion("MULTIPLE_CHOICE")}
              className="rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="size-3.5" /> + Pilihan Ganda
            </button>
            <button
              type="button"
              onClick={() => addQuestion("READING")}
              className="rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <BookOpenText className="size-3.5" /> + Soal Reading
            </button>
            <button
              type="button"
              onClick={() => addQuestion("LISTENING")}
              className="rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Headphones className="size-3.5" /> + Soal Listening
            </button>
            <button
              type="button"
              onClick={() => addQuestion("SPEAKING")}
              className="rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Mic className="size-3.5" /> + Soal Speaking
            </button>
            <button
              type="button"
              onClick={() => addQuestion("WRITING")}
              className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <PenTool className="size-3.5" /> + Soal Writing
            </button>
            <button
              type="button"
              onClick={() => addQuestion("FILL_IN")}
              className="rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Type className="size-3.5" /> + Soal Isian
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q, qIdx) => {
            const qType: QuestionType = q.type || "MULTIPLE_CHOICE";

            return (
              <div
                key={qIdx}
                className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition ${
                  qType === "READING"
                    ? "border-sky-200 bg-sky-50/25"
                    : qType === "SPEAKING"
                    ? "border-pink-200 bg-pink-50/25"
                    : qType === "LISTENING"
                    ? "border-purple-200 bg-purple-50/25"
                    : qType === "WRITING"
                    ? "border-emerald-200 bg-emerald-50/25"
                    : qType === "FILL_IN"
                    ? "border-amber-200 bg-amber-50/25"
                    : "border-slate-200 bg-slate-50/40"
                }`}
              >
                {/* Header Butir Soal: Nomor, Tipe, Ganti Tipe, Hapus */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Pertanyaan #{qIdx + 1}
                    </span>

                    {/* Badge Tipe */}
                    {qType === "READING" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-200">
                        <BookOpenText className="size-3 text-sky-600" /> Reading (Membaca)
                      </span>
                    ) : qType === "SPEAKING" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-[11px] font-bold text-pink-800 border border-pink-200">
                        <Mic className="size-3 text-pink-600" /> Speaking (Berbicara)
                      </span>
                    ) : qType === "LISTENING" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200">
                        <Headphones className="size-3 text-purple-600" /> Listening (Menyimak)
                      </span>
                    ) : qType === "WRITING" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        <PenTool className="size-3 text-emerald-600" /> Writing (Tugas Menulis)
                      </span>
                    ) : qType === "FILL_IN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                        <Type className="size-3 text-amber-600" /> Isian Singkat (Fill-in)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-800 border border-brand-200">
                        <Radio className="size-3 text-brand-600" /> Pilihan Ganda
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-medium hidden sm:inline">Ubah Tipe:</span>
                      <select
                        value={qType}
                        onChange={(e) => changeQuestionType(qIdx, e.target.value as QuestionType)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-brand-500"
                      >
                        <option value="MULTIPLE_CHOICE">🔘 Pilihan Ganda</option>
                        <option value="READING">📖 Reading (Membaca)</option>
                        <option value="LISTENING">🎧 Listening (Audio)</option>
                        <option value="SPEAKING">🎤 Speaking (Berbicara)</option>
                        <option value="WRITING">✍️ Writing (Menulis)</option>
                        <option value="FILL_IN">📝 Isian Singkat (Fill-in)</option>
                      </select>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="size-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* ───────────── FORM SPESIFIK TIPE READING ───────────── */}
                {qType === "READING" && (
                  <div className="space-y-3.5 rounded-xl border border-sky-200 bg-white p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-2.5">
                      <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                        <BookOpenText className="size-4 text-sky-600" />
                        Teks Bacaan (Reading Passage):
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {(q.passage || "").split(/\s+/).filter(Boolean).length} kata
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Judul Bacaan (opsional):</label>
                      <Input
                        value={q.passageTitle || ""}
                        onChange={(e) => updateQuestionField(qIdx, "passageTitle", e.target.value)}
                        placeholder="misal: How Plants Make Food"
                        className="bg-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Isi Teks Bacaan Bahasa Inggris: <span className="text-rose-500">*</span>
                      </label>
                      <Textarea
                        rows={6}
                        value={q.passage || ""}
                        onChange={(e) => updateQuestionField(qIdx, "passage", e.target.value)}
                        placeholder="Tempelkan atau tulis teks bacaan (paragraf, dialog, pengumuman, cerita pendek) yang harus dibaca siswa..."
                        className="bg-white text-xs leading-relaxed font-sans"
                      />
                      <p className="text-[11px] text-sky-700">
                        💡 Pisahkan paragraf dengan baris kosong. Siswa membaca teks ini sebelum menjawab pertanyaan.
                      </p>
                    </div>

                    {/* Format Jawaban Reading */}
                    <div className="pt-2 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">Format Jawaban Siswa:</span>
                      <div className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                          <input
                            type="radio"
                            name={`readingFormat_${qIdx}`}
                            checked={q.readingFormat !== "FILL_IN"}
                            onChange={() => updateQuestionField(qIdx, "readingFormat", "MC")}
                            className="accent-sky-600"
                          />
                          Pilihan Ganda (A-D)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 ml-2">
                          <input
                            type="radio"
                            name={`readingFormat_${qIdx}`}
                            checked={q.readingFormat === "FILL_IN"}
                            onChange={() => updateQuestionField(qIdx, "readingFormat", "FILL_IN")}
                            className="accent-sky-600"
                          />
                          Isian Singkat
                        </label>
                      </div>
                    </div>

                    {/* Izinkan suara pada teks bacaan */}
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border-t border-sky-100 pt-2.5">
                      <input
                        type="checkbox"
                        checked={q.allowAudio !== false}
                        onChange={(e) => updateQuestionField(qIdx, "allowAudio", e.target.checked)}
                        className="mt-0.5 size-4 accent-sky-600"
                      />
                      <span>
                        <span className="block text-xs font-bold text-slate-700">
                          Izinkan siswa mendengarkan teks bacaan (suara)
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {q.allowAudio !== false
                            ? "Siswa bisa menekan Dengar dan memilih kecepatan. Cocok untuk siswa pemula."
                            : "Suara dimatikan: siswa harus membaca sendiri. Cocok untuk menguji kemampuan membaca."}
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                {/* ───────────── FORM SPESIFIK TIPE LISTENING ───────────── */}
                {qType === "LISTENING" && (
                  <div className="space-y-3.5 rounded-xl border border-purple-200 bg-white p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Volume2 className="size-4 text-purple-600" />
                        Sumber Audio Listening:
                      </span>

                      {/* Switcher TTS vs File URL */}
                      <div className="flex items-center gap-1 rounded-lg bg-purple-50 p-1 border border-purple-200 text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuestionField(qIdx, "audioSourceType", "TTS")}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            q.audioSourceType !== "URL"
                              ? "bg-purple-600 text-white shadow-2xs"
                              : "text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          🎙️ Naskah Suara (TTS Otomatis)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuestionField(qIdx, "audioSourceType", "URL")}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                            q.audioSourceType === "URL"
                              ? "bg-purple-600 text-white shadow-2xs"
                              : "text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          🔗 Link File MP3
                        </button>
                      </div>
                    </div>

                    {q.audioSourceType === "URL" ? (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Link URL File Audio (MP3 / Direct Audio):</label>
                        <Input
                          value={q.audioUrl || ""}
                          onChange={(e) => updateQuestionField(qIdx, "audioUrl", e.target.value)}
                          placeholder="misal: https://domain-sekolah.sch.id/audio/unit1-dialogue.mp3"
                          className="bg-white text-xs"
                        />
                        <p className="text-[11px] text-slate-500">
                          Siswa akan mendengarkan pemutar audio dari link ini sebelum menjawab soal.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-700">
                            Naskah Narasi / Dialog Bahasa Inggris (Otomatis Dibacakan Native Voice):
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={q.audioVoice || "en-US"}
                              onChange={(e) => updateQuestionField(qIdx, "audioVoice", e.target.value as any)}
                              className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-800"
                            >
                              <option value="en-US">Aksen US (American)</option>
                              <option value="en-GB">Aksen UK (British)</option>
                            </select>
                            <SpeedToggle value={testSpeed} onChange={changeTestSpeed} />
                            <button
                              type="button"
                              onClick={() => handleTestAudio(qIdx, q.audioScript || "", q.audioVoice || "en-US")}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                                playingIdx === qIdx
                                  ? "bg-rose-600 text-white animate-pulse"
                                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-2xs"
                              }`}
                            >
                              {playingIdx === qIdx ? (
                                <>
                                  <Square className="size-3" /> Berhenti
                                </>
                              ) : (
                                <>
                                  <Play className="size-3" /> 🔊 Uji Dengar (TTS)
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <Textarea
                          rows={3}
                          value={q.audioScript || ""}
                          onChange={(e) => updateQuestionField(qIdx, "audioScript", e.target.value)}
                          placeholder="Tuliskan teks percakapan atau bacaan sains yang akan didengarkan siswa..."
                          className="bg-white text-xs font-sans"
                        />
                        <p className="text-[11px] text-purple-700">
                          💡 <em>Teknologi Text-to-Speech bawaan browser akan melafalkan naskah di atas dengan intonasi natural untuk siswa tanpa memerlukan rekaman terpisah.</em>
                        </p>
                      </div>
                    )}

                    {/* Format Jawaban Listening */}
                    <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Format Jawaban Siswa:</span>
                      <div className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                          <input
                            type="radio"
                            name={`listeningFormat_${qIdx}`}
                            checked={q.listeningFormat !== "FILL_IN"}
                            onChange={() => updateQuestionField(qIdx, "listeningFormat", "MC")}
                            className="accent-purple-600"
                          />
                          Pilihan Ganda (A-D)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 ml-2">
                          <input
                            type="radio"
                            name={`listeningFormat_${qIdx}`}
                            checked={q.listeningFormat === "FILL_IN"}
                            onChange={() => updateQuestionField(qIdx, "listeningFormat", "FILL_IN")}
                            className="accent-purple-600"
                          />
                          Isian Dikte (Listen & Type)
                        </label>
                      </div>
                    </div>

                    {/* Pengaturan bantuan suara untuk siswa */}
                    <div className="grid gap-3 border-t border-purple-100 pt-2.5 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={q.allowSpeedChange !== false}
                          onChange={(e) => updateQuestionField(qIdx, "allowSpeedChange", e.target.checked)}
                          className="mt-0.5 size-4 accent-purple-600"
                        />
                        <span>
                          <span className="block text-xs font-bold text-slate-700">Izinkan siswa memilih kecepatan</span>
                          <span className="block text-[11px] text-slate-500">
                            {q.allowSpeedChange !== false
                              ? "Siswa boleh memakai Lambat / Lebih lambat."
                              : "Terkunci di kecepatan Normal, seperti ujian listening."}
                          </span>
                        </span>
                      </label>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Batas jumlah putar audio:</label>
                        <select
                          value={q.maxPlays ?? 0}
                          onChange={(e) => updateQuestionField(qIdx, "maxPlays", Number(e.target.value))}
                          className="rounded-lg border border-purple-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          {LISTENING_PLAY_LIMITS.map((n) => (
                            <option key={n} value={n}>
                              {n === 0 ? "Tidak terbatas" : `Maksimal ${n}× putar`}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500">Ujian listening resmi biasanya memutar audio 2 kali.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ───────────── TEKS PERTANYAAN (UNTUK SEMUA TIPE) ───────────── */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {qType === "WRITING"
                      ? "Instruksi / Topik Tugas Menulis (Prompt):"
                      : qType === "SPEAKING"
                      ? q.speakingMode === "RESPOND"
                        ? "Pertanyaan yang Dijawab Siswa secara Lisan:"
                        : "Instruksi untuk Siswa:"
                      : qType === "READING"
                      ? "Pertanyaan Pemahaman Bacaan (Reading Comprehension Question):"
                      : qType === "LISTENING"
                      ? "Pertanyaan Menyimak (Comprehension Question):"
                      : qType === "FILL_IN"
                      ? "Kalimat Soal / Teks Rumpang (Fill-in Question):"
                      : "Kalimat Pertanyaan (Question):"}
                  </label>
                  <Input
                    value={q.q}
                    onChange={(e) => updateQuestionField(qIdx, "q", e.target.value)}
                    placeholder={
                      qType === "WRITING"
                        ? "misal: Write a paragraph explaining how plants absorb water from the soil..."
                        : qType === "SPEAKING"
                        ? q.speakingMode === "RESPOND"
                          ? "misal: Tell me about your favorite subject and why you like it."
                          : "misal: Read the sentence below aloud clearly."
                        : qType === "READING"
                        ? "misal: According to the text, what do plants release during photosynthesis?"
                        : qType === "LISTENING"
                        ? "misal: Based on the audio, what happened to the temperature of the liquid?"
                        : qType === "FILL_IN"
                        ? "misal: Plants absorb water from the soil through their .................... (roots / stem / leaves)"
                        : "Tuliskan pertanyaan dalam bahasa Inggris..."
                    }
                    className="bg-white font-medium"
                    required
                  />
                </div>

                {/* ───────────── PILIHAN JAWABAN (JIKA MC ATAU LISTENING MC) ───────────── */}
                {(qType === "MULTIPLE_CHOICE" ||
                  (qType === "LISTENING" && q.listeningFormat !== "FILL_IN") ||
                  (qType === "READING" && q.readingFormat !== "FILL_IN")) && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Pilihan Jawaban (A – D):</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(q.options || ["", "", "", ""]).map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 rounded-xl p-2 border transition ${
                            q.answer === optIdx
                              ? "bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-300"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`answer_${qIdx}`}
                            checked={q.answer === optIdx}
                            onChange={() => updateQuestionField(qIdx, "answer", optIdx)}
                            className="size-4 text-emerald-600 accent-emerald-600"
                          />
                          <span
                            className={`text-xs font-bold ${
                              q.answer === optIdx ? "text-emerald-800" : "text-slate-400"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full text-xs font-medium text-ink focus:outline-hidden bg-transparent"
                            required
                          />
                          {q.answer === optIdx && (
                            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shrink-0">
                              Kunci
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      *Klik radio button pada opsi yang merupakan <span className="font-bold text-emerald-700">kunci jawaban benar</span>.
                    </p>
                  </div>
                )}

                {/* ───────────── ISIAN DIKTE (JIKA LISTENING FORMAT FILL_IN) ───────────── */}
                {qType === "LISTENING" && q.listeningFormat === "FILL_IN" && (
                  <div className="space-y-1.5 rounded-xl border border-purple-200 bg-white p-3.5">
                    <label className="text-xs font-bold text-purple-900 block">
                      Kunci Jawaban Kata / Frasa yang Harus Diketik Siswa:
                    </label>
                    <Input
                      value={q.fillInAnswer || ""}
                      onChange={(e) => updateQuestionField(qIdx, "fillInAnswer", e.target.value)}
                      placeholder="misal: photosynthesis (pemeriksaan bersifat tidak membedakan huruf besar/kecil)"
                      className="bg-white text-xs font-mono font-bold text-emerald-700"
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Siswa akan mendengarkan rekaman dan mengetikkan kata ini secara tepat.
                    </p>
                  </div>
                )}

                {/* ───────────── KUNCI ISIAN (JIKA READING FORMAT FILL_IN) ───────────── */}
                {qType === "READING" && q.readingFormat === "FILL_IN" && (
                  <div className="grid gap-3 rounded-xl border border-sky-200 bg-white p-3.5 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-sky-900 block">
                        Kunci Jawaban Utama: <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={q.fillInAnswer || ""}
                        onChange={(e) => updateQuestionField(qIdx, "fillInAnswer", e.target.value)}
                        placeholder="misal: oxygen"
                        className="bg-white text-xs font-mono font-bold text-emerald-700"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Variasi Jawaban Diterima (opsional):</label>
                      <Input
                        value={(q.acceptedAnswers || []).join(", ")}
                        onChange={(e) =>
                          updateQuestionField(
                            qIdx,
                            "acceptedAnswers",
                            e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                          )
                        }
                        placeholder="misal: O2, the oxygen (pisahkan koma)"
                        className="bg-white text-xs font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 sm:col-span-2">
                      Jawaban siswa dicocokkan tanpa membedakan huruf besar/kecil.
                    </p>
                  </div>
                )}

                {qType === "READING" && (
                  <button
                    type="button"
                    onClick={() => addQuestionForSamePassage(qIdx)}
                    className="rounded-xl border border-dashed border-sky-300 bg-white hover:bg-sky-50 text-sky-800 px-3 py-2 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Copy className="size-3.5" /> + Pertanyaan lain untuk teks bacaan ini
                  </button>
                )}

                {/* ───────────── FORM SPESIFIK TIPE SPEAKING ───────────── */}
                {qType === "SPEAKING" && (
                  <div className="space-y-3.5 rounded-xl border border-pink-200 bg-white p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-2.5">
                      <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                        <Mic className="size-4 text-pink-600" />
                        Jenis Tugas Berbicara:
                      </span>
                      <div className="flex items-center gap-1 rounded-lg bg-pink-50 p-1 border border-pink-200 text-xs">
                        {([
                          ["READ_ALOUD", "📢 Baca Nyaring (Read Aloud)"],
                          ["RESPOND", "💬 Jawab Lisan (Respond)"],
                        ] as const).map(([mode, label]) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateQuestionField(qIdx, "speakingMode", mode)}
                            className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                              (q.speakingMode ?? "READ_ALOUD") === mode
                                ? "bg-pink-600 text-white shadow-2xs"
                                : "text-pink-700 hover:bg-pink-100"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {q.speakingMode !== "RESPOND" ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-700">
                            Kalimat yang Harus Diucapkan Siswa: <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={q.speakingAccent || "en-US"}
                              onChange={(e) => updateQuestionField(qIdx, "speakingAccent", e.target.value as "en-US" | "en-GB")}
                              className="rounded-md border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-bold text-pink-800"
                            >
                              <option value="en-US">Aksen US</option>
                              <option value="en-GB">Aksen UK</option>
                            </select>
                            <SpeedToggle value={testSpeed} onChange={changeTestSpeed} accent="pink" />
                            <button
                              type="button"
                              onClick={() => handleTestAudio(qIdx, q.targetText || "", q.speakingAccent || "en-US")}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                                playingIdx === qIdx ? "bg-rose-600 text-white animate-pulse" : "bg-pink-600 text-white hover:bg-pink-700 shadow-2xs"
                              }`}
                            >
                              {playingIdx === qIdx ? (<><Square className="size-3" /> Berhenti</>) : (<><Play className="size-3" /> Dengar Contoh</>)}
                            </button>
                          </div>
                        </div>
                        <Textarea
                          rows={2}
                          value={q.targetText || ""}
                          onChange={(e) => updateQuestionField(qIdx, "targetText", e.target.value)}
                          placeholder="misal: Plants use sunlight, water, and carbon dioxide to make their own food."
                          className="bg-white text-xs"
                        />
                        <p className="text-[11px] text-pink-700">
                          💡 Siswa bisa mendengar contoh pelafalan, lalu membaca kalimat ini ke mikrofon. Nilai = persentase kata yang terucap benar dan berurutan (≥ 85% dianggap benar penuh).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Jumlah Kata Minimal yang Diucapkan:</label>
                            <Input
                              type="number"
                              min={3}
                              max={150}
                              value={q.minWords || 10}
                              onChange={(e) => updateQuestionField(qIdx, "minWords", Number(e.target.value || 10))}
                              className="bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Kosakata Kunci yang Diharapkan:</label>
                            <Input
                              value={(q.targetKeywords || []).join(", ")}
                              onChange={(e) =>
                                updateQuestionField(qIdx, "targetKeywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))
                              }
                              placeholder="misal: science, experiment, because (pisahkan koma)"
                              className="bg-white text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Contoh Jawaban Ideal (acuan guru, opsional):</label>
                          <Textarea
                            rows={2}
                            value={q.modelAnswer || ""}
                            onChange={(e) => updateQuestionField(qIdx, "modelAnswer", e.target.value)}
                            placeholder="misal: My favorite subject is science because I like doing experiments..."
                            className="bg-white text-xs"
                          />
                        </div>
                        <p className="text-[11px] text-pink-700">
                          💡 Nilai dihitung seperti Writing: 50% dari tercapainya jumlah kata minimal, 50% dari kata kunci yang terucap.
                        </p>
                      </div>
                    )}
                    <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
                      Siswa butuh mikrofon dan browser Google Chrome atau Microsoft Edge. Ucapan diubah menjadi teks oleh fitur pengenalan suara browser. Jawaban yang diketik (bukan diucapkan) dinilai 0.
                    </p>
                  </div>
                )}

                {/* ───────────── FORM SPESIFIK TIPE WRITING ───────────── */}
                {qType === "WRITING" && (
                  <div className="space-y-3.5 rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Jumlah Kata Minimal:</label>
                        <Input
                          type="number"
                          min={5}
                          max={200}
                          value={q.minWords || 15}
                          onChange={(e) => updateQuestionField(qIdx, "minWords", Number(e.target.value || 15))}
                          className="bg-white text-xs"
                        />
                        <p className="text-[10px] text-slate-500">
                          Siswa diarahkan menulis minimal sejumlah kata ini.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Kosakata Kunci Wajib (Target Keywords):
                        </label>
                        <Input
                          value={(q.targetKeywords || []).join(", ")}
                          onChange={(e) =>
                            updateQuestionField(
                              qIdx,
                              "targetKeywords",
                              e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                            )
                          }
                          placeholder="misal: chlorophyll, sunlight, glucose (pisahkan koma)"
                          className="bg-white text-xs"
                        />
                        <p className="text-[10px] text-slate-500">
                          Sistem akan memverifikasi kehadiran kata-kata ini saat siswa mengumpulkan esai.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Contoh Respon Ideal / Rubrik Acuan Guru (Model Answer):
                      </label>
                      <Textarea
                        rows={2}
                        value={q.modelAnswer || ""}
                        onChange={(e) => updateQuestionField(qIdx, "modelAnswer", e.target.value)}
                        placeholder="Tuliskan contoh jawaban esai ideal dalam bahasa Inggris untuk acuan penilaian..."
                        className="bg-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* ───────────── FORM SPESIFIK TIPE ISIAN SINGKAT (FILL_IN) ───────────── */}
                {qType === "FILL_IN" && (
                  <div className="space-y-3.5 rounded-xl border border-amber-200 bg-white p-4 shadow-2xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                          Kunci Jawaban Utama (Wajib):
                          <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          value={q.fillInAnswer || ""}
                          onChange={(e) => updateQuestionField(qIdx, "fillInAnswer", e.target.value)}
                          placeholder="misal: roots (kata/frasa yang benar)"
                          className="bg-white text-xs font-mono font-bold text-emerald-800"
                          required
                        />
                        <p className="text-[10px] text-slate-500">
                          Kata atau frasa yang diharapkan diketik oleh siswa pada kalimat rumpang.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Variasi Jawaban Diterima (Alternatif Opsional):
                        </label>
                        <Input
                          value={(q.acceptedAnswers || []).join(", ")}
                          onChange={(e) =>
                            updateQuestionField(
                              qIdx,
                              "acceptedAnswers",
                              e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                            )
                          }
                          placeholder="misal: root, the roots (pisahkan koma)"
                          className="bg-white text-xs font-mono"
                        />
                        <p className="text-[10px] text-slate-500">
                          Alternatif sinonim/variasi penulisan lain yang tetap dinilai 100% benar.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-amber-100">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          Petunjuk Pengisian untuk Siswa (Hint - Opsional):
                        </label>
                        <Input
                          value={q.fillInHint || ""}
                          onChange={(e) => updateQuestionField(qIdx, "fillInHint", e.target.value)}
                          placeholder="misal: Pilih salah satu: roots / stem / leaves, atau 1 kata"
                          className="bg-white text-xs"
                        />
                        <p className="text-[10px] text-slate-500">
                          Akan muncul sebagai bantuan petunjuk di bawah soal pada lembar siswa.
                        </p>
                      </div>

                      <div className="flex items-center pt-4 sm:pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(q.caseSensitive)}
                            onChange={(e) => updateQuestionField(qIdx, "caseSensitive", e.target.checked)}
                            className="rounded text-amber-600 size-4 accent-amber-600"
                          />
                          <span>Pencocokan Sensitif Huruf Besar/Kecil (Case-Sensitive)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
        <SubmitButton>Simpan Kuis</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Komponen Utama Kelola Materi ─────────────
export function MaterialManagementView({
  materials,
  availableSubjects,
  availableCategories,
}: {
  materials: MaterialItem[];
  availableSubjects?: string[];
  availableCategories?: MaterialCategory[];
}) {
  const [mode, setMode] = useState<"LIST" | "NEW_MAT" | "EDIT_MAT" | "NEW_QUIZ">("LIST");
  const [selectedMaterialForEdit, setSelectedMaterialForEdit] = useState<MaterialItem | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);

  const startEdit = (mat: MaterialItem) => {
    setSelectedMaterialForEdit(mat);
    setMode("EDIT_MAT");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-black text-ink">
            Pustaka Materi & Kuis Interaktif Siswa
          </h3>
          <p className="text-xs text-slate-500">
            Kelola bahan ajar bacaan bilingual dan buat kuis latihan mandiri untuk siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode !== "LIST" ? (
            <Button variant="ghost" onClick={() => setMode("LIST")}>
              Kembali ke Daftar
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setMode("NEW_QUIZ")}>
                <HelpCircle className="size-4" /> Buat Kuis Baru
              </Button>
              <Button variant="primary" onClick={() => setMode("NEW_MAT")}>
                <Plus className="size-4" /> Tulis Materi Baru
              </Button>
            </>
          )}
        </div>
      </div>

      {mode === "NEW_MAT" && (
        <Card>
          <CardHeader
            icon={BookOpen}
            title="Formulir Penulisan Materi Baru"
            description="Buat bahan bacaan bilingual terintegrasi kosakata kunci untuk siswa."
          />
          <CardBody>
            <MaterialEditor
              availableSubjects={availableSubjects}
              availableCategories={availableCategories}
              onCancel={() => setMode("LIST")}
            />
          </CardBody>
        </Card>
      )}

      {mode === "EDIT_MAT" && selectedMaterialForEdit && (
        <Card>
          <CardHeader
            icon={Pencil}
            title={`Edit Materi: ${selectedMaterialForEdit.title}`}
            description="Perbarui konten, kosakata, atau target jenjang kelas materi."
          />
          <CardBody>
            <MaterialEditor
              initialMaterial={selectedMaterialForEdit}
              availableSubjects={availableSubjects}
              availableCategories={availableCategories}
              onCancel={() => setMode("LIST")}
            />
          </CardBody>
        </Card>
      )}

      {mode === "NEW_QUIZ" && (
        <Card>
          <CardHeader
            icon={HelpCircle}
            title="Formulir Pembuat Kuis Interaktif"
            description="Hubungkan butir soal pilihan ganda, listening (audio percakapan & TTS), writing (esai/kalimat), dan isian singkat dengan materi bacaan."
          />
          <CardBody>
            <QuizEditor materials={materials} onCancel={() => setMode("LIST")} />
          </CardBody>
        </Card>
      )}

      {mode === "LIST" && (
        <Card>
          <CardHeader
            icon={BookOpen}
            title={`Katalog Materi & Kuis Terbit (${materials.length} Materi)`}
            description="Materi yang sudah dipublikasikan dapat diakses langsung oleh siswa di menu Materi & Kuis."
          />
          <CardBody className="p-0">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Belum ada materi pembelajaran yang dibuat. Klik &ldquo;Tulis Materi Baru&rdquo; di atas untuk memulai.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {materials.map((m) => {
                  const vocabCount = parseJson<any[]>(m.vocabulary, []).length;
                  return (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50/50"
                    >
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill tone="info">{m.category}</Pill>
                          <Pill tone="neutral">
                            {m.subject ?? "Umum"} · {m.grade ? `Kelas ${m.grade}` : "Semua Kelas"}
                          </Pill>
                          <Pill tone="gold">{m.cefrLevel}</Pill>
                          {m.published ? (
                            <Pill tone="success">Terbit</Pill>
                          ) : (
                            <Pill tone="neutral">Draf</Pill>
                          )}
                          <span className="text-xs text-slate-400">· {vocabCount} Kosakata</span>
                        </div>

                        <h4 className="mt-1 font-black text-ink">{m.title}</h4>
                        <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">{m.summary}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>Kuis: {m.quizzes.length > 0 ? `${m.quizzes.length} Kuis Aktif` : "Belum ada kuis"}</span>
                          {m.authorName && <span>· Penulis: {m.authorName}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewMaterial(m)}
                          title="Buka Pratinjau Tampilan Siswa"
                        >
                          <Eye className="size-3.5 text-brand-600" /> Buka Siswa
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(m)}
                        >
                          <Pencil className="size-3.5" /> Edit
                        </Button>

                        <form action={deleteMaterial}>
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            title="Hapus Materi"
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal Pratinjau Tampilan Siswa */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-10 place-items-center rounded-2xl bg-brand-100 text-brand-600 shrink-0">
                  <BookOpen className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                      Pratinjau Tampilan Siswa
                    </span>
                    <Pill tone="info">Mode Pratinjau</Pill>
                    <Pill tone="gold">{previewMaterial.cefrLevel}</Pill>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink truncate">
                    {previewMaterial.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Banner Info Simulasi */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-3.5 text-xs text-brand-900 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">Simulasi Tampilan Menu Siswa (Materi & Kuis)</p>
                  <p className="text-brand-700">
                    Mata Pelajaran: {previewMaterial.subject ?? "Umum"} · Target: {previewMaterial.grade ? `Kelas ${previewMaterial.grade}` : "Semua Jenjang"} · Kategori: {previewMaterial.category}
                  </p>
                </div>
                <Pill tone="success">Aktif Terbit</Pill>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* Kolom Konten Materi & Kuis */}
                <div className="space-y-6">
                  {/* Konten Bacaan */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <BookOpen className="size-4 text-brand-600" />
                      <h4 className="font-bold text-sm text-ink">Bacaan Materi Pembelajaran</h4>
                    </div>
                    <p className="text-xs font-medium text-slate-500 italic">{previewMaterial.summary}</p>
                    <div className="space-y-3 text-sm leading-relaxed text-slate-700 pt-2 border-t border-slate-100">
                      {previewMaterial.content.split(/\n\s*\n/).map((p, i) =>
                        /^#{2,3}\s/.test(p) ? (
                          <h5 key={i} className="pt-2 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                            {p.replace(/^#{2,3}\s+/, "")}
                          </h5>
                        ) : (
                          <p key={i} className="whitespace-pre-line">{p}</p>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Kuis Interaktif */}
                  {previewMaterial.quizzes.length > 0 ? (
                    previewMaterial.quizzes.map((quiz) => {
                      const questions = parseJson<QuizQuestion[]>(quiz.questions, []);
                      return (
                        <div key={quiz.id} className="rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-xs space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="size-4 text-amber-600" />
                              <h4 className="font-bold text-sm text-ink">{quiz.title}</h4>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-amber-100 px-2.5 py-1 rounded-lg">
                              {questions.length} Soal · Syarat Lulus: Skor ≥ {quiz.passScore}
                            </span>
                          </div>

                          <ol className="space-y-4 text-xs">
                            {questions.map((q, idx) => (
                              <QuestionPreview key={idx} q={q} idx={idx} prev={questions[idx - 1]} />
                            ))}
                          </ol>
                          <p className="text-[11px] text-amber-700 italic border-t border-amber-100 pt-2">
                            * Jawaban benar ditandai hijau (hanya terlihat oleh guru). Di akun siswa, soal dikerjakan langsung dan dinilai otomatis.
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                      Belum ada kuis yang terpasang pada materi ini.
                    </div>
                  )}
                </div>

                {/* Kolom Kosakata (Vocabulary) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-fit space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-ink">Kosakata (Vocabulary)</span>
                  </div>
                  <ul className="divide-y divide-slate-100 text-xs">
                    {parseJson<{ en: string; id: string }[]>(previewMaterial.vocabulary, []).map((v, i) => (
                      <li key={i} className="flex items-center justify-between py-2.5">
                        <span className="font-bold text-brand-700">{v.en}</span>
                        <span className="text-slate-500 text-right">{v.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const m = previewMaterial;
                  setPreviewMaterial(null);
                  startEdit(m);
                }}
              >
                <Pencil className="size-3.5" /> Edit Materi Ini
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setPreviewMaterial(null)}
              >
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Pratinjau satu soal di panel guru, aman untuk semua tipe soal (pilihan ganda, isian, bacaan, dll.). */
function QuestionPreview({ q, idx, prev }: { q: QuizQuestion; idx: number; prev?: QuizQuestion }) {
  const type = q.type || "MULTIPLE_CHOICE";
  const options = Array.isArray(q.options) ? q.options.filter((o) => String(o ?? "").trim() !== "") : [];
  const isFillIn =
    type === "FILL_IN" ||
    (type === "READING" && q.readingFormat === "FILL_IN") ||
    (type === "LISTENING" && q.listeningFormat === "FILL_IN");
  const showSection = Boolean(q.section) && q.section !== prev?.section;
  const showPassage = type === "READING" && Boolean(q.passage) && !(prev?.type === "READING" && prev.passage === q.passage);
  return (
    <>
      {showSection && (
        <li className="list-none pt-1 text-[11px] font-black uppercase tracking-wider text-amber-700">{q.section}</li>
      )}
      <li className="space-y-2">
        {showPassage && (
          <div className="rounded-xl border border-sky-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
            <p className="mb-1 font-bold text-sky-900">Teks bacaan{q.passageTitle ? `: ${q.passageTitle}` : ""}</p>
            <p className="line-clamp-4 whitespace-pre-line">{q.passage}</p>
          </div>
        )}
        <p className="whitespace-pre-line font-bold text-ink text-sm">
          {idx + 1}. {q.q}
        </p>
        {isFillIn ? (
          <div className="rounded-xl border border-mint-200 bg-mint-50/60 px-3.5 py-2 text-xs text-mint-800">
            <span className="font-bold">Kunci:</span> {q.fillInAnswer || "—"}
            {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
              <span className="text-mint-700"> · +{q.acceptedAnswers.length} variasi jawaban diterima</span>
            )}
            {q.fillInHint && <span className="block text-slate-500">Petunjuk: {q.fillInHint}</span>}
          </div>
        ) : options.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {options.map((opt, optIdx) => (
              <div
                key={optIdx}
                className={cn(
                  "rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-2xs",
                  optIdx === q.answer ? "border-mint-300 bg-mint-50 text-mint-800" : "border-slate-200 bg-white text-slate-700",
                )}
              >
                {opt}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-500">
            {type === "WRITING" ? "Jawaban tulisan terbuka" : type === "SPEAKING" ? "Jawaban lisan (pengenalan suara)" : "Jawaban terbuka"}
            {q.modelAnswer ? ` · Contoh: ${q.modelAnswer}` : ""}
          </p>
        )}
      </li>
    </>
  );
}
