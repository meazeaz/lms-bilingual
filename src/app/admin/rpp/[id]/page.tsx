import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Pencil, Trash2, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { modulFullTitle } from "@/lib/modul-ajar";
import { loadModul } from "@/lib/modul-ajar-server";
import { deleteModulMaster, toggleModulPublish } from "@/actions/modul-ajar";
import { ModulAjarDocument } from "@/components/modul-ajar-document";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, CardBody, CardHeader, LinkButton, PageHeader, Pill, buttonClass } from "@/components/ui";
import { PrintButton } from "@/app/guru/rpp/[id]/print-button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Detail Modul Ajar" };

export default async function AdminRppDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = await loadModul(id);
  if (!found || found.data.teacherId) notFound();
  const m = found.data;
  const copies = await db.modulAjar.findMany({
    where: { sourceId: id },
    include: { teacher: { include: { user: { select: { name: true } } } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <LinkButton href="/admin/rpp" variant="ghost" size="sm" className="no-print mb-3 -ml-2"><ArrowLeft className="size-4" /> Semua RPP</LinkButton>
      <div className="no-print">
        <PageHeader
          eyebrow={`RPP induk · ${m.published ? "Terbit untuk guru" : "Draf (belum terlihat guru)"}`}
          title={modulFullTitle(m)}
          description={`Terakhir diperbarui ${formatDateTime(m.updatedAt)}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <LinkButton href={`/admin/rpp/${m.id}/edit`} variant="secondary" size="sm"><Pencil className="size-4" /> Edit</LinkButton>
              <form action={toggleModulPublish}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className={buttonClass("secondary", "sm")}>
                  {m.published ? <><EyeOff className="size-4" /> Jadikan draf</> : <><Eye className="size-4" /> Terbitkan</>}
                </button>
              </form>
              <PrintButton />
              <form action={deleteModulMaster}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton
                  message={`Hapus RPP "${m.title}"? ${copies.length > 0 ? `${copies.length} salinan guru tetap tersimpan.` : ""}`}
                  className={`${buttonClass("ghost", "sm")} text-rose-600 hover:bg-rose-50`}
                >
                  <Trash2 className="size-4" /> Hapus
                </ConfirmButton>
              </form>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <ModulAjarDocument m={m} />
        <Card className="no-print h-fit">
          <CardHeader icon={Users} title="Dipakai guru" description={`${copies.length} salinan`} />
          <CardBody className="pt-2">
            {copies.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada guru yang memakai RPP ini.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {copies.map((c) => (
                  <li key={c.id} className="py-2.5 text-sm">
                    <p className="font-bold text-ink">{c.teacher?.user.name ?? "—"}</p>
                    <p className="text-xs text-slate-500">
                      {c.className ? <Pill className="mr-1">{c.className}</Pill> : null}
                      Diubah {formatDateTime(c.updatedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-400">Perubahan pada RPP induk tidak mengubah salinan yang sudah dibuat guru.</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
