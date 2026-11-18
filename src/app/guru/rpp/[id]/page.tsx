import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Globe } from "lucide-react";
import { Button, LevelBadge, Pill, StatusPill } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Level } from "@/lib/program";
import { formatDate, parseJson } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Detail RPP Bilingual · SMP IT Al Madany" };

export default async function LessonPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const plan = await db.lessonPlan.findUnique({
    where: { id },
    include: {
      teacher: {
        include: { user: true },
      },
    },
  });

  if (!plan) notFound();

  // Hanya pemilik RPP atau Admin yang boleh melihat
  if (user.role === "TEACHER" && plan.teacherId !== user.teacher?.id) {
    notFound();
  }

  const cambridgeSkills = parseJson<string[]>(plan.cambridgeSkills, []);
  const sentenceList = plan.englishSentences
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Navigation & Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={user.role === "ADMIN" ? "/admin/rpp" : "/guru/rpp?tab=arsip"}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" /> Kembali ke Daftar RPP
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <StatusPill status={plan.status} />
          <PrintButton />
        </div>
      </div>

      {/* Catatan Review (Jika ada & belum cetak) */}
      {plan.reviewNote && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/80 p-4 text-xs text-brand-900 print:hidden">
          <span className="font-bold">Catatan Review Verifikator EDT: </span>
          <span>{plan.reviewNote}</span>
        </div>
      )}

      {/* Printable RPP Document Sheet */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs print:border-none print:p-0 print:shadow-none text-slate-900">
        {/* Header Resmi Sekolah */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
          <Image
            src="/logo-almadany.png"
            alt="Logo SMP IT Al Madany"
            width={60}
            height={60}
            className="size-15 object-contain shrink-0"
          />
          <div className="flex-1 text-center">
            <p className="font-[family-name:var(--font-display)] text-xs font-bold tracking-widest text-slate-500 uppercase">
              Yayasan Islamic Center Al Madany
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-slate-900 uppercase">
              SMPIT AL MADANY PARUNG PANJANG
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Program Akselerasi Menuju Sekolah Bilingual 2028 · Kurikulum Merdeka Terintegrasi Cambridge
            </p>
            <div className="mt-2 inline-block rounded-lg bg-slate-100 px-4 py-1 text-xs font-black uppercase tracking-wider text-slate-800">
              RENCANA PELAKSANAAN PEMBELAJARAN (RPP) BILINGUAL · LAMPIRAN 11
            </div>
          </div>
          <div className="size-15 shrink-0 hidden sm:block" />
        </div>

        {/* Tabel Identitas Pembelajaran */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-300">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-300">
              <tr className="divide-x divide-slate-300">
                <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-700">Mata Pelajaran</td>
                <td className="w-1/4 p-2.5 font-semibold text-slate-900">{plan.subject}</td>
                <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-700">Kelas / Semester</td>
                <td className="w-1/4 p-2.5 font-semibold text-slate-900">{plan.className} / Ganjil</td>
              </tr>
              <tr className="divide-x divide-slate-300">
                <td className="bg-slate-50 p-2.5 font-bold text-slate-700">Topik Pembelajaran</td>
                <td className="p-2.5 font-bold text-slate-900" colSpan={3}>
                  {plan.title}
                </td>
              </tr>
              <tr className="divide-x divide-slate-300">
                <td className="bg-slate-50 p-2.5 font-bold text-slate-700">Guru Pengampu</td>
                <td className="p-2.5 font-semibold text-slate-900">{plan.teacher.user.name}</td>
                <td className="bg-slate-50 p-2.5 font-bold text-slate-700">Target Level Duta</td>
                <td className="p-2.5 font-bold text-slate-900">
                  {plan.targetLevel} (
                  {plan.targetLevel === "GOLD"
                    ? "70% English"
                    : plan.targetLevel === "SILVER"
                    ? "50% English"
                    : "30% English"}
                  )
                </td>
              </tr>
              <tr className="divide-x divide-slate-300">
                <td className="bg-slate-50 p-2.5 font-bold text-slate-700">Tanggal Pelaksanaan</td>
                <td className="p-2.5 font-semibold text-slate-900">{formatDate(plan.date)}</td>
                <td className="bg-slate-50 p-2.5 font-bold text-slate-700">Cambridge Skills</td>
                <td className="p-2.5 font-semibold text-slate-900">
                  {cambridgeSkills.length > 0 ? cambridgeSkills.join(", ") : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* I. TUJUAN PEMBELAJARAN */}
        <div className="mt-6">
          <h2 className="border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-sm font-black text-slate-900 uppercase">
            I. TUJUAN PEMBELAJARAN (LEARNING OBJECTIVES)
          </h2>
          <div className="mt-2 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
            {plan.objectives}
          </div>
        </div>

        {/* II. TARGET KALIMAT BAHASA INGGRIS DI KELAS */}
        <div className="mt-6">
          <h2 className="border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-sm font-black text-slate-900 uppercase">
            II. TARGET CLASSROOM ENGLISH SENTENCES (MINIMAL 3 KALIMAT WAJIB)
          </h2>
          <div className="mt-2 space-y-1.5">
            {sentenceList.map((sentence, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-xs font-semibold text-slate-800"
              >
                <span className="font-bold text-brand-700">#{idx + 1}</span>
                <span className="italic">&ldquo;{sentence}&rdquo;</span>
              </div>
            ))}
          </div>
        </div>

        {/* III. KOSAKATA KUNCI */}
        {plan.vocabulary && (
          <div className="mt-6">
            <h2 className="border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-sm font-black text-slate-900 uppercase">
              III. KOSAKATA KUNCI & ISTILAH (KEY VOCABULARY)
            </h2>
            <div className="mt-2 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 whitespace-pre-wrap">
              {plan.vocabulary}
            </div>
          </div>
        )}

        {/* IV. SKENARIO PEMBELAJARAN */}
        <div className="mt-6 space-y-4">
          <h2 className="border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-sm font-black text-slate-900 uppercase">
            IV. SKENARIO LANGKAH PEMBELAJARAN BILINGUAL
          </h2>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="font-bold text-xs uppercase text-slate-700">
                A. Kegiatan Pembuka (Opening) · ±10 Menit
              </p>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {plan.opening}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="font-bold text-xs uppercase text-slate-700">
                B. Kegiatan Inti (Main Activity) · ±60 Menit
              </p>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {plan.mainActivity}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="font-bold text-xs uppercase text-slate-700">
                C. Kegiatan Penutup (Closing) · ±10 Menit
              </p>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {plan.closing}
              </div>
            </div>
          </div>
        </div>

        {/* V. PENILAIAN PEMBELAJARAN */}
        {plan.assessmentPlan && (
          <div className="mt-6">
            <h2 className="border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-sm font-black text-slate-900 uppercase">
              V. PENILAIAN PEMBELAJARAN & CFU (ASSESSMENT & UNDERSTANDING CHECK)
            </h2>
            <div className="mt-2 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
              {plan.assessmentPlan}
            </div>
          </div>
        )}

        {/* Tanda Tangan Resmi */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Kepala Sekolah / Ketua EDT</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">Dr. H. Akhbar, M.Pd.</p>
            <p className="text-[11px] text-slate-500">NIP. 19780512 200501 1 004</p>
          </div>

          <div>
            <p className="text-slate-500">Parung Panjang, {formatDate(plan.date)}</p>
            <p className="font-bold text-slate-800">Guru Mata Pelajaran</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{plan.teacher.user.name}</p>
            <p className="text-[11px] text-slate-500">NIP. {plan.teacher.nip ?? "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
