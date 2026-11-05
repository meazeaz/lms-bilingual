"use client";

import { useState } from "react";
import { BookOpen, Check, Copy, Search, Volume2, X } from "lucide-react";
import { SUBJECT_GLOSSARIES, type SubjectGlossary, type GlossaryTerm } from "@/lib/glossary";
import { Button, Input, Pill } from "@/components/ui";

export function GlossaryModal({
  isOpen,
  onClose,
  defaultSubject,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}) {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    defaultSubject || SUBJECT_GLOSSARIES[0].subject
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentGlossary =
    SUBJECT_GLOSSARIES.find((g) => g.subject === selectedSubject) || SUBJECT_GLOSSARIES[0];

  const filteredTerms = currentGlossary.terms.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.term.toLowerCase().includes(q) ||
      t.translation.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.exampleSentence.toLowerCase().includes(q)
    );
  });

  const handleCopy = (term: GlossaryTerm) => {
    const textToCopy = `${term.term} (${term.translation}) - Example: "${term.exampleSentence}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTerm(term.term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-[32px] bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                  Glosarium 4 Mapel Bilingual
                </h3>
                <Pill tone="info">Bab 8.1 PDF</Pill>
              </div>
              <p className="text-xs text-slate-500">
                Koleksi kosakata istilah teknis resmi untuk RPP bilingual & bahan ajar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-ink transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Mapel & Search Bar */}
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECT_GLOSSARIES.map((g) => (
              <button
                key={g.subject}
                type="button"
                onClick={() => {
                  setSelectedSubject(g.subject);
                  setSearchQuery("");
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedSubject === g.subject
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder={`Cari istilah, terjemahan, atau kategori di mapel ${currentGlossary.label}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>
        </div>

        {/* List Kosakata */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ditemukan istilah untuk kata kunci &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredTerms.map((t) => (
                <div
                  key={t.term}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-ink">{t.term}</span>
                        {t.pronunciation && (
                          <span className="font-mono text-[11px] text-brand-600 font-semibold bg-brand-50 px-1.5 py-0.5 rounded-md">
                            {t.pronunciation}
                          </span>
                        )}
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                        {t.category}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      {t.translation}
                    </p>

                    <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-800 font-medium italic">
                        &ldquo;{t.exampleSentence}&rdquo;
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        &rarr; {t.exampleTranslation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopy(t)}
                      className="text-xs"
                    >
                      {copiedTerm === t.term ? (
                        <>
                          <Check className="size-3.5 text-mint-600" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-slate-500" /> Salin Istilah
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan {filteredTerms.length} dari {currentGlossary.terms.length} istilah ({currentGlossary.label})</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
