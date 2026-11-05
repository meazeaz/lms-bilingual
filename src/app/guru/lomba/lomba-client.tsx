"use client";

import { useState } from "react";
import {
  Award,
  Calendar,
  Medal,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { createCompetition, deleteCompetitionEntry, saveCompetitionEntry } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, CardHeader, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import {
  COMPETITION_CATEGORIES,
  COMPETITION_LEVELS,
  COMPETITION_RESULTS,
  competitionPoints,
} from "@/lib/program";
import { formatDate, toInputDate } from "@/lib/utils";

export interface StudentOptionItem {
  id: string;
  name: string;
  className: string;
  cefrLevel: string;
}

export interface CompetitionItem {
  id: string;
  name: string;
  level: string;
  category: string;
  organizer: string | null;
  date: string;
}

export interface CompetitionEntryItem {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  competitionName: string;
  level: string;
  category: string;
  result: string;
  points: number;
  notes: string | null;
  date: string;
}

// ───────────── Form Buat Ajang Lomba Baru ─────────────
export function CreateCompetitionForm({ onCancel }: { onCancel?: () => void }) {
  return (
    <ActionForm action={createCompetition} resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nama Ajang Lomba">
          <Input
            name="name"
            required
            placeholder="Contoh: FLS2N Storytelling 2026"
          />
        </Field>

        <Field label="Tingkat Kompetisi">
          <Select name="level" defaultValue="KECAMATAN">
            {Object.entries(COMPETITION_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label} (Pengali {v.multiplier}×)
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Cabang Lomba">
          <Select name="category" defaultValue="Story Telling">
            {COMPETITION_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} (Cocok {cat.level})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal Pelaksanaan">
          <Input name="date" type="date" required defaultValue={toInputDate(new Date())} />
        </Field>
      </div>

      <Field label="Penyelenggara / Tempat (Opsional)">
        <Input name="organizer" placeholder="Contoh: MGMP Bahasa Inggris / Balai Bahasa Jawa Barat" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
        <SubmitButton>Simpan Data Lomba</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Form Catat Prestasi Siswa ─────────────
export function RecordStudentEntryForm({
  competitions,
  students,
  onCancel,
}: {
  competitions: CompetitionItem[];
  students: StudentOptionItem[];
  onCancel?: () => void;
}) {
  const [selectedCompId, setSelectedCompId] = useState(competitions[0]?.id ?? "");
  const [result, setResult] = useState("JUARA_1");

  const selectedComp = competitions.find((c) => c.id === selectedCompId);
  const pointsPreview = selectedComp
    ? competitionPoints(selectedComp.level, result)
    : 0;

  return (
    <ActionForm action={saveCompetitionEntry} resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Pilih Event Lomba">
          <Select
            name="competitionId"
            required
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level} · {c.category})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pilih Siswa Delegasi">
          <Select name="studentId" required defaultValue="">
            <option value="" disabled>-- Pilih Siswa --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Kelas {s.className} · {s.cefrLevel})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Peringkat / Hasil Yang Diraih">
          <Select
            name="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            {Object.entries(COMPETITION_RESULTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label} (Poin Dasar {v.base})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Catatan / Prestasi Tambahan (Opsional)">
        <Input name="notes" placeholder="Contoh: Memperoleh piala bergilir & penghargaan Best Speaker..." />
      </Field>

      {/* Kalkulasi Poin Real-time */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-amber-800">
            Perolehan Poin Ekstrakurikuler Siswa
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Rumus: Poin Dasar ({COMPETITION_RESULTS[result]?.base ?? 0}) × Pengali Tingkat {selectedComp?.level ?? "KECAMATAN"} ({selectedComp ? (COMPETITION_LEVELS[selectedComp.level]?.multiplier ?? 1) : 1}×)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-2xl font-black text-amber-900">
            +{pointsPreview} Poin
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
        <SubmitButton>Catat Prestasi Delegasi</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Komponen Utama Halaman Lomba ─────────────
export function CompetitionViewContainer({
  competitions,
  entries,
  students,
}: {
  competitions: CompetitionItem[];
  entries: CompetitionEntryItem[];
  students: StudentOptionItem[];
}) {
  const [mode, setMode] = useState<"NONE" | "NEW_COMP" | "NEW_ENTRY">("NONE");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-black text-ink">
            Ajang Lomba & Delegasi Siswa
          </h3>
          <p className="text-xs text-slate-500">
            Catat agenda kejuaraan serta delegasi siswa yang menorehkan prestasi membawa nama sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setMode("NEW_COMP")}>
            <Calendar className="size-4" /> Tambah Event Lomba
          </Button>
          <Button variant="primary" onClick={() => setMode("NEW_ENTRY")}>
            <Trophy className="size-4" /> Catat Prestasi Siswa
          </Button>
        </div>
      </div>

      {mode === "NEW_COMP" && (
        <Card>
          <CardHeader
            icon={Calendar}
            title="Formulir Pendaftaran Event Lomba Baru"
            description="Tambahkan ajang kompetisi bahasa Inggris tingkat kecamatan, kabupaten, provinsi, atau nasional."
          />
          <CardBody>
            <CreateCompetitionForm onCancel={() => setMode("NONE")} />
          </CardBody>
        </Card>
      )}

      {mode === "NEW_ENTRY" && (
        <Card>
          <CardHeader
            icon={Trophy}
            title="Formulir Pencatatan Prestasi Delegasi Siswa"
            description="Pilih perlombaan dan hasil capaian siswa untuk menghitung poin ekstrakurikuler."
          />
          <CardBody>
            {competitions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Silakan buat minimal 1 event lomba terlebih dahulu sebelum mencatat prestasi siswa.
              </div>
            ) : (
              <RecordStudentEntryForm
                competitions={competitions}
                students={students}
                onCancel={() => setMode("NONE")}
              />
            )}
          </CardBody>
        </Card>
      )}

      {/* Tabel Prestasi Siswa */}
      <Card>
        <CardHeader
          icon={Award}
          title={`Rekap Capaian Prestasi Siswa (${entries.length} Catatan)`}
          description="Daftar keikutsertaan kompetisi dan raihan juara oleh delegasi siswa Al Madany."
        />
        <CardBody className="p-0">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada riwayat prestasi lomba yang tercatat. Klik &ldquo;Catat Prestasi Siswa&rdquo; di atas untuk menambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Nama Lomba</th>
                    <th className="py-3 px-4">Tingkat & Cabang</th>
                    <th className="py-3 px-4 text-center">Hasil Kejuaraan</th>
                    <th className="py-3 px-4 text-center">Poin Didapat</th>
                    <th className="py-3 px-4">Catatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((en) => (
                    <tr key={en.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-semibold">
                        {formatDate(en.date)}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink">
                        {en.studentName} <span className="text-slate-400 font-normal">({en.className})</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {en.competitionName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-700">{en.level}</span> · {en.category}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Pill tone={en.result.includes("JUARA") ? "gold" : en.result === "FINALIS" ? "success" : "info"}>
                          {COMPETITION_RESULTS[en.result]?.label ?? en.result}
                        </Pill>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-emerald-700">
                        +{en.points}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {en.notes ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <form action={deleteCompetitionEntry}>
                          <input type="hidden" name="id" value={en.id} />
                          <button
                            type="submit"
                            title="Hapus"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
