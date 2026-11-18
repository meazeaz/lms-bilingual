import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Alamat IP klien (memperhitungkan reverse proxy / load balancer). */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

/** Label manusiawi untuk kode aksi audit (ditampilkan di /admin/log). */
export const AUDIT_LABELS: Record<string, string> = {
  "auth.login": "Login berhasil",
  "auth.login_failed": "Login gagal",
  "auth.login_locked": "Login diblokir sementara",
  "auth.logout": "Logout",
  "auth.password_change": "Ganti password sendiri",
  "account.avatar": "Ganti foto profil",
  "user.create": "Tambah pengguna",
  "user.toggle": "Ubah status akun",
  "user.reset_password": "Reset password pengguna",
  "user.delete": "Hapus pengguna",
  "user.import": "Impor data dari Excel",
  "class.save": "Simpan kelas",
  "settings.profile": "Ubah profil sekolah",
  "settings.logo": "Ubah logo sekolah",
  "settings.subjects": "Ubah mata pelajaran",
  "settings.categories": "Ubah kategori materi",
  "elite.prompt_save": "Simpan naskah ELITE",
  "elite.prompt_delete": "Hapus naskah ELITE",
  "announcement.save": "Terbitkan pengumuman",
  "rpp.save": "Simpan RPP induk",
  "rpp.publish": "Ubah status terbit RPP",
  "rpp.delete": "Hapus RPP induk",
  "rpp.use": "Guru memakai RPP",
  "rpp.copy_save": "Guru menyunting salinan RPP",
  "rpp.copy_delete": "Guru menghapus salinan RPP",
  "announcement.delete": "Hapus pengumuman",
  "export.download": "Ekspor data ke Excel",
};

/**
 * Mencatat aktivitas penting ke tabel AuditLog. Tidak pernah melempar error
 * agar kegagalan pencatatan tidak menggagalkan aksi utama.
 * `actorId` diisi eksplisit bila pelaku belum/tidak lagi memiliki sesi (mis. saat login).
 */
export async function logAudit(
  action: string,
  opts: { target?: string | null; detail?: string | null; actorId?: string | null } = {},
): Promise<void> {
  try {
    const actorId = opts.actorId !== undefined ? opts.actorId : ((await getCurrentUser())?.id ?? null);
    await db.auditLog.create({
      data: {
        action,
        actorId,
        target: opts.target ?? null,
        detail: opts.detail ? opts.detail.slice(0, 1000) : null,
        ip: await getClientIp(),
      },
    });
  } catch (err) {
    console.error("Gagal mencatat audit log:", err);
  }
}
