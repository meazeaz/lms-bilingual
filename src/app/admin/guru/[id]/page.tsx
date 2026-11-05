import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  History,
  Phone,
  Scale,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  LevelBadge,
  PageHeader,
  Pill,
  StatusPill,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { db } from "@/lib/db";
import { LEVEL_LABEL, LEVEL_RULES, type Level } from "@/lib/program";
import { getSchoolSubjects } from "@/lib/settings-server";
import { formatDate } from "@/lib/utils";
import { DemoteLevelSection, EditProfileSection } from "./teacher-detail-client";

export const metadata: Metadata = { title: "Detail Profil Tenaga Pendidik" };

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [teacher, otherTeachers, subjects] = await Promise.all([
    db.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        buddy: { include: { user: true } },
        buddies: { include: { user: true } },
        assessments: {
          include: { appeals: true },
          orderBy: { date: "desc" },
        },
        dailyLogs: {
          orderBy: { date: "desc" },
          take: 15,
        },
        cefrHistory: {
          orderBy: { date: "desc" },
        },
        levelChanges: {
          orderBy: { createdAt: "desc" },
        },
        microTeachings: {
          orderBy: { date: "desc" },
        },
        registrations: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.teacher.findMany({
      where: { id: { not: id } },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    getSchoolSubjects(),
  ]);

  if (!teacher) {
    notFound();
  }

  const level = teacher.ambassadorLevel as Level;

  // Masa berlaku sertifikat
  let levelExpires: Date | null = null;
  let isExpired = false;
  if (level !== "NONE" && teacher.levelSince) {
    const rule = LEVEL_RULES[level as Exclude<Level, "NONE">];
    levelExpires = new Date(teacher.levelSince);
    levelExpires.setMonth(levelExpires.getMonth() + rule.validityMonths);
    isExpired = levelExpires.getTime() < Date.now();
  }

  // Next level calculation
  const nextLevel: Level | null =
    level === "NONE" ? "BRONZE" : level === "BRONZE" ? "SILVER" : level === "SILVER" ? "GOLD" : null;

  const nextRule = nextLevel ? LEVEL_RULES[nextLevel] : null;

  const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const cefrMet = nextRule ? CEFR_ORDER.indexOf(teacher.cefrLevel) >= CEFR_ORDER.indexOf(nextRule.cefr) : true;

  const passedMicroTeaching = teacher.microTeachings.some((m) => m.result === "LULUS");
  const latestAssessment = teacher.assessments[0];
  const assessmentMet = nextRule && latestAssessment ? latestAssessment.passed && latestAssessment.targetLevel === nextLevel : false;

  return (
    <>
      <div className="mb-4">
        <Link
          href="/admin/guru"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition"
        >
          <ArrowLeft className="size-4" /> Kembali ke Daftar Guru
        </Link>
      </div>

      <PageHeader
        eyebrow="Bab 3 & Lampiran 5 · Master 2028"
        title={teacher.user.name}
        description={`Guru ${teacher.subject} · NIP: ${teacher.nip || "–"} · ${teacher.user.email}`}
      />

      {/* Profil Header & Aksi Cepat */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={teacher.user.name} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-ink">{teacher.user.name}</h3>
                <LevelBadge level={level} />
                {teacher.isPilot && <Pill tone="info">Pilot Project</Pill>}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Guru Mata Pelajaran: <b className="text-slate-800">{teacher.subject}</b>
                {teacher.whatsapp && (
                  <span className="ml-3 inline-flex items-center gap-1 text-xs text-mint-700 bg-mint-50 px-2 py-0.5 rounded-lg">
                    <Phone className="size-3" /> {teacher.whatsapp}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                <span>
                  CEFR: <b className="text-ink">{teacher.cefrLevel}</b>
                </span>
                <span>
                  TOEFL: <b className="text-ink">{teacher.toeflScore ?? "–"}</b>
                </span>
                <span>
                  Mentor / Buddy:{" "}
                  {teacher.buddy ? (
                    <b className="text-brand-600">{teacher.buddy.user.name}</b>
                  ) : (
                    <span className="text-slate-400">Belum ada</span>
                  )}
                </span>
                <span>
                  Mendampingi: <b className="text-ink">{teacher.buddies.length} guru</b>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EditProfileSection
              teacher={{
                id: teacher.id,
                subject: teacher.subject,
                nip: teacher.nip,
                whatsapp: teacher.whatsapp,
                cefrLevel: teacher.cefrLevel,
                toeflScore: teacher.toeflScore,
                buddyId: teacher.buddyId,
                isPilot: teacher.isPilot,
              }}
              potentialBuddies={otherTeachers.map((t) => ({ id: t.id, name: t.user.name }))}
              availableSubjects={subjects}
            />
            {level !== "NONE" && (
              <DemoteLevelSection teacherId={teacher.id} currentLevel={level} />
            )}
          </div>
        </div>
      </Card>

      {/* Grid Status Level & Kesiapan Naik Level */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Status Duta Saat Ini */}
        <Card>
          <CardHeader icon={Award} title="Status Duta Inggris Saat Ini" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Level Aktif</p>
                <p className="text-2xl font-black text-ink mt-0.5">{LEVEL_LABEL[level]}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {level === "NONE" || !teacher.levelSince
                    ? "Belum tersertifikasi Duta Inggris"
                    : `Diraih pada: ${formatDate(teacher.levelSince)}`}
                </p>
              </div>
              <LevelBadge level={level} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Masa Berlaku</span>
                <span className="font-bold text-ink mt-1 block">
                  {levelExpires ? formatDate(levelExpires) : "–"}
                </span>
                {level !== "NONE" && (
                  <span className={isExpired ? "text-rose-600 font-bold" : "text-mint-600 font-medium"}>
                    {isExpired ? "Sertifikasi Kedaluwarsa" : "Aktif Berlaku"}
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Durasi Sertifikasi</span>
                <span className="font-bold text-ink mt-1 block">
                  {level !== "NONE" ? `${LEVEL_RULES[level].validityMonths} Bulan` : "–"}
                </span>
                <span className="text-slate-500">
                  {level !== "NONE" ? `Pita ${LEVEL_RULES[level].certificateColor}` : "–"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Kesiapan Naik Level Berikutnya */}
        <Card>
          <CardHeader
            icon={Sparkles}
            title={nextLevel ? `Syarat Kenaikan ke Level ${LEVEL_LABEL[nextLevel]}` : "Puncak Level Tercapai"}
            description={nextLevel ? `Target CEFR: ${nextRule?.cefr} · Nilai Lulus: ≥ ${nextRule?.passScore}` : "Guru telah meraih predikat tertinggi Gold Ambassador"}
          />
          <CardBody className="space-y-3">
            {nextLevel && nextRule ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2.5">
                    {cefrMet ? (
                      <CheckCircle2 className="size-4 text-mint-600" />
                    ) : (
                      <XCircle className="size-4 text-rose-500" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-ink block">Kualifikasi Bahasa (CEFR)</span>
                      <span className="text-[11px] text-slate-500">
                        Syarat: minimal <b>{nextRule.cefr}</b> (Saat ini: <b>{teacher.cefrLevel}</b>)
                      </span>
                    </div>
                  </div>
                  <Pill tone={cefrMet ? "success" : "warning"}>{cefrMet ? "Memenuhi" : "Belum"}</Pill>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2.5">
                    {passedMicroTeaching ? (
                      <CheckCircle2 className="size-4 text-mint-600" />
                    ) : (
                      <XCircle className="size-4 text-rose-500" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-ink block">Simulasi Micro-Teaching (Bulan 4)</span>
                      <span className="text-[11px] text-slate-500">
                        Syarat: skor simulasi ≥ 70 (Status: {passedMicroTeaching ? "Lulus" : "Belum Lulus"})
                      </span>
                    </div>
                  </div>
                  <Pill tone={passedMicroTeaching ? "success" : "warning"}>
                    {passedMicroTeaching ? "Lulus" : "Belum"}
                  </Pill>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2.5">
                    {assessmentMet ? (
                      <CheckCircle2 className="size-4 text-mint-600" />
                    ) : (
                      <XCircle className="size-4 text-rose-500" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-ink block">Asesmen 3 Komponen Resmi</span>
                      <span className="text-[11px] text-slate-500">
                        Nilai kelulusan: <b>≥ {nextRule.passScore}</b> (Lisan 50%, Tertulis 30%, Simulasi 20%)
                      </span>
                    </div>
                  </div>
                  <Pill tone={assessmentMet ? "success" : "warning"}>
                    {assessmentMet ? "Lulus" : "Belum"}
                  </Pill>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-brand-500" />
                    <div>
                      <span className="text-xs font-bold text-ink block">Target Praktik Kelas & English Zone</span>
                      <span className="text-[11px] text-slate-500">
                        Bahasa Inggris di kelas: <b>{nextRule.englishTargetPct}%</b> · English Zone: <b>{nextRule.zoneSessionsPerWeek} sesi/minggu</b>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-50/50 border border-amber-200 p-5 text-center">
                <Award className="size-8 text-amber-500 mx-auto" />
                <p className="mt-2 text-sm font-bold text-amber-900">Selamat! Guru berada di Level Gold.</p>
                <p className="text-xs text-amber-700 mt-1">
                  Pertahankan keaktifan ELITE harian dan peran sebagai mentor utama bagi rekan sejawat.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Riwayat Asesmen & Banding */}
      <Card className="mt-6">
        <CardHeader
          icon={FileCheck}
          title="Riwayat Asesmen Duta Inggris"
          description={`${teacher.assessments.length} asesmen pernah diikuti`}
        />
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Tanggal</Th>
                <Th>Target Level</Th>
                <Th>Lisan (50%)</Th>
                <Th>Tertulis (30%)</Th>
                <Th>Simulasi (20%)</Th>
                <Th>Nilai Akhir</Th>
                <Th>Hasil</Th>
                <Th>Konfirmasi Guru</Th>
                <Th>Banding</Th>
              </tr>
            </thead>
            <tbody>
              {teacher.assessments.length === 0 ? (
                <tr>
                  <Td colSpan={9} className="text-center text-slate-400 py-6">
                    Belum ada riwayat asesmen resmi.
                  </Td>
                </tr>
              ) : (
                teacher.assessments.map((a) => (
                  <tr key={a.id}>
                    <Td className="whitespace-nowrap">{formatDate(a.date)}</Td>
                    <Td><LevelBadge level={a.targetLevel} /></Td>
                    <Td className="tabular-nums font-semibold">{a.oralScore}</Td>
                    <Td className="tabular-nums font-semibold">
                      {a.writtenScore}
                      {a.writtenWaived && <span className="ml-1 text-[11px] text-brand-600 font-bold">(TOEFL)</span>}
                    </Td>
                    <Td className="tabular-nums font-semibold">{Math.round(a.simulationScore * 10) / 10}</Td>
                    <Td className="font-black tabular-nums text-ink text-base">{a.finalScore.toLocaleString("id-ID")}</Td>
                    <Td>
                      {a.passed ? <Pill tone="success">Lulus {a.awardedLevel}</Pill> : <Pill tone="danger">Belum Lulus</Pill>}
                    </Td>
                    <Td>
                      {a.acknowledged ? (
                        <span className="text-xs font-semibold text-mint-600">Diterima</span>
                      ) : (
                        <span className="text-xs text-slate-400">Belum</span>
                      )}
                    </Td>
                    <Td>
                      {a.appeals.length > 0 ? (
                        <span className="text-xs font-semibold text-amber-600">
                          {a.appeals[0].status}
                        </span>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Grid Riwayat Penyesuaian Level & Simulasi Micro-Teaching */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Riwayat Penyesuaian / Sanksi Turun Level */}
        <Card>
          <CardHeader
            icon={Scale}
            title="Riwayat Penyesuaian Level (LevelChange)"
            description="Pencatatan promosi naik level atau penyesuaian penurunan level"
          />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Perubahan</Th>
                  <Th>Alasan / Berita Acara</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.levelChanges.length === 0 ? (
                  <tr>
                    <Td colSpan={3} className="text-center text-slate-400 py-6">
                      Belum ada penyesuaian level tercatat.
                    </Td>
                  </tr>
                ) : (
                  teacher.levelChanges.map((lc) => (
                    <tr key={lc.id}>
                      <Td className="whitespace-nowrap text-xs">{formatDate(lc.createdAt)}</Td>
                      <Td className="text-xs whitespace-nowrap">
                        <span className="font-semibold text-slate-500">{lc.fromLevel}</span> →{" "}
                        <span className="font-bold text-ink">{lc.toLevel}</span>
                      </Td>
                      <Td className="text-xs text-slate-600">{lc.reason}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Riwayat Micro-Teaching */}
        <Card>
          <CardHeader
            icon={BookOpen}
            title="Riwayat Simulasi Micro-Teaching"
            description="Evaluasi praktik 4 aspek (@25%, skor 1–4)"
          />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Minggu</Th>
                  <Th>Tanggal</Th>
                  <Th>Fokus</Th>
                  <Th>Skor</Th>
                  <Th>Hasil</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.microTeachings.length === 0 ? (
                  <tr>
                    <Td colSpan={5} className="text-center text-slate-400 py-6">
                      Belum ada sesi micro-teaching.
                    </Td>
                  </tr>
                ) : (
                  teacher.microTeachings.map((m) => (
                    <tr key={m.id}>
                      <Td className="font-bold text-xs">Mg {m.week}</Td>
                      <Td className="whitespace-nowrap text-xs">{formatDate(m.date)}</Td>
                      <Td className="text-xs font-medium text-ink">{m.focus}</Td>
                      <Td className="font-bold text-xs text-brand-600">{Math.round(m.score * 10) / 10}</Td>
                      <Td>
                        <Pill tone={m.result === "LULUS" ? "success" : m.result === "PENDAMPINGAN" ? "warning" : "danger"}>
                          {m.result}
                        </Pill>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Riwayat CEFR / TOEFL & Log Harian Terakhir */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader
            icon={GraduationCap}
            title="Riwayat Perkembangan CEFR & TOEFL"
            description={`${teacher.cefrHistory.length} kali pembaruan kualifikasi`}
          />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Level CEFR</Th>
                  <Th>Skor TOEFL</Th>
                  <Th>Catatan / Sumber</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.cefrHistory.length === 0 ? (
                  <tr>
                    <Td colSpan={4} className="text-center text-slate-400 py-6">
                      Belum ada pembaruan skor CEFR/TOEFL tercatat.
                    </Td>
                  </tr>
                ) : (
                  teacher.cefrHistory.map((cr) => (
                    <tr key={cr.id}>
                      <Td className="whitespace-nowrap text-xs">{formatDate(cr.date)}</Td>
                      <Td className="font-bold text-ink text-xs">{cr.cefrLevel}</Td>
                      <Td className="tabular-nums text-xs">{cr.toefl ?? "–"}</Td>
                      <Td className="text-xs text-slate-500">{cr.source || "Pembaruan Profil"}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={History}
            title="Laporan Praktik ELITE Harian Terakhir"
            description="15 entri laporan mandiri terakhir guru"
          />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Bahasa Inggris di Kelas</Th>
                  <Th>English Zone</Th>
                  <Th>Status Review</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.dailyLogs.length === 0 ? (
                  <tr>
                    <Td colSpan={4} className="text-center text-slate-400 py-6">
                      Belum ada laporan harian mandiri.
                    </Td>
                  </tr>
                ) : (
                  teacher.dailyLogs.map((dl) => (
                    <tr key={dl.id}>
                      <Td className="whitespace-nowrap text-xs">{formatDate(dl.date)}</Td>
                      <Td className="tabular-nums font-bold text-xs">{dl.englishInClassPct ?? 0}%</Td>
                      <Td className="text-xs text-slate-600">{dl.englishZoneMinutes} menit</Td>
                      <Td>
                        <StatusPill status={dl.status} />
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}
