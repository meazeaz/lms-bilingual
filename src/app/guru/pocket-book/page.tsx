import type { Metadata } from "next";
import { Award, BookMarked, CheckCircle2, Clock, Sparkles, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader, Pill, Progress, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { LEVEL_LABEL, LEVEL_RULES, type Level } from "@/lib/program";
import { PocketFlashcard, PocketPhraseList } from "./pocket-book-client";

export const metadata: Metadata = { title: "Pocket Book Frasa Saku" };

export default async function GuruPocketBookPage() {
  const { teacher, name } = await requireTeacher();

  const [allPhrases, masteries] = await Promise.all([
    db.phrase.findMany({ orderBy: { number: "asc" } }),
    db.phraseMastery.findMany({ where: { teacherId: teacher.id } }),
  ]);

  const masteryMap = new Map(masteries.map((m) => [m.phraseId, m.status]));

  const phrasesWithStatus = allPhrases.map((p) => ({
    ...p,
    status: masteryMap.get(p.id) || null,
  }));

  const masteredCount = masteries.filter((m) => m.status === "APPROVED").length;
  const pendingCount = masteries.filter((m) => m.status === "PENDING").length;

  const currentLevel = teacher.ambassadorLevel as Level;
  const nextLevel: Level =
    currentLevel === "NONE"
      ? "BRONZE"
      : currentLevel === "BRONZE"
      ? "SILVER"
      : currentLevel === "SILVER"
      ? "GOLD"
      : "GOLD";

  const targetPhrases = LEVEL_RULES[nextLevel].phrasesToMemorize;
  const progressPct = Math.round((masteredCount / (targetPhrases || 1)) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Bab 3.5 & Lampiran 3 · 50 Frasa Saku"
        title="Buku Saku Guru (Pocket Book)"
        description="Koleksi 50 frasa bahasa Inggris standar untuk pengelolaan kelas harian di SMP IT Al Madany. Latih hafalan secara interaktif dan ajukan verifikasi ke Tim EDT."
      />

      {/* Ringkasan Metrik & Progres Target */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Frasa Terverifikasi"
          value={`${masteredCount} / ${allPhrases.length}`}
          hint={`${Math.round((masteredCount / (allPhrases.length || 1)) * 100)}% dari total buku saku`}
          tone="mint"
        />
        <StatCard
          icon={Clock}
          label="Menunggu Verifikasi"
          value={pendingCount}
          hint="Sedang ditinjau oleh Tim EDT"
          tone="gold"
        />
        <StatCard
          icon={Sparkles}
          label={`Target ${LEVEL_LABEL[nextLevel]}`}
          value={`${masteredCount} / ${targetPhrases}`}
          hint={masteredCount >= targetPhrases ? "Target level tercapai!" : `Kurang ${targetPhrases - masteredCount} frasa lagi`}
          tone="brand"
        />
        <StatCard
          icon={Trophy}
          label="Lencana Pocket Master"
          value={masteredCount >= 50 ? "Diraih" : `${masteredCount}/50`}
          hint="Hafal 50 frasa untuk lencana"
          tone="coral"
        />
      </div>

      {/* Bar Progres Kesiapan Level */}
      <Card className="mt-6">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Progres Hafalan untuk Target Level {LEVEL_LABEL[nextLevel]}
              </span>
              <p className="text-sm font-extrabold text-ink">
                {masteredCount} dari {targetPhrases} frasa terverifikasi ({Math.min(100, progressPct)}%)
              </p>
            </div>
            <Pill tone={masteredCount >= targetPhrases ? "success" : "info"}>
              {masteredCount >= targetPhrases ? "Syarat Frasa Terpenuhi" : "Dalam Proses"}
            </Pill>
          </div>
          <Progress value={progressPct} tone={masteredCount >= targetPhrases ? "mint" : "brand"} />
        </CardBody>
      </Card>

      {/* Section 1: Flashcard Interaktif */}
      <div className="mt-6">
        <PocketFlashcard phrases={phrasesWithStatus} />
      </div>

      {/* Section 2: Daftar Lengkap & Filter Kategori */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            Katalog 50 Frasa Saku Kelas
          </h3>
          <p className="text-xs text-slate-500">
            Jelajahi per kategori, hafalkan, dan tandai frasa yang telah Anda kuasai.
          </p>
        </div>
        <PocketPhraseList
          phrases={phrasesWithStatus}
          targetPhrases={targetPhrases}
          masteredCount={masteredCount}
        />
      </div>
    </>
  );
}

