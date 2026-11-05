import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { LEVEL_SHORT, type Level } from "@/lib/program";

// ───────────── Card ─────────────
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("clay rounded-3xl", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-5 sm:px-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="clay-soft grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="size-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

// ───────────── Button ─────────────
const BTN_VARIANTS = {
  primary: "bg-brand-500 text-white border-brand-700 shadow-[0_8px_18px_-8px_rgb(79_70_229/0.7)]",
  coral: "bg-coral-500 text-white border-coral-700 shadow-[0_8px_18px_-8px_rgb(226_86_58/0.65)]",
  mint: "bg-mint-500 text-white border-mint-700 shadow-[0_8px_18px_-8px_rgb(20_154_114/0.6)]",
  secondary: "bg-white text-slate-700 border-slate-200 border shadow-sm hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
  danger: "bg-rose-500 text-white border-rose-700",
} as const;

const BTN_SIZES = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-sm rounded-2xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2",
} as const;

export type ButtonVariant = keyof typeof BTN_VARIANTS;

export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof BTN_SIZES = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center font-bold whitespace-nowrap disabled:pointer-events-none disabled:opacity-50",
    variant !== "ghost" && variant !== "secondary" && "press",
    variant === "secondary" && "press border-b-4",
    BTN_VARIANTS[variant],
    BTN_SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: keyof typeof BTN_SIZES }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: keyof typeof BTN_SIZES }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

// ───────────── Pill / Badge ─────────────
const TONES = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-mint-50 text-mint-700 ring-mint-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  coral: "bg-coral-50 text-coral-700 ring-coral-200",
  bronze: "bg-bronze-50 text-bronze-700 ring-bronze-100",
  silver: "bg-silver-50 text-silver-700 ring-silver-100",
  gold: "bg-gold-50 text-gold-700 ring-gold-100",
} as const;

export type Tone = keyof typeof TONES;

export function Pill({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset whitespace-nowrap", TONES[tone], className)}>
      {children}
    </span>
  );
}

const LEVEL_TONE: Record<Level, Tone> = { NONE: "neutral", BRONZE: "bronze", SILVER: "silver", GOLD: "gold" };
const LEVEL_DOT: Record<Level, string> = { NONE: "bg-slate-400", BRONZE: "bg-bronze-500", SILVER: "bg-silver-500", GOLD: "bg-gold-500" };

export function LevelBadge({ level, className }: { level: Level | string; className?: string }) {
  const l = level as Level;
  return (
    <Pill tone={LEVEL_TONE[l]} className={className}>
      <span className={cn("size-1.5 rounded-full", LEVEL_DOT[l])} />
      {LEVEL_SHORT[l]}
    </Pill>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, [Tone, string]> = {
    PENDING: ["warning", "Menunggu verifikasi"],
    APPROVED: ["success", "Terverifikasi"],
    REJECTED: ["danger", "Ditolak"],
    DRAF: ["neutral", "Draf"],
    DIAJUKAN: ["warning", "Diajukan"],
    DISETUJUI: ["success", "Disetujui"],
    REVISI: ["danger", "Perlu revisi"],
    DITERIMA: ["success", "Diterima"],
    DITERIMA_SEBAGIAN: ["info", "Diterima sebagian"],
    DITOLAK: ["danger", "Ditolak"],
  };
  const [tone, label] = map[status] ?? ["neutral", status];
  return <Pill tone={tone}>{label}</Pill>;
}

// ───────────── Form controls ─────────────
const controlBase =
  "w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-[inset_0_2px_3px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(controlBase, "h-11 cursor-pointer pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-xs font-semibold text-rose-600">{error}</span> : hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({ label, description, className, ...props }: ComponentProps<"input"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60", className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-md accent-brand-500" {...props} />
      <span>
        <span className="block text-sm font-bold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

// ───────────── Progress ─────────────
const BAR = {
  brand: "from-brand-400 to-brand-500",
  coral: "from-coral-300 to-coral-500",
  mint: "from-mint-300 to-mint-500",
  gold: "from-gold-100 to-gold-500",
} as const;

export function Progress({ value, tone = "brand", className, size = "md" }: { value: number; tone?: keyof typeof BAR; className?: string; size?: "sm" | "md" }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgb(15_23_42/0.08)]", size === "sm" ? "h-2" : "h-3", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full bg-gradient-to-r shadow-[inset_0_-2px_0_rgb(0_0_0/0.08)]", BAR[tone])} style={{ width: `${v}%` }} />
    </div>
  );
}

// ───────────── Stat card ─────────────
const STAT_ICON = {
  brand: "bg-brand-100 text-brand-600",
  coral: "bg-coral-100 text-coral-600",
  mint: "bg-mint-100 text-mint-600",
  gold: "bg-gold-100 text-gold-700",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof STAT_ICON;
  children?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">{value}</p>
        </div>
        <span className={cn("clay-soft grid size-11 shrink-0 place-items-center rounded-2xl", STAT_ICON[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}

// ───────────── Page header ─────────────
export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ───────────── Empty state ─────────────
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="clay-soft mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="size-6" />
      </span>
      <p className="font-extrabold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ───────────── Table ─────────────
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}
export function Th({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", className)} {...props} />;
}
export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("border-b border-slate-100 px-4 py-3 align-middle text-slate-700 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", className)} {...props} />;
}

// ───────────── Avatar ─────────────
const AVATAR_COLORS = ["bg-brand-100 text-brand-700", "bg-coral-100 text-coral-700", "bg-mint-100 text-mint-700", "bg-gold-100 text-gold-700", "bg-sky-100 text-sky-700", "bg-violet-100 text-violet-700"];

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  const sz = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-14 text-lg" : "size-10 text-sm";
  return <span className={cn("clay-soft inline-grid shrink-0 place-items-center rounded-2xl font-extrabold", sz, AVATAR_COLORS[hash % AVATAR_COLORS.length], className)}>{initials(name)}</span>;
}

// ───────────── Tabs (berbasis link) ─────────────
export function LinkTabs({ tabs, active }: { tabs: { href: string; label: string; key: string; count?: number }[]; active: string }) {
  return (
    <div className="scrollbar-thin mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-white/70 p-1.5 ring-1 ring-slate-200">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold whitespace-nowrap transition",
            active === t.key ? "bg-brand-500 text-white shadow-[0_6px_14px_-6px_rgb(79_70_229/0.8)]" : "text-slate-600 hover:bg-slate-100",
          )}
        >
          {t.label}
          {t.count != null && t.count > 0 && (
            <span className={cn("rounded-full px-1.5 text-[11px]", active === t.key ? "bg-white/25" : "bg-coral-100 text-coral-700")}>{t.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("mb-3 text-lg font-semibold tracking-tight text-ink", className)}>{children}</h2>;
}

export function Ring({ value, size = 96, stroke = 10, color = "#6366f1", label }: { value: number; size?: number; stroke?: number; color?: string; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef2ff" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{label ?? <span className="text-lg font-black text-ink">{v}%</span>}</div>
    </div>
  );
}

// ───────────── Skeleton Loader ─────────────
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)} {...props} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <Skeleton className="mb-3 h-5 w-1/3" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </Card>
  );
}
