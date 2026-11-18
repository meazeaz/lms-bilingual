import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpenText, Headphones, Mic, HelpCircle, PenTool, Pencil, Radio, Type, Volume2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader, LinkButton, PageHeader, Pill } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";
import { MaterialContentCard, ReadingPassagePreview, VocabularyCard } from "@/components/material-audio";
import { CoreSourcesCard } from "@/components/core-sources-card";

export const metadata: Metadata = {
  title: "Pratinjau Materi Siswa",
};

export default async function GuruMaterialDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireTeacher();

  const m = await db.material.findUnique({
    where: { id },
    include: {
      quizzes: true,
      author: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!m) notFound();

  const vocab = parseJson<{ en: string; id: string }[]>(m.vocabulary, []);
  const quiz = m.quizzes[0];
  const questions = quiz ? parseJson<QuizQuestion[]>(quiz.questions, []) : [];

  return (
    <div className="space-y-6">
      <LinkButton href="/guru/materi" variant="ghost" size="sm" className="mb-2 -ml-2">
        <ArrowLeft className="size-4" /> Kembali ke Manajemen Materi
      </LinkButton>

      <PageHeader
        eyebrow={`Pratinjau Materi Siswa · ${m.subject ?? "Umum"} · ${m.category} · ${m.cefrLevel}`}
        title={m.title}
        description={m.summary}
      />

      {/* Banner Mode Pratinjau */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-xs text-brand-900 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold">Simulasi Tampilan Materi & Kuis Siswa</p>
          <p className="text-brand-700">
            Penulis: {m.author?.user.name ?? "Guru SMPIT Al Madany"} · Status: {m.published ? "Terbit (Dapat diakses siswa)" : "Draf"}
          </p>
        </div>
        <Link href="/guru/materi">
          <Button variant="secondary" size="sm">
            <Pencil className="size-3.5" /> Edit Materi Ini
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <MaterialContentCard content={m.content} title="Bacaan Materi Pembelajaran" />

          {quiz && (
            <Card>
              <CardHeader
                icon={HelpCircle}
                title={quiz.title}
                description={`${questions.length} butir soal · Nilai minimal lulus ≥ ${quiz.passScore}`}
              />
              <CardBody className="space-y-5">
                <ol className="space-y-5">
                  {questions.map((q, i) => {
                    const qType = q.type || "MULTIPLE_CHOICE";
                    return (
                      <li key={i} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-400">Butir #{i + 1}</span>
                          {qType === "READING" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                              <BookOpenText className="size-3" /> Reading
                            </span>
                          ) : qType === "SPEAKING" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-800">
                              <Mic className="size-3" /> Speaking
                            </span>
                          ) : qType === "LISTENING" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                              <Headphones className="size-3" /> Listening
                            </span>
                          ) : qType === "WRITING" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <PenTool className="size-3" /> Writing
                            </span>
                          ) : qType === "FILL_IN" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              <Type className="size-3" /> Isian Singkat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                              <Radio className="size-3" /> Pilihan Ganda
                            </span>
                          )}
                        </div>

                        {qType === "READING" && q.passage && (
                          <ReadingPassagePreview title={q.passageTitle} passage={q.passage} allowAudio={q.allowAudio !== false} />
                        )}

                        <p className="font-bold text-ink">{q.q}</p>

                        {qType === "SPEAKING" && (
                          <div className="rounded-xl border border-pink-200 bg-pink-50/60 p-3 text-xs text-pink-950 space-y-1">
                            {q.speakingMode === "RESPOND" ? (
                              <>
                                <p><strong>Jawab lisan:</strong> minimal {q.minWords || 10} kata.</p>
                                {q.targetKeywords && q.targetKeywords.length > 0 && <p><strong>Kosakata kunci:</strong> {q.targetKeywords.join(", ")}</p>}
                                {q.modelAnswer && <p className="italic text-slate-700"><strong>Contoh jawaban:</strong> &ldquo;{q.modelAnswer}&rdquo;</p>}
                              </>
                            ) : (
                              <p><strong>Baca nyaring:</strong> &ldquo;{q.targetText}&rdquo; ({q.speakingAccent === "en-GB" ? "aksen UK" : "aksen US"})</p>
                            )}
                          </div>
                        )}

                        {qType === "READING" && q.readingFormat === "FILL_IN" && (
                          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 text-xs text-sky-950">
                            <strong>Kunci Jawaban:</strong>{" "}
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">{q.fillInAnswer}</span>
                            {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                              <span className="text-slate-600 ml-2">(Variasi diterima: {q.acceptedAnswers.join(", ")})</span>
                            )}
                          </div>
                        )}

                        {qType === "LISTENING" && (
                          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs text-purple-900 space-y-1">
                            <span className="font-bold block">
                              {q.audioUrl ? "Sumber Audio MP3: " + q.audioUrl : "Naskah Audio (TTS):"}
                            </span>
                            {q.audioScript && <p className="italic text-purple-800">&ldquo;{q.audioScript}&rdquo;</p>}
                            {q.listeningFormat === "FILL_IN" && (
                              <p className="font-bold text-emerald-800">Kunci Isian: {q.fillInAnswer}</p>
                            )}
                            <p className="pt-1 text-[11px] font-semibold text-purple-700">
                              Untuk siswa: {q.allowSpeedChange === false ? "kecepatan terkunci Normal" : "boleh memilih kecepatan"} ·{" "}
                              {q.maxPlays ? `maksimal ${q.maxPlays}× putar` : "putar tidak terbatas"}
                            </p>
                          </div>
                        )}

                        {qType === "FILL_IN" ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-950 space-y-1">
                            <p>
                              <strong>Kunci Jawaban:</strong>{" "}
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                                {q.fillInAnswer}
                              </span>
                              {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                                <span className="text-slate-600 ml-2">
                                  (Variasi diterima: {q.acceptedAnswers.join(", ")})
                                </span>
                              )}
                            </p>
                            {q.fillInHint && (
                              <p className="text-slate-600">
                                <strong>Petunjuk:</strong> {q.fillInHint}
                              </p>
                            )}
                          </div>
                        ) : qType === "WRITING" ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 space-y-1">
                            <p><strong>Ketentuan:</strong> Minimal {q.minWords || 10} kata.</p>
                            {q.targetKeywords && q.targetKeywords.length > 0 && (
                              <p><strong>Kosakata Wajib:</strong> {q.targetKeywords.join(", ")}</p>
                            )}
                            {q.modelAnswer && (
                              <p className="italic pt-1 text-slate-700">
                                <strong>Model Jawaban Asesor:</strong> &ldquo;{q.modelAnswer}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          q.options && q.options.length > 0 && !(qType === "READING" && q.readingFormat === "FILL_IN") && (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {q.options.map((o, j) => (
                                <div
                                  key={j}
                                  className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                                    q.answer === j
                                      ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold"
                                      : "border-slate-200 bg-white text-slate-700"
                                  }`}
                                >
                                  {String.fromCharCode(65 + j)}. {o} {q.answer === j && "✓ (Kunci)"}
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </li>
                    );
                  })}
                </ol>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                  * Catatan: Ini adalah tampilan pratinjau untuk Guru. Di layar siswa, kuis dapat dikerjakan secara interaktif.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <CoreSourcesCard material={m} />
          <VocabularyCard vocab={vocab} title="Kosakata (Vocabulary)" />
        </div>
      </div>
    </div>
  );
}
