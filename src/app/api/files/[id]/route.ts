import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Menyajikan berkas yang tersimpan di database (logo sekolah, dsb.).
 * ID berkas bersifat acak (cuid) dan tidak berubah, sehingga aman di-cache lama oleh browser.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const { id } = await ctx.params;
  const file = await db.storedFile.findUnique({ where: { id } });
  if (!file) return new Response("Berkas tidak ditemukan", { status: 404 });

  return new Response(Buffer.from(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // Cegah SVG berisi skrip dieksekusi bila dibuka langsung
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
