import type { Metadata } from "next";
import { Award, BookOpen, ClipboardList, History, Scale } from "lucide-react";
import { Avatar, Card, CardBody, CardHeader, LevelBadge, LinkTabs, PageHeader, Pill, Table, Td, Th } from "@/components/ui";
import { db } from "@/lib/db";
import { LEVEL_RULES } from "@/lib/program";
import { formatDate } from "@/lib/utils";
import { getSchoolProfile } from "@/lib/settings-server";
import { AssessmentForm } from "./assessment-form";
import { AppealItem, MicroTeachingForm, RegistrationReviewItem } from "./admin-asesmen-client";
import { WrittenAssessmentBank } from "./bank-soal";

export const metadata: Metadata = { title: "Asesmen & Duta Inggris" };

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "asesmen";

  const [teachers, assessments, registrations, microTeachings, appeals, profile] = await Promise.all([
    db.teacher.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    db.assessment.findMany({
      include: {
        teacher: { include: { user: true } },
        appeals: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    db.ambassadorRegistration.findMany({
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.microTeaching.findMany({
      include: { teacher: { include: { user: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    db.appeal.findMany({
      include: {
        assessment: {
          include: {
            teacher: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSchoolProfile(),
  ]);

  const pendingRegCount = registrations.filter((r) => r.status === "PENDING").length;
  const pendingAppealCount = appeals.filter((a) => a.status === "DIAJUKAN").length;

  const tabs = [
    { key: "asesmen", label: "Asesmen Duta", href: "/admin/asesmen?tab=asesmen", count: assessments.length },
    { key: "pendaftaran", label: "Pendaftaran (Lampiran 6)", href: "/admin/asesmen?tab=pendaftaran", count: pendingRegCount },
    { key: "micro", label: "Micro-Teaching (Bulan 4)", href: "/admin/asesmen?tab=micro", count: microTeachings.length },
    { key: "banding", label: "Banding Nilai (Lampiran 7)", href: "/admin/asesmen?tab=banding", count: pendingAppealCount },
    { key: "banksoal", label: "Bank Soal Tertulis (Lampiran 1)", href: "/admin/asesmen?tab=banksoal" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Bab 6.2 · Lampiran 6, 7 & 10"
        title="Manajemen Asesmen & Duta Inggris"
        description="Kelola alur pendaftaran, input asesmen 3 komponen (lisan 50%, tertulis 30%, simulasi 20%), penilaian micro-teaching, dan sidang putusan banding."
      />

      <LinkTabs tabs={tabs} active={activeTab} />

      {/* ───────────── TAB 1: ASESMEN DUTA (DEFAULT) ───────────── */}
      {activeTab === "asesmen" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader
                icon={ClipboardList}
                title="Input Hasil Asesmen"
                description="Nilai akhir dihitung otomatis: lisan 50% (5 aspek), tertulis 30%, simulasi 20%"
              />
              <CardBody>
                <AssessmentForm
                  teachers={teachers.map((t) => ({
                    id: t.id,
                    name: t.user.name,
                    level: t.ambassadorLevel,
                    toefl: t.toeflScore,
                  }))}
                />
              </CardBody>
            </Card>

            <Card className="h-fit">
              <CardHeader icon={Award} title="Kriteria Kelulusan Level" />
              <CardBody className="space-y-3">
                {(["BRONZE", "SILVER", "GOLD"] as const).map((l) => (
                  <div key={l} className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <LevelBadge level={l} />
                      <span className="text-sm font-black text-ink">
                        ≥ {LEVEL_RULES[l].passScore.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600">
                      CEFR {LEVEL_RULES[l].cefr} · simulasi {LEVEL_RULES[l].simulationMinutes} mnt · berlaku {LEVEL_RULES[l].validityMonths} bln · pita {LEVEL_RULES[l].certificateColor.toLowerCase()}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              icon={History}
              title="Riwayat Asesmen Duta"
              description={`${assessments.length} asesmen tercatat`}
            />
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Guru</Th>
                    <Th>Tanggal</Th>
                    <Th>Level Dituju</Th>
                    <Th>Lisan (50%)</Th>
                    <Th>Tertulis (30%)</Th>
                    <Th>Simulasi (20%)</Th>
                    <Th>Nilai Akhir</Th>
                    <Th>Hasil</Th>
                    <Th>Status Konfirmasi</Th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.length === 0 ? (
                    <tr>
                      <Td colSpan={9} className="text-center text-slate-400 py-6">
                        Belum ada asesmen tercatat
                      </Td>
                    </tr>
                  ) : (
                    assessments.map((a) => (
                      <tr key={a.id}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={a.teacher.user.name} size="sm" />
                            <span className="font-bold whitespace-nowrap text-ink">
                              {a.teacher.user.name}
                            </span>
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap">{formatDate(a.date)}</Td>
                        <Td><LevelBadge level={a.targetLevel} /></Td>
                        <Td className="tabular-nums font-semibold">{a.oralScore}</Td>
                        <Td className="tabular-nums font-semibold">
                          {a.writtenScore}
                          {a.writtenWaived && (
                            <span className="ml-1 text-[11px] text-brand-600 font-bold">(TOEFL)</span>
                          )}
                        </Td>
                        <Td className="tabular-nums font-semibold">
                          {Math.round(a.simulationScore * 10) / 10}
                        </Td>
                        <Td className="font-black tabular-nums text-ink text-base">
                          {a.finalScore.toLocaleString("id-ID")}
                        </Td>
                        <Td>
                          {a.passed ? (
                            <Pill tone="success">Lulus {a.awardedLevel}</Pill>
                          ) : (
                            <Pill tone="danger">Belum Lulus</Pill>
                          )}
                        </Td>
                        <Td>
                          {a.acknowledged ? (
                            <span className="text-xs font-semibold text-mint-600">Diterima guru</span>
                          ) : a.appeals.length > 0 ? (
                            <Pill tone="warning">Ada Banding</Pill>
                          ) : (
                            <span className="text-xs text-slate-400">Menunggu respons</span>
                          )}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ───────────── TAB 2: PENDAFTARAN DUTA (LAMPIRAN 6) ───────────── */}
      {activeTab === "pendaftaran" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-brand-50/50 to-white">
            <CardHeader
              icon={BookOpen}
              title="Verifikasi Pengajuan Formulir Pendaftaran (Lampiran 6)"
              description="Guru yang ingin mengambil asesmen Duta Inggris mengajukan level target, alokasi jam mandiri, motivasi, dan komitmen pendampingan rekan."
            />
          </Card>

          <div className="space-y-3">
            {registrations.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">
                Belum ada pendaftaran Duta Inggris dari guru.
              </Card>
            ) : (
              registrations.map((r) => (
                <RegistrationReviewItem
                  key={r.id}
                  reg={{
                    id: r.id,
                    teacherName: r.teacher.user.name,
                    targetLevel: r.targetLevel,
                    hoursPerWeek: r.hoursPerWeek,
                    readyToMentor: r.readyToMentor,
                    motivation: r.motivation,
                    status: r.status,
                    adminNote: r.adminNote,
                    assessmentDate: r.assessmentDate,
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────── TAB 3: MICRO-TEACHING (BULAN 4) ───────────── */}
      {activeTab === "micro" && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={ClipboardList}
              title="Input Skor Micro-Teaching (Bulan 4)"
              description="Simulasi mengajar 10–15 menit di hadapan observer/EDT. Penilaian 4 aspek (@25%, skala 1–4): Pembukaan, Aktivitas Inti, CFU, Penutup."
            />
            <CardBody>
              <MicroTeachingForm
                teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={History}
              title="Riwayat Simulasi Micro-Teaching"
              description={`${microTeachings.length} sesi tercatat`}
            />
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Guru</Th>
                    <Th>Minggu</Th>
                    <Th>Tanggal</Th>
                    <Th>Fokus Sesi</Th>
                    <Th>Rincian Skor (1–4)</Th>
                    <Th>Skor Akhir</Th>
                    <Th>Status Hasil</Th>
                    <Th>Catatan</Th>
                  </tr>
                </thead>
                <tbody>
                  {microTeachings.length === 0 ? (
                    <tr>
                      <Td colSpan={8} className="text-center text-slate-400 py-6">
                        Belum ada simulasi micro-teaching tercatat
                      </Td>
                    </tr>
                  ) : (
                    microTeachings.map((m) => (
                      <tr key={m.id}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={m.teacher.user.name} size="sm" />
                            <span className="font-bold whitespace-nowrap text-ink">
                              {m.teacher.user.name}
                            </span>
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap font-semibold">Minggu {m.week}</Td>
                        <Td className="whitespace-nowrap">{formatDate(m.date)}</Td>
                        <Td className="font-medium text-ink">{m.focus}</Td>
                        <Td className="text-xs text-slate-600">
                          Buka: <b>{m.opening}</b> · Inti: <b>{m.delivery}</b> · CFU: <b>{m.cfu}</b> · Tutup: <b>{m.closing}</b>
                        </Td>
                        <Td className="font-black tabular-nums text-brand-600 text-base">
                          {Math.round(m.score * 10) / 10}
                        </Td>
                        <Td>
                          <Pill tone={m.result === "LULUS" ? "success" : m.result === "PENDAMPINGAN" ? "warning" : "danger"}>
                            {m.result}
                          </Pill>
                        </Td>
                        <Td className="text-xs text-slate-600 max-w-xs truncate">
                          {m.notes || "–"}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ───────────── TAB 4: BANDING NILAI (LAMPIRAN 7) ───────────── */}
      {activeTab === "banding" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
            <CardHeader
              icon={Scale}
              title="Proses Banding Nilai Asesmen (Lampiran 7)"
              description="SOP: Guru berhak mengajukan banding dalam waktu maksimal 7 hari kalender. Tim Banding (Kepala Sekolah & Tim EDT) wajib menerbitkan putusan tertulis maksimal 14 hari kerja."
            />
          </Card>

          <div className="space-y-3">
            {appeals.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">
                Tidak ada pengajuan banding nilai yang aktif.
              </Card>
            ) : (
              appeals.map((app) => (
                <AppealItem
                  key={app.id}
                  appeal={{
                    id: app.id,
                    teacherName: app.assessment.teacher.user.name,
                    date: app.assessment.date,
                    reasonType: app.reasonType,
                    explanation: app.explanation,
                    evidence: app.evidence,
                    request: app.request,
                    status: app.status,
                    decision: app.decision,
                    revisedScore: app.revisedScore,
                    currentScore: app.assessment.finalScore,
                    createdAt: app.createdAt,
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────── TAB 5: BANK SOAL TERTULIS (LAMPIRAN 1) ───────────── */}
      {activeTab === "banksoal" && <WrittenAssessmentBank logoUrl={profile.logoUrl} />}
    </>
  );
}