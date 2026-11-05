"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  MessagesSquare,
  Plus,
  Save,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { createClubSession, saveClubAttendance, toggleStudentAmbassador } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Avatar, Button, Card, CardBody, CardHeader, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { formatDate, toInputDate } from "@/lib/utils";

export interface StudentLookupItem {
  id: string;
  name: string;
  className: string;
  cefrLevel: string;
  pareAlumni: boolean;
  isStudentAmbassador: boolean;
}

export interface ClubSessionItem {
  id: string;
  type: string;
  date: string;
  topic: string;
  activity: string | null;
  notes: string | null;
  leaderName: string | null;
  attendances: Array<{
    studentId: string;
    studentName: string;
    className: string;
    role: "PESERTA" | "TUTOR";
    present: boolean;
  }>;
}

// ───────────── Form Buat Sesi Baru ─────────────
export function ClubSessionForm({ onCancel }: { onCancel?: () => void }) {
  const [sessionType, setSessionType] = useState("ENGLISH_CLUB");

  return (
    <ActionForm action={createClubSession} resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Jenis Kegiatan">
          <Select
            name="type"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          >
            <option value="ENGLISH_CLUB">Madani English Club (Sabtu Pagi 08.00–09.30)</option>
            <option value="PEER_TUTORING">Peer Tutoring Sebaya (Kamis Sore 30 Menit)</option>
          </Select>
        </Field>

        <Field label="Tanggal Pelaksanaan">
          <Input name="date" type="date" required defaultValue={toInputDate(new Date())} />
        </Field>

        <Field label="Fokus Aktivitas Utama">
          <Select name="activity" defaultValue="Games & Conversation">
            <option value="Games & Conversation">Interactive Games & Conversation</option>
            <option value="Storytelling">Storytelling & Roleplay</option>
            <option value="English Debate">Mini English Debate</option>
            <option value="Drama & Speech">Drama & Speech Practice</option>
            <option value="Peer Mentoring">1-on-1 Peer Mentoring Session</option>
          </Select>
        </Field>
      </div>

      <Field label="Topik Pembahasan">
        <Input
          name="topic"
          required
          placeholder={
            sessionType === "ENGLISH_CLUB"
              ? "Contoh: Describe Your Dream School & Future Aspirations"
              : "Contoh: Mastering Simple Past Tense with Pare Alumni"
          }
        />
      </Field>

      <Field label="Catatan / Rangkuman Rencana Sesi (Opsional)">
        <Textarea
          name="notes"
          rows={2}
          placeholder="Struktur: 15' ice breaking & greeting, 30' main activity, 30' practice corner, 15' refleksi..."
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
        <SubmitButton>Jadwalkan Sesi</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ───────────── Form Input Presensi Sesi ─────────────
export function AttendanceSheet({
  session,
  allStudents,
  onClose,
}: {
  session: ClubSessionItem;
  allStudents: StudentLookupItem[];
  onClose: () => void;
}) {
  // Prepopulate state presensi
  const existingMap = new Map(session.attendances.map((a) => [a.studentId, a]));

  const [records, setRecords] = useState<
    Record<string, { present: boolean; role: "PESERTA" | "TUTOR" }>
  >(() => {
    const map: Record<string, { present: boolean; role: "PESERTA" | "TUTOR" }> = {};
    allStudents.forEach((s) => {
      const ex = existingMap.get(s.id);
      map[s.id] = {
        present: ex ? ex.present : false,
        role: ex ? ex.role : s.isStudentAmbassador || s.pareAlumni ? "TUTOR" : "PESERTA",
      };
    });
    return map;
  });

  const [filterClass, setFilterClass] = useState("ALL");

  const togglePresent = (studentId: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId]?.present,
      },
    }));
  };

  const toggleRole = (studentId: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        role: prev[studentId]?.role === "TUTOR" ? "PESERTA" : "TUTOR",
      },
    }));
  };

  const setAllPresent = (val: boolean) => {
    setRecords((prev) => {
      const next = { ...prev };
      allStudents.forEach((s) => {
        if (filterClass === "ALL" || s.className === filterClass) {
          next[s.id] = { ...next[s.id], present: val };
        }
      });
      return next;
    });
  };

  const payload = Object.entries(records).map(([studentId, data]) => ({
    studentId,
    present: data.present,
    role: data.role,
  }));

  const classes = Array.from(new Set(allStudents.map((s) => s.className))).sort();
  const visibleStudents = allStudents.filter(
    (s) => filterClass === "ALL" || s.className === filterClass
  );

  const presentCount = Object.values(records).filter((r) => r.present).length;
  const tutorCount = Object.values(records).filter((r) => r.present && r.role === "TUTOR").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="clay flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <div className="flex items-center gap-2">
              <Pill tone={session.type === "PEER_TUTORING" ? "gold" : "info"}>
                {session.type === "PEER_TUTORING" ? "Peer Tutoring" : "Madani English Club"}
              </Pill>
              <span className="text-xs text-slate-400">· {formatDate(session.date)}</span>
            </div>
            <h3 className="mt-1 text-lg font-black text-ink">{session.topic}</h3>
            <p className="text-xs text-slate-500">
              Hadir: <span className="font-bold text-emerald-600">{presentCount} siswa</span> ({tutorCount} berperan sebagai Tutor)
            </p>
          </div>

          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
        </div>

        {/* Toolbar Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-ink"
            >
              <option value="ALL">Semua Rombel ({allStudents.length})</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAllPresent(true)}>
              Centang Hadir Semua
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAllPresent(false)}>
              Reset
            </Button>
          </div>
        </div>

        {/* List Presensi Siswa */}
        <div className="flex-1 overflow-y-auto p-6">
          <ActionForm action={saveClubAttendance}>
            <input type="hidden" name="sessionId" value={session.id} />
            <input type="hidden" name="attendances" value={JSON.stringify(payload)} />

            <div className="space-y-2">
              {visibleStudents.map((s) => {
                const rec = records[s.id] ?? { present: false, role: "PESERTA" };
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between rounded-xl border p-3 transition ${
                      rec.present
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-100 bg-white text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePresent(s.id)}
                        className={`flex size-6 items-center justify-center rounded-lg border transition ${
                          rec.present
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {rec.present && <Check className="size-4 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${rec.present ? "text-ink" : "text-slate-500"}`}>
                            {s.name}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            (Kelas {s.className})
                          </span>
                          <Pill tone="info">{s.cefrLevel}</Pill>
                          {s.pareAlumni && <Pill tone="gold">Alumni Pare</Pill>}
                          {s.isStudentAmbassador && (
                            <Pill tone="success">Ambassador</Pill>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRole(s.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                          rec.role === "TUTOR"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rec.role === "TUTOR" ? "★ Peran: Tutor (+5 pt)" : "Peran: Peserta (+3 pt)"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
              <SubmitButton>Simpan Presensi Kehadiran</SubmitButton>
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}

// ───────────── List Sesi & Riwayat ─────────────
export function ClubSessionList({
  sessions,
  students,
}: {
  sessions: ClubSessionItem[];
  students: StudentLookupItem[];
}) {
  const [activeSessionForAttendance, setActiveSessionForAttendance] = useState<ClubSessionItem | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base font-black text-ink">
            Jadwal & Rekap Sesi English Club
          </h3>
          <p className="text-xs text-slate-500">
            Jadwalkan kegiatan Sabtu (Club) atau Kamis (Peer Tutoring) dan catat absensi kehadiran siswa.
          </p>
        </div>

        {!showNewForm && (
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            <Plus className="size-4" /> Jadwalkan Sesi Baru
          </Button>
        )}
      </div>

      {showNewForm && (
        <Card>
          <CardHeader
            icon={Calendar}
            title="Formulir Penjadwalan Sesi Club / Peer Tutoring"
            description="Tentukan jadwal kegiatan, topik interaktif, dan format latihan siswa."
          />
          <CardBody>
            <ClubSessionForm onCancel={() => setShowNewForm(false)} />
          </CardBody>
        </Card>
      )}

      {sessions.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Belum ada jadwal sesi English Club yang tercatat.
        </div>
      ) : (
        <div className="grid gap-3.5">
          {sessions.map((sess) => {
            const totalPresent = sess.attendances.filter((a) => a.present).length;
            const tutors = sess.attendances.filter((a) => a.present && a.role === "TUTOR").length;

            return (
              <div
                key={sess.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-brand-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={sess.type === "PEER_TUTORING" ? "gold" : "info"}>
                        {sess.type === "PEER_TUTORING" ? "Peer Tutoring (Kamis)" : "English Club (Sabtu)"}
                      </Pill>
                      {sess.activity && (
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {sess.activity}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">· {formatDate(sess.date)}</span>
                    </div>

                    <h4 className="mt-1 text-base font-black text-ink">{sess.topic}</h4>
                    {sess.notes && (
                      <p className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{sess.notes}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Pembina / Leader: <span className="font-semibold text-slate-700">{sess.leaderName ?? "Tim EDT"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">
                        {totalPresent} Siswa Hadir
                      </p>
                      {tutors > 0 && (
                        <p className="text-[11px] font-semibold text-amber-700">
                          {tutors} Tutor Sebaya
                        </p>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveSessionForAttendance(sess)}
                    >
                      <Users className="size-4" /> Kelola Presensi
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSessionForAttendance && (
        <AttendanceSheet
          session={activeSessionForAttendance}
          allStudents={students}
          onClose={() => setActiveSessionForAttendance(null)}
        />
      )}
    </div>
  );
}
