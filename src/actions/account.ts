"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { failure, success, type ActionState } from "@/lib/action-state";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/avatar";

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

// ───────────── Foto profil ─────────────

/** Cek tanda tangan berkas (magic bytes) agar bukan sekadar label MIME dari browser. */
function sniffImage(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/** Mengganti foto profil sendiri. Gambar sudah dipotong & diperkecil di browser (persegi). */
export async function updateAvatar(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const file = fd.get("avatar");
  if (!(file instanceof File) || file.size === 0) return failure("Pilih foto terlebih dahulu.");
  if (file.size > AVATAR_MAX_BYTES) return failure("Ukuran foto maksimal 2 MB.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(bytes);
  if (!mime || !(AVATAR_TYPES as readonly string[]).includes(mime)) {
    return failure("Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }

  const previous = user.avatarFileId;
  const stored = await db.storedFile.create({
    data: { name: `avatar-${user.id}`, mimeType: mime, size: bytes.length, data: bytes, isPrivate: true },
    select: { id: true },
  });
  await db.user.update({ where: { id: user.id }, data: { avatarFileId: stored.id } });
  if (previous) await db.storedFile.deleteMany({ where: { id: previous } });

  await logAudit("account.avatar", { actorId: user.id, target: user.email, detail: `Ganti foto profil (${Math.round(bytes.length / 1024)} KB)` });
  revalidatePath("/", "layout");
  return success("Foto profil berhasil diperbarui.");
}

/** Menghapus foto profil sendiri (kembali ke inisial nama). */
export async function removeAvatar(): Promise<ActionState> {
  const user = await requireUser();
  if (!user.avatarFileId) return success("Foto profil sudah kosong.");
  await db.user.update({ where: { id: user.id }, data: { avatarFileId: null } });
  await db.storedFile.deleteMany({ where: { id: user.avatarFileId } });
  await logAudit("account.avatar", { actorId: user.id, target: user.email, detail: "Hapus foto profil" });
  revalidatePath("/", "layout");
  return success("Foto profil dihapus.");
}
