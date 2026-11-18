import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BookCopy, Clock, CopyPlus, FileText, Library, Pencil } from "lucide-react";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupByUnit, modulFullTitle, stepMinutes } from "@/lib/modul-ajar";
import { loadMasters, loadTeacherCopies } from "@/lib/modul-ajar-server";
import { adoptModulAjar } from "@/actions/modul-ajar";
import { Card, EmptyState, LinkTabs, PageHeader, Pill, StatusPill, buttonClass } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Modul Ajar (RPP)" };

export default async function GuruRppPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { teacher } = await requireTeacher();
  const { tab: tabParam } = await searchParams;
  const [masters, copies, archive] = await Promise.all([
    loadMasters(),
    loadTeacherCopies(teacher.id),
    db.lessonPlan.findMany({ where: { teacherId: teacher.id }, orderBy: { date: "desc" } }),
  ]);
  const tab = tabParam === "saya" || (tabParam === "arsip" && archive.length > 0) ? tabParam : "perpustakaan";
  const copyBySource = new Map<string, string>();
  for (const c of copies) if (c.sourceId && !copyBySource.has(c.sourceId)) copyBySource.set(c.sourceId, c.id);

  const tabs = [
    { key: "perpustakaan", label: "Perpustakaan RPP", href: "/guru/rpp", count: masters.length },
    { key: "saya", label: "RPP Saya", href: "/guru/rpp?tab=saya", count: copies.length },
    ...(archive.length > 0 ? [{ key: "arsip", label: "Arsip RPP lama", href: "/guru/rpp?tab=arsip", count: archive.length }] : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Modul Ajar Kurikulum Merdeka"
        title="Modul Ajar (RPP)"
        description="RPP disiapkan oleh Tim EDT. Pilih RPP, klik Gunakan, lalu sesuaikan salinannya untuk kelas Anda. RPP induk tidak ikut berubah."
      />
      <LinkTabs tabs={tabs} active={tab} />

      {tab === "perpustakaan" &&
        (masters.length === 0 ? (
          <EmptyState icon={Library} title="Belum ada RPP terbit" description="Tim EDT belum menerbitkan RPP. Silakan cek kembali nanti." />
        ) : (
          <div className="space-y-6">
            {groupByUnit(masters).map((g) => (
              <section key={g.key}>
                <h2 className="mb-3 flex flex-wrap items-baseline gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                  {g.unit ? `Unit ${g.unit}` : "Lainnya"}
                  {g.unitTitle && <span>· {g.unitTitle}</span>}
                  {g.book && <span className="text-sm font-bold text-slate-400">{g.book}</span>}
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {g.items.map((m) => {
                    const mine = copyBySource.get(m.id);
                    return (
                      <Card key={m.id} className="flex h-full flex-col p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="clay-soft grid size-10 place-items-center rounded-xl bg-brand-50 font-[family-name:var(--font-display)] font-semibold text-brand-700">P{m.meeting}</span>
                          {mine && <Pill tone="success">Sudah dipakai</Pill>}
                        </div>
                        <p className="mt-3 font-bold text-ink">{m.title}</p>
                        <p className="mt-1 flex-1 text-xs text-slate-500">
                          <Clock className="mr-1 inline size-3.5" />{stepMinutes(m.steps).core} menit · {m.steps.length} langkah · {m.objectives.length} tujuan
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/guru/rpp/modul/${m.id}`} className={buttonClass("secondary", "sm")}><FileText className="size-4" /> Lihat</Link>
                          {mine ? (
                            <Link href={`/guru/rpp/modul/${mine}`} className={buttonClass("primary", "sm")}><BookCopy className="size-4" /> Salinan saya</Link>
                          ) : (
                            <form action={adoptModulAjar}>
                              <input type="hidden" name="id" value={m.id} />
                              <button type="submit" className={buttonClass("primary", "sm")}><CopyPlus className="size-4" /> Gunakan</button>
                            </form>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ))}

      {tab === "saya" &&
        (copies.length === 0 ? (
          <EmptyState icon={BookCopy} title="Belum ada RPP yang Anda pakai" description="Buka tab Perpustakaan RPP lalu klik Gunakan pada RPP yang ingin Anda ajarkan." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {copies.map((c) => (
              <Card key={c.id} className="flex flex-col p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.book ?? c.subject}</p>
                <p className="font-bold text-ink">{modulFullTitle(c)}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  {c.className && <Pill tone="info">{c.className}</Pill>}
                  {c.teachDate && <Pill>{formatDate(new Date(c.teachDate))}</Pill>}
                  <span>Diubah {formatDateTime(c.updatedAt)}</span>
                  {!c.sourceId && <Pill tone="warning">RPP induk sudah dihapus admin</Pill>}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/guru/rpp/modul/${c.id}`} className={buttonClass("secondary", "sm")}><FileText className="size-4" /> Lihat & cetak</Link>
                  <Link href={`/guru/rpp/modul/${c.id}/edit`} className={buttonClass("primary", "sm")}><Pencil className="size-4" /> Edit</Link>
                </div>
              </Card>
            ))}
          </div>
        ))}

      {tab === "arsip" && (
        <Card className="p-4">
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-500"><Archive className="size-4" /> RPP yang Anda susun sendiri sebelum memakai Modul Ajar dari Tim EDT (hanya baca).</p>
          <ul className="divide-y divide-slate-100">
            {archive.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>
                  <Link href={`/guru/rpp/${p.id}`} className="font-bold text-ink hover:text-brand-600">{p.title}</Link>
                  <span className="block text-xs text-slate-500">{p.subject} · {p.className} · {formatDate(p.date)}</span>
                </span>
                <StatusPill status={p.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
