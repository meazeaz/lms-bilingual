/** URL foto profil pengguna (atau undefined bila belum ada). Aman dipakai di server & klien. */
export function avatarSrc(fileId: string | null | undefined) {
  return fileId ? `/api/avatar/${fileId}` : undefined;
}

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
