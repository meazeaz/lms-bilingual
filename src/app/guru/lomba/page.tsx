import type { Metadata } from "next";
import { Award, Calendar, Medal, Sparkles, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader, Pill, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { COMPETITION_TARGETS } from "@/lib/program";
import {
  CompetitionViewContainer,
  type CompetitionEntryItem,
  type CompetitionItem,
  type StudentOptionItem,
} from "./lomba-client";

export const metadata: Metadata = { title: "Ajang Lomba & Prestasi Siswa · Guru" };

export default async function GuruLombaPage() {
  await requireTeacher();

  const [rawCompetitions, rawEntries, rawStudents] = await Promise.all([
    db.competition.findMany({
      orderBy: { date: "desc" },
    }),
    db.competitionEntry.findMany({
      include: {
        competition: true,
        student: { include: { user: true, classRoom: true } },
      },
      orderBy: { competition: { date: "desc" } },
    }),
    db.student.findMany({
      include: { user: true, classRoom: true },
      orderBy: [{ classRoom: { name: "asc" } }, { user: { name: "asc" } }],
    }),
  ]);

  const competitions: CompetitionItem[] = rawCompetitions.map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    category: c.category,
    organizer: c.organizer,
    date: c.date.toISOString(),
  }));

  const entries: CompetitionEntryItem[] = rawEntries.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    studentName: e.student.user.name,
    className: e.student.classRoom.name,
    competitionName: e.competition.name,
    level: e.competition.level,
    category: e.competition.category,
    result: e.result,
    points: e.points,
    notes: e.notes,
    date: e.competition.date.toISOString(),
  }));

  const students: StudentOptionItem[] = rawStudents.map((s) => ({
    id: s.id,
    name: s.user.name,
    className: s.classRoom.name,
    cefrLevel: s.cefrLevel,
  }));

  const totalWinners = entries.filter((e) => e.result.includes("JUARA")).length;
  const totalPoints = entries.reduce((acc, e) => acc + e.points, 0);

  return (
    <>
      <PageHeader
        eyebrow="Target Kejuaraan Tahunan (Bab 7.3–7.9)"
        title="Ajang Lomba & Prestasi Siswa"
        description="Fasilitasi delegasi siswa dalam kejuaraan Spelling Bee, Storytelling, Speech, Debate, dan Olympiad tingkat kecamatan hingga nasional."
      />

      {/* Ringkasan Statistik Lomba */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Event Diikuti"
          value={`${competitions.length} Lomba`}
          hint="Agenda kompetisi terdaftar"
          icon={Calendar}
          tone="brand"
        />
        <StatCard
          label="Total Raihan Juara"
          value={`${totalWinners} Prestasi`}
          hint="Juara 1, 2, 3 & Harapan"
          icon={Trophy}
          tone="gold"
        />
        <StatCard
          label="Total Siswa Berkompetisi"
          value={`${entries.length} Delegasi`}
          hint="Pengalaman bertanding nyata"
          icon={Medal}
          tone="mint"
        />
        <StatCard
          label="Akumulasi Poin Prestasi"
          value={`+${totalPoints} Poin`}
          hint="Poin ekstrakurikuler delegasi"
          icon={Sparkles}
          tone="gold"
        />
      </div>

      {/* Target Tahunan Sekolah (Bab 7.9) */}
      <Card>
        <CardHeader
          icon={Trophy}
          title="Target Prestasi Lomba Bahasa Inggris Per Tingkat (Bab 7.9)"
          description="Sasaran pencapaian delegasi SMP IT Al Madany dalam kalender kompetisi tahunan."
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COMPETITION_TARGETS.map((t) => {
              const matchedEntries = entries.filter((e) => e.level === t.level);
              const winners = matchedEntries.filter((e) => e.result.includes("JUARA")).length;

              return (
                <div key={t.level} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-brand-800">
                      Tingkat {t.level}
                    </span>
                    <Pill tone={winners > 0 ? "success" : "info"}>
                      {winners} Juara Diraih
                    </Pill>
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800">Partisipasi: </span>
                      {t.participation}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800">Target Juara: </span>
                      {t.winners}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <CompetitionViewContainer
        competitions={competitions}
        entries={entries}
        students={students}
      />
    </>
  );
}
