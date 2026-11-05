"use client";

import { useId, useState } from "react";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  GraduationCap,
  Save,
  Sparkles,
} from "lucide-react";
import { saveBatchStudentAssessments } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Avatar, Button, Card, CardBody, Field, Input, Pill, Select } from "@/components/ui";
import {
  CURRENT_SEMESTER,
  SEMESTERS,
  STUDENT_ASSESSMENT_TYPES,
  STUDENT_TARGET,
  cefrFromToefl,
} from "@/lib/program";
import { toInputDate } from "@/lib/utils";

export interface StudentAssessmentRecord {
  id: string;
  type: string;
  semester: string;
  score: number;
  cefrLevel: string;
  listening?: number | null;
  speaking?: number | null;
  reading?: number | null;
  writing?: number | null;
  useOfEnglish?: number | null;
  notes?: string | null;
  date: string;
}

export interface StudentRowItem {
  id: string;
  name: string;
  nis: string | null;
  cefrLevel: string;
  pareAlumni: boolean;
  isStudentAmbassador: boolean;
  assessments?: StudentAssessmentRecord[];
}

export interface ClassOption {
  id: string;
  name: string;
  grade: number;
  students: StudentRowItem[];
}

export function StudentGradeForm({
  classes,
  initialClassId,
}: {
  classes: ClassOption[];
  initialClassId?: string;
}) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId ?? classes[0]?.id ?? "");
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? classes[0];

  // Tipe asesmen default sesuai jenjang kelas (Bab 2.2)
  const defaultType = selectedClass?.grade === 9 ? "TOEFL" : selectedClass?.grade === 8 ? "SPEAKING" : "OBSERVASI";
  const [assessmentType, setAssessmentType] = useState(defaultType);
  const [semester, setSemester] = useState(CURRENT_SEMESTER);
  const [date, setDate] = useState(toInputDate(new Date()));
  const [showCambridgeSubscores, setShowCambridgeSubscores] = useState(false);

  // Nilai per siswa
  type StudentScoreState = {
    score: string;
    listening?: number;
    speaking?: number;
    reading?: number;
    writing?: number;
    useOfEnglish?: number;
    notes?: string;
    hasSavedRecord?: boolean;
    lastSavedDate?: string;
  };

  // Helper untuk menghitung/mengambil skor dari riwayat atau default skala
  const computeScoresForType = (
    cls: ClassOption | undefined,
    type: string,
    sem: string
  ): Record<string, StudentScoreState> => {
    if (!cls) return {};
    const map: Record<string, StudentScoreState> = {};

    cls.students.forEach((s) => {
      // Cari apakah siswa sudah memiliki asesmen tersimpan untuk type & semester ini
      const matched =
        s.assessments?.find((a) => a.type === type && (sem ? a.semester === sem : true)) ??
        s.assessments?.find((a) => a.type === type);

      if (matched) {
        map[s.id] = {
          score: String(matched.score),
          listening: matched.listening ?? 3,
          speaking: matched.speaking ?? 3,
          reading: matched.reading ?? 3,
          writing: matched.writing ?? 3,
          useOfEnglish: matched.useOfEnglish ?? 3,
          notes: matched.notes ?? "",
          hasSavedRecord: true,
          lastSavedDate: matched.date,
        };
      } else {
        // Belum ada riwayat: berikan nilai awal proporsional sesuai skala jenis asesmen
        map[s.id] = {
          score: type === "TOEFL" ? "450" : "75",
          listening: 3,
          speaking: 3,
          reading: 3,
          writing: 3,
          useOfEnglish: 3,
          notes: "",
          hasSavedRecord: false,
        };
      }
    });

    return map;
  };

  // Cache in-memory per kombinasi [classId, type, semester] agar input tidak hilang saat berganti opsi
  const [scoresCache, setScoresCache] = useState<Record<string, Record<string, StudentScoreState>>>({});

  const cacheKey = (cId: string, type: string, sem: string) => `${cId}__${type}__${sem}`;

  // State skor aktif saat ini
  const [scores, setScores] = useState<Record<string, StudentScoreState>>(() =>
    computeScoresForType(selectedClass, defaultType, CURRENT_SEMESTER)
  );

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    if (cls) {
      const newType = cls.grade === 9 ? "TOEFL" : cls.grade === 8 ? "SPEAKING" : "OBSERVASI";
      setAssessmentType(newType);
      const key = cacheKey(newClassId, newType, semester);
      const targetScores = scoresCache[key] ?? computeScoresForType(cls, newType, semester);
      setScores(targetScores);
    }
  };

  const handleTypeChange = (newType: string) => {
    setAssessmentType(newType);
    const key = cacheKey(selectedClassId, newType, semester);
    const targetScores = scoresCache[key] ?? computeScoresForType(selectedClass, newType, semester);
    setScores(targetScores);
  };

  const handleSemesterChange = (newSemester: string) => {
    setSemester(newSemester);
    const key = cacheKey(selectedClassId, assessmentType, newSemester);
    const targetScores = scoresCache[key] ?? computeScoresForType(selectedClass, assessmentType, newSemester);
    setScores(targetScores);
  };

  const updateScore = (studentId: string, val: string) => {
    setScores((prev) => {
      const next = {
        ...prev,
        [studentId]: { ...(prev[studentId] ?? { score: "" }), score: val },
      };
      const key = cacheKey(selectedClassId, assessmentType, semester);
      setScoresCache((c) => ({ ...c, [key]: next }));
      return next;
    });
  };

  const updateCambridge = (
    studentId: string,
    field: "listening" | "speaking" | "reading" | "writing" | "useOfEnglish",
    val: number
  ) => {
    setScores((prev) => {
      const next = {
        ...prev,
        [studentId]: { ...(prev[studentId] ?? { score: "" }), [field]: val },
      };
      const key = cacheKey(selectedClassId, assessmentType, semester);
      setScoresCache((c) => ({ ...c, [key]: next }));
      return next;
    });
  };

  const updateNotes = (studentId: string, val: string) => {
    setScores((prev) => {
      const next = {
        ...prev,
        [studentId]: { ...(prev[studentId] ?? { score: "" }), notes: val },
      };
      const key = cacheKey(selectedClassId, assessmentType, semester);
      setScoresCache((c) => ({ ...c, [key]: next }));
      return next;
    });
  };

  // Susun data yang akan dikirim via JSON
  const payload = (selectedClass?.students ?? []).map((s) => {
    const sc = scores[s.id];
    const num = Number(sc?.score || 0);
    let cefr = s.cefrLevel;
    if (assessmentType === "TOEFL") {
      cefr = cefrFromToefl(num);
    } else {
      const target = STUDENT_TARGET[selectedClass.grade]?.endOfYear ?? "A2";
      if (num >= 80) cefr = target;
      else if (num >= 60) cefr = "A2";
      else cefr = "A1";
    }

    return {
      studentId: s.id,
      score: num,
      cefrLevel: cefr,
      listening: showCambridgeSubscores ? sc?.listening : undefined,
      speaking: showCambridgeSubscores ? sc?.speaking : undefined,
      reading: showCambridgeSubscores ? sc?.reading : undefined,
      writing: showCambridgeSubscores ? sc?.writing : undefined,
      useOfEnglish: showCambridgeSubscores ? sc?.useOfEnglish : undefined,
      notes: sc?.notes,
    };
  });

  return (
    <ActionForm action={saveBatchStudentAssessments}>
      <input type="hidden" name="classId" value={selectedClassId} />
      <input type="hidden" name="type" value={assessmentType} />
      <input type="hidden" name="semester" value={semester} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="studentAssessments" value={JSON.stringify(payload)} />

      {/* Kontrol Kelas & Parameter Asesmen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Pilih Kelas yang Diampu">
          <Select
            id="classSelect"
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Kelas {c.name} (Kelas {c.grade} · {c.students.length} siswa)
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Jenis Asesmen (Bab 2.2)">
          <Select
            id="typeSelect"
            value={assessmentType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {Object.entries(STUDENT_ASSESSMENT_TYPES).map(([k, label]) => (
              <option key={k} value={k}>
                {label} ({k})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Semester">
          <Select
            id="semSelect"
            value={semester}
            onChange={(e) => handleSemesterChange(e.target.value)}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal Asesmen">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>

      {/* Target Kemampuan Siswa Card */}
      {selectedClass && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-800">
              Target Kelas {selectedClass.grade} (Bab 2.2 Dokumen Master)
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Target akhir tahun: <span className="font-bold text-brand-700">{STUDENT_TARGET[selectedClass.grade]?.endOfYear}</span> ·
              Target lulus: <span className="font-bold text-brand-700">{STUDENT_TARGET[selectedClass.grade]?.graduation}</span> ·
              Metode: <span className="font-semibold text-slate-700">{STUDENT_TARGET[selectedClass.grade]?.assessment}</span> ({STUDENT_TARGET[selectedClass.grade]?.frequency})
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCambridgeSubscores(!showCambridgeSubscores)}
          >
            {showCambridgeSubscores ? "Sembunyikan Subkomponen Cambridge" : "Tampilkan 5 Subkomponen Cambridge (Skor 1–4)"}
            {showCambridgeSubscores ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      )}

      {/* Tabel Pengisian Nilai Siswa */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 uppercase tracking-wider text-slate-400 font-bold">
            <tr>
              <th className="py-3 px-4">Siswa</th>
              <th className="py-3 px-4 text-center">Level Saat Ini</th>
              <th className="py-3 px-4 text-center">
                {assessmentType === "TOEFL" ? "Skor TOEFL (310–677)" : "Nilai Asesmen (0–100)"}
              </th>
              <th className="py-3 px-4 text-center">Estimasi CEFR Baru</th>
              {showCambridgeSubscores && (
                <>
                  <th className="py-3 px-2 text-center">Listening</th>
                  <th className="py-3 px-2 text-center">Speaking</th>
                  <th className="py-3 px-2 text-center">Reading</th>
                  <th className="py-3 px-2 text-center">Writing</th>
                  <th className="py-3 px-2 text-center">Use of Eng</th>
                </>
              )}
              <th className="py-3 px-4">Catatan Perkembangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedClass?.students.map((s) => {
              const sc = scores[s.id] ?? { score: "" };
              const num = Number(sc.score || 0);

              let estimatedCefr = s.cefrLevel;
              if (assessmentType === "TOEFL") {
                estimatedCefr = cefrFromToefl(num);
              } else {
                const target = STUDENT_TARGET[selectedClass.grade]?.endOfYear ?? "A2";
                if (num >= 80) estimatedCefr = target;
                else if (num >= 60) estimatedCefr = "A2";
                else estimatedCefr = "A1";
              }

              return (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="sm" />
                      <div>
                        <p className="font-bold text-ink">{s.name}</p>
                        <p className="text-[11px] text-slate-400">
                          NIS: {s.nis ?? "-"} {s.pareAlumni && "· Pare Alumni"} {s.isStudentAmbassador && "· Ambassador"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Pill tone="info">{s.cefrLevel}</Pill>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      min={assessmentType === "TOEFL" ? 310 : 0}
                      max={assessmentType === "TOEFL" ? 677 : 100}
                      placeholder={assessmentType === "TOEFL" ? "310–677" : "0–100"}
                      value={sc.score}
                      onChange={(e) => updateScore(s.id, e.target.value)}
                      className="w-24 rounded-xl border border-slate-200 px-2 py-1 text-center font-black text-ink shadow-2xs focus:border-brand-500 focus:outline-hidden"
                    />
                    {sc.hasSavedRecord ? (
                      <span className="block text-[10px] font-bold text-mint-600 mt-0.5">
                        ✓ Tersimpan
                      </span>
                    ) : (
                      <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                        Belum Dinilai
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    <Pill tone={estimatedCefr >= (STUDENT_TARGET[selectedClass.grade]?.endOfYear ?? "A2") ? "success" : "warning"}>
                      {estimatedCefr}
                    </Pill>
                  </td>

                  {showCambridgeSubscores && (
                    <>
                      {(["listening", "speaking", "reading", "writing", "useOfEnglish"] as const).map((dim) => (
                        <td key={dim} className="py-3 px-1 text-center">
                          <select
                            value={sc[dim] ?? 3}
                            onChange={(e) => updateCambridge(s.id, dim, Number(e.target.value))}
                            className="rounded-lg border border-slate-200 px-1 py-1 text-xs font-bold text-slate-700"
                          >
                            <option value={4}>4 (Sangat Baik)</option>
                            <option value={3}>3 (Baik)</option>
                            <option value={2}>2 (Cukup)</option>
                            <option value={1}>1 (Kurang)</option>
                          </select>
                        </td>
                      ))}
                    </>
                  )}

                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="Catatan keaktifan siswa..."
                      value={sc.notes ?? ""}
                      onChange={(e) => updateNotes(s.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-1 text-xs text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-hidden"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          *Menyimpan nilai akan langsung mencatat riwayat asesmen dan memperbarui level CEFR siswa secara otomatis.
        </p>

        <SubmitButton>
          <Save className="size-4" /> Simpan Semua Nilai ({selectedClass?.students.length ?? 0} Siswa)
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
