import Link from "next/link";
import { Compass, Home, LogIn } from "lucide-react";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="clay mx-auto w-full max-w-lg rounded-[32px] p-8 text-center sm:p-10">
        <div className="clay-soft mx-auto grid size-20 place-items-center rounded-3xl bg-brand-50 text-brand-600">
          <Compass className="size-10 stroke-[2.2]" />
        </div>

        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-widest text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
          Alamat yang Anda tuju belum tersedia atau tautan mungkin salah ketik. Mari kembali ke jalur yang benar.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClass("primary", "md")}>
            <Home className="size-4" /> Beranda Utama
          </Link>
          <Link href="/login" className={buttonClass("secondary", "md")}>
            <LogIn className="size-4" /> Masuk Akun
          </Link>
        </div>
      </div>
    </div>
  );
}

