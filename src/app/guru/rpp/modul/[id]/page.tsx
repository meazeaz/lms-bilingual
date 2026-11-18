import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookCopy, CopyPlus, Pencil, Trash2 } from "lucide-react";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { modulFullTitle } from "@/lib/modul-ajar";
import { loadModul } from "@/lib/modul-ajar-server";
import { deleteModulCopy, adoptModulAjar } from "@/actions/modul-ajar";
import { ModulAjarDocument } from "@/components/modul-ajar-document";
import { ConfirmButton } from "@/components/confirm-button";
import { LinkButton, PageHeader, buttonClass } from "@/components/ui";
import { PrintButton } from "../../[id]/print-button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Modul Ajar" };

export default async function GuruModulDetail({ params }: { params: Promise<{ id: string }> }) {
  const { teacher } = await requireTeacher();
  const { id } = await params;
  const found = await loadModul(id);
  if (!found) notFound();
  const m = found.data;
  const isMine = m.teacherId === teacher.id;
  const isMaster = !m.teacherId;
  // Guru hanya boleh membuka RPP induk yang terbit atau salinan miliknya sendiri
  if (!isMine && !(isMaster && m.published)) notFound();
  const myCopy = isMaster
    ? await db.modulAjar.findFirst({ where: { sourceId: m.id, teacherId: teacher.id }, select: { id: true } })
    : null;

  return (
    <>
      <LinkButton href={isMine ? "/guru/rpp?tab=saya" : "/guru/rpp"} variant="ghost" size="sm" className="no-print mb-3 -ml-2">
        <ArrowLeft className="size-4" /> {isMine ? "RPP Saya" : "Perpustakaan RPP"}
      </LinkButton>
      <div className="no-print">
        <PageHeader
          eyebrow={isMine ? "Salinan pribadi Anda" : "RPP dari Tim EDT"}
          title={modulFullTitle(m)}
          description={
            isMine
              ? `Diubah ${formatDateTime(m.updatedAt)}${found.source ? "" : " · RPP induknya sudah dihapus admin, salinan ini tetap aman."}`
              : "Klik Gunakan untuk membuat salinan yang bisa Anda sesuaikan."
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {isMine ? (
                <>
                  <LinkButton href={`/guru/rpp/modul/${m.id}/edit`} size="sm"><Pencil className="size-4" /> Edit</LinkButton>
                  <PrintButton />
                  {found.source && (
                    <Link href={`/guru/rpp/modul/${found.source.id}`} className={buttonClass("ghost", "sm")}>Lihat RPP induk</Link>
                  )}
                  <form action={deleteModulCopy}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message="Hapus salinan RPP ini? RPP induk dari Tim EDT tidak terpengaruh." className={`${buttonClass("ghost", "sm")} text-rose-600 hover:bg-rose-50`}>
                      <Trash2 className="size-4" /> Hapus
                    </ConfirmButton>
                  </form>
                </>
              ) : myCopy ? (
                <>
                  <LinkButton href={`/guru/rpp/modul/${myCopy.id}`} size="sm"><BookCopy className="size-4" /> Buka salinan saya</LinkButton>
                  <form action={adoptModulAjar}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className={buttonClass("secondary", "sm")}><CopyPlus className="size-4" /> Buat salinan lain</button>
                  </form>
                </>
              ) : (
                <form action={adoptModulAjar}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className={buttonClass("primary", "sm")}><CopyPlus className="size-4" /> Gunakan RPP ini</button>
                </form>
              )}
            </div>
          }
        />
      </div>
      <ModulAjarDocument m={m} />
    </>
  );
}
