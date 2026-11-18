import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarRange, ClipboardCheck, Megaphone, Sparkles, Target, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader, Pill, Progress, Ring, StatCard } from "@/components/ui";
import { TrendChart } from "@/components/charts";
import { HoverLift, Stagger, StaggerItem } from "@/components/motion";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentPoints } from "@/lib/metrics";
import { STUDENT_ASSESSMENT_TYPES, STUDENT_CEFR, STUDENT_TARGET, cefrAtLeast, cefrIndex } from "@/lib/program";
import { formatDate, pct } from "@/lib/utils";
import { getPhaseStates } from "@/lib/phases-server";
import { PhaseRoadmapGrid } from "@/components/phase-roadmap";

export const metadata: Metadata = { title: "Beranda Siswa" };

export default async function StudentHome() {
  const { student, name } = await requireStudent();
  const grade = student.classRoom.grade;
  const target = STUDENT_TARGET[grade];
  const [assessments, materials, points, announcements, roadmap] = await Promise.all([
    db.studentAssessment.findMany({ where: { studentId: student.id }, orderBy: { date: "asc" }, include: { teacher: { include: { user: true } } } }),
    db.material.findMany({ where: { published: true, OR: [{ grade }, { grade: null }] }, include: { quizzes: { include: { attempts: { where: { studentId: student.id } } } } } }),
    studentPoints(student.id),
    db.announcement.findMany({ where: { audience: { in: ["ALL", "STUDENT"] } }, orderBy: { createdAt: "desc" }, take: 2 }),
    getPhaseStates(),
  ]);
  const phase = roadmap.current ?? roadmap.states[roadmap.states.length - 1];
  const reached = cefrAtLeast(student.cefrLevel, target.endOfYear);
  const progress = Math.min(100, pct(cefrIndex(student.cefrLevel) + 1, cefrIndex(target.endOfYear) + 1));
  const chart = assessments.map((a) => ({ tanggal: formatDate(a.date), level: cefrIndex(a.cefrLevel) }));
  const todo = materials.filter((m) => !m.quizzes.some((q) => q.attempts.some((a) => a.score >= q.passScore)));

  return (
    <>
      <PageHeader eyebrow={`Kelas ${student.classRoom.name}`} title={`Hi, ${name.split(" ")[0]}! Ready to learn?`} description="Tidak harus langsung lancar. Yang penting berani mencoba dan paham instruksi guru." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Ring value={progress} size={132} stroke={13} color={reached ? "#1fbf8c" : "#6366f1"}
            label={<span className="text-center leading-tight"><span className="block font-[family-name:var(--font-display)] text-3xl font-bold">{student.cefrLevel}</span><span className="text-[11px] font-bold text-slate-500">level CEFR</span></span>} />
          <div>
            <Pill tone={reached ? "success" : "info"}>{reached ? "Target tercapai 🎉" : `Target akhir tahun: ${target.endOfYear}`}</Pill>
            <h2 className="mt-2 text-2xl font-semibold">{reached ? "Hebat! Kamu sudah di target kelasmu." : `Satu langkah lagi menuju ${target.endOfYear}`}</h2>
            <p className="mt-1 text-sm text-slate-500">Target saat lulus 2028: <b className="text-ink">{target.graduation}</b>. Asesmen kelas {grade}: {target.assessment.toLowerCase()} ({target.frequency}).</p>
          </div>
        </Card>
        <Stagger className="grid grid-cols-2 gap-4">
          <StaggerItem><StatCard label="Poin" value={points.total} icon={Sparkles} tone="gold" hint="Kuis, club, dan lomba" /></StaggerItem>
          <StaggerItem><StatCard label="Kuis lulus" value={points.quizzesPassed} icon={ClipboardCheck} tone="mint" hint={`dari ${materials.length} materi`} /></StaggerItem>
          <StaggerItem><StatCard label="Kehadiran club" value={points.attendance} icon={Target} tone="coral" hint="English Club & Peer Tutoring" /></StaggerItem>
          <StaggerItem><StatCard label="Lomba" value={points.competitions} icon={Trophy} tone="brand" hint="Kompetisi diikuti" /></StaggerItem>
        </Stagger>
      </div>

      <Card className="mt-6">
        <CardHeader
          icon={CalendarRange}
          title="Peta Jalan Sekolah Bilingual 2026–2028"
          description={`${roadmap.completedCount} dari ${roadmap.states.length} fase selesai. Sekolah kita sedang di ${phase.name}: ${phase.title}.`}
        />
        <CardBody>
          <PhaseRoadmapGrid states={roadmap.states} />
          <p className="mt-3 text-xs text-slate-500">Ini langkah-langkah sekolah menuju belajar penuh dalam dua bahasa pada Juli 2028. Setiap fase dibuka berurutan oleh Tim EDT.</p>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader icon={ClipboardCheck} title="Perkembangan level" description="Dari hasil asesmen guru Bahasa Inggris" />
          <CardBody>
            {chart.length > 1 ? (
              <TrendChart data={chart} xKey="tanggal" series={[{ key: "level", label: "Level CEFR" }]} yDomain={[0, 6]} yTicks={[0, 1, 2, 3, 4, 5, 6]} yLabels={STUDENT_CEFR} height={220} />
            ) : <p className="text-sm text-slate-500">Grafik muncul setelah ada minimal 2 asesmen.</p>}
            <ul className="mt-4 space-y-2">
              {[...assessments].reverse().map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm">
                  <span><b className="text-ink">{STUDENT_ASSESSMENT_TYPES[a.type]}</b> <span className="text-slate-500">· {formatDate(a.date)} · {a.teacher.user.name}</span></span>
                  <span className="flex shrink-0 items-center gap-2"><Pill tone="info">{a.cefrLevel}</Pill><b className="tabular-nums">{a.score}</b></span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader icon={BookOpen} title="Lanjutkan belajar" description={`${todo.length} materi belum lulus kuis`} />
            <CardBody className="space-y-2.5">
              {todo.slice(0, 4).map((m) => (
                <HoverLift key={m.id}>
                  <Link href={`/siswa/materi/${m.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-brand-300">
                    <span className="min-w-0"><span className="block truncate font-bold text-ink">{m.title}</span><span className="text-xs text-slate-500">{m.subject} · {m.cefrLevel}</span></span>
                    <Pill tone="coral">Mulai</Pill>
                  </Link>
                </HoverLift>
              ))}
              {todo.length === 0 && <p className="text-sm text-slate-500">Semua kuis sudah lulus. Keren!</p>}
            </CardBody>
          </Card>
          <Card>
            <CardHeader icon={Megaphone} title="Pengumuman" />
            <CardBody className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id}><p className="font-bold text-ink">{a.title}</p><p className="text-sm text-slate-600">{a.body}</p></div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
      <Progress value={0} className="hidden" />
    </>
  );
}
