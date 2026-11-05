"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { failure, success, type ActionState } from "@/lib/action-state";

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .max(72, "Password baru maksimal 72 karakter.")
      .regex(/[A-Za-z]/, "Password baru harus memuat huruf.")
      .regex(/[0-9]/, "Password baru harus memuat angka."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Password baru harus berbeda dari password saat ini.",
    path: ["newPassword"],
  });

/**
 * Pengguna (admin/guru/siswa) mengganti password-nya sendiri.
 * Semua sesi lain otomatis tidak berlaku; sesi di perangkat ini diperbarui.
 */
export async function changeOwnPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = PasswordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return failure(parsed.error.issues[0].message);

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return failure("Password saat ini salah.");

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10), passwordChangedAt: new Date() },
  });
  // Terbitkan sesi baru (iat ≥ passwordChangedAt − 1 detik) agar perangkat ini tetap masuk
  await createSession({ userId: user.id, role: user.role });
  await logAudit("auth.password_change", { actorId: user.id, target: user.email });

  revalidatePath("/", "layout");
  return success("Password berhasil diganti. Sesi di perangkat lain otomatis keluar.");
}
