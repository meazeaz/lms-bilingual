import type { Metadata } from "next";
import { GraduationCap, Settings, ShieldCheck, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSchoolSubjects } from "@/lib/settings-server";
import { ClassRoomItem, PenggunaClient, UserListItem } from "./pengguna-client";

export const metadata: Metadata = {
  title: "Manajemen Pengguna & Kelas",
};

export default async function AdminPenggunaPage() {
  const admin = await requireAdmin();

  const [usersRaw, classesRaw, subjects] = await Promise.all([
    db.user.findMany({
      include: {
        teacher: {
          include: {
            classes: {
              include: {
                classRoom: {
                  select: { name: true, grade: true },
                },
              },
            },
          },
        },
        student: {
          include: {
            classRoom: {
              select: { id: true, name: true, grade: true },
            },
          },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    db.classRoom.findMany({
      include: {
        _count: {
          select: { students: true },
        },
        teachers: {
          include: {
            teacher: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: [{ grade: "asc" }, { name: "asc" }],
    }),
    getSchoolSubjects(),
  ]);

  const users: UserListItem[] = usersRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    title: u.title,
    active: u.active,
    createdAt: u.createdAt,
    teacher: u.teacher
      ? {
          id: u.teacher.id,
          nip: u.teacher.nip,
          subject: u.teacher.subject,
          whatsapp: u.teacher.whatsapp,
          cefrLevel: u.teacher.cefrLevel,
          isPilot: u.teacher.isPilot,
          assignments: u.teacher.classes.map((a) => ({
            id: a.id,
            classId: a.classId,
            isHomeroom: a.isHomeroom,
            classRoom: a.classRoom,
          })),
        }
      : null,
    student: u.student
      ? {
          id: u.student.id,
          nis: u.student.nis,
          cefrLevel: u.student.cefrLevel,
          pareAlumni: u.student.pareAlumni,
          isStudentAmbassador: u.student.isStudentAmbassador,
          classRoom: u.student.classRoom,
        }
      : null,
  }));

  const classes: ClassRoomItem[] = classesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    studentsCount: c._count.students,
    assignments: c.teachers.map((a) => ({
      id: a.id,
      teacherId: a.teacherId,
      isHomeroom: a.isHomeroom,
      teacher: {
        id: a.teacher.id,
        user: a.teacher.user,
        subject: a.teacher.subject,
      },
    })),
  }));

  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <>
      <PageHeader
        eyebrow="Administrasi & Akses Sistem"
        title="Manajemen Pengguna & Rombel"
        description="Kelola akun kredensial seluruh dewan guru, siswa, admin EDT, penugasan mengajar, serta rombongan belajar (kelas)."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={Users}
          label="Dewan Guru"
          value={teacherCount}
          hint="Akun Pendidik Aktif"
          tone="brand"
        />
        <StatCard
          icon={GraduationCap}
          label="Seluruh Siswa"
          value={studentCount}
          hint="Terdaftar di kelas"
          tone="mint"
        />
        <StatCard
          icon={Settings}
          label="Rombongan Belajar"
          value={classes.length}
          hint="Kelas 7, 8, & 9"
          tone="gold"
        />
        <StatCard
          icon={ShieldCheck}
          label="Tim EDT / Admin"
          value={adminCount}
          hint="Hak kelola penuh"
          tone="coral"
        />
      </div>

      <PenggunaClient
        users={users}
        classes={classes}
        currentAdminId={admin.id}
        availableSubjects={subjects}
      />
    </>
  );
}
