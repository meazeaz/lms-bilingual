"use client";

import { useMemo, useState } from "react";
import {
  Award,
  BookMarked,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  RotateCw,
  Search,
  Send,
  Shuffle,
  Volume2,
  XCircle,
} from "lucide-react";
import { claimPhraseMastery } from "@/actions/lms";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Button, Card, CardBody, CardHeader, Input, Pill, Progress, StatusPill } from "@/components/ui";
import { HighlightedText, ListenButton, SpeedToggle, useTtsPlayer } from "@/components/tts-speed";

type PhraseItem = {
  id: string;
  number: number;
  category: string;
  indonesian: string;
  english: string;
  status?: string | null; // "APPROVED" | "PENDING" | "REJECTED" | null
};

// ───────────── Flashcard Interaktif ─────────────
export function PocketFlashcard({
  phrases,
}: {
  phrases: PhraseItem[];
}) {
  const [index, setIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const tts = useTtsPlayer();

  const current = phrases[index];
  if (!current) return null;
  const cardKey = `card:${current.id}`;

  function next() {
    tts.stop();
    setShowEnglish(false);
    setIndex((prev) => (prev + 1) % phrases.length);
  }

  function prev() {
    tts.stop();
    setShowEnglish(false);
    setIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
  }

  function shuffle() {
    tts.stop();
    setShowEnglish(false);
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setIndex(randomIndex);
  }

  function flip() {
    setShowEnglish((prev) => !prev);
  }

  return (
    <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50/40 via-white to-slate-50 shadow-md">
      <CardHeader
        icon={RotateCw}
        title="Mode Flashcard Interaktif"
        description="Ketuk kartu untuk membuka kalimat Bahasa Inggris dan latih pelafalan Anda"
        action={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />
            <Button variant="secondary" size="sm" onClick={shuffle} title="Acak Kalimat">
              <Shuffle className="size-3.5" /> Acak
            </Button>
            <span className="text-xs font-bold text-slate-500 tabular-nums px-2">
              {index + 1} / {phrases.length}
            </span>
          </div>
        }
      />

      <CardBody className="p-6">
        {/* Flashcard Area */}
        <div
          onClick={flip}
          className="group relative min-h-[220px] cursor-pointer rounded-3xl border-2 border-dashed border-brand-200 bg-white p-8 text-center shadow-inner transition hover:border-brand-400 hover:shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-xl bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-700">
              Frasa #{current.number} · {current.category}
            </span>
            {current.status === "APPROVED" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-mint-600 bg-mint-50 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="size-3.5" /> Hafal
              </span>
            ) : current.status === "PENDING" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                <Clock className="size-3.5" /> Verifikasi
              </span>
            ) : (
              <span className="text-xs text-slate-400">Belum Ditandai</span>
            )}
          </div>

          <div className="my-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {showEnglish ? "Bahasa Inggris (Pelafalan):" : "Bahasa Indonesia:"}
            </p>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ink md:text-3xl leading-snug">
              {showEnglish ? (
                <HighlightedText text={current.english} active={tts.playingKey === cardKey ? tts.activeWord : -1} />
              ) : (
                current.indonesian
              )}
            </h3>
            <div className="mt-3 flex justify-center">
              <ListenButton
                playing={tts.playingKey === cardKey}
                onClick={() => tts.toggle(cardKey, current.english)}
                label={showEnglish ? "Dengar pelafalan" : "Dengar bahasa Inggrisnya"}
                className="px-3 py-1.5 text-xs"
              />
            </div>
            {showEnglish && (
              <p className="mt-3 text-sm text-slate-500 italic">
                &ldquo;{current.indonesian}&rdquo;
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
            <RotateCw className="size-3.5 transition group-hover:rotate-180" />
            <span>{showEnglish ? "Ketuk untuk melihat Bahasa Indonesia" : "Ketuk untuk membuka Bahasa Inggris"}</span>
          </div>
        </div>

        {/* Kontrol Navigasi Flashcard */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={prev}>
              <ChevronLeft className="size-4" /> Sebelumnya
            </Button>
            <Button variant="secondary" size="sm" onClick={next}>
              Berikutnya <ChevronRight className="size-4" />
            </Button>
          </div>

          <div>
            {current.status === "APPROVED" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-700 bg-mint-50 px-3 py-1.5 rounded-xl border border-mint-200">
                <Check className="size-4" /> Frasa Ini Sudah Terverifikasi Hafal
              </span>
            ) : current.status === "PENDING" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Clock className="size-4" /> Menunggu Verifikasi Admin EDT
              </span>
            ) : (
              <ActionForm action={claimPhraseMastery}>
                <input type="hidden" name="phraseId" value={current.id} />
                <SubmitButton variant="primary" size="sm" pendingText="Mengajukan…">
                  <Send className="size-3.5" /> Saya Sudah Hafal Frasa Ini
                </SubmitButton>
              </ActionForm>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ───────────── Daftar & Filter 50 Frasa Saku ─────────────
export function PocketPhraseList({
  phrases,
  targetPhrases,
  masteredCount,
}: {
  phrases: PhraseItem[];
  targetPhrases: number;
  masteredCount: number;
}) {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const tts = useTtsPlayer();

  const categories = useMemo(() => {
    const set = new Set(phrases.map((p) => p.category));
    return ["ALL", ...Array.from(set)];
  }, [phrases]);

  const filtered = useMemo(() => {
    return phrases.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchNo = String(p.number).includes(q);
        const matchEn = p.english.toLowerCase().includes(q);
        const matchId = p.indonesian.toLowerCase().includes(q);
        if (!matchNo && !matchEn && !matchId) return false;
      }
      return true;
    });
  }, [phrases, category, query]);

  return (
    <div className="space-y-6">
      {/* Filter Kategori & Pencarian */}
      <Card>
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kalimat dalam Bahasa Inggris, Indonesia, atau nomor..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <span className="text-xs font-semibold text-slate-500 shrink-0">
              Menampilkan {filtered.length} dari {phrases.length} frasa
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>Kecepatan suara:</span>
            <SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />
            <span className="hidden sm:inline">Lebih lambat = dibacakan kata per kata</span>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  category === cat
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Grid Frasa */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300 transition flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600">
                  #{item.number}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 truncate">
                  {item.category}
                </span>
                {item.status === "APPROVED" ? (
                  <Pill tone="success">Hafal</Pill>
                ) : item.status === "PENDING" ? (
                  <Pill tone="warning">Verifikasi</Pill>
                ) : item.status === "REJECTED" ? (
                  <Pill tone="danger">Latihan Ulang</Pill>
                ) : (
                  <span className="text-[11px] text-slate-400">Belum</span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-ink leading-snug">
                  &ldquo;
                  <HighlightedText text={item.english} active={tts.playingKey === item.id ? tts.activeWord : -1} />
                  &rdquo;
                </h4>
                <ListenButton playing={tts.playingKey === item.id} onClick={() => tts.toggle(item.id, item.english)} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {item.indonesian}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {item.status === "APPROVED"
                  ? "Telah diverifikasi Admin EDT"
                  : item.status === "PENDING"
                  ? "Menunggu peninjauan EDT"
                  : "Siap dipraktikkan di kelas"}
              </span>

              {item.status !== "APPROVED" && (
                <ActionForm action={claimPhraseMastery}>
                  <input type="hidden" name="phraseId" value={item.id} />
                  <SubmitButton variant="secondary" size="sm" pendingText="Mengajukan…">
                    <Check className="size-3.5" /> Ajukan Hafal
                  </SubmitButton>
                </ActionForm>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
