"use client";

import { startTransition, useActionState, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, SearchCheck, Upload, XCircle } from "lucide-react";
import { importUsers, type ImportResult } from "@/actions/import";
import { Checkbox, Field, Input, Pill, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ImportForm({ kind }: { kind: "TEACHER" | "STUDENT" }) {
  const [state, action, pending] = useActionState<ImportResult, FormData>(importUsers, null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"check" | "import">("check");
  const label = kind === "TEACHER" ? "guru" : "siswa";

  return (
    <div className="space-y-4">
      {/* Dikirim manual (bukan prop action) agar form tidak di-reset otomatis oleh React:
          berkas & password tetap terisi setelah "Periksa dulu" sehingga bisa langsung "Impor". */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const fd = new FormData(e.currentTarget);
          const m = submitter?.value === "import" ? "import" : "check";
          fd.set("mode", m);
          setMode(m);
          startTransition(() => action(fd));
        }}
      >
        <input type="hidden" name="kind" value={kind} />
        <a href={`/api/excel/template-${label}`} className={buttonClass("secondary", "sm")}>
          <Download className="size-4" /> Unduh templat {label}
        </a>

        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition",
            fileName ? "border-brand-300 bg-brand-50/60" : "border-slate-200 bg-slate-50/60 hover:border-brand-300",
          )}
        >
          <FileSpreadsheet className={cn("size-8", fileName ? "text-brand-500" : "text-slate-400")} />
          <span className="text-sm font-bold text-ink">{fileName || "Pilih berkas Excel (.xlsx)"}</span>
          <span className="text-xs text-slate-500">Maksimal 2 MB · 2.000 baris</span>
          <input
            type="file"
            name="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>

        <Field label="Password default" hint="Dipakai untuk baris yang kolom Password Awal-nya kosong. Minimal 8 karakter.">
          <Input name="defaultPassword" type="text" autoComplete="off" placeholder="mis. AlMadany2028" minLength={8} />
        </Field>

        {kind === "STUDENT" && (
          <Checkbox name="createClasses" label="Buat kelas baru otomatis" description="Kelas yang belum ada (mis. 7D) akan dibuat sesuai jenjang di angka pertama." />
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" value="check" disabled={pending} className={buttonClass("secondary")}>
            {pending && mode === "check" ? <Loader2 className="size-4 animate-spin" /> : <SearchCheck className="size-4" />} Periksa dulu
          </button>
          <button type="submit" value="import" disabled={pending} className={buttonClass("primary")}>
            {pending && mode === "import" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Impor {label}
          </button>
        </div>
      </form>

      {state && <ImportReport state={state} />}
    </div>
  );
}

function ImportReport({ state }: { state: NonNullable<ImportResult> }) {
  const tone = state.errors.length > 0 ? "warning" : state.ok ? "success" : "danger";
  return (
    <div className="space-y-3" role="status">
      <div
        className={cn(
          "flex items-start gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold ring-1",
          tone === "success" && "bg-mint-50 text-mint-700 ring-mint-200",
          tone === "warning" && "bg-amber-50 text-amber-800 ring-amber-200",
          tone === "danger" && "bg-rose-50 text-rose-700 ring-rose-200",
        )}
      >
        {tone === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : tone === "warning" ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
        <span>
          {state.message}
          {state.dryRun && state.created > 0 && " Belum ada yang disimpan. Klik \"Impor\" untuk menyimpan."}
        </span>
      </div>

      {state.total > 0 && (
        <div className="flex flex-wrap gap-2">
          <Pill tone="neutral">{state.total} baris dibaca</Pill>
          <Pill tone="success">{state.created} {state.dryRun ? "siap diimpor" : "dibuat"}</Pill>
          {state.skipped.length > 0 && <Pill tone="info">{state.skipped.length} dilewati</Pill>}
          {state.errors.length > 0 && <Pill tone="danger">{state.errors.length} bermasalah</Pill>}
          {state.createdClasses.length > 0 && <Pill tone="warning">Kelas baru: {state.createdClasses.join(", ")}</Pill>}
        </div>
      )}

      {(state.errors.length > 0 || state.skipped.length > 0) && (
        <ul className="scrollbar-thin max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-2xl bg-white text-sm ring-1 ring-slate-200">
          {state.errors.map((e) => (
            <li key={`e${e.row}`} className="flex gap-3 px-3.5 py-2">
              <span className="shrink-0 font-bold tabular-nums text-rose-600">Baris {e.row}</span>
              <span className="text-slate-600">{e.message}</span>
            </li>
          ))}
          {state.skipped.map((s) => (
            <li key={`s${s.row}`} className="flex gap-3 px-3.5 py-2">
              <span className="shrink-0 font-bold tabular-nums text-brand-600">Baris {s.row}</span>
              <span className="text-slate-600">{s.email}: {s.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
