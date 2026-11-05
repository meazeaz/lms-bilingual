import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StudentDetailView } from "@/components/student-detail";
import { canViewStudent, requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Detail Siswa",
};

export default async function GuruStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeacher();
  const { id } = await params;

  const allowed = await canViewStudent(id);
  if (!allowed) {
    redirect("/guru/siswa");
  }

  const student = await db.student.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      classRoom: true,
      assessments: {
        include: {
          teacher: { include: { user: { select: { name: true } } } },
        },
        orderBy: { date: "desc" },
      },
      quizAttempts: {
        include: {
          quiz: {
            include: {
              material: { select: { title: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        include: { session: true },
        orderBy: { session: { date: "desc" } },
      },
      competitions: {
        include: { competition: true },
        orderBy: { competition: { date: "desc" } },
      },
    },
  });

  if (!student) notFound();

  return (
    <StudentDetailView
      student={student}
      backHref="/guru/siswa"
      backLabel="Kembali ke Data Siswa"
    />
  );
}
