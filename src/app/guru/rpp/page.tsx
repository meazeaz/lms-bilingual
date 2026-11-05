import type { Metadata } from "next";
import { CheckCircle2, Clock, FileCheck, FileText, Plus, Sparkles } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Level } from "@/lib/program";
import { getSchoolSubjects } from "@/lib/settings-server";
import { RppViewContainer, type LessonPlanItem } from "./rpp-client";

export const metadata: Metadata = { title: "RPP Bilingual Guru · SMP IT Al Madany" };

export default async function GuruRppPage() {
  const [{ teacher }, subjects] = await Promise.all([
    requireTeacher(),
    getSchoolSubjects(),
  ]);

  const rawPlans = await db.lessonPlan.findMany({
    where: { teacherId: teacher.id },
    orderBy: { updatedAt: "desc" },
  });

  const plans: LessonPlanItem[] = rawPlans.map((p) => ({
    id: p.id,
    title: p.title,
    subject: p.subject,
    className: p.className,
    date: p.date.toISOString(),
    targetLevel: p.targetLevel,
    cambridgeSkills: p.cambridgeSkills,
    objectives: p.objectives,
    englishSentences: p.englishSentences,
    vocabulary: p.vocabulary,
    opening: p.opening,
    mainActivity: p.mainActivity,
    closing: p.closing,
    assessmentPlan: p.assessmentPlan,
    postReflection: p.postReflection,
    status: p.status as "DRAF" | "DIAJUKAN" | "DISETUJUI" | "REVISI",
    reviewNote: p.reviewNote,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const approvedCount = plans.filter((p) => p.status === "DISETUJUI").length;
  const pendingCount = plans.filter((p) => p.status === "DIAJUKAN").length;
  const revisionCount = plans.filter((p) => p.status === "REVISI").length;
  const draftCount = plans.filter((p) => p.status === "DRAF").length;

  return (
    <>
      <PageHeader
        eyebrow="Lampiran 11 Juknis Bilingual"
        title="Penyusunan RPP Bilingual"
        description="Rencana Pelaksanaan Pembelajaran terintegrasi Cambridge Framework dengan minimal 3 kalimat instruksi bahasa Inggris wajib di setiap pertemuan."
      />

      {/* Ringkasan Statistik RPP */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total RPP Dibuat"
          value={plans.length}
          hint="Dokumen pembelajaran bilingual"
          icon={FileText}
          tone="brand"
        />
        <StatCard
          label="RPP Disetujui EDT"
          value={approvedCount}
          hint="Siap diimplementasikan di kelas"
          icon={FileCheck}
          tone="mint"
        />
        <StatCard
          label="Menunggu Review"
          value={pendingCount}
          hint="Sedang diperiksa oleh Tim EDT"
          icon={Clock}
          tone="gold"
        />
        <StatCard
          label="Perlu Revisi / Draf"
          value={revisionCount + draftCount}
          hint={`${revisionCount} revisi · ${draftCount} draf`}
          icon={Sparkles}
          tone={revisionCount > 0 ? "coral" : "brand"}
        />
      </div>

      <RppViewContainer
        plans={plans}
        defaultSubject={teacher.subject}
        currentLevel={teacher.ambassadorLevel as Level}
        availableSubjects={subjects}
      />
    </>
  );
}
