"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import {
  ArrowRight, Award, BookMarked, Check, CheckCircle2, Flame, GraduationCap, Languages, Lock, Medal, Menu, Mic, Pause, Play, Search, Sunrise, Trophy, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GRAD = {
  brand: "from-brand-300 to-brand-500", coral: "from-coral-300 to-coral-500", mint: "from-mint-300 to-mint-500",
  gold: "from-gold-100 to-gold-500", slate: "from-slate-200 to-slate-400",
} as const;
type Tone = keyof typeof GRAD;

const PHRASES: [string, string][] = [
  ["Good morning, students.", "Selamat pagi, anak-anak."], ["Open your book to page...", "Buka buku halaman..."], ["Work in pairs.", "Kerjakan berpasangan."],
  ["Raise your hand.", "Angkat tangan kalau mau bertanya."], ["Repeat after me.", "Ulangi setelah saya."], ["Don't make noise, please.", "Jangan ramai, tolong."],
  ["Time is almost up.", "Waktu hampir habis."], ["I'm proud of you.", "Saya bangga dengan kalian."], ["See you tomorrow.", "Sampai jumpa besok."],
  ["photosynthesis", "fotosintesis (IPA)"], ["fraction", "pecahan (Matematika)"], ["supply and demand", "penawaran dan permintaan (IPS)"],
];

function ClayIcon({ icon: Icon, tone, size = 48 }: { icon: LucideIcon; tone: Tone; size?: number }) {
  return (
    <span className={cn("clay-soft inline-grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[inset_0_2px_1px_rgb(255_255_255/0.5),inset_0_-5px_8px_rgb(0_0_0/0.12)]", GRAD[tone])} style={{ width: size, height: size }}>
      <Icon className="size-[45%]" strokeWidth={2.5} />
    </span>
  );
}

function Bar({ value, tone = "brand" }: { value: number; tone?: Tone }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgb(15_23_42/0.08)]">
      <motion.div className={cn("h-full rounded-full bg-gradient-to-r", GRAD[tone])} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.3 }} />
    </div>
  );
}

function Float({ children, className, delay = 0, amp = 10 }: { children: ReactNode; className?: string; delay?: number; amp?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={reduce ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -amp, 0] }}
        transition={reduce ? { duration: 0.2 } : { opacity: { duration: 0.4, delay }, scale: { type: "spring", stiffness: 200, damping: 16, delay }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.4 } }}
        whileHover={{ scale: 1.04, rotate: -1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 220, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 220, damping: 18 });
  return (
    <motion.article
      onPointerMove={(e) => {
        if (reduce || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 180, damping: 20 } } }}
      whileHover={reduce ? undefined : { y: -6 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("clay flex min-w-0 flex-col rounded-[28px] p-5 sm:p-6", className)}
    >
      {children}
    </motion.article>
  );
}

