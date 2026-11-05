import type { Metadata } from "next";
import { Download, FileSpreadsheet, GraduationCap, ShieldCheck, Sunrise, Upload, Users, ClipboardCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/settings-server";
import { Card, CardBody, CardHeader, PageHeader, buttonClass } from "@/components/ui";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Impor & Ekspor Data" };

function ExportRow({ icon: Icon, title, desc, children }: { icon: typeof Users; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-center">
      <span className="clay-soft grid size-10 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-600">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export default async function DataPage() {
  await requireAdmin();
  const [profile, teacherCount, studentCount, assessmentCount, months] = await Promise.all([
    getSchoolProfile(),
    db.teacher.count(),
    db.student.count(),
    db.studentAssessment.count(),
    db.dailyLog.findMany({ select: { date: true }, orderBy: { date: "desc" } }),
  ]);
  const eliteMonths = [...new Set(months.map((m) => m.date.toISOString().slice(0, 7)))].slice(0, 12);
  const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <>
      <PageHeader
        eyebrow="Laporan & Administrasi"
        title="Impor & ekspor data"
        description="Masukkan data guru dan siswa asli sekolah dari Excel, dan unduh rekap data untuk laporan atau arsip."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={Upload} title="Impor guru" description="Buat banyak akun guru sekaligus dari templat Excel." />
          <CardBody>
            <ImportForm kind="TEACHER" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={Upload} title="Impor siswa" description="Buat banyak akun siswa sekaligus, lengkap dengan kelasnya." />
          <CardBody>
            <ImportForm kind="STUDENT" />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader icon={Download} title="Ekspor ke Excel" description="Setiap unduhan tercatat di Log Aktivitas." />
        <CardBody className="pt-2">
          <ExportRow icon={Users} title="Direktori guru" desc={`${teacherCount} guru · level Duta, CEFR, partisipasi ELITE, Pocket Book, poin, status`}>
            <a href="/api/excel/guru" download className={buttonClass("secondary", "sm")}><FileSpreadsheet className="size-4" /> Unduh .xlsx</a>
          </ExportRow>
          <ExportRow icon={GraduationCap} title="Direktori siswa" desc={`${studentCount} siswa · kelas, CEFR, target akhir tahun, status capaian`}>
            <a href="/api/excel/siswa" download className={buttonClass("secondary", "sm")}><FileSpreadsheet className="size-4" /> Unduh .xlsx</a>
          </ExportRow>
          <ExportRow icon={ClipboardCheck} title="Nilai siswa" desc={`${assessmentCount} catatan asesmen · skor, CEFR, 5 komponen Cambridge`}>
            <form action="/api/excel/nilai" className="flex flex-wrap items-center gap-2">
              <select name="semester" defaultValue="" className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
                <option value="">Semua semester</option>
                {profile.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className={buttonClass("secondary", "sm")}><FileSpreadsheet className="size-4" /> Unduh .xlsx</button>
            </form>
          </ExportRow>
          <ExportRow icon={Sunrise} title="Laporan ELITE harian" desc="Rekap setoran Mirror Morning, Misi Harian, dan English Zone per bulan">
            <form action="/api/excel/elite" className="flex flex-wrap items-center gap-2">
              <select name="month" defaultValue={eliteMonths[0]} className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
                {eliteMonths.length === 0 && <option value="">Bulan ini</option>}
                {eliteMonths.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
              <button type="submit" className={buttonClass("secondary", "sm")}><FileSpreadsheet className="size-4" /> Unduh .xlsx</button>
            </form>
          </ExportRow>
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 ring-1 ring-slate-100">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />
            Berkas ekspor berisi data pribadi guru dan siswa. Simpan di tempat aman dan jangan dibagikan ke grup publik.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
