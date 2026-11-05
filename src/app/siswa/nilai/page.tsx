import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  Pill,
  Progress,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentPoints } from "@/lib/metrics";
import {
  STUDENT_ASSESSMENT_TYPES,
  STUDENT_TARGET,
  cefrAtLeast,
  cefrIndex,
} from "@/lib/program";
import { formatDate, pct } from "@/lib/utils";

export const metadata: Metadata = { title: "Nilai & Target CEFR Saya" };

export default async function SiswaNilaiPage() {
  const { student } = await requireStudent();

  const [fullStudent, points] = await Promise.all([
    db.student.findUnique({
      where: { id: student.id },
      include: {
        user: true,
        classRoom: true,
        assessments: {
          include: { teacher: { include: { user: true } } },
          orderBy: { date: "desc" },
        },
      },
    }),
    studentPoints(student.id),
  ]);

  if (!fullStudent) return null;

  const target = STUDENT_TARGET[fullStudent.classRoom.grade] ?? {
    endOfYear: "A2",
    graduation: "B1",
    assessment: "Observasi",
    frequency: "2x/semester",
  };

  const isAchieved = cefrAtLeast(fullStudent.cefrLevel, target.endOfYear);
  const progressPct = Math.min(
    100,
    pct(cefrIndex(fullStudent.cefrLevel) + 1, cefrIndex(target.endOfYear) + 1)
  );

  return (
    <>
      <PageHeader
        eyebrow="Target Kemampuan Bahasa Inggris Siswa"
        title="Nilai & Target CEFR Saya"
        description="Pantau pencapaian level kemahiran bahasa Inggris (CEFR) Anda menuju standar kelulusan Bilingual 2028."
      />

      {/* Banner Level & Target */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-brand-50/80 via-white to-mint-50/60 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-[family-name:var(--font-display)] text-xl font-black text-ink">
                Halo, {fullStudent.user.name}!
              </span>
              <Pill tone="info">Kelas {fullStudent.classRoom.name}</Pill>
              {fullStudent.isStudentAmbassador && (
                <Pill tone="gold">
                  <Star className="size-3 text-amber-500 fill-amber-500" /> Student Ambassador
                </Pill>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Target kelas Anda saat ini adalah mencapai level <span className="font-bold text-brand-700">{target.endOfYear}</span> dan target kelulusan <span className="font-bold text-brand-700">{target.graduation}</span>.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center rounded-2xl bg-white px-4 py-2.5 shadow-2xs border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level Anda</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-brand-700">
                {fullStudent.cefrLevel}
              </p>
            </div>

            <div className="text-center rounded-2xl bg-white px-4 py-2.5 shadow-2xs border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Akhir Tahun</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-black text-emerald-600">
                {target.endOfYear}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Status Ketercapaian Target"
          value={isAchieved ? "Tercapai ✓" : "Sedang Berproses"}
          hint={isAchieved ? `Selamat, Anda sudah mencapai level ${target.endOfYear}!` : `Kurang sedikit lagi menuju level ${target.endOfYear}`}
          icon={Target}
          tone={isAchieved ? "mint" : "gold"}
        >
          <Progress value={progressPct} size="sm" tone={isAchieved ? "mint" : "brand"} />
        </StatCard>

        <StatCard
          label="Total Poin Gamifikasi"
          value={`${points.total} Poin`}
          hint="Kuis, Club, dan Prestasi Lomba"
          icon={Sparkles}
          tone="brand"
        />

        <StatCard
          label="Kuis Materi Selesai"
          value={`${points.quizzesPassed} Kuis Lulus`}
          hint={`+${points.quizPoints} poin kuis terkumpul`}
          icon={BookOpen}
          tone="mint"
        />

        <StatCard
          label="Target Kelulusan 2028"
          value={target.graduation}
          hint="Standar Sekolah Bilingual Al Madany"
          icon={GraduationCap}
          tone="gold"
        />
      </div>

      {/* Riwayat Asesmen Lengkap Siswa */}
      <Card>
        <CardHeader
          icon={Award}
          title={`Riwayat Asesmen & Nilai Resmi (${fullStudent.assessments.length})`}
          description="Hasil tes kemampuan berbicara, observasi keaktifan kelas, dan TOEFL Prediction dari guru pengampu."
        />
        <CardBody className="p-0">
          {fullStudent.assessments.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Belum Ada Nilai Asesmen Resmi"
              description="Guru pengampu bahasa Inggris akan mencatat hasil observasi partisipasi atau tes berbicara berkala Anda di sini."
            />
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
                    <Th>Komponen Cambridge (L / S / R / W / Use)</Th>
                    <Th>Guru Penilai</Th>
                    <Th>Catatan Guru</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fullStudent.assessments.map((a) => {
                    const hasCambridge =
                      a.listening != null ||
                      a.speaking != null ||
                      a.reading != null ||
                      a.writing != null ||
                      a.useOfEnglish != null;

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition">
                        <Td className="whitespace-nowrap font-medium text-slate-600">
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
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <span title="Listening">L: {a.listening ?? "-"}</span> ·
                              <span title="Speaking">S: {a.speaking ?? "-"}</span> ·
                              <span title="Reading">R: {a.reading ?? "-"}</span> ·
                              <span title="Writing">W: {a.writing ?? "-"}</span> ·
                              <span title="Use of English">U: {a.useOfEnglish ?? "-"}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </Td>
                        <Td className="text-xs text-slate-600">{a.teacher.user.name}</Td>
                        <Td className="text-xs text-slate-500 italic max-w-xs truncate">
                          {a.notes ? `“${a.notes}”` : "-"}
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

      {/* Penjelasan Tangga Level CEFR untuk Siswa */}
      <Card>
        <CardHeader
          icon={GraduationCap}
          title="Panduan Tangga Kemampuan Bahasa Inggris (CEFR Framework)"
          description="Memahami tahapan kemampuan komunikasi dari dasar hingga mahir."
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-700">A1 / Pre A1</span>
              <h4 className="mt-2 text-xs font-black uppercase text-ink">Pemula Dasar</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Mampu memahami salam sederhana, memperkenalkan diri, dan merespon instruksi pendek guru di kelas.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
              <span className="rounded-lg bg-brand-200 px-2 py-0.5 text-xs font-black text-brand-800">A2 / A2+</span>
              <h4 className="mt-2 text-xs font-black uppercase text-brand-900">Komunikasi Kelas (Target 7 & 8)</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Mampu berdialog percakapan sehari-hari, menjawab pertanyaan guru, dan berdiskusi kelompok secara aktif.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="rounded-lg bg-emerald-200 px-2 py-0.5 text-xs font-black text-emerald-800">B1 / B1+</span>
              <h4 className="mt-2 text-xs font-black uppercase text-emerald-900">Mandiri (Target Lulus / Kelas 9)</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Mampu presentasi topik pelajaran, menceritakan pengalaman (storytelling), dan membaca buku pelajaran non-bahasa.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
              <span className="rounded-lg bg-amber-200 px-2 py-0.5 text-xs font-black text-amber-800">B2 / C1</span>
              <h4 className="mt-2 text-xs font-black uppercase text-amber-900">Mahir & Debat</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Mampu berdebat formal dalam bahasa Inggris, menjadi tutor sebaya (Student Ambassador), dan berkompetisi di tingkat nasional.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
