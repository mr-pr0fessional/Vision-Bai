import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface p-5 sm:p-6 ${className}`}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg tracking-wide uppercase">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
  prefix = "",
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string | number }[];
  label?: string | number;
  suffix?: string;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-display text-sm tracking-wider">{label}</p>
      {payload
        .filter((p) => p.value !== null && p.value !== undefined)
        .map((p, i) => (
          <p key={i} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.name}</span>
            <span className="ml-auto font-medium text-foreground">
              {prefix}
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
              {suffix}
            </span>
          </p>
        ))}
    </div>
  );
}

export const axisProps = {
  stroke: "var(--muted-foreground)",
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: "var(--muted-foreground)" },
} as const;
