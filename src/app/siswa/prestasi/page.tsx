import type { Metadata } from "next";
import {
  Award,
  Calendar,
  Medal,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  Pill,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { COMPETITION_RESULTS } from "@/lib/program";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Prestasi & Lomba Saya" };

export default async function SiswaPrestasiPage() {
  const { student } = await requireStudent();

  const fullStudent = await db.student.findUnique({
    where: { id: student.id },
    include: {
      competitions: {
        include: { competition: true },
        orderBy: { competition: { date: "desc" } },
      },
    },
  });

  if (!fullStudent) return null;

  const totalPoints = fullStudent.competitions.reduce(
    (acc, e) => acc + e.points,
    0
  );
  const totalWinners = fullStudent.competitions.filter((e) =>
    e.result.includes("JUARA")
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Apresiasi & Rekam Jejak Prestasi"
        title="Prestasi & Portofolio Lomba Saya"
        description="Daftar keikutsertaan kompetisi bahasa Inggris tingkat kecamatan hingga nasional serta akumulasi poin penghargaan ekstrakurikuler."
      />

      {/* 4 Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kompetisi Diikuti"
          value={`${fullStudent.competitions.length} Event`}
          hint="Delegasi resmi sekolah"
          icon={Calendar}
          tone="brand"
        />
        <StatCard
          label="Gelar Juara Diraih"
          value={`${totalWinners} Kejuaraan`}
          hint="Juara 1, 2, 3 & Harapan"
          icon={Trophy}
          tone="gold"
        />
        <StatCard
          label="Total Poin Prestasi"
          value={`+${totalPoints} Poin`}
          hint="Poin ekstrakurikuler terakumulasi"
          icon={Sparkles}
          tone="mint"
        />
        <StatCard
          label="Student Ambassador"
          value={fullStudent.isStudentAmbassador ? "Aktif ★" : "Kandidat"}
          hint="Sertifikat Tutor Sebaya"
          icon={Star}
          tone="gold"
        />
      </div>

      {/* Tabel Prestasi Lomba Siswa */}
      <Card>
        <CardHeader
          icon={Trophy}
          title={`Rekam Jejak Delegasi & Prestasi (${fullStudent.competitions.length})`}
          description="Ajang kompetisi yang Anda ikuti mewakili nama baik SMP IT Al Madany."
        />
        <CardBody className="p-0">
          {fullStudent.competitions.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Belum Ada Catatan Lomba"
              description="Ketika Anda terpilih menjadi delegasi lomba bahasa Inggris sekolah, riwayat prestasi dan perolehan medali Anda akan dicatat di sini."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Tanggal</Th>
                    <Th>Nama Lomba</Th>
                    <Th>Cabang</Th>
                    <Th>Tingkat</Th>
                    <Th className="text-center">Hasil Kejuaraan</Th>
                    <Th className="text-center">Poin Penghargaan</Th>
                    <Th>Catatan Juri / Pembina</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fullStudent.competitions.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                      <Td className="whitespace-nowrap text-xs font-semibold text-slate-600">
                        {formatDate(entry.competition.date)}
                      </Td>
                      <Td className="font-bold text-ink">
                        {entry.competition.name}
                      </Td>
                      <Td className="text-xs text-slate-700 font-medium">
                        {entry.competition.category}
                      </Td>
                      <Td>
                        <Pill tone="info">Tingkat {entry.competition.level}</Pill>
                      </Td>
                      <Td className="text-center">
                        <Pill
                          tone={
                            entry.result.includes("JUARA")
                              ? "gold"
                              : entry.result === "FINALIS"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {COMPETITION_RESULTS[entry.result]?.label ?? entry.result}
                        </Pill>
                      </Td>
                      <Td className="text-center font-black text-emerald-600">
                        +{entry.points} Poin
                      </Td>
                      <Td className="text-xs text-slate-500 max-w-xs truncate">
                        {entry.notes ?? "-"}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Skema Poin Lomba Card */}
      <Card>
        <CardHeader
          icon={Medal}
          title="Skema Bobot Poin Kejuaraan Siswa"
          description="Poin ekstra dihitung otomatis berdasarkan capaian peringkat dan tingkat kompetisi."
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="font-bold text-slate-700">Tingkat Kecamatan (1×)</p>
              <p className="mt-1 text-slate-500">Juara 1: 40 pt · Juara 2: 30 pt · Juara 3: 20 pt · Peserta: 5 pt</p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5">
              <p className="font-bold text-brand-800">Tingkat Kabupaten (2×)</p>
              <p className="mt-1 text-slate-600">Juara 1: 80 pt · Juara 2: 60 pt · Juara 3: 40 pt · Peserta: 10 pt</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5">
              <p className="font-bold text-emerald-800">Tingkat Provinsi (3×)</p>
              <p className="mt-1 text-slate-600">Juara 1: 120 pt · Juara 2: 90 pt · Juara 3: 60 pt · Peserta: 15 pt</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5">
              <p className="font-bold text-amber-800">Tingkat Nasional (4×)</p>
              <p className="mt-1 text-slate-600">Juara 1: 160 pt · Juara 2: 120 pt · Juara 3: 80 pt · Peserta: 20 pt</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
