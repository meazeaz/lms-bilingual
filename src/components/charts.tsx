"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

/** Urutan kategorikal tetap (lolos validator CVD): indigo, coral, mint, gold. */
export const SERIES_COLORS = ["#6366f1", "#f9714f", "#1fbf8c", "#e0a81a"];

const axisProps = {
  tick: { fill: "#64748b", fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

function ChartTooltip({ active, payload, label, suffix = "" }: Partial<TooltipContentProps<number, string>> & { suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label != null && <p className="mb-1 font-bold text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2 text-slate-600">
          <span className="size-2.5 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 font-bold text-ink">
            {typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}
            {suffix}
          </span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 240,
  yDomain,
  suffix = "",
  yTicks,
  yLabels,
}: {
  data: Record<string, string | number | null>[];
  xKey: string;
  series: { key: string; label: string }[];
  height?: number;
  yDomain?: [number, number];
  suffix?: string;
  yTicks?: number[];
  yLabels?: string[];
}) {
  return (
    <div>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.label, color: SERIES_COLORS[i] }))} />}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis domain={yDomain} ticks={yTicks} tickFormatter={yLabels ? (v: number) => yLabels[v] ?? "" : undefined} {...axisProps} width={44} />
          <Tooltip
            content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} suffix={suffix} />}
            cursor={{ stroke: "#c7d2fe", strokeWidth: 2 }}
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={SERIES_COLORS[i]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({
  data,
  xKey,
  series,
  height = 240,
  suffix = "",
  yDomain,
  colorByIndex,
}: {
  data: Record<string, string | number | null>[];
  xKey: string;
  series: { key: string; label: string }[];
  height?: number;
  suffix?: string;
  yDomain?: [number, number];
  colorByIndex?: string[];
}) {
  return (
    <div>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.label, color: SERIES_COLORS[i] }))} />}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} interval={0} />
          <YAxis domain={yDomain} {...axisProps} width={44} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} suffix={suffix} />} cursor={{ fill: "#eef2ff" }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={SERIES_COLORS[i]} radius={[6, 6, 0, 0]} maxBarSize={36}>
              {colorByIndex && data.map((_, j) => <Cell key={j} fill={colorByIndex[j % colorByIndex.length]} />)}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  height = 150,
  centerLabel,
  centerValue,
  className,
}: {
  data: { label: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className={cn("flex w-full flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="94%"
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={2}
              cornerRadius={5}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} suffix=" guru" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-ink">
              {centerValue ?? total}
            </p>
            {centerLabel && <p className="text-[11px] font-semibold text-slate-500">{centerLabel}</p>}
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2 text-xs sm:text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-slate-600" title={d.label}>
              {d.label}
            </span>
            <span className="shrink-0 font-bold text-ink tabular-nums">{d.value}</span>
            <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-slate-400 tabular-nums">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
