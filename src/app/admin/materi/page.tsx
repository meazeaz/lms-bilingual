import type { Metadata } from "next";
import { BookOpen, CheckCircle2, FileCheck2, HelpCircle } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMaterialCategories, getSchoolSubjects } from "@/lib/settings-server";
import { MaterialItem, MaterialManagementView } from "@/app/guru/materi/materi-client";
import { sortCoreFirst } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "Kelola Materi & Kuis Siswa (Admin)",
};

export default async function AdminMateriPage() {
  await requireAdmin();

  const [materialsRaw, totalPassedAttempts, subjects, categories] = await Promise.all([
    db.material.findMany({
      include: {
        quizzes: true,
        author: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.quizAttempt.count({
      where: { score: { gte: 70 } },
    }),
    getSchoolSubjects(),
    getMaterialCategories(),
  ]);

  const materials: MaterialItem[] = sortCoreFirst(materialsRaw).map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    subject: m.subject,
    grade: m.grade,
    cefrLevel: m.cefrLevel,
    summary: m.summary,
    content: m.content,
    vocabulary: m.vocabulary,
    published: m.published,
    authorName: m.author?.user.name ?? "Guru SMPIT Al Madany",
    quizzes: m.quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      passScore: q.passScore,
      questions: q.questions,
    })),
  }));

  const publishedCount = materials.filter((m) => m.published).length;
  const totalQuizzes = materials.reduce((acc, m) => acc + m.quizzes.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Bab 7.7 · Bahan Ajar & Kosakata Mapel"
        title="Kelola Materi Pembelajaran & Kuis"
        description="Pusat kontrol kurikulum bilingual: tinjau materi per mapel, terbitkan materi, dan kelola kuis latihan mandiri siswa."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Materi"
          value={materials.length}
          hint="Bahan ajar terdaftar"
          tone="brand"
        />
        <StatCard
          icon={FileCheck2}
          label="Materi Terbit"
          value={publishedCount}
          hint="Dapat dibaca oleh siswa"
          tone="mint"
        />
        <StatCard
          icon={HelpCircle}
          label="Kuis Interaktif"
          value={totalQuizzes}
          hint="Latihan mandiri aktif"
          tone="gold"
        />
        <StatCard
          icon={CheckCircle2}
          label="Penyelesaian Kuis"
          value={totalPassedAttempts}
          hint="Siswa dinyatakan lulus"
          tone="coral"
        />
      </div>

      <MaterialManagementView
        materials={materials}
        availableSubjects={subjects}
        availableCategories={categories}
      />
    </>
  );
}
