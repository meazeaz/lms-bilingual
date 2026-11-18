"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Check, CheckCircle2, Loader2, LockOpen, RotateCcw } from "lucide-react";
import { completePhase, reopenPhase, setPhaseMaterialRead, togglePhaseChecklist } from "@/actions/phases";
import { FormMessage } from "@/components/forms";
import { Button, Progress } from "@/components/ui";
import type { ActionState } from "@/lib/action-state";
import type { PhaseChecklistItem } from "@/lib/program";
import { cn, pct } from "@/lib/utils";

export function PhaseControls({
  code,
  name,
  nextName,
  status,
  materialRead: initialRead,
  checklist,
  done: initialDone,
  canReopen,
}: {
  code: string;
  name: string;
  nextName: string | null;
  status: "SELESAI" | "BERJALAN" | "TERKUNCI";
  materialRead: boolean;
  checklist: PhaseChecklistItem[];
  done: string[];
  canReopen: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<ActionState>(null);
  const [read, setRead] = useState(initialRead);
  const [done, setDone] = useState(() => new Set(initialDone));
  const [confirmReopen, setConfirmReopen] = useState(false);
  const editable = status === "BERJALAN";
  const steps = checklist.length + 1;
  const doneSteps = done.size + (read ? 1 : 0);
  const ready = editable && read && done.size === checklist.length;

  function run(action: () => Promise<ActionState>, rollback?: () => void, quiet = false) {
    startTransition(async () => {
      const res = await action();
      if (!res?.ok) rollback?.();
      if (!quiet || !res?.ok) setMessage(res);
      router.refresh();
    });
  }

  function toggleRead() {
    const value = !read;
    setRead(value);
    run(() => setPhaseMaterialRead(code, value), () => setRead(!value), true);
  }

  function toggleItem(id: string) {
    const checked = !done.has(id);
    const nextSet = new Set(done);
    if (checked) nextSet.add(id);
    else nextSet.delete(id);
    setDone(nextSet);
    run(() => togglePhaseChecklist(code, id, checked), () => setDone(new Set(done)), true);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-500">
          <span>Progres {name}</span>
          <span className="tabular-nums">{doneSteps}/{steps} langkah</span>
        </div>
        <Progress value={pct(doneSteps, steps)} tone={status === "SELESAI" ? "mint" : "brand"} />
      </div>

      <button
        type="button"
        onClick={toggleRead}
        disabled={!editable || pending}
        aria-pressed={read}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition disabled:cursor-not-allowed",
          read ? "border-mint-300 bg-mint-50" : "border-slate-200 bg-white hover:border-brand-300",
        )}
      >
        <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg", read ? "bg-mint-500 text-white" : "border-2 border-slate-300")}>
          {read && <Check className="size-4" strokeWidth={3} />}
        </span>
        <span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink"><BookOpenCheck className="size-4 text-brand-500" /> Materi fase sudah dibaca</span>
          <span className="mt-0.5 block text-xs text-slate-500">Baca ringkasan materi di samping sebelum menyelesaikan fase.</span>
        </span>
      </button>

      <ul className="space-y-2">
        {checklist.map((item) => {
          const checked = done.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                disabled={!editable || pending}
                aria-pressed={checked}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm transition disabled:cursor-not-allowed",
                  checked ? "border-brand-300 bg-brand-50/70" : "border-slate-200 bg-white hover:border-brand-300",
                )}
              >
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md", checked ? "bg-brand-500 text-white" : "border-2 border-slate-300")}>
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className={cn("font-semibold", checked ? "text-ink" : "text-slate-700")}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <FormMessage state={message} />

      {status === "BERJALAN" && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <Button variant="mint" size="lg" className="w-full" disabled={!ready || pending} onClick={() => run(() => completePhase(code))}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Selesaikan {name}
          </Button>
          <p className="text-center text-xs text-slate-500">
            {ready
              ? nextName
                ? `Setelah diselesaikan, ${nextName} akan terbuka.`
                : "Ini fase terakhir peta jalan."
              : `Lengkapi ${steps - doneSteps} langkah lagi untuk menyelesaikan fase ini.`}
          </p>
        </div>
      )}

      {status === "SELESAI" && canReopen && (
        <div className="border-t border-slate-100 pt-4">
          {confirmReopen ? (
            <div className="space-y-2 rounded-2xl bg-amber-50 p-3.5 ring-1 ring-amber-200">
              <p className="text-sm font-semibold text-amber-800">
                Buka kembali {name}?{nextName ? ` ${nextName} akan terkunci lagi sampai fase ini diselesaikan ulang.` : ""}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" disabled={pending} onClick={() => { setConfirmReopen(false); run(() => reopenPhase(code)); }}>
                  <LockOpen className="size-3.5" /> Ya, buka kembali
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirmReopen(false)}>Batal</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirmReopen(true)}>
              <RotateCcw className="size-3.5" /> Buka kembali fase ini
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
