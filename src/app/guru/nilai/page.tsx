import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, GraduationCap, History, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, EmptyState, PageHeader, Pill, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { StudentGradeForm, type ClassOption } from "./nilai-client";

export const metadata: Metadata = { title: "Input Nilai & Pemetaan CEFR Siswa" };

export default async function GuruNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const sp = await searchParams;
  const { teacher } = await requireTeacher();

  // Ambil kelas yang diampu guru
  const assignments = await db.teachingAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      classRoom: {
        include: {
          students: {
            include: {
              user: true,
              assessments: {
                orderBy: { date: "desc" },
              },
            },
            orderBy: { user: { name: "asc" } },
          },
        },
      },
    },
    orderBy: { classRoom: { name: "asc" } },
  });

  const classes: ClassOption[] = assignments.map(({ classRoom }) => ({
    id: classRoom.id,
    name: classRoom.name,
    grade: classRoom.grade,
    students: classRoom.students.map((s) => ({
      id: s.id,
      name: s.user.name,
      nis: s.nis,
      cefrLevel: s.cefrLevel,
      pareAlumni: s.pareAlumni,
      isStudentAmbassador: s.isStudentAmbassador,
      assessments: s.assessments.map((a) => ({
        id: a.id,
        type: a.type,
        semester: a.semester,
        score: a.score,
        cefrLevel: a.cefrLevel,
        listening: a.listening,
        speaking: a.speaking,
        reading: a.reading,
        writing: a.writing,
        useOfEnglish: a.useOfEnglish,
        notes: a.notes,
        date: a.date.toISOString(),
      })),
    })),
  }));

  // Riwayat asesmen terbaru yang diinput oleh guru ini
  const recentAssessments = await db.studentAssessment.findMany({
    where: { teacherId: teacher.id },
    include: {
      student: { include: { user: true, classRoom: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Bab 2.2 Dokumen Master Bilingual"
        title="Input Nilai & Pemetaan CEFR Siswa"
        description="Pencatatan berkala asesmen kemampuan bahasa Inggris siswa per kelas: Observasi (Kelas 7), Speaking Test (Kelas 8), dan TOEFL ITP Prediction (Kelas 9)."
      />

      {/* Ringkasan Statistik */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kelas Yang Diampu"
          value={`${classes.length} Rombel`}
          hint="Penugasan mengajar aktif"
          icon={GraduationCap}
          tone="brand"
        />
        <StatCard
          label="Total Siswa"
          value={`${totalStudents} Siswa`}
          hint="Di bawah bimbingan Anda"
          icon={Sparkles}
          tone="mint"
        />
        <StatCard
          label="Asesmen Telah Dicatat"
          value={recentAssessments.length}
          hint="Riwayat input tersimpan"
          icon={ClipboardCheck}
          tone="gold"
        />
        <StatCard
          label="Target TOEFL Kelas 9"
          value="Min. 450"
          hint="Target kelulusan 2028: 500"
          icon={CheckCircle2}
          tone="brand"
        />
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Belum Ada Kelas yang Ditugaskan"
          description="Hubungi administrator atau Tim Kurikulum untuk mengatur jadwal penugasan mengajar Anda."
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={ClipboardCheck}
              title="Formulir Penilaian Massal Siswa"
              description="Pilih kelas di bawah ini dan masukkan nilai atau skor TOEFL siswa. Level CEFR akan diperbarui secara otomatis."
            />
            <CardBody>
              <StudentGradeForm
                classes={classes}
                initialClassId={sp.classId}
              />
            </CardBody>
          </Card>

          {/* Riwayat Asesmen Terbaru */}
          <Card>
            <CardHeader
              icon={History}
              title="Riwayat Asesmen Terakhir yang Anda Input"
              description="Daftar 10 penilaian siswa terakhir yang tercatat dalam sistem."
            />
            <CardBody className="p-0">
              {recentAssessments.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Belum ada data asesmen yang tersimpan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Siswa</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4">Jenis Asesmen</th>
                        <th className="py-3 px-4 text-center">Skor</th>
                        <th className="py-3 px-4 text-center">Level CEFR</th>
                        <th className="py-3 px-4">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentAssessments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-semibold">
                            {formatDate(a.date)}
                          </td>
                          <td className="py-3 px-4 font-bold text-ink">
                            {a.student.user.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {a.student.classRoom.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">{a.type}</span> · {a.semester}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-brand-700">
                            {a.score}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Pill tone="info">{a.cefrLevel}</Pill>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {a.notes ?? "-"}
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
      )}
    </>
  );
}
