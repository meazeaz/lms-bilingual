import type { Metadata } from "next";
import { CalendarCheck, Clock, Sunrise } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader, Pill, StatusPill, Table, Td, Th } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { DAILY_SCHEDULE, ELITE_WEEK_THEMES } from "@/lib/program";
import { cn, dayKey, formatDate, formatLongDate, toInputDate } from "@/lib/utils";
import { getDailyPrompt } from "@/lib/elite-prompts-server";
import { DailyLogForm } from "./daily-form";

export const metadata: Metadata = { title: "ELITE Harian" };

export default async function DailyPage() {
  const { teacher } = await requireTeacher();
  const today = dayKey();
  const [todayLog, logs] = await Promise.all([
    db.dailyLog.findUnique({ where: { teacherId_date: { teacherId: teacher.id, date: today } } }),
    db.dailyLog.findMany({ where: { teacherId: teacher.id }, orderBy: { date: "desc" }, take: 40 }),
  ]);
  const weekOfMonth = Math.min(4, Math.ceil(new Date().getDate() / 7));
  const theme = ELITE_WEEK_THEMES[weekOfMonth - 1];

  // Heatmap 8 minggu
  const byDate = new Map(logs.map((l) => [l.date.getTime(), l]));
  const cells: { date: Date; level: number; status?: string }[] = [];
  const start = new Date(today); start.setUTCDate(start.getUTCDate() - 7 * 8 + 1);
  for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() % 6 === 0) continue;
    const l = byDate.get(d.getTime());
    cells.push({ date: new Date(d), level: l ? Number(l.mirrorMorning) + Number(l.dailyMission) + Number(l.englishZoneMinutes > 0) : 0, status: l?.status });
  }

  const activePrompt = getDailyPrompt(today);

  return (
    <>
      <PageHeader eyebrow="ELITE = English Language Immersion Through Everyday" title="Laporan ELITE harian" description={`${formatLongDate(today)} · Tema: ${activePrompt.theme}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader icon={Sunrise} title={todayLog ? "Perbarui laporan" : "Laporan hari ini"} description="Setelah dikirim, Tim EDT mencocokkan dengan grup WhatsApp ELITE." action={todayLog && <StatusPill status={todayLog.status} />} />
          <CardBody className="space-y-5">
            {/* Banner Tantangan Hari Ini dari Tim EDT */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-white text-xs font-black">
                    ⚡
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                    Instruksi ELITE Hari Ini: {activePrompt.theme}
                  </span>
                </div>
                <Pill tone="info">{activePrompt.targetCefr}</Pill>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="text-brand-600">🎙️ Naskah Mirror Morning:</span>
                </p>
                <p className="rounded-xl border border-white/80 bg-white/95 p-3 italic text-slate-700 leading-relaxed font-medium">
                  &ldquo;{activePrompt.mirrorPrompt}&rdquo;
                </p>
                {activePrompt.mirrorAudioTip && (
                  <p className="text-[11px] text-brand-700 font-medium pl-1">
                    💡 Tips: {activePrompt.mirrorAudioTip}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs space-y-1">
                <p className="font-bold text-amber-900">
                  🎯 Misi Harian di Sekolah (10.00 - 15.00 WIB):
                </p>
                <p className="text-amber-800 leading-relaxed">
                  {activePrompt.dailyMission}
                </p>
              </div>
            </div>

            <DailyLogForm
              today={toInputDate(today)}
              mission={activePrompt.dailyMission}
              initial={todayLog ? {
                mirrorMorning: todayLog.mirrorMorning, voiceNoteOnTime: todayLog.voiceNoteOnTime, dailyMission: todayLog.dailyMission, missionAnswer: todayLog.missionAnswer ?? "",
                englishZoneMinutes: todayLog.englishZoneMinutes, buddySession: todayLog.buddySession, buddyNote: todayLog.buddyNote ?? "", englishInClassPct: todayLog.englishInClassPct ?? 30,
              } : undefined}
            />
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader icon={Clock} title="Struktur harian" description="Senin–Jumat (Bab 3.1)" />
            <CardBody>
              <ol className="space-y-2">
                {DAILY_SCHEDULE.map((s) => (
                  <li key={s.time} className="flex gap-3 text-sm"><span className="w-24 shrink-0 font-black text-brand-600 tabular-nums">{s.time}</span><span className="text-slate-600">{s.activity}</span></li>
                ))}
              </ol>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Tema mingguan" />
            <CardBody className="space-y-2">
              {ELITE_WEEK_THEMES.map((w) => (
                <div key={w.week} className={cn("rounded-2xl p-3 text-sm", w.week === weekOfMonth ? "bg-coral-50 ring-1 ring-coral-200" : "bg-slate-50")}>
                  <p className="font-bold text-ink">Minggu {w.week}: {w.theme}</p>
                  <p className="text-xs text-slate-500">Mirror: {w.mirror} · Misi: {w.mission}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader icon={CalendarCheck} title="Kalender 8 minggu" description="Makin gelap, makin lengkap kegiatan hari itu (Mirror, Misi, English Zone)" />
        <CardBody>
          <div className="grid grid-flow-col grid-rows-5 gap-1.5 overflow-x-auto pb-1" style={{ gridAutoColumns: "minmax(22px, 1fr)" }}>
            {cells.map((c) => (
              <span key={c.date.getTime()} title={`${formatDate(c.date)} · ${c.level}/3 kegiatan${c.status === "PENDING" ? " (menunggu)" : ""}`}
                className={cn("aspect-square rounded-md", ["bg-slate-100", "bg-brand-200", "bg-brand-400", "bg-brand-600"][c.level], c.status === "PENDING" && "ring-2 ring-amber-300")} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Baris: Senin sampai Jumat. Bingkai kuning berarti menunggu verifikasi.</p>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Riwayat laporan" />
        <div className="mt-4">
          <Table>
            <thead><tr><Th>Tanggal</Th><Th>Mirror Morning</Th><Th>Misi Harian</Th><Th>English Zone</Th><Th>Buddy</Th><Th>% Inggris</Th><Th>Status</Th></tr></thead>
            <tbody>
              {logs.slice(0, 15).map((l) => (
                <tr key={l.id}>
                  <Td className="whitespace-nowrap font-semibold">{formatDate(l.date)}</Td>
                  <Td>{l.mirrorMorning ? <Pill tone={l.voiceNoteOnTime ? "success" : "warning"}>{l.voiceNoteOnTime ? "Tepat waktu" : "Terkirim"}</Pill> : "–"}</Td>
                  <Td>{l.dailyMission ? <Pill tone="success">Selesai</Pill> : "–"}</Td>
                  <Td className="tabular-nums">{l.englishZoneMinutes ? `${l.englishZoneMinutes} mnt` : "–"}</Td>
                  <Td>{l.buddySession ? "Ya" : "–"}</Td>
                  <Td className="tabular-nums">{l.englishInClassPct != null ? `${l.englishInClassPct}%` : "–"}</Td>
                  <Td><StatusPill status={l.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}
