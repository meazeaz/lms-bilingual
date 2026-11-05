"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button, buttonClass } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi kesalahan:", error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="clay mx-auto w-full max-w-lg rounded-[32px] p-8 text-center sm:p-10">
        <div className="clay-soft mx-auto grid size-20 place-items-center rounded-3xl bg-coral-50 text-coral-600">
          <AlertTriangle className="size-10 stroke-[2.2]" />
        </div>

        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-widest text-coral-600">
          Terjadi Kendala Teknis
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Ada Masalah Saat Memuat
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
          Jangan khawatir, data Anda tetap aman. Silakan klik tombol di bawah untuk mencoba memuat ulang halaman ini.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-400">
            Kode kendala: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="coral" size="md" onClick={() => reset()}>
            <RotateCcw className="size-4" /> Coba Lagi
          </Button>
          <Link href="/" className={buttonClass("secondary", "md")}>
            <Home className="size-4" /> Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

