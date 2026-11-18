import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Keyboard,
  MessagesSquare,
  Mic,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  LevelBadge,
  PageHeader,
  Pill,
  Progress,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { studentPoints } from "@/lib/metrics";
import {
  STUDENT_ASSESSMENT_TYPES,
  STUDENT_TARGET,
  cefrAtLeast,
  cefrIndex,
} from "@/lib/program";
import { cn, formatDate, parseJson, pct } from "@/lib/utils";

/** Rincian jawaban soal Speaking yang disimpan submitQuiz (QuizAttempt.answers). */
type SpeakingAnswer = {
  questionIndex: number;
  type: string;
  mode?: "READ_ALOUD" | "RESPOND";
  method?: "speech" | "typed";
  answer?: string;
  accuracy?: number;
  wordCount?: number;
  score?: number;
};

export interface StudentDetailProps {
  student: {
    id: string;
    nis: string | null;
    cefrLevel: string;
    pareAlumni: boolean;
    isStudentAmbassador: boolean;
    user: {
      name: string;
      email: string;
    };
    classRoom: {
      id: string;
      name: string;
      grade: number;
    };
    assessments: Array<{
      id: string;
      date: Date;
      type: string;
      semester: string;
      score: number;
      cefrLevel: string;
      listening: number | null;
      speaking: number | null;
      reading: number | null;
      writing: number | null;
      useOfEnglish: number | null;
      notes: string | null;
      teacher: {
        user: { name: string };
      };
    }>;
    quizAttempts: Array<{
      id: string;
      score: number;
      answers: string;
      createdAt: Date;
      quiz: {
        title: string;
        passScore: number;
        material: {
          title: string;
          category: string;
        };
      };
    }>;
    attendances: Array<{
      id: string;
      role: string;
      present: boolean;
      session: {
        type: string;
        date: Date;
        topic: string;
      };
    }>;
    competitions: Array<{
      id: string;
      result: string;
      points: number;
      notes: string | null;
      competition: {
        name: string;
        level: string;
        category: string;
        date: Date;
      };
    }>;
  };
  backHref: string;
  backLabel: string;
}

