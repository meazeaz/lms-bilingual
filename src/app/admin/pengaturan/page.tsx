import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSystemSettings } from "@/lib/settings-server";
import { PengaturanClient } from "./pengaturan-client";

export const metadata: Metadata = {
  title: "Master Data & Pengaturan Sistem · Admin",
};

export default async function AdminPengaturanPage() {
  await requireAdmin();

  const [settings, teachers, materials] = await Promise.all([
    getSystemSettings(),
    db.teacher.findMany({ select: { subject: true } }),
    db.material.findMany({ select: { subject: true, category: true } }),
  ]);

  const teacherSubjectCount: Record<string, number> = {};
  for (const t of teachers) {
    if (t.subject) {
      teacherSubjectCount[t.subject] = (teacherSubjectCount[t.subject] ?? 0) + 1;
    }
  }

  const materialSubjectCount: Record<string, number> = {};
  const materialCategoryCount: Record<string, number> = {};
  for (const m of materials) {
    if (m.subject) {
      materialSubjectCount[m.subject] = (materialSubjectCount[m.subject] ?? 0) + 1;
    }
    if (m.category) {
      materialCategoryCount[m.category] = (materialCategoryCount[m.category] ?? 0) + 1;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Administrator · Pengaturan Fleksibel"
        title="Master Data & Pengaturan Sistem"
        description="Kelola daftar mata pelajaran, kategori materi pembelajaran, serta profil resmi sekolah dan semester aktif tanpa perlu mengubah kode program."
      />

      <PengaturanClient
        settings={settings}
        stats={{
          teacherSubjectCount,
          materialSubjectCount,
          materialCategoryCount,
        }}
      />
    </>
  );
}
