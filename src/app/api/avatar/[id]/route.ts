import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Menyajikan foto profil. Hanya untuk pengguna yang sedang login (foto siswa adalah data pribadi),
 * dan hanya berkas yang memang sedang dipakai sebagai foto profil seseorang.
 *
 * Cache: browser boleh menyimpan foto, tetapi wajib bertanya ke server setiap kali (no-cache + ETag).
 * Server memeriksa login lebih dulu, lalu cukup menjawab 304 bila foto tidak berubah. Dengan begitu foto
 * tidak bisa dibuka dari cache setelah logout di komputer yang dipakai bersama.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/avatar/[id]">) {
  const viewer = await getCurrentUser();
  if (!viewer) return new Response("Silakan login terlebih dahulu.", { status: 401, headers: { "Cache-Control": "no-store" } });

  const { id } = await ctx.params;
  const owner = await db.user.findFirst({ where: { avatarFileId: id }, select: { id: true } });
  if (!owner) return new Response("Foto tidak ditemukan", { status: 404, headers: { "Cache-Control": "no-store" } });

  const etag = `"${id}"`; // ID berkas berganti setiap foto diganti
  const headers = {
    "Cache-Control": "private, no-cache",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  };
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });

  const file = await db.storedFile.findUnique({ where: { id } });
  if (!file || !file.isPrivate) return new Response("Foto tidak ditemukan", { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(Buffer.from(file.data), {
    headers: { ...headers, "Content-Type": file.mimeType, "Content-Length": String(file.size) },
  });
}
