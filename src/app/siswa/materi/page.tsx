import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Card, PageHeader, Pill } from "@/components/ui";
import { HoverLift, Stagger, StaggerItem } from "@/components/motion";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Materi & Kuis" };

export default async function MaterialsPage() {
  const { student } = await requireStudent();
  const grade = student.classRoom.grade;
  const materials = await db.material.findMany({
    where: { published: true, OR: [{ grade }, { grade: null }, { grade: { lt: grade } }] },
    include: { quizzes: { include: { attempts: { where: { studentId: student.id } } } } },
    orderBy: [{ grade: "asc" }, { title: "asc" }],
  });
  return (
    <>
      <PageHeader eyebrow="Kosakata mapel, ungkapan sehari-hari, grammar" title="Materi & kuis" description="Baca materinya, hafalkan kosakatanya, lalu kerjakan kuis. Nilai minimal lulus 70." />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {materials.map((m) => {
          const best = Math.max(-1, ...m.quizzes.flatMap((q) => q.attempts.map((a) => a.score)));
          const passed = best >= 70;
          return (
            <StaggerItem key={m.id}>
              <HoverLift className="h-full">
                <Link href={`/siswa/materi/${m.id}`} className="block h-full">
                  <Card className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="clay-soft grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-600"><BookOpen className="size-5" /></span>
                      {passed ? <Pill tone="success"><CheckCircle2 className="size-3" /> Lulus · {best}</Pill> : best >= 0 ? <Pill tone="warning">Nilai {best}</Pill> : <Pill tone="coral">Baru</Pill>}
                    </div>
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">{m.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-slate-500">{m.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5"><Pill tone="info">{m.subject}</Pill><Pill>{m.category}</Pill><Pill>{m.cefrLevel}</Pill></div>
                  </Card>
                </Link>
              </HoverLift>
            </StaggerItem>
          );
        })}
      </Stagger>
    </>
  );
}
