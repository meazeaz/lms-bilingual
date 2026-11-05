"use client";

import { useState } from "react";
import { AlertTriangle, Check, Edit3, ShieldAlert, X } from "lucide-react";
import { demoteTeacherLevel, updateTeacherProfile } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { LEVEL_LABEL, SCHOOL_SUBJECTS, type Level } from "@/lib/program";

// ───────────── Form Edit Profil Guru (Admin) ─────────────
export function EditProfileSection({
  teacher,
  potentialBuddies,
  availableSubjects,
}: {
  teacher: {
    id: string;
    subject: string;
    nip: string | null;
    whatsapp: string | null;
    cefrLevel: string;
    toeflScore: number | null;
    buddyId: string | null;
    isPilot: boolean;
  };
  potentialBuddies: { id: string; name: string }[];
  availableSubjects?: string[];
}) {
  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);

  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
        <Edit3 className="size-4" /> {open ? "Batal Edit" : "Edit Data & Profil Guru"}
      </Button>

      {open && (
        <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-100 pb-3 mb-4">
            <h4 className="font-bold text-ink text-sm">Perbarui Informasi Tenaga Pendidik</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <ActionForm action={updateTeacherProfile} resetOnSuccess>
            <input type="hidden" name="teacherId" value={teacher.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mata Pelajaran">
                <Select
                  id="subject"
                  name="subject"
                  required
                  defaultValue={teacher.subject}
                >
                  {teacher.subject && !subjects.includes(teacher.subject) && (
                    <option value={teacher.subject}>{teacher.subject}</option>
                  )}
                  {subjects.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="NIP / Identitas Pegawai">
                <Input
                  id="nip"
                  name="nip"
                  defaultValue={teacher.nip || ""}
                  placeholder="Nomor Induk Pegawai..."
                />
              </Field>

              <Field label="Nomor WhatsApp">
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  defaultValue={teacher.whatsapp || ""}
                  placeholder="08xxxxxxxxxx"
                />
              </Field>

              <Field label="English Buddy / Mentor">
                <Select id="buddyId" name="buddyId" defaultValue={teacher.buddyId || ""}>
                  <option value="">-- Belum Ditugaskan --</option>
                  {potentialBuddies.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Level CEFR">
                <Select id="cefrLevel" name="cefrLevel" defaultValue={teacher.cefrLevel}>
                  <option value="A1">A1 (Pemula)</option>
                  <option value="A2">A2 (Dasar)</option>
                  <option value="B1">B1 (Menengah - Syarat Bronze)</option>
                  <option value="B2">B2 (Menengah Atas - Syarat Silver)</option>
                  <option value="C1">C1 (Mahir - Syarat Gold)</option>
                  <option value="C2">C2 (Master)</option>
                </Select>
              </Field>

              <Field label="Skor TOEFL Prediksi / Resmi">
                <Input
                  id="toeflScore"
                  name="toeflScore"
                  type="number"
                  min="310"
                  max="677"
                  defaultValue={teacher.toeflScore ?? ""}
                  placeholder="Misal: 550 (Opsional)"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Checkbox
                id="isPilot"
                name="isPilot"
                defaultChecked={teacher.isPilot}
                label="Anggota Kelompok Pilot Project 2026"
                description="Guru yang termasuk kelompok pilot mendapatkan pendampingan akselerasi intensif lebih awal."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-brand-100 mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <SubmitButton variant="primary" size="sm" pendingText="Menyimpan profil…">
                <Check className="size-4" /> Simpan Perubahan Profil
              </SubmitButton>
            </div>
          </ActionForm>
        </div>
      )}
    </div>
  );
}

// ───────────── Form Sanksi Turun Level Duta (Admin) ─────────────
export function DemoteLevelSection({
  teacherId,
  currentLevel,
}: {
  teacherId: string;
  currentLevel: Level;
}) {
  const [open, setOpen] = useState(false);

  if (currentLevel === "NONE") return null;

  const lowerLevels: Level[] =
    currentLevel === "GOLD"
      ? ["SILVER", "BRONZE", "NONE"]
      : currentLevel === "SILVER"
      ? ["BRONZE", "NONE"]
      : ["NONE"];

  return (
    <div>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <ShieldAlert className="size-4" /> {open ? "Batal Sanksi" : "Penurunan Level (Sanksi / Evaluasi)"}
      </Button>

      {open && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="size-5 text-rose-600" />
              <h4 className="font-bold text-sm">Penyesuaian / Sanksi Penurunan Level Duta</h4>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-xs text-rose-700 mb-4 leading-relaxed">
            Berdasarkan Bab 6.4 Dokumen Master, sanksi penurunan level dikenakan jika hasil evaluasi berkala 6-bulanan menunjukkan keaktifan ELITE harian &lt; 60%, ketidakhadiran English Zone tanpa keterangan, atau pelanggaran pakta integritas program.
          </p>

          <ActionForm action={demoteTeacherLevel} resetOnSuccess>
            <input type="hidden" name="teacherId" value={teacherId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Level Baru Dituju">
                <Select id="toLevel" name="toLevel" required defaultValue={lowerLevels[0]}>
                  {lowerLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {LEVEL_LABEL[lvl]}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Dasar Alasan & Berita Acara Evaluasi">
                  <Textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    placeholder="Contoh: Evaluasi semester 1 menunjukkan keaktifan ELITE 48% dan tidak memenuhi target pendampingan kelas..."
                    required
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-rose-100 mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <SubmitButton variant="danger" size="sm" pendingText="Memproses penurunan level…">
                <ShieldAlert className="size-4" /> Konfirmasi Penurunan Level
              </SubmitButton>
            </div>
          </ActionForm>
        </div>
      )}
    </div>
  );
}
