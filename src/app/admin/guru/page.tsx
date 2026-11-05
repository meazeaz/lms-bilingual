import type { Metadata } from "next";
import Link from "next/link";
import { Award, ChevronRight, Filter, GraduationCap, Search, ShieldCheck, Users } from "lucide-react";
import { Avatar, Button, Card, CardBody, CardHeader, Field, Input, LevelBadge, PageHeader, Pill, Select, StatCard, Table, Td, Th } from "@/components/ui";
import { db } from "@/lib/db";
import { LEVEL_LABEL, LEVEL_RULES, type Level } from "@/lib/program";
import { formatDate } from "@/lib/utils";
import { ExportTeachersButton } from "./guru-client";

export const metadata: Metadata = { title: "Manajemen Guru & Duta" };

export default async function AdminGuruPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; pilot?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const levelFilter = sp.level || "ALL";
  const pilotFilter = sp.pilot || "ALL";

  const allTeachers = await db.teacher.findMany({
    include: {
      user: true,
      buddy: { include: { user: true } },
      assessments: { orderBy: { date: "desc" }, take: 1 },
      registrations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { user: { name: "asc" } },
  });

  const filteredTeachers = allTeachers.filter((t) => {
    if (q) {
      const matchName = t.user.name.toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchNip = t.nip ? t.nip.toLowerCase().includes(q) : false;
      if (!matchName && !matchSubject && !matchNip) return false;
    }
    if (levelFilter !== "ALL" && t.ambassadorLevel !== levelFilter) return false;
    if (pilotFilter === "PILOT" && !t.isPilot) return false;
    if (pilotFilter === "REGULER" && t.isPilot) return false;
    return true;
  });

  // Statistik Ringkas
  const totalGuru = allTeachers.length;
  const dutaAktif = allTeachers.filter((t) => t.ambassadorLevel !== "NONE").length;
  const pilotCount = allTeachers.filter((t) => t.isPilot).length;
  const toeflTeachers = allTeachers.filter((t) => t.toeflScore != null);
  const avgToefl = toeflTeachers.length > 0
    ? Math.round(toeflTeachers.reduce((acc, cur) => acc + (cur.toeflScore ?? 0), 0) / toeflTeachers.length)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Bab 3 & Lampiran 5 · Master 2028"
        title="Daftar Guru & Status Duta Inggris"
        description="Pantau status 18 guru SMP IT Al Madany, penugasan English Buddy, masa berlaku sertifikasi Duta, skor CEFR/TOEFL, dan kesiapan naik level."
      />

      {/* Ringkasan Metrik Program */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Guru"
          value={totalGuru}
          hint="18 Guru Mata Pelajaran"
          tone="brand"
        />
        <StatCard
          icon={Award}
          label="Duta Inggris Resmi"
          value={`${dutaAktif} / ${totalGuru}`}
          hint={`${Math.round((dutaAktif / (totalGuru || 1)) * 100)}% tersertifikasi`}
          tone="gold"
        />
        <StatCard
          icon={ShieldCheck}
          label="Guru Pilot Project"
          value={pilotCount}
          hint="Fokus akselerasi awal"
          tone="coral"
        />
        <StatCard
          icon={GraduationCap}
          label="Rata-rata TOEFL"
          value={avgToefl > 0 ? avgToefl : "–"}
          hint={`${toeflTeachers.length} guru telah tes`}
          tone="mint"
        />
      </div>

      {/* Filter dan Pencarian */}
      <Card className="mt-6">
        <CardBody className="p-4">
          <form method="GET" className="grid gap-3 sm:grid-cols-4 items-end">
            <div className="sm:col-span-2">
              <label htmlFor="q" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Pencarian Guru
              </label>
              <div className="relative">
                <Input
                  id="q"
                  name="q"
                  defaultValue={sp.q || ""}
                  placeholder="Cari berdasarkan nama guru, mapel, atau NIP..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="level" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Level Duta
              </label>
              <Select id="level" name="level" defaultValue={levelFilter}>
                <option value="ALL">Semua Level</option>
                <option value="NONE">Belum Tersertifikasi (None)</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
              </Select>
            </div>

            <div>
              <label htmlFor="pilot" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Kelompok
              </label>
              <Select id="pilot" name="pilot" defaultValue={pilotFilter}>
                <option value="ALL">Semua Kelompok</option>
                <option value="PILOT">Hanya Pilot Project</option>
                <option value="REGULER">Reguler</option>
              </Select>
            </div>

            <div className="sm:col-span-4 flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm">
                  <Filter className="size-3.5" /> Terapkan Filter
                </Button>
                {(sp.q || sp.level || sp.pilot) && (
                  <Link href="/admin/guru" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5">
                    Reset Filter
                  </Link>
                )}
              </div>

              <ExportTeachersButton
                teachers={filteredTeachers.map((t) => ({
                  name: t.user.name,
                  nip: t.nip,
                  email: t.user.email,
                  subject: t.subject,
                  level: t.ambassadorLevel,
                  isPilot: t.isPilot,
                  cefr: t.cefrLevel,
                  toefl: t.toeflScore,
                }))}
              />
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Tabel Data Guru */}
      <Card className="mt-6">
        <CardHeader
          title="Daftar Tenaga Pendidik"
          description={`Menampilkan ${filteredTeachers.length} dari ${totalGuru} guru`}
        />
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Guru</Th>
                <Th>Mata Pelajaran</Th>
                <Th>Level Duta</Th>
                <Th>Masa Berlaku Level</Th>
                <Th>CEFR / TOEFL</Th>
                <Th>Status Pilot</Th>
                <Th>English Buddy</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <Td colSpan={8} className="text-center text-slate-400 py-8">
                    Tidak ditemukan guru dengan kriteria pencarian tersebut.
                  </Td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  let expiryLabel = "–";
                  let isExpired = false;

                  if (t.ambassadorLevel !== "NONE" && t.levelSince) {
                    const rule = LEVEL_RULES[t.ambassadorLevel as Exclude<Level, "NONE">];
                    const exp = new Date(t.levelSince);
                    exp.setMonth(exp.getMonth() + rule.validityMonths);
                    isExpired = exp.getTime() < Date.now();
                    expiryLabel = formatDate(exp);
                  }

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={t.user.name} size="sm" />
                          <div>
                            <span className="font-bold text-ink block whitespace-nowrap">
                              {t.user.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {t.nip ? `NIP: ${t.nip}` : t.user.email}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td className="whitespace-nowrap font-medium text-slate-700">
                        {t.subject}
                      </Td>
                      <Td>
                        <LevelBadge level={t.ambassadorLevel} />
                      </Td>
                      <Td className="text-xs">
                        {t.ambassadorLevel === "NONE" ? (
                          <span className="text-slate-400">Belum ada</span>
                        ) : isExpired ? (
                          <Pill tone="danger">Kedaluwarsa ({expiryLabel})</Pill>
                        ) : (
                          <span className="text-slate-600 font-medium">s.d. {expiryLabel}</span>
                        )}
                      </Td>
                      <Td className="text-xs whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{t.cefrLevel}</span>
                        {t.toeflScore && (
                          <span className="ml-1 text-slate-500 font-normal">
                            (TOEFL: <b>{t.toeflScore}</b>)
                          </span>
                        )}
                      </Td>
                      <Td>
                        {t.isPilot ? (
                          <Pill tone="info">Pilot Project</Pill>
                        ) : (
                          <span className="text-xs text-slate-400">Reguler</span>
                        )}
                      </Td>
                      <Td className="text-xs">
                        {t.buddy ? (
                          <span className="text-brand-700 font-semibold">{t.buddy.user.name}</span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/guru/${t.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
                        >
                          Detail <ChevronRight className="size-3.5" />
                        </Link>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}
