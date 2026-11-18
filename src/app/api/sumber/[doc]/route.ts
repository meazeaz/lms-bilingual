import { promises as fs } from "node:fs";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { SOURCE_LABEL, parseSourceSlug, sourcePath } from "@/lib/curriculum-sources";

/**
 * PDF asli Rise Up! Teens 1 untuk guru & admin (Teacher's Guide, soal tes, kunci jawaban).
 * Siswa tidak boleh mengakses: kunci jawaban Progress Test ada di sini.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/sumber/[doc]">) {
  const user = await getCurrentUser();
  if (!user) return new Response("Silakan login terlebih dahulu.", { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "TEACHER") return new Response("Berkas ini khusus guru.", { status: 403 });

  const { doc } = await ctx.params;
  const parsed = parseSourceSlug(doc);
  const file = parsed ? sourcePath(parsed.kind, parsed.unit) : null;
  if (!parsed || !file) return new Response("Berkas tidak dikenal.", { status: 404 });

  let data: Buffer;
  try {
    data = await fs.readFile(file);
  } catch {
    return new Response("Berkas sumber belum tersedia di server.", { status: 404 });
  }
  const name = `Rise Up Teens 1 - Unit ${parsed.unit} - ${SOURCE_LABEL[parsed.kind]}.pdf`;
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename="${name.replace(/'/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
