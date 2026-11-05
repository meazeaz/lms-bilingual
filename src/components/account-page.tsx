import { CheckCircle2, History, KeyRound, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar, Card, CardBody, CardHeader, EmptyState, PageHeader, Pill } from "@/components/ui";
import { ChangePasswordForm } from "@/components/change-password-form";
import { formatDateTime } from "@/lib/utils";

const ROLE_LABEL = { ADMIN: "Admin · Tim EDT", TEACHER: "Guru", STUDENT: "Siswa" } as const;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-bold text-ink">{value}</dd>
    </div>
  );
}

/** Halaman "Akun Saya" bersama untuk admin, guru, dan siswa. */
export async function AccountPage() {
  const user = await requireUser();
  const attempts = await db.loginAttempt.findMany({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <>
      <PageHeader eyebrow="Akun Saya" title="Profil & keamanan akun" description="Kelola password dan pantau aktivitas login akun Anda." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <Avatar name={user.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-display)] text-xl font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                  <Pill tone="info" className="mt-1.5">{ROLE_LABEL[user.role]}</Pill>
                </div>
              </div>
              <dl className="mt-5">
                {user.title && <InfoRow label="Jabatan" value={user.title} />}
                {user.teacher && <InfoRow label="Mata pelajaran" value={user.teacher.subject} />}
                {user.teacher?.nip && <InfoRow label="NIP" value={user.teacher.nip} />}
                {user.student && <InfoRow label="Kelas" value={user.student.classRoom.name} />}
                {user.student?.nis && <InfoRow label="NIS" value={user.student.nis} />}
                <InfoRow label="Akun dibuat" value={formatDateTime(user.createdAt)} />
                <InfoRow label="Login terakhir" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"} />
                <InfoRow label="Password diganti" value={user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : "Belum pernah"} />
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 ring-1 ring-slate-100">
                <UserRound className="mt-0.5 size-4 shrink-0 text-slate-400" />
                Perubahan nama, email, atau kelas dilakukan oleh Tim EDT melalui Manajemen Pengguna.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader icon={KeyRound} title="Ganti password" description="Setelah diganti, semua perangkat lain yang sedang login otomatis keluar." />
            <CardBody>
              <ChangePasswordForm />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={History} title="Riwayat login terakhir" description="Periksa bila ada percobaan masuk yang tidak Anda kenali." />
            <CardBody className="pt-3">
              {attempts.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="Belum ada riwayat" description="Riwayat login tercatat mulai sekarang." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {attempts.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      {a.success ? (
                        <CheckCircle2 className="size-5 shrink-0 text-mint-500" />
                      ) : (
                        <XCircle className="size-5 shrink-0 text-rose-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink">{a.success ? "Login berhasil" : "Login gagal"}</p>
                        <p className="text-xs text-slate-500">IP {a.ip ?? "tidak diketahui"}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">{formatDateTime(a.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
