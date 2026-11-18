import { Clock } from "lucide-react";
import { isExtension, stepMinutes, type ModulAjarData } from "@/lib/modul-ajar";
import { cn, formatDate } from "@/lib/utils";

const TAG_TONE: Record<string, string> = {
  mindful: "bg-sky-50 text-sky-700 ring-sky-200",
  meaningful: "bg-mint-50 text-mint-700 ring-mint-200",
  joyful: "bg-gold-50 text-gold-700 ring-gold-200",
};

function Tags({ tag }: { tag?: string | null }) {
  if (!tag) return null;
  const parts = tag.split(/\s*(?:,|&|and)\s*/i).filter(Boolean);
  return (
    <span className="mb-1.5 flex flex-wrap gap-1">
      {parts.map((p) => (
        <span key={p} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold ring-1", TAG_TONE[p.toLowerCase()] ?? "bg-slate-50 text-slate-600 ring-slate-200")}>
          {p}
        </span>
      ))}
    </span>
  );
}

function Section({ letter, title, children }: { letter?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid border-t border-slate-200 px-5 py-4 sm:px-7">
      <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-ink">
        {letter && <span className="mr-1.5 text-brand-600">{letter}.</span>}
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function Bullets({ items, empty = "—" }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-slate-400">{empty}</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 marker:text-brand-400">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

/** Dokumen Modul Ajar (tampilan baca & cetak), mengikuti format Modul Ajar Kurikulum Merdeka. */
export function ModulAjarDocument({ m }: { m: ModulAjarData }) {
  const mins = stepMinutes(m.steps);
  let no = 0;
  const identity: [string, string][] = [
    ["Nama Sekolah", m.schoolName || "…………………………"],
    ["Nama Penyusun", m.authorName || "…………………………"],
    ["Tahun Penyusunan", m.year || "…………"],
    ["Mata Pelajaran", m.subject],
    ["Fase / Kelas", `${m.phase} / ${m.grade === 7 ? "VII (Tujuh)" : m.grade === 8 ? "VIII (Delapan)" : "IX (Sembilan)"}${m.className ? ` · ${m.className}` : ""}`],
    ["Semester", m.semester],
    ["Unit", m.unit ? `${m.unit}${m.unitTitle ? ` – ${m.unitTitle}` : ""}` : m.unitTitle || "—"],
    ["Pertemuan", `${m.meeting} · ${m.title}`],
    ["Alokasi Waktu", m.duration],
  ];
  if (m.teachDate) identity.push(["Tanggal Pelaksanaan", formatDate(new Date(m.teachDate))]);

  return (
    <article className="modul-doc overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200 print:rounded-none print:ring-0">
      <header className="bg-gradient-to-br from-brand-50 to-white px-5 py-6 text-center sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Modul Ajar Kurikulum Merdeka</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">{m.subject}</h2>
        <p className="mt-1 text-sm font-bold text-slate-600">
          ({m.unit ? `Unit ${m.unit} – ` : ""}{m.unitTitle || m.title})
        </p>
        <p className="mt-0.5 text-sm text-slate-500">Pertemuan {m.meeting} · {m.title}{m.book ? ` · ${m.book}` : ""}</p>
      </header>

      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-500 sm:px-7">Informasi Umum</div>
      <Section letter="A" title="Identitas Modul">
        <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {identity.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-36 shrink-0 text-slate-500">{k}</dt>
              <dd className="font-semibold text-ink">: {v}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section letter="B" title="Kompetensi Awal">
        <p>{m.prerequisites}</p>
      </Section>
      <Section letter="C" title="Profil Pelajar Pancasila">
        <div className="flex flex-wrap gap-1.5">
          {m.profiles.length === 0 ? <span className="text-slate-400">—</span> : m.profiles.map((p) => (
            <span key={p} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100">{p}</span>
          ))}
        </div>
      </Section>
      <Section letter="D" title="Sarana dan Prasarana">
        <Bullets items={m.resources} />
      </Section>
      <Section letter="E" title="Model Pembelajaran">
        <p>{m.learningModel}</p>
      </Section>
      <Section letter="F" title="Pendekatan">
        {m.approach.length === 0 ? <p className="text-slate-400">—</p> : (
          <div className="space-y-1.5">
            {m.approach.map((a, i) =>
              /learning\b/i.test(a) && a.length < 60 ? (
                <p key={i} className={cn("font-bold text-ink", i > 0 && "pt-1")}>{a}</p>
              ) : (
                <p key={i}>{a}</p>
              ),
            )}
          </div>
        )}
      </Section>

      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-500 sm:px-7">Komponen Inti</div>
      <Section letter="A" title="Tujuan Kegiatan Pembelajaran">
        <Bullets items={m.objectives} />
      </Section>
      <Section letter="B" title="Langkah-langkah Pembelajaran">
        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="size-3.5" /> Kegiatan inti {mins.core} menit
          {mins.all !== mins.core && <> · termasuk kegiatan pengayaan opsional: {mins.all} menit</>}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="w-10 border border-slate-200 px-2 py-2 text-center">No</th>
                <th className="w-40 border border-slate-200 px-3 py-2">Kegiatan</th>
                <th className="w-20 border border-slate-200 px-2 py-2 text-center">Waktu</th>
                <th className="border border-slate-200 px-3 py-2">Rincian</th>
              </tr>
            </thead>
            <tbody>
              {m.steps.map((s, i) => {
                const ext = isExtension(s);
                const warm = i === 0 && /warm/i.test(s.sequence);
                const label = ext ? "Opsional" : warm ? "" : String(++no);
                return (
                  <tr key={i} className={cn("align-top break-inside-avoid", ext && "bg-gold-50/40")}>
                    <td className="border border-slate-200 px-2 py-2 text-center text-xs font-bold text-slate-500">{label}</td>
                    <td className="border border-slate-200 px-3 py-2 font-bold text-ink">{s.sequence}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center text-xs font-semibold text-slate-600">{s.minutes} menit</td>
                    <td className="border border-slate-200 px-3 py-2">
                      <Tags tag={s.tag} />
                      <ul className="list-disc space-y-1 pl-4 text-[13px] marker:text-slate-300">
                        {s.details.map((d, j) => <li key={j}>{d}</li>)}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
      <Section letter="C" title="Asesmen">
        <Bullets items={m.assessment} />
      </Section>
      <Section letter="D" title="Refleksi">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-wider text-slate-500">Untuk peserta didik</p>
            <Bullets items={m.reflectionStudent} />
          </div>
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-wider text-slate-500">Untuk guru</p>
            <Bullets items={m.reflectionTeacher} />
          </div>
        </div>
      </Section>
      <Section title="Lampiran · Lembar Kerja Peserta Didik">
        <Bullets items={m.attachments} />
      </Section>
      {m.teacherNotes && (
        <Section title="Catatan Guru">
          <p className="whitespace-pre-line">{m.teacherNotes}</p>
        </Section>
      )}
    </article>
  );
}
