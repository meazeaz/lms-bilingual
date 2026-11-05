"use client";

import { useState } from "react";
import { Headphones, PenTool, Play, Radio, Send, Square, Type, Volume2 } from "lucide-react";
import { submitQuiz } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import type { QuizQuestion } from "@/types/quiz";

function ListeningPlayer({
  audioUrl,
  audioScript,
  voice = "en-US",
}: {
  audioUrl?: string;
  audioScript?: string;
  voice?: "en-US" | "en-GB";
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Text-to-Speech audio.");
      return;
    }
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    if (!audioScript) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(audioScript);
    u.lang = voice;
    u.rate = 0.88;
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="size-4 text-purple-700" />
          <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
            Audio Menyimak (Listening)
          </span>
        </div>
        <span className="text-[11px] text-purple-700 font-medium">
          Dengarkan sebelum menjawab
        </span>
      </div>

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full h-10 mt-1" />
      ) : (
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-200">
          <button
            type="button"
            onClick={toggleSpeech}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              isPlaying
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="size-3.5" /> Hentikan Audio
              </>
            ) : (
              <>
                <Play className="size-3.5" /> 🔊 Putar Audio Percakapan
              </>
            )}
          </button>
          <span className="text-xs text-slate-600 italic">
            {isPlaying
              ? "Sedang memutar percakapan audio native speaker..."
              : "Klik tombol di samping untuk mendengarkan audio latihan"}
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

          return (
            <li
              key={i}
              className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
                qType === "LISTENING"
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

                {qType === "LISTENING" ? (
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

              {/* Teks Pertanyaan */}
              <p className="font-bold text-ink text-sm sm:text-base leading-snug">
                {q.q}
              </p>

              {/* Komponen Audio jika Listening */}
              {qType === "LISTENING" && (
                <ListeningPlayer
                  audioUrl={q.audioUrl}
                  audioScript={q.audioScript}
                  voice={q.audioVoice}
                />
              )}

              {/* Input Jawaban Spesifik Tipe */}
              {qType === "WRITING" ? (
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
