import "server-only";
import { db } from "@/lib/db";
import { toModulData } from "@/lib/modul-ajar";

/** RPP induk (buatan admin). Guru hanya melihat yang sudah terbit. */
export async function loadMasters({ includeDrafts = false } = {}) {
  const rows = await db.modulAjar.findMany({
    where: { teacherId: null, ...(includeDrafts ? {} : { published: true }) },
    include: { _count: { select: { copies: true } } },
    orderBy: [{ book: "asc" }, { unit: "asc" }, { meeting: "asc" }],
  });
  return rows.map((r) => ({ ...toModulData(r), copyCount: r._count.copies }));
}

/** Salinan RPP milik seorang guru. */
export async function loadTeacherCopies(teacherId: string) {
  const rows = await db.modulAjar.findMany({
    where: { teacherId },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map(toModulData);
}

export async function loadModul(id: string) {
  const row = await db.modulAjar.findUnique({
    where: { id },
    include: {
      source: { select: { id: true, title: true, updatedAt: true } },
      teacher: { include: { user: { select: { name: true } } } },
    },
  });
  if (!row) return null;
  return { data: toModulData(row), source: row.source, teacherName: row.teacher?.user.name ?? null };
}
