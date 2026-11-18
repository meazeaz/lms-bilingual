import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTeacher } from "@/lib/auth";
import { modulFullTitle } from "@/lib/modul-ajar";
import { loadModul } from "@/lib/modul-ajar-server";
import { saveModulCopy } from "@/actions/modul-ajar";
import { ModulAjarEditor } from "@/components/modul-ajar-editor";
import { LinkButton, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Sesuaikan Modul Ajar" };

export default async function GuruModulEdit({ params }: { params: Promise<{ id: string }> }) {
  const { teacher } = await requireTeacher();
  const { id } = await params;
  const found = await loadModul(id);
  // Guru hanya boleh mengedit salinan miliknya sendiri
  if (!found || found.data.teacherId !== teacher.id) notFound();
  return (
    <>
      <LinkButton href={`/guru/rpp/modul/${id}`} variant="ghost" size="sm" className="mb-3 -ml-2"><ArrowLeft className="size-4" /> Kembali</LinkButton>
      <PageHeader
        eyebrow="Sesuaikan salinan RPP Anda"
        title={modulFullTitle(found.data)}
        description="Ubah identitas, langkah, atau kegiatan sesuai kelas Anda. RPP induk dari Tim EDT tidak ikut berubah."
      />
      <ModulAjarEditor mode="copy" initial={found.data} action={saveModulCopy} submitLabel="Simpan salinan" />
    </>
  );
}
