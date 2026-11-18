import { existsSync } from "node:fs";
import { FileKey2, FileQuestion, FileText, Lock } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { CORE_BOOK, isCoreMaterial, unitNumber } from "@/lib/curriculum";
import { SOURCE_LABEL, sourcePath, type SourceKind } from "@/lib/curriculum-sources";

const ITEMS: { kind: SourceKind; icon: typeof FileText; desc: string }[] = [
  { kind: "tg", icon: FileText, desc: "Langkah mengajar, naskah audio, dan kunci latihan buku" },
  { kind: "tes", icon: FileQuestion, desc: "Versi cetak untuk tes di kelas (sama dengan kuis LMS)" },
  { kind: "kunci", icon: FileKey2, desc: "Jawaban Progress Test" },
];

/** Tautan PDF asli unit Rise Up! (khusus guru & admin). Tidak tampil untuk materi non-inti. */
export function CoreSourcesCard({ material }: { material: { category: string; title: string } }) {
  const unit = unitNumber(material.title);
  if (!isCoreMaterial(material) || !unit) return null;
  return (
    <Card className="h-fit">
      <CardHeader icon={Lock} title="Sumber asli (khusus guru)" description={`${CORE_BOOK.title} · Unit ${unit}`} />
      <CardBody className="space-y-2">
        {ITEMS.map(({ kind, icon: Icon, desc }) => {
          const p = sourcePath(kind, unit);
          const available = Boolean(p && existsSync(p));
          return available ? (
            <a
              key={kind}
              href={`/api/sumber/${kind}-${unit}`}
              target="_blank"
              rel="noopener"
              className="flex items-start gap-3 rounded-2xl p-2.5 ring-1 ring-slate-200 transition hover:bg-brand-50/60 hover:ring-brand-200"
            >
              <span className="clay-soft grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="size-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{SOURCE_LABEL[kind]} (PDF)</span>
                <span className="block text-xs text-slate-500">{desc}</span>
              </span>
            </a>
          ) : (
            <div key={kind} className="flex items-start gap-3 rounded-2xl p-2.5 text-slate-400 ring-1 ring-slate-100">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50"><Icon className="size-4" /></span>
              <span className="text-sm">{SOURCE_LABEL[kind]}: berkas belum tersedia di server</span>
            </div>
          );
        })}
        <p className="pt-1 text-[11px] text-slate-400">Siswa tidak dapat membuka berkas ini.</p>
      </CardBody>
    </Card>
  );
}
