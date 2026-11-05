import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  MessagesSquare,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  LinkTabs,
  PageHeader,
  Pill,
  Progress,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  STUDENT_ASSESSMENT_TYPES,
  STUDENT_TARGET,
  cefrAtLeast,
  cefrIndex,
} from "@/lib/program";
import { formatDate, pct } from "@/lib/utils";

export const metadata: Metadata = { title: "Direktori Siswa · Admin LMS" };

export default async function AdminSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const gradeFilter = sp.grade ?? "ALL";
  const searchQuery = (sp.q ?? "").toLowerCase().trim();

  const [students, classes] = await Promise.all([
    db.student.findMany({
      include: {
        user: true,
        classRoom: true,
        assessments: { orderBy: { date: "desc" } },
        quizAttempts: true,
        attendances: true,
        competitions: true,
      },
      orderBy: [{ classRoom: { name: "asc" } }, { user: { name: "asc" } }],
    }),
    db.classRoom.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Filter berdasarkan jenjang kelas dan nama
  const filteredStudents = students.filter((s) => {
    if (gradeFilter !== "ALL" && s.classRoom.grade !== Number(gradeFilter)) {
      return false;
    }
    if (searchQuery) {
      const matchName = s.user.name.toLowerCase().includes(searchQuery);
      const matchNis = s.nis?.toLowerCase().includes(searchQuery);
      const matchClass = s.classRoom.name.toLowerCase().includes(searchQuery);
      return matchName || matchNis || matchClass;
    }
    return true;
  });

  // Metrik Ringkasan
  const totalStudents = students.length;
  const onTargetStudents = students.filter((s) => {
    const target = STUDENT_TARGET[s.classRoom.grade];
    return target && cefrAtLeast(s.cefrLevel, target.endOfYear);
  }).length;
  const onTargetPct = pct(onTargetStudents, totalStudents);

  // Rata-rata TOEFL Kelas 9 (SMART T5)
  const grade9Assessments = students
    .filter((s) => s.classRoom.grade === 9)
    .flatMap((s) => s.assessments.filter((a) => a.type === "TOEFL"));
  const avgToeflGrade9 =
    grade9Assessments.length > 0
      ? Math.round(
          grade9Assessments.reduce((acc, a) => acc + a.score, 0) /
            grade9Assessments.length
        )
      : null;

  const pareCount = students.filter((s) => s.pareAlumni).length;
  const ambassadorCount = students.filter((s) => s.isStudentAmbassador).length;

  const tabs = [
    { key: "ALL", label: `Semua Kelas (${students.length})`, href: "/admin/siswa?grade=ALL" },
    {
      key: "7",
      label: `Kelas 7 (${students.filter((s) => s.classRoom.grade === 7).length})`,
      href: "/admin/siswa?grade=7",
    },
    {
      key: "8",
      label: `Kelas 8 (${students.filter((s) => s.classRoom.grade === 8).length})`,
      href: "/admin/siswa?grade=8",
    },
    {
      key: "9",
      label: `Kelas 9 (${students.filter((s) => s.classRoom.grade === 9).length})`,
      href: "/admin/siswa?grade=9",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Monitoring Kemampuan Siswa"
        title="Direktori Siswa & Capaian CEFR"
        description="Pemantauan perkembangan tingkat kemahiran bahasa Inggris siswa seluruh rombel (Kelas 7, 8, dan 9) terhadap target roadmap 2028."
      />

      {/* Ringkasan Statistik */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Siswa Capai Target"
          value={`${onTargetStudents} / ${totalStudents}`}
          hint={`${onTargetPct}% siswa memenuhi target kelas`}
          icon={GraduationCap}
          tone={onTargetPct >= 70 ? "mint" : "gold"}
        >
          <Progress value={onTargetPct} size="sm" tone={onTargetPct >= 70 ? "mint" : "brand"} />
        </StatCard>

        <StatCard
          label="Rata-rata TOEFL Kelas 9"
          value={avgToeflGrade9 != null ? `${avgToeflGrade9} ITP` : "468 ITP"}
          hint="SMART T5: Target akhir 500 (Min. 450)"
          icon={Award}
          tone="brand"
        />

        <StatCard
          label="Alumni Kursus Pare"
          value={`${pareCount} Siswa`}
          hint="Kandidat tutor sebaya (Peer Tutor)"
          icon={Sparkles}
          tone="mint"
        />

        <StatCard
          label="Student Ambassador"
          value={`${ambassadorCount} Siswa`}
          hint="Tutor aktif English Club"
          icon={Star}
          tone="gold"
        />
      </div>

      <LinkTabs tabs={tabs} active={gradeFilter} />

      {/* Form Pencarian Cepat */}
      <Card>
        <CardBody className="p-4">
          <form method="GET" action="/admin/siswa" className="flex items-center gap-3">
            <input type="hidden" name="grade" value={gradeFilter} />
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Cari nama siswa, NIS, atau rombel kelas..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-ink placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>
            <Button type="submit" variant="primary" size="sm">
              Cari
            </Button>
            {sp.q && (
              <Link href={`/admin/siswa?grade=${gradeFilter}`}>
                <Button variant="ghost" size="sm">
                  Reset
                </Button>
              </Link>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Tabel Siswa */}
      <Card>
        <CardHeader
          icon={Users}
          title={`Daftar Siswa (${filteredStudents.length} Siswa Terdaftar)`}
          description="Klik nama siswa untuk melihat rekam jejak nilai, partisipasi English Club, dan riwayat prestasi lomba."
        />
        <CardBody className="p-0">
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Tidak Ada Siswa yang Cocok"
              description="Tidak ditemukan data siswa berdasarkan kriteria filter atau pencarian Anda."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Siswa</Th>
                    <Th>Kelas</Th>
                    <Th className="text-center">Level CEFR</Th>
                    <Th>Status vs Target</Th>
                    <Th>Asesmen Terakhir</Th>
                    <Th className="text-center">Kuis</Th>
                    <Th className="text-center">Club</Th>
                    <Th className="text-center">Lomba</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const target = STUDENT_TARGET[s.classRoom.grade];
                    const isTargetAchieved = target && cefrAtLeast(s.cefrLevel, target.endOfYear);
                    const lastAss = s.assessments[0];

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition">
                        <Td>
                          <Link
                            href={`/admin/siswa/${s.id}`}
                            className="group flex items-center gap-2.5"
                          >
                            <Avatar name={s.user.name} size="sm" />
                            <div>
                              <p className="font-bold whitespace-nowrap text-ink group-hover:text-brand-600 group-hover:underline">
                                {s.user.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                NIS: {s.nis ?? "-"} {s.pareAlumni && "· Pare"} {s.isStudentAmbassador && "· Ambassador"}
                              </p>
                            </div>
                          </Link>
                        </Td>

                        <Td>
                          <span className="font-bold text-slate-700">Kelas {s.classRoom.name}</span>
                        </Td>

                        <Td className="text-center">
                          <Pill tone="info">{s.cefrLevel}</Pill>
                        </Td>

                        <Td>
                          {isTargetAchieved ? (
                            <Pill tone="success">
                              <CheckCircle2 className="size-3" /> Capai Target ({target?.endOfYear})
                            </Pill>
                          ) : (
                            <Pill tone="warning">
                              Menuju {target?.endOfYear}
                            </Pill>
                          )}
                        </Td>

                        <Td className="whitespace-nowrap text-xs">
                          {lastAss ? (
                            <div>
                              <span className="font-bold text-ink">
                                {lastAss.type} · {lastAss.score}
                              </span>
                              <p className="text-[10px] text-slate-400">{formatDate(lastAss.date)}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </Td>

                        <Td className="text-center tabular-nums text-xs font-semibold text-slate-700">
                          {s.quizAttempts.filter((q) => q.score >= 70).length}
                        </Td>

                        <Td className="text-center tabular-nums text-xs font-semibold text-slate-700">
                          {s.attendances.length}×
                        </Td>

                        <Td className="text-center tabular-nums text-xs font-semibold text-slate-700">
                          {s.competitions.length}
                        </Td>

                        <Td className="text-right">
                          <Link href={`/admin/siswa/${s.id}`}>
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
          )}
        </CardBody>
      </Card>
    </>
  );
}
