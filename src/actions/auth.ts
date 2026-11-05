"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { failure, type ActionState } from "@/lib/action-state";
import { getClientIp, logAudit } from "@/lib/audit";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const HOME = { ADMIN: "/admin", TEACHER: "/guru", STUDENT: "/siswa" } as const;

/** Batas percobaan login gagal dalam jendela waktu tertentu. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
const ATTEMPT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Hash tiruan agar waktu respons sama saat email tidak terdaftar (mencegah enumerasi akun). */
const DUMMY_HASH = "$2b$10$Tt9cW.6C8pQrwl9.JENGWu1sOvOJ5gcKmNaUyNp2TOSxeFYYnHo/q";

async function lockoutMinutesLeft(email: string, ip: string | null): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS);

  // Gagal login per email dihitung sejak login sukses terakhir (bila ada di dalam jendela)
  const lastSuccess = await db.loginAttempt.findFirst({
    where: { email, success: true, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const emailFails = await db.loginAttempt.findMany({
    where: { email, success: false, createdAt: { gte: lastSuccess?.createdAt ?? since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const ipFails = ip
    ? await db.loginAttempt.findMany({
        where: { ip, success: false, createdAt: { gte: since } },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      })
    : [];

  const blockedUntil = (fails: { createdAt: Date }[], max: number) =>
    fails.length >= max ? fails[fails.length - max].createdAt.getTime() + WINDOW_MS : 0;
  const until = Math.max(blockedUntil(emailFails, MAX_FAILS_PER_EMAIL), blockedUntil(ipFails, MAX_FAILS_PER_IP));
  return until > Date.now() ? Math.ceil((until - Date.now()) / 60000) : 0;
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const { email, password } = parsed.data;
  const ip = await getClientIp();

  const minutes = await lockoutMinutesLeft(email, ip);
  if (minutes > 0) {
    await logAudit("auth.login_locked", { actorId: null, target: email });
    return failure(`Terlalu banyak percobaan login gagal. Coba lagi dalam ${minutes} menit.`);
  }

  const user = await db.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  const valid = Boolean(user && user.active && passwordOk);

  await db.loginAttempt.create({ data: { email, ip, success: valid } });
  // Bersihkan catatan percobaan lama agar tabel tetap ramping
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - ATTEMPT_RETENTION_MS) } } });

  if (!user || !valid) {
    await logAudit("auth.login_failed", {
      actorId: user?.id ?? null,
      target: email,
      detail: user && !user.active && passwordOk ? "Akun nonaktif" : "Email atau password salah",
    });
    if (user && !user.active && passwordOk) return failure("Akun Anda sedang dinonaktifkan. Hubungi Tim EDT.");
    return failure("Email atau password salah.");
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ userId: user.id, role: user.role });
  await logAudit("auth.login", { actorId: user.id, target: email });
  redirect(HOME[user.role]);
}

export async function logout() {
  await logAudit("auth.logout");
  await deleteSession();
  redirect("/login");
}
