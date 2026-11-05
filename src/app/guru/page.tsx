import type { Metadata } from "next";
import { Activity, Award, BookMarked, Check, Flame, Medal, Megaphone, Sparkles, Target } from "lucide-react";
import * as Icons from "lucide-react";
import { Card, CardBody, CardHeader, LevelBadge, LinkButton, PageHeader, Pill, Progress, Ring, StatCard } from "@/components/ui";
import { TrendChart } from "@/components/charts";
import { Stagger, StaggerItem } from "@/components/motion";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadTeacher, nextLevelReadiness, summarizeTeacher } from "@/lib/metrics";
import { LEVEL_LABEL, LEVEL_RULES, currentPhase, type Level } from "@/lib/program";
import { cn, formatDate, pct } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard Guru" };

const BADGE_TONE: Record<string, string> = {
  bronze: "from-bronze-100 to-bronze-500", silver: "from-silver-100 to-silver-500", gold: "from-gold-100 to-gold-500",
  coral: "from-coral-200 to-coral-500", mint: "from-mint-200 to-mint-500", brand: "from-brand-200 to-brand-500",
};

export default async function TeacherDashboard() {
  const { teacher: me, name } = await requireTeacher();
  const [t, allBadges, announcements] = await Promise.all([
    loadTeacher(me.id),
    db.badge.findMany({ where: { audience: "TEACHER" } }),
    db.announcement.findMany({ where: { audience: { in: ["ALL", "TEACHER"] } }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  if (!t) return null;
  const s = summarizeTeacher(t);
  const readiness = nextLevelReadiness(t, s);
  const level = t.ambassadorLevel as Level;
  const phase = currentPhase();
  const owned = new Set(t.badges.map((b) => b.badgeId));

  // Partisipasi per minggu (8 minggu terakhir)
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(); end.setDate(end.getDate() - (7 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const logs = t.dailyLogs.filter((l) => l.date >= start && l.date <= end && l.status === "APPROVED");
    return {
      minggu: formatDate(start).replace(/ \d{4}$/, ""),
      mirror: pct(logs.filter((l) => l.mirrorMorning).length, 5),
      misi: pct(logs.filter((l) => l.dailyMission).length, 5),
    };
  });

  let streak = 0;
  const sorted = [...t.dailyLogs].filter((l) => l.status !== "REJECTED" && l.mirrorMorning).map((l) => l.date.getTime());
  const set = new Set(sorted);
  const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  for (let i = 0; i < 60; i++) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) { if (set.has(d.getTime())) streak++; else if (i > 0) break; }
    d.setUTCDate(d.getUTCDate() - 1);
  }

  return (
    <>
      <PageHeader
        eyebrow={`${phase.name} · ${phase.title}`}
        title={`Halo, ${name.split(",")[0].split(" ")[0]}! 👋`}
        description="Ini perkembangan bahasa Inggris Anda. Isi laporan ELITE setiap hari supaya progres tercatat."
        actions={<LinkButton href="/guru/harian" variant="coral"><Icons.Sunrise className="size-4" /> Isi laporan hari ini</LinkButton>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Ring value={readiness ? pct(readiness.ready, readiness.total) : 100} size={128} stroke={13} color="#6366f1"
              label={<span className="text-center leading-tight"><span className="block font-[family-name:var(--font-display)] text-2xl font-bold">{readiness ? `${readiness.ready}/${readiness.total}` : "Max"}</span><span className="text-[11px] font-bold text-slate-500">syarat</span></span>} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><LevelBadge level={level} /><Pill tone="info">CEFR {t.cefrLevel}</Pill>{t.toeflScore && <Pill>TOEFL {t.toeflScore}</Pill>}</div>
              <h2 className="mt-2 text-2xl font-semibold">{LEVEL_LABEL[level]}</h2>
              <p className="text-sm text-slate-500">
                {readiness ? `Menuju ${LEVEL_LABEL[readiness.next]} (nilai akhir ≥ ${LEVEL_RULES[readiness.next].passScore.toLocaleString("id-ID")})` : "Level tertinggi. Pertahankan dan bimbing 2 guru mentee."}
                {s.levelExpires && ` · Berlaku sampai ${formatDate(s.levelExpires)}`}
              </p>
            </div>
          </div>
          {readiness && (
            <ul className="grid gap-2 border-t border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-2">
              {readiness.items.map((i) => (
                <li key={i.label} className="flex items-start gap-2.5 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", i.done ? "bg-mint-500 text-white" : "border-2 border-slate-300")}>{i.done && <Check className="size-3" strokeWidth={3.5} />}</span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">{i.label}</span>
                  <span className={cn("shrink-0 text-xs font-black", i.done ? "text-mint-600" : "text-slate-500")}>{i.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Stagger className="grid grid-cols-2 gap-4">
          <StaggerItem><StatCard label="Streak" value={`${streak} hari`} icon={Flame} tone="gold" hint="Mirror Morning berturut-turut" /></StaggerItem>
          <StaggerItem><StatCard label="Partisipasi" value={`${s.participationPct}%`} icon={Activity} tone="coral" hint="30 hari · target 70%"><Progress value={s.participationPct} tone="coral" size="sm" /></StatCard></StaggerItem>
          <StaggerItem><StatCard label="Pocket Book" value={`${s.phrasesMastered}/50`} icon={BookMarked} tone="mint" hint={`${s.phrasesPending} menunggu verifikasi`}><Progress value={pct(s.phrasesMastered, 50)} tone="mint" size="sm" /></StatCard></StaggerItem>
          <StaggerItem><StatCard label="Poin" value={s.points} icon={Sparkles} tone="brand" hint={`${s.challengesDone}/12 Weekly Challenge`} /></StaggerItem>
        </Stagger>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader icon={Target} title="Partisipasi ELITE per minggu" description="% hari kerja dengan voice note Mirror Morning dan Misi Harian terverifikasi" />
          <CardBody>
            <TrendChart data={weeks} xKey="minggu" series={[{ key: "mirror", label: "Mirror Morning" }, { key: "misi", label: "Misi Harian" }]} yDomain={[0, 100]} suffix="%" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={Medal} title="Lencana digital" description={`${owned.size} dari ${allBadges.length} lencana`} />
          <CardBody className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {allBadges.map((b) => {
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Award;
              const has = owned.has(b.id);
              return (
                <div key={b.id} title={`${b.name}: ${b.description}`} className="flex flex-col items-center gap-1.5 text-center">
                  <span className={cn("clay-soft grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white", has ? BADGE_TONE[b.color] : "from-slate-100 to-slate-200 text-slate-400 grayscale")}>
                    <Icon className="size-5" />
                  </span>
                  <span className={cn("text-[10px] leading-tight font-bold", has ? "text-ink" : "text-slate-400")}>{b.name}</span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader icon={Megaphone} title="Pengumuman EDT" />
        <CardBody className="grid gap-3 md:grid-cols-2">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">{formatDate(a.createdAt)}</p>
              <p className="mt-0.5 font-bold text-ink">{a.title}</p>
              <p className="mt-1 text-sm text-slate-600">{a.body}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
