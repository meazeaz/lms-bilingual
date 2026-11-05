import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, Clock, Flame, Languages, Medal, ShieldCheck, Sunrise, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

const PILLARS: { icon: LucideIcon; grad: string; title: string; desc: string }[] = [
  { icon: Medal, grad: "from-gold-100 to-gold-500", title: "Duta Inggris", desc: "Jenjang Bronze, Silver, hingga Gold" },
  { icon: Flame, grad: "from-coral-300 to-coral-500", title: "ELITE English Habit", desc: "Kebiasaan berbahasa Inggris setiap hari" },
  { icon: Sunrise, grad: "from-mint-300 to-mint-500", title: "Mirror Morning", desc: "Afirmasi pagi & voice note 05.30" },
];

const LEVELS = [
  { label: "Bronze", cls: "bg-bronze-100 text-bronze-700" },
  { label: "Silver", cls: "bg-silver-100 text-silver-700" },
  { label: "Gold", cls: "bg-gold-100 text-gold-700" },
];

function ClayTile({ icon: Icon, grad, size = 44 }: { icon: LucideIcon; grad: string; size?: number }) {
  return (
    <span
      className={cn(
        "clay-soft inline-grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[inset_0_2px_1px_rgb(255_255_255/0.5),inset_0_-5px_8px_rgb(0_0_0/0.12)]",
        grad,
      )}
      style={{ width: size, height: size }}
    >
      <Icon className="size-[46%]" strokeWidth={2.5} />
    </span>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      {/* Latar dekoratif */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 size-80 rounded-full bg-brand-200 opacity-40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-coral-200 opacity-40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_1.05fr]">
        {/* Kartu formulir */}
        <div className="clay flex flex-col rounded-[28px] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo-almadany.png"
                alt="Logo SMPIT Al Madany Parung Panjang"
                width={48}
                height={48}
                className="size-12 object-contain drop-shadow-sm"
                priority
              />
              <span className="leading-tight">
                <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-ink">Bilingual 2028</span>
                <span className="block text-xs font-semibold text-slate-500">SMPIT Al Madany Parung Panjang</span>
              </span>
            </Link>
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-[0_3px_0_#e2e8f0] transition hover:text-brand-600 active:translate-y-0.5 active:shadow-none sm:inline-flex"
            >
              <ArrowLeft className="size-3.5" /> Beranda
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Welcome back</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Selamat datang kembali</h1>
            <p className="mt-1.5 text-sm text-slate-500">Masuk dengan akun yang diberikan Tim EDT.</p>
          </div>

          {expired && (
            <div role="status" className="mt-5 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
              <Clock className="mt-0.5 size-4 shrink-0" />
              Sesi Anda telah berakhir atau password baru saja diganti. Silakan masuk kembali.
            </div>
          )}

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-brand-50/70 p-3.5 text-xs text-slate-600 ring-1 ring-brand-100 md:mt-auto">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <p>
              Lupa password atau akun belum aktif? Hubungi <span className="font-bold text-ink">Tim EDT</span> sekolah untuk
              bantuan.
            </p>
          </div>
        </div>

        {/* Panel program */}
        <div className="relative hidden flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-500 to-brand-700 p-7 text-white shadow-[0_24px_44px_-24px_rgb(63_60_196/0.7)] sm:p-9 md:flex">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-coral-400/25 blur-3xl" />
          <span
            aria-hidden
            className="clay-soft absolute right-7 top-7 grid size-16 rotate-8 place-items-center rounded-[22px] bg-gradient-to-br from-gold-100 to-gold-500 text-white sm:right-9 sm:top-9"
          >
            <Award className="size-8" strokeWidth={2.4} />
          </span>

          <div className="relative">
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-50 ring-1 ring-white/25">
              Program Akselerasi Bilingual 2028
            </p>
            <h2 className="mt-4 max-w-[16ch] text-3xl font-semibold leading-tight">Satu sekolah, dua bahasa.</h2>
            <p className="mt-1 text-sm font-semibold text-brand-100">One school, two languages.</p>
          </div>

          <div className="relative mt-6 rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <ClayTile icon={Languages} grad="from-brand-200 to-brand-400" size={38} />
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight">“I&apos;m proud of you.”</p>
                <p className="text-xs text-brand-100">Saya bangga dengan kalian.</p>
              </div>
            </div>
          </div>

          <ul className="relative mt-5 space-y-2.5">
            {PILLARS.map((p) => (
              <li key={p.title} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/15">
                <ClayTile icon={p.icon} grad={p.grad} />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-brand-100">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-6">
            <span className="text-xs font-bold text-brand-100">Jenjang Duta:</span>
            {LEVELS.map((l) => (
              <span key={l.label} className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold", l.cls)}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
