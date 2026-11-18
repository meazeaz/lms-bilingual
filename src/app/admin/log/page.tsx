import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, History, LogIn, Search, ShieldAlert, UserCog } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AUDIT_LABELS } from "@/lib/audit";
import { Card, EmptyState, Input, LinkTabs, PageHeader, Pill, StatCard, Table, Td, Th, buttonClass, type Tone } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Log Aktivitas" };

const PAGE_SIZE = 40;

const CATEGORIES = [
  { key: "all", label: "Semua", prefix: null },
  { key: "auth", label: "Login & Keamanan", prefix: "auth." },
  { key: "user", label: "Pengguna & Impor", prefix: "user." },
  { key: "settings", label: "Pengaturan", prefix: "settings." },
  { key: "content", label: "Konten & ELITE", prefix: null },
  { key: "export", label: "Ekspor", prefix: "export." },
] as const;

function toneFor(action: string): Tone {
  if (action === "auth.login_failed" || action === "auth.login_locked" || action === "user.delete") return "danger";
  if (action.startsWith("auth.")) return "neutral";
  if (action.startsWith("user.")) return "info";
  if (action.startsWith("settings.")) return "warning";
  return "success";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const cat = CATEGORIES.find((c) => c.key === sp.cat) ?? CATEGORIES[0];
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.AuditLogWhereInput = {};
  if (cat.key === "content") {
    where.OR = [{ action: { startsWith: "elite." } }, { action: { startsWith: "announcement." } }, { action: { startsWith: "class." } }, { action: { startsWith: "rpp." } }];
  } else if (cat.prefix) {
    where.action = { startsWith: cat.prefix };
  }
  if (q) {
    where.AND = [
      {
        OR: [
          { target: { contains: q } },
          { detail: { contains: q } },
          { ip: { contains: q } },
          { actor: { is: { name: { contains: q } } } },
          { actor: { is: { email: { contains: q } } } },
        ],
      },
    ];
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [rows, total, logins24h, failed24h, adminChanges24h] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { actor: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
    db.loginAttempt.count({ where: { success: true, createdAt: { gte: since24h } } }),
    db.loginAttempt.count({ where: { success: false, createdAt: { gte: since24h } } }),
    db.auditLog.count({ where: { createdAt: { gte: since24h }, NOT: { action: { startsWith: "auth." } } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (p: Partial<{ cat: string; q: string; page: number }>) => {
    const params = new URLSearchParams();
    const c = p.cat ?? cat.key;
    const query = p.q ?? q;
    if (c !== "all") params.set("cat", c);
    if (query) params.set("q", query);
    if (p.page && p.page > 1) params.set("page", String(p.page));
    const s = params.toString();
    return `/admin/log${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Laporan & Administrasi"
        title="Log aktivitas"
        description="Jejak login, perubahan data penting, impor, dan ekspor. Berguna untuk audit dan menelusuri masalah."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Login berhasil · 24 jam" value={logins24h} icon={LogIn} tone="mint" />
        <StatCard label="Login gagal · 24 jam" value={failed24h} icon={ShieldAlert} tone="coral" hint={failed24h >= 10 ? "Cukup tinggi, periksa IP yang mencurigakan." : undefined} />
        <StatCard label="Perubahan data · 24 jam" value={adminChanges24h} icon={UserCog} tone="brand" />
      </div>

      <LinkTabs tabs={CATEGORIES.map((c) => ({ key: c.key, label: c.label, href: href({ cat: c.key, page: 1 }) }))} active={cat.key} />

      <Card>
        <form className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-6" action="/admin/log">
          {cat.key !== "all" && <input type="hidden" name="cat" value={cat.key} />}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input name="q" defaultValue={q} placeholder="Cari nama, email, target, detail, atau IP…" className="pl-10" />
          </div>
          <button type="submit" className={buttonClass("secondary")}>Cari</button>
        </form>

        {rows.length === 0 ? (
          <EmptyState icon={History} title="Belum ada aktivitas" description={q ? "Tidak ada log yang cocok dengan pencarian." : "Aktivitas akan tercatat otomatis mulai sekarang."} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Waktu</Th>
                <Th>Pelaku</Th>
                <Th>Aktivitas</Th>
                <Th>Target / detail</Th>
                <Th>IP</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <Td className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-500">{formatDateTime(r.createdAt)}</Td>
                  <Td>
                    {r.actor ? (
                      <>
                        <p className="font-bold text-ink">{r.actor.name}</p>
                        <p className="text-xs text-slate-500">{r.actor.email}</p>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Tidak dikenal</span>
                    )}
                  </Td>
                  <Td>
                    <Pill tone={toneFor(r.action)}>{AUDIT_LABELS[r.action] ?? r.action}</Pill>
                  </Td>
                  <Td className="max-w-md">
                    {r.target && <p className="truncate font-semibold text-ink">{r.target}</p>}
                    {r.detail && <p className="line-clamp-2 text-xs text-slate-500">{r.detail}</p>}
                    {!r.target && !r.detail && <span className="text-slate-300">—</span>}
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-500">{r.ip ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <div className="flex items-center justify-between gap-3 px-5 py-4 text-sm sm:px-6">
          <p className="text-slate-500">
            {total === 0 ? "0 catatan" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} dari ${total} catatan`}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={href({ page: page - 1 })} className={buttonClass("secondary", "sm")}><ChevronLeft className="size-4" /> Sebelumnya</Link>
            ) : null}
            {page < pages ? (
              <Link href={href({ page: page + 1 })} className={buttonClass("secondary", "sm")}>Berikutnya <ChevronRight className="size-4" /></Link>
            ) : null}
          </div>
        </div>
      </Card>
    </>
  );
}
