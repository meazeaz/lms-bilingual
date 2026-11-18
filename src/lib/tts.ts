/**
 * Pembaca teks (Text-to-Speech bawaan browser) dengan 3 kecepatan.
 * "slower" membacakan kata per kata dengan jeda singkat agar siswa mudah menangkap setiap kata.
 * Teks campuran Indonesia–Inggris bisa dibacakan dengan suara berbeda per bagian (lihat wordLangs).
 * Hanya dipakai di Client Component.
 */

export type TtsSpeed = "normal" | "slow" | "slower";

export const TTS_SPEEDS: { key: TtsSpeed; label: string; rate: number; audioRate: number }[] = [
  { key: "normal", label: "Normal", rate: 0.95, audioRate: 1 },
  { key: "slow", label: "Lambat", rate: 0.7, audioRate: 0.75 },
  { key: "slower", label: "Lebih lambat", rate: 0.75, audioRate: 0.6 },
];

/** Pilihan batas jumlah putar audio soal Listening (0 = tidak terbatas). */
export const LISTENING_PLAY_LIMITS = [0, 1, 2, 3, 5];

/** Jeda antar kata pada mode "Lebih lambat" (ms). */
export const WORD_GAP_MS = 350;

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// ─────────────── Deteksi bahasa ───────────────
const ID_WORDS = new Set(
  "yang dan di ke dari untuk dengan ini itu adalah akan kita kamu kalian guru siswa tidak bisa juga atau pada dalam karena jika kalau artinya berarti seperti saat sudah belum harus agar oleh sebagai lebih ada mereka contoh ikuti sebelum sesudah setelah disebut dipakai menjadi kata kunci buka tutup kerjakan".split(" "),
);
const EN_WORDS = new Set(
  "the and of to in is are for with this that you your we they it on at be can will what how when from by as or not do does our their my me i please".split(" "),
);

function langScore(text: string) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  let id = 0;
  let en = 0;
  for (const w of words) {
    if (ID_WORDS.has(w)) id++;
    else if (EN_WORDS.has(w)) en++;
  }
  return { id, en };
}

/** Tebak bahasa sebuah teks (Indonesia atau Inggris). */
export function guessLang(text: string): "id-ID" | "en-US" {
  const { id, en } = langScore(text);
  return id > en ? "id-ID" : "en-US";
}

