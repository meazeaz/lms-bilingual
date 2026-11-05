import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { Avatar, Button, Card, CardHeader, PageHeader, Pill, Progress, Table, Td, Th } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { STUDENT_ASSESSMENT_TYPES, STUDENT_TARGET, cefrAtLeast, cefrIndex } from "@/lib/program";
import { formatDate, pct } from "@/lib/utils";

export const metadata: Metadata = { title: "Progress Siswa" };

export default async function MyStudentsPage() {
  const { teacher } = await requireTeacher();
  const assignments = await db.teachingAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      classRoom: {
        include: {
          students: {
            include: { user: true, assessments: { orderBy: { date: "desc" } }, quizAttempts: true, attendances: true },
            orderBy: { user: { name: "asc" } },
          },
        },
      },
    },
    orderBy: { classRoom: { name: "asc" } },
  });

  return (
    <>
      <PageHeader eyebrow="Siswa di kelas yang Anda ampu" title="Progress siswa" description="Level CEFR siswa dibandingkan target akhir tahun per kelas (Bab 2.2). Asesmen siswa dilakukan oleh guru Bahasa Inggris." />
      <div className="space-y-6">
        {assignments.map(({ classRoom: c, isHomeroom }) => {
          const target = STUDENT_TARGET[c.grade];
          const onTarget = c.students.filter((s) => cefrAtLeast(s.cefrLevel, target.endOfYear)).length;
          return (
            <Card key={c.id}>
              <CardHeader
                icon={GraduationCap}
                title={`Kelas ${c.name}${isHomeroom ? " · wali kelas" : ""}`}
                description={`Target akhir tahun ${target.endOfYear} · target lulus ${target.graduation} · ${target.assessment} (${target.frequency})`}
                action={<Pill tone={pct(onTarget, c.students.length) >= 60 ? "success" : "warning"}>{onTarget}/{c.students.length} capai target</Pill>}
              />
              <div className="mt-4">
                <Table>
                  <thead><tr><Th>Siswa</Th><Th>Level CEFR</Th><Th>Menuju target</Th><Th>Asesmen terakhir</Th><Th>Kuis</Th><Th>Club</Th><Th>Catatan</Th><Th className="text-right">Aksi</Th></tr></thead>
                  <tbody>
                    {c.students.map((s) => {
                      const last = s.assessments[0];
                      const progress = Math.min(100, pct(cefrIndex(s.cefrLevel) + 1, cefrIndex(target.endOfYear) + 1));
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition">
                          <Td>
                            <Link href={`/guru/siswa/${s.id}`} className="group flex items-center gap-2.5">
                              <Avatar name={s.user.name} size="sm" />
                              <div>
                                <p className="font-bold whitespace-nowrap text-ink group-hover:text-brand-600 group-hover:underline">{s.user.name}</p>
                                <p className="text-xs text-slate-500">{s.pareAlumni ? "Alumni Pare" : "Reguler"}{s.isStudentAmbassador ? " · Student Ambassador" : ""}</p>
                              </div>
                            </Link>
                          </Td>
                          <Td><Pill tone={cefrAtLeast(s.cefrLevel, target.endOfYear) ? "success" : "info"}>{s.cefrLevel}</Pill></Td>
                          <Td className="min-w-32"><Progress value={progress} tone={progress >= 100 ? "mint" : "brand"} size="sm" /></Td>
                          <Td className="whitespace-nowrap text-xs">{last ? <><span className="font-bold text-ink">{STUDENT_ASSESSMENT_TYPES[last.type]} · {last.score}</span><br /><span className="text-slate-500">{formatDate(last.date)}</span></> : "–"}</Td>
                          <Td className="tabular-nums">{s.quizAttempts.filter((q) => q.score >= 70).length} lulus</Td>
                          <Td className="tabular-nums">{s.attendances.length}×</Td>
                          <Td className="max-w-56 text-xs text-slate-500">{last?.notes ?? "–"}</Td>
                          <Td className="text-right">
                            <Link href={`/guru/siswa/${s.id}`}>
                              <Button variant="ghost" size="sm">
                                Detail <ChevronRight className="size-3.5" />
                              </Button>
                            </Link>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
