"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  assignTeacherClass,
  createUser,
  deleteUser,
  removeTeacherClass,
  resetUserPassword,
  saveClassRoom,
  toggleUserStatus,
} from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Pill,
  Select,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { SCHOOL_SUBJECTS } from "@/lib/program";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string | null;
  active: boolean;
  createdAt: Date;
  teacher?: {
    id: string;
    nip: string | null;
    subject: string;
    whatsapp: string | null;
    cefrLevel: string;
    isPilot: boolean;
    assignments: Array<{
      id: string;
      classId: string;
      isHomeroom: boolean;
      classRoom: { name: string; grade: number };
    }>;
  } | null;
  student?: {
    id: string;
    nis: string | null;
    cefrLevel: string;
    pareAlumni: boolean;
    isStudentAmbassador: boolean;
    classRoom: { id: string; name: string; grade: number };
  } | null;
}

export interface ClassRoomItem {
  id: string;
  name: string;
  grade: number;
  studentsCount: number;
  assignments: Array<{
    id: string;
    teacherId: string;
    isHomeroom: boolean;
    teacher: {
      id: string;
      user: { name: string };
      subject: string;
    };
  }>;
}

export function PenggunaClient({
  users,
  classes,
  currentAdminId,
  availableSubjects,
}: {
  users: UserListItem[];
  classes: ClassRoomItem[];
  currentAdminId: string;
  availableSubjects?: string[];
}) {
  const subjects =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : (SCHOOL_SUBJECTS as readonly string[]);

  const [tab, setTab] = useState<"TEACHER" | "STUDENT" | "ADMIN" | "CLASS">("TEACHER");
  const [query, setQuery] = useState("");
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [selectedRoleForCreate, setSelectedRoleForCreate] = useState<"TEACHER" | "STUDENT" | "ADMIN">("TEACHER");
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [openNewClass, setOpenNewClass] = useState(false);
  const [openAssignTeacher, setOpenAssignTeacher] = useState(false);

  // Filter users
  const teachers = users.filter((u) => u.role === "TEACHER");
  const students = users.filter((u) => u.role === "STUDENT");
  const admins = users.filter((u) => u.role === "ADMIN");

  const filterUsers = (list: UserListItem[]) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.teacher?.nip && u.teacher.nip.includes(q)) ||
        (u.student?.nis && u.student.nis.includes(q))
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigasi Tab & Aksi Utama */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setTab("TEACHER")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "TEACHER"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <UserCheck className="size-4" /> Dewan Guru ({teachers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("STUDENT")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "STUDENT"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <GraduationCap className="size-4" /> Siswa ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("ADMIN")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "ADMIN"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <ShieldCheck className="size-4" /> Admin & EDT ({admins.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("CLASS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "CLASS"
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Settings className="size-4" /> Kelas & Penugasan ({classes.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {tab !== "CLASS" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedRoleForCreate(tab);
                setOpenCreateUser(true);
              }}
            >
              <UserPlus className="size-4" /> Tambah Pengguna
            </Button>
          )}

          {tab === "CLASS" && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setOpenAssignTeacher(true)}>
                <UserCheck className="size-4" /> Tugaskan Guru
              </Button>
              <Button variant="primary" size="sm" onClick={() => setOpenNewClass(true)}>
                <Plus className="size-4" /> Buat Kelas
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modal Tambah Pengguna Baru */}
      {openCreateUser && (
        <Card className="border-brand-200 bg-brand-50/20 shadow-lg">
          <CardHeader
            icon={UserPlus}
            title="Tambah Akun Pengguna Baru"
            description="Buat kredensial akun baru untuk Guru, Siswa, atau Administrator."
          />
          <CardBody className="p-5">
            <ActionForm
              action={createUser}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Peran Pengguna *">
                  <Select
                    name="role"
                    value={selectedRoleForCreate}
                    onChange={(e) => setSelectedRoleForCreate(e.target.value as any)}
                  >
                    <option value="TEACHER">Guru (Tenaga Pendidik)</option>
                    <option value="STUDENT">Siswa</option>
                    <option value="ADMIN">Administrator / Tim EDT</option>
                  </Select>
                </Field>

                <Field label="Nama Lengkap *">
                  <Input name="name" placeholder="Mis. Ustadzah Siti Fatimah, S.Pd." required />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email Login *" hint="Email harus unik dan aktif">
                  <Input type="email" name="email" placeholder="nama@almadany.sch.id" required />
                </Field>

                <Field label="Password Awal *" hint="Minimal 6 karakter">
                  <Input type="password" name="password" defaultValue="demo123" required />
                </Field>
              </div>

              {/* Form Spesifik Guru */}
              {selectedRoleForCreate === "TEACHER" && (
                <div className="rounded-2xl bg-white p-4 border border-brand-100 grid gap-4 sm:grid-cols-3">
                  <Field label="NIP (Nomor Induk)" hint="Opsional">
                    <Input name="nip" placeholder="198705..." />
                  </Field>
                  <Field label="Mata Pelajaran *">
                    <Select name="subject" required defaultValue={subjects[0]}>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Nomor WhatsApp" hint="Untuk koordinasi ELITE">
                    <Input name="whatsapp" placeholder="08123456789" />
                  </Field>
                  <Field label="Estimasi CEFR Awal">
                    <Select name="cefrLevel" defaultValue="A2">
                      <option value="A2">A2 (Elementary)</option>
                      <option value="B1">B1 (Intermediate)</option>
                      <option value="B2">B2 (Upper Intermediate)</option>
                      <option value="C1">C1 (Advanced)</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2 flex items-center pt-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="isPilot" className="size-4 accent-brand-600 rounded" />
                      Termasuk Kelompok Guru Pilot (Semester 1)
                    </label>
                  </div>
                </div>
              )}

              {/* Form Spesifik Siswa */}
              {selectedRoleForCreate === "STUDENT" && (
                <div className="rounded-2xl bg-white p-4 border border-brand-100 grid gap-4 sm:grid-cols-2">
                  <Field label="NIS (Nomor Induk Siswa)" hint="Opsional">
                    <Input name="nis" placeholder="20260101" />
                  </Field>
                  <Field label="Penempatan Kelas *">
                    <Select name="classId" required>
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          Kelas {c.name} (Jenjang {c.grade})
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              )}

              {/* Form Spesifik Admin */}
              {selectedRoleForCreate === "ADMIN" && (
                <Field label="Jabatan / Divisi" hint="Mis. Koordinator Penjamin Mutu / Tim EDT">
                  <Input name="title" placeholder="Ketua English Development Team" />
                </Field>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button type="button" variant="ghost" onClick={() => setOpenCreateUser(false)}>
                  Batal
                </Button>
                <SubmitButton>Simpan Pengguna</SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      )}

      {/* Modal Reset Password */}
      {resetPasswordTarget && (
        <Card className="border-amber-200 bg-amber-50/30 shadow-lg">
          <CardHeader
            icon={KeyRound}
            title={`Reset Password Pengguna: ${resetPasswordTarget.name}`}
            description={`Tetapkan password baru untuk akun ${resetPasswordTarget.email}.`}
          />
          <CardBody className="p-5">
            <ActionForm
              action={resetUserPassword}
              className="space-y-4"
            >
              <input type="hidden" name="userId" value={resetPasswordTarget.id} />
              <Field label="Password Baru *" hint="Minimal 6 karakter (default: demo123)">
                <Input
                  type="password"
                  name="newPassword"
                  defaultValue="demo123"
                  required
                />
              </Field>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setResetPasswordTarget(null)}>
                  Batal
                </Button>
                <SubmitButton variant="primary">Perbarui Password</SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      )}

      {/* Modal Konfirmasi Hapus Akun Pengguna */}
      {deleteTarget && (
        <Card className="border-rose-200 bg-rose-50/40 shadow-lg">
          <CardHeader
            icon={Trash2}
            title={`Hapus Akun Pengguna: ${deleteTarget.name}`}
            description={`Konfirmasi penghapusan permanen akun ${deleteTarget.email} (${deleteTarget.role}).`}
          />
          <CardBody className="p-5">
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteTarget.name}</strong> (<code>{deleteTarget.email}</code>) dengan peran <strong>{deleteTarget.role}</strong>?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-100/70 p-3.5 text-xs text-rose-900 space-y-1">
                <p className="font-bold">⚠️ Perhatian Tindakan Permanen:</p>
                <p>
                  Semua data terkait akun ini (profil, riwayat aktivitas, hafalan, kuis, dan penugasan) akan dihapus secara permanen dari basis data dan tidak dapat dikembalikan.
                </p>
              </div>

              <form
                action={deleteUser}
                onSubmit={() => setDeleteTarget(null)}
                className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100"
              >
                <input type="hidden" name="userId" value={deleteTarget.id} />
                <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="danger">
                  <Trash2 className="size-4" /> Ya, Hapus Akun Secara Permanen
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal Buat Kelas Baru */}
      {openNewClass && (
        <Card className="border-mint-200 bg-mint-50/20 shadow-lg">
          <CardHeader
            icon={Plus}
            title="Tambah Rombongan Belajar (Kelas Baru)"
            description="Daftarkan kelas baru untuk menampung siswa dan jadwal pengajaran."
          />
          <CardBody className="p-5">
            <ActionForm action={saveClassRoom} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama Kelas *" hint="Contoh: 7A, 8B, 9C">
                  <Input name="name" placeholder="7C" required />
                </Field>
                <Field label="Jenjang Tingkat *">
                  <Select name="grade" defaultValue="7">
                    <option value="7">Kelas 7 (Fokus Observasi & Fondasi A1-A2)</option>
                    <option value="8">Kelas 8 (Fokus Speaking & Presentation A2-B1)</option>
                    <option value="9">Kelas 9 (Fokus TOEFL ITP & Graduation B1)</option>
                  </Select>
                </Field>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpenNewClass(false)}>
                  Batal
                </Button>
                <SubmitButton>Simpan Kelas</SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      )}

      {/* Modal Tugaskan Guru ke Kelas */}
      {openAssignTeacher && (
        <Card className="border-brand-200 bg-brand-50/20 shadow-lg">
          <CardHeader
            icon={UserCheck}
            title="Tugaskan Guru ke Kelas"
            description="Atur penugasan mengajar dan status wali kelas."
          />
          <CardBody className="p-5">
            <form
              action={async (fd) => {
                await assignTeacherClass(fd);
                setOpenAssignTeacher(false);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pilih Guru *">
                  <Select name="teacherId" required>
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map((t) => (
                      <option key={t.teacher?.id} value={t.teacher?.id}>
                        {t.name} ({t.teacher?.subject})
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Pilih Kelas Target *">
                  <Select name="classId" required>
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Kelas {c.name} (Jenjang {c.grade})
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" name="isHomeroom" className="size-4 accent-brand-600 rounded" />
                Tetapkan guru ini sebagai Wali Kelas untuk kelas tersebut
              </label>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpenAssignTeacher(false)}>
                  Batal
                </Button>
                <SubmitButton>Tugaskan Guru</SubmitButton>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Konten Tab 1: Guru */}
      {tab === "TEACHER" && (
        <Card>
          <CardHeader
            icon={Users}
            title="Manajemen Akun Dewan Guru"
            description="Daftar 18 guru SMP IT Al Madany, penugasan kelas, dan kontrol akses akun."
          />
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIP, atau email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Guru & Mapel</Th>
                  <Th>Email & WhatsApp</Th>
                  <Th className="text-center">CEFR</Th>
                  <Th className="text-center">Pilot</Th>
                  <Th>Kelas Diampu</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {filterUsers(teachers).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={t.name} size="sm" />
                        <div>
                          <div className="font-bold text-ink">{t.name}</div>
                          <div className="text-xs text-slate-500">
                            {t.teacher?.subject} {t.teacher?.nip && `· NIP: ${t.teacher.nip}`}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="text-xs font-medium text-slate-700">{t.email}</div>
                      <div className="text-xs text-slate-400">{t.teacher?.whatsapp ?? "-"}</div>
                    </Td>
                    <Td className="text-center">
                      <Pill tone="info">{t.teacher?.cefrLevel ?? "A2"}</Pill>
                    </Td>
                    <Td className="text-center">
                      {t.teacher?.isPilot ? (
                        <Pill tone="success">Pilot</Pill>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {t.teacher?.assignments && t.teacher.assignments.length > 0 ? (
                          t.teacher.assignments.map((a) => (
                            <span
                              key={a.id}
                              className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                a.isHomeroom
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {a.classRoom.name} {a.isHomeroom && "★"}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Belum ditugaskan</span>
                        )}
                      </div>
                    </Td>
                    <Td className="text-center">
                      <Pill tone={t.active ? "success" : "danger"}>
                        {t.active ? "Aktif" : "Nonaktif"}
                      </Pill>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Reset Password"
                          onClick={() => setResetPasswordTarget(t)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <form action={toggleUserStatus}>
                          <input type="hidden" name="userId" value={t.id} />
                          <button
                            type="submit"
                            title={t.active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            {t.active ? <UserX className="size-4" /> : <UserCheck className="size-4 text-emerald-600" />}
                          </button>
                        </form>
                        <button
                          type="button"
                          title="Hapus Akun Guru"
                          onClick={() => setDeleteTarget(t)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Konten Tab 2: Siswa */}
      {tab === "STUDENT" && (
        <Card>
          <CardHeader
            icon={GraduationCap}
            title="Manajemen Akun Siswa"
            description="Kredensial login dan status aktif seluruh siswa."
          />
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa, NIS, atau kelas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Nama Siswa & NIS</Th>
                  <Th>Email Login</Th>
                  <Th className="text-center">Kelas</Th>
                  <Th className="text-center">Level CEFR</Th>
                  <Th className="text-center">Status Khusus</Th>
                  <Th className="text-center">Status Akun</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {filterUsers(students).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <div className="font-bold text-ink">{s.name}</div>
                          <div className="text-xs text-slate-500">NIS: {s.student?.nis ?? "-"}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-xs text-slate-700 font-medium">{s.email}</Td>
                    <Td className="text-center font-bold text-ink">
                      Kelas {s.student?.classRoom?.name ?? "-"}
                    </Td>
                    <Td className="text-center">
                      <Pill tone="gold">{s.student?.cefrLevel ?? "A1"}</Pill>
                    </Td>
                    <Td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.student?.pareAlumni && <Pill tone="info">Pare</Pill>}
                        {s.student?.isStudentAmbassador && <Pill tone="success">Duta</Pill>}
                        {!s.student?.pareAlumni && !s.student?.isStudentAmbassador && (
                          <span className="text-xs text-slate-400">Reguler</span>
                        )}
                      </div>
                    </Td>
                    <Td className="text-center">
                      <Pill tone={s.active ? "success" : "danger"}>
                        {s.active ? "Aktif" : "Nonaktif"}
                      </Pill>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Reset Password"
                          onClick={() => setResetPasswordTarget(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <form action={toggleUserStatus}>
                          <input type="hidden" name="userId" value={s.id} />
                          <button
                            type="submit"
                            title={s.active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            {s.active ? <UserX className="size-4" /> : <UserCheck className="size-4 text-emerald-600" />}
                          </button>
                        </form>
                        <button
                          type="button"
                          title="Hapus Akun Siswa"
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Konten Tab 3: Admin & EDT */}
      {tab === "ADMIN" && (
        <Card>
          <CardHeader
            icon={ShieldCheck}
            title="Akun Administrator & Tim EDT"
            description="Pengelola penjamin mutu dan verifikator program akselerasi bilingual."
          />
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Nama Administrator</Th>
                  <Th>Email Login</Th>
                  <Th>Jabatan / Penugasan</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {filterUsers(admins).map((a) => {
                  const isSelf = a.id === currentAdminId;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={a.name} size="sm" />
                          <div>
                            <div className="font-bold text-ink">{a.name}</div>
                            {isSelf && (
                              <span className="text-[10px] font-bold text-brand-600 uppercase">
                                (Akun Anda Saat Ini)
                              </span>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td className="text-xs text-slate-700 font-medium">{a.email}</Td>
                      <Td className="text-xs font-semibold text-slate-600">{a.title ?? "Tim EDT"}</Td>
                      <Td className="text-center">
                        <Pill tone={a.active ? "success" : "danger"}>
                          {a.active ? "Aktif" : "Nonaktif"}
                        </Pill>
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Reset Password"
                            onClick={() => setResetPasswordTarget(a)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                          >
                            <KeyRound className="size-4" />
                          </button>
                          {!isSelf && (
                            <>
                              <form action={toggleUserStatus}>
                                <input type="hidden" name="userId" value={a.id} />
                                <button
                                  type="submit"
                                  title={a.active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                >
                                  {a.active ? <UserX className="size-4" /> : <UserCheck className="size-4 text-emerald-600" />}
                                </button>
                              </form>
                              <button
                                type="button"
                                title="Hapus Akun Admin"
                                onClick={() => setDeleteTarget(a)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Konten Tab 4: Kelas & Penugasan */}
      {tab === "CLASS" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {classes.map((c) => {
            const homeroom = c.assignments.find((a) => a.isHomeroom);
            const subjectTeachers = c.assignments.filter((a) => !a.isHomeroom);

            return (
              <Card key={c.id}>
                <CardHeader
                  icon={Settings}
                  title={`Kelas ${c.name} (Jenjang ${c.grade})`}
                  description={`${c.studentsCount} Siswa terdaftar`}
                />
                <CardBody className="p-5 space-y-4">
                  {/* Wali Kelas */}
                  <div className="rounded-2xl bg-amber-50/50 p-3 border border-amber-200/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Wali Kelas
                    </span>
                    {homeroom ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink text-sm">
                          {homeroom.teacher.user.name} ({homeroom.teacher.subject})
                        </span>
                        <form action={removeTeacherClass}>
                          <input type="hidden" name="teacherId" value={homeroom.teacherId} />
                          <input type="hidden" name="classId" value={c.id} />
                          <button
                            type="submit"
                            title="Hapus Penugasan"
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ditentukan wali kelas</span>
                    )}
                  </div>

                  {/* Guru Pengampu */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Guru Pengampu Mata Pelajaran ({subjectTeachers.length})
                    </span>
                    {subjectTeachers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada guru mata pelajaran yang ditugaskan.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {subjectTeachers.map((a) => (
                          <li key={a.id} className="py-2 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              {a.teacher.user.name} <span className="text-slate-400">· {a.teacher.subject}</span>
                            </span>
                            <form action={removeTeacherClass}>
                              <input type="hidden" name="teacherId" value={a.teacherId} />
                              <input type="hidden" name="classId" value={c.id} />
                              <button
                                type="submit"
                                title="Hapus Penugasan"
                                className="text-slate-400 hover:text-rose-600 transition"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
