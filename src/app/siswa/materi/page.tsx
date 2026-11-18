import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap, Library, Sparkles } from "lucide-react";
import { Card, PageHeader, Pill } from "@/components/ui";
import { HoverLift, Stagger, StaggerItem } from "@/components/motion";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { CORE_BOOK, isCoreMaterial, sortCoreFirst, unitNumber, unitTitle } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Materi & Kuis" };

type Item = Awaited<ReturnType<typeof load>>[number];

async function load(studentId: string, grade: number) {
  return db.material.findMany({
    where: { published: true, OR: [{ grade }, { grade: null }, { grade: { lt: grade } }] },
    include: { quizzes: { include: { attempts: { where: { studentId } } } } },
    orderBy: [{ grade: "asc" }, { title: "asc" }],
  });
}

function bestScore(m: Item) {
  return Math.max(-1, ...m.quizzes.flatMap((q) => q.attempts.map((a) => a.score)));
}

function StatusPill({ best, pass }: { best: number; pass: number }) {
  if (best >= pass) return <Pill tone="success"><CheckCircle2 className="size-3" /> Lulus · {best}</Pill>;
  if (best >= 0) return <Pill tone="warning">Nilai {best}</Pill>;
  return <Pill tone="coral">Baru</Pill>;
}

export default async function MaterialsPage() {
  const { student } = await requireStudent();
  const materials = sortCoreFirst(await load(student.id, student.classRoom.grade));
  const core = materials.filter(isCoreMaterial);
  const extra = materials.filter((m) => !isCoreMaterial(m));
  const passOf = (m: Item) => m.quizzes[0]?.passScore ?? 70;
  const passedUnits = core.filter((m) => bestScore(m) >= passOf(m)).length;
  const pct = core.length ? Math.round((passedUnits / core.length) * 100) : 0;
  const next = core.find((m) => bestScore(m) < passOf(m));

  return (
    <>
      <PageHeader
        eyebrow="Kurikulum inti & materi tambahan"
        title="Materi & kuis"
        description="Pelajari unit demi unit buku Rise Up! Teens, lalu kerjakan Progress Test di akhir setiap unit. Nilai minimal lulus 70."
      />

      {core.length > 0 && (
        <section className="mb-10">
          <Card className="mb-5 overflow-hidden p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="clay-soft grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                <GraduationCap className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Kurikulum inti · CEFR {CORE_BOOK.cefr}</p>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">{CORE_BOOK.title}</h2>
                <p className="text-sm text-slate-500">
                  {passedUnits} dari {core.length} unit lulus
                  {next ? <> · Lanjutkan: <Link href={`/siswa/materi/${next.id}`} className="font-bold text-brand-600 hover:underline">Unit {unitNumber(next.title)}</Link></> : " · Semua unit selesai, luar biasa!"}
                </p>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progres kurikulum inti">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-mint-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums text-ink">{pct}%</span>
            </div>
          </Card>

          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {core.map((m) => {
              const best = bestScore(m);
              const passed = best >= passOf(m);
              const n = unitNumber(m.title);
              return (
                <StaggerItem key={m.id}>
                  <HoverLift className="h-full">
                    <Link href={`/siswa/materi/${m.id}`} className="block h-full">
                      <Card className={cn("flex h-full flex-col p-5", passed && "ring-2 ring-mint-200")}>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "clay-soft grid size-12 place-items-center rounded-2xl font-[family-name:var(--font-display)] text-lg font-semibold",
                              passed ? "bg-mint-100 text-mint-700" : "bg-brand-100 text-brand-700",
                            )}
                          >
                            {n ?? "•"}
                          </span>
                          <StatusPill best={best} pass={passOf(m)} />
                        </div>
                        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Unit {n}</p>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">{unitTitle(m.title)}</h3>
                        <p className="mt-1 flex-1 text-sm text-slate-500">{m.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          <Pill tone="info">{m.cefrLevel}</Pill>
                          {m.quizzes[0] && <Pill>Progress Test</Pill>}
                        </div>
                      </Card>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      )}

      {extra.length > 0 && (
        <section>
          <h2 className="mb-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
            <Library className="size-5 text-coral-500" /> Materi tambahan
          </h2>
          <p className="mb-4 text-sm text-slate-500">Kosakata mapel, ungkapan sehari-hari, dan grammar untuk memperkaya kurikulum inti.</p>
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {extra.map((m) => (
              <StaggerItem key={m.id}>
                <HoverLift className="h-full">
                  <Link href={`/siswa/materi/${m.id}`} className="block h-full">
                    <Card className="flex h-full flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="clay-soft grid size-11 place-items-center rounded-2xl bg-coral-100 text-coral-600"><BookOpen className="size-5" /></span>
                        <StatusPill best={bestScore(m)} pass={passOf(m)} />
                      </div>
                      <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">{m.title}</h3>
                      <p className="mt-1 flex-1 text-sm text-slate-500">{m.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5"><Pill tone="info">{m.subject}</Pill><Pill>{m.category}</Pill><Pill>{m.cefrLevel}</Pill></div>
                    </Card>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {materials.length === 0 && (
        <Card className="grid place-items-center p-10 text-center text-sm text-slate-500">
          <Sparkles className="mb-2 size-6 text-brand-400" /> Belum ada materi untuk kelasmu.
        </Card>
      )}
    </>
  );
}
