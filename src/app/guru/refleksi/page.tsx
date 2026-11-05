import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, Clock, Eye, Heart, NotebookPen, Sparkles } from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  LevelBadge,
  LinkTabs,
  PageHeader,
  Pill,
  StatCard,
  StatusPill,
} from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Level } from "@/lib/program";
import { getSchoolSubjects } from "@/lib/settings-server";
import {
  MyObservationCard,
  SelfReflectionForm,
  type MyObservationItem,
  type TeacherReflectionItem,
} from "./refleksi-client";

export const metadata: Metadata = { title: "Refleksi & Hasil Observasi Guru" };

export default async function GuruRefleksiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "mandiri";
  const { teacher } = await requireTeacher();

  const [rawReflections, rawObservations, subjects] = await Promise.all([
    db.reflection.findMany({
      where: { teacherId: teacher.id },
      orderBy: { date: "desc" },
    }),
    db.observation.findMany({
      where: { teacherId: teacher.id },
      include: { observer: true },
      orderBy: { date: "desc" },
    }),
    getSchoolSubjects(),
  ]);

  const reflections: TeacherReflectionItem[] = rawReflections.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    subject: r.subject,
    className: r.className,
    targetLevel: r.targetLevel,
    achieved: r.achieved,
    fluentSentences: r.fluentSentences,
    difficultSentences: r.difficultSentences,
    studentResponse: r.studentResponse,
    challenge: r.challenge,
    nextChange: r.nextChange,
    proudOf: r.proudOf,
    status: r.status as "PENDING" | "APPROVED" | "REJECTED",
    reviewNote: r.reviewNote,
    createdAt: r.createdAt.toISOString(),
  }));

  const observations: MyObservationItem[] = rawObservations.map((o) => ({
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
    observer: {
      name: o.observer.name,
    },
  }));

  const pendingAck = observations.filter((o) => !o.feedbackGiven).length;
  const approvedReflections = reflections.filter((r) => r.status === "APPROVED").length;

  const tabs = [
    { key: "mandiri", label: "Refleksi Mengajar Mandiri", href: "/guru/refleksi?tab=mandiri", count: reflections.length },
    { key: "observasi", label: "Hasil Observasi Kelas", href: "/guru/refleksi?tab=observasi", count: pendingAck > 0 ? pendingAck : undefined },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Pedagogik & Penjaminan Mutu"
        title="Refleksi Mengajar & Hasil Observasi"
        description="Evaluasi berkala praktik mengajar bilingual di kelas (Lampiran 4B) serta penerimaan umpan balik supervisi dari Kepala Sekolah & Tim EDT."
      />

      {/* Ringkasan Metrik Refleksi & Observasi */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Refleksi Terverifikasi"
          value={approvedReflections}
          hint={`Dari ${reflections.length} refleksi diajukan`}
          icon={CheckCircle2}
          tone="mint"
        />
        <StatCard
          label="Observasi Supervisi"
          value={`${observations.length} / 2×`}
          hint="Target minimal per semester"
          icon={Eye}
          tone={observations.length >= 2 ? "mint" : observations.length === 1 ? "gold" : "coral"}
        />
        <StatCard
          label="Umpan Balik Menunggu"
          value={pendingAck}
          hint={pendingAck > 0 ? "Perlu dikonfirmasi penerimaannya" : "Semua umpan balik telah diterima"}
          icon={AlertCircle}
          tone={pendingAck > 0 ? "coral" : "mint"}
        />
        <StatCard
          label="Rata-rata Skor Supervisi"
          value={
            observations.length > 0
              ? `${Math.round(observations.reduce((s, o) => s + o.score, 0) / observations.length)} / 100`
              : "-"
          }
          hint="Berdasarkan 10 aspek pedagogik"
          icon={Sparkles}
          tone="brand"
        />
      </div>

      {pendingAck > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900">
          <AlertCircle className="size-5 shrink-0 text-rose-600" />
          <div className="text-sm">
            <span className="font-bold">Ada {pendingAck} hasil observasi baru!</span> Silakan buka tab{" "}
            <span className="font-semibold underline">Hasil Observasi Kelas</span> untuk membaca masukan dan konfirmasi penerimaan umpan balik.
          </div>
        </div>
      )}

      <LinkTabs tabs={tabs} active={activeTab} />

      {/* ───────────── TAB 1: REFLEKSI MENGAJAR MANDIRI ───────────── */}
      {activeTab === "mandiri" && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={NotebookPen}
              title="Isi Lembar Refleksi Mengajar (Lampiran 4B)"
              description="Catat evaluasi mandiri segera setelah selesai mengajar bilingual di kelas untuk memantau kelancaran dan respon siswa."
            />
            <CardBody>
              <SelfReflectionForm
                defaultSubject={teacher.subject}
                currentLevel={teacher.ambassadorLevel as Level}
                availableSubjects={subjects}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={Clock}
              title={`Riwayat Refleksi Mengajar Saya (${reflections.length})`}
              description="Catatan jurnal reflektif mingguan yang telah Anda kirimkan ke Tim EDT."
            />
            <CardBody className="p-0">
              {reflections.length === 0 ? (
                <EmptyState
                  icon={NotebookPen}
                  title="Belum Ada Lembar Refleksi"
                  description="Isi lembar refleksi di atas setelah selesai mengajar bilingual di kelas hari ini."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {reflections.map((r) => (
                    <div key={r.id} className="p-5 transition hover:bg-slate-50/50">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-ink">
                              {r.subject} · Kelas {r.className}
                            </span>
                            <LevelBadge level={r.targetLevel as Level} />
                            <StatusPill status={r.status} />
                            <Pill
                              tone={r.achieved === "YA" ? "success" : r.achieved === "SEBAGIAN" ? "warning" : "danger"}
                            >
                              Target: {r.achieved === "YA" ? "Tercapai" : r.achieved === "SEBAGIAN" ? "Sebagian" : "Belum"}
                            </Pill>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Tanggal Mengajar: {formatDate(r.date)} · Dikirim: {formatDate(r.createdAt)}
                          </p>
                        </div>
                        {r.reviewNote && (
                          <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-1.5 text-xs text-brand-900">
                            <span className="font-bold">Catatan EDT: </span>
                            <span>{r.reviewNote}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="font-bold text-slate-500 uppercase">Kalimat Lancar</p>
                          <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.fluentSentences}</p>
                        </div>
                        {r.difficultSentences && (
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="font-bold text-slate-500 uppercase">Kalimat Dirasa Sulit</p>
                            <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.difficultSentences}</p>
                          </div>
                        )}
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="font-bold text-slate-500 uppercase">Hal Membanggakan</p>
                          <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.proudOf}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2 lg:col-span-3">
                          <p className="font-bold text-slate-500 uppercase">Perubahan Pada Sesi Berikutnya</p>
                          <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.nextChange}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ───────────── TAB 2: HASIL OBSERVASI KELAS ───────────── */}
      {activeTab === "observasi" && (
        <Card>
          <CardHeader
            icon={Eye}
            title={`Umpan Balik Observasi Kelas (${observations.length})`}
            description="Hasil pengamatan langsung oleh Kepala Sekolah & Tim EDT di ruang kelas. Pelajari kekuatan dan area perbaikan yang disarankan."
          />
          <CardBody>
            {observations.length === 0 ? (
              <EmptyState
                icon={Eye}
                title="Belum Ada Hasil Observasi"
                description="Hasil supervisi kelas Anda dari Kepala Sekolah atau Tim EDT akan ditampilkan di sini."
              />
            ) : (
              <div className="space-y-4">
                {observations.map((obs) => (
                  <MyObservationCard key={obs.id} obs={obs} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </>
  );
}
