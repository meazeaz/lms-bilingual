import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Languages, PencilLine } from "lucide-react";
import { Card, CardBody, CardHeader, LinkButton, PageHeader, Pill } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, parseJson } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";
import { QuizForm } from "./quiz-form";

export const metadata: Metadata = { title: "Materi" };

export default async function MaterialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { student } = await requireStudent();
  const m = await db.material.findUnique({ where: { id }, include: { quizzes: { include: { attempts: { where: { studentId: student.id }, orderBy: { createdAt: "desc" } } } } } });
  if (!m || !m.published) notFound();
  const vocab = parseJson<{ en: string; id: string }[]>(m.vocabulary, []);
  const quiz = m.quizzes[0];
  const questions = quiz ? parseJson<QuizQuestion[]>(quiz.questions, []) : [];

  return (
    <>
      <LinkButton href="/siswa/materi" variant="ghost" size="sm" className="mb-3 -ml-2"><ArrowLeft className="size-4" /> Semua materi</LinkButton>
      <PageHeader eyebrow={`${m.subject} · ${m.category} · ${m.cefrLevel}`} title={m.title} description={m.summary} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader icon={BookOpen} title="Materi" />
            <CardBody className="space-y-3 text-[15px] leading-relaxed text-slate-700">
              {m.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </CardBody>
          </Card>
          {quiz && (
            <Card>
              <CardHeader icon={PencilLine} title={quiz.title} description={`${questions.length} soal · lulus ≥ ${quiz.passScore}`} />
              <CardBody>
                <QuizForm quizId={quiz.id} questions={questions} />
                {quiz.attempts.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Riwayat percobaan</p>
                    <div className="flex flex-wrap gap-2">
                      {quiz.attempts.map((a) => <Pill key={a.id} tone={a.score >= quiz.passScore ? "success" : "warning"}>{a.score} · {formatDate(a.createdAt)}</Pill>)}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
        <Card className="h-fit">
          <CardHeader icon={Languages} title="Kosakata" description="English → Indonesia" />
          <CardBody>
            <ul className="divide-y divide-slate-100">
              {vocab.map((v) => (
                <li key={v.en} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="font-bold text-ink">{v.en}</span><span className="text-right text-sm text-slate-500">{v.id}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
