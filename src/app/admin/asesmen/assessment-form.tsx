"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, HeartHandshake, Info, Sparkles, XCircle } from "lucide-react";
import { createAssessment } from "@/actions/lms";
import { ActionForm, ScorePicker, SubmitButton } from "@/components/forms";
import { Button, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { LEVEL_RULES, ORAL_ASPECTS, SIM_ASPECTS, awardedLevel, finalScore, oralScore, simulationScore, LEVEL_LABEL } from "@/lib/program";
import { toInputDate } from "@/lib/utils";

type TeacherOpt = { id: string; name: string; level: string; toefl: number | null };

export function AssessmentForm({ teachers }: { teachers: TeacherOpt[] }) {
  const [teacherId, setTeacherId] = useState("");
  const [target, setTarget] = useState<"BRONZE" | "SILVER" | "GOLD">("BRONZE");
  const [oral, setOral] = useState<number[]>([3, 3, 3, 3, 3]);
  const [sim, setSim] = useState<number[]>([3, 3, 3, 3]);
  const [written, setWritten] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const teacher = teachers.find((t) => t.id === teacherId);
  const toeflGold = (teacher?.toefl ?? 0) >= 550;
  const waived = target === "GOLD" && toeflGold && written === "";
  const w = waived ? 100 : Number(written || 0);
  const o = oralScore(oral), s = simulationScore(sim), f = finalScore(o, w, s);
  const result = awardedLevel(f, target, toeflGold);

  return (
    <ActionForm action={createAssessment}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Guru">
          <Select name="teacherId" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
            <option value="">Pilih guru…</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Level yang dituju">
          <Select name="targetLevel" value={target} onChange={(e) => setTarget(e.target.value as typeof target)}>
            <option value="BRONZE">Bronze</option><option value="SILVER">Silver</option><option value="GOLD">Gold</option>
          </Select>
        </Field>
        <Field label="Tanggal asesmen"><Input type="date" name="date" defaultValue={toInputDate()} required /></Field>
      </div>
      <Field label="Penguji kedua" hint="Bab 6.2: 2 penguji (1 C1 + 1 EDT). Gold hanya diuji guru C1 atau Kepala Sekolah.">
        <Input name="secondExaminer" placeholder="mis. Sarah Amalia, S.Pd. (C1)" />
      </Field>

      {/* ───────────── Lampiran 10: Panduan Pelatihan Penguji / Asesor ───────────── */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-3 sm:p-4 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-brand-600" />
            <span className="text-xs font-black uppercase tracking-wider text-brand-900">
              Panduan Pelatihan Penguji (Lampiran 10)
            </span>
            <Pill tone="info">Etika Asesor</Pill>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs h-7 px-2.5"
          >
            {showGuide ? (
              <>
                Tutup Panduan <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Buka Script & Etika <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {showGuide && (
          <div className="mt-4 space-y-4 pt-3 border-t border-brand-200/60 text-xs">
            {/* Script Pembukaan 1 Menit */}
            <div className="rounded-xl bg-white p-3 border border-brand-200 space-y-1.5 shadow-xs">
              <span className="font-black text-brand-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                <Sparkles className="size-3.5 text-gold-500" /> Script Pembukaan Wawancara 1 Menit (Wajib Dibacakan)
              </span>
              <p className="text-slate-700 italic leading-relaxed">
                &ldquo;Good morning/afternoon Bapak/Ibu... How are you feeling today? Please relax. Today is not an interrogation or an exam to look for your mistakes. We are here to celebrate your English journey, see how comfortable you are using classroom English, and support each other. Take a slow deep breath, and let&apos;s have a friendly conversation. Are you ready?&rdquo;
              </p>
            </div>

            {/* 5 Prinsip Etika Asesor */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">5 Prinsip Dasar Penguji (EDT):</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Mendukung & Ramah:</strong> Ruangan aman, guru tidak merasa dihakimi.</li>
                  <li><strong>Konsisten:</strong> Bersandar pada rubrik 1–4, bukan intuisi pribadi.</li>
                  <li><strong>Transparan:</strong> Alasan skor harus bisa dijelaskan secara objektif.</li>
                  <li><strong>Communication over Perfection:</strong> Kelancaran & keberanian &gt; grammar kaku.</li>
                  <li><strong>Umpan Balik Membangun:</strong> Sebut 2 kelebihan sebelum 1 saran perbaikan.</li>
                </ul>
              </div>

              {/* Tabel Do's and Don'ts */}
              <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">Do&apos;s & Don&apos;ts Saat Menguji:</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-start gap-1.5 text-emerald-700">
                    <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" />
                    <span><strong>DO:</strong> Tersenyum, beri jeda 3–5 detik, sederhanakan kalimat jika guru gugup.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-rose-700">
                    <XCircle className="size-3.5 mt-0.5 shrink-0" />
                    <span><strong>DON&apos;T:</strong> Jangan memotong pembicaraan atau membetulkan grammar langsung di tengah tes.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-rose-700">
                    <XCircle className="size-3.5 mt-0.5 shrink-0" />
                    <span><strong>DON&apos;T:</strong> Jangan menunjukkan ekspresi kaku, cemberut, atau tertawa saat ada slip kata.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panduan Target Level */}
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 text-[11px] flex items-center justify-between">
              <span><strong>Fokus Level:</strong> Bronze (Instruksi dasar kelas & sapaan) · Silver (Penjelasan konsep materi & CFU) · Gold (Bilingual penuh 70–100% & diskusi)</span>
              <span className="text-slate-400 font-mono">Lampiran 10 Bagian 3 & 5</span>
            </div>
          </div>
        )}
      </div>

      <fieldset className="rounded-2xl bg-slate-50 p-4">
        <legend className="px-1 text-sm font-black text-ink">Tes lisan · bobot 50% <span className="font-semibold text-slate-500">= {o}</span></legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {ORAL_ASPECTS.map((a, i) => (
            <ScorePicker key={a.key} name={a.key} label={a.label} defaultValue={3} onChange={(v) => setOral((p) => p.map((x, j) => (j === i ? v : x)))} />
          ))}
        </div>
      </fieldset>

      <Field label="Tes tertulis · bobot 30%" hint={target === "GOLD" && toeflGold ? "Kosongkan untuk memakai sertifikat TOEFL ≥ 550 (otomatis 100)." : "Nilai 0–100 dari bank soal Lampiran 1."}>
        <Input type="number" name="writtenScore" min={0} max={100} value={written} onChange={(e) => setWritten(e.target.value)} placeholder={waived ? "100 (TOEFL)" : "0–100"} />
      </Field>

      <fieldset className="rounded-2xl bg-slate-50 p-4">
        <legend className="px-1 text-sm font-black text-ink">Simulasi mengajar {LEVEL_RULES[target].simulationMinutes} menit · bobot 20% <span className="font-semibold text-slate-500">= {Math.round(s * 10) / 10}</span></legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {SIM_ASPECTS.map((a, i) => (
            <ScorePicker key={a.key} name={a.key} label={a.label} defaultValue={3} onChange={(v) => setSim((p) => p.map((x, j) => (j === i ? v : x)))} />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kekuatan guru"><Textarea name="strengths" placeholder="mis. Pengucapan sudah sangat jelas" /></Field>
        <Field label="Area pengembangan"><Textarea name="improvements" placeholder="mis. Menambah kosakata instruksi kelas" /></Field>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Pratinjau nilai akhir</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">{f.toLocaleString("id-ID")}</p>
          <p className="text-sm font-semibold text-slate-600">{result === "NONE" ? `Belum memenuhi syarat (batas ${LEVEL_RULES[target].passScore.toLocaleString("id-ID")})` : `Lulus sebagai ${LEVEL_LABEL[result]}`}</p>
        </div>
        <SubmitButton size="lg">Simpan hasil asesmen</SubmitButton>
      </div>
    </ActionForm>
  );
}
