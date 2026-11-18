"use client";

import { startTransition, useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Clock, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { PANCASILA_PROFILES, isExtension, stepMinutes, type ModulAjarData, type ModulStep } from "@/lib/modul-ajar";
import { Card, CardBody, CardHeader, Field, Input, Textarea, buttonClass } from "@/components/ui";
import { FormMessage } from "@/components/forms";
import { cn } from "@/lib/utils";

type Mode = "master" | "copy";

const EMPTY_STEP: ModulStep = { sequence: "", minutes: 10, tag: "", details: [] };

function StepsEditor({ steps, setSteps, error }: { steps: ModulStep[]; setSteps: (s: ModulStep[]) => void; error?: string }) {
  const mins = stepMinutes(steps);
  const update = (i: number, patch: Partial<ModulStep>) => setSteps(steps.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Clock className="size-3.5" /> Kegiatan inti {mins.core} menit
        {mins.all !== mins.core && <> · dengan pengayaan opsional {mins.all} menit</>}
        <span className="text-slate-400">· beri nama &quot;Extension activity&quot; untuk kegiatan opsional</span>
      </p>
      {steps.map((s, i) => (
        <div key={i} className={cn("rounded-2xl p-3 ring-1", isExtension(s) ? "bg-gold-50/40 ring-gold-200" : "bg-slate-50/60 ring-slate-200")}>
          <div className="flex flex-wrap items-end gap-2">
            <span className="mb-2 grid size-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-black text-slate-500 ring-1 ring-slate-200">{i + 1}</span>
            <label className="min-w-40 flex-1">
              <span className="text-[11px] font-bold text-slate-500">Kegiatan</span>
              <Input value={s.sequence} onChange={(e) => update(i, { sequence: e.target.value })} placeholder="mis. Listen and number" />
            </label>
            <label className="w-24">
              <span className="text-[11px] font-bold text-slate-500">Menit</span>
              <Input type="number" min={0} max={240} value={s.minutes} onChange={(e) => update(i, { minutes: Number(e.target.value) || 0 })} />
            </label>
            <label className="w-44">
              <span className="text-[11px] font-bold text-slate-500">Pendekatan (opsional)</span>
              <Input list="modul-tags" value={s.tag ?? ""} onChange={(e) => update(i, { tag: e.target.value })} placeholder="Mindful / Joyful…" />
            </label>
            <div className="mb-0.5 flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={buttonClass("ghost", "sm")} aria-label={`Naikkan langkah ${i + 1}`}><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className={buttonClass("ghost", "sm")} aria-label={`Turunkan langkah ${i + 1}`}><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => setSteps(steps.filter((_, k) => k !== i))} className={cn(buttonClass("ghost", "sm"), "text-rose-500 hover:bg-rose-50")} aria-label={`Hapus langkah ${i + 1}`}><Trash2 className="size-4" /></button>
            </div>
          </div>
          <label className="mt-2 block">
            <span className="text-[11px] font-bold text-slate-500">Rincian kegiatan (satu baris = satu poin)</span>
            <Textarea
              rows={Math.min(10, Math.max(3, s.details.length + 1))}
              value={s.details.join("\n")}
              onChange={(e) => update(i, { details: e.target.value.split("\n") })}
              placeholder={"Ask students to look at page 9.\nPlay audio 1.1 …"}
            />
          </label>
        </div>
      ))}
      <datalist id="modul-tags">
        {["Mindful", "Meaningful", "Joyful", "Mindful and meaningful", "Meaningful and joyful"].map((t) => <option key={t} value={t} />)}
      </datalist>
      <button type="button" onClick={() => setSteps([...steps.slice(0, -1), { ...EMPTY_STEP }, ...steps.slice(-1)])} className={buttonClass("secondary", "sm")}>
        <Plus className="size-4" /> Tambah langkah (sebelum penutup)
      </button>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/**
 * Editor Modul Ajar. Dikirim manual (bukan prop action) agar isian tidak hilang saat validasi gagal
 * (React 19 mengosongkan formulir setelah action selesai).
 */
export function ModulAjarEditor({
  mode,
  initial,
  action,
  submitLabel,
}: {
  mode: Mode;
  initial: ModulAjarData;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  const [steps, setSteps] = useState<ModulStep[]>(initial.steps);
  const err = state?.errors ?? {};
  const join = (a: string[]) => a.join("\n");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("steps", JSON.stringify(steps.map((s) => ({ ...s, details: s.details.map((d) => d.trim()).filter(Boolean) }))));
        startTransition(() => run(fd));
      }}
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <Card>
        <CardHeader title="Identitas modul" description={mode === "copy" ? "Sesuaikan dengan kelas Anda. RPP induk dari admin tidak ikut berubah." : "Informasi umum Modul Ajar."} />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fokus / judul pertemuan" error={err.title}><Input name="title" defaultValue={initial.title} placeholder="Vocabulary & Language" required /></Field>
          <Field label="Pertemuan ke-"><Input name="meeting" type="number" min={1} max={20} defaultValue={initial.meeting} /></Field>
          <Field label="Mata pelajaran"><Input name="subject" defaultValue={initial.subject} /></Field>
          <Field label="Buku / sumber utama"><Input name="book" defaultValue={initial.book ?? ""} placeholder="Rise Up! Teens 1" /></Field>
          <Field label="Unit"><Input name="unit" type="number" min={1} max={30} defaultValue={initial.unit ?? ""} /></Field>
          <Field label="Judul unit"><Input name="unitTitle" defaultValue={initial.unitTitle ?? ""} placeholder="Let Me Introduce Myself" /></Field>
          <Field label="Fase"><Input name="phase" defaultValue={initial.phase} /></Field>
          <Field label="Kelas (jenjang)"><Input name="grade" type="number" min={7} max={9} defaultValue={initial.grade} /></Field>
          <Field label="Semester"><Input name="semester" defaultValue={initial.semester} /></Field>
          <Field label="Alokasi waktu"><Input name="duration" defaultValue={initial.duration} /></Field>
          <Field label="Nama sekolah"><Input name="schoolName" defaultValue={initial.schoolName ?? ""} /></Field>
          <Field label="Nama penyusun"><Input name="authorName" defaultValue={initial.authorName ?? ""} /></Field>
          <Field label="Tahun penyusunan"><Input name="year" defaultValue={initial.year ?? ""} /></Field>
          {mode === "copy" && (
            <>
              <Field label="Rombel / kelas yang diajar"><Input name="className" defaultValue={initial.className ?? ""} placeholder="mis. 7A" /></Field>
              <Field label="Tanggal pelaksanaan"><Input name="teachDate" type="date" defaultValue={initial.teachDate ? initial.teachDate.slice(0, 10) : ""} /></Field>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Informasi umum" description="Satu baris = satu poin." />
        <CardBody className="grid gap-4 lg:grid-cols-2">
          <Field label="Kompetensi awal" error={err.prerequisites} className="lg:col-span-2"><Textarea name="prerequisites" rows={2} defaultValue={initial.prerequisites} /></Field>
          <Field label="Profil Pelajar Pancasila" className="lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              {PANCASILA_PROFILES.map((p) => (
                <label key={p} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 has-[:checked]:ring-brand-200">
                  <input type="checkbox" name="profiles" value={p} defaultChecked={initial.profiles.includes(p)} className="accent-brand-600" /> {p}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Sarana dan prasarana"><Textarea name="resources" rows={4} defaultValue={join(initial.resources)} /></Field>
          <Field label="Model pembelajaran" error={err.learningModel}><Textarea name="learningModel" rows={4} defaultValue={initial.learningModel} /></Field>
          <Field label="Pendekatan" className="lg:col-span-2"><Textarea name="approach" rows={5} defaultValue={join(initial.approach)} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Komponen inti" />
        <CardBody className="space-y-5">
          <Field label="Tujuan kegiatan pembelajaran (satu baris = satu tujuan)" error={err.objectives}>
            <Textarea name="objectives" rows={4} defaultValue={join(initial.objectives)} />
          </Field>
          <div>
            <p className="mb-2 text-sm font-bold text-ink">Langkah-langkah pembelajaran</p>
            <StepsEditor steps={steps} setSteps={setSteps} error={err.steps} />
          </div>
          <Field label="Asesmen (satu baris = satu poin)"><Textarea name="assessment" rows={3} defaultValue={join(initial.assessment)} /></Field>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Refleksi peserta didik"><Textarea name="reflectionStudent" rows={4} defaultValue={join(initial.reflectionStudent)} /></Field>
            <Field label="Refleksi guru"><Textarea name="reflectionTeacher" rows={4} defaultValue={join(initial.reflectionTeacher)} /></Field>
          </div>
          <Field label="Lampiran / lembar kerja"><Textarea name="attachments" rows={3} defaultValue={join(initial.attachments)} /></Field>
          {mode === "copy" && (
            <Field label="Catatan guru (opsional)" hint="Mis. penyesuaian untuk kelas Anda atau refleksi setelah mengajar.">
              <Textarea name="teacherNotes" rows={3} defaultValue={initial.teacherNotes ?? ""} />
            </Field>
          )}
        </CardBody>
      </Card>

      <div className="no-print sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
        {mode === "master" && (
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" name="published" defaultChecked={initial.published} className="size-4 accent-brand-600" /> Terbitkan untuk guru
          </label>
        )}
        <button type="submit" disabled={pending} className={cn(buttonClass("primary"), "ml-auto")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {submitLabel}
        </button>
        <div className="w-full empty:hidden"><FormMessage state={state} /></div>
      </div>
    </form>
  );
}
