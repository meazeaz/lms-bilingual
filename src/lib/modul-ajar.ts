/**
 * Modul Ajar (RPP) Kurikulum Merdeka. RPP induk dibuat admin; guru memakai salinan pribadinya.
 * Dipakai di server & klien (tanpa server-only).
 */
import { parseJson } from "@/lib/utils";

export type ModulStep = { sequence: string; minutes: number; tag?: string | null; details: string[] };

export type ModulAjarData = {
  id: string;
  sourceId: string | null;
  teacherId: string | null;
  title: string;
  subject: string;
  book: string | null;
  unit: number | null;
  unitTitle: string | null;
  meeting: number;
  phase: string;
  grade: number;
  semester: string;
  duration: string;
  schoolName: string | null;
  authorName: string | null;
  year: string | null;
  className: string | null;
  teachDate: string | null; // ISO
  prerequisites: string;
  profiles: string[];
  resources: string[];
  learningModel: string;
  approach: string[];
  objectives: string[];
  steps: ModulStep[];
  assessment: string[];
  reflectionStudent: string[];
  reflectionTeacher: string[];
  attachments: string[];
  teacherNotes: string | null;
  published: boolean;
  updatedAt: string;
};

/** Profil Pelajar Pancasila (Kurikulum Merdeka). */
export const PANCASILA_PROFILES = ["Beriman", "Berkebinekaan global", "Bergotong royong", "Mandiri", "Bernalar kritis", "Kreatif"];

export const lines = (s: string | null | undefined) => (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** Baris DB → objek siap tampil (JSON & teks per baris diurai). */
export function toModulData(m: {
  id: string; sourceId: string | null; teacherId: string | null; title: string; subject: string; book: string | null;
  unit: number | null; unitTitle: string | null; meeting: number; phase: string; grade: number; semester: string; duration: string;
  schoolName: string | null; authorName: string | null; year: string | null; className: string | null; teachDate: Date | null;
  prerequisites: string; profiles: string; resources: string; learningModel: string; approach: string; objectives: string; steps: string;
  assessment: string | null; reflectionStudent: string | null; reflectionTeacher: string | null; attachments: string | null;
  teacherNotes: string | null; published: boolean; updatedAt: Date;
}): ModulAjarData {
  return {
    id: m.id, sourceId: m.sourceId, teacherId: m.teacherId, title: m.title, subject: m.subject, book: m.book,
    unit: m.unit, unitTitle: m.unitTitle, meeting: m.meeting, phase: m.phase, grade: m.grade, semester: m.semester, duration: m.duration,
    schoolName: m.schoolName, authorName: m.authorName, year: m.year, className: m.className,
    teachDate: m.teachDate ? m.teachDate.toISOString() : null,
    prerequisites: m.prerequisites,
    profiles: parseJson<string[]>(m.profiles, []),
    resources: lines(m.resources),
    learningModel: m.learningModel,
    approach: lines(m.approach),
    objectives: parseJson<string[]>(m.objectives, []),
    steps: parseJson<ModulStep[]>(m.steps, []),
    assessment: lines(m.assessment),
    reflectionStudent: lines(m.reflectionStudent),
    reflectionTeacher: lines(m.reflectionTeacher),
    attachments: lines(m.attachments),
    teacherNotes: m.teacherNotes,
    published: m.published,
    updatedAt: m.updatedAt.toISOString(),
  };
}

export const isExtension = (s: ModulStep) => /extension/i.test(s.sequence);

/** Total menit kegiatan inti (tanpa extension activity yang opsional) dan total seluruhnya. */
export function stepMinutes(steps: ModulStep[]) {
  const core = steps.filter((s) => !isExtension(s)).reduce((a, s) => a + (s.minutes || 0), 0);
  const all = steps.reduce((a, s) => a + (s.minutes || 0), 0);
  return { core, all };
}

/** Judul lengkap, mis. "Unit 1 · Let Me Introduce Myself — Pertemuan 1: Vocabulary & Language". */
export function modulFullTitle(m: Pick<ModulAjarData, "unit" | "unitTitle" | "meeting" | "title">) {
  const head = m.unit ? `Unit ${m.unit}${m.unitTitle ? ` · ${m.unitTitle}` : ""} — ` : "";
  return `${head}Pertemuan ${m.meeting}: ${m.title}`;
}

/** Kelompokkan per buku+unit untuk tampilan perpustakaan. */
export function groupByUnit<T extends { book: string | null; unit: number | null; unitTitle: string | null; meeting: number }>(list: T[]) {
  const map = new Map<string, { key: string; book: string | null; unit: number | null; unitTitle: string | null; items: T[] }>();
  for (const m of list) {
    const key = `${m.book ?? "Lainnya"}|${m.unit ?? 0}`;
    if (!map.has(key)) map.set(key, { key, book: m.book, unit: m.unit, unitTitle: m.unitTitle, items: [] });
    map.get(key)!.items.push(m);
  }
  return [...map.values()]
    .map((g) => ({ ...g, items: g.items.sort((a, b) => a.meeting - b.meeting) }))
    .sort((a, b) => (a.book ?? "~").localeCompare(b.book ?? "~") || (a.unit ?? 999) - (b.unit ?? 999));
}

const DEFAULT_REFLECTION_STUDENT = [
  "Apa hal baru yang kamu pelajari hari ini?",
  "Bagian mana yang paling mudah dan paling sulit bagimu? Mengapa?",
  "Apa yang akan kamu lakukan untuk berlatih di rumah?",
];
const DEFAULT_REFLECTION_TEACHER = [
  "Apakah tujuan pembelajaran tercapai? Bukti apa yang menunjukkannya?",
  "Kegiatan mana yang paling efektif dan mana yang perlu diperbaiki?",
  "Peserta didik mana yang memerlukan pendampingan atau pengayaan?",
];

/** Modul kosong untuk RPP induk baru. */
export function emptyModul(): ModulAjarData {
  return {
    id: "", sourceId: null, teacherId: null, title: "", subject: "Bahasa Inggris", book: "", unit: null, unitTitle: "", meeting: 1,
    phase: "D", grade: 7, semester: "I (Ganjil)", duration: "2 x 40 menit", schoolName: "", authorName: "", year: String(new Date().getFullYear()),
    className: "", teachDate: null, prerequisites: "", profiles: [...PANCASILA_PROFILES], resources: [], learningModel: "Discovery Learning, Task-Based Learning, Tatap Muka.",
    approach: [], objectives: [], steps: [
      { sequence: "Warming up", minutes: 5, tag: "", details: [] },
      { sequence: "Closing", minutes: 5, tag: "", details: [] },
    ],
    assessment: [], reflectionStudent: DEFAULT_REFLECTION_STUDENT, reflectionTeacher: DEFAULT_REFLECTION_TEACHER, attachments: [],
    teacherNotes: null, published: true, updatedAt: new Date().toISOString(),
  };
}
