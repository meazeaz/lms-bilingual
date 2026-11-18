import type { Metadata } from "next";
import Link from "next/link";
import { BookCopy, Clock, FileText, Layers, Plus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupByUnit, stepMinutes } from "@/lib/modul-ajar";
import { loadMasters } from "@/lib/modul-ajar-server";
import { Card, EmptyState, LinkButton, PageHeader, Pill, StatCard } from "@/components/ui";

export const metadata: Metadata = { title: "Modul Ajar (RPP)" };

export default async function AdminRppPage() {
  await requireAdmin();
  const [masters, teacherCount, teachersUsing] = await Promise.all([
    loadMasters({ includeDrafts: true }),
    db.teacher.count(),
    db.modulAjar.findMany({ where: { teacherId: { not: null } }, distinct: ["teacherId"], select: { teacherId: true } }),
  ]);
  const groups = groupByUnit(masters);
  const published = masters.filter((m) => m.published).length;
  const copies = masters.reduce((a, m) => a + m.copyCount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Kurikulum · Modul Ajar Kurikulum Merdeka"
        title="Modul Ajar (RPP)"
        description="RPP disusun oleh Tim EDT. Guru memakai RPP yang sudah terbit, lalu menyesuaikan salinannya untuk kelas masing-masing."
        actions={<LinkButton href="/admin/rpp/baru"><Plus className="size-4" /> Buat RPP baru</LinkButton>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="RPP induk" value={masters.length} hint={`${groups.length} unit`} tone="brand" />
        <StatCard icon={Layers} label="Terbit untuk guru" value={published} hint={`${masters.length - published} draf`} tone="mint" />
        <StatCard icon={Users} label="Guru memakai" value={`${teachersUsing.length}/${teacherCount}`} hint="Punya minimal 1 salinan" tone="gold" />
        <StatCard icon={BookCopy} label="Salinan guru" value={copies} hint="RPP yang disesuaikan guru" tone="coral" />
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={FileText} title="Belum ada RPP" description="Buat RPP pertama, atau jalankan npm run db:seed-modul untuk mengimpor RPP Rise Up! Teens 1." />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-3 flex flex-wrap items-baseline gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                {g.unit ? `Unit ${g.unit}` : "Tanpa unit"}
                {g.unitTitle && <span>· {g.unitTitle}</span>}
                {g.book && <span className="text-sm font-bold text-slate-400">{g.book}</span>}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {g.items.map((m) => {
                  const mins = stepMinutes(m.steps);
                  return (
                    <Link key={m.id} href={`/admin/rpp/${m.id}`} className="block">
                      <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:ring-brand-200">
                        <div className="flex items-start justify-between gap-2">
                          <span className="clay-soft grid size-10 place-items-center rounded-xl bg-brand-50 font-[family-name:var(--font-display)] font-semibold text-brand-700">P{m.meeting}</span>
                          {m.published ? <Pill tone="success">Terbit</Pill> : <Pill tone="warning">Draf</Pill>}
                        </div>
                        <p className="mt-3 font-bold text-ink">{m.title}</p>
                        <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {mins.core} menit</span>
                          <span>{m.steps.length} langkah</span>
                          <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {m.copyCount} guru</span>
                        </p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
