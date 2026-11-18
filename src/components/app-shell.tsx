"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  ChevronsLeft,
  ClipboardCheck,
  Eye,
  FileSpreadsheet,
  FileText,
  FileUp,
  GraduationCap,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessagesSquare,
  NotebookPen,
  Settings,
  SlidersHorizontal,
  Sunrise,
  Target,
  Trophy,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; countKey?: string; exact?: boolean };
type NavGroup = { title?: string; items: NavItem[] };

const NAV: Record<"ADMIN" | "TEACHER" | "STUDENT", NavGroup[]> = {
  ADMIN: [
    { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
    {
      title: "Guru & Duta Inggris",
      items: [
        { href: "/admin/guru", label: "Direktori Guru", icon: Users },
        { href: "/admin/elite", label: "ELITE Program", icon: Sunrise },
        { href: "/admin/observasi", label: "Observasi Kelas", icon: Eye },
        { href: "/admin/verifikasi", label: "Verifikasi & Review", icon: BadgeCheck, countKey: "verifikasi" },
        { href: "/admin/asesmen", label: "Asesmen Duta", icon: Award },
        { href: "/admin/rpp", label: "Modul Ajar (RPP)", icon: FileText },
      ],
    },
    {
      title: "Siswa & Ekosistem",
      items: [
        { href: "/admin/siswa", label: "Direktori Siswa", icon: GraduationCap },
        { href: "/admin/club", label: "English Club & Tutor", icon: MessagesSquare },
        { href: "/admin/lomba", label: "Prestasi & Lomba", icon: Trophy },
        { href: "/admin/materi", label: "Kelola Materi & Kuis", icon: BookOpen },
      ],
    },
    {
      title: "Laporan & Administrasi",
      items: [
        { href: "/admin/laporan", label: "Laporan Bulanan EDT", icon: FileSpreadsheet },
        { href: "/admin/pengumuman", label: "Kelola Pengumuman", icon: Megaphone },
        { href: "/admin/pengguna", label: "Manajemen Pengguna", icon: Settings },
        { href: "/admin/pengaturan", label: "Master Data & Pengaturan", icon: SlidersHorizontal },
        { href: "/admin/data", label: "Impor & Ekspor Excel", icon: FileUp },
        { href: "/admin/log", label: "Log Aktivitas", icon: History },
      ],
    },
    { title: "Akun", items: [{ href: "/admin/akun", label: "Akun Saya", icon: UserCog }] },
  ],
  TEACHER: [
    { items: [{ href: "/guru", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
    {
      title: "Praktik Mengajar",
      items: [
        { href: "/guru/rpp", label: "Modul Ajar (RPP)", icon: FileText },
        { href: "/guru/refleksi", label: "Refleksi & Observasi", icon: NotebookPen },
      ],
    },
    {
      title: "Pengembangan Saya",
      items: [
        { href: "/guru/harian", label: "ELITE Harian", icon: Sunrise },
        { href: "/guru/duta", label: "Duta Inggris", icon: Award },
        { href: "/guru/pocket-book", label: "Pocket Book", icon: BookMarked },
        { href: "/guru/challenge", label: "Weekly Challenge", icon: Target },
      ],
    },
    {
      title: "Siswa Saya",
      items: [
        { href: "/guru/siswa", label: "Progress Siswa", icon: GraduationCap },
        { href: "/guru/nilai", label: "Input Nilai Siswa", icon: ClipboardCheck },
        { href: "/guru/club", label: "English Club & Tutor", icon: MessagesSquare },
        { href: "/guru/lomba", label: "Prestasi & Lomba", icon: Trophy },
        { href: "/guru/materi", label: "Kelola Materi & Kuis", icon: BookOpen },
      ],
    },
    { title: "Akun", items: [{ href: "/guru/akun", label: "Akun Saya", icon: UserCog }] },
  ],
  STUDENT: [
    {
      items: [
        { href: "/siswa", label: "Beranda", icon: Home, exact: true },
        { href: "/siswa/materi", label: "Materi & Kuis", icon: BookOpen },
        { href: "/siswa/nilai", label: "Nilai & Target CEFR", icon: Award },
        { href: "/siswa/club", label: "English Club", icon: MessagesSquare },
        { href: "/siswa/prestasi", label: "Prestasi Lomba", icon: Trophy },
        { href: "/siswa/akun", label: "Akun Saya", icon: UserCog },
      ],
    },
  ],
};

const ROLE_LABEL = { ADMIN: "Admin · EDT", TEACHER: "Guru", STUDENT: "Siswa" };
const ACCOUNT_HREF = { ADMIN: "/admin/akun", TEACHER: "/guru/akun", STUDENT: "/siswa/akun" };

/** Kurva & durasi bersama agar semua bagian sidebar bergerak selaras. */
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Teks yang memudar & bergeser saat sidebar diringkas (tetap di DOM agar transisi mulus). */
function fade(compact: boolean) {
  return cn(
    "transition-[opacity,transform] duration-200",
    EASE,
    compact ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100 delay-100",
  );
}

function Logo({ logoUrl, compact = false }: { logoUrl?: string; compact?: boolean }) {
  return (
    <Link href="/" title={compact ? "Bilingual 2028 · SMPIT Al Madany" : undefined} className="flex items-center gap-2.5">
      <img
        src={logoUrl || "/logo-almadany.png"}
        alt="Logo SMPIT Al Madany Parung Panjang"
        className={cn("size-10 shrink-0 object-contain drop-shadow-xs transition-transform duration-300", EASE, compact && "hover:scale-110")}
      />
      <span className={cn("min-w-0 whitespace-nowrap leading-tight", fade(compact))} aria-hidden={compact || undefined}>
        <span className="block font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-tight text-ink">Bilingual 2028</span>
        <span className="block truncate text-[11px] font-semibold text-slate-500">SMPIT Al Madany Parung Panjang</span>
      </span>
    </Link>
  );
}

/** Tooltip mengambang untuk mode sidebar ringkas (posisi fixed agar tidak terpotong area scroll). */
type Tip = { label: string; top: number } | null;

function NavList({
  role,
  counts,
  onNavigate,
  compact = false,
  onTip,
}: {
  role: keyof typeof NAV;
  counts: Record<string, number>;
  onNavigate?: () => void;
  compact?: boolean;
  onTip?: (tip: Tip) => void;
}) {
  const pathname = usePathname();
  const showTip = (el: HTMLElement, label: string) => {
    const r = el.getBoundingClientRect();
    onTip?.({ label, top: r.top + r.height / 2 });
  };
  return (
    <nav className="space-y-5">
      {NAV[role].map((group, gi) => (
        <div key={gi}>
          {group.title && (
            // Judul kelompok berganti menjadi garis pemisah tanpa mengubah tinggi (tidak ada lompatan vertikal).
            <div className="relative mb-1.5 h-4">
              <p className={cn("whitespace-nowrap px-3 text-[11px] font-bold uppercase leading-4 tracking-wider text-slate-400", fade(compact))}>{group.title}</p>
              <span
                aria-hidden
                className={cn(
                  "absolute left-1.5 top-1/2 h-px w-8 origin-left bg-slate-200 transition-[opacity,transform] duration-300",
                  EASE,
                  compact ? "scale-x-100 opacity-100 delay-100" : "scale-x-0 opacity-0",
                )}
              />
            </div>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
              const count = item.countKey ? counts[item.countKey] : 0;
              const tipLabel = count > 0 ? `${item.label} (${count})` : item.label;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    onMouseEnter={compact ? (e) => showTip(e.currentTarget, tipLabel) : undefined}
                    onMouseLeave={compact ? () => onTip?.(null) : undefined}
                    onFocus={compact ? (e) => showTip(e.currentTarget, tipLabel) : undefined}
                    onBlur={compact ? () => onTip?.(null) : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-2xl px-[13px] text-sm font-bold transition-colors",
                      active ? "text-brand-700" : "text-slate-600 hover:bg-white/80 hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={`nav-active-${role}`}
                        layoutDependency={pathname}
                        className="clay absolute inset-0 rounded-2xl"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative size-[18px] shrink-0 transition-transform duration-200",
                        active ? "text-brand-500" : "text-slate-400 group-hover:text-slate-600",
                        compact && "group-hover:scale-110",
                      )}
                    />
                    <span className={cn("relative whitespace-nowrap", fade(compact))}>{item.label}</span>
                    {count > 0 && (
                      <>
                        <span className={cn("relative ml-auto rounded-full bg-coral-500 px-2 py-0.5 text-[11px] font-black text-white", fade(compact))}>{count}</span>
                        {/* Lencana kecil di sudut ikon saat ringkas */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-[22px] top-0 grid min-w-[18px] place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-black leading-[18px] text-white ring-2 ring-white transition-[opacity,transform] duration-300",
                            EASE,
                            compact ? "scale-100 opacity-100 delay-100" : "pointer-events-none scale-50 opacity-0",
                          )}
                        >
                          {count > 99 ? "99+" : count}
                        </span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" title="Keluar" aria-label="Keluar" className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
        <LogOut className="size-4" />
      </button>
    </form>
  );
}

/** Foto profil atau inisial nama. */
function UserPhoto({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className?: string }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- foto profil privat dari /api/avatar
    return <img src={avatarUrl} alt={`Foto ${name}`} className={cn("shrink-0 object-cover", className)} />;
  }
  return <span className={cn("grid shrink-0 place-items-center bg-gradient-to-br from-coral-300 to-coral-500 text-sm font-black text-white", className)}>{initials(name)}</span>;
}

function UserCard({ name, subtitle, role, compact = false, avatarUrl }: { name: string; subtitle: string; role: keyof typeof NAV; compact?: boolean; avatarUrl?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {compact ? (
        <motion.div
          key="compact"
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, delay: 0.05, ease: [0.32, 0.72, 0, 1] } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
        >
          <Link
            href={ACCOUNT_HREF[role]}
            title={`${name} · Akun Saya`}
            className="overflow-hidden rounded-2xl shadow-md shadow-coral-500/25 ring-2 ring-white transition hover:scale-105"
          >
            <UserPhoto name={name} avatarUrl={avatarUrl} className="size-11" />
          </Link>
          <LogoutButton />
        </motion.div>
      ) : (
        <motion.div
          key="full"
          className="clay flex items-center gap-3 rounded-2xl p-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.12, ease: [0.32, 0.72, 0, 1] } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
        >
          <Link href={ACCOUNT_HREF[role]} title="Akun Saya" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl transition hover:opacity-80">
            <UserPhoto name={name} avatarUrl={avatarUrl} className="size-10 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold text-ink">{name}</span>
              <span className="block truncate text-xs text-slate-500">{subtitle || ROLE_LABEL[role]}</span>
            </span>
          </Link>
          <LogoutButton />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AppShell({
  role,
  name,
  subtitle,
  counts = {},
  logoUrl,
  avatarUrl,
  defaultCollapsed = false,
  children,
}: {
  role: keyof typeof NAV;
  name: string;
  subtitle: string;
  counts?: Record<string, number>;
  logoUrl?: string;
  avatarUrl?: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [tip, setTip] = useState<Tip>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  const toggleCollapsed = useCallback(() => {
    setTip(null);
    setCollapsed((c) => {
      const next = !c;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  // Pintasan keyboard: Ctrl/Cmd + B untuk membuka/menutup sidebar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop: bisa diringkas menjadi ikon saja */}
      <aside
        data-motion="always"
        className={cn(
          "no-print fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/70 bg-white/45 py-5 backdrop-blur-xl transition-[width,padding] duration-300 lg:flex",
          EASE,
          collapsed ? "w-20 px-[18px]" : "w-72 px-4",
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-expanded={!collapsed}
          title={`${collapsed ? "Buka" : "Tutup"} sidebar (Ctrl+B)`}
          className="clay absolute -right-3.5 top-9 z-10 grid size-7 place-items-center rounded-full text-slate-500 transition hover:scale-110 hover:text-brand-600 active:scale-95"
        >
          <ChevronsLeft className={cn("size-4 transition-transform duration-300", EASE, collapsed && "rotate-180")} />
        </button>

        <div className={cn("overflow-hidden transition-[padding] duration-300", EASE, collapsed ? "px-0.5" : "px-2")}>
          <Logo logoUrl={logoUrl} compact={collapsed} />
        </div>
        {/* Label peran mengerut ke atas saat ringkas */}
        <div
          aria-hidden={collapsed || undefined}
          className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-300",
            EASE,
            collapsed ? "mt-0 grid-rows-[0fr] opacity-0" : "mt-3 grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden px-2">
            <span className="inline-flex whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 ring-1 ring-brand-100">{ROLE_LABEL[role]}</span>
          </div>
        </div>
        <div
          className={cn(
            "mt-5 flex-1 overflow-y-auto overflow-x-hidden",
            collapsed ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "scrollbar-thin pr-1",
          )}
          onScroll={() => setTip(null)}
        >
          <NavList role={role} counts={counts} compact={collapsed} onTip={setTip} />
        </div>
        <div className="mt-4">
          <UserCard name={name} subtitle={subtitle} role={role} avatarUrl={avatarUrl} compact={collapsed} />
        </div>
      </aside>

      {/* Tooltip menu saat sidebar ringkas: meluncur mengikuti ikon yang disorot */}
      <AnimatePresence>
        {collapsed && tip && (
          <motion.div
            key="nav-tip"
            role="tooltip"
            className="pointer-events-none fixed left-[90px] z-50 hidden whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-lg lg:block"
            style={{ y: "-50%" }}
            initial={{ opacity: 0, x: -6, top: tip.top }}
            animate={{ opacity: 1, x: 0, top: tip.top }}
            exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
          >
            <span aria-hidden className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 rotate-45 rounded-[2px] bg-ink" />
            <span className="relative">{tip.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topbar mobile */}
      <header className="no-print glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <Logo logoUrl={logoUrl} />
        <button onClick={() => setOpen(true)} aria-label="Buka menu" className="clay grid size-10 place-items-center rounded-2xl text-slate-600">
          <Menu className="size-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-xs flex-col bg-[#f6f7ff] px-4 py-5 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between px-2">
                <Logo logoUrl={logoUrl} />
                <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white">
                  <X className="size-5" />
                </button>
              </div>
              <div className="scrollbar-thin mt-6 flex-1 overflow-y-auto">
                <NavList role={role} counts={counts} onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-4">
                <UserCard name={name} subtitle={subtitle} role={role} avatarUrl={avatarUrl} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main data-motion="self" className={cn("transition-[padding] duration-300 print:!pl-0", EASE, collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <div data-motion="self" className={cn("mx-auto px-4 py-6 transition-[max-width] duration-300 sm:px-6 lg:px-10 lg:py-9", EASE, collapsed ? "max-w-[1600px]" : "max-w-7xl")}>{children}</div>
      </main>
    </div>
  );
}