// Hanya tanda kutip ganda; petik tunggal bisa tertukar dengan apostrof (Don't, students')
const OPEN_QUOTE = /^["“]/;
const CLOSE_QUOTE = /["”][.,!?;:)]*$/;

/**
 * Bahasa untuk tiap kata (dipisah spasi) di teks campuran.
 * Teks dalam tanda kutip dan setiap kalimat/klausa dinilai sendiri; bagian tanpa petunjuk
 * mengikuti bagian sebelumnya. Panjang hasil = jumlah kata, agar sorotan kata tetap sinkron.
 */
export function wordLangs(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  // Bagi menjadi potongan: isi tanda kutip, atau kalimat/klausa yang diakhiri . ! ? :
  const chunks: { start: number; end: number; quoted: boolean }[] = [];
  let i = 0;
  while (i < words.length) {
    const start = i;
    if (OPEN_QUOTE.test(words[i])) {
      // Cari kata penutup kutipan (bisa kata yang sama, mis. "Hello.")
      let j = i;
      while (j < words.length - 1 && !CLOSE_QUOTE.test(j === i ? words[j].slice(1) : words[j])) j++;
      chunks.push({ start, end: j, quoted: true });
      i = j + 1;
      continue;
    }
    while (i < words.length - 1 && !/[.!?:]$/.test(words[i]) && !OPEN_QUOTE.test(words[i + 1])) i++;
    chunks.push({ start, end: i, quoted: false });
    i++;
  }

  const overall = guessLang(text);
  const langs = new Array<string>(words.length).fill(overall);
  let prev: string | null = null;
  for (const c of chunks) {
    const { id, en } = langScore(words.slice(c.start, c.end + 1).join(" "));
    // Kutipan pendek tanpa petunjuk (mis. "Stand in a line") hampir selalu contoh bahasa Inggris
    const lang: string = id > en ? "id-ID" : en > id ? "en-US" : c.quoted ? "en-US" : (prev ?? overall);
    for (let k = c.start; k <= c.end; k++) langs[k] = lang;
    prev = lang;
  }
  return langs;
}

/** Kecepatan pemutaran file audio (MP3) untuk tiap pilihan kecepatan. */
export function audioRateFor(speed: TtsSpeed) {
  return TTS_SPEEDS.find((s) => s.key === speed)?.audioRate ?? 1;
}

/** Sesi bacaan yang sedang berjalan; dihentikan saat bacaan baru dimulai dari tombol mana pun. */
let currentStop: (() => void) | null = null;

/**
 * Bacakan teks. Mengembalikan fungsi untuk menghentikan.
 * lang boleh satu kode bahasa, atau array bahasa per kata (hasil wordLangs) untuk teks campuran.
 * onWord(i) dipanggil dengan indeks kata yang sedang dibaca (hanya mode "slower"), -1 saat selesai.
 */
export function speakText(
  text: string,
  opts: { lang?: string | string[]; speed?: TtsSpeed; onEnd?: () => void; onWord?: (index: number) => void } = {},
): () => void {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.();
    return () => {};
  }
  currentStop?.();
  const synth = window.speechSynthesis;
  const speed = opts.speed ?? "normal";
  const rate = TTS_SPEEDS.find((s) => s.key === speed)?.rate ?? 0.95;
  const words = text.split(/\s+/).filter(Boolean);
  const langOf = (k: number) => (Array.isArray(opts.lang) ? (opts.lang[k] ?? "en-US") : (opts.lang ?? "en-US"));

  // Susun potongan ucapan: kata per kata (slower), atau kelompok kata berbahasa sama
  const chunks: { text: string; lang: string; word: number }[] = [];
  if (speed === "slower") {
    words.forEach((w, k) => chunks.push({ text: w, lang: langOf(k), word: k }));
  } else if (!Array.isArray(opts.lang)) {
    chunks.push({ text, lang: langOf(0), word: 0 });
  } else {
    words.forEach((w, k) => {
      const last = chunks[chunks.length - 1];
      if (last && last.lang === langOf(k)) last.text += " " + w;
      else chunks.push({ text: w, lang: langOf(k), word: k });
    });
  }

  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  synth.cancel();

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    if (currentStop === stop) currentStop = null;
    opts.onWord?.(-1);
    opts.onEnd?.();
  };

  const speakChunk = (c: number) => {
    if (cancelled) return;
    if (c >= chunks.length) return finish();
    const chunk = chunks[c];
    if (speed === "slower") opts.onWord?.(chunk.word);
    const u = new SpeechSynthesisUtterance(chunk.text);
    u.lang = chunk.lang;
    u.rate = rate;
    const next = () => {
      if (cancelled) return;
      if (speed !== "slower") return speakChunk(c + 1);
      // Jeda sedikit lebih panjang setelah tanda baca akhir kalimat/koma
      const gap = /[.!?]["”']?$/.test(chunk.text) ? WORD_GAP_MS * 2 : /[,;:]["”']?$/.test(chunk.text) ? WORD_GAP_MS * 1.5 : WORD_GAP_MS;
      timer = setTimeout(() => speakChunk(c + 1), gap);
    };
    u.onend = next;
    u.onerror = next;
    synth.speak(u);
  };
  speakChunk(0);

  function stop() {
    if (timer) clearTimeout(timer);
    const wasActive = !cancelled;
    cancelled = true;
    if (currentStop === stop) currentStop = null;
    synth.cancel();
    if (wasActive) {
      opts.onWord?.(-1);
      opts.onEnd?.();
    }
  }
  currentStop = stop;
  return stop;
}
