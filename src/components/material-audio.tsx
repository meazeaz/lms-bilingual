"use client";

import { BookOpen, Languages, VolumeX } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { HighlightedText, ListenButton, SpeedToggle, useTtsPlayer } from "@/components/tts-speed";
import { wordLangs } from "@/lib/tts";

type TtsPlayer = ReturnType<typeof useTtsPlayer>;

const isHeading = (p: string) => /^#{2,3}\s/.test(p);

/** Judul bagian materi dari paragraf "## Judul". */
function SectionHeading({ text }: { text: string }) {
  return (
    <h3 className="!mt-6 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-ink first:!mt-0">
      <span aria-hidden className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-400 to-coral-400" />
      {text.replace(/^#{2,3}\s+/, "")}
    </h3>
  );
}

/**
 * Paragraf-paragraf teks, masing-masing dengan tombol dengar dan sorotan kata.
 * Bahasa tiap bagian kalimat dideteksi otomatis (Indonesia/Inggris).
 */
export function ListenableParagraphs({
  text,
  tts,
  className,
  audio = true,
}: {
  text: string;
  tts: TtsPlayer;
  className?: string;
  /** false = tampilkan teks saja tanpa tombol dengar */
  audio?: boolean;
}) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!audio) {
    return (
      <div className={className}>
        {paragraphs.map((p, i) =>
          isHeading(p) ? <SectionHeading key={i} text={p} /> : <p key={i} className="whitespace-pre-line">{p}</p>,
        )}
      </div>
    );
  }
  return (
    <div className={className}>
      {paragraphs.map((p, i) => {
        // Paragraf "## Judul" = judul bagian (tanpa tombol dengar)
        if (isHeading(p)) return <SectionHeading key={i} text={p} />;
        const key = `p${i}`;
        const playing = tts.playingKey === key;
        return (
          <div key={i} className={`flex items-start gap-2 rounded-xl px-2 py-1 -mx-2 transition ${playing ? "bg-brand-50/70" : ""}`}>
            <p className="min-w-0 flex-1 whitespace-pre-line">
              <HighlightedText text={p} active={playing ? tts.activeWord : -1} />
            </p>
            <ListenButton playing={playing} onClick={() => tts.toggle(key, p, wordLangs(p))} className="mt-0.5" />
          </div>
        );
      })}
      {tts.speed === "slower" && (
        <p className="text-xs text-slate-400">Mode Lebih lambat: dibacakan kata per kata, kata yang sedang dibaca disorot.</p>
      )}
    </div>
  );
}

/** Isi materi per paragraf, masing-masing dengan tombol dengar. */
export function MaterialContentCard({ content, title = "Materi" }: { content: string; title?: string }) {
  const tts = useTtsPlayer();
  return (
    <Card>
      <CardHeader
        icon={BookOpen}
        title={title}
        description="Tekan Dengar untuk mendengarkan tiap paragraf"
        action={<SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />}
        className="flex-wrap"
      />
      <CardBody>
        <ListenableParagraphs text={content} tts={tts} className="space-y-3 text-[15px] leading-relaxed text-slate-700" />
      </CardBody>
    </Card>
  );
}

/** Teks bacaan soal Reading untuk pratinjau guru/admin: judul, pilihan kecepatan, paragraf yang bisa didengar. */
export function ReadingPassagePreview({ title, passage, allowAudio = true }: { title?: string; passage: string; allowAudio?: boolean }) {
  const tts = useTtsPlayer();
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-3 text-xs text-slate-700 space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-sky-900">Teks Bacaan{title ? `: ${title}` : ""}</span>
        {allowAudio ? (
          <SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            <VolumeX className="size-3" /> Suara dimatikan untuk siswa
          </span>
        )}
      </div>
      <ListenableParagraphs text={passage} tts={tts} audio={allowAudio} className="space-y-1.5 leading-relaxed" />
    </div>
  );
}

/** Daftar kosakata English → Indonesia dengan tombol dengar untuk tiap kata Inggris. */
export function VocabularyCard({ vocab, title = "Kosakata" }: { vocab: { en: string; id: string }[]; title?: string }) {
  const tts = useTtsPlayer();
  return (
    <Card className="h-fit">
      <CardHeader icon={Languages} title={title} description="English → Indonesia" />
      <CardBody className="space-y-3">
        <SpeedToggle value={tts.speed} onChange={tts.setSpeed} accent="brand" />
        <ul className="divide-y divide-slate-100">
          {vocab.map((v, i) => {
            const key = `v${i}`;
            return (
              <li key={key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2">
                  <ListenButton playing={tts.playingKey === key} onClick={() => tts.toggle(key, v.en)} label="" />
                  <span className="font-bold text-ink">
                    <HighlightedText text={v.en} active={tts.playingKey === key ? tts.activeWord : -1} />
                  </span>
                </span>
                <span className="text-right text-sm text-slate-500">{v.id}</span>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
