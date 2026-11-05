import type { Metadata } from "next";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MessagesSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  Pill,
  StatCard,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Madani English Club Saya" };

export default async function SiswaClubPage() {
  const { student } = await requireStudent();

  const [fullStudent, allSessions] = await Promise.all([
    db.student.findUnique({
      where: { id: student.id },
      include: {
        attendances: {
          include: { session: true },
          orderBy: { session: { date: "desc" } },
        },
      },
    }),
    db.clubSession.findMany({
      include: {
        leader: { include: { user: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  if (!fullStudent) return null;

  const attendedSessionIds = new Set(fullStudent.attendances.map((a) => a.sessionId));
  const tutorCount = fullStudent.attendances.filter((a) => a.role === "TUTOR").length;
  const clubPoints = fullStudent.attendances.reduce(
    (acc, a) => acc + (a.role === "TUTOR" ? 5 : 3),
    0
  );

  return (
    <>
      <PageHeader
        eyebrow="Komunitas & Praktik Berbicara"
        title="Madani English Club & Peer Tutoring"
        description="Ikuti sesi interaktif setiap Sabtu pagi (English Club) dan bimbingan Kamis sore (Peer Tutoring). Kumpulkan poin dan raih sertifikat Student Ambassador."
      />

      {/* Banner Status Student Ambassador */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-brand-50/70 via-white to-amber-50/60 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs">
              <Star className="size-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-black text-ink">
                  {fullStudent.isStudentAmbassador
                    ? "Anda Adalah Student Ambassador Resmi!"
                    : "Jalur Menjadi Student Ambassador"}
                </h2>
                {fullStudent.isStudentAmbassador ? (
                  <Pill tone="success">Aktif Membimbing</Pill>
                ) : (
                  <Pill tone="gold">Buka Peluang</Pill>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {fullStudent.isStudentAmbassador
                  ? "Terima kasih telah membimbing teman-teman sebaya setiap Kamis sore! Setiap sesi tutor memberikan +5 poin ekstrakurikuler."
                  : "Siswa level A2/B1 (terutama Alumni Pare) yang mengikuti pembinaan 2 sesi (4 jam) bersama Guru Gold berhak menjadi Tutor Sebaya & mendapat sertifikat resmi."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2 text-center">
            <p className="text-[10px] font-black uppercase text-amber-800">Poin Club Anda</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-black text-amber-900">
              +{clubPoints}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Hadir Sesi"
          value={`${fullStudent.attendances.length} Kali`}
          hint="Keaktifan di luar jam sekolah"
          icon={Calendar}
          tone="brand"
        />
        <StatCard
          label="Peran Sebagai Tutor"
          value={`${tutorCount} Sesi`}
          hint="Membantu teman berlatih bicara"
          icon={Users}
          tone="gold"
        />
        <StatCard
          label="Jadwal English Club"
          value="Sabtu 08.00"
          hint="08.00–09.30 WIB di Ruang Aula"
          icon={MessagesSquare}
          tone="mint"
        />
        <StatCard
          label="Jadwal Peer Tutoring"
          value="Kamis 15.30"
          hint="15.30–16.00 WIB di Gazebo Sekolah"
          icon={Clock}
          tone="gold"
        />
      </div>

      {/* Daftar Sesi Kegiatan Sekolah */}
      <Card>
        <CardHeader
          icon={MessagesSquare}
          title="Agenda & Riwayat Sesi English Club"
          description="Daftar kegiatan ekstrakurikuler dan status partisipasi Anda."
        />
        <CardBody className="p-0">
          {allSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Belum Ada Jadwal Sesi"
              description="Jadwal sesi English Club pekan ini akan segera diumumkan oleh pembina."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {allSessions.map((sess) => {
                const myAttendance = fullStudent.attendances.find(
                  (a) => a.sessionId === sess.id
                );
                const hasAttended = !!myAttendance;

                return (
                  <div
                    key={sess.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-5 transition hover:bg-slate-50/50"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={sess.type === "PEER_TUTORING" ? "gold" : "info"}>
                          {sess.type === "PEER_TUTORING" ? "Peer Tutoring (Kamis)" : "English Club (Sabtu)"}
                        </Pill>
                        {sess.activity && (
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {sess.activity}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">· {formatDate(sess.date)}</span>
                      </div>

                      <h4 className="mt-1 font-bold text-ink">{sess.topic}</h4>
                      {sess.notes && (
                        <p className="mt-0.5 text-xs text-slate-500 whitespace-pre-wrap">{sess.notes}</p>
                      )}
                      <p className="mt-1.5 text-xs text-slate-400">
                        Pembina: <span className="font-semibold text-slate-700">{sess.leader?.user.name ?? "Tim EDT"}</span>
                      </p>
                    </div>

                    <div>
                      {hasAttended ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="size-4 text-emerald-600" /> Hadir (
                            {myAttendance.role === "TUTOR" ? "Tutor Sebaya" : "Peserta"})
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            +{myAttendance.role === "TUTOR" ? "5" : "3"} pt
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Tidak Hadir / Belum Tercatat
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
