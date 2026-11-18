import Link from "next/link";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Pill, Progress } from "@/components/ui";
import type { PhaseState } from "@/lib/phases-server";
import { cn, formatDate, pct } from "@/lib/utils";

/** Grid kartu Peta Jalan dengan status berurutan: Selesai, Berjalan, atau Terkunci (gembok). */
export function PhaseRoadmapGrid({ states, linkBase }: { states: PhaseState[]; linkBase?: string }) {
  return (
    <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {states.map((p) => {
        const locked = p.status === "TERKUNCI";
        const steps = p.checklist.length + 1; // checklist + materi dibaca
        const doneSteps = p.done.length + (p.materialRead ? 1 : 0);
        const body = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className={cn("text-xs font-black", locked ? "text-slate-400" : "text-ink")}>{p.name}</span>
              {p.status === "SELESAI" ? (
                <Pill tone="success"><CheckCircle2 className="size-3" /> Selesai</Pill>
              ) : p.status === "BERJALAN" ? (
                <Pill tone="info">Berjalan</Pill>
              ) : (
                <Pill><Lock className="size-3" /> Terkunci</Pill>
              )}
            </div>
            <p className={cn("mt-1 text-sm font-bold", locked ? "text-slate-400" : "text-ink")}>{p.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">Rencana: {formatDate(p.start)} – {formatDate(p.end)}</p>
            <p className={cn("mt-1.5 text-xs", locked ? "text-slate-400" : "text-slate-600")}>{p.target}</p>
            {p.status === "BERJALAN" && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Progres fase</span>
                  <span className="tabular-nums">{doneSteps}/{steps}</span>
                </div>
                <Progress value={pct(doneSteps, steps)} size="sm" />
              </div>
            )}
            {p.status === "SELESAI" && p.completedAt && (
              <p className="mt-2 text-[11px] font-semibold text-mint-700">
                Diselesaikan {formatDate(p.completedAt)}{p.completedByName ? ` oleh ${p.completedByName}` : ""}
              </p>
            )}
            {locked && (
              <p className="mt-2 text-[11px] font-semibold text-slate-400">Terbuka setelah Fase {p.index - 1} selesai</p>
            )}
            {linkBase && !locked && (
              <span className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-bold text-brand-600">
                {p.status === "BERJALAN" ? "Kerjakan fase ini" : "Lihat detail"} <ChevronRight className="size-3" />
              </span>
            )}
          </>
        );
        const cls = cn(
          "block h-full rounded-2xl p-3.5 ring-1 transition",
          p.status === "BERJALAN" && "bg-brand-50 ring-brand-300",
          p.status === "SELESAI" && "bg-mint-50/60 ring-mint-200",
          locked && "bg-slate-50/70 ring-slate-200",
          linkBase && !locked && "hover:-translate-y-0.5 hover:shadow-md",
        );
        return (
          <li key={p.code}>
            {linkBase && !locked ? (
              <Link href={`${linkBase}/${p.code}`} className={cls}>{body}</Link>
            ) : (
              <div className={cls} aria-disabled={locked || undefined}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
