import type { Metadata } from "next";
import { CheckCircle2, Clock, Sparkles, Target, Trophy } from "lucide-react";
import { Card, CardBody, PageHeader, Pill, Progress, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChallengeSubmissionItem } from "./challenge-client";

export const metadata: Metadata = { title: "Tantangan Mingguan Guru" };

export default async function GuruChallengePage() {
  const { teacher, name } = await requireTeacher();

  const [challenges, progressList] = await Promise.all([
    db.weeklyChallenge.findMany({ orderBy: { week: "asc" } }),
    db.challengeProgress.findMany({ where: { teacherId: teacher.id } }),
  ]);

  const progressMap = new Map(progressList.map((p) => [p.challengeId, p]));

  const completedCount = progressList.filter((p) => p.status === "APPROVED").length;
  const pendingCount = progressList.filter((p) => p.status === "PENDING").length;
  const pointsEarned = completedCount * 10;
  const progressPct = Math.round((completedCount / (challenges.length || 1)) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Bab 6.5 · 12 Weekly Challenges"
        title="Tantangan Mingguan Guru (Weekly Challenge)"
        description="Selesaikan 12 kartu aksi praktis penguatan bilingual di kelas secara bertahap selama semester ini. Kumpulkan poin dan raih lencana prestisius Challenge Champion."
      />

      {/* Ringkasan Metrik Gamifikasi */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Tantangan Selesai"
          value={`${completedCount} / ${challenges.length}`}
          hint={`${progressPct}% terselesaikan`}
          tone="mint"
        />
        <StatCard
          icon={Clock}
          label="Menunggu Verifikasi"
          value={pendingCount}
          hint="Sedang ditinjau Admin EDT"
          tone="gold"
        />
        <StatCard
          icon={Sparkles}
          label="Poin Terkumpul"
          value={`+${pointsEarned} Poin`}
          hint="10 poin per tantangan selesai"
          tone="brand"
        />
        <StatCard
          icon={Trophy}
          label="Lencana Champion"
          value={completedCount >= 12 ? "Diraih!" : `${completedCount}/12`}
          hint="Selesaikan 12 kartu tantangan"
          tone="coral"
        />
      </div>

      {/* Bar Progres Tantangan */}
      <Card className="mt-6">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Progres Eksekusi 12 Pekan
              </span>
              <p className="text-sm font-extrabold text-ink">
                {completedCount} dari {challenges.length} tantangan disetujui ({progressPct}%)
              </p>
            </div>
            <Pill tone={completedCount >= 12 ? "success" : "info"}>
              {completedCount >= 12 ? "Semua Tantangan Tuntas" : "Aktif Berjalan"}
            </Pill>
          </div>
          <Progress value={progressPct} tone={completedCount >= 12 ? "mint" : "brand"} />
        </CardBody>
      </Card>

      {/* Grid 12 Kartu Tantangan */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            Daftar 12 Kartu Tantangan Mingguan
          </h3>
          <p className="text-xs text-slate-500">
            Kirimkan deskripsi penerapan di kelas untuk setiap minggu dan dapatkan poin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <ChallengeSubmissionItem
              key={c.id}
              challenge={c}
              progress={progressMap.get(c.id) || null}
            />
          ))}
        </div>
      </div>
    </>
  );
}

