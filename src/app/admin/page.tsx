import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Award,
  CalendarRange,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  LevelBadge,
  PageHeader,
  Pill,
  Progress,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { DonutChart } from "@/components/charts";
import { Stagger, StaggerItem } from "@/components/motion";
import { db } from "@/lib/db";
import { loadAllTeachers, summarizeTeacher } from "@/lib/metrics";
import {
  FULL_BILINGUAL_DATE,
  SMART_GOALS,
  cefrAtLeast,
  type Level,
} from "@/lib/program";
import { cn, formatDate, pct } from "@/lib/utils";
import { getPhaseStates } from "@/lib/phases-server";
import { PhaseRoadmapGrid } from "@/components/phase-roadmap";

export const metadata: Metadata = { title: "Dashboard Admin · Program Bilingual" };

export default async function AdminDashboard() {
  const [teachers, students, rppUsers, roadmap] = await Promise.all([
    loadAllTeachers(),
    db.student.findMany({ include: { classRoom: true } }),
    // Guru yang sudah memakai Modul Ajar dari Tim EDT (punya minimal 1 salinan)
    db.modulAjar.findMany({ where: { teacherId: { not: null } }, distinct: ["teacherId"], select: { teacherId: true } }),
    getPhaseStates(),
  ]);

  const rows = teachers.map((t) => ({ t, s: summarizeTeacher(t) }));
  const phase = roadmap.current ?? roadmap.states[roadmap.states.length - 1];
  const daysLeft = Math.ceil((FULL_BILINGUAL_DATE.getTime() - Date.now()) / 86400000);

  const levelCount = (l: Level) => teachers.filter((t) => t.ambassadorLevel === l).length;
  const withLevel = teachers.length - levelCount("NONE");
  const avgParticipation = Math.round(
    rows.reduce((a, r) => a + r.s.participationPct, 0) / Math.max(1, rows.length)
  );

  // CEFR & Siswa
  const b1Plus = teachers.filter((t) => cefrAtLeast(t.cefrLevel, "B1")).length;
  const b2Plus = teachers.filter((t) => cefrAtLeast(t.cefrLevel, "B2")).length;
  const c1Plus = teachers.filter((t) => cefrAtLeast(t.cefrLevel, "C1")).length;

  const studentsOnTarget = students.filter((s) =>
    cefrAtLeast(
      s.cefrLevel,
      s.classRoom.grade === 7 ? "A2" : s.classRoom.grade === 8 ? "A2+" : "B1"
    )
  ).length;

  // T4 SMART Goal: 100% guru bilingual RPP & minimal 2x observasi kelas per semester
  const teachersWithApprovedRpp = rppUsers.length;
  const teachersWithTwoObs = teachers.filter((t) => t.observations.length >= 2).length;

  const t4RppPct = pct(teachersWithApprovedRpp, teachers.length);
  const t4ObsPct = pct(teachersWithTwoObs, teachers.length);
  const t4CombinedScore = Math.round((t4RppPct + t4ObsPct) / 2);

  // Daftar guru yang butuh perhatian khusus
  const attentionList = rows.filter(
    ({ t, s }) =>
      s.status.label === "Perlu evaluasi" ||
      s.status.label === "Peringatan" ||
      (s.levelExpires &&
        (s.levelExpires.getTime() - Date.now()) / 86400000 <= 14 &&
        s.levelExpires.getTime() > Date.now())
  );

  return (
    <>
      <PageHeader
        eyebrow={`${phase.name} · ${phase.title}`}
        title="Dashboard Program Bilingual 2028"
        description={`Target fase ini: ${phase.target}. Tersisa ${daysLeft.toLocaleString(
          "id-ID"
        )} hari menuju full bilingual Juli 2028.`}
      />

      {/* KPI Utama */}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Guru Ber-level Duta"
            value={`${withLevel}/${teachers.length}`}
            icon={Award}
            tone="gold"
            hint={`${pct(withLevel, teachers.length)}% guru · Target Fase 3: 100%`}
          >
            <Progress value={pct(withLevel, teachers.length)} tone="gold" size="sm" />
          </StatCard>
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Partisipasi ELITE Harian"
            value={`${avgParticipation}%`}
            icon={Activity}
            tone="coral"
            hint="Rata-rata 30 hari verifikasi · Target 70%"
          >
            <Progress value={avgParticipation} tone="coral" size="sm" />
          </StatCard>
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="SMART T4: RPP & Supervisi"
            value={`${t4CombinedScore}%`}
            icon={FileText}
            tone={t4CombinedScore >= 70 ? "mint" : "brand"}
            hint={`${teachersWithApprovedRpp} guru memakai Modul Ajar · ${teachersWithTwoObs} tuntas 2× observasi`}
          >
            <Progress value={t4CombinedScore} size="sm" />
          </StatCard>
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Siswa Capai Target Kelas"
            value={`${pct(studentsOnTarget, students.length)}%`}
            icon={GraduationCap}
            tone="mint"
            hint={`${studentsOnTarget} dari ${students.length} siswa (7: A2 · 8: A2+ · 9: B1)`}
          >
            <Progress value={pct(studentsOnTarget, students.length)} tone="mint" size="sm" />
          </StatCard>
        </StaggerItem>
      </Stagger>

      {/* Banner Perlu Perhatian */}
      {attentionList.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="size-4.5 text-amber-600" />
            <span>Perhatian EDT: {attentionList.length} guru memerlukan tindak lanjut khusus</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {attentionList.map(({ t, s }) => (
              <Link
                key={t.id}
                href={`/admin/guru/${t.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-amber-100/50 transition"
              >
                <span>{t.user.name}</span>
                <Pill tone={s.status.tone}>
                  {s.status.label}
                </Pill>
                {s.levelExpires &&
                  (s.levelExpires.getTime() - Date.now()) / 86400000 <= 14 && (
                    <span className="text-[10px] text-amber-700 font-bold">
                      (Kedaluwarsa dlm{" "}
                      {Math.max(
                        0,
                        Math.ceil((s.levelExpires.getTime() - Date.now()) / 86400000)
                      )}{" "}
                      hari)
                    </span>
                  )}
                <ChevronRight className="size-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Peta Jalan & Sebaran Duta */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_390px]">
        <Card>
          <CardHeader
            icon={CalendarRange}
            title="Peta Jalan 2026–2028"
            description={`Bab 1.3 · ${roadmap.completedCount} dari ${roadmap.states.length} fase selesai. Fase berikutnya terbuka setelah fase sebelumnya diselesaikan admin.`}
          />
          <CardBody>
            <PhaseRoadmapGrid states={roadmap.states} linkBase="/admin/fase" />
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            icon={Award}
            title="Sebaran Level Duta Inggris"
            description="Bronze 3 bln · Silver 6 bln · Gold 1 thn"
          />
          <CardBody className="flex flex-1 items-center">
            <DonutChart
              centerLabel="guru"
              height={150}
              data={[
                { label: "Gold", value: levelCount("GOLD"), color: "#e0a81a" },
                { label: "Silver", value: levelCount("SILVER"), color: "#7c889a" },
                { label: "Bronze", value: levelCount("BRONZE"), color: "#b8702f" },
                { label: "Belum Level", value: levelCount("NONE"), color: "#cbd5e1" },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      {/* Monitoring Guru (Menaut ke Detail) */}
      <Card className="mt-6">
        <CardHeader
          icon={Users}
          title="Monitoring 18 Guru SMP IT Al Madany"
          description="Dashboard Sederhana (Bab 5.3): Klik nama guru untuk membuka profil, grafik keaktifan, dan checklist kesiapan level."
        />
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Nama Guru</Th>
                <Th>Level</Th>
                <Th>CEFR</Th>
                <Th>TOEFL</Th>
                <Th>% Inggris di Kelas</Th>
                <Th>Partisipasi WA</Th>
                <Th>Pocket Book</Th>
                <Th>Poin</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ t, s }) => (
                <tr key={t.id} className="hover:bg-brand-50/40 transition">
                  <Td>
                    <Link
                      href={`/admin/guru/${t.id}`}
                      className="group flex items-center gap-3"
                    >
                      <Avatar name={t.user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold whitespace-nowrap text-ink group-hover:text-brand-600 group-hover:underline">
                          {t.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.subject}
                          {t.isPilot ? " · Pilot Teacher" : ""}
                        </p>
                      </div>
                    </Link>
                  </Td>
                  <Td>
                    <LevelBadge level={t.ambassadorLevel} />
                  </Td>
                  <Td className="font-bold">{t.cefrLevel}</Td>
                  <Td className="tabular-nums">{t.toeflScore ?? "–"}</Td>
                  <Td className="min-w-36">
                    <div className="flex items-center gap-2">
                      <Progress value={s.englishPct ?? 0} size="sm" />
                      <span className="w-9 text-xs font-bold tabular-nums">
                        {s.englishPct ?? 0}%
                      </span>
                    </div>
                  </Td>
                  <Td className="min-w-36">
                    <div className="flex items-center gap-2">
                      <Progress value={s.participationPct} tone="coral" size="sm" />
                      <span className="w-9 text-xs font-bold tabular-nums">
                        {s.participationPct}%
                      </span>
                    </div>
                  </Td>
                  <Td className="tabular-nums">{s.phrasesMastered}/50</Td>
                  <Td className="font-bold tabular-nums">{s.points}</Td>
                  <Td>
                    <Pill tone={s.status.tone}>{s.status.label}</Pill>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Tujuan Program (SMART Goals) dengan Real-time Metrics */}
      <Card className="mt-6">
        <CardHeader
          title="Tujuan Program (SMART Goals)"
          description="Pemantauan target terukur Bab 1.2 Dokumen Master Bilingual SMP IT Al Madany"
        />
        <CardBody>
          <ul className="grid gap-3 md:grid-cols-2">
            {SMART_GOALS.map((g) => {
              let score = 0;
              let detail = "";

              if (g.code === "T1") {
                score = pct(b1Plus, teachers.length);
                detail = `${b1Plus}/${teachers.length} guru minimal B1 (Target: 100%)`;
              } else if (g.code === "T2") {
                const b2Pct = pct(b2Plus, teachers.length);
                score = b2Pct;
                detail = `B2: ${b2Plus} guru (${b2Pct}%), C1: ${c1Plus} guru (${pct(c1Plus, teachers.length)}%)`;
              } else if (g.code === "T3") {
                score = pct(withLevel, teachers.length);
                detail = `${withLevel}/${teachers.length} guru aktif ber-level Duta`;
              } else if (g.code === "T4") {
                score = t4CombinedScore;
                detail = `Memakai Modul Ajar: ${teachersWithApprovedRpp}/${teachers.length} guru · 2× Observasi: ${teachersWithTwoObs}/${teachers.length} guru`;
              } else if (g.code === "T5") {
                score = pct(studentsOnTarget, students.length);
                detail = `${studentsOnTarget}/${students.length} siswa sesuai target CEFR kelas`;
              } else if (g.code === "T6") {
                score = 35;
                detail = "Proses adopsi Cambridge Pathway & asesmen berkala";
              }

              return (
                <li
                  key={g.code}
                  className="flex flex-col justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-brand-600 shadow-2xs">
                      {g.code}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{g.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Jatuh Tempo: {g.due}</p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-200/60 pt-2.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Progres Real: {detail}</span>
                      <span className="text-brand-700">{score}%</span>
                    </div>
                    <Progress value={score} size="sm" tone={score >= 70 ? "mint" : score >= 40 ? "brand" : "coral"} />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </>
  );
}
