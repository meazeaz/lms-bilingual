import type { Metadata } from "next";
import { Award, Calendar, CheckCircle2, Clock, FileCheck, HelpCircle, History, MessageSquare, Scale, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { Card, CardBody, CardHeader, LevelBadge, PageHeader, Pill, StatusPill, Table, Td, Th } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { LEVEL_LABEL, LEVEL_RULES, SCORE_LABEL, type Level } from "@/lib/program";
import { formatDate } from "@/lib/utils";
import { AcknowledgeButton, AppealForm, CertificateCard, RegistrationSection } from "./duta-client";

export const metadata: Metadata = { title: "Duta Inggris Saya" };

export default async function GuruDutaPage() {
  const { teacher: me, name } = await requireTeacher();
  const teacher = await db.teacher.findUnique({
    where: { id: me.id },
    include: {
      user: true,
      assessments: {
        orderBy: { date: "desc" },
        include: { appeals: { orderBy: { createdAt: "desc" } } },
      },
      registrations: { orderBy: { createdAt: "desc" } },
      microTeachings: { orderBy: { date: "desc" } },
      levelChanges: { orderBy: { createdAt: "desc" }, include: { changedBy: true } },
    },
  });

  if (!teacher) return null;

  const level = teacher.ambassadorLevel as Level;
  let levelExpires: Date | null = null;
  if (level !== "NONE" && teacher.levelSince) {
    levelExpires = new Date(teacher.levelSince);
    levelExpires.setMonth(levelExpires.getMonth() + LEVEL_RULES[level].validityMonths);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sistem Duta Inggris · Bab 6 & Lampiran 10"
        title="Kompetensi & Asesmen Duta Inggris"
        description="Pantau pencapaian level Duta Inggris, unduh sertifikat resmi, kelola pendaftaran, dan ajukan peninjauan nilai."
      />

      {/* Ringkasan Status Level Saat Ini */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Level Anda</span>
            <LevelBadge level={level} />
          </div>
          <p className="mt-2 text-xl font-bold text-ink">{LEVEL_LABEL[level]}</p>
          <p className="text-xs text-slate-500 mt-1">
            {level === "NONE" || !teacher.levelSince ? "Belum mengambil asesmen" : `Diraih: ${formatDate(teacher.levelSince)}`}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Masa Berlaku</span>
            <Clock className="size-4 text-brand-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-ink">
            {levelExpires ? formatDate(levelExpires) : "–"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {level !== "NONE" ? `Masa aktif ${LEVEL_RULES[level].validityMonths} bulan` : "Tidak ada masa berlaku"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target % Kelas</span>
            <Award className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-ink">
            {level !== "NONE" ? `${LEVEL_RULES[level].englishTargetPct}%` : "30%"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Instruksi bahasa Inggris di kelas</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">English Zone</span>
            <Sparkles className="size-4 text-mint-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-ink">
            {level !== "NONE" ? `${LEVEL_RULES[level].zoneSessionsPerWeek}× / minggu` : "3× / minggu"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {level !== "NONE" ? LEVEL_RULES[level].zoneArea : "Ruang guru"}
          </p>
        </Card>
      </div>

      {/* Sertifikat Digital (Siap Cetak) */}
      <CertificateCard
        teacherName={teacher.user.name}
        subject={teacher.subject}
        level={level}
        levelSince={teacher.levelSince}
        expiresAt={levelExpires}
      />

      {/* Riwayat Asesmen & Detail Rincian Skor */}
      <Card>
        <CardHeader
          icon={Award}
          title="Riwayat Asesmen Duta Inggris"
          description="Rincian hasil evaluasi lisan (50%), tertulis (30%), dan simulasi mengajar (20%)."
        />
        <CardBody className="space-y-6">
          {teacher.assessments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada riwayat asesmen yang tercatat. Silakan ajukan pendaftaran di bawah untuk dijadwalkan asesmen oleh Tim EDT.
            </p>
          ) : (
            teacher.assessments.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-base">Asesmen {formatDate(a.date)}</span>
                      <LevelBadge level={a.awardedLevel} />
                      <Pill tone={a.passed ? "success" : "danger"}>
                        {a.passed ? "Lulus Syarat" : "Belum Memenuhi Syarat"}
                      </Pill>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Level: <b>{a.targetLevel}</b> · Nilai Akhir: <b className="text-brand-600 text-sm">{a.finalScore}</b> (Batas: {a.targetLevel !== "NONE" ? LEVEL_RULES[a.targetLevel].passScore : 66.5})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.acknowledged ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-mint-600 bg-mint-50 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="size-4" /> Hasil telah diterima
                      </span>
                    ) : (
                      <AcknowledgeButton assessmentId={a.id} />
                    )}
                  </div>
                </div>

                {/* Grid Rincian 3 Komponen */}
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>1. Tes Lisan (50%)</span>
                      <span className="text-brand-600">{a.oralScore} / 100</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-slate-500 text-[11px]">
                      <li>Fluency: <b>{SCORE_LABEL[a.oralFluency]}</b></li>
                      <li>Pronunciation: <b>{SCORE_LABEL[a.oralPronunciation]}</b></li>
                      <li>Grammar: <b>{SCORE_LABEL[a.oralGrammar]}</b></li>
                      <li>Vocabulary: <b>{SCORE_LABEL[a.oralVocabulary]}</b></li>
                      <li>Confidence: <b>{SCORE_LABEL[a.oralConfidence]}</b></li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>2. Tes Tertulis (30%)</span>
                      <span className="text-brand-600">{a.writtenScore} / 100</span>
                    </div>
                    <p className="mt-2 text-slate-500 text-[11px] leading-relaxed">
                      {a.writtenWaived
                        ? "Dibebaskan otomatis (nilai 100) karena kualifikasi TOEFL ≥ 550 / IELTS ≥ 6.0."
                        : "Tes pemahaman tata bahasa & instruksi kelas tertulis (Lampiran 1)."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>3. Simulasi Mengajar (20%)</span>
                      <span className="text-brand-600">{Math.round(a.simulationScore * 10) / 10} / 100</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-slate-500 text-[11px]">
                      <li>Instruksi: <b>{SCORE_LABEL[a.simInstruction]}</b></li>
                      <li>Adaptasi: <b>{SCORE_LABEL[a.simAdaptation]}</b></li>
                      <li>Konsistensi: <b>{SCORE_LABEL[a.simConsistency]}</b></li>
                      <li>Kejelasan: <b>{SCORE_LABEL[a.simClarity]}</b></li>
                    </ul>
                  </div>
                </div>

                {/* Catatan Penguji */}
                {(a.strengths || a.improvements || a.notes) && (
                  <div className="rounded-xl bg-amber-50/50 p-3.5 border border-amber-200/60 text-xs space-y-1.5">
                    {a.strengths && (
                      <p><b className="text-amber-900">Kekuatan:</b> <span className="text-slate-700">{a.strengths}</span></p>
                    )}
                    {a.improvements && (
                      <p><b className="text-amber-900">Area Pengembangan:</b> <span className="text-slate-700">{a.improvements}</span></p>
                    )}
                    {a.notes && (
                      <p><b className="text-amber-900">Catatan Tambahan:</b> <span className="text-slate-700">{a.notes}</span></p>
                    )}
                  </div>
                )}

                {/* Riwayat Banding untuk Asesmen ini & Form Pengajuan */}
                <div className="border-t border-slate-100 pt-3">
                  {a.appeals.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Scale className="size-3.5 text-coral-600" /> Riwayat Permohonan Banding:
                      </p>
                      {a.appeals.map((ap) => (
                        <div key={ap.id} className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-ink">Alasan: {ap.reasonType}</span>
                            <StatusPill status={ap.status} />
                          </div>
                          <p className="text-slate-600">{ap.explanation}</p>
                          {ap.decision && (
                            <p className="text-brand-700 font-medium pt-1">
                              <b>Keputusan:</b> {ap.decision} {ap.revisedScore != null && `(Nilai revisi: ${ap.revisedScore})`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <AppealForm assessmentId={a.id} assessmentDate={a.date} />
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Formulir Pendaftaran Duta Inggris (Lampiran 6) */}
      <RegistrationSection currentLevel={level} />

      {/* Riwayat Pendaftaran Duta */}
      {teacher.registrations.length > 0 && (
        <Card>
          <CardHeader icon={History} title="Riwayat Pendaftaran Duta Inggris" />
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Level Tujuan</Th>
                  <Th>Waktu/Minggu</Th>
                  <Th>Mentor</Th>
                  <Th>Status</Th>
                  <Th>Jadwal Asesmen</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.registrations.map((r) => (
                  <tr key={r.id}>
                    <Td className="whitespace-nowrap font-medium text-slate-700">{formatDate(r.createdAt)}</Td>
                    <Td><LevelBadge level={r.targetLevel} /></Td>
                    <Td>{r.hoursPerWeek} jam</Td>
                    <Td>{r.readyToMentor ? "Bersedia" : "Belum"}</Td>
                    <Td><StatusPill status={r.status} /></Td>
                    <Td className="text-xs text-slate-600">
                      {r.assessmentDate ? formatDate(r.assessmentDate) : "Menunggu jadwal EDT"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Riwayat Micro-teaching (Bab 4.1) */}
      {teacher.microTeachings.length > 0 && (
        <Card>
          <CardHeader
            icon={FileCheck}
            title="Riwayat Penilaian Micro-Teaching (Bulan 4)"
            description="Latihan simulasi mengajar di depan rekan sejawat sebelum kelas nyata bilingual."
          />
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Minggu</Th>
                  <Th>Fokus Materi</Th>
                  <Th>Skor</Th>
                  <Th>Hasil</Th>
                  <Th>Catatan</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.microTeachings.map((m) => (
                  <tr key={m.id}>
                    <Td className="whitespace-nowrap font-medium">{formatDate(m.date)}</Td>
                    <Td>Minggu {m.week}</Td>
                    <Td className="font-semibold text-ink">{m.focus}</Td>
                    <Td className="font-bold text-brand-600">{m.score}</Td>
                    <Td>
                      <Pill tone={m.result === "LULUS" ? "success" : m.result === "PENDAMPINGAN" ? "warning" : "danger"}>
                        {m.result}
                      </Pill>
                    </Td>
                    <Td className="text-xs text-slate-500 max-w-xs">{m.notes || "–"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Riwayat Penyesuaian Level (Sanksi / Evaluasi) */}
      {teacher.levelChanges.length > 0 && (
        <Card>
          <CardHeader icon={ShieldAlert} title="Riwayat Penyesuaian / Sanksi Level" />
          <CardBody className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Dari</Th>
                  <Th>Menjadi</Th>
                  <Th>Alasan Penyesuaian</Th>
                  <Th>Oleh</Th>
                </tr>
              </thead>
              <tbody>
                {teacher.levelChanges.map((lc) => (
                  <tr key={lc.id}>
                    <Td className="whitespace-nowrap font-medium">{formatDate(lc.createdAt)}</Td>
                    <Td><LevelBadge level={lc.fromLevel} /></Td>
                    <Td><LevelBadge level={lc.toLevel} /></Td>
                    <Td className="text-xs text-slate-600 max-w-sm">{lc.reason}</Td>
                    <Td className="text-xs font-semibold text-slate-700">{lc.changedBy.name}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