function PathCard({ icon, tone, title, level, aud, desc, progress, meta, className, children }: {
  icon: LucideIcon; tone: Tone; title: string; level: string; aud: string; desc: string; progress: number; meta: string; className?: string; children?: ReactNode;
}) {
  return (
    <Tilt className={className}>
      <div className="flex items-start justify-between gap-3">
        <ClayIcon icon={icon} tone={tone} size={50} />
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-extrabold text-brand-700">{level}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{aud}</span>
        </div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      {children}
      <div className="mt-auto pt-5">
        <div className="mb-1.5 flex justify-between text-xs font-bold"><span className="text-slate-500">{meta}</span><span className="tabular-nums text-ink">{progress}%</span></div>
        <Bar value={progress} tone={tone} />
      </div>
    </Tilt>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? PHRASES.filter(([en, id]) => (en + id).toLowerCase().includes(s)).slice(0, 5) : [];
  }, [q]);
  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={(e) => e.preventDefault()} className="clay flex items-center gap-2 rounded-[22px] p-2 pl-4" role="search">
        <Search className="size-5 shrink-0 text-brand-500" />
        <label htmlFor="explore" className="sr-only">Cari kalimat atau istilah</label>
        <input id="explore" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" placeholder="Cari kalimat kelas atau istilah mapel…"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-slate-400" />
        <Link href="/login" className="press inline-flex h-11 items-center gap-2 rounded-2xl border-coral-700 bg-coral-500 px-4 text-sm font-bold text-white">Jelajahi <ArrowRight className="size-4" /></Link>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">Coba:</span>
        {["work in pairs", "photosynthesis", "proud"].map((c) => (
          <button key={c} type="button" onClick={() => setQ(c)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-[0_3px_0_#e2e8f0] active:translate-y-0.5 active:shadow-none">{c}</button>
        ))}
      </div>
      <AnimatePresence>
        {q.trim() && (
          <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="clay absolute inset-x-0 top-[68px] z-40 rounded-[22px] p-2">
            {results.length === 0 && <li className="px-3 py-3 text-sm text-slate-500">Belum ada yang cocok. Coba “instruction” atau “IPA”.</li>}
            {results.map(([en, id]) => (
              <li key={en} className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-brand-50">
                <ClayIcon icon={Languages} tone="mint" size={34} />
                <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-ink">{en}</span><span className="block truncate text-xs text-slate-500">{id}</span></span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroVisual() {
  const [playing, setPlaying] = useState(false);
  const [sent, setSent] = useState(false);
  const [xp, setXp] = useState(248);
  const reduce = useReducedMotion();
  const bars = [10, 22, 16, 30, 18, 26, 12, 24, 30, 14, 20, 28, 12, 18, 24, 10, 16];
  return (
    <div className="relative mx-auto h-[530px] w-full max-w-[520px] sm:h-[500px]">
      <div className="absolute left-10 top-16 size-48 rounded-full bg-brand-200 opacity-50 blur-3xl" />
      <div className="absolute bottom-10 right-6 size-44 rounded-full bg-coral-200 opacity-50 blur-3xl" />
      <Float className="absolute left-1/2 top-[96px] z-10 w-[88%] max-w-[360px] -translate-x-1/2" delay={0.15} amp={8}>
        <div className="clay rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <ClayIcon icon={Sunrise} tone="coral" size={44} />
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-coral-600">Mirror Morning · 05.30</p><p className="font-[family-name:var(--font-display)] text-lg font-semibold">Minggu 4: Reflection</p></div>
          </div>
          <p className="mt-4 rounded-2xl bg-brand-50/60 px-4 py-3 text-[15px] font-semibold leading-snug text-ink">“I am a good teacher. My students believe in me. I believe in myself.”</p>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => setPlaying(!playing)} aria-label={playing ? "Jeda" : "Putar"} className="press grid size-11 shrink-0 place-items-center rounded-full border-brand-700 bg-brand-500 text-white">
              {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
            </button>
            <div className="flex h-9 flex-1 items-center gap-[3px]">
              {bars.map((h, i) => (
                <motion.span key={i} className="w-full rounded-full bg-brand-400" style={{ height: h * 0.8 }}
                  animate={playing && !reduce ? { height: [h * 0.4, h, h * 0.6, h] } : { height: h * 0.8 }}
                  transition={playing ? { duration: 0.9, repeat: Infinity, delay: i * 0.05 } : { duration: 0.3 }} />
              ))}
            </div>
            <span className="text-xs font-bold tabular-nums text-slate-500">0:18</span>
          </div>
          <button onClick={() => { if (!sent) { setSent(true); setPlaying(false); setXp((x) => x + 2); } }}
            className={cn("press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold", sent ? "border-slate-200 bg-white text-ink" : "border-coral-700 bg-coral-500 text-white")}>
            {sent ? <><CheckCircle2 className="size-4 text-mint-600" /> Terkirim, sampai jumpa besok</> : <><Mic className="size-4" /> Kirim voice note</>}
          </button>
        </div>
      </Float>
      <Float className="absolute right-0 top-0 z-20 w-[200px]" delay={0.35} amp={12}>
        <div className="clay rounded-[24px] p-4">
          <div className="flex items-center gap-2.5"><ClayIcon icon={Flame} tone="gold" size={40} /><div><p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums">{sent ? 13 : 12} hari</p><p className="text-xs font-semibold text-slate-500">streak ELITE</p></div></div>
          <div className="mt-3 flex justify-between">
            {["S", "S", "R", "K", "J"].map((d, i) => (
              <span key={i} className={cn("grid size-7 place-items-center rounded-full text-[11px] font-black", i < 4 || sent ? "bg-gold-500 text-white" : "border-2 border-dashed border-gold-500 text-gold-700")}>{i < 4 || sent ? <Check className="size-3.5" strokeWidth={3.5} /> : d}</span>
            ))}
          </div>
        </div>
      </Float>
      <Float className="absolute bottom-0 left-0 z-20 w-[210px]" delay={0.5}>
        <div className="clay flex items-center gap-3 rounded-[24px] p-3.5">
          <div className="relative grid size-16 place-items-center rounded-full" style={{ background: "conic-gradient(#6366f1 68%, #eef2ff 0)" }}>
            <span className="grid size-12 place-items-center rounded-full bg-white text-sm font-black">68%</span>
          </div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Menuju</p><p className="font-[family-name:var(--font-display)] font-semibold leading-tight">Silver Ambassador</p><p className="text-[11px] text-slate-500">5 dari 7 syarat</p></div>
        </div>
      </Float>
      <Float className="absolute left-2 top-6" delay={0.6} amp={14}>
        <span className="clay-soft grid size-[74px] -rotate-8 place-items-center rounded-[24px] bg-gradient-to-br from-gold-100 to-gold-500 text-white"><Award className="size-9" strokeWidth={2.4} /></span>
      </Float>
      <Float className="absolute bottom-3 right-2 z-20" delay={0.75} amp={9}>
        <div className="clay flex items-center gap-2 rounded-full py-2 pl-2 pr-4"><ClayIcon icon={Zap} tone="mint" size={34} /><span className="font-[family-name:var(--font-display)] text-lg font-bold tabular-nums">{xp} XP</span></div>
      </Float>
    </div>
  );
}

export function Landing({ daysLeft }: { daysLeft: number }) {
  const [open, setOpen] = useState(false);
  const [aud, setAud] = useState<"semua" | "guru" | "siswa">("semua");
  const show = (a: "guru" | "siswa") => aud === "semua" || aud === a;
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 22 } } };

  return (
    <div>
      <header className="fixed inset-x-0 top-3 z-50 px-4">
        <motion.nav initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[22px] py-2 pl-2.5 pr-2 shadow-[0_12px_32px_-18px_rgb(63_60_196/0.35)]">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-almadany.png"
              alt="Logo SMPIT Al Madany Parung Panjang"
              width={40}
              height={40}
              className="size-10 object-contain drop-shadow-xs"
              priority
            />
            <span className="leading-tight"><span className="block font-[family-name:var(--font-display)] text-[17px] font-semibold">Bilingual 2028</span><span className="hidden text-[11px] font-semibold text-slate-500 sm:block">SMPIT Al Madany Parung Panjang</span></span>
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {[["#paths", "Learning Paths"], ["#paths", "Duta Inggris"], ["#paths", "Untuk Siswa"]].map(([h, l]) => (
              <li key={l}><a href={h} className="rounded-xl px-3.5 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-ink">{l}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link href="/login" className="press inline-flex h-11 items-center gap-2 rounded-2xl border-brand-700 bg-brand-500 px-5 text-sm font-bold text-white shadow-[0_12px_22px_-12px_#4338ca]">Masuk <ArrowRight className="size-4" /></Link>
            <button className="grid size-11 place-items-center rounded-2xl text-slate-600 hover:bg-white md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
          </div>
        </motion.nav>
        {open && (
          <ul className="glass mx-auto mt-2 grid max-w-6xl gap-1 rounded-[22px] p-2 md:hidden">
            {["Learning Paths", "Duta Inggris", "Untuk Siswa"].map((l) => <li key={l}><a href="#paths" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white">{l}</a></li>)}
          </ul>
        )}
      </header>

      <section className="px-4 pb-10 pt-28 sm:pt-32">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }} className="min-w-0">
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-brand-700 shadow-[0_3px_0_#e2e8f0] ring-1 ring-slate-200">
                <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-mint-400 opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-mint-600" /></span>
                <span className="tabular-nums">{daysLeft.toLocaleString("id-ID")} hari menuju full bilingual · Juli 2028</span>
              </span>
            </motion.div>
            <motion.h1 variants={item} className="mt-5 text-[42px] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
              English jadi <span className="relative inline-block text-brand-500">kebiasaan<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 50 2, 120 2, 198 8" stroke="#f9714f" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span>, bukan beban.
            </motion.h1>
            <motion.p variants={item} className="mt-5 max-w-[52ch] text-lg text-slate-600">
              Satu tempat untuk guru, siswa, dan Tim EDT. Latihan Mirror Morning tiap pagi, hafalan Pocket Book, asesmen Duta Inggris Bronze sampai Gold, dan progres siswa per kelas.
            </motion.p>
            <motion.div variants={item} className="mt-7"><SearchBox /></motion.div>
            <motion.dl variants={item} className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[["3", "level Duta Inggris"], ["50", "kalimat instruksi"], ["5", "skill Cambridge"]].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-slate-200">
                  <dt className="sr-only">{l}</dt><dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">{n}</dd><dd className="text-xs font-semibold leading-tight text-slate-500">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>
          <div className="min-w-0"><HeroVisual /></div>
        </div>
      </section>

      <section id="paths" className="scroll-mt-28 px-4 pb-20 pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-500">Popular Learning Paths</p>
              <h2 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">Jalur belajar paling banyak diikuti</h2>
              <p className="mt-2 max-w-[60ch] text-slate-600">Setiap jalur mengikuti Dokumen Master: kebiasaan harian, hafalan kalimat kelas, asesmen Duta Inggris, sampai lomba siswa.</p>
            </div>
            <div className="flex gap-1 rounded-2xl bg-white/80 p-1 ring-1 ring-slate-200">
              {(["semua", "guru", "siswa"] as const).map((k) => (
                <button key={k} onClick={() => setAud(k)} className={cn("relative rounded-xl px-3.5 py-2 text-sm font-bold capitalize", aud === k ? "text-white" : "text-slate-600")}>
                  {aud === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-brand-500 shadow-[inset_0_-3px_0_#4338ca]" />}
                  <span className="relative">{k === "semua" ? "Semua" : `Untuk ${k}`}</span>
                </button>
              ))}
            </div>
          </div>
          <motion.div key={aud} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {show("guru") && (
              <PathCard icon={Award} tone="brand" title="Bronze Ambassador" level="A2–B1" aud="Guru" progress={64} meta="4 syarat · asesmen 3 komponen" className="md:col-span-2 lg:row-span-2"
                desc="Jalur pertama Duta Inggris. Hafal 20 kalimat instruksi, aktif di ELITE minimal 70%, lalu lulus asesmen dengan nilai akhir ≥ 66,5.">
                <ul className="mt-5 grid gap-2">
                  {[["Partisipasi ELITE ≥ 70%", "86%", true], ["Hafal 20 kalimat Pocket Book", "32/50", true], ["English Zone 3×30 menit/minggu", "2/3", false], ["Asesmen: lisan 50% · tertulis 30% · simulasi 20%", "12 Nov", false]].map(([l, v, d]) => (
                    <li key={String(l)} className="flex items-center gap-2.5 rounded-2xl bg-brand-50/50 px-3 py-2.5">
                      <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", d ? "bg-mint-500 text-white" : "border-2 border-slate-300 text-transparent")}><Check className="size-3.5" strokeWidth={3.5} /></span>
                      <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">{l}</span><span className="text-xs font-extrabold tabular-nums text-slate-500">{v}</span>
                    </li>
                  ))}
                </ul>
              </PathCard>
            )}
            {show("guru") && (
              <PathCard icon={Sunrise} tone="coral" title="ELITE English Habit" level="Semua level" aud="Guru" progress={90} meta="18 dari 20 hari" className="lg:row-span-2"
                desc="Mirror Morning 05.30, voice note sebelum 06.15, Misi Harian sebelum 20.00.">
                <ol className="mt-4 grid gap-2">
                  {["Greetings & Gratitude", "Instructions", "Student Interaction", "Reflection"].map((w, i) => (
                    <li key={w} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5", i === 3 ? "bg-coral-50" : "bg-slate-50")}>
                      <span className={cn("grid size-7 place-items-center rounded-xl text-xs font-black", i < 3 ? "bg-coral-400 text-white" : "bg-white text-coral-600 ring-2 ring-coral-400")}>{i + 1}</span>
                      <span className="text-sm font-bold text-slate-700">{w}</span>
                    </li>
                  ))}
                </ol>
              </PathCard>
            )}
            {show("guru") && <PathCard icon={BookMarked} tone="mint" title="Pocket Book 50 Kalimat" level="Bronze → Gold" aud="Guru" progress={64} meta="32 dari 50 dihafal" desc="Opening, instruksi, manajemen kelas, pujian, closing." />}
            {show("guru") && <PathCard icon={Medal} tone="slate" title="Silver Ambassador" level="B1–B2" aud="Guru" progress={12} meta="Setelah 6 bulan sebagai Bronze" desc="Inggris 50% di kelas, mentor 1 guru Bronze, nilai akhir ≥ 76,2."><Lock className="mt-2 size-4 text-slate-400" /></PathCard>}
            {show("siswa") && <PathCard icon={GraduationCap} tone="brand" title="Classroom English Kelas 7" level="A1 → A2" aud="Siswa" progress={45} meta="9 dari 20 kuis lulus" className="lg:col-span-2" desc="Pahami instruksi guru tanpa terjemahan: “Work in pairs”, “Raise your hand”, “Submit your assignment”." />}
            {show("siswa") && <PathCard icon={Languages} tone="mint" title="Glosarium Sains & Matematika" level="A2+" aud="Siswa" progress={30} meta="IPA · Matematika · IPS · PJOK" desc="Photosynthesis, fraction, supply and demand, warm-up." />}
            {show("siswa") && <PathCard icon={Trophy} tone="coral" title="Jalur Lomba Speech" level="B1" aud="Siswa" progress={50} meta="Target: 2 juara kecamatan" desc="Seleksi kelas, seleksi sekolah, lalu kecamatan dan kabupaten." />}
          </motion.div>
        </div>
      </section>

      <footer className="px-4 pb-12">
        <div className="clay mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 rounded-[28px] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Mulai dari satu kalimat hari ini.</p>
            <p className="text-sm text-slate-600">“Don&apos;t be afraid to make mistakes. That&apos;s how you learn.”</p>
          </div>
          <Link href="/login" className="press inline-flex h-12 items-center gap-2 rounded-2xl border-coral-700 bg-coral-500 px-6 font-bold text-white">Masuk ke LMS <ArrowRight className="size-4" /></Link>
        </div>
      </footer>
    </div>
  );
}
