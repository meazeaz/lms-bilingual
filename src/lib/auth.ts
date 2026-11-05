import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";

/** Data Access Layer: satu-satunya pintu untuk membaca pengguna yang sedang login. */
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { teacher: true, student: { include: { classRoom: true } } },
  });
  if (!user || !user.active) return null;
  // Sesi yang terbit sebelum password diganti/di-reset dianggap tidak berlaku (toleransi 1 detik pembulatan iat)
  if (user.passwordChangedAt && session.issuedAt < user.passwordChangedAt.getTime() - 1000) return null;
  return user;
});

/** Sesi tidak valid lagi (akun nonaktif / password diganti): kirim ke login dan biarkan proxy menghapus cookie. */
const EXPIRED = "/login?expired=1";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect(EXPIRED);
  if (user.role !== "ADMIN") redirect("/login");
  return user;
}

export async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user) redirect(EXPIRED);
  if (user.role !== "TEACHER" || !user.teacher) redirect("/login");
  return { ...user, teacher: user.teacher };
}

export async function requireStudent() {
  const user = await getCurrentUser();
  if (!user) redirect(EXPIRED);
  if (user.role !== "STUDENT" || !user.student) redirect("/login");
  return { ...user, student: user.student };
}

/** Pengguna login dengan peran apa pun (untuk halaman akun bersama). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect(EXPIRED);
  return user;
}

/** Guru hanya boleh melihat siswa di kelas yang diampunya; admin boleh semua. */
export async function canViewStudent(studentId: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role !== "TEACHER" || !user.teacher) return false;
  const student = await db.student.findUnique({ where: { id: studentId }, select: { classId: true } });
  if (!student) return false;
  const assignment = await db.teachingAssignment.findFirst({
    where: { teacherId: user.teacher.id, classId: student.classId },
  });
  return Boolean(assignment);
}
