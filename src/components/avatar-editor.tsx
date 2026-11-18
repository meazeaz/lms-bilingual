"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { removeAvatar, updateAvatar } from "@/actions/account";
import type { ActionState } from "@/lib/action-state";
import { FormMessage } from "@/components/forms";
import { buttonClass } from "@/components/ui";
import { cn, initials } from "@/lib/utils";

const VIEW = 288; // ukuran area potong (px)
const OUT = 512; // ukuran hasil (px)
const MAX_INPUT = 15 * 1024 * 1024; // foto asli dari HP bisa besar; diperkecil di browser sebelum diunggah

type Img = { el: HTMLImageElement; w: number; h: number; url: string };

/** Foto profil + editor potong (geser & zoom). Hasil 512×512 WebP/JPEG dikirim ke server action. */
export function AvatarEditor({ name, src }: { name: string; src?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<Img | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);
  const [state, setState] = useState<ActionState>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const base = img ? Math.max(VIEW / img.w, VIEW / img.h) : 1;
  const scale = base * zoom;
  const dw = img ? img.w * scale : VIEW;
  const dh = img ? img.h * scale : VIEW;
  const clamp = useCallback(
    (p: { x: number; y: number }, w = dw, h = dh) => ({ x: Math.min(0, Math.max(VIEW - w, p.x)), y: Math.min(0, Math.max(VIEW - h, p.y)) }),
    [dw, dh],
  );

  const close = useCallback(() => {
    if (img) URL.revokeObjectURL(img.url);
    setImg(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [img]);

  useEffect(() => {
    if (!img) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [img, close]);

  const onFile = (file: File | undefined) => {
    setState(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setState({ ok: false, message: "Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.", ts: Date.now() });
      return;
    }
    if (file.size > MAX_INPUT) {
      setState({ ok: false, message: "Foto terlalu besar (maksimal 15 MB).", ts: Date.now() });
      return;
    }
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      const w = el.naturalWidth, h = el.naturalHeight;
      const b = Math.max(VIEW / w, VIEW / h);
      setImg({ el, w, h, url });
      setZoom(1);
      setPos({ x: (VIEW - w * b) / 2, y: (VIEW - h * b) / 2 });
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      setState({ ok: false, message: "Foto tidak dapat dibaca. Coba foto lain.", ts: Date.now() });
    };
    el.src = url;
  };

  /** Ubah zoom dengan titik tengah area potong tetap di tempat. */
  const changeZoom = (z: number) => {
    if (!img) return;
    const nz = Math.min(3, Math.max(1, z));
    const ns = base * nz;
    const cx = (VIEW / 2 - pos.x) / scale; // titik tengah dalam koordinat gambar asli
    const cy = (VIEW / 2 - pos.y) / scale;
    setZoom(nz);
    setPos(clamp({ x: VIEW / 2 - cx * ns, y: VIEW / 2 - cy * ns }, img.w * ns, img.h * ns));
  };

  const save = async () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img.el, -pos.x / scale, -pos.y / scale, VIEW / scale, VIEW / scale, 0, 0, OUT, OUT);
    const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.9));
    let blob = await toBlob("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
    if (!blob) return setState({ ok: false, message: "Gagal memproses foto.", ts: Date.now() });
    const fd = new FormData();
    fd.set("avatar", new File([blob], blob.type === "image/webp" ? "avatar.webp" : "avatar.jpg", { type: blob.type }));
    setBusy("save");
    startTransition(async () => {
      const res = await updateAvatar(fd);
      setBusy(null);
      setState(res);
      if (res?.ok) {
        close();
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!window.confirm("Hapus foto profil? Inisial nama akan ditampilkan kembali.")) return;
    setBusy("remove");
    startTransition(async () => {
      const res = await removeAvatar();
      setBusy(null);
      setState(res);
      if (res?.ok) router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative size-20 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white shadow-md"
          aria-label="Ganti foto profil"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- foto privat dari /api/avatar
            <img src={src} alt={`Foto ${name}`} className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center bg-gradient-to-br from-coral-300 to-coral-500 text-2xl font-black text-white">{initials(name)}</span>
          )}
          <span className="absolute inset-0 grid place-items-center bg-ink/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="size-6" />
          </span>
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className={buttonClass("secondary", "sm")}>
            <Camera className="size-4" /> {src ? "Ganti foto" : "Unggah foto"}
          </button>
          {src && (
            <button type="button" onClick={remove} disabled={busy !== null} className={cn(buttonClass("ghost", "sm"), "text-rose-600 hover:bg-rose-50")}>
              {busy === "remove" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Hapus
            </button>
          )}
          <p className="w-full text-xs text-slate-500">JPG, PNG, atau WebP. Foto hanya terlihat oleh pengguna yang login.</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {!img && <div className="mt-3"><FormMessage state={state} /></div>}

      {img && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Atur foto profil">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">Atur foto profil</h3>
              <button type="button" onClick={close} className="grid size-8 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup"><X className="size-4" /></button>
            </div>
            <div
              className="relative mx-auto cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-slate-100 active:cursor-grabbing"
              style={{ width: VIEW, height: VIEW }}
              tabIndex={0}
              aria-label="Area potong. Seret untuk menggeser, gunakan tombol panah untuk menggeser dan +/− untuk zoom."
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                setPos(clamp({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y }));
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onWheel={(e) => changeZoom(zoom - e.deltaY * 0.0015)}
              onKeyDown={(e) => {
                const step = 10;
                if (e.key === "ArrowLeft") setPos(clamp({ x: pos.x + step, y: pos.y }));
                else if (e.key === "ArrowRight") setPos(clamp({ x: pos.x - step, y: pos.y }));
                else if (e.key === "ArrowUp") setPos(clamp({ x: pos.x, y: pos.y + step }));
                else if (e.key === "ArrowDown") setPos(clamp({ x: pos.x, y: pos.y - step }));
                else if (e.key === "+" || e.key === "=") changeZoom(zoom + 0.1);
                else if (e.key === "-") changeZoom(zoom - 0.1);
                else return;
                e.preventDefault();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal (blob URL) */}
              <img
                src={img.url}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-0 top-0 max-w-none"
                style={{ width: dw, height: dh, transform: `translate(${pos.x}px, ${pos.y}px)` }}
              />
              {/* Bingkai bulat: area di luar lingkaran digelapkan */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(15,23,42,0.45)] ring-2 ring-white/80" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => changeZoom(zoom - 0.2)} className={buttonClass("ghost", "sm")} aria-label="Perkecil"><Minus className="size-4" /></button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => changeZoom(Number(e.target.value))}
                className="flex-1 accent-brand-600"
                aria-label="Zoom"
              />
              <button type="button" onClick={() => changeZoom(zoom + 0.2)} className={buttonClass("ghost", "sm")} aria-label="Perbesar"><Plus className="size-4" /></button>
            </div>
            <p className="mt-1 text-center text-xs text-slate-500">Seret foto untuk menggeser, gunakan slider untuk zoom.</p>
            <FormMessage state={state} />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={close} className={buttonClass("ghost")}>Batal</button>
              <button type="button" onClick={save} disabled={busy !== null} className={buttonClass("primary")}>
                {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : null} Simpan foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
