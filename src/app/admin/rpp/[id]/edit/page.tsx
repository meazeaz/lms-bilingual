import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { modulFullTitle } from "@/lib/modul-ajar";
import { loadModul } from "@/lib/modul-ajar-server";
import { saveModulMaster } from "@/actions/modul-ajar";
import { ModulAjarEditor } from "@/components/modul-ajar-editor";
import { LinkButton, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Edit Modul Ajar" };

export default async function AdminRppEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = await loadModul(id);
  if (!found || found.data.teacherId) notFound();
  return (
    <>
      <LinkButton href={`/admin/rpp/${id}`} variant="ghost" size="sm" className="mb-3 -ml-2"><ArrowLeft className="size-4" /> Batal</LinkButton>
      <PageHeader eyebrow="Edit RPP induk" title={modulFullTitle(found.data)} description="Perubahan langsung terlihat oleh guru di perpustakaan RPP. Salinan yang sudah dibuat guru tidak ikut berubah." />
      <ModulAjarEditor mode="master" initial={found.data} action={saveModulMaster} submitLabel="Simpan RPP" />
    </>
  );
}
