/**
 * Kurikulum inti Bahasa Inggris: Rise Up! Teens 1 (ASTA Ilmu Publishing), level A2, kelas 7.
 * Materi inti ditandai dengan kategori CORE_CATEGORY dan judul berawalan "Unit N · …".
 */
export const CORE_CATEGORY = "Rise Up! Teens 1";
export const CORE_BOOK = { title: "Rise Up! Teens 1", publisher: "ASTA Ilmu Publishing", cefr: "A2", grade: 7, units: 10 };

/** Nomor unit dari judul "Unit 3 · …" (null bila bukan materi inti). */
export function unitNumber(title: string): number | null {
  const m = /^Unit\s+(\d+)\b/i.exec(title);
  return m ? Number(m[1]) : null;
}

/** Judul tanpa awalan "Unit N · ". */
export function unitTitle(title: string) {
  return title.replace(/^Unit\s+\d+\s*[·:\-–]\s*/i, "");
}

export function isCoreMaterial(m: { category: string }) {
  return m.category === CORE_CATEGORY;
}

/** Urutkan: materi inti per nomor unit lebih dulu, lalu sisanya mengikuti urutan semula. */
export function sortCoreFirst<T extends { category: string; title: string }>(list: T[]): T[] {
  const core = list.filter(isCoreMaterial).sort((a, b) => (unitNumber(a.title) ?? 99) - (unitNumber(b.title) ?? 99));
  return [...core, ...list.filter((m) => !isCoreMaterial(m))];
}
