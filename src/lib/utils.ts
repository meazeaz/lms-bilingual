import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const longDateFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatLongDate = (d: Date | string) => longDateFmt.format(new Date(d));
export const formatMonth = (d: Date | string) => monthFmt.format(new Date(d));

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
});
/** Tanggal + jam WIB, mis. "6 Nov 2026, 07.15". */
export const formatDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));

/** Tanggal lokal tanpa jam, dalam bentuk Date UTC tengah malam — kunci unik log harian. */
export function dayKey(d: Date | string = new Date()) {
  const x = typeof d === "string" ? new Date(d + (d.length === 10 ? "T00:00:00" : "")) : d;
  return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()));
}

export function toInputDate(d: Date | string = dayKey()) {
  const x = new Date(d);
  const y = x.getUTCFullYear();
  const m = String(x.getUTCMonth() + 1).padStart(2, "0");
  const day = String(x.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Jumlah hari kerja (Senin–Jumat) antara dua tanggal, inklusif. */
export function workdaysBetween(from: Date, to: Date) {
  let count = 0;
  const d = new Date(from);
  while (d <= to) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) count++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
}

export function daysAgo(n: number, from = new Date()) {
  const d = dayKey(from);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function avg(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function initials(name: string) {
  return name
    .replace(/^(Bu|Pak|Ibu|Bapak)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Normalisasi jawaban isian sebelum dicocokkan: huruf kecil, apostrof/kutip miring → lurus,
 * tanda baca kalimat (. , ! ? ; : ") diabaikan, spasi berlebih dirapikan.
 * Contoh: "I wake up at 6:45." ≡ "i wake up at 645" ≡ "I  wake up at 6:45".
 */
export function normalizeAnswer(s: string, caseSensitive = false) {
  const t = s
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u02BC`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[.,!?;:"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return caseSensitive ? t : t.toLowerCase();
}

/** Apakah jawaban isian cocok dengan salah satu kunci (setelah dinormalisasi). */
export function answerMatches(given: string, keys: (string | undefined | null)[], caseSensitive = false) {
  const g = normalizeAnswer(given, caseSensitive);
  return g.length > 0 && keys.some((k) => k != null && String(k).trim() !== "" && normalizeAnswer(String(k), caseSensitive) === g);
}