export async function StudentDetailView({
  student,
  backHref,
  backLabel,
}: StudentDetailProps) {
  const points = await studentPoints(student.id);
  const target = STUDENT_TARGET[student.classRoom.grade] ?? {
    endOfYear: "A2",
    graduation: "B1",
    assessment: "Observasi",
    frequency: "2x/semester",
  };

  const progress = Math.min(
    100,
    pct(cefrIndex(student.cefrLevel) + 1, cefrIndex(target.endOfYear) + 1)
  );

  const passedQuizzes = student.quizAttempts.filter(
    (q) => q.score >= q.quiz.passScore
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" /> {backLabel}
          </Button>
        </Link>
      </div>

      {/* Profil Banner Siswa */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-brand-50/60 via-white to-mint-50/40 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={student.user.name} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-ink">
                  {student.user.name}
                </h1>
                <Pill tone="info">Kelas {student.classRoom.name}</Pill>
                {student.pareAlumni && (
                  <Pill tone="gold">Alumni Pare</Pill>
                )}
                {student.isStudentAmbassador && (
                  <Pill tone="success">
                    <Star className="size-3 text-amber-500 fill-amber-500" /> Student Ambassador
                  </Pill>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                NIS: {student.nis ?? "-"} · Email: {student.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Level CEFR</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-brand-700">
                {student.cefrLevel}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Poin</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-emerald-600">
                {points.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Target Akhir Tahun"
          value={target.endOfYear}
          hint={`Lulus 2028: Target ${target.graduation}`}
          icon={GraduationCap}
          tone={cefrAtLeast(student.cefrLevel, target.endOfYear) ? "mint" : "gold"}
        >
          <Progress value={progress} size="sm" tone={progress >= 100 ? "mint" : "brand"} />
        </StatCard>
        <StatCard
          label="Kuis Dikuasai"
          value={`${passedQuizzes} / ${student.quizAttempts.length}`}
          hint={`${points.quizPoints} poin terakumulasi`}
          icon={BookOpen}
          tone="mint"
        />
        <StatCard
          label="Partisipasi Club"
          value={`${student.attendances.length} Sesi`}
          hint={`${points.clubPoints} poin (${student.attendances.filter((a) => a.role === "TUTOR").length}× Tutor)`}
          icon={MessagesSquare}
          tone="brand"
        />
        <StatCard
          label="Prestasi Lomba"
          value={`${student.competitions.length} Event`}
          hint={`${points.compPoints} poin dari kejuaraan`}
          icon={Trophy}
          tone="gold"
        />
      </div>

      {/* Riwayat Asesmen Lengkap */}
      <Card>
        <CardHeader
          icon={Award}
          title={`Riwayat Asesmen & Nilai Bahasa Inggris (${student.assessments.length})`}
          description="Evaluasi berkala kompetensi bahasa Inggris dan subkomponen Cambridge Framework."
        />
        <CardBody className="p-0">
          {student.assessments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada riwayat asesmen yang tercatat untuk siswa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Tanggal</Th>
                    <Th>Jenis Asesmen</Th>
                    <Th>Semester</Th>
                    <Th className="text-center">Skor</Th>
                    <Th className="text-center">Level CEFR</Th>
                    <Th>Subkomponen Cambridge (L/S/R/W/U)</Th>
                    <Th>Penilai</Th>
                    <Th>Catatan</Th>
                  </tr>
                </thead>
                <tbody>
                  {student.assessments.map((a) => {
                    const hasCambridge =
                      a.listening != null ||
                      a.speaking != null ||
                      a.reading != null ||
                      a.writing != null ||
                      a.useOfEnglish != null;

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition">
                        <Td className="whitespace-nowrap text-xs font-semibold text-slate-600">
                          {formatDate(a.date)}
                        </Td>
                        <Td className="font-bold text-ink">
                          {STUDENT_ASSESSMENT_TYPES[a.type] ?? a.type}
                        </Td>
                        <Td className="text-xs text-slate-500">{a.semester}</Td>
                        <Td className="text-center font-black text-brand-700">
                          {a.score}
                        </Td>
                        <Td className="text-center">
                          <Pill tone={cefrAtLeast(a.cefrLevel, target.endOfYear) ? "success" : "info"}>
                            {a.cefrLevel}
                          </Pill>
                        </Td>
                        <Td>
                          {hasCambridge ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                              <span title="Listening">L:{a.listening ?? "-"}</span>
                              <span title="Speaking">S:{a.speaking ?? "-"}</span>
                              <span title="Reading">R:{a.reading ?? "-"}</span>
                              <span title="Writing">W:{a.writing ?? "-"}</span>
                              <span title="Use of English">U:{a.useOfEnglish ?? "-"}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </Td>
                        <Td className="text-xs text-slate-600">{a.teacher.user.name}</Td>
                        <Td className="text-xs text-slate-500 max-w-xs truncate">
                          {a.notes ?? "-"}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dua Kolom: Kuis & English Club */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Riwayat Kuis */}
        <Card>
          <CardHeader
            icon={BookOpen}
            title={`Riwayat Kuis & Materi (${student.quizAttempts.length})`}
            description="Kuis interaktif berbasis teks materi bacaan bilingual."
          />
          <CardBody className="p-0">
            {student.quizAttempts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Siswa belum mengerjakan kuis materi.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {student.quizAttempts.map((qa) => {
                  const passed = qa.score >= qa.quiz.passScore;
                  const speaking = parseJson<SpeakingAnswer[]>(qa.answers, []).filter(
                    (a) => a && a.type === "SPEAKING",
                  );
                  const typedCount = speaking.filter((a) => a.method === "typed").length;
                  return (
                    <div key={qa.id} className="space-y-2 p-3.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-ink">{qa.quiz.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Materi: {qa.quiz.material.title} · {formatDate(qa.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          {typedCount > 0 && (
                            <Pill tone="warning">
                              <Keyboard className="size-3" /> {typedCount} speaking diketik
                            </Pill>
                          )}
                          <span className="font-black text-ink">{qa.score} / 100</span>
                          <Pill tone={passed ? "success" : "danger"}>
                            {passed ? "Lulus (+10 pt)" : "Coba Lagi (+3 pt)"}
                          </Pill>
                        </div>
                      </div>

                      {speaking.length > 0 && (
                        <ul className="space-y-1.5">
                          {speaking.map((a) => {
                            const typed = a.method === "typed";
                            return (
                              <li
                                key={a.questionIndex}
                                className={cn(
                                  "rounded-xl px-3 py-2 ring-1",
                                  typed ? "bg-amber-50/70 ring-amber-200" : "bg-pink-50/50 ring-pink-100",
                                )}
                              >
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-slate-700">
                                    Soal #{a.questionIndex + 1} · Speaking {a.mode === "RESPOND" ? "(jawab lisan)" : "(baca nyaring)"}
                                  </span>
                                  {typed ? (
                                    <Pill tone="warning">
                                      <Keyboard className="size-3" /> Diketik, bukan diucapkan
                                    </Pill>
                                  ) : (
                                    <Pill tone="success">
                                      <Mic className="size-3" /> Diucapkan
                                    </Pill>
                                  )}
                                  <span className="ml-auto font-bold tabular-nums text-slate-600">
                                    {a.mode === "RESPOND"
                                      ? `${a.wordCount ?? 0} kata · nilai ${a.score ?? 0}`
                                      : `ketepatan ${a.accuracy ?? 0}% · nilai ${a.score ?? 0}`}
                                  </span>
                                </div>
                                {a.answer && (
                                  <p className="mt-1 italic text-slate-600">&ldquo;{a.answer}&rdquo;</p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Riwayat Club & Lomba */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={MessagesSquare}
              title={`Kehadiran English Club (${student.attendances.length})`}
              description="Aktivitas Sabtu (Club) & Kamis (Peer Tutoring)."
            />
            <CardBody className="p-0">
              {student.attendances.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Belum ada catatan absensi club.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {student.attendances.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3.5 text-xs">
                      <div>
                        <p className="font-bold text-ink">{att.session.topic}</p>
                        <p className="text-[11px] text-slate-400">
                          {att.session.type === "PEER_TUTORING" ? "Peer Tutoring" : "English Club"} · {formatDate(att.session.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={att.role === "TUTOR" ? "gold" : "info"}>
                          {att.role === "TUTOR" ? "Tutor (+5 pt)" : "Peserta (+3 pt)"}
                        </Pill>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={Trophy}
              title={`Ajang Lomba & Prestasi (${student.competitions.length})`}
              description="Kompetisi bahasa Inggris tingkat kecamatan s.d. nasional."
            />
            <CardBody className="p-0">
              {student.competitions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Belum ada keikutsertaan lomba yang tercatat.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {student.competitions.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3.5 text-xs">
                      <div>
                        <p className="font-bold text-ink">{entry.competition.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {entry.competition.category} · Tingkat {entry.competition.level} · {formatDate(entry.competition.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone="gold">{entry.result}</Pill>
                        <span className="font-black text-emerald-600">+{entry.points} pt</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
