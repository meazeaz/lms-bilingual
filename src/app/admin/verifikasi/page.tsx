import type { Metadata } from "next";
import {
  BadgeCheck,
  BookMarked,
  Check,
  CheckCheck,
  NotebookPen,
  Sunrise,
  Target,
  X,
} from "lucide-react";
import {
  approveAllChallenges,
  approveAllLogs,
  approveAllPhrases,
  approveAllReflections,
  reviewChallengeProgress,
  reviewLog,
  reviewPhraseMastery,
  reviewReflection,
} from "@/actions/lms";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  LevelBadge,
  LinkTabs,
  PageHeader,
  Pill,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Level } from "@/lib/program";

export const metadata: Metadata = { title: "Pusat Verifikasi Admin & EDT" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "harian";

  const [logs, phraseMasteries, challengeProgressList, reflections] = await Promise.all([
    db.dailyLog.findMany({
      where: { status: "PENDING" },
      include: { teacher: { include: { user: true } } },
      orderBy: [{ date: "desc" }],
    }),
    db.phraseMastery.findMany({
      where: { status: "PENDING" },
      include: {
        teacher: { include: { user: true } },
        phrase: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.challengeProgress.findMany({
      where: { status: "PENDING" },
      include: {
        teacher: { include: { user: true } },
        challenge: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.reflection.findMany({
      where: { status: "PENDING" },
      include: {
        teacher: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tabs = [
    { key: "harian", label: "ELITE Harian", href: "/admin/verifikasi?tab=harian", count: logs.length },
    { key: "pocket", label: "Pocket Book (50 Frasa)", href: "/admin/verifikasi?tab=pocket", count: phraseMasteries.length },
    { key: "challenge", label: "Weekly Challenge (12 Mgg)", href: "/admin/verifikasi?tab=challenge", count: challengeProgressList.length },
    { key: "refleksi", label: "Refleksi Guru (Lampiran 4B)", href: "/admin/verifikasi?tab=refleksi", count: reflections.length },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Alur: Guru Isi, Admin Verifikasi"
        title="Pusat Verifikasi Laporan & Supervisi"
        description="Verifikasi laporan harian ELITE, hafalan 50 Frasa Saku, bukti Weekly Challenge, jurnal refleksi mengajar, dan jurnal refleksi. RPP kini disusun Tim EDT di menu Modul Ajar (RPP). Hanya data terverifikasi yang memicu kenaikan level & lencana digital."
      />

      <LinkTabs tabs={tabs} active={activeTab} />

      {/* ───────────── TAB 1: ELITE HARIAN ───────────── */}
      {activeTab === "harian" && (
        <Card>
          <CardHeader
            icon={Sunrise}
            title={`${logs.length} Laporan ELITE Harian Menunggu`}
            description="Cocokkan dengan grup WhatsApp ELITE: Mirror Morning (06.15), Misi Harian (20.00), dan English Zone."
            action={
              logs.length > 0 && (
                <form action={approveAllLogs}>
                  <Button variant="mint" size="sm">
                    <CheckCheck className="size-4" /> Setujui Semua Laporan ({logs.length})
                  </Button>
                </form>
              )
            }
          />
          {logs.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="Semua Laporan Harian Sudah Terverifikasi"
              description="Tidak ada laporan yang menunggu saat ini. Guru akan mengirim laporan baru setiap hari kerja."
            />
          ) : (
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Guru</Th>
                    <Th>Tanggal</Th>
                    <Th>Mirror Morning</Th>
                    <Th>Misi Harian</Th>
                    <Th>English Zone</Th>
                    <Th>Buddy Session</Th>
                    <Th className="text-right">Keputusan</Th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={log.teacher.user.name} size="sm" />
                          <div>
                            <span className="font-bold whitespace-nowrap text-ink block">
                              {log.teacher.user.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Mapel: {log.teacher.subject}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td className="whitespace-nowrap font-medium text-slate-600">
                        {formatDate(log.date)}
                      </Td>
                      <Td>
                        {log.mirrorMorning ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Check className="size-3.5" /> Ya
                            </span>
                            {log.voiceNoteOnTime && (
                              <Pill tone="success">
                                Tepat Waktu
                              </Pill>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </Td>
                      <Td>
                        {log.dailyMission ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Check className="size-3.5" /> Ya
                            </span>
                            {log.missionAnswer && (
                              <p className="mt-1 text-xs text-slate-600 italic max-w-xs truncate" title={log.missionAnswer}>
                                &ldquo;{log.missionAnswer}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </Td>
                      <Td>
                        {log.englishZoneMinutes > 0 ? (
                          <Pill tone="info">
                            {log.englishZoneMinutes} mnt
                          </Pill>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </Td>
                      <Td>
                        {log.buddySession ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Check className="size-3.5" /> Ya
                            </span>
                            {log.buddyNote && (
                              <p className="mt-0.5 text-xs text-slate-500 max-w-xs truncate" title={log.buddyNote}>
                                {log.buddyNote}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <form action={reviewLog}>
                            <input type="hidden" name="id" value={log.id} />
                            <input type="hidden" name="decision" value="approve" />
                            <Button size="sm" variant="mint" aria-label="Setujui">
                              <Check className="size-3.5" />
                            </Button>
                          </form>
                          <form action={reviewLog}>
                            <input type="hidden" name="id" value={log.id} />
                            <input type="hidden" name="decision" value="reject" />
                            <Button size="sm" variant="secondary" aria-label="Tolak">
                              <X className="size-3.5" />
                            </Button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* ───────────── TAB 2: POCKET BOOK (50 FRASA) ───────────── */}
      {activeTab === "pocket" && (
        <Card>
          <CardHeader
            icon={BookMarked}
            title={`${phraseMasteries.length} Klaim Hafalan Frasa Saku Menunggu`}
            description="Verifikasi setoran lisan guru: pastikan pengucapan dan makna frasa telah dikuasai dengan lancar."
            action={
              phraseMasteries.length > 0 && (
                <form action={approveAllPhrases}>
                  <Button variant="mint" size="sm">
                    <CheckCheck className="size-4" /> Setujui Semua Klaim ({phraseMasteries.length})
                  </Button>
                </form>
              )
            }
          />
          {phraseMasteries.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="Tidak Ada Klaim Hafalan yang Menunggu"
              description="Ketika guru menekan 'Ajukan Hafal' di Pocket Book, daftar permohonan akan tampil di sini."
            />
          ) : (
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Guru</Th>
                    <Th>Nomor & Kategori</Th>
                    <Th>Frasa Bahasa Inggris</Th>
                    <Th>Arti Bahasa Indonesia</Th>
                    <Th>Diajukan</Th>
                    <Th className="text-right">Keputusan</Th>
                  </tr>
                </thead>
                <tbody>
                  {phraseMasteries.map((pm) => (
                    <tr key={pm.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={pm.teacher.user.name} size="sm" />
                          <div>
                            <span className="font-bold whitespace-nowrap text-ink block">
                              {pm.teacher.user.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Mapel: {pm.teacher.subject}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">
                          #{pm.phrase.number}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {pm.phrase.category}
                        </span>
                      </Td>
                      <Td className="font-bold text-ink text-sm">
                        &ldquo;{pm.phrase.english}&rdquo;
                      </Td>
                      <Td className="text-xs text-slate-600">
                        {pm.phrase.indonesian}
                      </Td>
                      <Td className="whitespace-nowrap text-xs text-slate-500">
                        {formatDate(pm.createdAt)}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <form action={reviewPhraseMastery}>
                            <input type="hidden" name="id" value={pm.id} />
                            <input type="hidden" name="decision" value="approve" />
                            <Button size="sm" variant="mint" aria-label="Setujui">
                              <Check className="size-3.5" /> Setujui
                            </Button>
                          </form>
                          <form action={reviewPhraseMastery}>
                            <input type="hidden" name="id" value={pm.id} />
                            <input type="hidden" name="decision" value="reject" />
                            <Button size="sm" variant="secondary" aria-label="Tolak">
                              <X className="size-3.5" />
                            </Button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* ───────────── TAB 3: WEEKLY CHALLENGE ───────────── */}
      {activeTab === "challenge" && (
        <Card>
          <CardHeader
            icon={Target}
            title={`${challengeProgressList.length} Bukti Tantangan Mingguan Menunggu`}
            description="Verifikasi bukti nyata penerapan tantangan mingguan di kelas atau lingkungan sekolah sebelum poin diberikan."
            action={
              challengeProgressList.length > 0 && (
                <form action={approveAllChallenges}>
                  <Button variant="mint" size="sm">
                    <CheckCheck className="size-4" /> Setujui Semua Tantangan ({challengeProgressList.length})
                  </Button>
                </form>
              )
            }
          />
          {challengeProgressList.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="Tidak Ada Laporan Tantangan yang Menunggu"
              description="Ketika guru menyelesaikan kartu tantangan mingguan, laporan akan tampil di sini."
            />
          ) : (
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Guru</Th>
                    <Th>Minggu & Tantangan</Th>
                    <Th>Target Aksi</Th>
                    <Th>Bukti Penerapan Guru</Th>
                    <Th>Diajukan</Th>
                    <Th className="text-right">Keputusan</Th>
                  </tr>
                </thead>
                <tbody>
                  {challengeProgressList.map((cp) => (
                    <tr key={cp.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={cp.teacher.user.name} size="sm" />
                          <div>
                            <span className="font-bold whitespace-nowrap text-ink block">
                              {cp.teacher.user.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Mapel: {cp.teacher.subject}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-block rounded-lg bg-brand-100 px-2 py-0.5 text-xs font-black text-brand-700">
                          Minggu {cp.challenge.week}
                        </span>
                        <span className="block font-bold text-ink text-xs mt-1">
                          {cp.challenge.title}
                        </span>
                      </Td>
                      <Td className="text-xs text-slate-600 max-w-xs">
                        {cp.challenge.target}
                      </Td>
                      <Td className="text-xs max-w-sm">
                        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 italic text-slate-800">
                          &ldquo;{cp.evidence}&rdquo;
                        </div>
                      </Td>
                      <Td className="whitespace-nowrap text-xs text-slate-500">
                        {formatDate(cp.createdAt)}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <form action={reviewChallengeProgress}>
                            <input type="hidden" name="id" value={cp.id} />
                            <input type="hidden" name="decision" value="approve" />
                            <Button size="sm" variant="mint" aria-label="Setujui">
                              <Check className="size-3.5" /> Setujui
                            </Button>
                          </form>
                          <form action={reviewChallengeProgress}>
                            <input type="hidden" name="id" value={cp.id} />
                            <input type="hidden" name="decision" value="reject" />
                            <Button size="sm" variant="secondary" aria-label="Tolak">
                              <X className="size-3.5" />
                            </Button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* ───────────── TAB 4: REFLEKSI MENGAJAR GURU ───────────── */}
      {activeTab === "refleksi" && (
        <Card>
          <CardHeader
            icon={NotebookPen}
            title={`${reflections.length} Refleksi Mengajar Menunggu Verifikasi`}
            description="Periksa jurnal evaluasi diri guru (Lampiran 4B) untuk memastikan proses reflektif dan pemantauan kendala kelas."
            action={
              reflections.length > 0 && (
                <form action={approveAllReflections}>
                  <Button variant="mint" size="sm">
                    <CheckCheck className="size-4" /> Setujui Semua Refleksi ({reflections.length})
                  </Button>
                </form>
              )
            }
          />
          {reflections.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="Semua Refleksi Mengajar Telah Diverifikasi"
              description="Ketika guru mengirimkan lembar refleksi mengajar, data akan tampil di sini untuk dievaluasi."
            />
          ) : (
            <div className="mt-4 space-y-4">
              {reflections.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-brand-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.teacher.user.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{r.teacher.user.name}</span>
                          <span className="text-xs text-slate-400">· {r.subject} (Kelas {r.className})</span>
                          <LevelBadge level={r.targetLevel as Level} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tanggal Mengajar: {formatDate(r.date)} · Dikirim: {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Pill
                        tone={r.achieved === "YA" ? "success" : r.achieved === "SEBAGIAN" ? "warning" : "danger"}
                      >
                        Target: {r.achieved === "YA" ? "Tercapai" : r.achieved === "SEBAGIAN" ? "Sebagian" : "Belum"}
                      </Pill>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold uppercase text-slate-500">Kalimat Lancar</p>
                      <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.fluentSentences}</p>
                    </div>

                    {r.difficultSentences && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="font-bold uppercase text-slate-500">Kalimat Dirasa Sulit</p>
                        <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.difficultSentences}</p>
                      </div>
                    )}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold uppercase text-slate-500">Hal Membanggakan</p>
                      <p className="mt-1 font-semibold text-slate-700 whitespace-pre-wrap">{r.proudOf}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2 lg:col-span-3">
                      <p className="font-bold uppercase text-slate-500">Tantangan & Rencana Perubahan</p>
                      <p className="mt-1 text-slate-700">
                        <span className="font-bold">Tantangan: </span>{r.challenge}
                      </p>
                      <p className="mt-1 text-slate-700">
                        <span className="font-bold">Perubahan: </span>{r.nextChange}
                      </p>
                    </div>
                  </div>

                  {/* Form Keputusan Admin */}
                  <form action={reviewReflection} className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      type="text"
                      name="reviewNote"
                      placeholder="Catatan apresiasi / saran pengawas (opsional)..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-brand-500"
                    />
                    <Button type="submit" name="decision" value="approve" variant="mint" size="sm">
                      <Check className="size-3.5" /> Setujui Refleksi
                    </Button>
                    <Button type="submit" name="decision" value="reject" variant="secondary" size="sm">
                      <X className="size-3.5" /> Tolak
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
}
