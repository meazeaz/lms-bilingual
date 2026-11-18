"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BookOpenText, Headphones, Keyboard, Lock, Mic, PenTool, Play, Radio, RotateCcw, Send, Square, Type, Volume2 } from "lucide-react";
import { READ_ALOUD_FULL_CREDIT, readAloudAccuracy, speechWords } from "@/lib/speaking";
import { audioRateFor, speakText, ttsSupported, type TtsSpeed } from "@/lib/tts";
import { SpeedToggle, useTtsPlayer } from "@/components/tts-speed";
import { ListenableParagraphs } from "@/components/material-audio";
import { submitQuiz } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import type { QuizQuestion } from "@/types/quiz";

function ListeningPlayer({
  audioUrl,
  audioScript,
  voice = "en-US",
  allowSpeedChange = true,
  maxPlays = 0,
}: {
  audioUrl?: string;
  audioScript?: string;
  voice?: "en-US" | "en-GB";
  /** false = terkunci di kecepatan Normal */
  allowSpeedChange?: boolean;
  /** 0 = tidak terbatas */
  maxPlays?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [chosenSpeed, setSpeed] = useState<TtsSpeed>("normal");
  const [plays, setPlays] = useState(0);
  const speed: TtsSpeed = allowSpeedChange ? chosenSpeed : "normal";
  const limited = maxPlays > 0;
  const playsLeft = limited ? Math.max(0, maxPlays - plays) : Infinity;
  const exhausted = limited && playsLeft === 0;
  const stopRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => () => stopRef.current?.(), []);
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = audioRateFor(speed);
  }, [speed]);

  const changeSpeed = (next: TtsSpeed) => {
    setSpeed(next);
    stopRef.current?.(); // hentikan bacaan yang sedang berjalan agar kecepatan baru dipakai saat diputar lagi
    audioRef.current?.pause();
  };

  const stop = () => {
    stopRef.current?.();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    if (isPlaying) return stop();
    if (exhausted) return;
    if (audioUrl) {
      // File MP3 (dipakai saat jumlah putar dibatasi; tanpa batas memakai kontrol bawaan browser)
      const el = audioRef.current;
      if (!el) return;
      el.currentTime = 0;
      el.playbackRate = audioRateFor(speed);
      void el.play();
      setIsPlaying(true);
      setPlays((n) => n + 1);
      return;
    }
    if (!ttsSupported()) {
      alert("Browser Anda tidak mendukung Text-to-Speech audio.");
      return;
    }
    if (!audioScript) return;
    setIsPlaying(true);
    setPlays((n) => n + 1);
    stopRef.current = speakText(audioScript, { lang: voice, speed, onEnd: () => setIsPlaying(false) });
  };

  const useNativeControls = Boolean(audioUrl) && !limited;

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-2 mt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Headphones className="size-4 text-purple-700" />
          <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
            Audio Menyimak (Listening)
          </span>
        </div>
        {allowSpeedChange ? (
          <SpeedToggle value={speed} onChange={changeSpeed} />
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-purple-700 ring-1 ring-purple-200">
            <Lock className="size-3" /> Kecepatan Normal
          </span>
        )}
      </div>

      {useNativeControls ? (
        <audio
          ref={audioRef}
          controls
          src={audioUrl}
          onLoadedMetadata={(e) => (e.currentTarget.playbackRate = audioRateFor(speed))}
          className="w-full h-10 mt-1"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-200">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="auto"
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={(e) => (e.currentTarget.playbackRate = audioRateFor(speed))}
              className="hidden"
            />
          )}
          <button
            type="button"
            onClick={toggle}
            disabled={exhausted && !isPlaying}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 ${
              isPlaying
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="size-3.5" /> Hentikan Audio
              </>
            ) : exhausted ? (
              <>
                <Lock className="size-3.5" /> Kesempatan putar habis
              </>
            ) : (
              <>
                <Play className="size-3.5" /> 🔊 Putar Audio{audioUrl ? "" : " Percakapan"}
              </>
            )}
          </button>
          {limited && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${
                exhausted ? "bg-slate-100 text-slate-500" : "bg-purple-100 text-purple-800"
              }`}
            >
              Sisa putar: {playsLeft} dari {maxPlays}
            </span>
          )}
          <span className="text-xs text-slate-600 italic">
            {isPlaying
              ? speed === "slower"
                ? "Dibacakan kata per kata, dengarkan setiap katanya..."
                : "Sedang memutar audio..."
              : exhausted
              ? "Jawab berdasarkan apa yang sudah kamu dengar."
              : limited
              ? "Dengarkan dengan saksama. Menghentikan audio tetap dihitung satu kali putar."
              : allowSpeedChange
              ? "Belum jelas? Pilih Lambat atau Lebih lambat, lalu putar lagi."
              : "Klik untuk mendengarkan audio."}
          </span>
        </div>
      )}
    </div>
  );
}

function WritingAnswerInput({
  index,
  minWords = 10,
  targetKeywords,
}: {
  index: number;
  minWords?: number;
  targetKeywords?: string[];
}) {
  const [text, setText] = useState("");
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isEnough = wordCount >= minWords;

  return (
    <div className="space-y-2.5 mt-2">
      {targetKeywords && targetKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
          <span className="font-bold text-emerald-900">Kosakata Kunci Anjuran:</span>
          {targetKeywords.map((kw, kIdx) => {
            const hasKeyword = text.toLowerCase().includes(kw.toLowerCase());
            return (
              <span
                key={kIdx}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  hasKeyword
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                {kw} {hasKeyword && "✓"}
              </span>
            );
          })}
        </div>
      )}

      <textarea
        name={`q${index}`}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tuliskan jawaban atau esai Anda dalam bahasa Inggris di sini..."
        className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
        required
      />

      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-semibold ${
            isEnough ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          Panjang: {wordCount} kata {isEnough ? `(✓ Tercapai ≥ ${minWords})` : `(Minimal ${minWords} kata)`}
        </span>
        <span className="text-slate-400">Gunakan tata bahasa dan kalimat lengkap</span>
      </div>
    </div>
  );
}

// Web Speech API belum punya tipe bawaan di TypeScript DOM lib
type Recognizer = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const noopSubscribe = () => () => {};

function getRecognizerCtor(): (new () => Recognizer) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function SpeakingAnswerInput({
  index,
  mode,
  targetText,
  accent = "en-US",
  minWords = 10,
  targetKeywords,
}: {
  index: number;
  mode: "READ_ALOUD" | "RESPOND";
  targetText?: string;
  accent?: "en-US" | "en-GB";
  minWords?: number;
  targetKeywords?: string[];
}) {
  // null saat render di server; di browser: apakah pengenalan suara bisa dipakai
  const supported = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => Boolean(getRecognizerCtor()) && window.isSecureContext,
    () => null,
  );
  const [typed, setTyped] = useState(false);
  const [recording, setRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [speakingSample, setSpeakingSample] = useState(false);
  const [sampleSpeed, setSampleSpeed] = useState<TtsSpeed>("normal");
  const [activeWord, setActiveWord] = useState(-1);
  const recRef = useRef<Recognizer | null>(null);
  const stopSampleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      stopSampleRef.current?.();
    };
  }, []);

  const start = () => {
    const Ctor = getRecognizerCtor();
    if (!Ctor) return;
    stopSampleRef.current?.(); // jangan sampai contoh suara ikut terekam
    setError(null);
    setInterim("");
    const rec = new Ctor();
    rec.lang = accent;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let fin = "";
      let tmp = "";
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const r = e.results[k];
        if (r.isFinal) fin += r[0].transcript + " ";
        else tmp += r[0].transcript;
      }
      if (fin) setFinalText((prev) => (prev + " " + fin).replace(/\s+/g, " ").trim());
      setInterim(tmp);
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Akses mikrofon ditolak. Izinkan mikrofon di pengaturan browser, lalu coba lagi."
          : e.error === "no-speech"
          ? "Suara belum terdengar. Dekatkan mikrofon lalu coba lagi."
          : e.error === "network"
          ? "Pengenalan suara butuh koneksi internet. Periksa koneksi lalu coba lagi."
          : `Perekaman berhenti (${e.error}). Coba lagi.`,
      );
    };
    rec.onend = () => {
      setRecording(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stop = () => recRef.current?.stop();
  const retake = () => {
    recRef.current?.abort();
    setFinalText("");
    setInterim("");
    setError(null);
  };

  const playSample = () => {
    if (!targetText || !ttsSupported()) return;
    if (speakingSample) {
      stopSampleRef.current?.();
      return;
    }
    setSpeakingSample(true);
    stopSampleRef.current = speakText(targetText, {
      lang: accent,
      speed: sampleSpeed,
      onWord: setActiveWord,
      onEnd: () => setSpeakingSample(false),
    });
  };

  const changeSampleSpeed = (next: TtsSpeed) => {
    setSampleSpeed(next);
    stopSampleRef.current?.();
  };

  const transcript = finalText;
  const wordCount = speechWords(transcript).length;
  const accuracy = mode === "READ_ALOUD" && targetText && transcript ? readAloudAccuracy(targetText, transcript) : null;
  const useTyping = typed || supported === false;

  return (
    <div className="mt-2 space-y-2.5">
      <input type="hidden" name={`q${index}`} value={transcript} />
      <input type="hidden" name={`q${index}_method`} value={useTyping ? "typed" : "speech"} />

      {mode === "READ_ALOUD" && targetText && (
        <div className="rounded-2xl border border-pink-200 bg-white p-3.5">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-pink-900">Ucapkan kalimat ini:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <SpeedToggle value={sampleSpeed} onChange={changeSampleSpeed} accent="pink" />
              <button
                type="button"
                onClick={playSample}
                className="flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-700 ring-1 ring-pink-200 hover:bg-pink-100"
              >
                {speakingSample ? <Square className="size-3" /> : <Volume2 className="size-3" />} {speakingSample ? "Berhenti" : "Dengar contoh"}
              </button>
            </div>
          </div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-ink">
            {targetText.split(/\s+/).filter(Boolean).map((w, k) => (
              <span
                key={k}
                className={`rounded px-0.5 transition-colors ${k === activeWord ? "bg-pink-200 text-pink-900" : ""}`}
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      )}

      {mode === "RESPOND" && (
        <p className="text-xs text-slate-600">
          Jawab secara lisan minimal <strong>{minWords} kata</strong>
          {targetKeywords && targetKeywords.length > 0 && <> dan coba gunakan kata: <strong>{targetKeywords.join(", ")}</strong></>}.
        </p>
      )}

      {useTyping ? (
        <div className="space-y-1.5 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
          <p className="text-xs font-semibold text-amber-900">
            {supported === false
              ? "Browser ini belum bisa mengenali suara. Gunakan Google Chrome atau Microsoft Edge dengan mikrofon agar soal ini bisa dinilai. "
              : "Mode ketik. "}
            <strong>Jawaban speaking yang diketik mendapat nilai 0</strong> untuk soal ini. Jawabanmu tetap dikirim ke guru.
          </p>
          <textarea
            rows={3}
            value={finalText}
            onChange={(e) => setFinalText(e.target.value)}
            placeholder="Ketik ucapanmu dalam bahasa Inggris..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-pink-500 focus:outline-hidden"
          />
          {supported && (
            <button type="button" onClick={() => setTyped(false)} className="text-[11px] font-bold text-pink-700 hover:underline">
              Kembali ke mode mikrofon
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-pink-200 bg-pink-50/40 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {recording ? (
              <button type="button" onClick={stop} className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white animate-pulse">
                <Square className="size-3.5" /> Selesai bicara
              </button>
            ) : (
              <button type="button" onClick={start} disabled={supported === null} className="flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-pink-700 disabled:opacity-50">
                <Mic className="size-3.5" /> {transcript ? "Lanjut bicara" : "Mulai bicara"}
              </button>
            )}
            {transcript && !recording && (
              <button type="button" onClick={retake} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                <RotateCcw className="size-3.5" /> Ulangi dari awal
              </button>
            )}
            <button type="button" onClick={() => { recRef.current?.abort(); setTyped(true); }} className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700">
              <Keyboard className="size-3.5" /> Mikrofon bermasalah? Ketik (nilai 0)
            </button>
          </div>
          <div className="min-h-12 rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-pink-100">
            {transcript || interim ? (
              <>
                {transcript} <span className="text-slate-400">{interim}</span>
              </>
            ) : (
              <span className="text-slate-400">{recording ? "Mendengarkan… silakan bicara." : "Teks ucapanmu akan muncul di sini."}</span>
            )}
          </div>
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        </div>
      )}

      {transcript && (
        <p className="text-xs font-semibold">
          {useTyping ? (
            <span className="text-amber-700">Jawaban diketik: nilai soal ini 0.</span>
          ) : mode === "READ_ALOUD" && accuracy != null ? (
            <span className={accuracy >= READ_ALOUD_FULL_CREDIT ? "text-emerald-700" : "text-amber-700"}>
              Ketepatan ucapan: {Math.round(accuracy * 100)}% {accuracy >= READ_ALOUD_FULL_CREDIT ? "✓ Bagus sekali!" : "· coba ulangi agar lebih jelas"}
            </span>
          ) : (
            <span className={wordCount >= minWords ? "text-emerald-700" : "text-amber-700"}>
              {wordCount} kata terucap {wordCount >= minWords ? `(✓ tercapai ≥ ${minWords})` : `(minimal ${minWords} kata)`}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function ReadingPassage({ title, passage, allowAudio = true }: { title?: string; passage?: string; allowAudio?: boolean }) {
  const tts = useTtsPlayer();
  if (!passage) return null;
  const words = passage.split(/\s+/).filter(Boolean).length;
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-2xs">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-900">
          <BookOpenText className="size-4 text-sky-600" /> Teks Bacaan
          <span className="font-medium normal-case tracking-normal text-sky-700">· {words} kata</span>
        </span>
        {allowAudio && <SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />}
      </div>
      {title && <p className="mb-2 font-[family-name:var(--font-display)] text-base font-semibold text-ink">{title}</p>}
      <ListenableParagraphs
        text={passage}
        tts={tts}
        audio={allowAudio}
        className="max-h-72 space-y-2.5 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-700"
      />
      <p className="mt-2 text-[11px] text-slate-400">
        {allowAudio
          ? "Baca dengan teliti. Tekan Dengar bila ingin mendengarkan paragrafnya."
          : "Soal ini menguji kemampuan membaca, jadi teksnya dibaca sendiri tanpa suara. Baca dengan teliti, kamu pasti bisa!"}
      </p>
    </div>
  );
}

export function QuizForm({
  quizId,
  questions,
}: {
  quizId: string;
  questions: QuizQuestion[];
}) {
  return (
    <ActionForm action={submitQuiz} resetOnSuccess>
      <input type="hidden" name="quizId" value={quizId} />
      <ol className="space-y-6">
        {questions.map((q, i) => {
          const qType = q.type || "MULTIPLE_CHOICE";
          const prev = i > 0 ? questions[i - 1] : undefined;
          // Judul bagian tampil saat bagian berganti (mis. Part 1 → Part 2)
          const newSection = Boolean(q.section) && q.section !== prev?.section;
          // Beberapa soal bisa memakai teks bacaan yang sama: tampilkan sekali saja
          const samePassage = qType === "READING" && prev?.type === "READING" && Boolean(q.passage) && prev.passage === q.passage;

          return (
            <Fragment key={i}>
            {newSection && (
              <li className="list-none pt-2">
                <h4 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                  <span aria-hidden className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-400 to-coral-400" />
                  {q.section}
                  <span className="text-xs font-bold text-slate-400">
                    · {questions.filter((x) => x.section === q.section).length} soal
                  </span>
                </h4>
              </li>
            )}
            <li
              className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
                qType === "READING"
                  ? "border-sky-200 bg-sky-50/20"
                  : qType === "SPEAKING"
                  ? "border-pink-200 bg-pink-50/20"
                  : qType === "LISTENING"
                  ? "border-purple-200 bg-purple-50/20"
                  : qType === "WRITING"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : qType === "FILL_IN"
                  ? "border-amber-200 bg-amber-50/20"
                  : "border-slate-200 bg-slate-50/30"
              }`}
            >
              {/* Header Nomor & Tipe */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Nomor {i + 1} dari {questions.length}
                </span>

                {qType === "READING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                    <BookOpenText className="size-3" /> Soal Membaca (Reading)
                  </span>
                ) : qType === "SPEAKING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-800">
                    <Mic className="size-3" /> Soal Berbicara (Speaking)
                  </span>
                ) : qType === "LISTENING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                    <Headphones className="size-3" /> Soal Menyimak (Listening)
                  </span>
                ) : qType === "WRITING" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <PenTool className="size-3" /> Soal Menulis (Writing Task)
                  </span>
                ) : qType === "FILL_IN" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    <Type className="size-3" /> Soal Isian Singkat (Fill-in)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                    <Radio className="size-3" /> Pilihan Ganda
                  </span>
                )}
              </div>

              {/* Teks Bacaan jika Reading (tampil sebelum pertanyaan) */}
              {qType === "READING" && !samePassage && <ReadingPassage title={q.passageTitle} passage={q.passage} allowAudio={q.allowAudio !== false} />}
              {samePassage && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                  <BookOpenText className="size-3.5" /> Gunakan teks bacaan{q.passageTitle ? ` "${q.passageTitle}"` : ""} di atas.
                </p>
              )}

              {/* Teks Pertanyaan */}
              <p className="font-bold text-ink text-sm sm:text-base leading-snug">
                {q.q}
              </p>

              {/* Komponen Audio jika Listening */}
              {qType === "LISTENING" && (
                <ListeningPlayer
                  audioUrl={q.audioSourceType === "TTS" ? undefined : q.audioUrl}
                  audioScript={q.audioScript}
                  voice={q.audioVoice}
                  allowSpeedChange={q.allowSpeedChange !== false}
                  maxPlays={q.maxPlays ?? 0}
                />
              )}

              {/* Input Jawaban Spesifik Tipe */}
              {qType === "SPEAKING" ? (
                <SpeakingAnswerInput
                  index={i}
                  mode={q.speakingMode === "RESPOND" ? "RESPOND" : "READ_ALOUD"}
                  targetText={q.targetText}
                  accent={q.speakingAccent}
                  minWords={q.minWords}
                  targetKeywords={q.targetKeywords}
                />
              ) : qType === "WRITING" ? (
                <WritingAnswerInput
                  index={i}
                  minWords={q.minWords}
                  targetKeywords={q.targetKeywords}
                />
              ) : qType === "FILL_IN" ? (
                <div className="space-y-2 mt-2">
                  {q.fillInHint && (
                    <div className="rounded-xl bg-amber-50/80 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 font-medium flex items-center gap-1.5">
                      <span>💡 <strong>Petunjuk:</strong> {q.fillInHint}</span>
                    </div>
                  )}
                  <input
                    type="text"
                    name={`q${i}`}
                    placeholder="Ketikkan jawaban isian singkat dalam bahasa Inggris..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
                    required
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-slate-400">
                    Pastikan ejaan bahasa Inggris diketik dengan benar.
                  </p>
                </div>
              ) : qType === "READING" && q.readingFormat === "FILL_IN" ? (
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Jawab dengan kata atau frasa singkat dari teks bacaan:
                  </label>
                  <input
                    type="text"
                    name={`q${i}`}
                    placeholder="Ketik jawaban Anda di sini..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-hidden"
                    required
                    autoComplete="off"
                  />
                </div>
              ) : qType === "LISTENING" && q.listeningFormat === "FILL_IN" ? (
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ketik kata atau frasa yang Anda dengar dari audio:
                  </label>
                  <input
                    type="text"
                    name={`q${i}`}
                    placeholder="Ketik jawaban Anda di sini..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:outline-hidden"
                    required
                  />
                </div>
              ) : (
                /* Pilihan Ganda (Default atau Listening MC) */
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(q.options || []).map((o, j) => (
                    <label
                      key={j}
                      className="press flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 shadow-2xs"
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={j}
                        className="accent-brand-500 size-4"
                        required
                      />
                      <span className="font-bold text-slate-400">
                        {String.fromCharCode(65 + j)}.
                      </span>
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
            </li>
            </Fragment>
          );
        })}
      </ol>

      <div className="pt-4">
        <SubmitButton size="lg" variant="mint">
          <Send className="size-4" /> Kirim Seluruh Jawaban Kuis
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
