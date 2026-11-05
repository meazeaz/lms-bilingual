import type { Metadata } from "next";
import { Megaphone, Users, UserCheck, GraduationCap } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PengumumanClient } from "./pengumuman-client";

export const metadata: Metadata = {
  title: "Kelola Pengumuman",
};

export default async function AdminPengumumanPage() {
  await requireAdmin();

  const announcementsRaw = await db.announcement.findMany({
    include: {
      author: {
        select: { name: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = announcementsRaw.length;
  const teacherCount = announcementsRaw.filter((a) => a.audience === "TEACHER").length;
  const studentCount = announcementsRaw.filter((a) => a.audience === "STUDENT").length;
  const allCount = announcementsRaw.filter((a) => a.audience === "ALL").length;

  return (
    <>
      <PageHeader
        eyebrow="Administrasi & Komunikasi"
        title="Pusat Siaran Pengumuman"
        description="Kelola pemberitahuan resmi program bilingual untuk seluruh civitas akademika SMP IT Al Madany."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={Megaphone}
          label="Total Pengumuman"
          value={total}
          hint="Pemberitahuan aktif"
          tone="brand"
        />
        <StatCard
          icon={Users}
          label="Semua Pengguna"
          value={allCount}
          hint="Audiens ALL"
          tone="mint"
        />
        <StatCard
          icon={UserCheck}
          label="Dewan Guru"
          value={teacherCount}
          hint="Audiens TEACHER"
          tone="gold"
        />
        <StatCard
          icon={GraduationCap}
          label="Seluruh Siswa"
          value={studentCount}
          hint="Audiens STUDENT"
          tone="coral"
        />
      </div>

      <PengumumanClient announcements={announcementsRaw} />
    </>
  );
}
