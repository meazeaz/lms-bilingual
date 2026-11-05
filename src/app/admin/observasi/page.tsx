import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Eye, Plus, ShieldAlert, Users } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  LevelBadge,
  LinkTabs,
  PageHeader,
  Pill,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Level } from "@/lib/program";
import { getSchoolSubjects } from "@/lib/settings-server";
import {
  ObservationForm,
  ObservationHistoryTable,
  type ObservationRecordItem,
  type TeacherOption,
} from "./observasi-client";

export const metadata: Metadata = { title: "Observasi Kelas Guru · Admin LMS" };

export default async function AdminObservasiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; teacherId?: string }>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "monitoring";
  const preselectedTeacherId = sp.teacherId;

  const [teachers, rawObservations, subjects] = await Promise.all([
    db.teacher.findMany({
      where: { user: { active: true } },
      include: {
        user: true,
        observations: { orderBy: { date: "desc" } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    db.observation.findMany({
      include: {
        teacher: { include: { user: true } },
        observer: true,
      },
      orderBy: { date: "desc" },
    }),
    getSchoolSubjects(),
  ]);

  const teacherOptions: TeacherOption[] = teachers.map((t) => ({
    id: t.id,
    name: t.user.name,
    subject: t.subject,
    level: t.ambassadorLevel,
  }));

  const observations: ObservationRecordItem[] = rawObservations.map((o) => ({
    id: o.id,
    date: o.date.toISOString(),
    subject: o.subject,
    className: o.className,
    score: o.score,
    englishPctBucket: o.englishPctBucket,
    englishPct: o.englishPct,
    strengths: o.strengths,
    improvements: o.improvements,
    recommendation: o.recommendation,
    recommendationNote: o.recommendationNote,
    feedbackGiven: o.feedbackGiven,
    checklist: o.checklist,
    teacher: {
      id: o.teacher.id,
      user: { name: o.teacher.user.name, email: o.teacher.user.email },
      ambassadorLevel: o.teacher.ambassadorLevel,
      subject: o.teacher.subject,
    },
    observer: {
      name: o.observer.name,
    },
  }));

  // Monitoring metrik target 2x per semester (SOP Lampiran 4A & SMART T4)
  const qualifiedCount = teachers.filter((t) => t.observations.length >= 2).length;
  const oneCount = teachers.filter((t) => t.observations.length === 1).length;
  const zeroCount = teachers.filter((t) => t.observations.length === 0).length;
  const progressPct = Math.round((qualifiedCount / Math.max(1, teachers.length)) * 100);

  const tabs = [
    { key: "monitoring", label: "Monitoring Semester", href: "/admin/observasi?tab=monitoring" },
    { key: "baru", label: "Input Observasi Baru", href: "/admin/observasi?tab=baru" },
    { key: "riwayat", label: "Riwayat Observasi", href: "/admin/observasi?tab=riwayat", count: observations.length },
  ];

  return (
    <>
      <PageHeader
        eyebrow="SOP Supervisi & Penjaminan Mutu"
        title="Observasi Kelas Bilingual"
        description="Pelaksanaan observasi kelas tatap muka oleh Kepala Sekolah, Tim Kurikulum, dan Tim EDT (target minimal 2× per semester per guru sesuai Lampiran 4A Juknis Bilingual)."
      />

      {/* Ringkasan Capaian SMART Goal T4 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Capaian Target Supervisi"
          value={`${qualifiedCount} / ${teachers.length}`}
          hint={`${progressPct}% guru tuntas 2× observasi semester ini`}
          icon={CheckCircle2}
          tone={progressPct >= 75 ? "mint" : progressPct >= 40 ? "gold" : "coral"}
        />
        <StatCard
          label="Baru 1× Observasi"
          value={oneCount}
          hint="Perlu 1 jadwal observasi lagi"
          icon={Eye}
          tone="gold"
        />
        <StatCard
          label="Belum Diobservasi"
          value={zeroCount}
          hint="Perlu dijadwalkan segera"
          icon={Users}
          tone={zeroCount > 0 ? "coral" : "mint"}
        />
        <StatCard
          label="Total Sesi Dilakukan"
          value={observations.length}
          hint="Akumulasi lembar observasi tersimpan"
          icon={ClipboardCheck}
          tone="brand"
        />
      </div>

      <LinkTabs tabs={tabs} active={activeTab} />

      {/* ───────────── TAB 1: MONITORING SEMESTER ───────────── */}
      {activeTab === "monitoring" && (
        <Card>
          <CardHeader
            icon={ClipboardCheck}
            title="Monitoring Ketercapaian Observasi 18 Guru"
            description="Setiap guru wajib diobservasi minimal 2 kali per semester dengan evaluasi 10 aspek pedagogik & estimasi proporsi bahasa Inggris."
            action={
              <Link href="/admin/observasi?tab=baru">
                <Button variant="primary" size="sm">
                  <Plus className="size-4" /> Observasi Baru
                </Button>
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Th>Guru</Th>
                    <Th>Level Duta</Th>
                    <Th className="text-center">Realisasi</Th>
                    <Th>Status Capaian</Th>
                    <Th className="text-center">Rata-rata Skor</Th>
                    <Th className="text-center">Rata-rata % Inggris</Th>
                    <Th>Observasi Terakhir</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const count = t.observations.length;
                    const avgScore =
                      count > 0
                        ? Math.round(t.observations.reduce((s, o) => s + o.score, 0) / count)
                        : null;
                    const avgPct =
                      count > 0
                        ? Math.round(t.observations.reduce((s, o) => s + o.englishPct, 0) / count)
                        : null;
                    const latest = t.observations[0];

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition">
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={t.user.name} size="sm" />
                            <div>
                              <p className="font-bold text-ink">{t.user.name}</p>
                              <p className="text-xs text-slate-400">{t.subject}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <LevelBadge level={t.ambassadorLevel as Level} />
                        </Td>
                        <Td className="text-center font-black text-ink">
                          {count} / 2×
                        </Td>
                        <Td>
                          {count >= 2 ? (
                            <Pill tone="success">
                              <CheckCircle2 className="size-3.5" /> Tuntas (≥2×)
                            </Pill>
                          ) : count === 1 ? (
                            <Pill tone="warning">
                              Baru 1× (Kurang 1×)
                            </Pill>
                          ) : (
                            <Pill tone="danger">
                              Belum Ada
                            </Pill>
                          )}
                        </Td>
                        <Td className="text-center">
                          {avgScore != null ? (
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-black ${
                                avgScore >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : avgScore >= 60
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {avgScore}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </Td>
                        <Td className="text-center font-bold text-slate-700">
                          {avgPct != null ? `${avgPct}%` : "-"}
                        </Td>
                        <Td className="text-xs text-slate-500">
                          {latest ? formatDate(latest.date) : "Belum pernah"}
                        </Td>
                        <Td className="text-right">
                          <Link href={`/admin/observasi?tab=baru&teacherId=${t.id}`}>
                            <Button variant="ghost" size="sm">
                              Observasi Sekarang
                            </Button>
                          </Link>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ───────────── TAB 2: INPUT OBSERVASI BARU ───────────── */}
      {activeTab === "baru" && (
        <Card>
          <CardHeader
            icon={Eye}
            title="Formulir Observasi Kelas (Lampiran 4A)"
            description="Isi lembar pengamatan 10 aspek pedagogik bilingual saat melakukan supervisi langsung di ruang kelas."
          />
          <CardBody>
            <ObservationForm
              teachers={teacherOptions}
              initialTeacherId={preselectedTeacherId}
              availableSubjects={subjects}
            />
          </CardBody>
        </Card>
      )}

      {/* ───────────── TAB 3: RIWAYAT OBSERVASI ───────────── */}
      {activeTab === "riwayat" && (
        <Card>
          <CardHeader
            icon={ClipboardCheck}
            title={`Riwayat Observasi Kelas (${observations.length})`}
            description="Daftar seluruh observasi kelas yang telah selesai dilakukan beserta umpan balik pengamat."
          />
          <CardBody className="p-0">
            <ObservationHistoryTable records={observations} />
          </CardBody>
        </Card>
      )}
    </>
  );
}
