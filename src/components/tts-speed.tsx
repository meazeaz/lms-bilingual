"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gauge, Square, Volume2 } from "lucide-react";
import { TTS_SPEEDS, speakText, ttsSupported, type TtsSpeed } from "@/lib/tts";
import { cn } from "@/lib/utils";

const SPEED_KEY = "lms_tts_speed";
const SPEED_EVENT = "lms-tts-speed";

function readSavedSpeed(): TtsSpeed {
  try {
    const v = localStorage.getItem(SPEED_KEY);
    return v === "slow" || v === "slower" ? v : "normal";
  } catch {
    return "normal";
  }
}

/**
 * Pemutar suara untuk daftar kalimat/istilah (glosarium, Pocket Book).
 * Kecepatan diingat browser dan sama di semua halaman yang memakai hook ini.
 */
let memorySpeed: TtsSpeed | null = null; // cadangan bila localStorage tidak bisa dipakai

function subscribeSpeed(onChange: () => void) {
  window.addEventListener(SPEED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SPEED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useTtsPlayer() {
  const speed = useSyncExternalStore(
    subscribeSpeed,
    () => memorySpeed ?? readSavedSpeed(),
    () => "normal" as TtsSpeed,
  );
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState(-1);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const stop = useCallback(() => stopRef.current?.(), []);

  const setSpeed = useCallback((next: TtsSpeed) => {
    stopRef.current?.();
    try {
      localStorage.setItem(SPEED_KEY, next);
      memorySpeed = null;
    } catch {
      memorySpeed = next; // penyimpanan browser tidak tersedia: berlaku selama halaman terbuka
    }
    window.dispatchEvent(new Event(SPEED_EVENT));
  }, []);

  /** Putar teks; menekan tombol yang sama saat sedang diputar akan menghentikannya. */
  const toggle = useCallback(
    (key: string, text: string, lang: string | string[] = "en-US") => {
      if (playingKey === key) {
        stopRef.current?.();
        return;
      }
      setPlayingKey(key);
      setActiveWord(-1);
      stopRef.current = speakText(text, {
        lang,
        speed,
        onWord: setActiveWord,
        onEnd: () => {
          setPlayingKey((cur) => (cur === key ? null : cur));
          setActiveWord(-1);
        },
      });
    },
    [playingKey, speed],
  );

  return { speed, setSpeed, playingKey, activeWord, toggle, stop, supported: typeof window === "undefined" ? true : ttsSupported() };
}

/** Teks yang menyorot kata yang sedang dibacakan (mode "Lebih lambat"). */
export function HighlightedText({ text, active, className }: { text: string; active: number; className?: string }) {
  if (active < 0) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {text.split(/\s+/).filter(Boolean).map((w, k) => (
        <span key={k} className={cn("rounded px-0.5 transition-colors", k === active && "bg-brand-200 text-brand-900")}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

/** Tombol dengar kecil untuk satu kalimat/istilah. */
export function ListenButton({
  playing,
  onClick,
  label = "Dengar",
  className,
}: {
  playing: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={playing ? "Hentikan suara" : label || "Dengar"}
      title={playing ? "Hentikan suara" : label || "Dengar"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ring-1 transition",
        playing ? "bg-rose-50 text-rose-600 ring-rose-200" : "bg-brand-50 text-brand-700 ring-brand-200 hover:bg-brand-100",
        className,
      )}
    >
      {playing ? <Square className="size-3" /> : <Volume2 className="size-3" />}
      {label ? (playing ? "Berhenti" : label) : null}
    </button>
  );
}

/** Pilihan 3 kecepatan suara: Normal, Lambat, Lebih lambat (kata per kata). */
export function SpeedToggle({
  value,
  onChange,
  accent = "purple",
  className,
}: {
  value: TtsSpeed;
  onChange: (speed: TtsSpeed) => void;
  accent?: "purple" | "pink" | "brand";
  className?: string;
}) {
  const palette = {
    purple: { active: "bg-purple-600 text-white", idle: "text-purple-700 hover:bg-purple-100", ring: "ring-purple-200 bg-purple-50", icon: "text-purple-500" },
    pink: { active: "bg-pink-600 text-white", idle: "text-pink-700 hover:bg-pink-100", ring: "ring-pink-200 bg-pink-50", icon: "text-pink-500" },
    brand: { active: "bg-brand-500 text-white", idle: "text-brand-700 hover:bg-brand-100", ring: "ring-brand-200 bg-brand-50", icon: "text-brand-500" },
  }[accent];
  const { active, idle, ring } = palette;
  return (
    <div role="radiogroup" aria-label="Kecepatan suara" className={cn("inline-flex items-center gap-0.5 rounded-lg p-0.5 ring-1", ring, className)}>
      <Gauge className={cn("ml-1 mr-0.5 size-3.5", palette.icon)} aria-hidden />
      {TTS_SPEEDS.map((s) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={value === s.key}
          onClick={() => onChange(s.key)}
          title={s.key === "slower" ? "Dibacakan kata per kata dengan jeda singkat" : undefined}
          className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold transition", value === s.key ? active : idle)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
