import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, ListChecks, Lock } from "lucide-react";
import { Card, CardBody, CardHeader, LinkButton, PageHeader, Pill } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getPhaseStates } from "@/lib/phases-server";
import { cn, formatDate } from "@/lib/utils";
import { PhaseControls } from "./phase-controls";

export const metadata: Metadata = { title: "Fase Peta Jalan" };

export default async function PhaseDetailPage({ params }: { params: Promise<{ code: string }> }) {
  await requireAdmin();
  const { code } = await params;
  const { states } = await getPhaseStates();
  const phase = states.find((s) => s.code === code.toUpperCase());
  if (!phase) notFound();
  const prev = states[phase.index - 1];
  const next = states[phase.index + 1];

  return (
    <>
      <LinkButton href="/admin" variant="ghost" size="sm" className="mb-3 -ml-2">
        <ArrowLeft className="size-4" /> Dashboard
      </LinkButton>

      {/* Navigasi antar fase */}
      <nav aria-label="Fase peta jalan" className="scrollbar-thin mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-white/70 p-1.5 ring-1 ring-slate-200">
        {states.map((s) => {
          const active = s.code === phase.code;
          const locked = s.status === "TERKUNCI";
          return (
            <Link
              key={s.code}
              href={`/admin/fase/${s.code}`}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap transition",
                active ? "bg-brand-500 text-white shadow-[0_6px_14px_-6px_rgb(79_70_229/0.8)]" : locked ? "text-slate-400 hover:bg-slate-100" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {s.status === "SELESAI" ? <CheckCircle2 className={cn("size-4", active ? "text-white" : "text-mint-600")} /> : locked ? <Lock className="size-3.5" /> : null}
              {s.name}
            </Link>
          );
        })}
      </nav>

      <PageHeader
        eyebrow={`${phase.name} · ${phase.source}`}
        title={phase.title}
        description={`Target akhir fase: ${phase.target}. Rencana waktu ${formatDate(phase.start)} – ${formatDate(phase.end)}.`}
        actions={
          phase.status === "SELESAI" ? (
            <Pill tone="success"><CheckCircle2 className="size-3" /> Selesai {phase.completedAt ? formatDate(phase.completedAt) : ""}</Pill>
          ) : phase.status === "BERJALAN" ? (
            <Pill tone="info">Berjalan</Pill>
          ) : (
            <Pill><Lock className="size-3" /> Terkunci</Pill>
          )
        }
      />

      {phase.status === "TERKUNCI" ? (
        <Card>
          <CardBody className="flex flex-col items-center px-6 py-14 text-center">
            <span className="clay-soft mb-4 grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Lock className="size-7" />
            </span>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">{phase.name} masih terkunci</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Fase ini terbuka setelah {prev.name} ({prev.title}) diselesaikan. Selesaikan fase yang sedang berjalan terlebih dahulu.
            </p>
            {(() => {
              const running = states.find((s) => s.status === "BERJALAN");
              return running ? (
                <LinkButton href={`/admin/fase/${running.code}`} className="mt-5">Buka {running.name}</LinkButton>
              ) : null;
            })()}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader icon={BookOpen} title="Materi fase" description={`Ringkasan Dokumen Master (${phase.source})`} />
            <CardBody className="space-y-3 text-[15px] leading-relaxed text-slate-700">
              {phase.material.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </CardBody>
          </Card>

          <Card className="h-fit">
            <CardHeader
              icon={ListChecks}
              title="Checklist penyelesaian"
              description={phase.status === "SELESAI" ? "Fase ini sudah selesai. Buka kembali untuk mengubah checklist." : "Tandai materi sudah dibaca dan centang semua butir untuk menyelesaikan fase."}
            />
            <CardBody>
              <PhaseControls
                code={phase.code}
                name={phase.name}
                nextName={next?.name ?? null}
                status={phase.status}
                materialRead={phase.materialRead}
                checklist={phase.checklist}
                done={phase.done}
                canReopen={phase.canReopen}
              />
              {phase.status === "SELESAI" && phase.completedByName && (
                <p className="mt-4 text-xs text-slate-500">
                  Diselesaikan oleh {phase.completedByName}{phase.completedAt ? ` pada ${formatDate(phase.completedAt)}` : ""}.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
