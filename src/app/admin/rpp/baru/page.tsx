import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { emptyModul } from "@/lib/modul-ajar";
import { saveModulMaster } from "@/actions/modul-ajar";
import { ModulAjarEditor } from "@/components/modul-ajar-editor";
import { LinkButton, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "RPP Baru" };

export default async function AdminRppNew() {
  await requireAdmin();
  return (
    <>
      <LinkButton href="/admin/rpp" variant="ghost" size="sm" className="mb-3 -ml-2"><ArrowLeft className="size-4" /> Batal</LinkButton>
      <PageHeader eyebrow="Modul Ajar Kurikulum Merdeka" title="Buat RPP baru" description="RPP yang diterbitkan langsung tersedia di perpustakaan RPP guru." />
      <ModulAjarEditor mode="master" initial={emptyModul()} action={saveModulMaster} submitLabel="Simpan RPP" />
    </>
  );
}
