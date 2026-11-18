/** Penilaian soal Speaking (dipakai di server; aman diimpor di client). */

export function speechWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Ketepatan Read Aloud: proporsi kata target yang terucap dengan urutan benar
 * (longest common subsequence antar-kata), 0..1.
 */
export function readAloudAccuracy(target: string, spoken: string) {
  const a = speechWords(target);
  const b = speechWords(spoken);
  if (a.length === 0) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length] / a.length;
}

/** Ketepatan ≥ 85% dianggap benar penuh, karena pengenalan suara kadang salah dengar 1–2 kata. */
export const READ_ALOUD_FULL_CREDIT = 0.85;

export function readAloudScore(target: string, spoken: string) {
  const acc = readAloudAccuracy(target, spoken);
  return { accuracy: acc, score: acc >= READ_ALOUD_FULL_CREDIT ? 1 : acc };
}

/** Respond: sama seperti Writing (jumlah kata minimal + kata kunci), 0..1. */
export function respondScore(spoken: string, minWords = 10, keywords: string[] = []) {
  const words = speechWords(spoken);
  const kws = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
  if (words.length < minWords) return { score: 0.4 * (words.length / minWords), wordCount: words.length };
  const text = spoken.toLowerCase();
  const coverage = kws.length ? kws.filter((k) => text.includes(k)).length / kws.length : 1;
  return { score: 0.5 + 0.5 * coverage, wordCount: words.length };
}
