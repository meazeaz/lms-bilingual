"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
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
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/actions/auth";
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
      ],
    },
  ],
  TEACHER: [
    { items: [{ href: "/guru", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
    {
      title: "Praktik Mengajar",
      items: [
        { href: "/guru/rpp", label: "RPP Bilingual", icon: FileText },
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
  ],
  STUDENT: [
    {
      items: [
        { href: "/siswa", label: "Beranda", icon: Home, exact: true },
        { href: "/siswa/materi", label: "Materi & Kuis", icon: BookOpen },
        { href: "/siswa/nilai", label: "Nilai & Target CEFR", icon: Award },
        { href: "/siswa/club", label: "English Club", icon: MessagesSquare },
        { href: "/siswa/prestasi", label: "Prestasi Lomba", icon: Trophy },
      ],
    },
  ],
};

const ROLE_LABEL = { ADMIN: "Admin · EDT", TEACHER: "Guru", STUDENT: "Siswa" };

function Logo({ logoUrl }: { logoUrl?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <img
        src={logoUrl || "/logo-almadany.png"}
        alt="Logo SMPIT Al Madany Parung Panjang"
        className="size-10 object-contain drop-shadow-xs"
      />
      <span className="leading-tight">
        <span className="block font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-tight text-ink">Bilingual 2028</span>
        <span className="block text-[11px] font-semibold text-slate-500">SMPIT Al Madany Parung Panjang</span>
      </span>
    </Link>
  );
}

function NavList({ role, counts, onNavigate }: { role: keyof typeof NAV; counts: Record<string, number>; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {NAV[role].map((group, gi) => (
        <div key={gi}>
          {group.title && <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{group.title}</p>}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
              const count = item.countKey ? counts[item.countKey] : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                      active ? "text-brand-700" : "text-slate-600 hover:bg-white/80 hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={`nav-active-${role}`}
                        className="clay absolute inset-0 rounded-2xl"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <item.icon className={cn("relative size-[18px]", active ? "text-brand-500" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="relative">{item.label}</span>
                    {count > 0 && <span className="relative ml-auto rounded-full bg-coral-500 px-2 py-0.5 text-[11px] font-black text-white">{count}</span>}
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

function UserCard({ name, subtitle, role }: { name: string; subtitle: string; role: keyof typeof NAV }) {
  return (
    <div className="clay flex items-center gap-3 rounded-2xl p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-coral-300 to-coral-500 text-sm font-black text-white">{initials(name)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-ink">{name}</p>
        <p className="truncate text-xs text-slate-500">{subtitle || ROLE_LABEL[role]}</p>
      </div>
      <form action={logout}>
        <button type="submit" title="Keluar" aria-label="Keluar" className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function AppShell({
  role,
  name,
  subtitle,
  counts = {},
  logoUrl,
  children,
}: {
  role: keyof typeof NAV;
  name: string;
  subtitle: string;
  counts?: Record<string, number>;
  logoUrl?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/70 bg-white/45 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Logo logoUrl={logoUrl} />
        </div>
        <div className="mt-3 px-2">
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 ring-1 ring-brand-100">{ROLE_LABEL[role]}</span>
        </div>
        <div className="scrollbar-thin mt-5 flex-1 overflow-y-auto pr-1">
          <NavList role={role} counts={counts} />
        </div>
        <div className="mt-4">
          <UserCard name={name} subtitle={subtitle} role={role} />
        </div>
      </aside>

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
                <UserCard name={name} subtitle={subtitle} role={role} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
