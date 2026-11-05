import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

const DEMO = [
  { role: "Admin · EDT", email: "admin@almadany.sch.id", password: "admin123" },
  { role: "Guru (Gold)", email: "fitri@almadany.sch.id", password: "guru123" },
  { role: "Guru (Bronze)", email: "ela@almadany.sch.id", password: "guru123" },
  { role: "Siswa 7A", email: "aisyah@siswa.almadany.sch.id", password: "siswa123" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="clay rounded-[28px] p-7 sm:p-9">
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
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">Selamat datang kembali</h1>
          <p className="mt-1.5 text-sm text-slate-500">Masuk dengan akun yang diberikan Tim EDT.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <div className="rounded-[28px] bg-gradient-to-br from-brand-500 to-brand-700 p-7 text-white shadow-[0_24px_44px_-24px_rgb(63_60_196/0.7)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-100">Akun demo</p>
          <h2 className="mt-1 text-2xl font-semibold">Coba tiap peran</h2>
          <p className="mt-1 text-sm text-brand-100">Data guru, siswa, dan nilai di bawah adalah contoh untuk uji coba.</p>
          <ul className="mt-5 space-y-2.5">
            {DEMO.map((d) => (
              <li key={d.email} className="rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20">
                <p className="text-xs font-bold text-brand-100">{d.role}</p>
                <p className="mt-0.5 font-mono text-[13px] select-all">{d.email}</p>
                <p className="font-mono text-[13px] text-brand-100 select-all">{d.password}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
