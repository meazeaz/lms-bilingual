"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Award,
  BookCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Key,
  Printer,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, LevelBadge, Pill } from "@/components/ui";

export function WrittenAssessmentBank({ logoUrl }: { logoUrl?: string } = {}) {
  const [activeLevel, setActiveLevel] = useState<"BRONZE" | "SILVER" | "GOLD">("BRONZE");
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ───────────── Toolbar Navigasi, Mode Kunci & Cetak (Disembunyikan saat cetak) ───────────── */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
          {/* Level Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Pilih Level Ujian:
            </span>
            {(["BRONZE", "SILVER", "GOLD"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                  activeLevel === lvl
                    ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-300"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <LevelBadge level={lvl} />
                <span>{lvl === "BRONZE" ? "Bronze (A2)" : lvl === "SILVER" ? "Silver (B1)" : "Gold (B2)"}</span>
              </button>
            ))}
          </div>

          {/* Mode Switcher & Cetak */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Mode Peserta vs Mode Asesor */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setShowAnswerKey(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  !showAnswerKey
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="size-3.5 text-slate-500" />
                <span>Naskah Ujian Polos</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAnswerKey(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  showAnswerKey
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <Key className="size-3.5" />
                <span>Kunci & Rubrik Asesor</span>
                {showAnswerKey && (
                  <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                    Aktif
                  </span>
                )}
              </button>
            </div>

            <Button type="button" variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="size-4" /> Cetak Naskah (PDF)
            </Button>
          </div>
        </div>

        {/* Banner Status Mode Kunci Jawaban */}
        {showAnswerKey ? (
          <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 shadow-xs text-emerald-950 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-950">
                    Mode Kunci Jawaban & Rubrik Asesor AKTIF · Level {activeLevel}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Jawaban benar ditandai dengan sorotan hijau langsung pada butir soal di bawah. Nilai dan pedoman skoring asesor tercantum lengkap.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="#rekap-kunci"
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <ChevronDown className="size-3.5" /> Rekap Nilai & Rubrik
                </a>
                <button
                  type="button"
                  onClick={() => setShowAnswerKey(false)}
                  className="rounded-xl bg-white/80 hover:bg-white text-emerald-900 border border-emerald-300 px-3 py-1.5 text-xs font-semibold shadow-xs transition"
                >
                  Tutup Kunci
                </button>
              </div>
            </div>

            {/* Quick Cheat Sheet Bar at the top */}
            <div className="rounded-xl bg-white/90 p-3 border border-emerald-200 text-xs space-y-1.5">
              <span className="font-black text-emerald-900 uppercase tracking-wider block text-[11px]">
                ⚡ Ringkasan Cepat Kunci Jawaban (Quick Reference):
              </span>
              {activeLevel === "BRONZE" && (
                <div className="grid gap-2 sm:grid-cols-3 font-mono text-[11px] text-slate-800">
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                    <strong>Part 1 (PG):</strong> 1.B · 2.B · 3.B · 4.A · 5.B · 6.A · 7.A · 8.B · 9.A · 10.A
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                    <strong>Part 2 (Match):</strong> 1&rarr;C · 2&rarr;E · 3&rarr;B · 4&rarr;A · 5&rarr;D
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                    <strong>Part 3 (Rumpang):</strong> 1.in · 2.in · 3.to · 4.raise · 5.with
                  </div>
                </div>
              )}
              {activeLevel === "SILVER" && (
                <div className="grid gap-2 sm:grid-cols-3 font-mono text-[11px] text-slate-800">
                  <div className="bg-sky-50/60 p-2 rounded-lg border border-sky-200">
                    <strong>Part 1 (PG):</strong> 1.B · 2.C · 3.B · 4.A · 5.A · 6.B · 7.B · 8.A · 9.A · 10.A
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-lg border border-sky-200">
                    <strong>Part 2 (Error):</strong> 1.to page · 2.anyone does not · 3.change · 4.discuss · 5.on
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-lg border border-sky-200">
                    <strong>Part 3 (Instruksi):</strong> 5 Skenario Komunikatif & Scaffolding
                  </div>
                </div>
              )}
              {activeLevel === "GOLD" && (
                <div className="grid gap-2 sm:grid-cols-2 font-mono text-[11px] text-slate-800">
                  <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-200">
                    <strong>Part 1 (Cloze 1-15):</strong> 1.medium 2.scaffolding 3.atmosphere 4.intake 5.attained 6.reluctant 7.alleviate 8.fluency 9.proactive 10.positive 11.core 12.articulate 13.collaborative 14.consistent 15.mastery
                  </div>
                  <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-200">
                    <strong>Part 2 (Esai):</strong> Rubrik 4 Aspek (@10p) · Pembebasan Ujian jika TOEFL &ge; 550
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-400" />
              <span>Saat ini menampilkan <strong>Naskah Soal Polos</strong> (tampilan ujian untuk peserta guru).</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAnswerKey(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
            >
              <Key className="size-3.5" /> Buka Kunci Jawaban & Rubrik Asesor
            </button>
          </div>
        )}
      </div>

      {/* ───────────── DOKUMEN NASKAH SOAL LEMBAR A4 RESMI ───────────── */}
      <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200 sm:p-10 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Kop Naskah Ujian Resmi */}
        <div className="border-b-2 border-slate-800 pb-5 flex items-center justify-between gap-4">
          {/* Logo Resmi Sekolah */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl || "/logo-almadany.png"}
            alt="Logo SMP IT Al Madany"
            className="size-16 object-contain shrink-0"
          />
          <div className="flex-1 text-center">
            <p className="font-serif text-sm font-semibold tracking-wider text-slate-700 uppercase">
              Yayasan Islamic Center Al Madany
            </p>
            <h2 className="font-serif text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              SMP IT AL MADANY
            </h2>
            <p className="font-serif text-xs text-slate-600 mt-0.5">
              English Development Team (EDT) · Program Akselerasi Bilingual 2026–2028
            </p>
            <div className="mt-2 inline-block rounded-xl border border-slate-800 px-4 py-1 text-xs font-black uppercase tracking-widest text-slate-900">
              Naskah Ujian Tertulis Asesmen Duta Guru · Level {activeLevel}
              {showAnswerKey && " (KUNCI & RUBRIK ASESOR)"}
            </div>
          </div>
          <div className="size-16 shrink-0 hidden sm:block" />
        </div>

        {/* Identitas Peserta Ujian */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs sm:grid-cols-4">
          <div>
            <span className="text-slate-400 block font-medium">Nama Guru Peserta:</span>
            <span className="font-bold text-slate-800 font-mono">...................................................</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Mata Pelajaran:</span>
            <span className="font-bold text-slate-800 font-mono">...................................................</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tanggal Ujian:</span>
            <span className="font-bold text-slate-800 font-mono">...... / ...... / 2026</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Waktu Pengerjaan:</span>
            <span className="font-bold text-slate-800 font-mono">
              {activeLevel === "BRONZE" ? "45 Menit" : activeLevel === "SILVER" ? "60 Menit" : "75 Menit"}
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            LEVEL BRONZE (A2)
        ═══════════════════════════════════════════════ */}
        {activeLevel === "BRONZE" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
              <strong>Petunjuk Bronze (Lampiran 1 Hal 37–39):</strong> Ujian terdiri dari 3 bagian: Pilihan Ganda (10 butir @4 poin), Menjodohkan (5 butir @6 poin), dan Melengkapi Kalimat Rumpang (5 butir @6 poin). Total skor maksimal = 100.
            </div>

            {/* Bagian 1: Pilihan Ganda */}
            <div className="space-y-5">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 1: Multiple Choice Questions (Classroom Routine & Instructions)</span>
                <span className="text-xs font-normal text-slate-500">10 Questions · 40 Points</span>
              </h4>

              <div className="space-y-4 text-xs">
                {/* Soal 1 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">1. When entering the classroom to start the lesson, the most natural greeting to say is:</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;Attention! Stop talking right now!&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;Good morning, class! How is everyone doing today?&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Salam pembuka yang hangat & membangun iklim kelas positif (Classroom Climate).
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Open your book now without sound.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Why are you all sitting there?&rdquo;</p>
                  </div>
                </div>

                {/* Soal 2 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">2. To instruct students to open their textbook to page 45, the teacher should say:</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;Open page on forty-five book.&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;Please open your textbooks to page forty-five.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Kolokasi instruksi standar &ldquo;open (textbooks) to page (number)&rdquo;.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Make your book forty-five open.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Read forty-five page right now.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 3 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">3. When a student speaks too quietly, what is the best phrase to request repetition politely?</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;What? I cannot hear anything!&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;Could you please speak a little louder, Ahmad?&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Politeness marker &ldquo;Could you please...&rdquo; menjaga afeksi dan kepercayaan diri siswa.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Scream your answer please!&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Your voice is bad today.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 4 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">4. To check whether all students understand the explanation before moving on (CFU):</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Does everyone understand, or do you have any questions?&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Checking For Understanding (CFU) formal, terbuka, dan mempersilakan pertanyaan.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;You understand or no?&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Nobody ask questions okay.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Is it clear or dirty?&rdquo;</p>
                  </div>
                </div>

                {/* Soal 5 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">5. When dividing the class into groups of four students:</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;Please divide yourself into four groups each.&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;Please form groups of four students each.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Idiom instruksi kelas alami &ldquo;form groups of [number]&rdquo;.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Make four people inside your group.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Sit four four together.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 6 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">6. A student arrives late to class and knocks. The teacher responds:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Come in, please have a seat and catch up with page 12.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Manajemen kelas disiplin positif tanpa menghentikan alur pelajaran.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Why you late again? Go out!&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Stand up behind the door.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Enter inside quickly.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 7 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">7. To give praise to a student who answers a question correctly:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Excellent job! That is a very accurate answer.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Specific praise & reinforcement positif sesuai standar pedagogik bilingual.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;You are not stupid.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Finally you get it right.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Good, sit down immediately.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 8 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">8. To tell students that time is up for the group discussion:</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;Finish now, no more time!&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;Time is up, everyone. Please put your pens down and look at the whiteboard.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Transisi teratur dengan instruksi kinestetik yang jelas (&ldquo;put pens down&rdquo;).
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Stop your life and listen to me.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Close your mouth right now.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 9 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">9. When closing the lesson and giving homework for next Tuesday:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;For next Tuesday, please complete exercises 1 to 5 on page 30.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Struktur kalimat penugasan runtut: tenggat waktu &rarr; nomor soal &rarr; halaman buku.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Work house page 30 next Tuesday.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Don&apos;t forget your home task on 30 Tuesday.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Do page 30 or you get zero.&rdquo;</p>
                  </div>
                </div>

                {/* Soal 10 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">10. Wishing students a good day at the end of class:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Thank you for your active participation, see you all on Thursday! Have a great day.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Penutup yang santun, mengapresiasi partisipasi siswa, dan menegaskan jadwal pertemuan berikutnya.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Okay class is dead, go home.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Bye bye see you whenever.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Get out from my class now.&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Menjodohkan */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 2: Matching Classroom Scenarios to Proper English Instructions</span>
                <span className="text-xs font-normal text-slate-500">5 Pairs · 30 Points</span>
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider">Situasi di Kelas:</span>
                  
                  <div className="space-y-1">
                    <p><strong>[ 1 ]</strong> Kelas gaduh saat guru hendak memulai penjelasan materi.</p>
                    {showAnswerKey && (
                      <p className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="size-3.5" /> Pasangan Benar: (C) &ldquo;May I have everyone&apos;s attention...&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p><strong>[ 2 ]</strong> Siswa diminta menempelkan hasil karya kelompok di dinding kelas.</p>
                    {showAnswerKey && (
                      <p className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="size-3.5" /> Pasangan Benar: (E) &ldquo;Please stick your group poster...&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p><strong>[ 3 ]</strong> Guru meminta siswa mengumpulkan lembar jawaban ulangan ke depan meja.</p>
                    {showAnswerKey && (
                      <p className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="size-3.5" /> Pasangan Benar: (B) &ldquo;Please pass your test sheets forward...&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p><strong>[ 4 ]</strong> Siswa tampak ragu-ragu dan takut salah saat hendak menjawab.</p>
                    {showAnswerKey && (
                      <p className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="size-3.5" /> Pasangan Benar: (A) &ldquo;Don&apos;t worry about making mistakes...&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p><strong>[ 5 ]</strong> Guru meminta salah satu siswa memimpin doa penutup.</p>
                    {showAnswerKey && (
                      <p className="text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="size-3.5" /> Pasangan Benar: (D) &ldquo;Faris, could you please lead the closing prayer?&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider">Pilihan Frasa Instruksi (A – E):</span>
                  <p className="p-1"><strong>(A)</strong> &ldquo;Don&apos;t worry about making mistakes; give it a try!&rdquo;</p>
                  <p className="p-1"><strong>(B)</strong> &ldquo;Please pass your test sheets forward to the front table.&rdquo;</p>
                  <p className="p-1"><strong>(C)</strong> &ldquo;May I have everyone&apos;s attention, please? Let&apos;s focus.&rdquo;</p>
                  <p className="p-1"><strong>(D)</strong> &ldquo;Faris, could you please lead the closing prayer?&rdquo;</p>
                  <p className="p-1"><strong>(E)</strong> &ldquo;Please stick your group poster on the back wall gallery.&rdquo;</p>
                </div>
              </div>
            </div>

            {/* Bagian 3: Melengkapi Kalimat Rumpang */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 3: Fill in the Blanks (Prepositions & Action Verbs)</span>
                <span className="text-xs font-normal text-slate-500">5 Items · 30 Points</span>
              </h4>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className={`p-2.5 rounded-xl ${showAnswerKey ? "bg-emerald-50/50 border border-emerald-200" : ""}`}>
                  <p>
                    1. Please write down the summary{" "}
                    {showAnswerKey ? (
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-black">[ in &check; ]</strong>
                    ) : (
                      <span className="font-mono text-slate-400">....................</span>
                    )}{" "}
                    your notebook. <em>(in / on / at)</em>
                  </p>
                  {showAnswerKey && <p className="text-[11px] text-emerald-800 mt-1 italic pl-4">&rarr; Preposisi &lsquo;in&rsquo; untuk isi tulisan di dalam buku catatan.</p>}
                </div>

                <div className={`p-2.5 rounded-xl ${showAnswerKey ? "bg-emerald-50/50 border border-emerald-200" : ""}`}>
                  <p>
                    2. Don&apos;t forget to turn{" "}
                    {showAnswerKey ? (
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-black">[ in &check; ]</strong>
                    ) : (
                      <span className="font-mono text-slate-400">....................</span>
                    )}{" "}
                    your worksheets before leaving the classroom. <em>(in / out / off)</em>
                  </p>
                  {showAnswerKey && <p className="text-[11px] text-emerald-800 mt-1 italic pl-4">&rarr; Phrasal verb &lsquo;turn in&rsquo; bermakna mengumpulkan/menyerahkan tugas.</p>}
                </div>

                <div className={`p-2.5 rounded-xl ${showAnswerKey ? "bg-emerald-50/50 border border-emerald-200" : ""}`}>
                  <p>
                    3. Let&apos;s listen{" "}
                    {showAnswerKey ? (
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-black">[ to &check; ]</strong>
                    ) : (
                      <span className="font-mono text-slate-400">....................</span>
                    )}{" "}
                    the audio recording carefully. <em>(to / at / on)</em>
                  </p>
                  {showAnswerKey && <p className="text-[11px] text-emerald-800 mt-1 italic pl-4">&rarr; Kata kerja &lsquo;listen&rsquo; wajib berpasangan dengan preposisi &lsquo;to&rsquo;.</p>}
                </div>

                <div className={`p-2.5 rounded-xl ${showAnswerKey ? "bg-emerald-50/50 border border-emerald-200" : ""}`}>
                  <p>
                    4. Please{" "}
                    {showAnswerKey ? (
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-black">[ raise &check; ]</strong>
                    ) : (
                      <span className="font-mono text-slate-400">....................</span>
                    )}{" "}
                    your hands if you want to answer the question. <em>(rise / raise / lift)</em>
                  </p>
                  {showAnswerKey && <p className="text-[11px] text-emerald-800 mt-1 italic pl-4">&rarr; &lsquo;Raise&rsquo; adalah kata kerja transitif (mengangkat tangan); sedangkan &lsquo;rise&rsquo; intransitif.</p>}
                </div>

                <div className={`p-2.5 rounded-xl ${showAnswerKey ? "bg-emerald-50/50 border border-emerald-200" : ""}`}>
                  <p>
                    5. Work together{" "}
                    {showAnswerKey ? (
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-black">[ with &check; ]</strong>
                    ) : (
                      <span className="font-mono text-slate-400">....................</span>
                    )}{" "}
                    your partner sitting next to you. <em>(with / by / to)</em>
                  </p>
                  {showAnswerKey && <p className="text-[11px] text-emerald-800 mt-1 italic pl-4">&rarr; Kolokasi kerja sama &lsquo;work together with (someone)&rsquo;.</p>}
                </div>
              </div>
            </div>

            {/* Rekapitulasi Kunci Jawaban & Rubrik Bronze */}
            {showAnswerKey && (
              <div id="rekap-kunci" className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span>Kunci Jawaban Resmi & Rubrik Penilaian Asesor · Level Bronze (A2)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Part 1 (PG · 10 &times; 4p = 40 Poin):
                    </span>
                    <p className="text-slate-800 font-mono font-semibold">1. B · 2. B · 3. B · 4. A · 5. B</p>
                    <p className="text-slate-800 font-mono font-semibold">6. A · 7. A · 8. B · 9. A · 10. A</p>
                    <p className="text-[11px] text-slate-500 mt-1">Tiap jawaban benar = 4 poin. Salah/kosong = 0 poin.</p>
                  </div>
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Part 2 (Menjodohkan · 5 &times; 6p = 30 Poin):
                    </span>
                    <p className="text-slate-800 font-mono font-semibold">1 &rarr; C (Attention)</p>
                    <p className="text-slate-800 font-mono font-semibold">2 &rarr; E (Poster wall)</p>
                    <p className="text-slate-800 font-mono font-semibold">3 &rarr; B (Pass sheets)</p>
                    <p className="text-slate-800 font-mono font-semibold">4 &rarr; A (Don&apos;t worry)</p>
                    <p className="text-slate-800 font-mono font-semibold">5 &rarr; D (Lead prayer)</p>
                  </div>
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Part 3 (Rumpang · 5 &times; 6p = 30 Poin):
                    </span>
                    <p className="text-slate-800 font-mono font-semibold">1. in (in notebook)</p>
                    <p className="text-slate-800 font-mono font-semibold">2. in (turn in)</p>
                    <p className="text-slate-800 font-mono font-semibold">3. to (listen to)</p>
                    <p className="text-slate-800 font-mono font-semibold">4. raise (raise hand)</p>
                    <p className="text-slate-800 font-mono font-semibold">5. with (together with)</p>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-100/60 p-3 text-[11px] text-emerald-900 flex items-center justify-between">
                  <span><strong>Total Skor Maksimal:</strong> 100 Poin · Bobot Ujian Tertulis dalam Asesmen Duta = <strong>30%</strong> (Bab 6.2).</span>
                  <span className="font-bold">Passing Grade Bronze: Nilai Akhir &ge; 70</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            LEVEL SILVER (B1)
        ═══════════════════════════════════════════════ */}
        {activeLevel === "SILVER" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl bg-sky-50 p-3.5 border border-sky-200 text-xs text-sky-900">
              <strong>Petunjuk Silver (Lampiran 1 Hal 40–42):</strong> Ujian terdiri dari: Pilihan Ganda Pedagogik Bilingual (10 butir @4 poin), Error Identification & Correction (5 butir @6 poin), dan Penyusunan Instruksi Pembelajaran Kontekstual (5 butir @6 poin). Total skor maksimal = 100.
            </div>

            {/* Bagian 1: Pilihan Ganda Silver */}
            <div className="space-y-5">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 1: Pedagogical Classroom English & Scaffolding</span>
                <span className="text-xs font-normal text-slate-500">10 Questions · 40 Points</span>
              </h4>

              <div className="space-y-4 text-xs">
                {/* Silver Soal 1 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">1. When introducing a complex science concept in English, what is the best scaffolding technique?</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. Translate every sentence into Indonesian immediately after speaking.</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. Use visual aids, gestures, and relatable analogies before checking comprehension.</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Scaffolding multimodal (visual, kinestetik, analogi) mendukung pemahaman konseptual tanpa ketergantungan penerjemahan kata-per-kata.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. Speak faster so students get used to native speaker speeds.</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. Punish students who fail to grasp the English vocabulary.</p>
                  </div>
                </div>

                {/* Silver Soal 2 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">2. Which of the following is the most effective Checking for Understanding (CFU) question?</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;Do you understand?&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Is it clear?&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>C. &ldquo;Sarah, in your own words, what is the difference between photosynthesis and respiration?&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (C)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Pertanyaan terbuka mengharuskan siswa memparafrasekan konsep (&ldquo;in your own words&rdquo;), membuktikan pemahaman sejati.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Are you sure?&rdquo;</p>
                  </div>
                </div>

                {/* Silver Soal 3 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">3. When a student answers with a grammatical flaw but the idea is clear, what should the teacher do?</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. Stop the student mid-sentence and make them repeat the grammar rule.</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. Acknowledge and validate the meaning first, then gently recast the phrase correctly.</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Validasi isi dahulu untuk menjaga motivasi komunikasi, dilanjutkan teknik <em>recasting</em> tanpa mencela.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. Ignore the answer completely and ask someone else.</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. Give a penalty point for bad grammar.</p>
                  </div>
                </div>

                {/* Silver Soal 4 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">4. &ldquo;Recasting&rdquo; in bilingual teaching means:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. Reformulating the student&apos;s erroneous utterance correctly without explicitly criticizing it.</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Definisi ilmiah <em>recasting</em>: mengulang ucapan siswa dalam bentuk tata bahasa yang tepat secara halus.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. Making students write the correct sentence 100 times.</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. Casting students into English drama roles.</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. Translating the entire lesson into English subtitles.</p>
                  </div>
                </div>

                {/* Silver Soal 5 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">5. To manage a group discussion where only one student dominates speaking:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Thank you, Budi. That&apos;s a great point. Now, let&apos;s hear what Siti thinks about this topic.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Memfasilitasi giliran bicara yang setara (turn-taking) secara apresiatif dan tegas.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Budi, be quiet now!&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Why are the rest of you sleeping?&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Stop the discussion right now.&rdquo;</p>
                  </div>
                </div>

                {/* Silver Soal 6 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">6. Which sentence demonstrates correct use of conditional type 1 / scientific fact?</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. &ldquo;If water reaches 100 degrees, it would boil.&rdquo;</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. &ldquo;If you heat ice, it melts into liquid water.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Zero/Type 1 Conditional ilmiah yang akurat: If + present simple &rarr; present simple.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;If we will mix these solutions, gas will release.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;If you heated ice, it would melted.&rdquo;</p>
                  </div>
                </div>

                {/* Silver Soal 7 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">7. The primary objective of the &ldquo;Active Zone&rdquo; policy at SMP IT Al Madany is:</p>
                  <div className="space-y-1.5 pl-4">
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>A. Testing student TOEFL scores daily.</p>
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>B. Maximizing authentic English immersion during the main instructional time.</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (B)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Sesuai Dokumen Master Bab 2.1: Active Zone adalah zona imersi bahasa Inggris intensif saat pembelajaran inti.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. Forbidding all Indonesian language forever.</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. Making teachers speak English without lesson plans.</p>
                  </div>
                </div>

                {/* Silver Soal 8 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">8. To transition from individual work to peer pair-check:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;Now, turn to your partner and compare your answers for question 3.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Instruksi transisi yang lugas, terfokus pada target butir soal yang spesifik.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Cheating is allowed now with your neighbor.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Look at your friend&apos;s book immediately.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Change your table right now.&rdquo;</p>
                  </div>
                </div>

                {/* Silver Soal 9 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">9. Which phrase expresses a clear formative assessment instruction?</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;On your mini-whiteboards, write the final result of the equation and show it on count of three.&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Teknik asesmen formatif <em>all-response system</em> (mini-whiteboard) yang transparan dan simultan.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;Write math now on paper.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Who knows math raise your hand.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Calculate fast without thinking.&rdquo;</p>
                  </div>
                </div>

                {/* Silver Soal 10 */}
                <div className={`space-y-1.5 rounded-xl p-3 transition ${showAnswerKey ? "bg-slate-50/80 border border-slate-200" : ""}`}>
                  <p className="font-semibold text-slate-800">10. To encourage critical thinking when a student asks a direct question:</p>
                  <div className="space-y-1.5 pl-4">
                    <div className={`p-2 rounded-xl transition ${showAnswerKey ? "bg-emerald-50 border-2 border-emerald-400 font-bold text-emerald-950 shadow-xs" : "text-slate-600"}`}>
                      <div className="flex items-center justify-between">
                        <span>A. &ldquo;That&apos;s an insightful question. What do you think might happen based on our previous experiment?&rdquo;</span>
                        {showAnswerKey && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Check className="size-3" /> Kunci (A)
                          </span>
                        )}
                      </div>
                      {showAnswerKey && (
                        <p className="text-[11px] font-normal text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                          <strong>Penjelasan Asesor:</strong> Menjawab dengan pertanyaan pemantik (inquiry-based probing) untuk merangsang nalar kritis siswa.
                        </p>
                      )}
                    </div>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>B. &ldquo;I already told you yesterday, why did you forget?&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>C. &ldquo;Go read Google right now.&rdquo;</p>
                    <p className={`p-1.5 rounded-lg ${showAnswerKey ? "text-slate-400" : "text-slate-600"}`}>D. &ldquo;Don&apos;t ask questions during lesson.&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Error Identification */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 2: Error Identification & Correction</span>
                <span className="text-xs font-normal text-slate-500">5 Items · 30 Points</span>
              </h4>

              <div className="space-y-4 text-xs leading-relaxed">
                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p><strong>1. Kalimat salah:</strong> &ldquo;Please to open your workbook at page thirty.&rdquo;</p>
                  {showAnswerKey ? (
                    <div className="mt-2 pl-4 space-y-1">
                      <p className="text-emerald-900 font-bold">
                        &rarr; Perbaikan Asesor: &ldquo;Please open your workbook to page thirty.&rdquo;
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        <em>Aturan Tata Bahasa:</em> Hilangkan partikel &lsquo;to&rsquo; setelah kata imperatif &lsquo;please&rsquo;. Preposisi penunjuk halaman buku yang tepat adalah &lsquo;to page&rsquo;, bukan &lsquo;at page&rsquo;.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Perbaikan: ....................................................................................................</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p><strong>2. Kalimat salah:</strong> &ldquo;Anybody don&apos;t have pencil please borrow from teacher.&rdquo;</p>
                  {showAnswerKey ? (
                    <div className="mt-2 pl-4 space-y-1">
                      <p className="text-emerald-900 font-bold">
                        &rarr; Perbaikan Asesor: &ldquo;If anyone does not have a pencil, please borrow one from me / the teacher.&rdquo;
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        <em>Aturan Tata Bahasa:</em> Subjek tak tentu &lsquo;anyone&rsquo; adalah tunggal (menggunakan &lsquo;does not have&rsquo; bukan &lsquo;don&apos;t have&rsquo;). Struktur klausa kondisional &lsquo;If...&rsquo; diperlukan untuk kejelasan makna.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Perbaikan: ....................................................................................................</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p><strong>3. Kalimat salah:</strong> &ldquo;How does the water changes into ice when temperature drops?&rdquo;</p>
                  {showAnswerKey ? (
                    <div className="mt-2 pl-4 space-y-1">
                      <p className="text-emerald-900 font-bold">
                        &rarr; Perbaikan Asesor: &ldquo;How does water change into ice when the temperature drops?&rdquo;
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        <em>Aturan Tata Bahasa:</em> Setelah kata kerja bantu &lsquo;does&rsquo;, verba utama kembali ke bentuk dasar/infinitive (&lsquo;change&rsquo;). &lsquo;Water&rsquo; sebagai zat cair umum tidak memerlukan definite article &lsquo;the&rsquo;.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Perbaikan: ....................................................................................................</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p><strong>4. Kalimat salah:</strong> &ldquo;Let&apos;s discuss about this topic together with our group.&rdquo;</p>
                  {showAnswerKey ? (
                    <div className="mt-2 pl-4 space-y-1">
                      <p className="text-emerald-900 font-bold">
                        &rarr; Perbaikan Asesor: &ldquo;Let&apos;s discuss this topic together in our groups.&rdquo;
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        <em>Aturan Tata Bahasa:</em> Kata kerja &lsquo;discuss&rsquo; adalah transitif langsung dan tidak memerlukan preposisi &lsquo;about&rsquo;.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Perbaikan: ....................................................................................................</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p><strong>5. Kalimat salah:</strong> &ldquo;Look at the picture in the whiteboard carefully.&rdquo;</p>
                  {showAnswerKey ? (
                    <div className="mt-2 pl-4 space-y-1">
                      <p className="text-emerald-900 font-bold">
                        &rarr; Perbaikan Asesor: &ldquo;Look at the picture on the whiteboard carefully.&rdquo;
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        <em>Aturan Tata Bahasa:</em> Papan tulis merupakan bidang permukaan datar sehingga preposisi ruang yang tepat adalah &lsquo;on&rsquo;, bukan &lsquo;in&rsquo;.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Perbaikan: ....................................................................................................</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bagian 3: Kalimat Instruksi Kontekstual */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 3: Drafting Contextual Classroom Instructions</span>
                <span className="text-xs font-normal text-slate-500">5 Scenarios · 30 Points</span>
              </h4>

              <div className="space-y-4 text-xs leading-relaxed">
                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p>1. <strong>Skenario:</strong> Instruksikan siswa untuk berpasangan, mendiskusikan topik selama 3 menit, lalu bersiap mempresentasikan 1 kesimpulan.</p>
                  {showAnswerKey ? (
                    <p className="text-emerald-900 font-bold mt-2 pl-4 bg-emerald-100/60 p-2 rounded-lg">
                      &check; <strong>Contoh Jawaban Ideal Asesor:</strong> &ldquo;Please pair up with the person sitting next to you. You have three minutes to discuss the topic, and then be ready to share one main conclusion with the whole class.&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Tuliskan kalimat instruksi bahasa Inggris Anda di sini.</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p>2. <strong>Skenario:</strong> Instruksikan siswa membersihkan meja dari buku lain dan hanya menyisakan satu lembar kertas ulangan dan pulpen.</p>
                  {showAnswerKey ? (
                    <p className="text-emerald-900 font-bold mt-2 pl-4 bg-emerald-100/60 p-2 rounded-lg">
                      &check; <strong>Contoh Jawaban Ideal Asesor:</strong> &ldquo;Please clear your desks completely, everyone. Keep only one test sheet and a pen or pencil on the table.&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Tuliskan kalimat instruksi bahasa Inggris Anda di sini.</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p>3. <strong>Skenario:</strong> Berikan umpan balik positif sekaligus koreksi lembut terhadap siswa yang menjawab namun suaranya terlalu kecil.</p>
                  {showAnswerKey ? (
                    <p className="text-emerald-900 font-bold mt-2 pl-4 bg-emerald-100/60 p-2 rounded-lg">
                      &check; <strong>Contoh Jawaban Ideal Asesor:</strong> &ldquo;Excellent thinking, Farhan! That is a very accurate point. Could you say that once more with a louder voice so your friends at the back can hear clearly?&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Tuliskan kalimat instruksi bahasa Inggris Anda di sini.</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p>4. <strong>Skenario:</strong> Instruksikan siswa memeriksa jawaban temannya menggunakan kunci jawaban di proyektor tanpa mencoret kertas.</p>
                  {showAnswerKey ? (
                    <p className="text-emerald-900 font-bold mt-2 pl-4 bg-emerald-100/60 p-2 rounded-lg">
                      &check; <strong>Contoh Jawaban Ideal Asesor:</strong> &ldquo;Now swap your worksheets with your partner. Check their answers against the master key on the projector screen, but please do not write or make any marks on their paper.&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Tuliskan kalimat instruksi bahasa Inggris Anda di sini.</p>
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${showAnswerKey ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <p>5. <strong>Skenario:</strong> Tutup pembelajaran dengan mengingatkan deadline pengumpulan tugas portofolio di LMS sebelum jam 8 malam.</p>
                  {showAnswerKey ? (
                    <p className="text-emerald-900 font-bold mt-2 pl-4 bg-emerald-100/60 p-2 rounded-lg">
                      &check; <strong>Contoh Jawaban Ideal Asesor:</strong> &ldquo;That brings us to the end of today&apos;s session! Don&apos;t forget that your portfolio assignment is due on the LMS tonight before 8:00 PM. Have a wonderful day, everyone!&rdquo;
                    </p>
                  ) : (
                    <p className="text-slate-500 italic pl-4 mt-1">&rarr; Tuliskan kalimat instruksi bahasa Inggris Anda di sini.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rekapitulasi Kunci Jawaban & Rubrik Silver */}
            {showAnswerKey && (
              <div id="rekap-kunci" className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span>Kunci Jawaban Resmi & Rubrik Penilaian Asesor · Level Silver (B1)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Part 1 (PG · 10 &times; 4p = 40 Poin):
                    </span>
                    <p className="text-slate-800 font-mono font-semibold">1. B · 2. C · 3. B · 4. A · 5. A</p>
                    <p className="text-slate-800 font-mono font-semibold">6. B · 7. B · 8. A · 9. A · 10. A</p>
                    <p className="text-[11px] text-slate-500 mt-1">Pedoman penilaian: 4 poin per butir benar. Fokus pada pemahaman pedagogik scaffolding dan Active Zone.</p>
                  </div>
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Part 2 & 3 (Koreksi & Instruksi · 10 &times; 6p = 60 Poin):
                    </span>
                    <p className="text-slate-700"><strong>Part 2 (Error):</strong> Skor 6 jika kesalahan tata bahasa diperbaiki secara akurat & tepat makna. Skor 3 jika perbaikan sebagian. Skor 0 jika salah total.</p>
                    <p className="text-slate-700"><strong>Part 3 (Instruksi):</strong> Skor 6 jika kalimat natural, sopan, tata bahasa benar, dan instruktif. Skor 4 jika ada sedikit kekakuan namun dapat dipahami.</p>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-100/60 p-3 text-[11px] text-emerald-900 flex items-center justify-between">
                  <span><strong>Total Skor Maksimal:</strong> 100 Poin · Bobot Ujian Tertulis dalam Asesmen Duta = <strong>30%</strong> (Bab 6.2).</span>
                  <span className="font-bold">Passing Grade Silver: Nilai Akhir &ge; 75</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            LEVEL GOLD (B2)
        ═══════════════════════════════════════════════ */}
        {activeLevel === "GOLD" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl bg-purple-50 p-4 border border-purple-200 text-xs text-purple-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-950">
                <ShieldCheck className="size-4 text-purple-700" />
                <span>Ketentuan Khusus Level Gold (Lampiran 1 Hal 42–43 & Bab 6.1):</span>
              </div>
              <p>
                Guru dengan skor sertifikat resmi <strong>TOEFL ITP &ge; 550</strong> otomatis dibebaskan dari ujian tertulis ini dan memperoleh nilai <strong>100</strong> secara sah. Bagi peserta reguler, ujian terdiri dari: Cloze Test Wacana Pedagogik Bilingual (15 butir @4 poin = 60) dan Penulisan Esai Reflektif Pedagogik (150–250 kata, bobot 40 poin).
              </p>
            </div>

            {/* Bagian 1: Cloze Test */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 1: Cloze Passage (Pedagogical Bilingual Immersion)</span>
                <span className="text-xs font-normal text-slate-500">15 Blank Items · 60 Points</span>
              </h4>

              {/* Text 1 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs leading-relaxed text-slate-800">
                <span className="font-bold text-slate-900 block">Text 1: Content and Language Integrated Learning (CLIL) in Secondary Education</span>
                <p>
                  Content and Language Integrated Learning (CLIL) represents an educational approach in which an additional language is used for the learning and teaching of both content and language. In junior high school settings like SMP IT Al Madany, the primary purpose is not merely to teach grammar rules, but rather to use English as a functional{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(1) [ &check; medium ]</strong>
                  ) : (
                    <strong>(1) [medium / barrier / test]</strong>
                  )}{" "}
                  of learning. Consequently, subject teachers are expected to provide meaningful{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(2) [ &check; scaffolding ]</strong>
                  ) : (
                    <strong>(2) [scaffolding / obstruction / denial]</strong>
                  )}{" "}
                  to bridge the linguistic gap between students&apos; current proficiency and academic content.
                </p>
                <p>
                  When introducing complex concepts, teachers should employ multi-modal delivery methods, combining visual diagrams with verbal explanations. Furthermore, creating a low-anxiety{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(3) [ &check; atmosphere ]</strong>
                  ) : (
                    <strong>(3) [atmosphere / pressure / deadline]</strong>
                  )}{" "}
                  is paramount. When students feel psychologically safe, their affective filter remains low, allowing for greater linguistic{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(4) [ &check; intake ]</strong>
                  ) : (
                    <strong>(4) [intake / rejection / suppression]</strong>
                  )}
                  . Regular formative assessments, such as quick check-ins and peer discussions, provide immediate feedback on whether comprehension has been{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(5) [ &check; attained ]</strong>
                  ) : (
                    <strong>(5) [attained / delayed / dismissed]</strong>
                  )}{" "}
                  before advancing to higher-order analytical tasks.
                </p>
              </div>

              {/* Text 2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs leading-relaxed text-slate-800">
                <span className="font-bold text-slate-900 block">Text 2: Overcoming Foreign Language Speaking Anxiety in Non-English Subjects</span>
                <p>
                  One of the most persistent hurdles in establishing a bilingual school ecosystem is student hesitation to speak up in front of their peers. Often, students possess adequate receptive vocabulary but remain{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(6) [ &check; reluctant ]</strong>
                  ) : (
                    <strong>(6) [reluctant / eager / delighted]</strong>
                  )}{" "}
                  to participate orally due to fear of negative evaluation. Teachers who adopt a &ldquo;communication over perfection&rdquo; mindset can significantly{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(7) [ &check; alleviate ]</strong>
                  ) : (
                    <strong>(7) [alleviate / aggravate / increase]</strong>
                  )}{" "}
                  this apprehension.
                </p>
                <p>
                  Rather than publicly interrupting students to correct minor pronunciation slips, experienced educators utilize recasting or note recurring patterns for subsequent group mini-drills. By focusing primarily on meaning and conversational{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(8) [ &check; fluency ]</strong>
                  ) : (
                    <strong>(8) [fluency / stiffness / prohibition]</strong>
                  )}
                  , teachers nurture confident communicators capable of navigating global academic standards with a{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(9) [ &check; proactive ]</strong>
                  ) : (
                    <strong>(9) [proactive / dismissive / hesitant]</strong>
                  )}{" "}
                  disposition and{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(10) [ &check; positive ]</strong>
                  ) : (
                    <strong>(10) [positive / harsh / punitive]</strong>
                  )}{" "}
                  reinforcement.
                </p>
              </div>

              {/* Text 3 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs leading-relaxed text-slate-800">
                <span className="font-bold text-slate-900 block">Text 3: Integrating Islamic Values and Global Mindset at SMP IT Al Madany</span>
                <p>
                  Bilingual education at SMP IT Al Madany is rooted in Islamic values, where language mastery serves as an integral{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(11) [ &check; core ]</strong>
                  ) : (
                    <strong>(11) [core / peripheral / accidental]</strong>
                  )}{" "}
                  of character building and dakwah. Through bilingual immersion, educators empower students to confidently{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(12) [ &check; articulate ]</strong>
                  ) : (
                    <strong>(12) [articulate / silence / abandon]</strong>
                  )}{" "}
                  Islamic ethics and scientific discoveries in international forums.
                </p>
                <p>
                  Teachers must model{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(13) [ &check; collaborative ]</strong>
                  ) : (
                    <strong>(13) [collaborative / solitary / isolated]</strong>
                  )}{" "}
                  inquiry, creating spaces where students practice critical thinking through mutual respect. By offering{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(14) [ &check; consistent ]</strong>
                  ) : (
                    <strong>(14) [consistent / random / sporadic]</strong>
                  )}{" "}
                  guidance and high-expectation encouragement, our school nurtures future leaders with high communicative{" "}
                  {showAnswerKey ? (
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black font-mono">(15) [ &check; mastery ]</strong>
                  ) : (
                    <strong>(15) [mastery / abandonment / confusion]</strong>
                  )}{" "}
                  who are steadfast in their faith and ready to contribute to global civilization.
                </p>
              </div>
            </div>

            {/* Bagian 2: Esai Reflektif Guru Bilingual */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Part 2: Reflective Essay Writing (150–250 Words)</span>
                <span className="text-xs font-normal text-slate-500">Essay Task · 40 Points</span>
              </h4>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                <p className="font-bold text-slate-900">
                  Topic Prompt:
                </p>
                <p className="text-slate-700 italic leading-relaxed">
                  &ldquo;As a Gold Ambassador candidate teaching a non-English subject at SMP IT Al Madany, what strategic methods will you implement to maintain 70% to 100% English instructional exposure without sacrificing students&apos; deep understanding of your subject matter? Discuss at least two practical strategies and one method for supporting struggling learners.&rdquo;
                </p>

                {showAnswerKey ? (
                  <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200 text-xs space-y-3 text-emerald-950">
                    <span className="font-bold text-emerald-900 block text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Pedoman Penilaian & Poin Wajib Esai Calon Duta Gold:
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-emerald-200">
                        <strong>1. Strategi Scaffolding Visual & Konseptual:</strong> Calon harus menyebutkan penggunaan graphic organizers, diagram alir dwibahasa, atau demonstrasi kontekstual.
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-200">
                        <strong>2. Formula Active Zone 80-20:</strong> Penjelasan bagaimana guru menjaga instruksi utama dalam bahasa Inggris dengan micro-checks terstruktur.
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-200">
                        <strong>3. Pendampingan Siswa Tertinggal:</strong> Solusi nyata seperti peer-tutoring buddy system, bilingual word-wall, dan low-stakes verbal prompts.
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-200">
                        <strong>4. Integrasi Nilai Islam:</strong> Sikap sabar (hilm) dan adab berbicara yang santun selama proses pembelajaran bilingual.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <span className="font-bold text-slate-700 block">Rubrik Penilaian Asesor (Bobot @25%):</span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div>1. Content & Practicality (10 poin)</div>
                      <div>2. Organization & Cohesion (10 poin)</div>
                      <div>3. Vocabulary & Terminology (10 poin)</div>
                      <div>4. Grammatical Range & Accuracy (10 poin)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rekapitulasi Kunci Jawaban & Rubrik Gold */}
            {showAnswerKey && (
              <div id="rekap-kunci" className="rounded-2xl border-2 border-purple-500 bg-purple-50/70 p-5 space-y-4">
                <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                  <CheckCircle2 className="size-5 text-purple-700" />
                  <span>Kunci Jawaban Resmi Cloze Test & Rubrik Skoring Asesor · Level Gold (B2)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-white p-3.5 border border-purple-200 space-y-2 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Kunci Cloze Test (15 butir &times; 4p = 60 Poin):
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-slate-800">
                      <p><strong>Text 1:</strong> 1. medium · 2. scaffolding · 3. atmosphere · 4. intake · 5. attained</p>
                      <p><strong>Text 2:</strong> 6. reluctant · 7. alleviate · 8. fluency · 9. proactive · 10. positive</p>
                      <p><strong>Text 3:</strong> 11. core · 12. articulate · 13. collaborative · 14. consistent · 15. mastery</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3.5 border border-purple-200 space-y-2 shadow-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      Rentang Nilai Esai Asesor (Skor 0–40):
                    </span>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <p><strong>35–40 Poin (Istimewa):</strong> Argumentasi pedagogik solid, struktur bahasa Inggris akademik formal, terminologi subjek akurat.</p>
                      <p><strong>28–34 Poin (Baik):</strong> Gagasan jelas, strategi realistis, sedikit kekurangan variasi kata hubung.</p>
                      <p><strong>&lt; 28 Poin (Kurang):</strong> Ide terlalu umum tanpa strategi konkret, memerlukan pembinaan lanjutan.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-purple-100/60 p-3 text-[11px] text-purple-900 flex items-center justify-between">
                  <span><strong>Total Skor Maksimal:</strong> 100 Poin (Cloze 60 + Esai 40) · Guru TOEFL &ge; 550 otomatis memperoleh 100.</span>
                  <span className="font-bold">Passing Grade Gold: Nilai Akhir &ge; 85</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lembar Tanda Tangan Asesor & Guru */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500">Guru Peserta Asesmen,</p>
            <div className="h-16" />
            <p className="font-bold text-slate-800 font-mono">( .................................................... )</p>
            <p className="text-[10px] text-slate-400">NIP / Tanda Tangan</p>
          </div>
          <div>
            <p className="text-slate-500">Penguji / Asesor Utama EDT,</p>
            <div className="h-16" />
            <p className="font-bold text-slate-800 font-mono">Sarah Amalia, S.Pd. (C1)</p>
            <p className="text-[10px] text-slate-400">Koordinator English Development Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
